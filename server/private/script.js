// ===== Original Hello World Functionality =====
const greetings = [
    "Hello World!",
    "¡Hola Mundo!",
    "Bonjour le Monde!",
    "Hallo Welt!",
    "Ciao Mondo!",
    "こんにちは世界！",
    "안녕하세요 세계!",
    "Olá Mundo!",
    "Hellorp worlp",
    "Привет, мир!"
];

let currentIndex = 0;

function changeGreeting() {
    const greetingElement = document.getElementById('greeting');
    currentIndex = (currentIndex + 1) % greetings.length;
    greetingElement.textContent = greetings[currentIndex];
}

// ===== New Welcome Message Functionality =====
const welcomeMessages = [
    "Welcome!",
    "Have a great day!",
    "Nice to see you!",
    "Thanks for visiting!",
    "Ready to explore?"
];

let welcomeIndex = 0;

function changeNewGreeting() {
    const newGreetingElement = document.getElementById('newGreeting');
    welcomeIndex = (welcomeIndex + 1) % welcomeMessages.length;
    newGreetingElement.textContent = welcomeMessages[welcomeIndex];
} 