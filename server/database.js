const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Создаем папку для базы данных, если она не существует
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Путь к файлу базы данных
const dbPath = path.join(dbDir, 'cybersport.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных SQLite успешно установлено');
    initDatabase();
  }
});

// Инициализация базы данных
function initDatabase() {
  // Создаем таблицу турниров, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      discipline TEXT NOT NULL,
      date TEXT,
      status TEXT,
      prize_pool INTEGER,
      organizer TEXT,
      description TEXT,
      location TEXT,
      archived INTEGER DEFAULT 0
    )
  `).run();

  // Создаем таблицу команд, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      members TEXT,
      tournaments TEXT
    )
  `).run();

  // Создаем таблицу новостей, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      date TEXT,
      category TEXT
    )
  `).run();
  
  // Создаем таблицу этапов турниров, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      format TEXT NOT NULL,
      status TEXT NOT NULL,
      tournament_id INTEGER NOT NULL,
      start_date TEXT,
      end_date TEXT,
      description TEXT,
      FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE
    )
  `).run();
  
  // Создаем таблицу групп, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
    )
  `).run();
  
  // Создаем таблицу команд в группах, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS group_teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      team_id INTEGER NOT NULL,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
      UNIQUE(group_id, team_id)
    )
  `).run();
  
  // Создаем таблицу матчей, если её еще нет
  db.prepare(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team1_id INTEGER NOT NULL,
      team2_id INTEGER NOT NULL,
      team1_score INTEGER,
      team2_score INTEGER,
      date TEXT,
      status TEXT NOT NULL,
      location TEXT,
      description TEXT,
      stage_id INTEGER NOT NULL,
      group_id INTEGER,
      FOREIGN KEY (team1_id) REFERENCES teams (id) ON DELETE CASCADE,
      FOREIGN KEY (team2_id) REFERENCES teams (id) ON DELETE CASCADE,
      FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
    )
  `).run();

  // Если таблица турниров пуста, добавляем демо-данные
  const tournamentCount = db.prepare('SELECT COUNT(*) as count FROM tournaments').get().count;
  if (tournamentCount === 0) {
    addDemoData();
  }
}

// Добавление демо-данных в базу
function addDemoData() {
  // Добавляем примеры турниров
  const tournaments = [
    {
      name: "Чемпионат России по Dota 2",
      discipline: "Dota 2",
      date: "2023-12-01",
      status: "Идёт",
      prize_pool: 500000,
      organizer: "Киберспорт России",
      description: "Ежегодный чемпионат России по Dota 2 с участием лучших команд страны.",
      location: "Москва"
    },
    {
      name: "Кубок Cyberia CS:GO",
      discipline: "CS2",
      date: "2023-11-15",
      status: "Завершён",
      prize_pool: 250000,
      organizer: "Cyberia",
      description: "Международный турнир по CS:GO с командами из СНГ и Европы.",
      location: "Санкт-Петербург",
      archived: 1
    },
    {
      name: "Valorant Masters",
      discipline: "Valorant",
      date: "2024-01-05",
      status: "Запланирован",
      prize_pool: 300000,
      organizer: "Riot Games",
      description: "Крупнейший турнир по Valorant в России.",
      location: "Онлайн"
    }
  ];

  // Добавляем команды
  const teams = [
    {
      name: "Virtus.pro",
      code: "vp",
      members: JSON.stringify([
        { name: "Иван Петров", role: "Капитан" },
        { name: "Алексей Смирнов", role: "Керри" },
        { name: "Михаил Иванов", role: "Мидер" },
        { name: "Дмитрий Сидоров", role: "Оффлейнер" },
        { name: "Сергей Козлов", role: "Саппорт" }
      ]),
      tournaments: JSON.stringify([])
    },
    {
      name: "Natus Vincere",
      code: "navi",
      members: JSON.stringify([
        { name: "Александр Костылев", role: "Капитан" },
        { name: "Денис Шарипов", role: "Снайпер" },
        { name: "Илья Залуцкий", role: "Поддержка" },
        { name: "Валерий Ваховский", role: "Штурмовик" },
        { name: "Алексей Головин", role: "Поддержка" }
      ]),
      tournaments: JSON.stringify([])
    },
    {
      name: "Team Spirit",
      code: "spirit",
      members: JSON.stringify([
        { name: "Ярослав Найденов", role: "Капитан" },
        { name: "Александр Хертек", role: "Керри" },
        { name: "Максим Кузнецов", role: "Мидер" },
        { name: "Максим Малиш", role: "Оффлейнер" },
        { name: "Егор Парышев", role: "Саппорт" }
      ]),
      tournaments: JSON.stringify([])
    },
    {
      name: "Gambit Esports",
      code: "gambit",
      members: JSON.stringify([
        { name: "Тимофей Афанасьев", role: "Капитан" },
        { name: "Даниил Ольховский", role: "Снайпер" },
        { name: "Артем Васильев", role: "Штурмовик" },
        { name: "Сергей Рыбкин", role: "Поддержка" },
        { name: "Николай Лебедев", role: "Тактик" }
      ]),
      tournaments: JSON.stringify([])
    },
    {
      name: "Администратор",
      code: "admin",
      members: JSON.stringify([]),
      tournaments: JSON.stringify([])
    }
  ];

  // Добавляем данные в базу
  const insertTournament = db.prepare(`
    INSERT INTO tournaments (name, discipline, date, status, prize_pool, organizer, description, location, archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTeam = db.prepare(`
    INSERT INTO teams (name, code, members, tournaments)
    VALUES (?, ?, ?, ?)
  `);

  // Добавляем новости
  const news = [
    {
      title: "Старт чемпионата России по Dota 2",
      content: "Сегодня стартует чемпионат России по Dota 2. 16 лучших команд будут сражаться за призовой фонд в 500 000 рублей.",
      date: "2023-12-01",
      category: "cybersport"
    },
    {
      title: "Результаты Кубка Cyberia по CS:GO",
      content: "Команда Virtus.pro стала победителем турнира, обыграв в финале Natus Vincere со счетом 2:1.",
      date: "2023-11-20",
      category: "cybersport"
    },
    {
      title: "Анонс Valorant Masters",
      content: "Riot Games объявила даты проведения турнира Valorant Masters. Турнир пройдет онлайн с 5 по 15 января 2024 года.",
      date: "2023-11-25",
      category: "cybersport"
    }
  ];

  const insertNews = db.prepare(`
    INSERT INTO news (title, content, date, category)
    VALUES (?, ?, ?, ?)
  `);

  // Вставляем турниры, команды и новости
  let tournamentIds = [];
  
  for (const tournament of tournaments) {
    const { archived = 0, ...data } = tournament;
    const result = insertTournament.run(
      data.name, data.discipline, data.date, data.status, 
      data.prize_pool, data.organizer, data.description, data.location, archived
    );
    tournamentIds.push(result.lastInsertRowid);
  }

  for (const team of teams) {
    insertTeam.run(team.name, team.code, team.members, team.tournaments);
  }

  for (const item of news) {
    insertNews.run(item.title, item.content, item.date, item.category);
  }

  // Добавляем этапы для турниров
  if (tournamentIds.length > 0) {
    // Получаем ID команд
    const teamIds = [];
    const getTeamIds = db.prepare("SELECT id FROM teams WHERE code != 'admin'").all();
    for (const team of getTeamIds) {
      teamIds.push(team.id);
    }

    // Добавляем этапы для первого турнира (Dota 2)
    if (tournamentIds[0]) {
      // Групповой этап
      const groupStage = db.prepare(`
        INSERT INTO stages (name, format, status, tournament_id, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Групповой этап", 
        "groups", 
        "Идёт", 
        tournamentIds[0],
        "2023-12-01",
        "2023-12-10",
        "Групповой этап с 4 группами по 4 команды. Две лучшие команды из каждой группы проходят в плей-офф."
      );
      
      const groupStageId = groupStage.lastInsertRowid;
      
      // Создаем две группы
      const groupA = db.prepare(`
        INSERT INTO groups (name, stage_id)
        VALUES (?, ?)
      `).run("Группа A", groupStageId);
      
      const groupAId = groupA.lastInsertRowid;
      
      const groupB = db.prepare(`
        INSERT INTO groups (name, stage_id)
        VALUES (?, ?)
      `).run("Группа B", groupStageId);
      
      const groupBId = groupB.lastInsertRowid;
      
      // Добавляем команды в группы
      if (teamIds.length >= 4) {
        // Группа A: команды 0 и 1
        db.prepare(`
          INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(groupAId, teamIds[0], 1, 1, 0, 3);
        
        db.prepare(`
          INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(groupAId, teamIds[1], 1, 0, 1, 0);
        
        // Группа B: команды 2 и 3
        db.prepare(`
          INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(groupBId, teamIds[2], 1, 1, 0, 3);
        
        db.prepare(`
          INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(groupBId, teamIds[3], 1, 0, 1, 0);
        
        // Добавляем матчи для групп
        // Матч в группе A
        db.prepare(`
          INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          teamIds[0], teamIds[1], 2, 0, 
          "2023-12-01 12:00:00", "Завершён", "Онлайн", 
          "Матч группового этапа A", 
          groupStageId, groupAId
        );
        
        // Матч в группе B
        db.prepare(`
          INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          teamIds[2], teamIds[3], 2, 1, 
          "2023-12-01 15:00:00", "Завершён", "Онлайн", 
          "Матч группового этапа B", 
          groupStageId, groupBId
        );
      }
      
      // Плей-офф
      const playoffStage = db.prepare(`
        INSERT INTO stages (name, format, status, tournament_id, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Плей-офф", 
        "bracket", 
        "Запланирован", 
        tournamentIds[0],
        "2023-12-15",
        "2023-12-20",
        "Стадия плей-офф. Сетка Single Elimination."
      );
      
      const playoffStageId = playoffStage.lastInsertRowid;
      
      // Добавляем полуфинальный матч
      if (teamIds.length >= 2) {
        db.prepare(`
          INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          teamIds[0], teamIds[2], null, null, 
          "2023-12-15 18:00:00", "Запланирован", "Москва", 
          "Полуфинал 1", 
          playoffStageId, null
        );
      }
    }
    
    // Добавляем этап для второго турнира (CS:GO)
    if (tournamentIds.length > 1 && tournamentIds[1]) {
      // Финальный этап
      const finalStage = db.prepare(`
        INSERT INTO stages (name, format, status, tournament_id, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        "Финальный этап", 
        "bracket", 
        "Завершён", 
        tournamentIds[1],
        "2023-11-18",
        "2023-11-20",
        "Финальная стадия турнира с участием 4 команд."
      );
      
      const finalStageId = finalStage.lastInsertRowid;
      
      // Добавляем финальный матч
      if (teamIds.length >= 2) {
        db.prepare(`
          INSERT INTO matches (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          teamIds[0], teamIds[1], 2, 1, 
          "2023-11-20 19:00:00", "Завершён", "Санкт-Петербург", 
          "Гранд-финал", 
          finalStageId, null
        );
      }
    }
  }

  console.log("Демо-данные добавлены успешно!");
}

// Получение всех турниров с возможностью фильтрации архивных
function getTournaments(archived = false) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM tournaments WHERE archived = ? ORDER BY date DESC",
      [archived ? 1 : 0],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

// Получение турнира по ID
function getTournamentById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM tournaments WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Создание нового турнира
function createTournament(tournamentData) {
  return new Promise((resolve, reject) => {
    const { name, discipline, date, status, organizer, description, location, archived = false } = tournamentData;
    
    db.run(
      `INSERT INTO tournaments (name, discipline, date, status, organizer, description, location, archived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, discipline, date, status, organizer, description, location, archived ? 1 : 0],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...tournamentData });
        }
      }
    );
  });
}

// Обновление турнира
function updateTournament(id, tournamentData) {
  return new Promise((resolve, reject) => {
    const { name, discipline, date, status, organizer, description, location } = tournamentData;
    
    db.run(
      `UPDATE tournaments 
       SET name = ?, discipline = ?, date = ?, status = ?, organizer = ?, description = ?, location = ?
       WHERE id = ?`,
      [name, discipline, date, status, organizer, description, location, id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...tournamentData });
        }
      }
    );
  });
}

