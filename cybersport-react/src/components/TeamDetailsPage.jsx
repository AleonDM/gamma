import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeamDetailsPage.css';
import { ADMIN_CODE } from '../utils/env';

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
    if (teamCode === ADMIN_CODE) {
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
      <div className="team-details-page loading">
        <div className="loading-spinner"></div>
        <p>Загрузка информации о команде...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-details-page error">
        <div className="error-icon">⚠️</div>
        <h2>Произошла ошибка</h2>
        <p>{error}</p>
        <button className="back-button" onClick={handleBackClick}>
          Вернуться
        </button>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-details-page not-found">
        <div className="not-found-icon">🔍</div>
        <h2>Команда не найдена</h2>
        <p>Запрашиваемая команда не существует или была удалена</p>
        <button className="back-button" onClick={handleBackClick}>
          Вернуться
        </button>
      </div>
    );
  }

  // Обработка участников команды
  const members = Array.isArray(team.members) ? team.members : [];

  return (
    <div className="team-details-page">
      <div className="team-details-header">
        <h1>{team.name}</h1>
        {isAdmin && (
          <button className="edit-team-button" onClick={handleEditClick}>
            Редактировать
          </button>
        )}
      </div>
      
      <div className="team-details-content">
        <div className="team-info-block">
          <div className="team-code-info">
            <h3>Код команды</h3>
            <p>{team.code}</p>
          </div>
        </div>
        
        <div className="team-members-block">
          <h3>Состав команды</h3>
          {members.length > 0 ? (
            <ul className="members-list">
              {members.map((member, index) => (
                <li key={index} className="member-item">
                  <div className="member-name">{member.name}</div>
                  {member.role && <div className="member-role">{member.role}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Нет информации об участниках команды</p>
          )}
          
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