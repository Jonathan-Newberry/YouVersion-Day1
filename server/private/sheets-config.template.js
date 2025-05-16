// Google Sheets Configuration Template
export const SHEETS_CONFIG = {
    type: "service_account",
    project_id: "YOUR_PROJECT_ID",
    private_key_id: "YOUR_PRIVATE_KEY_ID",
    private_key: "YOUR_PRIVATE_KEY",
    client_email: "YOUR_CLIENT_EMAIL",
    client_id: "YOUR_CLIENT_ID",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "YOUR_CERT_URL"
};

export const SHEET_ID = 'YOUR_SPREADSHEET_ID';
export const COUNTER_RANGE = 'Sheet1!A1';  // Cell where counter is stored 