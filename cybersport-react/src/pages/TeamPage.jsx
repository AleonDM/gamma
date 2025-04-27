import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamPage.css';
import { ADMIN_CODE } from '../utils/env';

const TeamPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Проверяем, имеет ли пользователь права на эту команду
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  
  useEffect(() => {
    // Проверяем, есть ли сохраненный код команды
    const storedTeamCode = localStorage.getItem('teamCode');
    if (storedTeamCode) {
      setTeamCode(storedTeamCode);
    }
    
    loadTeamData();
  }, [teamId]);
  
  const loadTeamData = async () => {
    try {
      setLoading(true);
      
      // Временное решение для демо: создаем мок-данные для команды
      // В реальном приложении нужно использовать API
      let teamData;
      
      try {
        // Пытаемся загрузить данные от API
        const teamResponse = await axios.get(`/api/teams/${teamId}`);
        teamData = teamResponse.data;
      } catch (apiErr) {
        console.error('Не удалось загрузить данные команды из API:', apiErr);
        
        // Если API недоступен, используем мок-данные
        teamData = {
          id: parseInt(teamId) || 1,
          name: `Команда ${teamId}`,
          code: teamId === "1" ? "team1" : "team2", // Для демо используем простые коды
          members: JSON.stringify([
            { name: "Игрок 1", role: "Капитан" },
            { name: "Игрок 2", role: "Поддержка" },
            { name: "Игрок 3", role: "Керри" }
          ]),
          tournaments: JSON.stringify([1, 2])
        };
      }
      
      setTeam(teamData);
      
      // Проверяем авторизацию
      const storedTeamCode = localStorage.getItem('teamCode');
      if (storedTeamCode === ADMIN_CODE || storedTeamCode === teamData.code) {
        setIsAuthorized(true);
      }
      
      // Загружаем турниры команды
      try {
        const tournamentsIds = typeof teamData.tournaments === 'string' 
          ? JSON.parse(teamData.tournaments) 
          : teamData.tournaments;
        
        if (Array.isArray(tournamentsIds) && tournamentsIds.length > 0) {
          // В реальном приложении здесь должен быть запрос к API для получения турниров
          const tournamentsData = [];
          
          // Пробуем загрузить турниры из API
          for (const tournamentId of tournamentsIds) {
            try {
              const tournamentResponse = await axios.get(`/api/tournaments/${tournamentId}`);
              tournamentsData.push(tournamentResponse.data);
            } catch (err) {
              console.error(`Не удалось загрузить информацию о турнире ${tournamentId}:`, err);
              // Добавляем заглушку, если не удалось загрузить данные
              tournamentsData.push({
                id: tournamentId,
                name: `Турнир ${tournamentId}`,
                date: new Date().toISOString(),
                status: 'upcoming',
                discipline: 'Не указано'
              });
            }
          }
          
          setTournaments(tournamentsData);
        }
      } catch (err) {
        console.error('Ошибка при загрузке турниров команды:', err);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных команды:', err);
      setError('Не удалось загрузить информацию о команде. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('teamCode');
    setIsAuthorized(false);
    setTeamCode('');
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!teamCode.trim()) {
      setError('Пожалуйста, введите код команды');
      return;
    }
    
    try {
      if (team && teamCode === team.code) {
        localStorage.setItem('teamCode', teamCode);
        setIsAuthorized(true);
        setError(null);
      } else if (teamCode === ADMIN_CODE) {
        localStorage.setItem('teamCode', ADMIN_CODE);
        setIsAuthorized(true);
        setError(null);
      } else {
        setError('Неверный код команды');
      }
    } catch (err) {
      console.error('Ошибка авторизации:', err);
      setError('Произошла ошибка авторизации');
    }
  };
  
  if (loading) {
    return (
      <div className="team-page loading">
        <div className="loading-message">
          <p>Загрузка информации о команде...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="team-page">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }
  
  if (!team) {
    return (
      <div className="team-page">
        <div className="error-message">
          <p>Команда не найдена</p>
          <button onClick={() => navigate('/')} className="back-button">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }
  
  // Парсим участников команды, если они представлены строкой
  const members = typeof team.members === 'string' 
    ? JSON.parse(team.members) 
    : team.members || [];
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming':
      case 'Запланирован':
        return 'upcoming';
      case 'registration':
      case 'Регистрация':
        return 'registration';
      case 'ongoing':
      case 'Идёт':
        return 'ongoing';
      case 'completed':
      case 'Окончен':
        return 'completed';
      default:
        return 'unknown';
    }
  };
  
  return (
    <div className="team-page">
      <div className="team-header">
        <h1>{team.name}</h1>
        
        {isAuthorized ? (
          <button onClick={handleLogout} className="team-logout-button">
            Выйти
          </button>
        ) : (
          <div className="team-login-form">
            <form onSubmit={handleLogin}>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Введите код команды"
              />
              <button type="submit">Войти</button>
            </form>
            {error && <div className="login-error">{error}</div>}
          </div>
        )}
      </div>
      
      <div className="team-content">
        <section className="team-section">
          <h2 className="section-title">Участники команды</h2>
          {members.length > 0 ? (
            <div className="team-members">
              {members.map((member, index) => (
                <div key={index} className="team-member">
                  <h3>{member.name}</h3>
                  {member.role && <p className="member-role">{member.role}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>У команды пока нет участников</p>
            </div>
          )}
        </section>
        
        {isAuthorized && (
          <section className="team-section">
            <h2 className="section-title">Турниры команды</h2>
            <div className="team-tournaments-list">
              {tournaments.length > 0 ? (
                tournaments.map(tournament => (
                  <div key={tournament.id} className="team-tournament-item">
                    <div className="tournament-info">
                      <span className="tournament-name">{tournament.name}</span>
                      <span className="tournament-date">{new Date(tournament.date).toLocaleDateString('ru-RU')}</span>
                      <span className={`tournament-status status-${getStatusClass(tournament.status)}`}>
                        {getStatusText(tournament.status)}
                      </span>
                      {tournament.result && (
                        <span className={`tournament-place place-${tournament.result.place}`}>
                          {tournament.result.place} место
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>Команда пока не участвовала в турнирах</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Вспомогательные функции
function getStatusText(status) {
  switch (status) {
    case 'upcoming':
      return 'Предстоящий';
    case 'registration':
      return 'Открыта регистрация';
    case 'ongoing':
      return 'Проходит';
    case 'completed':
      return 'Завершен';
    default:
      return status;
  }
}

export default TeamPage; 