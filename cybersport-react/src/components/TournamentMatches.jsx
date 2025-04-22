import { useState, useEffect } from 'react';
import axios from 'axios';
import MatchCreateModal from './MatchCreateModal';
import { FiEdit2, FiClock, FiCheck, FiMoreHorizontal } from 'react-icons/fi';
import './TournamentMatches.css';

const TournamentMatches = ({ stageId, groupId, isAdmin, onMatchesUpdated }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    loadMatches();
  }, [stageId, groupId]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      let endpoint = `/api/tournaments/stages/${stageId}/matches`;
      if (groupId) {
        endpoint = `/api/tournaments/stages/${stageId}/groups/${groupId}/matches`;
      }
      
      const response = await axios.get(endpoint);
      setMatches(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке матчей:', err);
      setError('Не удалось загрузить матчи');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = () => {
    setSelectedMatch(null);
    setShowMatchModal(true);
  };

  const handleEditMatch = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
  };

  const handleSaveMatch = () => {
    setShowMatchModal(false);
    loadMatches();
    // Вызываем обновление родительского компонента
    if (onMatchesUpdated) onMatchesUpdated();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не назначено';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Запланирован':
        return <FiClock size={16} className="match-status-icon scheduled" />;
      case 'Идёт':
        return <FiMoreHorizontal size={16} className="match-status-icon live" />;
      case 'Завершён':
        return <FiCheck size={16} className="match-status-icon completed" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Запланирован': 'scheduled',
      'Идёт': 'live',
      'Завершён': 'completed',
      'Отменён': 'canceled'
    };
    
    return `match-status-${statusMap[status] || 'scheduled'}`;
  };

  if (loading) {
    return (
      <div className="matches-loading">
        <div className="loading-spinner-sm"></div>
        <p>Загрузка матчей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matches-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="matches-empty">
        <p>Матчи еще не добавлены</p>
        {isAdmin && (
          <button className="add-match-button" onClick={handleAddMatch}>
            + Добавить матч
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="tournament-matches">
      <div className="matches-header">
        <h4>Матчи</h4>
        {isAdmin && (
          <button className="add-match-button" onClick={handleAddMatch}>
            + Добавить матч
          </button>
        )}
      </div>
      
      <div className="matches-list">
        {matches.map(match => (
          <div key={match.id} className={`match-card ${getStatusClass(match.status)}`}>
            <div className="match-info">
              <div className="match-teams">
                <div className="team home-team">
                  <span className="team-name">{match.team1_name}</span>
                  <span className="team-score">{match.team1_score !== null ? match.team1_score : '-'}</span>
                </div>
                <div className="match-vs">vs</div>
                <div className="team away-team">
                  <span className="team-score">{match.team2_score !== null ? match.team2_score : '-'}</span>
                  <span className="team-name">{match.team2_name}</span>
                </div>
              </div>
              
              <div className="match-details">
                <div className="match-status">
                  {getStatusIcon(match.status)}
                  <span>{match.status}</span>
                </div>
                <div className="match-date">{formatDate(match.date)}</div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="match-actions">
                <button 
                  className="match-edit-button" 
                  onClick={() => handleEditMatch(match)}
                  title="Редактировать матч"
                >
                  <FiEdit2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {showMatchModal && (
        <MatchCreateModal 
          stageId={stageId}
          groupId={groupId}
          match={selectedMatch}
          onClose={handleCloseMatchModal}
          onSave={handleSaveMatch}
        />
      )}
    </div>
  );
};

export default TournamentMatches; 