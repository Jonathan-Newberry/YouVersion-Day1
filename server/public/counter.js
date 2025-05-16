// Counter implementation using Google Sheets API with real-time updates
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

    // Connect to Socket.IO server
    const socket = io();
    
    // Listen for real-time counter updates
    socket.on('counterUpdate', (data) => {
        if (serverCounter) {
            serverCounter.textContent = data.count;
        }
    });

    // Google Sheets-based counter function
    async function updateServerCounter() {
        try {
            // First get current count without incrementing
            const currentResponse = await fetch('/api/sheets/counter/current');
            const currentData = await currentResponse.json();
            
            // Update display with current count
            if (serverCounter) {
                serverCounter.textContent = currentData.count;
            }
            
            // Then increment the counter
            await fetch('/api/sheets/counter/increment');
            // No need to update display here as Socket.IO will handle it
            
        } catch (error) {
            console.error('Error updating server counter:', error);
            if (serverCounter) {
                serverCounter.textContent = 'Error loading count';
            }
        }
    }

    // Initial server counter update
    updateServerCounter();
}); 
