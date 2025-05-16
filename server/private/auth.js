// Import from the served paths
import { createUser, loginUser, signOut, getCurrentUser } from '/js/auth/unified-auth-service.js';

console.log('Starting auth.js initialization...');

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const username = document.getElementById('username');
const authModal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

console.log('DOM Elements found:', {
    loginBtn: !!loginBtn,
    username: !!username,
    authModal: !!authModal,
    closeBtn: !!closeBtn,
    tabBtns: tabBtns.length,
    loginFormElement: !!loginFormElement,
    signupFormElement: !!signupFormElement
});

// Show/hide modal
function toggleModal(show = true) {
    if (!authModal) {
        console.error('Auth modal not found');
        return;
    }
    console.log('Toggling modal:', show, 'Current display:', authModal.style.display);
    authModal.style.display = show ? 'block' : 'none';
    console.log('Modal display after toggle:', authModal.style.display);
}

// Switch between login and signup forms
function switchTab(tab) {
    console.log('Switching to tab:', tab);
    // Update all tab buttons in both forms
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Show/hide the appropriate form
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm && signupForm) {
        loginForm.classList.toggle('active', tab === 'login');
        signupForm.classList.toggle('active', tab === 'signup');
    } else {
        console.error('Login or signup form not found');
    }
}

// Event Listeners
if (!loginBtn) {
    console.error('Login button not found');
} else {
    console.log('Adding click listener to login button');
    loginBtn.addEventListener('click', async (e) => {
        console.log('Login button clicked', e);
        const currentUser = getCurrentUser();
        console.log('Current user:', currentUser);
        if (currentUser) {
            await signOut();
            username.textContent = 'Not logged in';
            loginBtn.textContent = 'Login';
    } else {
        toggleModal(true);
    }
});
}

if (!closeBtn) {
    console.error('Close button not found');
} else {
    closeBtn.addEventListener('click', () => {
        console.log('Close button clicked');
        toggleModal(false);
    });
}

// Add click handlers to all tab buttons
if (!tabBtns.length) {
    console.error('No tab buttons found');
} else {
tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('Tab button clicked:', btn.dataset.tab);
            switchTab(btn.dataset.tab);
        });
});
}

// Handle login form submission
if (!loginFormElement) {
    console.error('Login form not found');
} else {
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
        console.log('Login form submitted');
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
            const result = await loginUser(email, password);
            console.log('Login result:', result);
        toggleModal(false);
        loginFormElement.reset();
        loginError.textContent = '';
            username.textContent = result.username;
            loginBtn.textContent = 'Logout';
    } catch (error) {
            loginError.textContent = error.message || 'Error signing in. Please try again.';
    }
});
}

// Handle signup form submission
if (!signupFormElement) {
    console.error('Signup form not found');
} else {
signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
        console.log('Signup form submitted');
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const usernameValue = document.getElementById('signupUsername').value;
    
    try {
            const result = await createUser(email, password, usernameValue);
            console.log('Signup result:', result);
        toggleModal(false);
        signupFormElement.reset();
        signupError.textContent = '';
            username.textContent = result.username;
            loginBtn.textContent = 'Logout';
    } catch (error) {
            signupError.textContent = error.message || 'Error creating account';
    }
});
}

// Add console log to verify script loading
console.log('Auth script initialization completed'); 