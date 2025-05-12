// Utility functions for the Hello World app

function getRandomGreeting() {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
}

function capitalizeGreeting(greeting) {
    return greeting.toUpperCase();
} 