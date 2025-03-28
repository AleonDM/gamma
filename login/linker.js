const teams = []

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const userCode = document.getElementById('username').value;
        
        // Проверка на администратора
        if (userCode === 'admin') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('teamName', 'Администратор');
            localStorage.setItem('teamCode', 'admin');
            localStorage.setItem('teamMembers', JSON.stringify([]));
            localStorage.setItem('IDs', '');
            window.location.href = '../groups/admin.html';
            return;
        }
        
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
            
            window.location.href = '../groups/1.html';
        } catch (error) {
            alert(error.message);
        }
    });
});