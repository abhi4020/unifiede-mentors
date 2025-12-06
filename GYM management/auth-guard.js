// Auth Guard & Modal Manager for index.html

// Check if user is logged in
function isUserLoggedIn() {
    try {
        const r = localStorage.getItem('fz_user');
        return r ? JSON.parse(r) : null;
    } catch (e) {
        return null;
    }
}

// Get current user
function getCurrentUser() {
    return isUserLoggedIn();
}

// Logout user
function logoutUser() {
    localStorage.removeItem('fz_user');
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    location.reload();
}

// Show auth modal (login or register)
function showAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    const body = document.getElementById('authModalBody');

    if (tab === 'login') {
        body.innerHTML = `
            <div class="auth-modal-header">
                <h2>Sign in to FitZone</h2>
                <p>Access bookings, classes, and track your fitness</p>
            </div>
            <div id="loginMessage"></div>
            <form id="modalLoginForm">
                <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" placeholder="your@email.com" required />
                </div>
                <div class="form-group">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter password" required />
                </div>
                <button type="submit" class="auth-submit">Sign in</button>
            </form>
            <p style="text-align:center;margin-top:15px;font-size:14px;color:#666;">
                Don't have an account? <a href="#" onclick="showAuthModal('register'); return false;" style="color:#ff6b35;font-weight:600;">Create one</a>
            </p>
        `;

        modal.classList.add('active');

        document.getElementById('modalLoginForm').addEventListener('submit', handleModalLogin);
    } else {
        body.innerHTML = `
            <div class="auth-modal-header">
                <h2>Join FitZone</h2>
                <p>Create account to manage bookings and track fitness</p>
            </div>
            <div id="registerMessage"></div>
            <form id="modalRegisterForm">
                <div class="form-group">
                    <label for="regName">Full Name</label>
                    <input type="text" id="regName" placeholder="John Doe" required />
                </div>
                <div class="form-group">
                    <label for="regEmail">Email</label>
                    <input type="email" id="regEmail" placeholder="your@email.com" required />
                </div>
                <div class="form-group">
                    <label for="regPhone">Phone</label>
                    <input type="tel" id="regPhone" placeholder="+1 (555) 123-4567" required />
                </div>
                <div class="form-group">
                    <label for="regPassword">Password</label>
                    <input type="password" id="regPassword" placeholder="At least 6 characters" required minlength="6" />
                </div>
                <div class="form-group">
                    <label for="regPasswordConfirm">Confirm Password</label>
                    <input type="password" id="regPasswordConfirm" placeholder="Re-enter password" required minlength="6" />
                </div>
                <button type="submit" class="auth-submit">Create account</button>
            </form>
            <p style="text-align:center;margin-top:15px;font-size:14px;color:#666;">
                Already have an account? <a href="#" onclick="showAuthModal('login'); return false;" style="color:#ff6b35;font-weight:600;">Sign in</a>
            </p>
        `;

        modal.classList.add('active');

        document.getElementById('modalRegisterForm').addEventListener('submit', handleModalRegister);
    }
}

// Close auth modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    document.getElementById('authModalBody').innerHTML = '';
}

// Handle modal login
async function handleModalLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const msgEl = document.getElementById('loginMessage');

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('fz_user', JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email }));
            msgEl.innerHTML = '<div class="auth-message success">Login successful!</div>';
            setTimeout(() => {
                closeAuthModal();
                location.reload();
            }, 500);
        } else {
            msgEl.innerHTML = `<div class="auth-message error">${data.error || 'Login failed'}</div>`;
        }
    } catch (err) {
        msgEl.innerHTML = `<div class="auth-message error">Network error: ${err.message}</div>`;
    }
}

// Handle modal register
async function handleModalRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    const msgEl = document.getElementById('registerMessage');

    if (password !== passwordConfirm) {
        msgEl.innerHTML = '<div class="auth-message error">Passwords do not match</div>';
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        const data = await res.json();
        if (data.success) {
            msgEl.innerHTML = '<div class="auth-message success">Registration successful! Signing you in...</div>';
            // Auto-login after register
            setTimeout(() => handleAutoLogin(email, password), 800);
        } else {
            msgEl.innerHTML = `<div class="auth-message error">${data.error || 'Registration failed'}</div>`;
        }
    } catch (err) {
        msgEl.innerHTML = `<div class="auth-message error">Network error: ${err.message}</div>`;
    }
}

// Auto-login after registration
async function handleAutoLogin(email, password) {
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('fz_user', JSON.stringify({ id: data.user.id, name: data.user.name, email: data.user.email }));
            closeAuthModal();
            location.reload();
        }
    } catch (e) {
        console.error('Auto-login failed:', e);
    }
}

// Check auth for feature access
function requireAuth(callback) {
    const user = getCurrentUser();
    if (user) {
        if (callback && typeof callback === 'function') callback();
    } else {
        showAuthModal('login');
    }
}

// Add auth UI to navbar if not logged in
function initAuthUI() {
    const user = getCurrentUser();
    const navMenu = document.querySelector('.nav-menu');
    const existingAuth = document.querySelector('.nav-auth');

    // Remove existing auth UI
    if (existingAuth) existingAuth.remove();

    if (!user) {
        // Add login/register buttons
        const authButtons = document.createElement('li');
        authButtons.className = 'nav-auth';
        authButtons.innerHTML = `
            <button onclick="showAuthModal('login')" class="nav-link" style="background:none;border:none;cursor:pointer;color:#ff6b35;">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
            <button onclick="showAuthModal('register')" class="nav-link" style="background:none;border:none;cursor:pointer;color:#004e89;">
                <i class="fas fa-user-plus"></i> Register
            </button>
        `;
        navMenu.appendChild(authButtons);
    } else {
        // Add user menu with logout
        const userMenu = document.createElement('li');
        userMenu.className = 'nav-auth';
        userMenu.innerHTML = `
            <span class="nav-link" style="color:#666;">Welcome, ${user.name}</span>
            <button onclick="logoutUser()" class="nav-link" style="background:none;border:none;cursor:pointer;color:#ff6b35;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        navMenu.appendChild(userMenu);
    }
}

// Hook contact form submission to require auth
function setupAuthGuards() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const originalSubmit = contactForm.onsubmit;
        contactForm.addEventListener('submit', (e) => {
            if (!getCurrentUser()) {
                e.preventDefault();
                e.stopPropagation();
                showAuthModal('login');
                return false;
            }
        });
    }
}

// Initialize on page load
window.addEventListener('load', () => {
    initAuthUI();
    setupAuthGuards();

    // Close modal on background click
    const modal = document.getElementById('authModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAuthModal();
    });
});
