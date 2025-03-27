document.addEventListener('DOMContentLoaded', () => {
    loadTournaments();
    loadTeamsForSelect();
    loadTeams();
    
    // Обработчик формы создания турнира
    document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tournamentData = {
            title: document.getElementById('title').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            team1: document.getElementById('team1Select').value,
            team2: document.getElementById('team2Select').value,
            status: document.getElementById('status').value,
            game: document.getElementById('game').value
        };

        try {
            const response = await fetch('/api/tournaments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tournamentData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании турнира');
            }

            alert('Турнир успешно создан!');
            loadTournaments();
            e.target.reset();
        } catch (error) {
            alert('Ошибка при создании турнира: ' + error.message);
        }
    });

    // Обработчик формы создания команды
    document.getElementById('teamForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const teamCode = document.getElementById('teamCode').value;
        
        // Проверяем формат кода
        if (!/^[a-zA-Z0-9]+$/.test(teamCode)) {
            alert('Код команды может содержать только буквы и цифры');
            return;
        }
        
        const teamData = {
            name: document.getElementById('teamName').value,
            code: teamCode,
            page: '1.html',
            members: document.getElementById('players').value.split(',').map(p => p.trim()),
            tournament_ids: ''
        };

        try {
            // Проверяем, не существует ли уже команда с таким кодом
            const checkResponse = await fetch('/api/teams');
            if (!checkResponse.ok) {
                throw new Error('Ошибка при проверке кода команды');
            }
            const existingTeams = await checkResponse.json();
            if (existingTeams.some(team => team.code === teamCode)) {
                alert('Команда с таким кодом уже существует. Пожалуйста, выберите другой код.');
                return;
            }

            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(teamData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании команды');
            }

            alert(`Команда успешно создана!\nКод для входа: ${teamCode}\nСохраните этот код, он потребуется для входа на страницу команды.`);
            e.target.reset();
            loadTeamsForSelect();
            loadTeams();
        } catch (error) {
            alert('Ошибка при создании команды: ' + error.message);
        }
    });
});

// Загрузка команд для выпадающих списков
async function loadTeamsForSelect() {
    try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке команд');
        }
        const teams = await response.json();
        
        // Обновляем списки выбора команд в форме создания турнира
        const team1Select = document.getElementById('team1Select');
        const team2Select = document.getElementById('team2Select');
        
        team1Select.innerHTML = '<option value="">Выберите команду</option>';
        team2Select.innerHTML = '<option value="">Выберите команду</option>';
        
        teams.forEach(team => {
            if (team.code !== 'admin') { // Исключаем админа из списка команд
                const option1 = document.createElement('option');
                option1.value = team.name;
                option1.textContent = team.name;
                team1Select.appendChild(option1);

                const option2 = document.createElement('option');
                option2.value = team.name;
                option2.textContent = team.name;
                team2Select.appendChild(option2);
            }
        });
    } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
    }
}

