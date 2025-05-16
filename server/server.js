const express = require('express');
const cors = require('cors');
const path = require('path');
const { google } = require('googleapis');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Import sheets configuration
const { SHEETS_CONFIG, SHEET_ID, USERS_RANGE, USERS_HEADER_RANGE, COUNTER_RANGE } = require('./private/sheets-config.js');

// Initialize the Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: SHEETS_CONFIG,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Store counter in memory (would use a database in production)
let pageViews = 0;
let isUpdating = false;

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Send current counter value to new clients
    getSheetCounter().then(count => {
        socket.emit('counterUpdate', { count });
    }).catch(error => {
        console.error('Error getting counter for new socket:', error);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Initialize the Users sheet if it doesn't exist
async function initializeUsersSheet() {
    try {
        const headers = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: USERS_HEADER_RANGE
        });

        if (!headers.data.values) {
            // Set up headers with correct order
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: USERS_HEADER_RANGE,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [['Email', 'Password', 'UserID', 'CreatedAt', 'LastLogin', 'UserName']]
                }
            });
        }
    } catch (error) {
        console.error('Error initializing users sheet:', error);
        throw error;
    }
}

// Find a user by email
async function findUserByEmail(email) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE
        });

        console.log('Sheet data:', response.data.values); // Debug log to see all data

        const users = response.data.values || [];
        // Skip header row if it exists
        const dataRows = users[0]?.[0] === 'Email' ? users.slice(1) : users;
        const user = dataRows.find(user => user[0] === email);

        if (user) {
            // Ensure we have all columns
            while (user.length < 6) {
                user.push('');
            }
            console.log('Found user with all columns:', {
                email: user[0],
                userId: user[2],
                createdAt: user[3],
                lastLogin: user[4],
                username: user[5]
            });
        }

        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
}

// Find user row index
async function findUserRowIndex(email) {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE
        });

        const users = response.data.values || [];
        return users.findIndex(user => user[0] === email);
    } catch (error) {
        console.error('Error finding user row:', error);
        throw error;
    }
}

// Migrate existing data to new format
async function migrateUsersData() {
    try {
        // Get all existing data
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE
        });

        const users = response.data.values || [];
        if (users.length === 0) return;

        // Clear the sheet
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE
        });

        // Set up headers
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: USERS_HEADER_RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['Email', 'Password', 'UserID', 'CreatedAt', 'LastLogin', 'UserName']]
            }
        });

        // Transform and reinsert the data
        const migratedUsers = users.map(user => {
            if (!user || user.length < 3) return null;
            return [
                user[0], // Email
                user[1], // Password
                user[2], // UserID
                user[3] || new Date().toISOString(), // CreatedAt
                user[4] || new Date().toISOString(), // LastLogin
                user[5] || user[0].split('@')[0] // UserName
            ];
        }).filter(user => user !== null);

        if (migratedUsers.length > 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: USERS_RANGE,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: migratedUsers
                }
            });
        }

        console.log('Users data migration completed');
    } catch (error) {
        console.error('Error migrating users data:', error);
        throw error;
    }
}

