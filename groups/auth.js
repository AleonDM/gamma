// Проверка авторизации
document.addEventListener('DOMContentLoaded', function() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const teamCode = localStorage.getItem('teamCode');
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
        window.location.href = '../login/login.html';
        return;
    }
    
    if (teamCode === 'admin' && currentPage === '1.html') {
        window.location.href = 'admin.html';
        return;
    }
    
    if (teamCode !== 'admin' && currentPage === 'admin.html') {
        window.location.href = '1.html';
        return;
    }
}); 