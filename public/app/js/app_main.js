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
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success) {
            const greetingEl = document.getElementById('greeting-name');
            greetingEl.textContent = userRes.data.name;
            if (isPremiumUser) {
                greetingEl.innerHTML += ' <span class="premium-badge">★ Premium</span>';
            }
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
                    <h4>${med.medicationName}</h4>
                    <p>Dosage: ${med.dosage || 'N/A'}</p>
                    <p>Schedule: ${med.schedule.times.join(', ')}</p>
                </div>
            `).join('');
        } else {
            medList.innerHTML = '<p>No medications added yet.</p>';
        }

        addMedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addMedForm);
            const data = {
                medicationName: formData.get('medicationName'),
                dosage: formData.get('dosage'),
                schedule: {
                    frequency: 'daily',
                    times: formData.get('times').split(',').map(t => t.trim())
                }
            };

            const result = await fetchWithAuth('/api/medications', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) { router(); }
            else { alert('Failed to add medication.'); }
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