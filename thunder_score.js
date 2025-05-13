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
        
        // Log the entire response immediately
        console.log('Raw Schedule API response:', JSON.stringify(scheduleData, null, 2));
        
        // Validate and log the events array
        if (!scheduleData || !scheduleData.events) {
            console.log('Invalid or missing events in schedule data:', scheduleData);
            throw new Error('No events data in schedule response');
        }
        
        console.log('Schedule API events length:', scheduleData.events.length);
        
        // Find today's game from schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let todayGame = null;
        
        // Log and process each event
        for (const event of scheduleData.events) {
            // Log the raw event first
            console.log('Raw schedule event:', JSON.stringify(event, null, 2));
            
            if (!event || !event.date) {
                console.log('Event missing date:', event);
                continue;
            }
            
            const gameDate = new Date(event.date);
            gameDate.setHours(0, 0, 0, 0);
            
            console.log('Comparing dates:', {
                gameDate: gameDate.toISOString(),
                today: today.toISOString(),
                matches: gameDate.getTime() === today.getTime()
            });
            
            if (gameDate.getTime() === today.getTime()) {
                todayGame = event;
                console.log('Found matching game:', JSON.stringify(event, null, 2));
                break;
            }
        }
        
        if (todayGame) {
            console.log('Processing today\'s game:', {
                date: todayGame.date,
                name: todayGame.name,
                rawStatus: todayGame.status
            });
            
            const competition = todayGame.competitions?.[0];
            if (!competition) {
                console.log('No competition data found in today\'s game');
                throw new Error('Invalid competition data in today\'s game');
            }
            
            // Get both teams from the competitors array
            const competitors = competition.competitors || [];
            console.log('Competitors:', competitors);
            
            const homeTeam = competitors.find(team => team?.homeAway === 'home');
            const awayTeam = competitors.find(team => team?.homeAway === 'away');
            
            console.log('Teams:', { homeTeam, awayTeam });
            
            if (!homeTeam?.team || !awayTeam?.team) {
                console.log('Missing team data:', { homeTeam, awayTeam });
                throw new Error('Invalid team data in today\'s game');
            }
            
            const homeScore = homeTeam.score?.displayValue || '0';
            const awayScore = awayTeam.score?.displayValue || '0';
            const homeAbbrev = homeTeam.team.abbreviation || 'HOME';
            const awayAbbrev = awayTeam.team.abbreviation || 'AWAY';
            
            // Get game state
            const status = todayGame.status || {};
            console.log('Game status:', status);
            
            // Check if status.type exists, if not use status directly
            const gameState = status.state || (status.type && status.type.state) || '';
            const isCompleted = status.completed || (status.type && status.type.completed) || false;
            
            console.log('Processed game state:', { gameState, isCompleted });
            
            // If we have a valid game date but no state, treat it as an upcoming game
            if (!gameState && todayGame.date) {
                const gameDate = new Date(todayGame.date);
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
            
            if (!isCompleted && ['pre', 'scheduled', 'pending', ''].includes(gameState)) {
                const gameDate = new Date(todayGame.date);
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
            
            if (isCompleted) {
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`
                };
            } else if (gameState === 'in') {
                const detail = status.detail || (status.type && status.type.detail) || 'In Progress';
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (${detail})`
                };
            }
        }
        
        // If no game today, find the most recent completed game
        const recentGames = scheduleData.events
            .filter(event => {
                const status = event.status || {};
                return status.completed || (status.type && status.type.completed);
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log('Recent completed games found:', recentGames.length);
        
        if (recentGames.length > 0) {
            const recentGame = recentGames[0];
            console.log('Processing most recent game:', {
                date: recentGame.date,
                name: recentGame.name,
                rawStatus: recentGame.status
            });
            
            const competition = recentGame.competitions?.[0];
            if (!competition) {
                throw new Error('Invalid competition data in recent game');
            }
            
            const competitors = competition.competitors || [];
            const homeTeam = competitors.find(team => team?.homeAway === 'home') || {};
            const awayTeam = competitors.find(team => team?.homeAway === 'away') || {};
            
            const gameDate = recentGame.date ? new Date(recentGame.date).toLocaleDateString() : 'unknown';
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
        console.error('Error stack:', error.stack);
        return {
            hasGame: false,
            score: "Error fetching score. Check browser console for details."
        };
    }
} 