// Simple page view counter using localStorage
document.addEventListener('DOMContentLoaded', function() {
    // Get the current count from localStorage
    let count = localStorage.getItem('pageViews') || 0;
    
    // Increment the count
    count = parseInt(count) + 1;
    
    // Save back to localStorage
    localStorage.setItem('pageViews', count);
    
    // Update the display
    const viewCounter = document.getElementById('viewCounter');
    if (viewCounter) {
        viewCounter.textContent = count;
    }
}); 