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
            greetingEl.textContent = userRes.data.name;
            if (isPremiumUser) {
                greetingEl.innerHTML += ' <span class="premium-badge">★ Premium</span>';
            }
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
                        ${msg.text}
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
            const text = replyText.value;
            if (!text) return;

            const result = await fetchWithAuth(`/api/consultations/${consultationId}/reply`, {
                method: 'POST',
                body: JSON.stringify({ text })
            });

            if (result.success) {
                replyText.value = '';
                await loadMessages();
            } else {
                alert('Failed to send message.');
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

            const result = await fetchWithAuth('/api/ai/check-interactions', {
                method: 'POST',
                body: JSON.stringify({ drugs }),
            });

            const responseEl = document.getElementById('ai-response');
            if (result.success) {
                responseEl.innerHTML = `<p>${result.answer}</p>`;
            } else {
                responseEl.innerHTML = `<p>Error: ${result.message}</p>`;
            }
        });
    };

    const renderHealthReportsPage = async () => {
        const reportContent = document.getElementById('report-content');
        const result = await fetchWithAuth('/api/reports');
        if (result.success) {
            const { month, adherenceScore, healthInsights } = result.data;
            reportContent.innerHTML = `
                <h3>Report for ${month}</h3>
                <div class="report-metric">
                    <strong>Adherence Score:</strong> ${adherenceScore}%
                </div>
                <div class="report-insight">
                    <strong>Insights:</strong> ${healthInsights}
                </div>
            `;
        } else {
            reportContent.innerHTML = `<p>Could not generate your report. Please try again later.</p>`;
        }
    };

    const renderHealthTipsPage = async () => {
        const tipsContainer = document.getElementById('tips-container');
        const tipsRes = await fetchWithAuth('/api/health-tips');
        if (tipsRes.success) {
            tipsContainer.innerHTML = tipsRes.data.map(tip => `
                <div class="tip-card">
                    <p class="tip-author">From: ${tip.pharmacy.pharmacyName}</p>
                    <h3>${tip.title}</h3>
                    <p>${tip.content}</p>
                </div>
            `).join('');
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
        '#reports': { template: '/app/partials/reports.html', init: renderHealthReportsPage, premium: true }
    };

    // --- Helper Functions ---
    const fetchWithAuth = async (url, options = {}) => {
        const defaultOptions = {
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
        };
        const mergedOptions = { ...defaultOptions, ...options };
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };

        try {
            const response = await fetch(url, mergedOptions);
            return await response.json();
        } catch (error) {
            console.error('API Fetch Error:', error);
            return { success: false, message: 'Fetch error' };
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