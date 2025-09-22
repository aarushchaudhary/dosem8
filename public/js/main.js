document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    // --- Page Protection & Navigation Loading ---
    if (!token && currentPage !== '/login.html' && currentPage !== '/register.html') {
        window.location.href = '/login.html';
        return;
    }
    
    if (token && (currentPage === '/login.html' || currentPage === '/register.html')) {
        window.location.href = '/dashboard.html';
        return;
    }

    if (currentPage !== '/login.html' && currentPage !== '/register.html') {
        loadNavigation();
    }

    // --- Page Router ---
    switch (currentPage) {
        case '/dashboard.html':
            fetchDashboardData();
            break;
        case '/regulations.html':
            setupAIForm();
            setupInteractionForm(); // <-- Add this line
            break;
        case '/advertisements.html':
            loadAdvertisements();
            setupAdForm();
            break;
        case '/consultations.html':
            loadConsultations();
            break;
        case '/login.html':
            document.getElementById('login-form').addEventListener('submit', handleLogin);
            break;
        case '/register.html':
            document.getElementById('register-form').addEventListener('submit', handleRegister);
            break;
    }

    // --- Helper Functions ---
    async function fetchWithAuth(url, options = {}) {
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
            console.error("Fetch Error:", error);
            return { success: false, message: 'Network error or server is down.' };
        }
    }

    async function loadNavigation() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder) {
            try {
                const response = await fetch('/partials/pharmacy_nav.html');
                navPlaceholder.innerHTML = await response.text();
                document.getElementById('logout-btn').addEventListener('click', handleLogout);
            } catch (error) {
                console.error("Could not load navigation:", error);
            }
        }
    }
    
    // --- Authentication Handlers ---
    async function handleRegister(e) {
        e.preventDefault();
        const registerForm = document.getElementById('register-form');
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert('Registration successful! Please log in.');
                window.location.href = '/login.html';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const loginForm = document.getElementById('login-form');
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                localStorage.setItem('token', result.token);
                window.location.href = '/dashboard.html';
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    }

    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }

    // --- Page Initializers & Handlers ---
    async function fetchDashboardData() {
        const dashboardContent = document.getElementById('dashboard-content');
        const result = await fetchWithAuth('/api/dashboard');
        
        if (result.success) {
            const { pharmacyName, email, createdAt } = result.data;
            dashboardContent.innerHTML = `
                <h3>Welcome, ${pharmacyName}!</h3>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Member Since:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
            `;
        } else {
            handleLogout();
        }
    }

    function setupAIForm() {
        const aiForm = document.getElementById('ai-form');
        aiForm.addEventListener('submit', handleAIQuery);
    }

    // --- NEW: Function to set up the interaction form ---
    function setupInteractionForm() {
        const interactionForm = document.getElementById('interaction-form');
        interactionForm.addEventListener('submit', handleInteractionQuery);
    }
    
    async function handleAIQuery(e) {
        e.preventDefault();
        const questionInput = document.getElementById('question');
        const question = questionInput.value;
        if (!question) return;

        appendMessage(question, 'user-message');
        questionInput.value = '';

        const result = await fetchWithAuth('/api/ai/ask', {
            method: 'POST',
            body: JSON.stringify({ question }),
        });
        
        if (result.success) {
            appendMessage(result.answer, 'ai-message');
        } else {
            appendMessage('Sorry, there was an error processing your request.', 'ai-message');
        }
    }

    // --- NEW: Function to handle the interaction query ---
    async function handleInteractionQuery(e) {
        e.preventDefault();
        const drugsInput = document.getElementById('drugs');
        const drugs = drugsInput.value;
        if (!drugs) return;

        appendMessage(`Checking interactions for: ${drugs}`, 'user-message');
        drugsInput.value = '';

        const result = await fetchWithAuth('/api/ai/check-interactions', {
            method: 'POST',
            body: JSON.stringify({ drugs }),
        });
        
        if (result.success) {
            appendMessage(result.answer, 'ai-message');
        } else {
            appendMessage('Sorry, there was an error checking for interactions.', 'ai-message');
        }
    }
    
    function appendMessage(text, className) {
        const chatDisplay = document.getElementById('chat-display');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${className}`;
        messageDiv.textContent = text;
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    async function loadAdvertisements() {
        const listEl = document.getElementById('campaign-list');
        const result = await fetchWithAuth('/api/advertisements');
        if (result.success && result.data.length > 0) {
            listEl.innerHTML = result.data.map(ad => `
                <div class="list-item">
                    <h4>${ad.campaignTitle}</h4>
                    <p>Status: <strong>${ad.status}</strong> | Clicks: ${ad.performance.clicks || 0}</p>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p>You have not created any campaigns yet.</p>';
        }
    }
    
    function setupAdForm() {
        document.getElementById('create-ad-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            alert('Ad creation and payment gateway integration would happen here!');
        });
    }

    async function loadConsultations() {
        const listEl = document.getElementById('consultation-list');
        const result = await fetchWithAuth('/api/consultations');
        if (result.success && result.data.length > 0) {
            listEl.innerHTML = result.data.map(con => `
                <div class="list-item">
                    <h4>New message from: ${con.patient.name}</h4>
                    <p>Question: "${con.initialQuestion}"</p>
                    <button class="btn-secondary">View & Reply</button>
                </div>
            `).join('');
        } else {
            listEl.innerHTML = '<p>You have no open consultations.</p>';
        }
    }
});