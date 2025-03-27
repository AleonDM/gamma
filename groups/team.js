document.addEventListener('DOMContentLoaded', async function() {
    // Проверяем аутентификацию
    if (!localStorage.getItem('isAuthenticated')) {
        window.location.href = '../login/login.html';
        return;
    }

    // Получаем код команды из url
    const teamCode = localStorage.getItem('teamCode');
    if (!teamCode) {
        alert('Ошибка: код команды не найден');
        window.location.href = '../login/login.html';
        return;
    }

    // Если это админ перенаправляем на админ-панель
    if (teamCode === 'admin') {
        window.location.href = 'admin.html';
        return;
    }

    try {
        // Загружаем информацию о команде
        const response = await fetch(`/api/teams/code/${teamCode}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке информации о команде');
        }
        const team = await response.json();

        // Обновляем заголовок
        document.getElementById('teamTitle').textContent = team.name;
        document.getElementById('teamTitleMobile').textContent = team.name;
        document.title = team.name; // Обновляем заголовок страницы

        // Обновляем список участников для десктопки
        const membersList = document.getElementById('membersList');
        membersList.innerHTML = '';
        
        team.members.forEach(member => {
            const memberList = document.createElement('div');
            memberList.className = 'membersList';
            
            const memberCard = document.createElement('div');
            memberCard.className = 'memberCard';
            memberCard.textContent = member;
            
            memberList.appendChild(memberCard);
            membersList.appendChild(memberList);
        });

        // Обновляем список участников для мобилки
        const memberListMobile = document.getElementById('memberListMobile');
        memberListMobile.innerHTML = '';
        
        team.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.textContent = member;
            
            memberListMobile.appendChild(memberItem);
        });

        // Загружаем все турниры
        const tournamentsResponse = await fetch('/api/tournaments');
        if (!tournamentsResponse.ok) {
            throw new Error('Ошибка при загрузке турниров');
        }
        const allTournaments = await tournamentsResponse.json();

        // Фильтруем турниры, в которых участвует команда
        const teamTournaments = allTournaments.filter(tournament => 
            tournament.team1 === team.name || tournament.team2 === team.name
        );

        // Обновляем список турниров для десктопки
        const tournamentsList = document.getElementById('tournamentsList');
        tournamentsList.innerHTML = '';

        if (teamTournaments.length === 0) {
            tournamentsList.innerHTML = '<div class="no-tournaments">Нет предстоящих турниров</div>';
        } else {
            teamTournaments.forEach(tournament => {
                const tournamentBox = document.createElement('div');
                tournamentBox.className = 'tournament-box';
                tournamentBox.innerHTML = `
                    <div class="tournament-status">${tournament.status}</div>
                    <div class="tournament-date">${tournament.date} ${tournament.time}</div>
                    <div class="tournament-title">${tournament.title} <span class="tournament-game">[${tournament.game}]</span></div>
                    <div class="tournament-teams">
                        <div class="team">${tournament.team1}</div>
                        <div class="vs">VS</div>
                        <div class="team">${tournament.team2}</div>
                    </div>
                `;
                tournamentsList.appendChild(tournamentBox);
            });
        }

        // Обновляем список турниров для мобилки
        const tournamentsListMobile = document.getElementById('tournamentsListMobile');
        tournamentsListMobile.innerHTML = '';

        if (teamTournaments.length === 0) {
            tournamentsListMobile.innerHTML = '<div class="no-tournaments">Нет предстоящих турниров</div>';
        } else {
            teamTournaments.forEach(tournament => {
                const tournamentBox = document.createElement('div');
                tournamentBox.className = 'tournament-box';
                tournamentBox.innerHTML = `
                    <div class="tournament-status">${tournament.status}</div>
                    <div class="tournament-date">${tournament.date} ${tournament.time}</div>
                    <div class="tournament-title">${tournament.title} <span class="tournament-game">[${tournament.game}]</span></div>
                    <div class="tournament-teams mobile">
                        <div class="team">${tournament.team1}</div>
                        <div class="vs">VS</div>
                        <div class="team">${tournament.team2}</div>
                    </div>
                `;
                tournamentsListMobile.appendChild(tournamentBox);
            });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        console.error('Ошибка при загрузке информации о команде:', error);
    }
}); 