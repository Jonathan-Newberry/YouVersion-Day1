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
    //currentIndex = (currentIndex + 1) % greetings.length;
    //greetingElement.textContent = greetings[currentIndex];
    greetingElement.textContent = currentIndex + 1;
    currentIndex++;
    console.log(currentIndex);
    if (currentIndex % 8 ===0){
        newGreetingElement.textContent = "EVIL SCHMEEP";
        console.log("EVIL SCHMEEP");
    } 
}

// ===== New Welcome Message Functionality =====
const welcomeMessages = [
    "Welcome!",
    "Have a great day!",
    "Nice to see you!",
    "Thanks for visiting!",
    "Ready to explore?",
    "Geeble glorp",
    "Schmoop depot",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble",
    "Globble Glooble",
    "Glooble Globble"
];

let welcomeIndex = 0;
const newGreetingElement = document.getElementById('newGreeting');

function changeNewGreeting() {
    welcomeIndex = (welcomeIndex + 1) % welcomeMessages.length;
    if (currentIndex % 8 ===0){
        newGreetingElement.textContent = "EVILER SCHMEEP"
    } else if (currentIndex % 100 ==0){
        newGreetingElement.textContent = "Why are you still here?"
    } else{
    newGreetingElement.textContent = welcomeMessages[welcomeIndex];
    } 
}