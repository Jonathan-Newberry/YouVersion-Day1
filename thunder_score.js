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
        
        // Debug log the events
        console.log('All events:', data.events);
        
        const thunderGame = data.events.find(event => {
            const competitors = event.competitions[0].competitors;
            return competitors.some(comp => comp.team.abbreviation === 'OKC');
        });
        
        if (thunderGame) {
            console.log('Thunder game found:', thunderGame);
            console.log('Game status:', thunderGame.status);
            console.log('Game state:', thunderGame.status.type.state);
            console.log('Game completed:', thunderGame.status.type.completed);
            
            const competition = thunderGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            
            const homeScore = homeTeam.score?.displayValue || '0';
            const awayScore = awayTeam.score?.displayValue || '0';
            const homeAbbrev = homeTeam.team.abbreviation;
            const awayAbbrev = awayTeam.team.abbreviation;

            // Check if the game hasn't started yet
            if (!thunderGame.status.type.completed && (thunderGame.status.type.state === 'pre' || thunderGame.status.type.state === 'scheduled')) {
                // Convert game time to Central Time
                const gameDate = new Date(thunderGame.date);
                const centralTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Chicago'
                }).format(gameDate);
                
                return {
                    hasGame: true,
                    score: `Thunder Game Today at ${centralTime} Central\n${awayAbbrev} @ ${homeAbbrev}`
                };
            }
            
            if (thunderGame.status.type.completed) {
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`
                };
            } else if (thunderGame.status.type.state === 'in') {
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (${thunderGame.status.type.detail})`
                };
            }
            
            // Fallback for any other game state
            console.log('Unhandled game state:', thunderGame.status.type.state);
            if (thunderGame.date) {
                const gameDate = new Date(thunderGame.date);
                const centralTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Chicago'
                }).format(gameDate);
                
                return {
                    hasGame: true,
                    score: `Thunder Game Today at ${centralTime} Central\n${awayAbbrev} @ ${homeAbbrev}`
                };
            }
        }
        
        // If no game today, fetch recent games
        console.log('No Thunder game today, fetching recent games...');
        const recentResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/OKC/schedule');
        
        if (!recentResponse.ok) {
            throw new Error(`ESPN Schedule API HTTP error! status: ${recentResponse.status}`);
        }
        
        const recentData = await recentResponse.json();
        console.log('Recent games data:', recentData);
        
        // Find the most recent completed game
        const recentGame = recentData.events.reverse().find(event => 
            event.competitions[0].status.type.completed
        );
        
        if (recentGame) {
            console.log('Found recent game:', recentGame);
            const competition = recentGame.competitions[0];
            const competitors = competition.competitors || [];
            const homeTeam = competitors.find(team => team.homeAway === 'home') || {};
            const awayTeam = competitors.find(team => team.homeAway === 'away') || {};
            
            const gameDate = new Date(recentGame.date).toLocaleDateString();
            const homeAbbrev = homeTeam.team?.abbreviation || 'HOME';
            const awayAbbrev = awayTeam.team?.abbreviation || 'AWAY';
            const homeScore = homeTeam.score?.displayValue || '0';
            const awayScore = awayTeam.score?.displayValue || '0';
            
            return {
                hasGame: false,
                score: `Most Recent Game (${gameDate}):\n${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`
            };
        }
        
        return {
            hasGame: false,
            score: "No recent Thunder games found"
        };
    } catch (error) {
        console.error('Error with ESPN API:', error);
        return {
            hasGame: false,
            score: "Error fetching score. Check browser console for details."
        };
    }
} 