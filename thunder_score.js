// Function to get latest Thunder score
async function getThunderScore() {
    try {
        // Get today's date in YYYYMMDD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateString = `${year}${month}${day}`;

        // NBA Stats API endpoint
        const response = await fetch(`https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`);
        const data = await response.json();
        
        // Find Thunder game
        const thunderGame = data.scoreboard.games.find(game => 
            game.awayTeam.teamTricode === 'OKC' || game.homeTeam.teamTricode === 'OKC'
        );
        
        if (thunderGame) {
            // Format the score based on game status
            if (thunderGame.gameStatus === 1) {
                // Game hasn't started
                return `${thunderGame.awayTeam.teamTricode} vs ${thunderGame.homeTeam.teamTricode} - Game starts at ${thunderGame.gameStatusText}`;
            } else if (thunderGame.gameStatus === 2) {
                // Game in progress
                return `${thunderGame.awayTeam.teamTricode} ${thunderGame.awayTeam.score} - ${thunderGame.homeTeam.teamTricode} ${thunderGame.homeTeam.score} (${thunderGame.gameStatusText})`;
            } else {
                // Game finished
                return `${thunderGame.awayTeam.teamTricode} ${thunderGame.awayTeam.score} - ${thunderGame.homeTeam.teamTricode} ${thunderGame.homeTeam.score} (Final)`;
            }
        } else {
            return "No Thunder game scheduled for today";
        }
    } catch (error) {
        console.error('Error fetching score:', error);
        return "Error fetching score. Please try again later.";
    }
}

// Export the function so it can be used in other files
module.exports = { getThunderScore }; 