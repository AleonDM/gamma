const teams = [
    {
        name: "Kainozoy",
        code: "team1",
        page: "1.html",
        members: ["Игорь"],
        tournirsIds: 0
    },
    {
        name: "Mezozoy",
        code: "team2",
        page: "2.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: [1,2]
    },
    {
        name: "Team 3",
        code: "team3",
        page: "3.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "Team 4",
        code: "team4",
        page: "4.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "Team 5",
        code: "team5",
        page: "5.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "Team 6",
        code: "team6",
        page: "6.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "Team 7",
        code: "team7",
        page: "7.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "Team 8",
        code: "team8",
        page: "8.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    {
        name: "admin",
        code: "admin",
        page: "admin.html",
        members: ["Игорь", "Дима", "Давид"],
        tournirsIds: 1
    },
    
]

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const userCode = document.getElementById('username').value;
        
        const team = teams.find(team => team.code === userCode);
        if (!team) {
            alert('Неверный код команды');
            return;
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('teamName', team.name);
        localStorage.setItem('teamPage', team.page);
        localStorage.setItem('teamMembers', JSON.stringify(team.members));
        localStorage.setItem('IDs', JSON.stringify(team.tournirsIds));
        
        window.location.href = '../groups/' + team.page;
    });
});