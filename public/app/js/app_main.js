document.addEventListener('DOMContentLoaded', () => {
    // --- App State & Configuration ---
    const content = document.getElementById('app-content');
    const token = localStorage.getItem('token');

    // --- Authentication Check ---
    // If no token exists, redirect to a login page.
    // NOTE: This should eventually point to a dedicated PATIENT login page.
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // --- Router ---
    const router = async () => {
        // Get the page hash from the URL (e.g., #home, #reminders)
        const path = window.location.hash || '#home';
        
        // Find the matching route
        const route = routes[path];

        if (route) {
            // Load the HTML partial and then execute the page-specific logic
            content.innerHTML = await fetch(route.template).then((res) => res.text());
            route.init(); // Run the JavaScript for that page
        } else {
            // Handle 404 - page not found
            content.innerHTML = '<h2>Page Not Found</h2>';
        }
    };

    // --- Page-Specific Logic (Controllers) ---
    const renderHomePage = async () => {
        // Fetch user profile for a smart greeting
        const userRes = await fetchWithAuth('/api/user/profile');
        if (userRes.success) {
            document.getElementById('greeting-name').textContent = userRes.data.name;
        }

        // Fetch medications for a dose summary
        const medRes = await fetchWithAuth('/api/medications');
        if (medRes.success) {
            const summaryEl = document.getElementById('dose-summary');
            if (medRes.data.length > 0) {
                 summaryEl.textContent = `You have ${medRes.data.length} medications scheduled for today.`;
            } else {
                summaryEl.textContent = 'You have no medications scheduled. Add one in the Reminders tab!';
            }
        }
    };

    const renderRemindersPage = async () => {
        const medList = document.getElementById('medication-list');
        const addMedForm = document.getElementById('add-med-form');
        
        // Fetch and display existing medications
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

        // Handle adding a new medication
        addMedForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(addMedForm);
            const data = {
                medicationName: formData.get('medicationName'),
                dosage: formData.get('dosage'),
                schedule: {
                    frequency: 'daily', // Simplified for this example
                    times: formData.get('times').split(',').map(t => t.trim())
                }
            };
            
            const result = await fetchWithAuth('/api/medications', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (result.success) {
                // Refresh the page to show the new medication
                router(); 
            } else {
                alert('Failed to add medication.');
            }
        });
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
    // Maps a URL hash to its HTML template and initialization script
    const routes = {
        '#home': { template: '/app/partials/home.html', init: renderHomePage },
        '#reminders': { template: '/app/partials/reminders.html', init: renderRemindersPage },
        '#tips': { template: '/app/partials/health_tips.html', init: renderHealthTipsPage },
        // Add routes for #consult, #pharmacy etc. here
    };

    // --- Helper Functions ---
    const fetchWithAuth = async (url, options = {}) => {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            }
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
        window.location.href = '/login.html';
    };

    // --- Initial Load ---
    // Listen for URL hash changes to navigate
    window.addEventListener('hashchange', router);
    // Initial page load
    router();
});