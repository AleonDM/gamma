function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('teamName');
    localStorage.removeItem('teamPage');
    window.location.href = '../login/login.html';
}