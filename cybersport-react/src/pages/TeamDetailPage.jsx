import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TeamEditModal from '../components/TeamEditModal';
import '../styles/TeamDetailPage.css';
import { ADMIN_CODE } from '../utils/env';

const TeamDetailPage = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const teamCode = localStorage.getItem('teamCode');
    setIsAdmin(teamCode === ADMIN_CODE);
    
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
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="team-detail-page">
        <div className="not-found">Команда не найдена</div>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      <div className="team-header">
        <h1>{team.name}</h1>
        {isAdmin && (
          <button onClick={handleEdit} className="edit-button">
            Редактировать
          </button>
        )}
      </div>
      
      <div className="team-content">
        <div className="team-info">
          <div className="info-section">
            <h2>Код команды</h2>
            <p>{team.code}</p>
          </div>
          
          <div className="info-section">
            <h2>Участники</h2>
            {team.members && team.members.length > 0 ? (
              <ul className="members-list">
                {team.members.map((member, index) => (
                  <li key={index}>
                    <strong>{member.name}</strong>
                    {member.role && <span> - {member.role}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Нет участников</p>
            )}
          </div>
          
          {team.tournaments && team.tournaments.length > 0 && (
            <div className="info-section">
              <h2>Турниры</h2>
              <ul className="tournaments-list">
                {team.tournaments.map((tournamentId, index) => (
                  <li key={index}>
                    <Link to={`/tournaments/${tournamentId}`}>
                      Турнир #{tournamentId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {showEditModal && (
        <TeamEditModal
          team={team}
          onClose={handleCloseModal}
          onTeamUpdated={handleTeamUpdated}
        />
      )}
    </div>
  );
};

export default TeamDetailPage; 