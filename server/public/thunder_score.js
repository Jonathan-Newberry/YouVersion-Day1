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
        console.log('All events:', data.events);

        const thunderGame = data.events.find(event => {
            const competitors = event.competitions[0].competitors;
            return competitors.some(comp => comp.team.abbreviation === 'OKC');
        });

        let todayGameMessage = "";
        if (thunderGame) {
            console.log('Thunder game found:', thunderGame);
            const competition = thunderGame.competitions[0];
            const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
            const awayTeam = competition.competitors.find(team => team.homeAway === 'away');

            // Debug log the team data
            console.log('Home team:', homeTeam);
            console.log('Away team:', awayTeam);

            const homeScore = homeTeam.score.displayValue || '0';
            const awayScore = awayTeam.score.displayValue || '0';
            const homeAbbrev = homeTeam.team.abbreviation;
            const awayAbbrev = awayTeam.team.abbreviation;

            if (thunderGame.status.type.completed) {
                todayGameMessage = `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)`;
            } else if (thunderGame.status.type.state === 'in') {
                todayGameMessage = `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (${thunderGame.status.type.detail})`;
            } else {
                // Format game time in Central time
                const gameDate = new Date(thunderGame.date);
                const centralTime = new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'America/Chicago'
                }).format(gameDate);
                
                todayGameMessage = `Thunder Game Today at ${centralTime} Central\n${awayAbbrev} @ ${homeAbbrev}`;
            }
        }

        // If no game today or to get the recent game, fetch schedule
        console.log('Fetching recent games...');
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

        let recentGameMessage = "";
        if (recentGame) {
            console.log('Found recent game:', recentGame);

            // Get the competition data
            const competition = recentGame.competitions[0];
            console.log('Competition data:', competition);

            // Get competitors array and log it
            const competitors = competition.competitors || [];
            console.log('Competitors array:', competitors);

            // Find home and away teams
            const homeTeam = competitors.find(team => team.homeAway === 'home') || {};
            const awayTeam = competitors.find(team => team.homeAway === 'away') || {};

            console.log('Raw home team:', homeTeam);
            console.log('Raw away team:', awayTeam);

            const gameDate = new Date(recentGame.date).toLocaleDateString();

            // Extract team data with fallbacks
            const homeAbbrev = homeTeam.team?.abbreviation || 'HOME';
            const awayAbbrev = awayTeam.team?.abbreviation || 'AWAY';
            const homeScore = homeTeam.score?.value || '0';
            const awayScore = awayTeam.score?.value || '0';

            console.log('Extracted data:', {
                homeAbbrev,
                awayAbbrev,
                homeScore,
                awayScore
            });

            recentGameMessage = `${awayAbbrev} ${awayScore} - ${homeAbbrev} ${homeScore} (Final)\n${gameDate}`;
        }

        // Return both messages separately instead of combining them
        return {
            hasGame: !!todayGameMessage,
            todayGame: todayGameMessage || "No Thunder game today",
            recentGame: recentGameMessage || "No recent game data available"
        };
    } catch (error) {
        console.error('Error with ESPN API:', error);
        console.error('Error stack:', error.stack);
        return {
            hasGame: false,
            todayGame: "Error fetching score. Check browser console for details.",
            recentGame: "Error fetching score. Check browser console for details."
        };
    }
} 