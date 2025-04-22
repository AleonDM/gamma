# Сервер API для Киберспорт

Это серверная часть приложения "Киберспорт", предоставляющая API для работы с турнирами, командами и новостями.

## Технологии

- Node.js
- Express.js
- SQLite
- RESTful API

## Структура базы данных

### Таблица tournaments
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- name: TEXT
- discipline: TEXT
- date: TEXT
- status: TEXT
- prize_pool: INTEGER
- organizer: TEXT
- description: TEXT
- archived: INTEGER DEFAULT 0

### Таблица teams
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- name: TEXT
- code: TEXT UNIQUE
- members: TEXT (JSON)
- tournaments: TEXT (JSON)

### Таблица news
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- date: TEXT
- title: TEXT
- content: TEXT
- category: TEXT DEFAULT 'cybersport'

## Установка

1. Убедитесь, что у вас установлен Node.js версии 14+ и npm.
2. Установите зависимости:

```bash
cd server
npm install
```

## Запуск сервера

### Режим разработки

```bash
npm run dev
```

Сервер запустится на порту 3001 с автоматической перезагрузкой при изменении кода.

### Продакшн режим

```bash
npm start
```

## API Endpoints

### Турниры

- GET `/api/tournaments` - Получение всех турниров
- GET `/api/tournaments?archived=true` - Получение архивированных турниров
- GET `/api/tournaments/:id` - Получение турнира по ID
- POST `/api/tournaments` - Создание нового турнира
- PUT `/api/tournaments/:id` - Обновление турнира
- POST `/api/tournaments/:id/archive` - Архивация турнира
- POST `/api/tournaments/:id/restore` - Восстановление турнира из архива
- DELETE `/api/tournaments/:id` - Удаление турнира

### Команды

- GET `/api/teams` - Получение всех команд
- GET `/api/teams/:id` - Получение команды по ID
- GET `/api/teams/code/:code` - Получение команды по коду
- POST `/api/teams` - Создание новой команды
- PUT `/api/teams/:id` - Обновление команды
- DELETE `/api/teams/:id` - Удаление команды

### Новости

- GET `/api/news` - Получение всех новостей
- GET `/api/news?category=cybersport` - Получение новостей по категории
- GET `/api/news/:id` - Получение новости по ID
- POST `/api/news` - Создание новой новости
- PUT `/api/news/:id` - Обновление новости
- DELETE `/api/news/:id` - Удаление новости

## Демо данные

При первом запуске сервера автоматически создаются демонстрационные данные:
- 5 турниров по разным дисциплинам
- 4 команды (включая команду admin)
- 3 новости

Для входа в админ-панель используйте код команды: `admin` 