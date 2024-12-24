function toggleSidebar() {
    let button = document.getElementById('button');
    let sidebar = document.getElementById('bar');
    
    // Переключаем класс для вращения кнопки
    button.classList.toggle('rotated');
    
    if (sidebar.style.display === 'none' || !sidebar.style.display) {
        sidebar.style.display = 'block';
        sidebar.style.animation = 'open 0.4s ease-out forwards';
    } else {
        sidebar.style.animation = 'close 0.4s ease-out forwards';
        setTimeout(() => {
            sidebar.style.display = 'none';
        }, 400);
    }
}