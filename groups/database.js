const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('tournaments.db');

// Создание таблиц при первом запуске
db.serialize(() => {
  // Создание таблицы турниров
  db.run(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      team1 TEXT NOT NULL,
      team2 TEXT NOT NULL,
      status TEXT NOT NULL,
      game TEXT NOT NULL,
      score_team1 INTEGER DEFAULT 0,
      score_team2 INTEGER DEFAULT 0
    )
  `);

  // Создание таблицы команд
  db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      page TEXT NOT NULL,
      members TEXT NOT NULL,
      tournament_ids TEXT
    )
  `);
  
  // Создание таблицы новостей
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      category TEXT DEFAULT 'all',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Добавление начальных данных турниров
  db.get("SELECT COUNT(*) as count FROM tournaments", [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      const initialTournaments = [];

      const stmt = db.prepare('INSERT INTO tournaments (title, date, time, team1, team2, status, game) VALUES (?, ?, ?, ?, ?, ?, ?)');
      initialTournaments.forEach(tournament => {
        stmt.run([
          tournament.title,
          tournament.date,
          tournament.time,
          tournament.team1,
          tournament.team2,
          tournament.status,
          tournament.game
        ]);
      });
      stmt.finalize();
    }
  });

  // Добавление начальных данных команд
  db.get("SELECT COUNT(*) as count FROM teams", [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      const initialTeams = [
        {
          name: "Администратор",
          code: "admin",
          page: "admin.html",
          members: [],
          tournament_ids: ""
        }
      ];

      const stmt = db.prepare('INSERT INTO teams (name, code, page, members, tournament_ids) VALUES (?, ?, ?, ?, ?)');
      initialTeams.forEach(team => {
        stmt.run([
          team.name,
          team.code,
          team.page,
          JSON.stringify(team.members),
          team.tournament_ids
        ]);
      });
      stmt.finalize();
    }
  });

  // Добавление начальных данных для новостей
  db.get("SELECT COUNT(*) as count FROM news", [], (err, row) => {
    if (err || !row) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      const initialNews = [
        {
          date: '24.02.2022',
          title: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ullam, eum.',
          category: 'all'
        },
        {
          date: '24.12.2024',
          title: 'HOKAGE LEAN IS AVAILABLE',
          category: 'all'
        }
      ];

      const stmt = db.prepare('INSERT INTO news (date, title, category) VALUES (?, ?, ?)');
      initialNews.forEach(news => {
        stmt.run([
          news.date,
          news.title,
          news.category
        ]);
      });
      stmt.finalize();
    }
  });
});

// Функции для работы с турнирами
function createTournament(title, date, time, team1, team2, status, game) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO tournaments (title, date, time, team1, team2, status, game) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run([title, date, time, team1, team2, status, game], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

function getTournaments() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tournaments', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function updateTournamentStatus(id, status) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE tournaments SET status = ? WHERE id = ?');
    stmt.run([status, id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function deleteTournament(id) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('DELETE FROM tournaments WHERE id = ?');
    stmt.run([id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

// Функции для работы с командами
function createTeam(name, code, page, members, tournamentIds) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO teams (name, code, page, members, tournament_ids) VALUES (?, ?, ?, ?, ?)');
    stmt.run([name, code, page, JSON.stringify(members), tournamentIds], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

function getTeams() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM teams', [], (err, rows) => {
      if (err) reject(err);
      else {
        rows.forEach(row => {
          row.members = JSON.parse(row.members);
        });
        resolve(rows);
      }
    });
  });
}

function getTeamByCode(code) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM teams WHERE code = ?', [code], (err, row) => {
      if (err) reject(err);
      else if (row) {
        row.members = JSON.parse(row.members);
        resolve(row);
      }
      else resolve(null);
    });
  });
}

function updateTeam(id, name, code, page, members, tournamentIds) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE teams SET name = ?, code = ?, page = ?, members = ?, tournament_ids = ? WHERE id = ?');
    stmt.run([name, code, page, JSON.stringify(members), tournamentIds, id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function deleteTeam(id) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('DELETE FROM teams WHERE id = ?');
    stmt.run([id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function getTournamentById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tournaments WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function updateTournamentScore(id, scoreTeam1, scoreTeam2) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE tournaments SET score_team1 = ?, score_team2 = ? WHERE id = ?');
    stmt.run([scoreTeam1, scoreTeam2, id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

// Функции для работы с новостями
function getNews(category = 'all') {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM news ORDER BY created_at DESC LIMIT 10';
    let params = [];
    
    if (category !== 'all') {
      query = 'SELECT * FROM news WHERE category = ? OR category = "all" ORDER BY created_at DESC LIMIT 10';
      params = [category];
    }
    
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function createNews(date, title, content = null, category = 'all') {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO news (date, title, content, category) VALUES (?, ?, ?, ?)');
    stmt.run([date, title, content, category], function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

function updateNews(id, date, title, content = null, category = 'all') {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('UPDATE news SET date = ?, title = ?, content = ?, category = ? WHERE id = ?');
    stmt.run([date, title, content, category, id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function deleteNews(id) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('DELETE FROM news WHERE id = ?');
    stmt.run([id], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
    stmt.finalize();
  });
}

function getNewsById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM news WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

module.exports = {
  createTournament,
  getTournaments,
  updateTournamentStatus,
  deleteTournament,
  createTeam,
  getTeams,
  getTeamByCode,
  updateTeam,
  deleteTeam,
  getTournamentById,
  updateTournamentScore,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsById
}; 