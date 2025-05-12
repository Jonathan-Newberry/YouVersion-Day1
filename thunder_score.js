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
                return `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (Final)`;
            } else if (thunderGame.status.type.state === 'in') {
                return `${awayTeam.team.abbreviation} ${awayTeam.score} - ${homeTeam.team.abbreviation} ${homeTeam.score} (${thunderGame.status.type.detail})`;
            } else {
                return `${awayTeam.team.abbreviation} vs ${homeTeam.team.abbreviation} - Game starts at ${thunderGame.status.type.shortDetail}`;
            }
        }
        console.log('No Thunder game found in ESPN data');
        return "No Thunder game scheduled for today";
    } catch (error) {
        console.error('Error with ESPN API:', error);
        return "Error fetching score. Check browser console for details.";
    }
}

// Export the function so it can be used in other files
module.exports = { getThunderScore }; 