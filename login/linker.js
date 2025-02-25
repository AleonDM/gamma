const teams = [
    {
        name: "Team spirit",
        page: "1.html"
    },
    {
        name: "Team 2",
        page: "2.html"
    },
    {
        name: "Team 3",
        page: "3.html"
    },
    {
        name: "Team 4",
        page: "4.html"
    },
    {
        name: "Team 5",
        page: "5.html"
    },
    {
        name: "Team 6",
        page: "6.html"
    },
    {
        name: "Team 7",
        page: "7.html"
    },
    {
        name: "Team 8",
        page: "8.html"
    },
    {
        name: "admin",
        page: "admin.html"
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
            localStorage.setItem('teamPage', team.page);
            
            window.location.href = '../groups/' + team.page;
        } else {
            alert('Неверное имя команды');
        }
    });
});

