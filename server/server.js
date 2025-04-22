const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const db = require('./database');

// Создаем приложение Express
const app = express();
const PORT = process.env.PORT || 3002; // Меняем порт на 3002, чтобы избежать конфликта

// Middleware
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(bodyParser.json()); // Парсим JSON-запросы
app.use(morgan('dev')); // Логируем запросы

// Проверяем, находимся ли мы в режиме разработки (DEV_MODE)
const isDevMode = process.env.NODE_ENV !== 'production';

// Статические файлы из React приложения (только в продакшн режиме)
const reactBuildPath = path.join(__dirname, '../cybersport-react/dist');
if (!isDevMode && fs.existsSync(reactBuildPath)) {
  console.log('Использую собранные статические файлы из dist');
  app.use(express.static(reactBuildPath));
} else {
  console.log('Запуск в режиме разработки: статические файлы недоступны');
}

// Маршруты API для турниров
app.get('/api/tournaments', async (req, res) => {
  try {
    const archived = req.query.archived === 'true';
    const tournaments = await db.getTournaments(archived);
    res.json(tournaments);
  } catch (error) {
    console.error('Ошибка при получении турниров:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении турниров' });
  }
});

app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await db.getTournamentById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    res.json(tournament);
  } catch (error) {
    console.error('Ошибка при получении турнира:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении турнира' });
  }
});

app.post('/api/tournaments', (req, res) => {
  try {
    const tournamentData = req.body;
    // Убедимся, что обязательные поля присутствуют
    if (!tournamentData.name) {
      return res.status(400).json({ error: 'Название турнира обязательно' });
    }
    
    // Здесь не проверяем prize_pool, так как это поле больше не используется
    
    const newTournament = db.createTournament(tournamentData);
    
    res.status(201).json(newTournament);
  } catch (err) {
    console.error('Ошибка при создании турнира:', err);
    res.status(500).json({ error: 'Не удалось создать турнир' });
  }
});

app.put('/api/tournaments/:id', async (req, res) => {
  try {
    const updatedTournament = await db.updateTournament(req.params.id, req.body);
    res.json(updatedTournament);
  } catch (error) {
    console.error('Ошибка при обновлении турнира:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении турнира' });
  }
});

app.post('/api/tournaments/:id/archive', async (req, res) => {
  try {
    const result = await db.updateTournamentArchiveStatus(req.params.id, true);
    res.json(result);
  } catch (error) {
    console.error('Ошибка при архивации турнира:', error);
    res.status(500).json({ error: 'Ошибка сервера при архивации турнира' });
  }
});

app.post('/api/tournaments/:id/restore', async (req, res) => {
  try {
    const result = await db.updateTournamentArchiveStatus(req.params.id, false);
    res.json(result);
  } catch (error) {
    console.error('Ошибка при восстановлении турнира:', error);
    res.status(500).json({ error: 'Ошибка сервера при восстановлении турнира' });
  }
});

app.delete('/api/tournaments/:id', async (req, res) => {
  try {
    const result = await db.deleteTournament(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Ошибка при удалении турнира:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении турнира' });
  }
});

// Маршруты API для команд
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await db.getTeams();
    res.json(teams);
  } catch (error) {
    console.error('Ошибка при получении команд:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении команд' });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await db.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json(team);
  } catch (error) {
    console.error('Ошибка при получении команды:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении команды' });
  }
});

app.get('/api/teams/code/:code', async (req, res) => {
  try {
    const team = await db.getTeamByCode(req.params.code);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json(team);
  } catch (error) {
    console.error('Ошибка при получении команды по коду:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении команды по коду' });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const newTeam = await db.createTeam(req.body);
    res.status(201).json(newTeam);
  } catch (error) {
    console.error('Ошибка при создании команды:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании команды' });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const updatedTeam = await db.updateTeam(req.params.id, req.body);
    res.json(updatedTeam);
  } catch (error) {
    console.error('Ошибка при обновлении команды:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении команды' });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const result = await db.deleteTeam(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Ошибка при удалении команды:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении команды' });
  }
});

