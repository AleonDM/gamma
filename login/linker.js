const teams = [
    {
        name: "Team 1",
    },
    {
        name: "Team 2",
    },
    {
        name: "Team 3",
    },
    {
        name: "Team 4",
    },
    {
        name: "Team 5",
    },
    {
        name: "Team 6",
    },
    {
        name: "Team 7",
    },
    {
        name: "Team 8",
    },
    {
        name: "admin",
    },
    
]

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        
        const team = teams.find(team => team.name === username);
        
        if (team) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('teamName', username);
            
            if (username.startsWith('Team ')) {
                const teamNumber = username.split(' ')[1];
                window.location.href = '../groups/' + teamNumber + '.html';
            } else if (username === 'admin') {
                window.location.href = '../groups/admin.html';
            }
        } else {
            alert('Неверное имя команды');
        }
    });
});

