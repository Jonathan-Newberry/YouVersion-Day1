import { google } from 'googleapis';
import { SHEETS_CONFIG, SHEET_ID, USERS_RANGE, USERS_HEADER_RANGE } from '/js/auth/sheets-config.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Initialize the Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: SHEETS_CONFIG,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Initialize the Users sheet if it doesn't exist
async function initializeUsersSheet() {
    try {
        // Check if headers exist
        const headers = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: USERS_HEADER_RANGE
        });

        if (!headers.data.values) {
            // Set up headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: USERS_HEADER_RANGE,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [['Email', 'Password', 'UserID', 'CreatedAt', 'LastLogin']]
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

        const users = response.data.values || [];
        return users.find(user => user[0] === email);
    } catch (error) {
        console.error('Error finding user:', error);
        throw error;
    }
}

// Create a new user
export async function createUser(email, password) {
    try {
        await initializeUsersSheet();

        // Check if user already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user row
        const newUser = [
            email,
            hashedPassword,
            uuidv4(),
            new Date().toISOString(),
            new Date().toISOString()
        ];

        // Append user to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: USERS_RANGE,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newUser]
            }
        });

        return { email, userId: newUser[2] };
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user[1]);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        // Update last login
        const userRowIndex = (await findUserRowIndex(email)) + 1;
        if (userRowIndex > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Users!E${userRowIndex}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[new Date().toISOString()]]
                }
            });
        }

        return { email, userId: user[2] };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

// Helper function to find user row index
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