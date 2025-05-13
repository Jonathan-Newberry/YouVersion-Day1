// Server-based counter implementation
document.addEventListener('DOMContentLoaded', async function() {
    const serverCounter = document.getElementById('serverCounter');
    
    try {
        // First get current count without incrementing
        const currentResponse = await fetch('http://localhost:3000/api/counter/current');
        const currentData = await currentResponse.json();
        
        // Update display with current count
        if (serverCounter) {
            serverCounter.textContent = currentData.count;
        }
        
        // Then increment the counter
        const incrementResponse = await fetch('http://localhost:3000/api/counter');
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
}); 