// Загрузка и отображение команд
async function loadTeams() {
    try {
        const [teamsResponse, tournamentsResponse] = await Promise.all([
            fetch('/api/teams'),
            fetch('/api/tournaments')
        ]);

        if (!teamsResponse.ok || !tournamentsResponse.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        const teams = await teamsResponse.json();
        const tournaments = await tournamentsResponse.json();
        
        const teamsList = document.getElementById('teamsList');
        teamsList.innerHTML = '';
        
        if (teams.length === 0) {
            teamsList.innerHTML = '<div class="team-box">Нет команд</div>';
            return;
        }

        teams.forEach(team => {
            if (team.code === 'admin') return; // Пропускаем админа

            // Находим турниры в которых участвует команда
            const teamTournaments = tournaments.filter(t => 
                t.team1 === team.name || t.team2 === team.name
            );

            const teamElement = document.createElement('div');
            teamElement.className = 'team-box';
            teamElement.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="team-code">Код для входа: ${team.code}</div>
                <div class="team-members">Участники: ${team.members.join(', ')}</div>
                <div class="team-tournaments">
                    <strong>Турниры:</strong>
                    ${teamTournaments.length > 0 
                        ? teamTournaments.map(t => `<div>${t.title} (${t.date} ${t.time})</div>`).join('')
                        : '<div>Не участвует в турнирах</div>'
                    }
                </div>
                <button onclick="deleteTeam('${team.id}')" class="delete-btn" style="margin-top: 10px;">Удалить команду</button>
            `;
            teamsList.appendChild(teamElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке команд:', error);
        document.getElementById('teamsList').innerHTML = '<div class="team-box">Ошибка при загрузке команд</div>';
    }
}

// Загрузка списка турниров
async function loadTournaments() {
    try {
        const response = await fetch('/api/tournaments');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке турниров');
        }
        const tournaments = await response.json();
        
        // Обновляем список турниров на странице
        const tournamentsList = document.getElementById('tournamentsList');
        tournamentsList.innerHTML = '';
        
        if (tournaments.length === 0) {
            tournamentsList.innerHTML = '<div class="tournament-box">Нет турниров</div>';
            return;
        }

        tournaments.forEach(tournament => {
            const tournamentElement = document.createElement('div');
            tournamentElement.className = 'tournament-box';
            tournamentElement.innerHTML = `
                <div class="tournament-status">${tournament.status}</div>
                <div class="tournament-date">${tournament.date} ${tournament.time}</div>
                <div class="tournament-title">${tournament.title} <span class="tournament-game">[${tournament.game}]</span></div>
                <div class="tournament-teams">
                    <div class="team">${tournament.team1}</div>
                    <div class="vs">VS</div>
                    <div class="team">${tournament.team2}</div>
                </div>
                <div style="margin-top: 15px;">
                    <select onchange="updateStatus(${tournament.id}, this.value)">
                        <option value="Запланирован" ${tournament.status === 'Запланирован' ? 'selected' : ''}>Запланирован</option>
                        <option value="Идёт" ${tournament.status === 'Идёт' ? 'selected' : ''}>Идёт</option>
                        <option value="Окончен" ${tournament.status === 'Окончен' ? 'selected' : ''}>Окончен</option>
                        <option value="Перенесён" ${tournament.status === 'Перенесён' ? 'selected' : ''}>Перенесён</option>
                        <option value="Отменён" ${tournament.status === 'Отменён' ? 'selected' : ''}>Отменён</option>
                    </select>
                    <button onclick="deleteTournamentById(${tournament.id})" class="delete-btn" style="margin-left: 10px;">Удалить</button>
                </div>
            `;
            tournamentsList.appendChild(tournamentElement);
        });
    } catch (error) {
        console.error('Ошибка при загрузке турниров:', error);
        tournamentsList.innerHTML = '<div class="tournament-box">Ошибка при загрузке турниров</div>';
    }
}

// Функция обновления статуса турнира
async function updateStatus(id, status) {
    try {
        const response = await fetch(`/api/tournaments/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении статуса');
        }

        loadTournaments();
    } catch (error) {
        alert('Ошибка при обновлении статуса: ' + error.message);
    }
}

// Функция удаления турнира
async function deleteTournamentById(id) {
    if (!confirm('Вы уверены, что хотите удалить этот турнир?')) {
        return;
    }

    try {
        const response = await fetch(`/api/tournaments/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении турнира');
        }

        loadTournaments();
        loadTeams(); // Обновляем список команд, так как турниры могли измениться
    } catch (error) {
        alert('Ошибка при удалении турнира: ' + error.message);
    }
}

// Функция удаления команды
async function deleteTeam(id) {
    if (!confirm('Вы уверены, что хотите удалить эту команду?')) {
        return;
    }

    try {
        const response = await fetch(`/api/teams/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Ошибка при удалении команды');
        }

        loadTeams();
        loadTeamsForSelect();
    } catch (error) {
        alert('Ошибка при удалении команды: ' + error.message);
    }
} 