// Архивация/разархивация турнира
function updateTournamentArchiveStatus(id, archived) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE tournaments SET archived = ? WHERE id = ?",
      [archived ? 1 : 0, id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, archived });
        }
      }
    );
  });
}

// Удаление турнира
function deleteTournament(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM tournaments WHERE id = ?", [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id });
      }
    });
  });
}

// Получение всех команд
function getTeams() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM teams", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // Преобразуем JSON-строки в массивы
        const teams = rows.map(team => ({
          ...team,
          members: JSON.parse(team.members),
          tournaments: JSON.parse(team.tournaments)
        }));
        resolve(teams);
      }
    });
  });
}

// Получение команды по ID
function getTeamById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM teams WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        // Преобразуем JSON-строки в массивы
        const team = {
          ...row,
          members: JSON.parse(row.members),
          tournaments: JSON.parse(row.tournaments)
        };
        resolve(team);
      }
    });
  });
}

// Получение команды по коду
function getTeamByCode(code) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM teams WHERE code = ?", [code], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(null);
      } else {
        // Преобразуем JSON-строки в массивы
        const team = {
          ...row,
          members: JSON.parse(row.members),
          tournaments: JSON.parse(row.tournaments)
        };
        resolve(team);
      }
    });
  });
}

// Создание новой команды
function createTeam(teamData) {
  return new Promise((resolve, reject) => {
    const { name, code, members, tournaments } = teamData;
    
    db.run(
      "INSERT INTO teams (name, code, members, tournaments) VALUES (?, ?, ?, ?)",
      [
        name,
        code,
        JSON.stringify(members || []),
        JSON.stringify(tournaments || [])
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            ...teamData,
            members: members || [],
            tournaments: tournaments || []
          });
        }
      }
    );
  });
}

