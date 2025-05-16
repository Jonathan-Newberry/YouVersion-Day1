import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    doc, 
    setDoc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Enable persistence right away
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Show/hide modal
function toggleModal(show = true) {
    authModal.style.display = show ? 'block' : 'none';
}

// Switch between login and signup forms
function switchTab(tab) {
    // Update all tab buttons in both forms
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Show/hide the appropriate form
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('signupForm').classList.toggle('active', tab === 'signup');
}

// Event Listeners
loginBtn.addEventListener('click', () => {
    if (auth.currentUser) {
        signOut(auth);
    } else {
        toggleModal(true);
    }
});

closeBtn.addEventListener('click', () => toggleModal(false));

// Add click handlers to all tab buttons
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Handle login form submission
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        toggleModal(false);
        loginFormElement.reset();
        loginError.textContent = '';
    } catch (error) {
        // More user-friendly login error messages
        if (error.code === 'auth/invalid-email') {
            loginError.textContent = 'Please enter a valid email address';
        } else if (error.code === 'auth/user-disabled') {
            loginError.textContent = 'This account has been disabled';
        } else if (error.code === 'auth/user-not-found') {
            loginError.textContent = 'No account found with this email';
        } else if (error.code === 'auth/wrong-password') {
            loginError.textContent = 'Incorrect password';
        } else {
            loginError.textContent = 'Error signing in. Please try again.';
        }
    }
});

// Handle signup form submission
signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const usernameValue = document.getElementById('signupUsername').value;
    
    try {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Store username in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: usernameValue,
            email: email
        });
        
        toggleModal(false);
        signupFormElement.reset();
        signupError.textContent = '';
    } catch (error) {
        // More user-friendly signup error messages
        if (error.code === 'auth/email-already-in-use') {
            signupError.textContent = 'Email already in use';
        } else if (error.code === 'auth/weak-password') {
            signupError.textContent = 'Password should be at least 6 characters';
        } else {
            signupError.textContent = 'Error creating account';
        }
    }
});

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            username.textContent = userDoc.data().username;
        }
        loginBtn.textContent = 'Logout';
    } else {
        // User is signed out
        username.textContent = 'Not logged in';
        loginBtn.textContent = 'Login';
    }
}); 