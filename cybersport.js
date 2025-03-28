document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для пунктов меню
    setupDisciplineHandlers();
    
    // По умолчанию показываем все турниры и активируем пункт "Все дисциплины"
    document.querySelector('.sidebar #links[data-game="all"]').classList.add('active');
    document.querySelector('.bar #elem[data-game="all"]').classList.add('active');
    loadTournaments('all');
});

// Настройка обработчиков событий для пунктов меню
function setupDisciplineHandlers() {
    // Получаем ссылки на все дисциплины в сайдбаре для десктопа
    const desktopLinks = document.querySelectorAll('.sidebar #links[data-game]');
    
    // Добавляем обработчики для десктопной версии
    desktopLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function() {
            // Убираем активный класс со всех ссылок
            desktopLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            const game = this.getAttribute('data-game');
            loadTournaments(game);
        });
    });
    
    // Добавляем обработчики для мобильной версии
    const mobileLinks = document.querySelectorAll('.bar #elem[data-game]');
    mobileLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function() {
            // Убираем активный класс со всех ссылок
            mobileLinks.forEach(l => l.classList.remove('active'));
            // Добавляем активный класс текущей ссылке
            this.classList.add('active');
            
            const game = this.getAttribute('data-game');
            loadTournaments(game);
            // Если есть функция закрытия сайдбара, вызываем её
            if (typeof toggleSidebar === 'function') {
                toggleSidebar();
            }
        });
    });
}

