# Cybersport Platform

Веб-платформа для управления киберспортивными турнирами, командами и матчами.

## Структура проекта

Проект состоит из двух основных частей:
- `cybersport-react` - клиентская часть на React с Vite
- `server` - серверная часть на Node.js и Express

## Установка

1. Клонировать репозиторий:
```bash
git clone https://github.com/ваш-логин/cybersport-platform.git
cd cybersport-platform
```

2. Установить зависимости для всего проекта:
```bash
npm run install-all
```

3. Скопировать файлы окружения:
```bash
cp .env.example .env
cp cybersport-react/.env.example cybersport-react/.env
```

4. Создать и заполнить базу данных:
```bash
cd server
node reset-db.js
```

## Запуск для разработки

```bash
# В корневой директории проекта
npm run dev
```

Клиент будет доступен по адресу: http://localhost:5173  
Сервер API будет доступен по адресу: http://localhost:3001

## Деплой

### Предварительные требования
- Node.js 16+ 
- Git

### Деплой на Netlify (клиентская часть)

1. Сборка проекта:
```bash
npm run build
```

2. Настройте следующие переменные окружения в панели управления Netlify:
- `VITE_API_URL` - URL вашего API (например, https://your-api.render.com)
- `VITE_ADMIN_CODE` - Код администратора для доступа
- `VITE_APP_NAME` - Название вашего приложения

3. Настройка перенаправлений:
Создайте файл `cybersport-react/public/_redirects` со следующим содержимым:
```
/*  /index.html 200
```

### Деплой API на Render (серверная часть)

1. Подключите ваш GitHub репозиторий к Render.com
2. Создайте новый Web Service
3. Укажите корневую директорию: `server`
4. Установите команду сборки: `npm install`
5. Установите команду запуска: `npm start`
6. Настройте следующие переменные окружения:
   - `PORT` - 10000 (или другой доступный на вашем хостинге)
   - `NODE_ENV` - production
   - `ADMIN_CODE` - Код администратора (должен совпадать с кодом на клиенте)

## Лицензия

MIT