// Маршруты API для новостей
app.get('/api/news', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const newsItems = await db.getNews(category);
    res.json(newsItems);
  } catch (error) {
    console.error('Ошибка при получении новостей:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении новостей' });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const newsItem = await db.getNewsById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: 'Новость не найдена' });
    }
    res.json(newsItem);
  } catch (error) {
    console.error('Ошибка при получении новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении новости' });
  }
});

app.post('/api/news', async (req, res) => {
  try {
    const newNewsItem = await db.createNews(req.body);
    res.status(201).json(newNewsItem);
  } catch (error) {
    console.error('Ошибка при создании новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при создании новости' });
  }
});

app.put('/api/news/:id', async (req, res) => {
  try {
    const updatedNewsItem = await db.updateNews(req.params.id, req.body);
    res.json(updatedNewsItem);
  } catch (error) {
    console.error('Ошибка при обновлении новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при обновлении новости' });
  }
});

app.delete('/api/news/:id', async (req, res) => {
  try {
    const result = await db.deleteNews(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Ошибка при удалении новости:', error);
    res.status(500).json({ error: 'Ошибка сервера при удалении новости' });
  }
});

// API эндпоинты для этапов турнира
app.get('/api/tournaments/:tournamentId/stages', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    console.log(`Запрос на получение этапов для турнира ${tournamentId}`);
    
    // Проверяем, существует ли турнир
    const tournament = await db.getTournamentById(tournamentId);
    if (!tournament) {
      console.log(`Турнир с ID ${tournamentId} не найден`);
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    // Получаем этапы турнира
    try {
      // Теперь используем асинхронную функцию с Promise
      const stages = await db.getStagesByTournamentId(tournamentId);
      console.log(`Получено ${stages.length} этапов для турнира ${tournamentId}`);
      
      res.json(stages);
    } catch (stageErr) {
      console.error('Ошибка при получении этапов турнира:', stageErr);
      // Возвращаем пустой массив вместо ошибки
      console.log('Отправляем пустой массив из-за ошибки');
      res.json([]);
    }
  } catch (err) {
    console.error('Ошибка при обработке запроса на получение этапов турнира:', err);
    res.status(500).json({ error: 'Не удалось получить этапы турнира' });
  }
});

app.get('/api/tournaments/:tournamentId/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const stage = await db.getStageById(stageId);
    
    if (!stage) {
      return res.status(404).json({ error: 'Этап не найден' });
    }
    
    res.json(stage);
  } catch (err) {
    console.error('Ошибка при получении этапа:', err);
    res.status(500).json({ error: 'Не удалось получить информацию об этапе' });
  }
});

app.post('/api/tournaments/:tournamentId/stages', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const stageData = req.body;
    
    console.log('Создание этапа:', JSON.stringify(stageData));
    
    const newStage = await db.createStage({
      ...stageData,
      tournament_id: tournamentId
    });
    
    res.status(201).json(newStage);
  } catch (err) {
    console.error('Ошибка при создании этапа:', err);
    res.status(500).json({ error: 'Не удалось создать этап' });
  }
});

app.put('/api/tournaments/:tournamentId/stages/:stageId', async (req, res) => {
  try {
    const { stageId } = req.params;
    const stageData = req.body;
    
    const updatedStage = await db.updateStage(stageId, stageData);
    
    if (!updatedStage) {
      return res.status(404).json({ error: 'Этап не найден' });
    }
    
    res.json(updatedStage);
  } catch (err) {
    console.error('Ошибка при обновлении этапа:', err);
    res.status(500).json({ error: 'Не удалось обновить этап' });
  }
});

