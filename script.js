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

// This would cause an error:
// greetings = ["New array"]; // Can't reassign a const!

// But we can modify the array:
// greetings.push("New greeting"); // This is allowed

function changeGreeting() {
    const greetingElement = document.getElementById('greeting');
    currentIndex = (currentIndex + 1) % greetings.length;
    greetingElement.textContent = greetings[currentIndex];
} 