// Загрузка и отображение турниров по выбранной дисциплине
async function loadTournaments(discipline) {
    try {
        // Получаем данные о турнирах
        const response = await fetch('/api/tournaments');
        if (!response.ok) {
            throw new Error('Ошибка при загрузке турниров');
        }
        const tournaments = await response.json();
        
        // Группировка и сортировка турниров
        tournaments.sort((a, b) => {
            // Приоритет статусов (от высшего к низшему)
            const statusPriority = {
                'Идёт': 0,
                'Запланирован': 1,
                'Перенесён': 2,
                'Окончен': 3,
                'Отменён': 4
            };
            
            // Сначала сортируем по приоритету статуса
            const statusDiff = statusPriority[a.status] - statusPriority[b.status];
            if (statusDiff !== 0) return statusDiff;
            
            // Если статусы одинаковые, сортируем по дате (от новых к старым)
            const dateA = parseTournamentDate(a.date, a.time);
            const dateB = parseTournamentDate(b.date, b.time);
            return dateB - dateA;
        });
        
        // Фильтруем турниры по дисциплине, если не "all"
        const filteredTournaments = discipline === 'all' 
            ? tournaments 
            : tournaments.filter(t => t.game === discipline);
        
        // Получаем контейнеры для отображения
        const desktopContainer = document.querySelector('.maintext');
        const mobileContainer = document.querySelector('.mainmobile');
        
        // Очищаем контейнеры перед добавлением нового содержимого
        desktopContainer.innerHTML = '';
        mobileContainer.innerHTML = '';
        
        // Создаем обертку для центрирования контента
        const desktopWrapper = document.createElement('div');
        desktopWrapper.style.width = '100%';
        desktopWrapper.style.display = 'flex';
        desktopWrapper.style.flexDirection = 'column';
        desktopWrapper.style.alignItems = 'center';
        desktopWrapper.style.height = '100%';
        desktopWrapper.style.overflowY = 'auto';
        desktopContainer.appendChild(desktopWrapper);
        
        // Добавляем заголовок
        const title = document.createElement('h1');
        title.className = 'discipline-title';
        title.textContent = discipline === 'all' ? 'Все дисциплины' : discipline;
        desktopWrapper.appendChild(title);
        
        const mobileTitle = document.createElement('h1');
        mobileTitle.className = 'discipline-title-mobile';
        mobileTitle.textContent = discipline === 'all' ? 'Все дисциплины' : discipline;
        mobileContainer.appendChild(mobileTitle);
        
        // Создаем контейнер для турниров (десктоп)
        const tournamentsContainer = document.createElement('div');
        tournamentsContainer.className = 'tournaments-container';
        tournamentsContainer.style.width = '100%';
        desktopWrapper.appendChild(tournamentsContainer);
        
        // Создаем контейнер для турниров (мобильный)
        const mobileTournamentsContainer = document.createElement('div');
        mobileTournamentsContainer.className = 'tournaments-container-mobile';
        mobileContainer.appendChild(mobileTournamentsContainer);
        
        // Проверяем, есть ли турниры вообще
        if (tournaments.length === 0) {
            const noTournamentsMessage = document.createElement('div');
            noTournamentsMessage.className = 'empty-tournaments';
            noTournamentsMessage.textContent = 'В настоящее время нет запланированных турниров';
            tournamentsContainer.appendChild(noTournamentsMessage);
            
            const mobileNoTournamentsMessage = document.createElement('div');
            mobileNoTournamentsMessage.className = 'empty-tournaments';
            mobileNoTournamentsMessage.textContent = 'В настоящее время нет запланированных турниров';
            mobileTournamentsContainer.appendChild(mobileNoTournamentsMessage);
            
            // Добавляем кнопку для создания турнира, если пользователь админ
            if (localStorage.getItem('teamCode') === 'admin') {
                const createButton = document.createElement('a');
                createButton.className = 'create-tournament-button';
                createButton.href = './groups/admin.html';
                createButton.textContent = 'Создать турнир';
                desktopWrapper.appendChild(createButton);
                
                const mobileCreateButton = document.createElement('a');
                mobileCreateButton.className = 'create-tournament-button-mobile';
                mobileCreateButton.href = './groups/admin.html';
                mobileCreateButton.textContent = 'Создать турнир';
                mobileTournamentsContainer.appendChild(mobileCreateButton);
            }
            
            return;
        }
        
        // Группируем турниры по статусу
        const groupedTournaments = {
            'Идёт': [],
            'Запланирован': [],
            'Перенесён': [],
            'Окончен': [],
            'Отменён': []
        };
        
        filteredTournaments.forEach(tournament => {
            if (groupedTournaments[tournament.status]) {
                groupedTournaments[tournament.status].push(tournament);
            }
        });
        
        // Создаем секции для каждого статуса
        const statusTitles = {
            'Идёт': 'Текущие турниры',
            'Запланирован': 'Предстоящие турниры',
            'Перенесён': 'Перенесенные турниры',
            'Окончен': 'Завершенные турниры',
            'Отменён': 'Отмененные турниры'
        };
        
        const statusClasses = {
            'Идёт': 'ongoing',
            'Запланирован': 'planned',
            'Перенесён': 'postponed',
            'Окончен': 'finished',
            'Отменён': 'canceled'
        };
        
        // Проверяем наличие турниров для отображения
        let hasAnyTournaments = false;
        
        // Отображаем секции в порядке приоритета
        ['Идёт', 'Запланирован', 'Перенесён', 'Окончен', 'Отменён'].forEach(status => {
            if (groupedTournaments[status] && groupedTournaments[status].length > 0) {
                hasAnyTournaments = true;
                
                // Создаем секцию для десктопа
                const desktopSection = document.createElement('div');
                desktopSection.className = 'tournaments-section';
                
                const desktopSectionTitle = document.createElement('div');
                desktopSectionTitle.className = `section-title ${statusClasses[status]}`;
                desktopSectionTitle.textContent = statusTitles[status];
                desktopSection.appendChild(desktopSectionTitle);
                
                // Добавляем турниры в секцию
                const desktopSectionContainer = document.createElement('div');
                desktopSectionContainer.className = 'tournaments-container';
                desktopSection.appendChild(desktopSectionContainer);
                
                groupedTournaments[status].forEach(tournament => {
                    const tournamentElement = createTournamentElement(tournament);
                    desktopSectionContainer.appendChild(tournamentElement);
                });
                
                tournamentsContainer.appendChild(desktopSection);
                
                // Создаем секцию для мобильной версии
                const mobileSection = document.createElement('div');
                mobileSection.className = 'tournaments-section';
                
                const mobileSectionTitle = document.createElement('div');
                mobileSectionTitle.className = `section-title ${statusClasses[status]}`;
                mobileSectionTitle.textContent = statusTitles[status];
                mobileSection.appendChild(mobileSectionTitle);
                
                const mobileSectionContainer = document.createElement('div');
                mobileSectionContainer.className = 'tournaments-container-mobile';
                mobileSection.appendChild(mobileSectionContainer);
                
                groupedTournaments[status].forEach(tournament => {
                    const mobileTournamentElement = createTournamentElement(tournament, true);
                    mobileSectionContainer.appendChild(mobileTournamentElement);
                });
                
                mobileTournamentsContainer.appendChild(mobileSection);
            }
        });
        
        // Если после фильтрации не нашлось ни одного турнира для отображения
        if (!hasAnyTournaments) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tournaments';
            emptyMessage.textContent = `Нет предстоящих турниров по ${discipline === 'all' ? 'всем дисциплинам' : discipline}`;
            tournamentsContainer.appendChild(emptyMessage);
            
            const mobileEmptyMessage = document.createElement('div');
            mobileEmptyMessage.className = 'empty-tournaments';
            mobileEmptyMessage.textContent = `Нет предстоящих турниров по ${discipline === 'all' ? 'всем дисциплинам' : discipline}`;
            mobileTournamentsContainer.appendChild(mobileEmptyMessage);
            
            // Добавляем кнопку для создания турнира для администратора
            if (localStorage.getItem('teamCode') === 'admin') {
                const createButton = document.createElement('a');
                createButton.className = 'create-tournament-button';
                createButton.href = './groups/admin.html';
                createButton.textContent = 'Создать турнир';
                desktopWrapper.appendChild(createButton);
                
                const mobileCreateButton = document.createElement('a');
                mobileCreateButton.className = 'create-tournament-button-mobile';
                mobileCreateButton.href = './groups/admin.html';
                mobileCreateButton.textContent = 'Создать турнир';
                mobileTournamentsContainer.appendChild(mobileCreateButton);
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке турниров:', error);
    }
}

// Создание элемента турнира
function createTournamentElement(tournament, isMobile = false) {
    const tournamentElement = document.createElement('div');
    tournamentElement.className = isMobile ? 'tournament-card-mobile' : 'tournament-card';
    
    let statusClass = '';
    switch (tournament.status) {
        case 'Идёт':
            statusClass = 'status-ongoing';
            break;
        case 'Запланирован':
            statusClass = 'status-planned';
            break;
        case 'Окончен':
            statusClass = 'status-finished';
            break;
        case 'Отменён':
            statusClass = 'status-canceled';
            break;
        case 'Перенесён':
            statusClass = 'status-postponed';
            break;
    }
    
    tournamentElement.innerHTML = `
        <div class="tournament-header">
            <div class="tournament-title">${tournament.title}</div>
            <div class="tournament-game">${tournament.game}</div>
        </div>
        <div class="tournament-info">
            <div class="tournament-date-time">
                <div class="tournament-date">${tournament.date}</div>
                <div class="tournament-time">${tournament.time}</div>
            </div>
            <div class="tournament-status ${statusClass}">${tournament.status}</div>
        </div>
        <div class="tournament-teams">
            <div class="team-name">${tournament.team1}</div>
            <div class="tournament-score">${tournament.score_team1 || 0} : ${tournament.score_team2 || 0}</div>
            <div class="team-name">${tournament.team2}</div>
        </div>
    `;
    
    return tournamentElement;
}

// Функция для преобразования даты и времени турнира в объект Date
function parseTournamentDate(dateStr, timeStr) {
    // Парсинг даты из формата ДД.ММ.ГГГГ
    const [day, month, year] = dateStr.split('.').map(Number);
    
    // Парсинг времени из формата ЧЧ:ММ
    let hours = 0, minutes = 0;
    if (timeStr) {
        const timeParts = timeStr.split(':').map(Number);
        hours = timeParts[0] || 0;
        minutes = timeParts[1] || 0;
    }
    
    // Создаем объект Date (месяцы в JS начинаются с 0)
    return new Date(year, month - 1, day, hours, minutes);
} 