app.delete('/api/tournaments/:tournamentId/stages/:stageId', async (req, res) => {
  try {
    const { tournamentId, stageId } = req.params;
    console.log(`Запрос на удаление этапа ${stageId} из турнира ${tournamentId}`);
    
    // Проверяем, существует ли турнир
    const tournament = await db.getTournamentById(tournamentId);
    if (!tournament) {
      console.log(`Турнир с ID ${tournamentId} не найден`);
      return res.status(404).json({ error: 'Турнир не найден' });
    }
    
    const success = await db.deleteStage(stageId);
    
    if (!success) {
      console.log(`Не удалось удалить этап ${stageId} (не найден или произошла ошибка)`);
      return res.status(404).json({ error: 'Этап не найден или не может быть удален' });
    }
    
    console.log(`Этап ${stageId} успешно удален`);
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении этапа:', err);
    res.status(500).json({ error: 'Не удалось удалить этап' });
  }
});

// API эндпоинты для групп в этапах
app.get('/api/tournaments/stages/:stageId/groups', async (req, res) => {
  try {
    const { stageId } = req.params;
    const groups = await db.getGroupsByStageId(stageId);
    res.json(groups);
  } catch (err) {
    console.error('Ошибка при получении групп этапа:', err);
    res.status(500).json({ error: 'Не удалось получить группы этапа' });
  }
});

app.get('/api/tournaments/stages/:stageId/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await db.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }
    
    res.json(group);
  } catch (err) {
    console.error('Ошибка при получении группы:', err);
    res.status(500).json({ error: 'Не удалось получить информацию о группе' });
  }
});

app.post('/api/tournaments/stages/:stageId/groups', async (req, res) => {
  try {
    const { stageId } = req.params;
    const groupData = req.body;
    const newGroup = await db.createGroup({
      ...groupData,
      stage_id: stageId
    });
    
    res.status(201).json(newGroup);
  } catch (err) {
    console.error('Ошибка при создании группы:', err);
    res.status(500).json({ error: 'Не удалось создать группу' });
  }
});

app.put('/api/tournaments/stages/:stageId/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const groupData = req.body;
    
    const updatedGroup = await db.updateGroup(groupId, groupData);
    
    if (!updatedGroup) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }
    
    res.json(updatedGroup);
  } catch (err) {
    console.error('Ошибка при обновлении группы:', err);
    res.status(500).json({ error: 'Не удалось обновить группу' });
  }
});

app.delete('/api/tournaments/stages/:stageId/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const success = await db.deleteGroup(groupId);
    
    if (!success) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении группы:', err);
    res.status(500).json({ error: 'Не удалось удалить группу' });
  }
});

// API эндпоинты для команд в группе
app.get('/api/tournaments/stages/:stageId/groups/:groupId/teams', async (req, res) => {
  try {
    const { groupId } = req.params;
    const teams = await db.getTeamsByGroupId(groupId);
    res.json(teams);
  } catch (err) {
    console.error('Ошибка при получении команд группы:', err);
    res.status(500).json({ error: 'Не удалось получить команды группы' });
  }
});

// Добавить команду в группу
app.post('/api/tournaments/stages/:stageId/groups/:groupId/teams', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { team_id } = req.body;
    
    if (!team_id) {
      return res.status(400).json({ error: 'ID команды обязателен' });
    }
    
    const result = await db.addTeamToGroup(groupId, team_id);
    
    if (!result) {
      return res.status(409).json({ error: 'Команда уже добавлена в группу' });
    }
    
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Ошибка при добавлении команды в группу:', err);
    res.status(500).json({ error: 'Не удалось добавить команду в группу' });
  }
});

// Удалить команду из группы
app.delete('/api/tournaments/stages/:stageId/groups/:groupId/teams/:teamId', async (req, res) => {
  try {
    const { groupId, teamId } = req.params;
    
    const result = await db.removeTeamFromGroup(groupId, teamId);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении команды из группы:', err);
    res.status(500).json({ error: 'Не удалось удалить команду из группы' });
  }
});

// API эндпоинты для матчей этапа/группы
app.get('/api/tournaments/stages/:stageId/matches', async (req, res) => {
  try {
    const { stageId } = req.params;
    const matches = await db.getMatchesByStageId(stageId);
    res.json(matches);
  } catch (err) {
    console.error('Ошибка при получении матчей этапа:', err);
    res.status(500).json({ error: 'Не удалось получить матчи этапа' });
  }
});

