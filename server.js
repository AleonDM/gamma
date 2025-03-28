const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// Раздача статических файлов
app.use(express.static(path.join(__dirname)));
app.use('/groups', express.static(path.join(__dirname, 'groups')));

// API endpoints
const { 
    createTournament, 
    getTournaments, 
    updateTournamentStatus, 
    deleteTournament,
    getTeamByCode,
    createTeam,
    getTeams,
    updateTeam,
    deleteTeam,
    getTournamentById,
    updateTournamentScore,
    getNews,
    createNews,
    updateNews,
    deleteNews,
    getNewsById
} = require('./groups/database');

// Турниры
app.post('/api/tournaments', async (req, res) => {
    try {
        const { title, date, time, team1, team2, status, game } = req.body;
        const result = await createTournament(title, date, time, team1, team2, status, game);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await getTournaments();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tournaments/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await updateTournamentStatus(id, status);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tournaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteTournament(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tournaments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const tournament = await getTournamentById(id);
        if (!tournament) {
            res.status(404).json({ error: 'Турнир не найден' });
            return;
        }
        res.json(tournament);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tournaments/:id/score', async (req, res) => {
    try {
        const { id } = req.params;
        const { scoreTeam1, scoreTeam2 } = req.body;
        const result = await updateTournamentScore(id, scoreTeam1, scoreTeam2);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Команды
app.get('/api/teams/code/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const team = await getTeamByCode(code);
        if (!team) {
            res.status(404).json({ error: 'Команда не найдена' });
            return;
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/teams', async (req, res) => {
    try {
        const teams = await getTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/teams', async (req, res) => {
    try {
        const { name, code, page, members, tournamentIds } = req.body;
        const result = await createTeam(name, code, page, members, tournamentIds);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, page, members, tournamentIds } = req.body;
        const result = await updateTeam(id, name, code, page, members, tournamentIds);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/teams/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteTeam(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Новости
app.get('/api/news', async (req, res) => {
    try {
        const { category } = req.query;
        const news = await getNews(category || 'all');
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await getNewsById(id);
        if (!newsItem) {
            res.status(404).json({ error: 'Новость не найдена' });
            return;
        }
        res.json(newsItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/news', async (req, res) => {
    try {
        const { date, title, content, category } = req.body;
        
        if (!date || !title) {
            res.status(400).json({ error: 'Дата и заголовок обязательны' });
            return;
        }
        
        const result = await createNews(date, title, content, category);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, title, content, category } = req.body;
        
        if (!date || !title) {
            res.status(400).json({ error: 'Дата и заголовок обязательны' });
            return;
        }
        
        const result = await updateNews(id, date, title, content, category);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteNews(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});