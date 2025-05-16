import { google } from 'googleapis';
import { SHEETS_CONFIG, SHEET_ID, COUNTER_RANGE } from './sheets-config.js';

// Initialize the Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: SHEETS_CONFIG,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Get the current counter value
export async function getCounter() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: COUNTER_RANGE
        });
        
        const value = response.data.values?.[0]?.[0] || '0';
        return parseInt(value, 10);
    } catch (error) {
        console.error('Error reading counter:', error);
        throw error;
    }
}

// Increment the counter
export async function incrementCounter() {
    try {
        // Get current value first
        const currentValue = await getCounter();
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
        
        return newValue;
    } catch (error) {
        console.error('Error incrementing counter:', error);
        throw error;
    }
} 