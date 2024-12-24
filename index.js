function toggleSidebar() {
    let button = document.getElementById('button')
    let sidebar = document.getElementById('bar')
    if (sidebar.style.display === 'none') {
        sidebar.style.display = 'block';
        sidebar.style.animation = 'open 0.4s ease-out forwards';
        sidebar.style.position = 'fixed';
    } else {
        sidebar.style.display = 'none';
        sidebar.classList.toggle("active") 
    }
}