// Обновление команды
function updateTeam(id, teamData) {
  return new Promise((resolve, reject) => {
    const { name, code, members, tournaments } = teamData;
    
    db.run(
      "UPDATE teams SET name = ?, code = ?, members = ?, tournaments = ? WHERE id = ?",
      [
        name,
        code,
        JSON.stringify(members || []),
        JSON.stringify(tournaments || []),
        id
      ],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id,
            ...teamData,
            members: members || [],
            tournaments: tournaments || []
          });
        }
      }
    );
  });
}

// Удаление команды
function deleteTeam(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM teams WHERE id = ?", [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id });
      }
    });
  });
}

// Получение новостей с возможностью фильтрации по категории
function getNews(category = 'all') {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM news";
    const params = [];
    
    if (category !== 'all') {
      query += " WHERE category = ?";
      params.push(category);
    }
    
    query += " ORDER BY date DESC";
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Получение новости по ID
function getNewsById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM news WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Создание новой новости
function createNews(newsData) {
  return new Promise((resolve, reject) => {
    const { date, title, content, category } = newsData;
    
    db.run(
      "INSERT INTO news (date, title, content, category) VALUES (?, ?, ?, ?)",
      [date, title, content, category || 'cybersport'],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...newsData });
        }
      }
    );
  });
}

// Обновление новости
function updateNews(id, newsData) {
  return new Promise((resolve, reject) => {
    const { date, title, content, category } = newsData;
    
    db.run(
      "UPDATE news SET date = ?, title = ?, content = ?, category = ? WHERE id = ?",
      [date, title, content, category || 'cybersport', id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...newsData });
        }
      }
    );
  });
}

