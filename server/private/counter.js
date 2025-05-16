import { db } from './firebase-config.js';
import { 
    doc, 
    getDoc, 
    setDoc, 
    increment, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Both local and server-based counter implementation
document.addEventListener('DOMContentLoaded', async function() {
    const viewCounter = document.getElementById('viewCounter');
    const serverCounter = document.getElementById('serverCounter');
    
    // Local counter using localStorage
    let localCount = localStorage.getItem('pageViews') || 0;
    localCount = parseInt(localCount) + 1;
    localStorage.setItem('pageViews', localCount);
    
    // Update local counter display
    if (viewCounter) {
        viewCounter.textContent = localCount;
    }

    // OLD Server counter function (preserved for reference)
    /*
    async function updateServerCounter() {
        try {
            // First get current count without incrementing
            const currentResponse = await fetch('/api/counter/current');
            const currentData = await currentResponse.json();
            
            // Update display with current count
            if (serverCounter) {
                serverCounter.textContent = currentData.count;
            }
            
            // Then increment the counter
            const incrementResponse = await fetch('/api/counter');
            const incrementData = await incrementResponse.json();
            
            // Update display with new count
            if (serverCounter) {
                serverCounter.textContent = incrementData.count;
            }
        } catch (error) {
            console.error('Error updating server counter:', error);
            if (serverCounter) {
                serverCounter.textContent = 'Error loading count';
            }
        }
    }
    */

    // NEW Firebase-based counter function
    async function updateServerCounter() {
        try {
            const counterRef = doc(db, 'counters', 'pageViews');
            
            // Get the current count
            const counterDoc = await getDoc(counterRef);
            let currentCount = 0;
            
            if (!counterDoc.exists()) {
                // Initialize the counter if it doesn't exist
                await setDoc(counterRef, { count: 0 });
            } else {
                currentCount = counterDoc.data().count;
            }
            
            // Update display with current count
            if (serverCounter) {
                serverCounter.textContent = currentCount;
            }
            
            // Increment the counter using merge to handle both creation and updates
            await setDoc(counterRef, {
                count: increment(1)
            }, { merge: true });
            
            // Set up real-time listener for counter updates
            onSnapshot(counterRef, (doc) => {
                if (doc.exists() && serverCounter) {
                    serverCounter.textContent = doc.data().count;
                }
            });
            
        } catch (error) {
            console.error('Error updating Firebase counter:', error);
            if (serverCounter) {
                serverCounter.textContent = 'Error loading count';
            }
        }
    }

    // Initial server counter update
    updateServerCounter();
}); 
