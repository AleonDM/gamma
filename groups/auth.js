// Проверка авторизации
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const teamName = localStorage.getItem('teamName');
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = '../login/login.html';
        return;
    }
    
    if (teamName.startsWith('Team ')) {
        const teamNumber = teamName.split(' ')[1];
        const allowedPage = teamNumber + '.html';
        
        if (currentPage !== allowedPage && teamName !== 'admin') {
            window.location.href = teamNumber + '.html';
        }
    } else if (teamName === 'admin') {
        return;
    } else {
        window.location.href = '../login/login.html';
    }
}); 