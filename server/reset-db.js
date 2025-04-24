const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Путь к базе данных
const dbPath = path.join(__dirname, '..', 'database.db');

console.log(`Сброс базы данных по пути: ${dbPath}`);

// Удаляем файл базы данных, если он существует
if (fs.existsSync(dbPath)) {
  console.log('Удаление существующего файла базы данных...');
  fs.unlinkSync(dbPath);
  console.log('Файл базы данных удален');
}

// Создаем новую базу данных
console.log('Создание новой базы данных...');
const db = require('./database');

// Дожидаемся инициализации базы данных и добавления демо-данных
setTimeout(() => {
  console.log('База данных успешно сброшена и демо-данные добавлены');
  process.exit(0);
}, 5000); 