// Удаление новости
function deleteNews(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM news WHERE id = ?", [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id });
      }
    });
  });
}

// Функции для работы с этапами турниров
function getStagesByTournamentId(tournamentId) {
  return new Promise((resolve, reject) => {
    if (!tournamentId) {
      console.log('Получен пустой tournamentId, возвращаю пустой массив');
      resolve([]);
      return;
    }
    
    console.log(`Получение этапов для турнира ${tournamentId}`);
    
    const query = 'SELECT * FROM stages WHERE tournament_id = ? ORDER BY id ASC';
    
    db.all(query, [tournamentId], async (err, rows) => {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err);
        resolve([]);
        return;
      }
      
      console.log(`Получено ${rows.length} этапов из базы данных:`, JSON.stringify(rows));
      
      try {
        // Обработка этапов для добавления групп
        const stagesWithGroups = [];
        
        for (const stage of rows) {
          if (stage.format === 'groups') {
            try {
              // Добавляем группы к этапу
              stage.groups = await getGroupsByStageId(stage.id);
            } catch (groupErr) {
              console.error(`Ошибка при получении групп для этапа ${stage.id}:`, groupErr);
              stage.groups = [];
            }
          } else {
            stage.groups = [];
          }
          
          stagesWithGroups.push(stage);
        }
        
        console.log(`Возвращаю ${stagesWithGroups.length} обработанных этапов`);
        resolve(stagesWithGroups);
      } catch (processingErr) {
        console.error('Ошибка при обработке этапов:', processingErr);
        resolve(rows); // В случае ошибки обработки возвращаем хотя бы исходные данные
      }
    });
  });
}

function getStageById(stageId) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = 'SELECT * FROM stages WHERE id = ?';
      db.get(query, [stageId], async (err, stage) => {
        if (err) {
          console.error('Ошибка при получении этапа по ID:', err);
          resolve(null);
          return;
        }
        
        if (!stage) {
          resolve(null);
          return;
        }
        
        // Добавляем группы к этапу, если есть
        if (stage.format === 'groups') {
          try {
            // Используем await для получения результата асинхронной функции
            stage.groups = await getGroupsByStageId(stage.id);
          } catch (err) {
            console.error('Ошибка при получении групп для этапа:', err);
            stage.groups = [];
          }
        } else {
          stage.groups = [];
        }
        
        resolve(stage);
      });
    } catch (err) {
      console.error('Критическая ошибка при получении этапа:', err);
      resolve(null);
    }
  });
}

