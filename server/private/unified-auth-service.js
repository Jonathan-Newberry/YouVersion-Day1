import { AUTH_CONFIG } from '/js/auth/auth-config.js';
import { auth, db } from '/firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentUser = null;

// Create a new user
export async function createUser(email, password, username = '') {
    if (AUTH_CONFIG.system === 'sheets') {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, username })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create user');
            }

            const result = await response.json();
            currentUser = result;
            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    } else {
        // Firebase
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Store additional user data
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username: username,
                email: email
            });

            return {
                email,
                userId: userCredential.user.uid
            };
        } catch (error) {
            console.error('Error creating Firebase user:', error);
            throw error;
        }
    }
}

// Login user
export async function loginUser(email, password) {
    if (AUTH_CONFIG.system === 'sheets') {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to log in');
            }

            const result = await response.json();
            currentUser = result;
            return result;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    } else {
        // Firebase
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return {
                email,
                userId: userCredential.user.uid
            };
        } catch (error) {
            console.error('Error logging in with Firebase:', error);
            throw error;
        }
    }
}

// Sign out user
export async function signOut() {
    if (AUTH_CONFIG.system === 'sheets') {
        currentUser = null;
        return true;
    } else {
        // Firebase
        try {
            await firebaseSignOut(auth);
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }
}

// Get current user
export function getCurrentUser() {
    if (AUTH_CONFIG.system === 'sheets') {
        return currentUser;
    } else {
        // Firebase
        return auth.currentUser;
    }
} 