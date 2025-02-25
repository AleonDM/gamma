document.addEventListener('DOMContentLoaded', function() {
    const teamName = localStorage.getItem('teamName');
    if (teamName) {
        document.getElementById('teamTitle').textContent = teamName;
        document.title = teamName;
    }
});