function createStage(stageData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, format, status, tournament_id, start_date, end_date, description, groups = [] } = stageData;
      
      const query = `
        INSERT INTO stages (name, format, status, tournament_id, start_date, end_date, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, 
        [name, format, status, tournament_id, start_date, end_date, description],
        function(err) {
          if (err) {
            console.error('Ошибка при создании этапа:', err);
            return reject(err);
          }
          
          const stageId = this.lastID;
          
          // Если нет групп или не групповой формат, просто возвращаем результат
          if (format !== 'groups' || !Array.isArray(groups) || groups.length === 0) {
            // Получаем созданный этап
            db.get('SELECT * FROM stages WHERE id = ?', [stageId], (getErr, stage) => {
              if (getErr) {
                console.error('Ошибка при получении созданного этапа:', getErr);
                return reject(getErr);
              }
              
              stage.groups = [];
              resolve(stage);
            });
            return;
          }
          
          // Асинхронно создаем группы
          const createGroupPromises = groups.map(group => 
            createGroup({ ...group, stage_id: stageId })
          );
          
          Promise.all(createGroupPromises)
            .then(createdGroups => {
              // Получаем созданный этап со всеми группами
              db.get('SELECT * FROM stages WHERE id = ?', [stageId], (getErr, stage) => {
                if (getErr) {
                  console.error('Ошибка при получении созданного этапа:', getErr);
                  return reject(getErr);
                }
                
                stage.groups = createdGroups;
                resolve(stage);
              });
            })
            .catch(groupErr => {
              console.error('Ошибка при создании групп:', groupErr);
              
              // Все равно возвращаем созданный этап, даже если были проблемы с группами
              db.get('SELECT * FROM stages WHERE id = ?', [stageId], (getErr, stage) => {
                if (getErr) {
                  return reject(getErr);
                }
                
                stage.groups = [];
                resolve(stage);
              });
            });
        }
      );
    } catch (err) {
      console.error('Критическая ошибка при создании этапа:', err);
      reject(err);
    }
  });
}

function updateStage(stageId, stageData) {
  return new Promise(async (resolve, reject) => {
    try {
      const stage = await getStageById(stageId);
      if (!stage) {
        resolve(null);
        return;
      }
      
      const { name, format, status, start_date, end_date, description, groups = [] } = stageData;
      
      const query = `
        UPDATE stages
        SET name = ?, format = ?, status = ?, start_date = ?, end_date = ?, description = ?
        WHERE id = ?
      `;
      
      db.run(query, 
        [name, format, status, start_date, end_date, description, stageId],
        async function(err) {
          if (err) {
            console.error('Ошибка при обновлении этапа:', err);
            return reject(err);
          }
          
          // Обновляем группы, если это групповой этап
          if (format === 'groups' && Array.isArray(groups)) {
            try {
              // Получаем текущие группы
              const currentGroups = await getGroupsByStageId(stageId);
              const currentGroupIds = currentGroups.map(g => g.id);
              
              // Обрабатываем группы
              for (const group of groups) {
                if (group.id) {
                  // Обновляем существующую группу
                  await updateGroup(group.id, group);
                  // Удаляем из списка ID, чтобы отслеживать удаленные группы
                  const index = currentGroupIds.indexOf(group.id);
                  if (index !== -1) {
                    currentGroupIds.splice(index, 1);
                  }
                } else {
                  // Создаем новую группу
                  await createGroup({ ...group, stage_id: stageId });
                }
              }
              
              // Удаляем группы, которых нет в обновленном списке
              for (const groupId of currentGroupIds) {
                await deleteGroup(groupId);
              }
            } catch (groupErr) {
              console.error('Ошибка при обновлении групп этапа:', groupErr);
            }
          }
          
          // Получаем обновленный этап
          const updatedStage = await getStageById(stageId);
          resolve(updatedStage);
        }
      );
    } catch (err) {
      console.error('Критическая ошибка при обновлении этапа:', err);
      reject(err);
    }
  });
}

function deleteStage(stageId) {
  return new Promise(async (resolve, reject) => {
    try {
      // Получаем информацию об этапе
      console.log(`Начинаем удаление этапа с ID ${stageId}`);
      
      // Получаем информацию об этапе через обычный запрос
      // (поскольку getStageById может быть также асинхронным)
      const stageQuery = 'SELECT * FROM stages WHERE id = ?';
      db.get(stageQuery, [stageId], async (err, stage) => {
        if (err) {
          console.error(`Ошибка при получении информации об этапе ${stageId}:`, err);
          return resolve(false);
        }
        
        if (!stage) {
          console.log(`Этап с ID ${stageId} не найден`);
          return resolve(false);
        }
        
        console.log(`Этап найден: ${stage.name}, формат: ${stage.format}`);
        
        try {
          // Удаляем связанные группы
          if (stage.format === 'groups') {
            try {
              // Получаем группы этапа (асинхронно)
              const groups = await getGroupsByStageId(stageId);
              console.log(`Найдено ${groups.length} групп для удаления`);
              
              // Удаляем каждую группу
              for (const group of groups) {
                try {
                  const groupDeleteResult = await new Promise((resolveGroup) => {
                    // Удаляем группу напрямую через SQL
                    const groupDeleteQuery = 'DELETE FROM groups WHERE id = ?';
                    db.run(groupDeleteQuery, [group.id], (groupErr) => {
                      if (groupErr) {
                        console.error(`Ошибка при удалении группы ${group.id}:`, groupErr);
                        resolveGroup(false);
                      } else {
                        console.log(`Группа ${group.id} успешно удалена`);
                        resolveGroup(true);
                      }
                    });
                  });
                } catch (groupErr) {
                  console.error(`Ошибка при удалении группы:`, groupErr);
                }
              }
            } catch (groupsErr) {
              console.error('Ошибка при получении групп для удаления:', groupsErr);
            }
          }
          
          // Удаляем матчи, не привязанные к группам
          try {
            const matchesQuery = 'SELECT id FROM matches WHERE stage_id = ? AND group_id IS NULL';
            db.all(matchesQuery, [stageId], async (matchesErr, matches) => {
              if (matchesErr) {
                console.error('Ошибка при получении матчей для удаления:', matchesErr);
              } else if (matches && matches.length > 0) {
                console.log(`Найдено ${matches.length} матчей для удаления`);
                
                // Удаляем матчи
                for (const match of matches) {
                  try {
                    const matchDeleteQuery = 'DELETE FROM matches WHERE id = ?';
                    await new Promise((resolveMatch) => {
                      db.run(matchDeleteQuery, [match.id], (matchErr) => {
                        if (matchErr) {
                          console.error(`Ошибка при удалении матча ${match.id}:`, matchErr);
                        } else {
                          console.log(`Матч ${match.id} успешно удален`);
                        }
                        resolveMatch();
                      });
                    });
                  } catch (matchErr) {
                    console.error(`Ошибка при удалении матча:`, matchErr);
                  }
                }
              }
              
              // Наконец, удаляем сам этап
              const stageDeleteQuery = 'DELETE FROM stages WHERE id = ?';
              db.run(stageDeleteQuery, [stageId], (stageErr) => {
                if (stageErr) {
                  console.error(`Ошибка при удалении этапа ${stageId}:`, stageErr);
                  resolve(false);
                } else {
                  console.log(`Этап ${stageId} успешно удален`);
                  resolve(true);
                }
              });
            });
          } catch (matchesErr) {
            console.error('Ошибка при работе с матчами:', matchesErr);
            // Все равно пытаемся удалить этап
            const stageDeleteQuery = 'DELETE FROM stages WHERE id = ?';
            db.run(stageDeleteQuery, [stageId], (stageErr) => {
              if (stageErr) {
                console.error(`Ошибка при удалении этапа ${stageId}:`, stageErr);
                resolve(false);
              } else {
                console.log(`Этап ${stageId} успешно удален, хотя была ошибка при удалении матчей`);
                resolve(true);
              }
            });
          }
        } catch (processErr) {
          console.error('Общая ошибка при обработке удаления:', processErr);
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Критическая ошибка при удалении этапа:', err);
      resolve(false);
    }
  });
}

// Функции для работы с группами
function getGroupsByStageId(stageId) {
  return new Promise((resolve, reject) => {
    if (!stageId) {
      resolve([]);
      return;
    }
    
    const query = 'SELECT * FROM groups WHERE stage_id = ? ORDER BY id ASC';
    
    db.all(query, [stageId], async (err, groups) => {
      if (err) {
        console.error('Ошибка при получении групп для этапа:', err);
        resolve([]);
        return;
      }
      
      try {
        // Обрабатываем каждую группу, добавляя команды
        const groupsWithTeams = [];
        
        for (const group of groups) {
          try {
            // Добавляем команды к группе
            const teams = await getTeamsByGroupId(group.id);
            group.teams = teams;
          } catch (teamsErr) {
            console.error(`Ошибка при получении команд для группы ${group.id}:`, teamsErr);
            group.teams = [];
          }
          
          groupsWithTeams.push(group);
        }
        
        resolve(groupsWithTeams);
      } catch (processingErr) {
        console.error('Ошибка при обработке групп:', processingErr);
        resolve(groups); // В случае ошибки обработки возвращаем хотя бы исходные данные
      }
    });
  });
}

function getGroupById(groupId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM groups WHERE id = ?';
    
    db.get(query, [groupId], async (err, group) => {
      if (err) {
        console.error('Ошибка при получении группы по ID:', err);
        resolve(null);
        return;
      }
      
      if (!group) {
        resolve(null);
        return;
      }
      
      try {
        // Добавляем команды к группе
        const teams = await getTeamsByGroupId(group.id);
        group.teams = teams;
        resolve(group);
      } catch (teamsErr) {
        console.error('Ошибка при получении команд для группы:', teamsErr);
        group.teams = [];
        resolve(group);
      }
    });
  });
}

function createGroup(groupData) {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, stage_id, teams = [] } = groupData;
      
      const query = `
        INSERT INTO groups (name, stage_id)
        VALUES (?, ?)
      `;
      
      const result = db.prepare(query).run(name, stage_id);
      const groupId = result.lastInsertRowid;
      console.log(`Создана группа ${name} с ID ${groupId} для этапа ${stage_id}`);
      
      // Добавляем команды в группу
      if (Array.isArray(teams) && teams.length > 0) {
        console.log(`Добавление ${teams.length} команд в группу ${groupId}:`, JSON.stringify(teams));
        for (const team of teams) {
          await addTeamToGroup(groupId, team.id);
        }
      }
      
      const group = await getGroupById(groupId);
      resolve(group);
    } catch (err) {
      console.error('Ошибка при создании группы:', err);
      reject(err);
    }
  });
}

function updateGroup(groupId, groupData) {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await getGroupById(groupId);
      if (!group) {
        resolve(null);
        return;
      }
      
      const { name, teams = [] } = groupData;
      
      const query = `
        UPDATE groups
        SET name = ?
        WHERE id = ?
      `;
      
      db.prepare(query).run(name, groupId);
      
      // Обновляем команды в группе
      if (Array.isArray(teams)) {
        console.log(`Обновление команд для группы ${groupId}, новые команды:`, JSON.stringify(teams));
        
        // Удаляем все текущие связи
        await removeAllTeamsFromGroup(groupId);
        
        // Добавляем новые команды
        for (const team of teams) {
          await addTeamToGroup(groupId, team.id);
        }
      }
      
      const updatedGroup = await getGroupById(groupId);
      resolve(updatedGroup);
    } catch (err) {
      console.error('Ошибка при обновлении группы:', err);
      reject(err);
    }
  });
}

function deleteGroup(groupId) {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await getGroupById(groupId);
      if (!group) {
        resolve(false);
        return;
      }
      
      // Удаляем связи с командами
      await removeAllTeamsFromGroup(groupId);
      
      // Удаляем матчи группы
      const matches = await getMatchesByGroupId(groupId);
      for (const match of matches) {
        await deleteMatch(match.id);
      }
      
      const query = 'DELETE FROM groups WHERE id = ?';
      db.prepare(query).run(groupId);
      
      resolve(true);
    } catch (err) {
      console.error('Ошибка при удалении группы:', err);
      reject(err);
    }
  });
}

// Функции для работы с командами в группе
function getTeamsByGroupId(groupId) {
  return new Promise((resolve, reject) => {
    if (!groupId) {
      resolve([]);
      return;
    }
    
    const query = `
      SELECT t.id, t.name, gt.matches_played, gt.wins, gt.losses, gt.points
      FROM group_teams gt
      JOIN teams t ON gt.team_id = t.id
      WHERE gt.group_id = ?
      ORDER BY gt.points DESC, gt.wins DESC
    `;
    
    db.all(query, [groupId], (err, teams) => {
      if (err) {
        console.error('Ошибка при получении команд для группы:', err);
        resolve([]);
        return;
      }
      
      resolve(teams);
    });
  });
}

function addTeamToGroup(groupId, teamId) {
  return new Promise((resolve, reject) => {
    try {
      // Проверяем, не добавлена ли уже команда в группу
      const checkQuery = 'SELECT 1 FROM group_teams WHERE group_id = ? AND team_id = ?';
      const exists = db.prepare(checkQuery).get(groupId, teamId);
      
      if (exists) {
        console.log(`Команда с ID ${teamId} уже добавлена в группу ${groupId}`);
        resolve(false);
        return;
      }
      
      const query = `
        INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
        VALUES (?, ?, 0, 0, 0, 0)
      `;
      
      db.prepare(query).run(groupId, teamId);
      console.log(`Команда с ID ${teamId} успешно добавлена в группу ${groupId}`);
      resolve(true);
    } catch (err) {
      console.error(`Ошибка при добавлении команды ${teamId} в группу ${groupId}:`, err);
      reject(err);
    }
  });
}

function removeTeamFromGroup(groupId, teamId) {
  return new Promise((resolve, reject) => {
    try {
      const query = 'DELETE FROM group_teams WHERE group_id = ? AND team_id = ?';
      db.prepare(query).run(groupId, teamId);
      console.log(`Команда с ID ${teamId} успешно удалена из группы ${groupId}`);
      resolve(true);
    } catch (err) {
      console.error(`Ошибка при удалении команды ${teamId} из группы ${groupId}:`, err);
      reject(err);
    }
  });
}

function removeAllTeamsFromGroup(groupId) {
  return new Promise((resolve, reject) => {
    try {
      const query = 'DELETE FROM group_teams WHERE group_id = ?';
      db.prepare(query).run(groupId);
      console.log(`Все команды успешно удалены из группы ${groupId}`);
      resolve(true);
    } catch (err) {
      console.error(`Ошибка при удалении всех команд из группы ${groupId}:`, err);
      reject(err);
    }
  });
}

function updateTeamStats(groupId, teamId, matches_played, wins, losses, points) {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        UPDATE group_teams
        SET matches_played = ?, wins = ?, losses = ?, points = ?
        WHERE group_id = ? AND team_id = ?
      `;
      
      db.prepare(query).run(matches_played, wins, losses, points, groupId, teamId);
      console.log(`Обновлена статистика команды ${teamId} в группе ${groupId}`);
      resolve(true);
    } catch (err) {
      console.error(`Ошибка при обновлении статистики команды ${teamId} в группе ${groupId}:`, err);
      reject(err);
    }
  });
}

