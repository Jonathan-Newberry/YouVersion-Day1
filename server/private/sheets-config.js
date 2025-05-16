// Google Sheets Configuration
export const SHEETS_CONFIG = {
    type: "service_account",
    project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
    private_key_id: process.env.GOOGLE_SHEETS_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
    auth_uri: process.env.GOOGLE_SHEETS_AUTH_URI,
    token_uri: process.env.GOOGLE_SHEETS_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_SHEETS_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_SHEETS_CLIENT_CERT_URL,
    universe_domain: "googleapis.com"
};

// Sheet configurations
export const SHEET_ID = process.env.SHEET_ID;
export const COUNTER_RANGE = process.env.COUNTER_RANGE;

// User data configurations
export const USERS_RANGE = process.env.USERS_RANGE;
export const USERS_HEADER_RANGE = process.env.USERS_HEADER_RANGE;