import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TeamEditModal from '../components/TeamEditModal';
import '../styles/TeamDetailPage.css';

const TeamDetailPage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const teamCode = localStorage.getItem('teamCode');
    setIsAdmin(teamCode === 'admin123');
    
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teams/${id}`);
      
      // Парсим members и tournaments из JSON если они в строковом формате
      const loadedTeam = response.data;
      if (typeof loadedTeam.members === 'string') {
        loadedTeam.members = JSON.parse(loadedTeam.members);
      }
      if (typeof loadedTeam.tournaments === 'string') {
        loadedTeam.tournaments = JSON.parse(loadedTeam.tournaments);
      }
      
      setTeam(loadedTeam);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке информации о команде:', err);
      setError('Не удалось загрузить информацию о команде');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  const handleTeamUpdated = (updatedTeam) => {
    setTeam(updatedTeam);
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="team-detail-page">
        <div className="loading">Загрузка информации о команде...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-detail-page">
        <div className="error">
          <p>{error}</p>
          <Link to="/teams" className="back-button">Вернуться к списку команд</Link>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-page">
        <div className="error">
          <p>Команда не найдена</p>
          <Link to="/teams" className="back-button">Вернуться к списку команд</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      <div className="team-detail-container">
        <div className="team-detail-header">
          <div className="team-title-block">
            <h1>{team.name}</h1>
            <span className="team-code">Код команды: {team.code}</span>
          </div>
          <div className="team-actions">
            {isAdmin && (
              <button onClick={handleEdit} className="edit-button">
                Редактировать
              </button>
            )}
            <Link to="/teams" className="back-button">
              Назад к списку
            </Link>
          </div>
        </div>

        <div className="team-detail-content">
          <div className="team-section">
            <h2>Участники команды</h2>
            {team.members && team.members.length > 0 ? (
              <ul className="team-members-list">
                {team.members.map((member, index) => (
                  <li key={index} className="team-member-item">
                    <div className="member-info">
                      <span className="member-name">{member.name}</span>
                      <span className="member-role">{member.role}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Нет участников в команде</p>
            )}
          </div>

          <div className="team-section">
            <h2>Турниры команды</h2>
            {team.tournaments && team.tournaments.length > 0 ? (
              <ul className="team-tournaments-list">
                {team.tournaments.map((tournament, index) => (
                  <li key={index} className="team-tournament-item">
                    <Link to={`/tournaments/${tournament.id}`} className="tournament-link">
                      <div className="tournament-info">
                        <span className="tournament-name">{tournament.name}</span>
                        <span className="tournament-date">{new Date(tournament.date).toLocaleDateString()}</span>
                      </div>
                      <div className="tournament-result">
                        <span className={`tournament-place place-${tournament.place}`}>
                          {tournament.place <= 3 ? `${tournament.place} место` : tournament.place}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Нет турниров у команды</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <TeamEditModal
          team={team}
          onClose={handleCloseModal}
          onTeamUpdated={handleTeamUpdated}
          isNewTeam={false}
        />
      )}
    </div>
  );
};

export default TeamDetailPage; 