import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit2, FiClock, FiCheck, FiMoreHorizontal } from 'react-icons/fi';
import './TournamentMatches.css';

const TournamentMatches = ({ stageId, groupId, isAdmin, onMatchesUpdated }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("TournamentMatches монтирован с параметрами stageId:", stageId, "groupId:", groupId);
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
    // Показать модальное окно для добавления матча
    if (onMatchesUpdated) {
      onMatchesUpdated({ type: 'add', stageId, groupId });
    }
  };

  const handleEditMatch = (match) => {
    // Показать модальное окно для редактирования матча
    if (onMatchesUpdated) {
      onMatchesUpdated({ type: 'edit', match, stageId, groupId });
    }
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditMatch(match);
                  }}
                  title="Редактировать матч"
                  type="button"
                >
                  <FiEdit2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentMatches; 