app.get('/api/tournaments/stages/:stageId/groups/:groupId/matches', async (req, res) => {
  try {
    const { groupId } = req.params;
    const matches = await db.getMatchesByGroupId(groupId);
    res.json(matches);
  } catch (err) {
    console.error('Ошибка при получении матчей группы:', err);
    res.status(500).json({ error: 'Не удалось получить матчи группы' });
  }
});

app.get('/api/tournaments/stages/:stageId/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await db.getMatchById(matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Матч не найден' });
    }
    
    res.json(match);
  } catch (err) {
    console.error('Ошибка при получении матча:', err);
    res.status(500).json({ error: 'Не удалось получить информацию о матче' });
  }
});

app.post('/api/tournaments/stages/:stageId/matches', async (req, res) => {
  try {
    const { stageId } = req.params;
    const matchData = req.body;
    const newMatch = await db.createMatch({
      ...matchData,
      stage_id: stageId,
      group_id: null
    });
    
    res.status(201).json(newMatch);
  } catch (err) {
    console.error('Ошибка при создании матча:', err);
    res.status(500).json({ error: 'Не удалось создать матч' });
  }
});

app.post('/api/tournaments/stages/:stageId/groups/:groupId/matches', async (req, res) => {
  try {
    const { stageId, groupId } = req.params;
    const matchData = req.body;
    const newMatch = await db.createMatch({
      ...matchData,
      stage_id: stageId,
      group_id: groupId
    });
    
    res.status(201).json(newMatch);
  } catch (err) {
    console.error('Ошибка при создании матча в группе:', err);
    res.status(500).json({ error: 'Не удалось создать матч в группе' });
  }
});

app.put('/api/tournaments/stages/:stageId/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchData = req.body;
    
    const updatedMatch = await db.updateMatch(matchId, matchData);
    
    if (!updatedMatch) {
      return res.status(404).json({ error: 'Матч не найден' });
    }
    
    res.json(updatedMatch);
  } catch (err) {
    console.error('Ошибка при обновлении матча:', err);
    res.status(500).json({ error: 'Не удалось обновить матч' });
  }
});

app.put('/api/tournaments/stages/:stageId/groups/:groupId/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchData = req.body;
    
    const updatedMatch = await db.updateMatch(matchId, matchData);
    
    if (!updatedMatch) {
      return res.status(404).json({ error: 'Матч не найден' });
    }
    
    res.json(updatedMatch);
  } catch (err) {
    console.error('Ошибка при обновлении матча в группе:', err);
    res.status(500).json({ error: 'Не удалось обновить матч в группе' });
  }
});

app.delete('/api/tournaments/stages/:stageId/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const success = await db.deleteMatch(matchId);
    
    if (!success) {
      return res.status(404).json({ error: 'Матч не найден' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении матча:', err);
    res.status(500).json({ error: 'Не удалось удалить матч' });
  }
});

// Для React-роутинга отдаем index.html на все неизвестные маршруты
// Только если мы не в режиме разработки
if (!isDevMode && fs.existsSync(path.join(reactBuildPath, 'index.html'))) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });
} else {
  // В режиме разработки для всех не-API маршрутов отправляем информационное сообщение
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.send(`
        <h1>Сервер API работает в режиме разработки</h1>
        <p>Сервер запущен на порту ${PORT} и обрабатывает только запросы к API.</p>
        <p>Для доступа к frontend-приложению перейдите по адресу, указанному в консоли при запуске React-приложения (обычно http://localhost:5173)</p>
        <p>API endpoints доступны по адресу: <a href="http://localhost:${PORT}/api">http://localhost:${PORT}/api</a></p>
      `);
    } else {
      res.status(404).json({ error: 'API endpoint не найден' });
    }
  });
}

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
  
  if (isDevMode) {
    console.log(`Запущен в режиме разработки - клиент доступен по отдельному адресу (обычно http://localhost:5173)`);
  } else {
    console.log(`Для доступа к приложению перейдите по адресу: http://localhost:${PORT}`);
  }
}); 