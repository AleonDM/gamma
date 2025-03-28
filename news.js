// Загрузка новостей в сайдбар
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию администратора
    checkAdminAuth();
    
    // Загружаем новости
    loadSidebarNews();
    
    // Добавляем кнопку авторизации администратора
    addAdminLoginButton();
    
    // Добавляем кнопку выхода из аккаунта администратора, если пользователь авторизован
    addAdminLogoutButton();
});

// Функция для проверки авторизации администратора
function checkAdminAuth() {
    const adminCode = localStorage.getItem('teamCode');
    if (adminCode === 'admin') {
        console.log('Авторизован как администратор');
    }
}

// Функция для добавления кнопки авторизации администратора
function addAdminLoginButton() {
    // Находим контейнер для сайдбара
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Проверяем, существует ли уже кнопка
    if (sidebar.querySelector('.admin-login-button')) return;
    
    // Создаем кнопку авторизации
    const loginButton = document.createElement('div');
    loginButton.className = 'admin-login-button';
    loginButton.innerHTML = 'Вход для администратора';
    loginButton.style.padding = '10px';
    loginButton.style.margin = '20px 0';
    loginButton.style.textAlign = 'center';
    loginButton.style.cursor = 'pointer';
    loginButton.style.fontSize = '18pt';
    loginButton.style.background = 'rgba(255, 255, 255, 0.1)';
    loginButton.style.borderRadius = '8px';
    loginButton.style.color = '#fff';
    
    // Добавляем обработчик клика
    loginButton.addEventListener('click', function() {
        showAdminLoginModal();
    });
    
    // Добавляем кнопку в конец сайдбара
    sidebar.appendChild(loginButton);
}

// Функция для отображения модального окна авторизации
function showAdminLoginModal() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.id = 'adminLoginModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Создаем содержимое модального окна
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '400px';
    modalContent.style.color = '#333';
    
    // Заголовок модального окна
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Вход для администратора';
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.color = '#1e3c72';
    modalContent.appendChild(modalTitle);
    
    // Форма для авторизации
    const form = document.createElement('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const codeInput = document.getElementById('adminCode');
        const code = codeInput.value.trim();
        
        if (code === 'admin') {
            localStorage.setItem('teamCode', 'admin');
            alert('Вы успешно авторизованы как администратор');
            modal.remove();
            // Перезагружаем страницу для обновления интерфейса
            window.location.reload();
        } else {
            alert('Неверный код администратора');
        }
    });
    
    // Поле для ввода кода
    const codeGroup = document.createElement('div');
    codeGroup.style.marginBottom = '20px';
    
    const codeLabel = document.createElement('label');
    codeLabel.textContent = 'Код администратора:';
    codeLabel.setAttribute('for', 'adminCode');
    codeLabel.style.display = 'block';
    codeLabel.style.marginBottom = '5px';
    codeGroup.appendChild(codeLabel);
    
    const codeInput = document.createElement('input');
    codeInput.type = 'password';
    codeInput.id = 'adminCode';
    codeInput.style.width = '100%';
    codeInput.style.padding = '10px';
    codeInput.style.boxSizing = 'border-box';
    codeInput.required = true;
    codeGroup.appendChild(codeInput);
    
    form.appendChild(codeGroup);
    
    // Кнопки действий
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'space-between';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f0f0f0';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        modal.remove();
    });
    buttonGroup.appendChild(cancelButton);
    
    const loginButton = document.createElement('button');
    loginButton.type = 'submit';
    loginButton.textContent = 'Войти';
    loginButton.style.padding = '10px 20px';
    loginButton.style.backgroundColor = '#1e3c72';
    loginButton.style.color = '#fff';
    loginButton.style.border = 'none';
    loginButton.style.borderRadius = '5px';
    loginButton.style.cursor = 'pointer';
    buttonGroup.appendChild(loginButton);
    
    form.appendChild(buttonGroup);
    
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Добавляем функцию выхода из аккаунта администратора
function addAdminLogoutButton() {
    if (localStorage.getItem('teamCode') !== 'admin') return;
    
    // Находим контейнер для сайдбара
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Проверяем, существует ли уже кнопка выхода
    if (sidebar.querySelector('.admin-logout-button')) return;
    
    // Создаем кнопку выхода
    const logoutButton = document.createElement('div');
    logoutButton.className = 'admin-logout-button';
    logoutButton.innerHTML = 'Выйти из аккаунта администратора';
    logoutButton.style.padding = '10px';
    logoutButton.style.margin = '20px 0';
    logoutButton.style.textAlign = 'center';
    logoutButton.style.cursor = 'pointer';
    logoutButton.style.fontSize = '18pt';
    logoutButton.style.background = 'rgba(255, 50, 50, 0.2)';
    logoutButton.style.borderRadius = '8px';
    logoutButton.style.color = '#fff';
    
    // Добавляем обработчик клика
    logoutButton.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите выйти из аккаунта администратора?')) {
            localStorage.removeItem('teamCode');
            alert('Вы вышли из аккаунта администратора');
            window.location.reload();
        }
    });
    
    // Добавляем кнопку в конец сайдбара
    sidebar.appendChild(logoutButton);
}

