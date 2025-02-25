function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('teamName');
    window.location.href = '../login/login.html';
}