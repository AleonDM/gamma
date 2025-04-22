import React from 'react';
import TournamentCard from './TournamentCard';
import './TournamentList.css';

const TournamentList = ({ tournaments, isAdmin, onTournamentUpdated }) => {
  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="no-tournaments">
        <h3>Нет доступных турниров</h3>
        <p>По данному запросу не найдено ни одного турнира</p>
      </div>
    );
  }

  return (
    <div className="tournament-list">
      {tournaments.map(tournament => (
        <div className="tournament-item" key={tournament.id}>
          <TournamentCard 
            tournament={tournament} 
            isAdmin={isAdmin} 
            onTournamentUpdated={onTournamentUpdated}
          />
        </div>
      ))}
    </div>
  );
};

export default TournamentList; 