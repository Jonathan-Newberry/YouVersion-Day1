const greetings = [
    "Hello World!",
    "¡Hola Mundo!",
    "Bonjour le Monde!",
    "Hallo Welt!",
    "Ciao Mondo!",
    "こんにちは世界！",
    "안녕하세요 세계!"
];

let currentIndex = 0;

function changeGreeting() {
    const greetingElement = document.getElementById('greeting');
    currentIndex = (currentIndex + 1) % greetings.length;
    greetingElement.textContent = greetings[currentIndex];
} 