// Функции для работы с матчами
function getMatchesByStageId(stageId) {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT m.*, t1.name as team1_name, t2.name as team2_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.stage_id = ? AND m.group_id IS NULL
        ORDER BY m.date
      `;
      
      db.all(query, [stageId], (err, matches) => {
        if (err) {
          console.error('Ошибка при получении матчей этапа:', err);
          resolve([]);
          return;
        }
        
        resolve(matches);
      });
    } catch (err) {
      console.error('Критическая ошибка при получении матчей этапа:', err);
      resolve([]);
    }
  });
}

function getMatchesByGroupId(groupId) {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT m.*, t1.name as team1_name, t2.name as team2_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.group_id = ?
        ORDER BY m.date
      `;
      
      db.all(query, [groupId], (err, matches) => {
        if (err) {
          console.error('Ошибка при получении матчей группы:', err);
          resolve([]);
          return;
        }
        
        resolve(matches);
      });
    } catch (err) {
      console.error('Критическая ошибка при получении матчей группы:', err);
      resolve([]);
    }
  });
}

function getMatchById(matchId) {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT m.*, t1.name as team1_name, t2.name as team2_name
        FROM matches m
        JOIN teams t1 ON m.team1_id = t1.id
        JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.id = ?
      `;
      
      db.get(query, [matchId], (err, match) => {
        if (err) {
          console.error('Ошибка при получении матча:', err);
          resolve(null);
          return;
        }
        
        resolve(match);
      });
    } catch (err) {
      console.error('Критическая ошибка при получении матча:', err);
      resolve(null);
    }
  });
}

function createMatch(matchData) {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        team1_id, team2_id, team1_score, team2_score,
        date, status, location, description, stage_id, group_id
      } = matchData;
      
      const query = `
        INSERT INTO matches 
        (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = db.prepare(query).run(
        team1_id, team2_id, team1_score, team2_score,
        date, status, location, description, stage_id, group_id
      );
      
      const matchId = result.lastInsertRowid;
      
      // Если матч завершен, обновляем статистику команд в группе
      if (status === 'Завершён' && group_id) {
        await updateTeamStatsAfterMatch(group_id, team1_id, team2_id, team1_score, team2_score);
      }
      
      const match = getMatchById(matchId);
      resolve(match);
    } catch (err) {
      console.error('Ошибка при создании матча:', err);
      reject(err);
    }
  });
}