// Add migration endpoint
app.post('/api/auth/migrate', async (req, res) => {
    try {
        await migrateUsersData();
        res.json({ message: 'Users data migrated successfully' });
    } catch (error) {
        console.error('Error in migration:', error);
        res.status(500).json({ error: 'Error migrating users data' });
    }
});

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        console.log('Signup request received:', { email, username });
        
        await initializeUsersSheet();

        // Check if user exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const now = new Date().toISOString();
        // Create new user with explicit column mapping
        const newUser = [
            email,            // A: Email
            hashedPassword,   // B: Password
            uuidv4(),        // C: UserID
            now,             // D: CreatedAt
            now,             // E: LastLogin
            username         // F: UserName (no fallback to email)
        ];

        console.log('Creating new user with data:', {
            email: newUser[0],
            userId: newUser[2],
            username: newUser[5]
        });

        // Save to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newUser]
            }
        });

        // Send response with user data
        const userData = {
            email: newUser[0],
            userId: newUser[2],
            username: newUser[5] || email.split('@')[0] // Fallback only in response if username is empty
        };
        console.log('Sending new user data:', userData);
        res.json(userData);
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        console.log('Processing login for user:', {
            email: user[0],
            userId: user[2],
            username: user[5]
        });

        const isValid = await bcrypt.compare(password, user[1]);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Update last login in column E only
        const userRowIndex = (await findUserRowIndex(email)) + 1;
        if (userRowIndex > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Users!E${userRowIndex}`, // LastLogin column
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[new Date().toISOString()]]
                }
            });
        }

        // Send response with user data
        const userData = {
            email: user[0],
            userId: user[2],
            // Only fall back to email prefix if username column is empty or undefined
            username: (user[5] && user[5].trim()) || user[0].split('@')[0]
        };
        console.log('Sending login response:', userData);
        res.json(userData);
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Reset users sheet (development only)
app.post('/api/auth/reset', async (req, res) => {
    try {
        // Clear the sheet
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE
        });

        // Reinitialize headers
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: USERS_HEADER_RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: [['Email', 'Password', 'UserID', 'CreatedAt', 'LastLogin', 'UserName']]
            }
        });

        res.json({ message: 'Users sheet reset successfully' });
    } catch (error) {
        console.error('Error resetting users sheet:', error);
        res.status(500).json({ error: 'Error resetting users sheet' });
    }
});

// Google Sheets Counter functions
async function getSheetCounter() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: COUNTER_RANGE
        });
        
        const value = response.data.values?.[0]?.[0] || '0';
        return parseInt(value, 10);
    } catch (error) {
        console.error('Error reading counter from sheet:', error);
        throw error;
    }
}

async function incrementSheetCounter() {
    try {
        // Get current value first
        const currentValue = await getSheetCounter();
        const newValue = currentValue + 1;
        
        // Update the value
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: COUNTER_RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newValue]]
            }
        });
        
        // Broadcast the new counter value to all connected clients
        io.emit('counterUpdate', { count: newValue });
        
        return newValue;
    } catch (error) {
        console.error('Error incrementing sheet counter:', error);
        throw error;
    }
}

async function resetSheetCounter() {
    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: COUNTER_RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[0]]
            }
        });
        
        // Broadcast the reset counter value to all connected clients
        io.emit('counterUpdate', { count: 0 });
        
        return 0;
    } catch (error) {
        console.error('Error resetting sheet counter:', error);
        throw error;
    }
}

// Google Sheets Counter endpoints
app.get('/api/sheets/counter/increment', async (req, res) => {
    try {
        const newCount = await incrementSheetCounter();
        res.json({ count: newCount });
    } catch (error) {
        res.status(500).json({ error: 'Error incrementing counter' });
    }
});

app.get('/api/sheets/counter/current', async (req, res) => {
    try {
        const count = await getSheetCounter();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error getting counter' });
    }
});

app.post('/api/sheets/counter/reset', async (req, res) => {
    try {
        const count = await resetSheetCounter();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Error resetting counter' });
    }
});

// Legacy Counter endpoints (kept for backward compatibility)
app.get('/api/counter', incrementCounter);
app.get('/api/counter/current', getCurrentCount);
app.post('/api/counter/reset', resetCounter);

// Counter functions
function incrementCounter(req, res) {
    if (isUpdating) {
        return res.status(409).json({ error: 'Counter is being updated' });
    }
    isUpdating = true;
    const newCount = ++pageViews;
    isUpdating = false;
    res.json({ count: newCount });
}

function getCurrentCount(req, res) {
    res.json({ count: pageViews });
}

function resetCounter(req, res) {
    if (isUpdating) {
        return res.status(409).json({ error: 'Counter is being updated' });
    }
    isUpdating = true;
    pageViews = 0;
    isUpdating = false;
    res.json({ count: pageViews });
}

// Serve static files
app.use('/', express.static(path.join(__dirname, 'public')));

// Log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Serve auth.js and config files
app.use('/js/auth', express.static(path.join(__dirname, 'private'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
            console.log('Serving auth file:', path.basename(filePath));
        }
    },
    index: false,
    filter: (file) => {
        const allowedFiles = [
            'auth-config.js',
            'unified-auth-service.js',
            'auth.js'
        ];
        const isAllowed = allowedFiles.includes(path.basename(file));
        if (!isAllowed) {
            console.log('Blocked request for:', path.basename(file));
        }
        return isAllowed;
    }
}));

// Use server.listen instead of app.listen for Socket.IO
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 