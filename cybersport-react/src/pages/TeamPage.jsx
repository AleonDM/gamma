import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamPage.css';

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
      if (storedTeamCode === 'admin' || storedTeamCode === teamData.code) {
        setIsAuthorized(true);
      }
      
      // Загружаем турниры команды
      if (teamData.tournaments) {
        let tournamentIds = [];
        try {
          tournamentIds = typeof teamData.tournaments === 'string'
            ? JSON.parse(teamData.tournaments)
            : teamData.tournaments;
          
          if (tournamentIds && tournamentIds.length > 0) {
            try {
              // Пытаемся загрузить турниры из API
              const tournamentsResponse = await axios.get('/api/tournaments');
              
              // Фильтруем турниры по ID
              const teamTournaments = tournamentsResponse.data.filter(tournament => 
                tournamentIds.includes(tournament.id)
              );
              
              setTournaments(teamTournaments);
            } catch (tournErr) {
              console.error('Не удалось загрузить турниры из API:', tournErr);
              
              // Если API недоступен, используем мок-данные для турниров
              setTournaments([
                {
                  id: 1,
                  name: "Турнир по Dota 2",
                  discipline: "dota2",
                  date: new Date().toISOString(),
                  status: "upcoming",
                  prize_pool: "10000 ₽"
                },
                {
                  id: 2,
                  name: "Турнир по CS 2",
                  discipline: "cs2",
                  date: new Date().toISOString(),
                  status: "completed",
                  prize_pool: "5000 ₽"
                }
              ]);
            }
          }
        } catch (parseErr) {
          console.error('Ошибка при парсинге турниров:', parseErr);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных команды:', err);
      setError('Не удалось загрузить информацию о команде');
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
      } else if (teamCode === 'admin') {
        localStorage.setItem('teamCode', 'admin');
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
  
  return (
    <div className="team-page">
      <div className="team-header">
        <div className="team-title-block">
          <h1>{team.name}</h1>
          <div className="team-code">
            Код команды: {isAuthorized ? team.code : '***********'}
          </div>
        </div>
        
        <div className="team-actions">
          {isAuthorized ? (
            <button onClick={handleLogout} className="logout-button">
              Выйти
            </button>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="password"
                placeholder="Введите код команды"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
              />
              <button type="submit" className="login-button">
                Войти
              </button>
            </form>
          )}
          
          <button onClick={() => navigate('/')} className="back-button">
            На главную
          </button>
        </div>
      </div>
      
      <div className="team-content">
        <section className="team-section">
          <h2>Состав команды</h2>
          <div className="team-members-list">
            {members.length > 0 ? (
              members.map((member, index) => (
                <div key={index} className="team-member-item">
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    {member.role && (
                      <span className="member-role">{member.role}</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>Информация о составе команды отсутствует</p>
              </div>
            )}
          </div>
        </section>
        
        {isAuthorized && (
          <section className="team-section">
            <h2>Турниры команды</h2>
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

function getStatusClass(status) {
  switch (status) {
    case 'upcoming':
      return 'upcoming';
    case 'registration':
      return 'registration';
    case 'ongoing':
      return 'live';
    case 'completed':
      return 'completed';
    default:
      return 'default';
  }
}

export default TeamPage; 