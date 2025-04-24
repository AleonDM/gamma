const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Путь к файлу базы данных в корне проекта
const dbPath = path.join(__dirname, '..', 'database.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err.message);
  } else {
    console.log('Подключение к базе данных SQLite успешно установлено по пути:', dbPath);
    initDatabase();
  }
});

// Инициализация базы данных
function initDatabase() {
  console.log('Начинаю инициализацию базы данных...');

  // Создаем таблицы последовательно, чтобы убедиться, что они созданы перед добавлением данных
  const createTables = () => {
  // Создаем таблицу турниров, если её еще нет
    db.run(`
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
    `, (err) => {
      if (err) {
        console.error('Ошибка при создании таблицы tournaments:', err);
        return;
      }
      console.log('Таблица tournaments создана');

  // Создаем таблицу команд, если её еще нет
      db.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      members TEXT,
      tournaments TEXT
    )
      `, (err) => {
        if (err) {
          console.error('Ошибка при создании таблицы teams:', err);
          return;
        }
        console.log('Таблица teams создана');

  // Создаем таблицу новостей, если её еще нет
        db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      date TEXT,
      category TEXT
    )
        `, (err) => {
          if (err) {
            console.error('Ошибка при создании таблицы news:', err);
            return;
          }
          console.log('Таблица news создана');
  
  // Создаем таблицу этапов турниров, если её еще нет
          db.run(`
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
          `, (err) => {
            if (err) {
              console.error('Ошибка при создании таблицы stages:', err);
              return;
            }
            console.log('Таблица stages создана');
  
  // Создаем таблицу групп, если её еще нет
            db.run(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stage_id INTEGER NOT NULL,
      FOREIGN KEY (stage_id) REFERENCES stages (id) ON DELETE CASCADE
    )
            `, (err) => {
              if (err) {
                console.error('Ошибка при создании таблицы groups:', err);
                return;
              }
              console.log('Таблица groups создана');
  
  // Создаем таблицу команд в группах, если её еще нет
              db.run(`
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
              `, (err) => {
                if (err) {
                  console.error('Ошибка при создании таблицы group_teams:', err);
                  return;
                }
                console.log('Таблица group_teams создана');
  
  // Создаем таблицу матчей, если её еще нет
                db.run(`
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
                `, (err) => {
                  if (err) {
                    console.error('Ошибка при создании таблицы matches:', err);
                    return;
                  }
                  console.log('Таблица matches создана');
                  console.log('Все таблицы успешно созданы!');
                });
              });
            });
          });
        });
      });
    });
  };

  createTables();
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
          
          // Выводим логи для отладки
          console.log(`Создаем этап с ${groups.length} группами`);
          groups.forEach((group, idx) => {
            console.log(`Группа ${idx + 1}:`, JSON.stringify({
              name: group.name,
              teams: group.teams ? group.teams.length : 0
            }));
          });
          
          // Асинхронно создаем группы
          const createGroupPromises = groups.map(group => {
            // Убедимся, что у нас есть массив teams и ID команд в правильном формате
            const processedGroup = {
              name: group.name,
              stage_id: stageId,
              teams: Array.isArray(group.teams) ? group.teams.map(team => {
                // Если team - это объект с полем id, возвращаем его как есть
                // Если team - это число (id), преобразуем его в объект с полем id
                return typeof team === 'object' ? team : { id: team };
              }) : []
            };
            
            console.log(`Обработанная группа ${processedGroup.name}:`, JSON.stringify({
              teams: processedGroup.teams.map(t => t.id)
            }));
            
            return createGroup(processedGroup);
          });
          
          Promise.all(createGroupPromises)
            .then(createdGroups => {
              console.log(`Успешно создано ${createdGroups.length} групп`);
              
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
              console.log(`Обновление этапа ${stageId}: обрабатываем ${groups.length} групп`);
              
    // Получаем текущие группы
              const currentGroups = await getGroupsByStageId(stageId);
    const currentGroupIds = currentGroups.map(g => g.id);
              
              console.log(`Текущие группы: ${JSON.stringify(currentGroupIds)}`);
    
    // Обрабатываем группы
              for (const group of groups) {
                // Подготавливаем данные группы
                const groupDataToSave = {
                  name: group.name,
                  teams: Array.isArray(group.teams) ? group.teams.map(team => {
                    return typeof team === 'object' ? team : { id: team };
                  }) : []
                };
                
                console.log(`Обработка группы ${group.name} с ${groupDataToSave.teams.length} командами`);
                
      if (group.id) {
        // Обновляем существующую группу
                  console.log(`Обновляем существующую группу ${group.id}`);
                  await updateGroup(group.id, groupDataToSave);
                  
        // Удаляем из списка ID, чтобы отслеживать удаленные группы
        const index = currentGroupIds.indexOf(group.id);
        if (index !== -1) {
          currentGroupIds.splice(index, 1);
        }
      } else {
        // Создаем новую группу
                  console.log(`Создаем новую группу в этапе ${stageId}`);
                  await createGroup({ 
                    ...groupDataToSave, 
                    stage_id: stageId 
                  });
                }
              }
    
    // Удаляем группы, которых нет в обновленном списке
              if (currentGroupIds.length > 0) {
                console.log(`Удаляем группы, которых нет в обновленном списке: ${JSON.stringify(currentGroupIds)}`);
                for (const groupId of currentGroupIds) {
                  await deleteGroup(groupId);
                }
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
      
      console.log(`Начинаем создание группы "${name}" для этапа ${stage_id}`);
      console.log(`У группы ${teams.length} команд для добавления:`, JSON.stringify(teams));
      
      const query = `
        INSERT INTO groups (name, stage_id)
        VALUES (?, ?)
      `;
      
      db.run(query, [name, stage_id], async function(err) {
        if (err) {
          console.error('Ошибка при создании группы:', err);
          reject(err);
          return;
        }
        
        const groupId = this.lastID;
        console.log(`Создана группа ${name} с ID ${groupId} для этапа ${stage_id}`);
      
      // Добавляем команды в группу
      if (Array.isArray(teams) && teams.length > 0) {
          console.log(`Добавление ${teams.length} команд в группу ${groupId}:`, JSON.stringify(teams));
          
          // Обрабатываем добавление команд
        for (const team of teams) {
            if (!team) {
              console.warn('Пустой объект команды, пропускаем');
              continue;
            }
            
            try {
              // Получаем ID команды
              const teamId = typeof team === 'object' ? team.id : (typeof team === 'number' ? team : null);
              
              if (!teamId) {
                console.warn(`Не удалось определить ID команды из ${JSON.stringify(team)}, пропускаем`);
                continue;
              }
              
              console.log(`Добавляем команду ${teamId} в группу ${groupId}`);
              await addTeamToGroup(groupId, teamId);
            } catch (teamError) {
              console.error(`Ошибка при добавлении команды в группу ${groupId}:`, teamError);
            }
        }
      }
      
      const group = await getGroupById(groupId);
        console.log(`Группа ${groupId} создана с ${group.teams ? group.teams.length : 0} командами`);
      resolve(group);
      });
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
      
      console.log(`Обновление группы ${groupId}: ${name} с ${teams.length} командами`);
      
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
          try {
            if (!team) {
              console.warn('Пустой объект команды, пропускаем');
              continue;
            }
            
            // Получаем ID команды
            const teamId = typeof team === 'object' ? team.id : (typeof team === 'number' ? team : null);
            
            if (!teamId) {
              console.warn(`Не удалось определить ID команды из ${JSON.stringify(team)}, пропускаем`);
              continue;
            }
            
            console.log(`Добавляем команду ${teamId} в группу ${groupId}`);
            await addTeamToGroup(groupId, teamId);
          } catch (teamError) {
            console.error(`Ошибка при добавлении команды в группу ${groupId}:`, teamError);
          }
        }
      }
      
      const updatedGroup = await getGroupById(groupId);
      console.log(`Группа ${groupId} обновлена, теперь содержит ${updatedGroup.teams ? updatedGroup.teams.length : 0} команд`);
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
      db.get('SELECT 1 FROM group_teams WHERE group_id = ? AND team_id = ?', [groupId, teamId], (err, row) => {
        if (err) {
          console.error(`Ошибка при проверке команды ${teamId} в группе ${groupId}:`, err);
          reject(err);
          return;
        }
        
        if (row) {
          console.log(`Команда с ID ${teamId} уже добавлена в группу ${groupId}`);
          resolve(false);
          return;
        }
  
  const query = `
    INSERT INTO group_teams (group_id, team_id, matches_played, wins, losses, points)
    VALUES (?, ?, 0, 0, 0, 0)
  `;
  
        db.run(query, [groupId, teamId], function(err) {
          if (err) {
            console.error(`Ошибка при добавлении команды ${teamId} в группу ${groupId}:`, err);
            reject(err);
            return;
          }
          
          console.log(`Команда с ID ${teamId} успешно добавлена в группу ${groupId}`);
          resolve(true);
        });
      });
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
    console.log(`Получение матча с ID ${matchId}`);
    
  const query = `
      SELECT m.*, 
             t1.name as team1_name, 
             t2.name as team2_name
    FROM matches m
      LEFT JOIN teams t1 ON m.team1_id = t1.id
      LEFT JOIN teams t2 ON m.team2_id = t2.id
    WHERE m.id = ?
  `;
  
    db.get(query, [matchId], (err, match) => {
      if (err) {
        console.error(`Ошибка при получении матча с ID ${matchId}:`, err);
        resolve(null);
        return;
      }
      
      if (!match) {
        console.log(`Матч с ID ${matchId} не найден`);
        resolve(null);
        return;
      }
      
      console.log(`Матч с ID ${matchId} успешно получен:`, match);
      resolve(match);
    });
  });
}

function createMatch(matchData) {
  return new Promise(async (resolve, reject) => {
    try {
  const {
    team1_id, team2_id, team1_score, team2_score,
    date, status, location, description, stage_id, group_id
  } = matchData;
      
      // Преобразуем ID в числа для корректного сохранения
      const numericTeam1Id = parseInt(team1_id, 10);
      const numericTeam2Id = parseInt(team2_id, 10);
      const numericStageId = parseInt(stage_id, 10);
      // Если group_id равен null, оставляем его null, иначе преобразуем в число
      const numericGroupId = group_id === null ? null : parseInt(group_id, 10);
      
      console.log(`Создание матча со следующими параметрами:
      - team1_id: ${numericTeam1Id} (исходный ${team1_id}, тип ${typeof team1_id})
      - team2_id: ${numericTeam2Id} (исходный ${team2_id}, тип ${typeof team2_id})
      - stage_id: ${numericStageId} (исходный ${stage_id}, тип ${typeof stage_id})
      - group_id: ${numericGroupId} (исходный ${group_id}, тип ${typeof group_id})
      `);
  
  const query = `
    INSERT INTO matches 
    (team1_id, team2_id, team1_score, team2_score, date, status, location, description, stage_id, group_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
      db.run(query, 
        [numericTeam1Id, numericTeam2Id, team1_score, team2_score,
        date, status, location, description, numericStageId, numericGroupId],
        async function(err) {
          if (err) {
            console.error('Ошибка при создании матча:', err);
            reject(err);
            return;
          }
          
          const matchId = this.lastID;
          console.log(`Создан матч с ID ${matchId}`);
  
  // Если матч завершен, обновляем статистику команд в группе
          if (status === 'Завершён' && numericGroupId) {
            try {
              await updateTeamStatsAfterMatch(numericGroupId, numericTeam1Id, numericTeam2Id, team1_score, team2_score);
            } catch (statsErr) {
              console.error('Ошибка при обновлении статистики команд:', statsErr);
            }
          }
          
          const match = await getMatchById(matchId);
          resolve(match);
        }
      );
    } catch (err) {
      console.error('Ошибка при создании матча:', err);
      reject(err);
    }
  });
}

function updateMatch(matchId, matchData) {
  return new Promise(async (resolve, reject) => {
    try {
      const match = await getMatchById(matchId);
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
          try {
            await updateTeamStatsAfterMatch(
        match.group_id, 
        match.team1_id, 
        match.team2_id, 
        match.team1_score, 
        match.team2_score, 
        true // Отмена предыдущего результата
      );
          } catch (statsErr) {
            console.error('Ошибка при отмене предыдущего результата матча:', statsErr);
          }
    }
    
    // Затем добавляем новый результат
    if (status === 'Завершён') {
          try {
            await updateTeamStatsAfterMatch(
        match.group_id,
        team1_id || match.team1_id,
        team2_id || match.team2_id,
        team1_score,
        team2_score
      );
          } catch (statsErr) {
            console.error('Ошибка при обновлении результата матча:', statsErr);
          }
    }
  }
  
  const query = `
    UPDATE matches
    SET team1_id = ?, team2_id = ?, team1_score = ?, team2_score = ?,
        date = ?, status = ?, location = ?, description = ?
    WHERE id = ?
  `;
  
      db.run(query, 
        [
    team1_id || match.team1_id,
    team2_id || match.team2_id,
    team1_score,
    team2_score,
    date || match.date,
    status || match.status,
    location !== undefined ? location : match.location,
    description !== undefined ? description : match.description,
    matchId
        ],
        async function(err) {
          if (err) {
            console.error('Ошибка при обновлении матча:', err);
            reject(err);
            return;
          }
          
          console.log(`Матч ${matchId} успешно обновлен`);
          const updatedMatch = await getMatchById(matchId);
          resolve(updatedMatch);
        }
      );
    } catch (err) {
      console.error('Ошибка при обновлении матча:', err);
      reject(err);
    }
  });
}

function deleteMatch(matchId) {
  return new Promise(async (resolve, reject) => {
    try {
      const match = await getMatchById(matchId);
      if (!match) {
        resolve(false);
        return;
      }
      
      // Если матч был завершен и в группе, отменяем его результат
      if (match.status === 'Завершён' && match.group_id) {
        try {
          await updateTeamStatsAfterMatch(
          match.group_id,
          match.team1_id,
          match.team2_id,
          match.team1_score,
          match.team2_score,
          true // Отмена
        );
        } catch (statsErr) {
          console.error('Ошибка при отмене результата матча:', statsErr);
        }
      }
      
      const query = 'DELETE FROM matches WHERE id = ?';
      db.run(query, [matchId], function(err) {
        if (err) {
          console.error('Ошибка при удалении матча:', err);
          reject(err);
          return;
        }
        
        console.log(`Матч ${matchId} успешно удален`);
      resolve(true);
      });
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
    return new Promise((resolve, reject) => {
      // Получаем текущую статистику для первой команды
      db.get(
        'SELECT * FROM group_teams WHERE group_id = ? AND team_id = ?', 
        [groupId, team1Id], 
        (err1, team1Stats) => {
          if (err1) {
            console.error('Ошибка при получении статистики команды 1:', err1);
            reject(err1);
            return;
          }
          
          // Получаем текущую статистику для второй команды
          db.get(
            'SELECT * FROM group_teams WHERE group_id = ? AND team_id = ?', 
            [groupId, team2Id], 
            (err2, team2Stats) => {
              if (err2) {
                console.error('Ошибка при получении статистики команды 2:', err2);
                reject(err2);
                return;
              }
              
              // Используем значения по умолчанию, если статистики нет
              team1Stats = team1Stats || { matches_played: 0, wins: 0, losses: 0, points: 0 };
              team2Stats = team2Stats || { matches_played: 0, wins: 0, losses: 0, points: 0 };
  
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
  
              // Обновляем в базе данных для команды 1
              db.run(
                `UPDATE group_teams
                 SET matches_played = ?, wins = ?, losses = ?, points = ?
                 WHERE group_id = ? AND team_id = ?`,
                [
    team1UpdatedStats.matches_played,
    team1UpdatedStats.wins,
    team1UpdatedStats.losses,
                  team1UpdatedStats.points,
                  groupId,
                  team1Id
                ],
                (err1Update) => {
                  if (err1Update) {
                    console.error('Ошибка при обновлении статистики команды 1:', err1Update);
                    reject(err1Update);
                    return;
                  }
                  
                  // Обновляем в базе данных для команды 2
                  db.run(
                    `UPDATE group_teams
                     SET matches_played = ?, wins = ?, losses = ?, points = ?
                     WHERE group_id = ? AND team_id = ?`,
                    [
    team2UpdatedStats.matches_played,
    team2UpdatedStats.wins,
    team2UpdatedStats.losses,
                      team2UpdatedStats.points,
                      groupId,
                      team2Id
                    ],
                    (err2Update) => {
                      if (err2Update) {
                        console.error('Ошибка при обновлении статистики команды 2:', err2Update);
                        reject(err2Update);
                        return;
                      }
                      
                      console.log('Статистика команд успешно обновлена');
                      resolve(true);
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
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