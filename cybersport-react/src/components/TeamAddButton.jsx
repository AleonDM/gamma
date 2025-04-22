import { useState } from 'react';
import TeamEditModal from './TeamEditModal';
import './TeamAddButton.css';

const TeamAddButton = ({ onTeamAdded }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Создаем пустой шаблон команды
  const emptyTeam = {
    id: null,
    name: '',
    code: '',
    members: [], // пустой массив участников
    tournaments: []
  };
  
  const handleClick = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleTeamAdded = () => {
    onTeamAdded && onTeamAdded();
    setShowAddModal(false);
  };
  
  return (
    <>
      <button 
        className="add-team-btn"
        onClick={handleClick}
      >
        <span className="add-icon">+</span>
        <span className="add-text">Добавить команду</span>
      </button>
      
      {showAddModal && (
        <TeamEditModal 
          team={emptyTeam}
          onClose={handleCloseModal}
          onTeamUpdated={handleTeamAdded}
          isNew={true}
        />
      )}
    </>
  );
};

export default TeamAddButton; 