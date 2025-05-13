const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Store counter in memory (would use a database in production)
let pageViews = 0;
let isUpdating = false; //Prevents multiple requests from incrementing the counter at the same time

// 1. Define the increment counter function separately
function incrementCounter(req, res) {
    if (isUpdating) {
        return res.status(409).json({ error: 'Counter is being updated' });
    }
    
    isUpdating = true;
    const newCount = ++pageViews;
    isUpdating = false;
    
    res.json({ count: newCount });
}

// 2. Define the get current count function separately
function getCurrentCount(req, res) {
    res.json({ count: pageViews });
}

// 3. Define the reset counter function separately
function resetCounter(req, res) {
    if (isUpdating) {
        return res.status(409).json({ error: 'Counter is being updated' });
    }
    
    isUpdating = true;
    pageViews = 0;
    isUpdating = false;
    
    res.json({ count: pageViews });
}

// 4. Define the server start callback separately
function onServerStart() {
    console.log(`Counter server running at http://localhost:${port}`);
}

// Then use these functions in our routes (WITHOUT parentheses):
app.get('/api/counter', incrementCounter);
app.get('/api/counter/current', getCurrentCount);
app.post('/api/counter/reset', resetCounter);
app.listen(port, onServerStart); 