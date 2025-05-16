// Regular (Synchronous) Function
function getScoreRegular() {
    console.log("1. Starting to get score");
    // This would block (wait) until complete
    const score = someAPICall();  // Imagine this takes 2 seconds
    console.log("2. Got the score");
    return score;
}

// Async Function
async function getScoreAsync() {
    console.log("1. Starting to get score");
    // This lets other code run while waiting
    const score = await fetch('https://api.example.com/score');
    console.log("2. Got the score");
    return score;
}

// Example showing the difference
console.log("Program starts");

// Regular function blocks everything until it's done
getScoreRegular();
console.log("This prints after score is fully loaded");

// Async function lets other code run while it's working
getScoreAsync();
console.log("This prints while score is still loading!");

// Real Example: Loading Multiple Scores
async function loadAllScores() {
    try {
        // These all load at the same time!
        const [thunderScore, lakersScore, celticsScore] = await Promise.all([
            fetch('api/thunder'),
            fetch('api/lakers'),
            fetch('api/celtics')
        ]);
        
        return {
            thunder: await thunderScore.json(),
            lakers: await lakersScore.json(),
            celtics: await celticsScore.json()
        };
    } catch (error) {
        console.error("Error loading scores:", error);
    }
} 