import { getCounter, incrementCounter } from './sheets-service.js';

// Test the counter functionality
async function testCounter() {
    try {
        // Get initial count
        console.log('Getting initial count...');
        const initialCount = await getCounter();
        console.log('Initial count:', initialCount);

        // Increment counter
        console.log('Incrementing counter...');
        const newCount = await incrementCounter();
        console.log('New count:', newCount);

        // Verify the new count
        console.log('Verifying new count...');
        const verifyCount = await getCounter();
        console.log('Verified count:', verifyCount);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Run the test
testCounter(); 