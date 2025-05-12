// Function to get latest Thunder score
async function getThunderScore() {
    try {
        // NBA Stats API endpoint with headers
        const response = await fetch('https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0',
                'Origin': window.location.origin,
                'Referer': window.location.href
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
        // Let's use a backup API if the first one fails
        try {
            const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
            const data = await response.json();
            
            const thunderGame = data.events.find(event => 
                event.name.includes('Thunder') || 
                (event.competitions[0].competitors[0].team.abbreviation === 'OKC' || 
                 event.competitions[0].competitors[1].team.abbreviation === 'OKC')
            );
            
            if (thunderGame) {
                const competition = thunderGame.competitions[0];
                const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
                const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
                
                if (thunderGame.status.type.completed) {
                    return `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (Final)`;
                } else if (thunderGame.status.type.state === 'in') {
                    return `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (${thunderGame.status.type.detail})`;
                } else {
                    return `${awayTeam.team.abbreviation} vs ${homeTeam.team.abbreviation} - Game starts at ${thunderGame.status.type.shortDetail}`;
                }
            }
            return "No Thunder game scheduled for today";
        } catch (backupError) {
            console.error('Error fetching from backup API:', backupError);
            return "Error fetching score. Please try again later.";
        }
    }
}

// Export the function so it can be used in other files
module.exports = { getThunderScore }; 