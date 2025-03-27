const statuses = ['Запланирован', 'Идёт', 'Окончен', 'Перенесён', 'Отменён']

const tournirs = [
]

document.addEventListener('DOMContentLoaded', function() {
    const teamTournamentIds = localStorage.getItem('IDs');
    
    if (!teamTournamentIds) return;

    let tournamentIds;
    try {
        tournamentIds = JSON.parse(teamTournamentIds);
        if (!Array.isArray(tournamentIds)) {
            tournamentIds = [parseInt(teamTournamentIds)];
        }
    } catch (e) {
        tournamentIds = [parseInt(teamTournamentIds)];
    }

    const teamTournaments = tournirs.filter(tournament => 
        tournamentIds.includes(tournament.id)
    );

    const tournamentsListPC = document.getElementById('tournamentsList');
    if (tournamentsListPC) {
        tournamentsListPC.innerHTML = '';

        if (teamTournaments.length === 0) {
            tournamentsListPC.innerHTML = '<div class="no-tournaments">Нет предстоящих турниров</div>';
        } else {
            teamTournaments.forEach(tournament => {
                const tournamentBox = document.createElement('div');
                tournamentBox.className = 'tournament-box';
                tournamentBox.innerHTML = `
                    <div class="tournament-status">${tournament.status}</div>
                    <div class="tournament-date">${tournament.date}</div>
                    <div class="tournament-time">${tournament.time}</div>
                    <div class="tournament-title">${tournament.title}</div>
                    <div class="tournament-teams">
                        <div class="team">${tournament.team1}</div>
                        <div class="vs">VS</div>
                        <div class="team">${tournament.team2}</div>
                    </div>
                `;
                tournamentsListPC.appendChild(tournamentBox);
            });
        }
    }

    const tournamentsSectionMobile = document.querySelector('.mainmobile .tournaments-section');
    if (tournamentsSectionMobile) {
        tournamentsSectionMobile.innerHTML = '<h2 class="members-title">Турниры</h2>';

        if (teamTournaments.length === 0) {
            const noTournaments = document.createElement('div');
            noTournaments.className = 'tournament-box';
            noTournaments.innerHTML = '<div class="no-tournaments">Нет предстоящих турниров</div>';
            tournamentsSectionMobile.appendChild(noTournaments);
        } else {
            teamTournaments.forEach(tournament => {
                const tournamentBox = document.createElement('div');
                tournamentBox.className = 'tournament-box';
                tournamentBox.innerHTML = `
                    <div class="tournament-status">${tournament.status}</div>
                    <div class="tournament-date">${tournament.date}</div>
                    <div class="tournament-time">${tournament.time}</div>
                    <div class="tournament-title">${tournament.title}</div>
                    <div class="tournament-teams mobile">
                        <div class="team">${tournament.team1}</div>
                        <div class="vs">VS</div>
                        <div class="team">${tournament.team2}</div>
                    </div>
                `;
                tournamentsSectionMobile.appendChild(tournamentBox);
            });
        }
    }
});