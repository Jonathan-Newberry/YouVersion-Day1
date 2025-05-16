import { createUser, loginUser } from './sheets-auth-service.js';

async function testAuth() {
    try {
        // Test user creation
        console.log('Testing user creation...');
        const testUser = {
            email: 'test@example.com',
            password: 'testPassword123'
        };

        console.log('Creating new user...');
        const newUser = await createUser(testUser.email, testUser.password);
        console.log('User created:', newUser);

        // Test login
        console.log('\nTesting login...');
        const loggedInUser = await loginUser(testUser.email, testUser.password);
        console.log('Login successful:', loggedInUser);

        // Test wrong password
        console.log('\nTesting wrong password...');
        try {
            await loginUser(testUser.email, 'wrongpassword');
        } catch (error) {
            console.log('Expected error:', error.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testAuth(); 