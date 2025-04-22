import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamDetailsPage.css';

const TeamDetailsPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Проверяем, является ли текущий пользователь администратором
    const teamCode = localStorage.getItem('teamCode');
    if (teamCode === 'admin') {
      setIsAdmin(true);
    }

    // Загружаем данные о команде
    const loadTeam = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/teams/${teamId}`);
        
        // Обрабатываем данные, если они в строковом формате
        const teamData = response.data;
        if (typeof teamData.members === 'string') {
          teamData.members = JSON.parse(teamData.members);
        }
        if (typeof teamData.tournaments === 'string') {
          teamData.tournaments = JSON.parse(teamData.tournaments);
        }
        
        setTeam(teamData);
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке данных о команде:', err);
        setError('Не удалось загрузить информацию о команде. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [teamId]);

  const handleEditClick = () => {
    navigate(`/admin/teams/edit/${teamId}`);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="team-details-page">
        <div className="team-details-loading">
          Загрузка информации о команде...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-details-page">
        <div className="team-details-error">
          {error}
          <button className="back-button" onClick={handleBackClick}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-details-page">
        <div className="team-details-error">
          Команда не найдена
          <button className="back-button" onClick={handleBackClick}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="team-details-page">
      <div className="team-details-header">
        <button className="back-button" onClick={handleBackClick}>
          &larr; Назад
        </button>
        <h1>{team.name}</h1>
        {isAdmin && (
          <button className="edit-button" onClick={handleEditClick}>
            Редактировать
          </button>
        )}
      </div>
      
      <div className="team-details-content">
        <div className="team-info-section">
          <div className="team-info-card">
            <div className="team-code">
              <h3>Код команды</h3>
              <p>{team.code}</p>
            </div>
            
            <div className="team-members">
              <h3>Участники</h3>
              {team.members && team.members.length > 0 ? (
                <ul className="members-list">
                  {team.members.map((member, index) => (
                    <li key={index} className="member-item">
                      <div className="member-name">{member.name}</div>
                      {member.role && <div className="member-role">{member.role}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">Нет участников</p>
              )}
            </div>
          </div>
          
          {team.tournaments && team.tournaments.length > 0 && (
            <div className="team-tournaments">
              <h3>Участие в турнирах</h3>
              <ul className="tournaments-list">
                {team.tournaments.map((tournament, index) => (
                  <li key={index} className="tournament-item">
                    <Link to={`/tournaments/${tournament.id}`} className="tournament-link">
                      {tournament.name}
                    </Link>
                    <span className="tournament-discipline">{tournament.discipline}</span>
                    <span className="tournament-date">{tournament.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsPage; 