import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import TournamentStages from '../components/TournamentStages';
import StageCreateModal from '../components/StageCreateModal';
import MatchCreateModal from '../components/MatchCreateModal';
import './TournamentPage.css';

const TournamentPage = ({ isAdmin }) => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchData, setMatchData] = useState({
    stageId: null,
    groupId: null,
    match: null
  });

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const loadTournamentData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tournaments/${tournamentId}`);
      setTournament(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке данных турнира:', err);
      setError('Не удалось загрузить информацию о турнире');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    setSelectedStage(null);
    setShowStageModal(true);
  };

  const handleEditStage = (stage) => {
    setSelectedStage(stage);
    setShowStageModal(true);
  };

  const handleCloseStageModal = () => {
    setShowStageModal(false);
  };

  const handleSaveStage = () => {
    setShowStageModal(false);
    loadTournamentData();
  };

  const handleMatchesUpdated = (data) => {
    if (data.type === 'add' || data.type === 'edit') {
      setMatchData({
        stageId: data.stageId,
        groupId: data.groupId,
        match: data.match || null
      });
      setShowMatchModal(true);
    }
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
  };

  const handleSaveMatch = () => {
    setShowMatchModal(false);
    loadTournamentData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Запланирован': 'upcoming',
      'Идёт': 'active',
      'Перенесён': 'upcoming',
      'Окончен': 'completed',
      'Отменён': 'canceled'
    };
    
    return `status-${statusMap[status] || 'upcoming'}`;
  };

  if (loading) {
    return (
      <div className="tournament-page loading">
        <div className="loading-spinner"></div>
        <p>Загрузка информации о турнире...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tournament-page error">
        <div className="error-icon">⚠️</div>
        <h2>Произошла ошибка</h2>
        <p>{error}</p>
        <Link to="/" className="back-home">Вернуться на главную</Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="tournament-page not-found">
        <div className="not-found-icon">🔍</div>
        <h2>Турнир не найден</h2>
        <p>Запрашиваемый турнир не существует или был удален</p>
        <Link to="/" className="back-home">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="tournament-page">
      <div className="tournament-header">
        <div className="tournament-back">
          <Link to="/" className="back-button">
            ← Вернуться к списку
          </Link>
        </div>
        
        <div className="tournament-title-section">
          <h1>{tournament.name}</h1>
          <div className="tournament-meta">
            <span className={`tournament-status ${getStatusClass(tournament.status)}`}>
              {tournament.status}
            </span>
            <span className="tournament-date">
              {formatDate(tournament.date)}
            </span>
            <span className="tournament-discipline">
              {tournament.discipline}
            </span>
          </div>
        </div>
      </div>
      
      <div className="tournament-details-section">
        <div className="tournament-info-block">
          {tournament.organizer && (
            <div className="tournament-info-item">
              <h3>Организатор</h3>
              <p>{tournament.organizer}</p>
            </div>
          )}
          
          {tournament.location && (
            <div className="tournament-info-item">
              <h3>Место проведения</h3>
              <p>{tournament.location}</p>
            </div>
          )}
        </div>
        
        {tournament.description && (
          <div className="tournament-description-block">
            <h3>Описание турнира</h3>
            <p>{tournament.description}</p>
          </div>
        )}
      </div>
      
      <div className="tournament-stages-section">
        <div className="section-header">
          <h2>Этапы турнира</h2>
          {isAdmin && (
            <button className="add-stage-button" onClick={handleAddStage}>
              + Добавить этап
            </button>
          )}
        </div>
        
        <TournamentStages 
          tournamentId={tournamentId} 
          isAdmin={isAdmin}
          onEditStage={handleEditStage}
          onStageUpdated={loadTournamentData}
          onMatchesUpdated={handleMatchesUpdated}
        />
      </div>
      
      {showStageModal && (
        <StageCreateModal 
          tournamentId={tournamentId}
          stage={selectedStage}
          onClose={handleCloseStageModal}
          onSave={handleSaveStage}
        />
      )}
      
      {showMatchModal && (
        <MatchCreateModal 
          stageId={matchData.stageId}
          groupId={matchData.groupId}
          match={matchData.match}
          onClose={handleCloseMatchModal}
          onSave={handleSaveMatch}
        />
      )}
    </div>
  );
};

export default TournamentPage; 