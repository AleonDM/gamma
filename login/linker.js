const teams = [
    {
        name: "spirit",
        code: "team1",
        page: "1.html"
    },
    {
        name: "Team 2",
        code: "team2",
        page: "2.html"
    },
    {
        name: "Team 3",
        code: "team3",
        page: "3.html"
    },
    {
        name: "Team 4",
        code: "team4",
        page: "4.html"
    },
    {
        name: "Team 5",
        code: "team5",
        page: "5.html"
    },
    {
        name: "Team 6",
        code: "team6",
        page: "6.html"
    },
    {
        name: "Team 7",
        code: "team7",
        page: "7.html"
    },
    {
        name: "Team 8",
        code: "team8",
        page: "8.html"
    },
    {
        name: "admin",
        code: "admin",
        page: "admin.html"
    },
    
]

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userCode = document.getElementById('username').value;
        
        const team = teams.find(team => team.code === userCode);
        
        if (team) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('teamName', team.name);
            localStorage.setItem('teamPage', team.page);
            
            window.location.href = '../groups/' + team.page;
        } else {
            alert('Неверный код команды');
        }
    });
});

