document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname;

    // --- Page Protection ---
    // If user is not on a public page and doesn't have a token, redirect to login
    if (!token && currentPage !== '/login.html' && currentPage !== '/register.html') {
        window.location.href = '/login.html';
        return;
    }
    
    // If user is on a public page but has a token, redirect to dashboard
    if (token && (currentPage === '/login.html' || currentPage === '/register.html')) {
        window.location.href = '/dashboard.html';
        return;
    }


    // --- Element Handlers ---
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardContent = document.getElementById('dashboard-content');
    const aiForm = document.getElementById('ai-form');

    // --- Event Listeners ---
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (dashboardContent) {
        fetchDashboardData();
    }
    if (aiForm) {
        aiForm.addEventListener('submit', handleAIQuery);
    }

    // --- Handler Functions ---
    async function handleRegister(e) {
        e.preventDefault();
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

    function handleLogout() {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }

    async function fetchDashboardData() {
        try {
            const response = await fetch('/api/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
            });
            const result = await response.json();
            if (result.success) {
                const { pharmacyName, email, createdAt } = result.data;
                dashboardContent.innerHTML = `
                    <h3>Welcome, ${pharmacyName}!</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Member Since:</strong> ${new Date(createdAt).toLocaleDateString()}</p>
                `;
            } else {
                // If token is invalid/expired, log out user
                handleLogout();
            }
        } catch (error) {
            dashboardContent.innerHTML = '<p>Could not load data.</p>';
        }
    }

    async function handleAIQuery(e) {
        e.preventDefault();
        const questionInput = document.getElementById('question');
        const question = questionInput.value;
        const chatDisplay = document.getElementById('chat-display');

        if (!question) return;

        // Display user's question
        appendMessage(question, 'user-message');
        questionInput.value = '';

        try {
            const response = await fetch('/api/ai/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ question }),
            });

            const result = await response.json();
            
            if (result.success) {
                appendMessage(result.answer, 'ai-message');
            } else {
                appendMessage('Sorry, there was an error.', 'ai-message');
            }
        } catch (error) {
            appendMessage('Could not connect to the AI service.', 'ai-message');
        }
    }
    
    function appendMessage(text, className) {
        const chatDisplay = document.getElementById('chat-display');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${className}`;
        messageDiv.textContent = text;
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto-scroll to bottom
    }
});