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
        
        // Debug log the events
        console.log('All events:', data.events.map(event => ({
            name: event.name,
            teams: event.competitions[0].competitors.map(comp => ({
                abbreviation: comp.team.abbreviation,
                score: comp.score
            }))
        })));
        
        const thunderGame = data.events.find(event => {
            const competitors = event.competitions[0].competitors;
            return competitors.some(comp => comp.team.abbreviation === 'OKC');
        });
        
        if (thunderGame) {
            console.log('Thunder game found:', thunderGame);
            const competition = thunderGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            
            // Debug log the team data
            console.log('Home team:', homeTeam);
            console.log('Away team:', awayTeam);
            
            if (thunderGame.status.type.completed) {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} ${awayTeam.score || 0} - ${homeTeam.team.abbreviation} ${homeTeam.score || 0} (Final)`
                };
            } else if (thunderGame.status.type.state === 'in') {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} ${awayTeam.score || 0} - ${homeTeam.team.abbreviation} ${homeTeam.score || 0} (${thunderGame.status.type.detail})`
                };
            } else {
                return {
                    hasGame: true,
                    score: `${awayTeam.team.abbreviation} vs ${homeTeam.team.abbreviation} - Game starts at ${thunderGame.status.type.shortDetail}`
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
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            const gameDate = new Date(recentGame.date).toLocaleDateString();
            
            // Debug log the recent game data
            console.log('Recent game home team:', homeTeam);
            console.log('Recent game away team:', awayTeam);
            
            return {
                hasGame: false,
                score: `No Thunder game scheduled for today\nLast game (${gameDate}):\n${awayTeam.team.abbreviation} ${awayTeam.score || 0} - ${homeTeam.team.abbreviation} ${homeTeam.score || 0} (Final)`
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