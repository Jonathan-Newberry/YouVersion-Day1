// Counter implementation using server
document.addEventListener('DOMContentLoaded', async function() {
    const viewCounter = document.getElementById('viewCounter');
    
    try {
        // Fetch and increment counter from server
        const response = await fetch('http://localhost:3000/api/counter');
        const data = await response.json();
        
        // Update the display
        if (viewCounter) {
            viewCounter.textContent = data.count;
        }
    } catch (error) {
        console.error('Error updating counter:', error);
        if (viewCounter) {
            viewCounter.textContent = 'Error loading count';
        }
    }
}); 