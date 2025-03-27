function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('teamName');
    localStorage.removeItem('teamCode');
    localStorage.removeItem('teamMembers');
    localStorage.removeItem('IDs');
    window.location.href = '../login/login.html';
}