// Функция для загрузки новостей в сайдбар
async function loadSidebarNews(category = 'all') {
    try {
        // Определяем текущую страницу для выбора правильной категории
        const currentPage = window.location.pathname.split('/').pop();
        const isCybersport = currentPage.includes('cybersport');
        
        // Определяем категорию на основе текущей страницы
        const newsCategory = isCybersport ? 'cybersport' : 'sport';
        
        // Получаем новости
        const response = await fetch(`/api/news?category=${category === 'all' ? newsCategory : category}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке новостей');
        }
        
        const news = await response.json();
        
        // Находим контейнер для новостей в сайдбаре
        const newsSidebar = document.querySelector('.NEWSsidebar');
        if (!newsSidebar) return;
        
        // Очищаем контейнер, сохраняя только заголовок
        const newsTitle = newsSidebar.querySelector('.NEWSsidebartitle');
        newsSidebar.innerHTML = '';
        newsSidebar.appendChild(newsTitle);
        
        // Добавляем новости
        if (news.length === 0) {
            const emptyNews = document.createElement('div');
            emptyNews.className = 'NEWSsidebarnews';
            emptyNews.innerHTML = '<div id="header">Нет новостей</div>';
            newsSidebar.appendChild(emptyNews);
        } else {
            news.forEach(item => {
                const newsElement = document.createElement('div');
                newsElement.className = 'NEWSsidebarnews';
                newsElement.innerHTML = `
                    <div id="dates">${item.date}</div>
                    <div id="header">${item.title}</div>
                    ${item.content ? `<div id="text">${item.content}</div>` : ''}
                `;
                
                // Добавляем полную информацию в атрибуты для администратора
                if (localStorage.getItem('teamCode') === 'admin') {
                    newsElement.dataset.newsId = item.id;
                    newsElement.dataset.newsDate = item.date;
                    newsElement.dataset.newsTitle = item.title;
                    newsElement.dataset.newsContent = item.content || '';
                    newsElement.dataset.newsCategory = item.category;
                    
                    // Добавляем возможность редактирования для администратора
                    newsElement.style.cursor = 'pointer';
                    newsElement.addEventListener('click', function() {
                        showNewsEditModal(this.dataset);
                    });
                }
                
                newsSidebar.appendChild(newsElement);
            });
        }
        
        // Добавляем кнопку для добавления новой новости для администратора
        if (localStorage.getItem('teamCode') === 'admin') {
            const addButton = document.createElement('div');
            addButton.className = 'news-add-button';
            addButton.innerHTML = '<center>+ Добавить новость</center>';
            addButton.style.cursor = 'pointer';
            addButton.style.background = 'rgba(255, 255, 255, 0.1)';
            addButton.style.padding = '10px';
            addButton.style.borderRadius = '8px';
            addButton.style.marginTop = '15px';
            addButton.style.color = '#fff';
            addButton.addEventListener('click', function() {
                showNewsAddModal();
            });
            newsSidebar.appendChild(addButton);
        }
    } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
    }
}

// Функция для отображения модального окна добавления новости
function showNewsAddModal() {
    createNewsModal({
        title: 'Добавление новости',
        date: getCurrentDate(),
        content: '',
        category: window.location.pathname.includes('cybersport') ? 'cybersport' : 'sport',
        action: 'add'
    });
}

// Функция для отображения модального окна редактирования новости
function showNewsEditModal(newsData) {
    createNewsModal({
        title: 'Редактирование новости',
        id: newsData.newsId,
        date: newsData.newsDate,
        newsTitle: newsData.newsTitle,
        content: newsData.newsContent,
        category: newsData.newsCategory,
        action: 'edit'
    });
}

// Функция для создания модального окна
function createNewsModal(data) {
    // Проверяем, существует ли уже модальное окно
    let modal = document.getElementById('newsModal');
    if (modal) {
        modal.remove();
    }
    
    // Создаем новое модальное окно
    modal = document.createElement('div');
    modal.id = 'newsModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    // Создаем содержимое модального окна
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '10px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '500px';
    modalContent.style.color = '#333';
    
    // Заголовок модального окна
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = data.title;
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.color = '#1e3c72';
    modalContent.appendChild(modalTitle);
    
    // Форма для добавления/редактирования новости
    const form = document.createElement('form');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('newsDate').value,
            title: document.getElementById('newsTitle').value,
            content: document.getElementById('newsContent').value,
            category: document.getElementById('newsCategory').value
        };
        
        if (data.action === 'edit') {
            await updateNewsItem(data.id, formData);
        } else {
            await addNewsItem(formData);
        }
        
        // Закрываем модальное окно и обновляем новости
        modal.remove();
        loadSidebarNews();
    });
    
    // Поле для даты
    const dateGroup = document.createElement('div');
    dateGroup.style.marginBottom = '15px';
    
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Дата:';
    dateLabel.setAttribute('for', 'newsDate');
    dateLabel.style.display = 'block';
    dateLabel.style.marginBottom = '5px';
    dateGroup.appendChild(dateLabel);
    
    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.id = 'newsDate';
    dateInput.value = data.date || '';
    dateInput.style.width = '100%';
    dateInput.style.padding = '8px';
    dateInput.style.boxSizing = 'border-box';
    dateInput.required = true;
    dateGroup.appendChild(dateInput);
    
    form.appendChild(dateGroup);
    
    // Поле для заголовка
    const titleGroup = document.createElement('div');
    titleGroup.style.marginBottom = '15px';
    
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Заголовок:';
    titleLabel.setAttribute('for', 'newsTitle');
    titleLabel.style.display = 'block';
    titleLabel.style.marginBottom = '5px';
    titleGroup.appendChild(titleLabel);
    
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'newsTitle';
    titleInput.value = data.newsTitle || '';
    titleInput.style.width = '100%';
    titleInput.style.padding = '8px';
    titleInput.style.boxSizing = 'border-box';
    titleInput.required = true;
    titleGroup.appendChild(titleInput);
    
    form.appendChild(titleGroup);
    
    // Поле для контента
    const contentGroup = document.createElement('div');
    contentGroup.style.marginBottom = '15px';
    
    const contentLabel = document.createElement('label');
    contentLabel.textContent = 'Содержание (необязательно):';
    contentLabel.setAttribute('for', 'newsContent');
    contentLabel.style.display = 'block';
    contentLabel.style.marginBottom = '5px';
    contentGroup.appendChild(contentLabel);
    
    const contentInput = document.createElement('textarea');
    contentInput.id = 'newsContent';
    contentInput.value = data.content || '';
    contentInput.style.width = '100%';
    contentInput.style.padding = '8px';
    contentInput.style.boxSizing = 'border-box';
    contentInput.style.minHeight = '100px';
    contentGroup.appendChild(contentInput);
    
    form.appendChild(contentGroup);
    
    // Поле для категории
    const categoryGroup = document.createElement('div');
    categoryGroup.style.marginBottom = '20px';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Категория:';
    categoryLabel.setAttribute('for', 'newsCategory');
    categoryLabel.style.display = 'block';
    categoryLabel.style.marginBottom = '5px';
    categoryGroup.appendChild(categoryLabel);
    
    const categorySelect = document.createElement('select');
    categorySelect.id = 'newsCategory';
    categorySelect.style.width = '100%';
    categorySelect.style.padding = '8px';
    categorySelect.style.boxSizing = 'border-box';
    
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Все';
    allOption.selected = data.category === 'all';
    categorySelect.appendChild(allOption);
    
    const sportOption = document.createElement('option');
    sportOption.value = 'sport';
    sportOption.textContent = 'Спорт';
    sportOption.selected = data.category === 'sport';
    categorySelect.appendChild(sportOption);
    
    const cybersportOption = document.createElement('option');
    cybersportOption.value = 'cybersport';
    cybersportOption.textContent = 'Киберспорт';
    cybersportOption.selected = data.category === 'cybersport';
    categorySelect.appendChild(cybersportOption);
    
    categoryGroup.appendChild(categorySelect);
    
    form.appendChild(categoryGroup);
    
    // Кнопки действий
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.justifyContent = 'space-between';
    
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.backgroundColor = '#f0f0f0';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', function() {
        modal.remove();
    });
    buttonGroup.appendChild(cancelButton);
    
    const actionButton = document.createElement('button');
    actionButton.type = 'submit';
    actionButton.textContent = data.action === 'edit' ? 'Обновить' : 'Добавить';
    actionButton.style.padding = '10px 20px';
    actionButton.style.backgroundColor = '#1e3c72';
    actionButton.style.color = '#fff';
    actionButton.style.border = 'none';
    actionButton.style.borderRadius = '5px';
    actionButton.style.cursor = 'pointer';
    buttonGroup.appendChild(actionButton);
    
    // Кнопка удаления для редактирования
    if (data.action === 'edit') {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Удалить';
        deleteButton.style.padding = '10px 20px';
        deleteButton.style.backgroundColor = '#d32f2f';
        deleteButton.style.color = '#fff';
        deleteButton.style.border = 'none';
        deleteButton.style.borderRadius = '5px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.addEventListener('click', async function() {
            if (confirm('Вы уверены, что хотите удалить эту новость?')) {
                await deleteNewsItem(data.id);
                modal.remove();
                loadSidebarNews();
            }
        });
        buttonGroup.appendChild(deleteButton);
    }
    
    form.appendChild(buttonGroup);
    
    modalContent.appendChild(form);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Функция для добавления новости
async function addNewsItem(data) {
    try {
        const response = await fetch('/api/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при добавлении новости');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при добавлении новости:', error);
        alert('Ошибка при добавлении новости');
    }
}

// Функция для обновления новости
async function updateNewsItem(id, data) {
    try {
        const response = await fetch(`/api/news/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при обновлении новости');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при обновлении новости:', error);
        alert('Ошибка при обновлении новости');
    }
}

// Функция для удаления новости
async function deleteNewsItem(id) {
    try {
        const response = await fetch(`/api/news/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при удалении новости');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при удалении новости:', error);
        alert('Ошибка при удалении новости');
    }
}

// Функция для получения текущей даты в формате ДД.ММ.ГГГГ
function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    return `${day}.${month}.${year}`;
} 