function updateMatch(matchId, matchData) {
  return new Promise(async (resolve, reject) => {
    try {
      const match = getMatchById(matchId);
      if (!match) {
        resolve(null);
        return;
      }
      
      const {
        team1_id, team2_id, team1_score, team2_score,
        date, status, location, description
      } = matchData;
      
      // Если изменился результат завершенного матча, обновляем статистику команд
      if (match.group_id && 
          (match.status !== 'Завершён' && status === 'Завершён' || 
          match.status === 'Завершён' && 
          (match.team1_score !== team1_score || match.team2_score !== team2_score))) {
        
        // Сначала отменяем предыдущий результат
        if (match.status === 'Завершён') {
          await updateTeamStatsAfterMatch(
            match.group_id, 
            match.team1_id, 
            match.team2_id, 
            match.team1_score, 
            match.team2_score, 
            true // Отмена предыдущего результата
          );
        }
        
        // Затем добавляем новый результат
        if (status === 'Завершён') {
          await updateTeamStatsAfterMatch(
            match.group_id,
            team1_id || match.team1_id,
            team2_id || match.team2_id,
            team1_score,
            team2_score
          );
        }
      }
      
      const query = `
        UPDATE matches
        SET team1_id = ?, team2_id = ?, team1_score = ?, team2_score = ?,
            date = ?, status = ?, location = ?, description = ?
        WHERE id = ?
      `;
      
      db.prepare(query).run(
        team1_id || match.team1_id,
        team2_id || match.team2_id,
        team1_score,
        team2_score,
        date || match.date,
        status || match.status,
        location !== undefined ? location : match.location,
        description !== undefined ? description : match.description,
        matchId
      );
      
      const updatedMatch = getMatchById(matchId);
      resolve(updatedMatch);
    } catch (err) {
      console.error('Ошибка при обновлении матча:', err);
      reject(err);
    }
  });
}

