const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'db', 'cybersport.db');
console.log('Путь к базе данных:', dbPath);

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
    return;
  }
  
  console.log('Подключение к базе данных успешно установлено');
  
  // Проверяем структуру таблицы stages
  db.all("PRAGMA table_info(stages)", [], (err, rows) => {
    if (err) {
      console.error('Ошибка при получении информации о таблице:', err);
      return;
    }
    
    console.log('Структура таблицы stages:');
    console.log(rows);
    
    // Проверяем наличие данных в таблице stages
    db.all("SELECT * FROM stages", [], (err, rows) => {
      if (err) {
        console.error('Ошибка при получении данных из таблицы stages:', err);
        return;
      }
      
      console.log(`Найдено ${rows.length} этапов в таблице:`);
      console.log(JSON.stringify(rows, null, 2));
      
      // Проверяем сколько этапов для конкретного турнира
      const tournamentId = 1;
      db.all("SELECT * FROM stages WHERE tournament_id = ?", [tournamentId], (err, rows) => {
        if (err) {
          console.error(`Ошибка при получении этапов для турнира ${tournamentId}:`, err);
          return;
        }
        
        console.log(`Найдено ${rows.length} этапов для турнира ${tournamentId}:`);
        console.log(JSON.stringify(rows, null, 2));
        
        db.close();
      });
    });
  });
}); 