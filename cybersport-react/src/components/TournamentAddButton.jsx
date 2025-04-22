import { useState } from 'react';
import TournamentEditModal from './TournamentEditModal';
import './TournamentAddButton.css';

const TournamentAddButton = ({ onTournamentAdded, isMobile = false }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Создаем пустой шаблон турнира
  const emptyTournament = {
    id: null,
    name: '',
    discipline: 'Dota 2',
    date: new Date().toISOString().split('T')[0],
    status: 'Запланирован',
    organizer: '',
    description: '',
    location: ''
  };
  
  const handleClick = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleTournamentAdded = () => {
    onTournamentAdded && onTournamentAdded();
    setShowAddModal(false);
  };
  
  return (
    <>
      <button 
        className={`add-tournament-btn ${isMobile ? 'mobile' : ''}`}
        onClick={handleClick}
      >
        <span className="add-icon">+</span>
        <span className="add-text">Добавить турнир</span>
      </button>
      
      {showAddModal && (
        <TournamentEditModal 
          tournament={emptyTournament}
          onClose={handleCloseModal}
          onTournamentUpdated={handleTournamentAdded}
          isNew={true}
        />
      )}
    </>
  );
};

export default TournamentAddButton; 