function deleteMatch(matchId) {
  return new Promise((resolve, reject) => {
    try {
      const match = getMatchById(matchId);
      if (!match) {
        resolve(false);
        return;
      }
      
      // Если матч был завершен и в группе, отменяем его результат
      if (match.status === 'Завершён' && match.group_id) {
        updateTeamStatsAfterMatch(
          match.group_id,
          match.team1_id,
          match.team2_id,
          match.team1_score,
          match.team2_score,
          true // Отмена
        );
      }
      
      const query = 'DELETE FROM matches WHERE id = ?';
      db.prepare(query).run(matchId);
      
      resolve(true);
    } catch (err) {
      console.error('Ошибка при удалении матча:', err);
      reject(err);
    }
  });
}

// Вспомогательная функция для обновления статистики команд после матча
async function updateTeamStatsAfterMatch(groupId, team1Id, team2Id, team1Score, team2Score, isReversal = false) {
  try {
    // Получаем текущую статистику команд
    const getStatsQuery = 'SELECT * FROM group_teams WHERE group_id = ? AND team_id = ?';
    const team1Stats = db.prepare(getStatsQuery).get(groupId, team1Id) || 
                       { matches_played: 0, wins: 0, losses: 0, points: 0 };
    const team2Stats = db.prepare(getStatsQuery).get(groupId, team2Id) || 
                       { matches_played: 0, wins: 0, losses: 0, points: 0 };
    
    // Определяем, кто победил
    let team1Won = false;
    let team2Won = false;
    
    if (team1Score !== null && team2Score !== null) {
      team1Won = team1Score > team2Score;
      team2Won = team2Score > team1Score;
    }
    
    // Множитель для операции (добавление или вычитание)
    const multiplier = isReversal ? -1 : 1;
    
    // Обновляем статистику команды 1
    let team1UpdatedStats = {
      matches_played: team1Stats.matches_played + (1 * multiplier),
      wins: team1Stats.wins + (team1Won ? 1 : 0) * multiplier,
      losses: team1Stats.losses + (team2Won ? 1 : 0) * multiplier,
      points: team1Stats.points + (team1Won ? 3 : team1Score === team2Score ? 1 : 0) * multiplier
    };
    
    // Обновляем статистику команды 2
    let team2UpdatedStats = {
      matches_played: team2Stats.matches_played + (1 * multiplier),
      wins: team2Stats.wins + (team2Won ? 1 : 0) * multiplier,
      losses: team2Stats.losses + (team1Won ? 1 : 0) * multiplier,
      points: team2Stats.points + (team2Won ? 3 : team1Score === team2Score ? 1 : 0) * multiplier
    };
    
    // Обновляем в базе данных
    await updateTeamStats(
      groupId, team1Id,
      team1UpdatedStats.matches_played,
      team1UpdatedStats.wins,
      team1UpdatedStats.losses,
      team1UpdatedStats.points
    );
    
    await updateTeamStats(
      groupId, team2Id,
      team2UpdatedStats.matches_played,
      team2UpdatedStats.wins,
      team2UpdatedStats.losses,
      team2UpdatedStats.points
    );
    
    return true;
  } catch (err) {
    console.error('Ошибка при обновлении статистики команд после матча:', err);
    throw err;
  }
}

// Экспортируем функции для работы с базой данных
module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  updateTournamentArchiveStatus,
  deleteTournament,
  
  getTeams,
  getTeamById,
  getTeamByCode,
  createTeam,
  updateTeam,
  deleteTeam,
  
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  
  getStagesByTournamentId,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
  
  getGroupsByStageId,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  
  getTeamsByGroupId,
  addTeamToGroup,
  removeTeamFromGroup,
  removeAllTeamsFromGroup,
  updateTeamStats,
  
  getMatchesByStageId,
  getMatchesByGroupId,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
}; 