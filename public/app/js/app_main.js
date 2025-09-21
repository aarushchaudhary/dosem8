document.addEventListener('DOMContentLoaded', () => {
    // --- App State & Configuration ---
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    // --- Page Initializer ---
    // This is the main entry point. It decides what to do based on the current page.
    const initializePage = async () => {
        // Define which pages are public (don't require a login token)
        const publicPages = ['/patient-login.html', '/patient-register.html'];

        // If we are on a protected page and there's no token, redirect to the login page.
        if (!token && !publicPages.includes(currentPage)) {
            window.location.href = '/patient-login.html';
            return;
        }

        // Use a router to handle different pages
        switch (currentPage) {
            case '/patient-login.html':
                document.getElementById('patient-login-form').addEventListener('submit', handlePatientLogin);
                break;
            case '/patient-register.html':
                document.getElementById('patient-register-form').addEventListener('submit', handlePatientRegister);
                break;
            case '/app/index.html':
                // This is the main Single-Page Application
                initializeApp();
                break;
        }
    };


    // --- Patient Authentication Handlers (for patient-login.html and patient-register.html) ---
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
                window.location.href = '/app/index.html'; // Redirect to the main app
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    }


    // --- Main App Logic (for when the user is inside /app/index.html) ---
    let isPremiumUser = false;

    const initializeApp = async () => {
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success && userRes.data.subscription.plan === 'premium') {
            isPremiumUser = true;
        }
        router();
        window.addEventListener('hashchange', router);
    };

    const router = async () => {
        const path = window.location.hash || '#home';
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
        const consultForm = document.getElementById('consult-form');
        const consultTitle = document.getElementById('consult-title');
        
        if(isPremiumUser) {
            consultTitle.textContent = "Ask AI Enhanced";
        }

        consultForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const questionInput = document.getElementById('question');
            const question = questionInput.value;
            if (!question) return;

            const endpoint = isPremiumUser ? '/api/ai/ask-enhanced' : '/api/ai/ask';
            
            const result = await fetchWithAuth(endpoint, {
                method: 'POST',
                body: JSON.stringify({ question })
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
                    <h3>${tip.title}</h3>
                    <p>${tip.content.substring(0, 100)}...</p>
                </div>
            `).join('');
        }
    };

    // --- Routes Definition ---
    const routes = {
        '#home': { template: '/app/partials/home.html', init: renderHomePage },
        '#reminders': { template: '/app/partials/reminders.html', init: renderRemindersPage },
        '#consult': { template: '/app/partials/consult.html', init: renderConsultPage },
        '#tips': { template: '/app/partials/health_tips.html', init: renderHealthTipsPage },
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

    // --- Start the logic for the current page ---
    initializePage();
});