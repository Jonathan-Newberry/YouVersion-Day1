// Function to get latest Thunder score
async function getThunderScore() {
    try {
        const response = await fetch('https://data.nba.net/prod/v1/today.json');
        const data = await response.json();
        
        // Get today's games
        const gamesResponse = await fetch(`https://data.nba.net/prod/v1/${data.links.currentDate}/scoreboard.json`);
        const games = await gamesResponse.json();
        
        // Find Thunder game
        const thunderGame = games.games.find(game => 
            game.hTeam.triCode === 'OKC' || game.vTeam.triCode === 'OKC'
        );
        
        if (thunderGame) {
            const score = `${thunderGame.vTeam.triCode} ${thunderGame.vTeam.score} - ${thunderGame.hTeam.triCode} ${thunderGame.hTeam.score}`;
            return score;
        } else {
            return "No Thunder game today";
        }
    } catch (error) {
        console.error('Error fetching score:', error);
        return "Error fetching score";
    }
}

// Export the function so it can be used in other files
module.exports = { getThunderScore }; 