// Проверка авторизации
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const teamName = localStorage.getItem('teamName');
    const teamPage = localStorage.getItem('teamPage');
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = '../login/login.html';
        return;
    }
    
    if (teamName === 'admin') {
        return;
    } else if (teamPage) {
        if (currentPage !== teamPage) {
            window.location.href = teamPage;
        }
    } else {
        window.location.href = '../login/login.html';
    }
}); 