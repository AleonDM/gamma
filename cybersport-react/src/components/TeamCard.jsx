import { useState } from 'react';
import { Link } from 'react-router-dom';
import TeamEditModal from './TeamEditModal';
import './TeamCard.css';

const TeamCard = ({ team, isAdmin, onTeamUpdated }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Преобразуем JSON строку в объект при необходимости
  const members = typeof team.members === 'string' 
    ? JSON.parse(team.members) 
    : team.members || [];
    
  const tournaments = typeof team.tournaments === 'string'
    ? JSON.parse(team.tournaments)
    : team.tournaments || [];

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };
  
  return (
    <>
      <div className="team-card">
        <div className="team-card-header">
          <h3 className="team-name">{team.name}</h3>
          <span className="team-code">Код: {team.code}</span>
        </div>
        
        <div className="team-content">
          <div className="team-members">
            <h4>Участники:</h4>
            {members.length > 0 ? (
              <ul className="members-list">
                {members.map((member, index) => (
                  <li key={index} className="member-item">
                    <span className="member-name">{member.name}</span>
                    {member.role && <span className="member-role">({member.role})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-members">Нет участников</p>
            )}
          </div>
          
          {tournaments.length > 0 && (
            <div className="team-tournaments">
              <h4>Турниры:</h4>
              <ul className="tournaments-list">
                {tournaments.map((tournament, index) => (
                  <li key={index} className="tournament-item">
                    <span>{tournament.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="team-card-actions">
          <Link to={`/team/${team.id}`} className="view-button">
            Подробнее
          </Link>
          
          {isAdmin && (
            <button onClick={handleEdit} className="edit-button">
              Редактировать
            </button>
          )}
        </div>
      </div>
      
      {showEditModal && (
        <TeamEditModal 
          team={team}
          onClose={handleCloseModal}
          onTeamUpdated={onTeamUpdated}
        />
      )}
    </>
  );
};

export default TeamCard; 