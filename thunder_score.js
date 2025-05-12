// Function to get latest Thunder score
async function getThunderScore() {
    try {
        console.log('Attempting to fetch from ESPN API...');
        const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
        
        if (!response.ok) {
            throw new Error(`ESPN API HTTP error! status: ${response.status}`);
        }
        
        console.log('ESPN API response received, parsing JSON...');
        const data = await response.json();
        console.log('ESPN API data:', data);
        
        const thunderGame = data.events.find(event => 
            event.name.includes('Thunder') || 
            (event.competitions[0].competitors[0].team.abbreviation === 'OKC' || 
             event.competitions[0].competitors[1].team.abbreviation === 'OKC')
        );
        
        if (thunderGame) {
            console.log('Thunder game found:', thunderGame);
            const competition = thunderGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            
            if (thunderGame.status.type.completed) {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (Final)`
                };
            } else if (thunderGame.status.type.state === 'in') {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (${thunderGame.status.type.detail})`
                };
            } else {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} vs ${homeTeam.team.abbreviation} - Game starts at ${thunderGame.status.type.shortDetail}`
                };
            }
        }
        
        // If no game today, fetch recent games
        console.log('No game today, fetching recent games...');
        const recentResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/OKC/schedule');
        const recentData = await recentResponse.json();
        
        // Find the most recent completed game
        const recentGame = recentData.events.reverse().find(event => 
            event.competitions[0].status.type.completed
        );
        
        if (recentGame) {
            const competition = recentGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            const gameDate = new Date(recentGame.date).toLocaleDateString();
            
            return {
                hasGame: false,
                score: `No Thunder game scheduled for today\nLast game (${gameDate}):\n${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (Final)`
            };
        }
        
        return {
            hasGame: false,
            score: "No Thunder game scheduled for today"
        };
    } catch (error) {
        console.error('Error with ESPN API:', error);
        return {
            hasGame: false,
            score: "Error fetching score. Check browser console for details."
        };
    }
} 