// Function to get latest Thunder score
async function getThunderScore() {
    try {
        // Try the schedule endpoint first as it might have more up-to-date information
        console.log('Attempting to fetch from ESPN Schedule API...');
        const scheduleResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/OKC/schedule');
        
        if (!scheduleResponse.ok) {
            throw new Error(`ESPN Schedule API HTTP error! status: ${scheduleResponse.status}`);
        }
        
        const scheduleData = await scheduleResponse.json();
        console.log('Schedule API events:', scheduleData.events?.length);
        
        // Find today's game from schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayGame = scheduleData.events?.find(event => {
            const gameDate = new Date(event.date);
            gameDate.setHours(0, 0, 0, 0);
            return gameDate.getTime() === today.getTime();
        });
        
        if (todayGame) {
            console.log('Found game in schedule for today:', {
                date: new Date(todayGame.date).toLocaleString(),
                status: todayGame.status.type.state,
                name: todayGame.name
            });
        }
        
        // Also check the scoreboard API
        console.log('Attempting to fetch from ESPN Scoreboard API...');
        const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
        
        if (!scoreboardResponse.ok) {
            throw new Error(`ESPN Scoreboard API HTTP error! status: ${scoreboardResponse.status}`);
        }
        
        const scoreboardData = await scoreboardResponse.json();
        console.log('Scoreboard API events:', scoreboardData.events?.length);
        
        // Log all games from scoreboard for debugging
        scoreboardData.events?.forEach(event => {
            const competitors = event.competitions[0].competitors;
            console.log('Game found:', {
                teams: competitors.map(c => c.team.abbreviation).join(' vs '),
                date: new Date(event.date).toLocaleString(),
                status: event.status.type.state
            });
        });
        
        // Use todayGame if found in schedule, otherwise check scoreboard
        const thunderGame = todayGame || scoreboardData.events?.find(event => {
            const competitors = event.competitions[0].competitors;
            return competitors.some(comp => comp.team.abbreviation === 'OKC');
        });
        
        if (thunderGame) {
            console.log('Thunder game found:', {
                status: thunderGame.status.type.state,
                completed: thunderGame.status.type.completed,
                date: new Date(thunderGame.date).toLocaleString()
            });
            
            const competition = thunderGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
            
            const homeScore = homeTeam.score?.displayValue || '0';
            const awayScore = awayTeam.score?.displayValue || '0';
            const homeAbbrev = homeTeam.team.abbreviation;
            const awayAbbrev = awayTeam.team.abbreviation;

            // Check if the game hasn't started yet
            if (!thunderGame.status.type.completed && 
                (thunderGame.status.type.state === 'pre' || 
                 thunderGame.status.type.state === 'scheduled' || 
                 thunderGame.status.type.state === 'pending')) {
                // Convert game time to Central Time
                const gameDate = new Date(thunderGame.date);
                const centralTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Chicago'
                }).format(gameDate);
                
                console.log('Returning upcoming game info:', {
                    time: centralTime,
                    matchup: `${awayAbbrev} @ ${homeAbbrev}`
                });
                
                return {
                    hasGame: true,
                    score: `Thunder Game Today at ${centralTime} Central\n${awayAbbrev} @ ${homeAbbrev}`
                };
            }
            
            if (thunderGame.status.type.completed) {
                console.log('Returning completed game score');
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`
                };
            } else if (thunderGame.status.type.state === 'in') {
                console.log('Returning in-progress game score');
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (${thunderGame.status.type.detail})`
                };
            }
        }
        
        // If we get here, check the most recent completed game from schedule data
        const recentGame = scheduleData.events?.reverse().find(event => 
            event.competitions[0].status.type.completed
        );
        
        if (recentGame) {
            console.log('Found recent game:', {
                date: new Date(recentGame.date).toLocaleDateString(),
                status: recentGame.status.type.state
            });
            
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