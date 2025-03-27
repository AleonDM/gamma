const teams = []

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const userCode = document.getElementById('username').value;
        
        try {
            const response = await fetch('/api/teams/code/' + userCode);
            if (!response.ok) {
                throw new Error('Неверный код команды');
            }
            
            const team = await response.json();
            if (!team) {
                alert('Неверный код команды');
                return;
            }

            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('teamName', team.name);
            localStorage.setItem('teamCode', team.code);
            localStorage.setItem('teamMembers', JSON.stringify(team.members));
            localStorage.setItem('IDs', team.tournament_ids);
            
            // Проверяем является ли пользователь админом
            if (team.code === 'admin') {
                window.location.href = '../groups/admin.html';
            } else {
                window.location.href = '../groups/1.html';
            }
        } catch (error) {
            alert(error.message);
        }
    });
});