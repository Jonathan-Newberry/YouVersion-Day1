// Server-based counter implementation
document.addEventListener('DOMContentLoaded', async function() {
    const serverCounter = document.getElementById('serverCounter');
    
    try {
        // Fetch and increment counter from server
        const response = await fetch('http://localhost:3000/api/counter');
        const data = await response.json();
        
        // Update the display
        if (serverCounter) {
            serverCounter.textContent = data.count;
        }
    } catch (error) {
        console.error('Error updating server counter:', error);
        if (serverCounter) {
            serverCounter.textContent = 'Error loading count';
        }
    }
}); 