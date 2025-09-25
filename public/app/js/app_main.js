document.addEventListener('DOMContentLoaded', () => {
    // --- App State & Configuration ---
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    // --- Page Initializer ---
    const initializePage = async () => {
        const publicPages = ['/patient-login.html', '/patient-register.html'];
        if (!token && !publicPages.includes(currentPage)) {
            window.location.href = '/patient-login.html';
            return;
        }

        switch (currentPage) {
            case '/patient-login.html':
                document.getElementById('patient-login-form').addEventListener('submit', handlePatientLogin);
                break;
            case '/patient-register.html':
                document.getElementById('patient-register-form').addEventListener('submit', handlePatientRegister);
                break;
            case '/app/index.html':
                initializeApp();
                break;
        }
    };

    // --- Patient Authentication Handlers ---
    async function handlePatientRegister(e) {
        e.preventDefault();
        const registerForm = document.getElementById('patient-register-form');
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/patient/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert('Registration successful! Please log in.');
                window.location.href = '/patient-login.html';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    }

    async function handlePatientLogin(e) {
        e.preventDefault();
        const loginForm = document.getElementById('patient-login-form');
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/patient/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                window.location.href = '/app/index.html';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    }

    // --- Main App Logic ---
    let isPremiumUser = false;

    const initializeApp = async () => {
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success && userRes.data.subscription.plan === 'premium') {
            isPremiumUser = true;
        }
        router();
        window.addEventListener('hashchange', router);
        attachLogoutHandler();
        attachMarkAsTakenHandler(); // Add global event handler
    };

    // Global event handler for "Mark as Taken" buttons using event delegation
    const attachMarkAsTakenHandler = () => {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-mark-taken')) {
                e.preventDefault();
                
                const button = e.target;
                const medId = button.dataset.id;
                
                // Prevent double-clicks
                if (button.disabled) {
                    return;
                }
                
                try {
                    // Disable button and show loading state
                    button.disabled = true;
                    const originalText = button.textContent;
                    button.textContent = 'Marking...';
                    
                    const result = await fetchWithAuth(`/api/medications/${medId}/taken`, { 
                        method: 'POST' 
                    });
                    
                    if (result.success) {
                        // Show success feedback
                        button.textContent = 'Marked!';
                        button.style.backgroundColor = '#4CAF50';
                        
                        // Refresh the dashboard after a brief delay
                        setTimeout(() => {
                            renderHomePage();
                        }, 800); // Slightly longer delay for better UX
                    } else {
                        // Handle API error
                        alert('Failed to mark medication as taken: ' + (result.message || 'Unknown error'));
                        
                        // Restore button state
                        button.disabled = false;
                        button.textContent = originalText;
                    }
                } catch (error) {
                    console.error('Error marking medication as taken:', error);
                    alert('An error occurred while marking medication as taken. Please try again.');
                    
                    // Restore button state
                    button.disabled = false;
                    button.textContent = originalText;
                }
            }
        });
    };

    const router = async () => {
        const path = window.location.hash.split('?')[0] || '#home';
        const route = routes[path];
        if (route) {
            if (route.premium && !isPremiumUser) {
                alert("This feature is for premium members only.");
                window.location.hash = '#home';
                return;
            }
            const content = document.getElementById('app-content');
            content.innerHTML = await fetch(route.template).then((res) => res.text());
            route.init();
        }
    };

    // --- Page-Specific Logic ---
    const renderHomePage = async () => {
        // --- 1. Greet the User ---
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success) {
            const greetingEl = document.getElementById('greeting-name');
            
            // Get current date and time
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            });
            const date = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            console.log('Patient dashboard data loaded:', { user: userRes.data, time, date });
            
            // Enhanced greeting with user info, date and time
            greetingEl.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h3>Welcome, ${userRes.data.name}!</h3>
                    ${isPremiumUser ? '<span class="premium-badge">★ Premium</span>' : ''}
                </div>
                <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 0.9em;">
                    <p><strong>📅 Today's Date:</strong> ${date}</p>
                    <p><strong>🕐 Current Time:</strong> ${time}</p>
                    <p><strong>👤 Member Since:</strong> ${new Date(userRes.data.createdAt).toLocaleDateString()}</p>
                </div>
            `;
        }

        // --- Render Nearby Pharmacies Map & List ---
        const listEl = document.getElementById('nearby-pharmacy-list');
        const mapContainer = document.getElementById('map-container');
        
        // 1. Ask for user's location
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude } = position.coords;

            // 2. Fetch pharmacies using the location
            const nearbyResult = await fetchWithAuth(`/api/pharmacies/nearby?lat=${latitude}&lon=${longitude}`);

            if (nearbyResult.success && nearbyResult.data.places && nearbyResult.data.places.length > 0) {
                const firstPharmacy = nearbyResult.data.places[0];
                
                if (firstPharmacy.map_url) {
                    const mapUrl = firstPharmacy.map_url.replace('YOUR_API_KEY', '');
                    mapContainer.innerHTML = `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen src="${mapUrl}"></iframe>`;
                } else {
                    mapContainer.innerHTML = '<p>Map not available.</p>';
                }

                listEl.innerHTML = nearbyResult.data.places.map(pharmacy => `
                    <div class="summary-card">
                        <h4>${escapeHtml(pharmacy.name)}</h4>
                        <p>${escapeHtml(pharmacy.address)}</p>
                        <p><strong>Distance:</strong> ${pharmacy.distance}</p>
                    </div>
                `).join('');

            } else {
                mapContainer.innerHTML = '<p>No pharmacies found nearby.</p>';
                listEl.innerHTML = '<p>We couldn\'t find any pharmacies in your immediate area.</p>';
            }

        } catch (error) {
            // Handle case where user denies location permission or an error occurs
            console.error("Location Error:", error);
            mapContainer.innerHTML = '<p class="location-prompt">Please enable location access to find nearby pharmacies.</p>';
            listEl.innerHTML = ''; // Clear the list
        }

        // --- 2. Render Medicine Reminders ---
        const remindersContainer = document.getElementById('dashboard-reminders');
        const medRes = await fetchWithAuth('/api/medications');
        if (medRes.success && medRes.data.length > 0) {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1); // Next day start
            
            const upcomingDoses = medRes.data.flatMap(med => {
                return med.schedule.times
                    .map((time, index) => ({ 
                        ...med, 
                        doseTime: time,
                        doseIndex: index,
                        uniqueId: `${med._id}_${index}` // Create unique ID for each dose
                    }))
                    .filter(dose => {
                        // Count how many times this medication was taken today
                        const todayTakenCount = dose.takenTimestamps.filter(ts => {
                            const takenDate = new Date(ts);
                            return takenDate >= todayStart && takenDate < todayEnd;
                        }).length;
                        
                        // Show this dose if we haven't reached the total daily doses yet
                        // and this dose index is greater than or equal to doses already taken
                        return dose.doseIndex >= todayTakenCount;
                    });
            });

            if (upcomingDoses.length > 0) {
                remindersContainer.innerHTML = upcomingDoses.map(dose => `
                    <div class="summary-card">
                        <p><strong>${dose.medicationName}</strong> (${dose.dosage}) at ${dose.doseTime}</p>
                        <button class="btn-mark-taken" data-id="${dose._id}" data-dose-index="${dose.doseIndex}">Mark as Taken</button>
                    </div>
                `).join('');
            } else {
                remindersContainer.innerHTML = '<p>No more doses for today!</p>';
            }

        } else {
            remindersContainer.innerHTML = '<p>You have no medications scheduled.</p>';
        }

        // --- 3. Render Notifications ---
        const notificationsContainer = document.getElementById('dashboard-notifications');
        // This requires a new patient-specific notification endpoint, which we've planned for
        // For now, we'll assume an endpoint /api/patient/notifications exists
        const notifRes = { success: false, data: [] }; // Placeholder for actual API call
        if (notifRes.success && notifRes.data.length > 0) {
            notificationsContainer.innerHTML = notifRes.data.map(n => `
                <div class="summary-card">
                    <a href="${n.link}">${n.message}</a>
                </div>
            `).join('');
        } else {
            notificationsContainer.innerHTML = '<p>No new notifications.</p>';
        }

        // --- 4. Render New Health Tips ---
        const tipsContainer = document.getElementById('dashboard-health-tips');
        const tipsRes = await fetchWithAuth('/api/health-tips?new=true');
        if (tipsRes.success && tipsRes.data.length > 0) {
            tipsContainer.innerHTML = tipsRes.data.map(tip => `
                <div class="tip-card">
                    <p class="tip-author">From: ${tip.pharmacy.pharmacyName}</p>
                    <h3>${tip.title}</h3>
                    <p>${tip.content}</p>
                </div>
            `).join('');
        } else {
            tipsContainer.innerHTML = '<p>No new health tips in the last 24 hours.</p>';
        }

        // --- 5. Render Advertisements ---
        const adsContainer = document.getElementById('dashboard-advertisements');
        const adsRes = await fetchWithAuth('/api/advertisements/active');
        if (adsRes.success && adsRes.data.length > 0) {
            adsContainer.innerHTML = adsRes.data.map(ad => `
                <div class="summary-card">
                    <p class="tip-author">${ad.pharmacy.pharmacyName}</p>
                    <h4>${ad.campaignTitle}</h4>
                    <p>${ad.content}</p>
                </div>
            `).join('');
        } else {
            adsContainer.innerHTML = '<p>No special offers right now.</p>';
        }

        const reportsSection = document.getElementById('reports-section');
        if (isPremiumUser) {
            reportsSection.style.display = 'block';
        } else {
            reportsSection.innerHTML = `
                <div class="upgrade-prompt">
                    <h4>Want Personalized Health Reports?</h4>
                    <p>Upgrade to Premium to unlock monthly adherence reports and health insights.</p>
                    <button class="btn-upgrade">Go Premium</button>
                </div>
            `;
        }
    };

    const renderRemindersPage = async () => {
        const medList = document.getElementById('medication-list');
        const addMedForm = document.getElementById('add-med-form');

        const medRes = await fetchWithAuth('/api/medications');
        if (medRes.success && medRes.data.length > 0) {
            medList.innerHTML = medRes.data.map(med => `
                <div class="med-card">
                    <div class="med-info">
                        <h4>${med.medicationName}</h4>
                        <p>Dosage: ${med.dosage || 'N/A'}</p>
                        <p>Schedule: ${med.schedule.times.join(', ')}</p>
                        <p>Start Date: ${new Date(med.schedule.date).toLocaleDateString()}</p>
                    </div>
                    <div class="med-actions">
                        <button class="btn-delete-med" data-id="${med._id}" data-name="${med.medicationName}">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            medList.innerHTML = '<p>No medications added yet.</p>';
        }

        addMedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addMedForm);
            
            // Validate required fields
            const medicationName = formData.get('medicationName');
            const dateValue = formData.get('date');
            const timesValue = formData.get('times');
            
            if (!medicationName || !dateValue || !timesValue) {
                alert('Please fill in all required fields (Medication Name, Date, and Times)');
                return;
            }
            
            const data = {
                medicationName: medicationName,
                dosage: formData.get('dosage') || '',
                schedule: {
                    date: new Date(dateValue).toISOString(), // Convert to proper ISO date string
                    frequency: 'daily',
                    times: timesValue.split(',').map(t => t.trim()).filter(t => t) // Remove empty entries
                }
            };
            
            console.log('Submitting medication data:', data);

            const result = await fetchWithAuth('/api/medications', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) { 
                alert('Medication added successfully!');
                addMedForm.reset(); // Clear the form
                router(); 
            } else { 
                console.error('Error adding medication:', result);
                alert('Failed to add medication: ' + (result.message || 'Please check all fields and try again.')); 
            }
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.btn-delete-med').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const button = e.target;
                const medId = button.dataset.id;
                const medName = button.dataset.name;
                
                // Confirm deletion
                const confirmed = confirm(`Are you sure you want to delete "${medName}"? This action cannot be undone.`);
                if (!confirmed) {
                    return;
                }
                
                // Prevent double-clicks
                if (button.disabled) {
                    return;
                }
                
                try {
                    // Disable button and show loading state
                    button.disabled = true;
                    const originalText = button.textContent;
                    button.textContent = 'Deleting...';
                    
                    const result = await fetchWithAuth(`/api/medications/${medId}`, {
                        method: 'DELETE'
                    });
                    
                    if (result.success) {
                        alert('Medication deleted successfully!');
                        router(); // Refresh the page to show updated list
                    } else {
                        console.error('Error deleting medication:', result);
                        alert('Failed to delete medication: ' + (result.message || 'Please try again.'));
                        
                        // Restore button state on error
                        button.disabled = false;
                        button.textContent = originalText;
                    }
                } catch (error) {
                    console.error('Error deleting medication:', error);
                    alert('An error occurred while deleting the medication. Please try again.');
                    
                    // Restore button state on error
                    button.disabled = false;
                    button.textContent = originalText;
                }
            });
        });
    };

    const renderConsultPage = async () => {
        const pharmacySelect = document.getElementById('pharmacy-select');
        const pharmacyRes = await fetchWithAuth('/api/pharmacies');
        if (pharmacyRes.success) {
            pharmacySelect.innerHTML += pharmacyRes.data.map(p => `<option value="${p._id}">${p.pharmacyName}</option>`).join('');
        }

        const newConsultForm = document.getElementById('new-consult-form');
        newConsultForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(newConsultForm);
            const data = Object.fromEntries(formData.entries());

            const result = await fetchWithAuth('/api/consultations/patient', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) {
                window.location.hash = `#chat?id=${result.data._id}`;
            } else {
                alert('Error starting consultation: ' + result.message);
            }
        });

        const consultationList = document.getElementById('consultation-list');
        const consultRes = await fetchWithAuth('/api/consultations/patient');
        if (consultRes.success && consultRes.data.length > 0) {
            consultationList.innerHTML = consultRes.data.map(con => `
                <div class="list-item-app" data-id="${con._id}">
                    <h4>Chat with ${con.pharmacy.pharmacyName}</h4>
                    <p><em>"${con.initialQuestion}"</em></p>
                </div>
            `).join('');

            document.querySelectorAll('.list-item-app').forEach(item => {
                item.addEventListener('click', () => {
                    window.location.hash = `#chat?id=${item.dataset.id}`;
                });
            });
        } else {
            consultationList.innerHTML = '<p>You have no active conversations.</p>';
        }
    };

    const renderChatPage = async () => {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        const consultationId = urlParams.get('id');

        if (!consultationId) {
            window.location.hash = '#consult';
            return;
        }

        const chatMessages = document.getElementById('chat-messages');
        const chatWithName = document.getElementById('chat-with-name');
        const replyForm = document.getElementById('chat-reply-form');
        
        const loadMessages = async () => {
            const res = await fetchWithAuth(`/api/consultations/${consultationId}`);
            if (res.success) {
                const consult = res.data;
                chatWithName.textContent = `Chat with ${consult.pharmacy.pharmacyName}`;
                chatMessages.innerHTML = consult.messages.map(msg => `
                    <div class="chat-message-app ${msg.sender === 'patient' ? 'user-message-app' : 'other-message-app'}">
                        ${escapeHtml(msg.text)}
                    </div>
                `).join('');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                chatMessages.innerHTML = '<p>Could not load chat.</p>';
            }
        };

        await loadMessages();

        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const replyText = document.getElementById('reply-text');
            const text = replyText.value.trim();
            if (!text) {
                alert('Please enter a message before sending.');
                return;
            }

            // Show loading state
            const sendButton = e.target.querySelector('button[type="submit"]');
            const originalButtonText = sendButton.textContent;
            sendButton.textContent = 'Sending...';
            sendButton.disabled = true;

            const result = await fetchWithAuth(`/api/consultations/${consultationId}/reply`, {
                method: 'POST',
                body: JSON.stringify({ text })
            });

            // Reset button state
            sendButton.textContent = originalButtonText;
            sendButton.disabled = false;

            if (result.success) {
                replyText.value = '';
                
                // Add the message immediately to the chat without reloading
                const newMessageDiv = document.createElement('div');
                newMessageDiv.className = 'chat-message-app user-message-app';
                newMessageDiv.innerHTML = escapeHtml(text);
                chatMessages.appendChild(newMessageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } else {
                const errorMessage = result.message || 'Failed to send message. Please try again.';
                alert(`Error: ${errorMessage}`);
            }
        });

        document.getElementById('back-to-consult-list').addEventListener('click', () => {
            window.location.hash = '#consult';
        });
    };

    const renderAskAIPage = () => {
        const interactionForm = document.getElementById('interaction-form');
        interactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const drugsInput = document.getElementById('drugs');
            const drugs = drugsInput.value;
            if (!drugs) return;

            const responseEl = document.getElementById('ai-response');
            const button = e.target.querySelector('button');
            const originalButtonText = button.textContent;
            
            // Show loading state
            button.disabled = true;
            button.textContent = 'Checking...';
            responseEl.style.display = 'block';
            responseEl.innerHTML = '<p>Getting response from AI...</p>';

            const result = await fetchWithAuth('/api/ai/check-interactions', {
                method: 'POST',
                body: JSON.stringify({ drugs }),
            });

            if (result.success) {
                // --- MODIFIED PART ---
                // 1. Create a new showdown converter
                const converter = new showdown.Converter();
                // 2. Convert the Markdown response to HTML
                const html = converter.makeHtml(result.answer);
                // 3. Set the innerHTML of the response element
                responseEl.innerHTML = html;
            } else {
                responseEl.innerHTML = `<p>Error: ${result.message}</p>`;
            }
            
            // Restore button state
            button.disabled = false;
            button.textContent = originalButtonText;
        });
    };

    const renderHealthReportsPage = async () => {
        const form = document.getElementById('health-report-form');
        const pharmacySelect = document.getElementById('report-pharmacy-select');
        const submittedList = document.getElementById('submitted-reports-list');

        // 1. Populate pharmacy dropdown
        const pharmacyRes = await fetchWithAuth('/api/pharmacies');
        if (pharmacyRes.success) {
            pharmacySelect.innerHTML += pharmacyRes.data.map(p => `<option value="${p._id}">${p.pharmacyName}</option>`).join('');
        }

        // 2. Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            const result = await fetchWithAuth('/api/reports', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            if (result.success) {
                alert('Your health report has been submitted successfully!');
                form.reset();
                renderHealthReportsPage(); // Refresh the list
            } else {
                alert('Error: ' + result.message);
            }
        });

        // 3. Display submission history
        const reportsRes = await fetchWithAuth('/api/reports');
        if (reportsRes.success && reportsRes.data.length > 0) {
            submittedList.innerHTML = reportsRes.data.map(report => `
                <div class="summary-card">
                    <h4>Report to ${report.pharmacy.pharmacyName}</h4>
                    <p><strong>Status:</strong> ${report.status}</p>
                    <p><strong>Submitted:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
                    ${report.status === 'Completed' ? `<div class="pharmacist-reply"><p><strong>Pharmacist's Report:</strong></p><p>${escapeHtml(report.pharmacistReport)}</p></div>` : ''}
                </div>
            `).join('');
        } else {
            submittedList.innerHTML = '<p>You have not submitted any reports yet.</p>';
        }
    };

    const renderHealthTipsPage = async () => {
        const tipsContainer = document.getElementById('tips-container');
        const tipsRes = await fetchWithAuth('/api/health-tips');
        
        if (tipsRes.success && tipsRes.data.length > 0) {
            tipsContainer.innerHTML = tipsRes.data
                .map(tip => {
                    // Defensive check: Ensure pharmacy exists and has a name
                    const pharmacyName = tip.pharmacy ? tip.pharmacy.pharmacyName : 'An anonymous pharmacy';
                    
                    return `
                        <div class="tip-card">
                            <p class="tip-author">From: ${pharmacyName}</p>
                            <h3>${tip.title}</h3>
                            <p>${tip.content}</p>
                        </div>
                    `;
                })
                .join('');
        } else {
            tipsContainer.innerHTML = '<p>No health tips are available at the moment. Please check back later!</p>';
        }
    };

    const renderProfilePage = async () => {
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success) {
            const user = userRes.data;
            
            // Fill profile form with existing data
            const form = document.getElementById('profile-update-form');
            form.name.value = user.name;
            form.email.value = user.email;
            
            // Fill profile info if available
            if (user.profileInfo) {
                if (user.profileInfo.dateOfBirth) {
                    form.dateOfBirth.value = user.profileInfo.dateOfBirth.split('T')[0]; // Format date for input
                }
                if (user.profileInfo.height) form.height.value = user.profileInfo.height;
                if (user.profileInfo.weight) form.weight.value = user.profileInfo.weight;
                if (user.profileInfo.bloodGroup) form.bloodGroup.value = user.profileInfo.bloodGroup;
                if (user.profileInfo.medicalHistory) form.medicalHistory.value = user.profileInfo.medicalHistory;
            }
        }

        // Handle profile form submission
        const profileForm = document.getElementById('profile-update-form');
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const data = Object.fromEntries(formData.entries());

            const result = await fetchWithAuth('/api/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data)
            });

            if (result.success) {
                alert('Profile updated successfully!');
                renderProfilePage(); // Refresh the page
            } else {
                alert('Error updating profile: ' + result.message);
            }
        });

        // Handle logout button
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    };

    // --- Routes Definition ---
    const routes = {
        '#home': { template: '/app/partials/home.html', init: renderHomePage },
        '#reminders': { template: '/app/partials/reminders.html', init: renderRemindersPage },
        '#consult': { template: '/app/partials/consult.html', init: renderConsultPage },
        '#chat': { template: '/app/partials/chat_view.html', init: renderChatPage },
        '#tips': { template: '/app/partials/health_tips.html', init: renderHealthTipsPage },
        '#ask_ai': { template: '/app/partials/ask_ai.html', init: renderAskAIPage },
        '#reports': { template: '/app/partials/reports.html', init: renderHealthReportsPage, premium: true },
        '#profile': { template: '/app/partials/profile.html', init: renderProfilePage }
    };

    // --- Helper Functions ---
    const escapeHtml = (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    };

    const fetchWithAuth = async (url, options = {}) => {
        if (!token) {
            handleLogout();
            return { success: false, message: 'No authentication token found. Please log in again.' };
        }

        const defaultOptions = {
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
        };
        const mergedOptions = { ...defaultOptions, ...options };
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };

        try {
            let response = await fetch(url, mergedOptions);
            
            if (response.status === 401) {
                // --- NEW: Token Refresh Logic ---
                const refreshResult = await fetch('/api/patient/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const newAuthData = await refreshResult.json();

                if (newAuthData.success) {
                    localStorage.setItem('token', newAuthData.token);
                    // Update the headers and retry the original request
                    mergedOptions.headers['x-auth-token'] = newAuthData.token;
                    response = await fetch(url, mergedOptions);
                } else {
                    handleLogout();
                    return { success: false, message: 'Session expired. Please log in again.' };
                }
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            return { success: false, message: 'Network error or server is down.' };
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/patient-login.html';
    };

    const attachLogoutHandler = () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleLogout();
            });
        }
    };

    // --- Start the logic for the current page ---
    initializePage();
});