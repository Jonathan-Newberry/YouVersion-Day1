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
        console.log('Raw Schedule API response:', scheduleData);
        console.log('Schedule API events:', scheduleData.events?.length);
        
        if (!scheduleData.events) {
            throw new Error('No events data in schedule response');
        }
        
        // Find today's game from schedule
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let todayGame = null;
        
        // Log each event as we check it
        scheduleData.events.forEach((event, index) => {
            console.log(`Checking schedule event ${index}:`, {
                date: event.date,
                name: event.name,
                status: event.status
            });
            
            if (!event.date) return;
            const gameDate = new Date(event.date);
            gameDate.setHours(0, 0, 0, 0);
            if (gameDate.getTime() === today.getTime()) {
                todayGame = event;
                console.log('Found matching game:', event);
            }
        });
        
        if (todayGame) {
            console.log('Found game in schedule for today:', {
                date: todayGame.date ? new Date(todayGame.date).toLocaleString() : 'unknown',
                name: todayGame.name,
                rawStatus: todayGame.status // Log the raw status object
            });
        }
        
        // Also check the scoreboard API
        console.log('Attempting to fetch from ESPN Scoreboard API...');
        const scoreboardResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
        
        if (!scoreboardResponse.ok) {
            throw new Error(`ESPN Scoreboard API HTTP error! status: ${scoreboardResponse.status}`);
        }
        
        const scoreboardData = await scoreboardResponse.json();
        console.log('Raw Scoreboard API response:', scoreboardData);
        console.log('Scoreboard API events:', scoreboardData.events?.length);
        
        if (!scoreboardData.events) {
            throw new Error('No events data in scoreboard response');
        }
        
        // Log all games from scoreboard for debugging
        scoreboardData.events.forEach((event, index) => {
            console.log(`Checking scoreboard event ${index}:`, {
                date: event.date,
                name: event.name,
                status: event.status,
                competitions: event.competitions
            });
            
            if (event.competitions?.[0]?.competitors) {
                const competitors = event.competitions[0].competitors;
                console.log('Game found:', {
                    teams: competitors.map(c => c.team?.abbreviation || 'UNKNOWN').join(' vs '),
                    date: event.date ? new Date(event.date).toLocaleString() : 'unknown',
                    rawStatus: event.status // Log the raw status object
                });
            }
        });
        
        // Use todayGame if found in schedule, otherwise check scoreboard
        const thunderGame = todayGame || scoreboardData.events.find(event => {
            if (!event.competitions?.[0]?.competitors) return false;
            const competitors = event.competitions[0].competitors;
            return competitors.some(comp => comp.team?.abbreviation === 'OKC');
        });
        
        if (thunderGame) {
            console.log('Thunder game found:', {
                date: thunderGame.date ? new Date(thunderGame.date).toLocaleString() : 'unknown',
                name: thunderGame.name,
                rawStatus: thunderGame.status, // Log the raw status object
                rawCompetitions: thunderGame.competitions
            });
            
            const competition = thunderGame.competitions?.[0];
            if (!competition) {
                throw new Error('Invalid competition data in Thunder game');
            }
            
            const homeTeam = competition.competitors?.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors?.find(team => team.homeAway === 'away');
            
            if (!homeTeam || !awayTeam) {
                throw new Error('Invalid team data in Thunder game');
            }
            
            const homeScore = homeTeam.score?.displayValue || '0';
            const awayScore = awayTeam.score?.displayValue || '0';
            const homeAbbrev = homeTeam.team?.abbreviation || 'HOME';
            const awayAbbrev = awayTeam.team?.abbreviation || 'AWAY';

            // Check game state - log the raw status first
            console.log('Game status object:', thunderGame.status);
            
            const gameState = thunderGame.status?.state || thunderGame.status?.type?.state || '';
            const isCompleted = thunderGame.status?.completed || thunderGame.status?.type?.completed || false;
            
            if (!isCompleted && 
                (gameState === 'pre' || 
                 gameState === 'scheduled' || 
                 gameState === 'pending')) {
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
            
            if (isCompleted) {
                console.log('Returning completed game score');
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`
                };
            } else if (gameState === 'in') {
                console.log('Returning in-progress game score');
                return {
                    hasGame: true,
                    score: `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (${thunderGame.status?.detail || thunderGame.status?.type?.detail || 'In Progress'})`
                };
            }
        }
        
        // If we get here, check the most recent completed game from schedule data
        const recentGames = scheduleData.events.filter(event => 
            event.competitions?.[0]?.status?.completed || 
            event.competitions?.[0]?.status?.type?.completed
        );
        
        console.log('Recent completed games found:', recentGames.length);
        
        if (recentGames.length > 0) {
            const recentGame = recentGames[0];
            console.log('Most recent game:', {
                date: recentGame.date ? new Date(recentGame.date).toLocaleDateString() : 'unknown',
                name: recentGame.name,
                rawStatus: recentGame.status
            });
            
            const competition = recentGame.competitions?.[0];
            const competitors = competition?.competitors || [];
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
        return {
            hasGame: false,
            score: "Error fetching score. Check browser console for details."
        };
    }
} 