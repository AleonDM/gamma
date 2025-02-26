document.addEventListener('DOMContentLoaded', function() {
    const teamName = localStorage.getItem('teamName');
    const teamMembers = localStorage.getItem('teamMembers');
    
    const teamTitleElements = document.querySelectorAll('#teamTitle, #teamTitleMobile');
    teamTitleElements.forEach(element => {
        if (element && teamName) {
            element.textContent = teamName;
            document.title = teamName;
        }
    });

    const membersList = document.getElementById('membersList');
    if (membersList && teamMembers) {
        let members = [];
        try {
            members = JSON.parse(teamMembers);
        } catch (e) {
            members = [teamMembers];
        }

        membersList.innerHTML = '';

        members.forEach(member => {
            const memberList = document.createElement('div');
            memberList.className = 'membersList';
            
            const memberCard = document.createElement('div');
            memberCard.className = 'memberCard';
            memberCard.textContent = member;
            
            memberList.appendChild(memberCard);
            membersList.appendChild(memberList);
        });
    }

    const memberListMobile = document.getElementById('memberListMobile');
    if (memberListMobile && teamMembers) {
        let members = [];
        try {
            members = JSON.parse(teamMembers);
        } catch (e){
            members = [teamMembers];
        }

        memberListMobile.innerHTML = '';

        members.forEach(member => {
            const memberList = document.createElement('div');
            memberList.className = 'member-list';
            
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.textContent = member;
            
            memberList.appendChild(memberItem);
            memberListMobile.appendChild(memberList);
        });
    }
});