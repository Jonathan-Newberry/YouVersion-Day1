const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Store counter in memory (would use a database in production)
let pageViews = 0;

// Route to get and increment counter
app.get('/api/counter', (req, res) => {
    pageViews++;
    res.json({ count: pageViews });
});

// Route to get counter without incrementing
app.get('/api/counter/current', (req, res) => {
    res.json({ count: pageViews });
});

app.listen(port, () => {
    console.log(`Counter server running at http://localhost:${port}`);
}); 