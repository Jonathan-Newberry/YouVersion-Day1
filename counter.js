// Local counter implementation using localStorage
document.addEventListener('DOMContentLoaded', function() {
    const viewCounter = document.getElementById('viewCounter');
    
    // Get the current count from localStorage
    let count = localStorage.getItem('pageViews') || 0;
    
    // Increment the count
    count = parseInt(count) + 1;
    
    // Save back to localStorage
    localStorage.setItem('pageViews', count);
    
    // Update the display
    if (viewCounter) {
        viewCounter.textContent = count;
    }
}); 