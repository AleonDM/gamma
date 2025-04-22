import { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentMatches from './TournamentMatches';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './TournamentStages.css';

const TournamentStages = ({ tournamentId, isAdmin, onEditStage, onStageUpdated }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    loadStages();
  }, [tournamentId]);

  const loadStages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tournaments/${tournamentId}/stages`);
      
      // Проверяем, является ли response.data массивом
      const stagesData = Array.isArray(response.data) ? response.data : [];
      
      // Проверяем, содержит ли каждый этап все необходимые поля
      const validStages = stagesData.filter(stage => 
        stage && 
        typeof stage === 'object' && 
        stage.id && 
        stage.name && 
        stage.format
      );
      
      setStages(validStages);
      
      // По умолчанию раскрываем все текущие стадии
      const currentStages = {};
      validStages.forEach(stage => {
        if (stage.status === 'Идёт') {
          currentStages[stage.id] = true;
        }
      });
      
      setExpandedStages(currentStages);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке этапов турнира:', err);
      setError('Не удалось загрузить этапы турнира');
    } finally {
      setLoading(false);
    }
  };

  const toggleStage = (stageId) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleEdit = (stage) => {
    onEditStage && onEditStage(stage);
  };

  const handleDelete = async (stageId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот этап? Все данные будут потеряны.')) {
      try {
        await axios.delete(`/api/tournaments/${tournamentId}/stages/${stageId}`);
        loadStages();
        onStageUpdated && onStageUpdated();
      } catch (err) {
        console.error('Ошибка при удалении этапа:', err);
        alert('Не удалось удалить этап. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'Не начат': 'not-started',
      'Идёт': 'in-progress',
      'Завершён': 'completed',
      'Отменён': 'canceled'
    };
    
    return `status-${statusMap[status] || 'not-started'}`;
  };

  if (loading) {
    return (
      <div className="stages-loading">
        <div className="loading-spinner-sm"></div>
        <p>Загрузка этапов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stages-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className="stages-empty">
        <p>Для этого турнира еще не добавлены этапы</p>
      </div>
    );
  }

  return (
    <div className="tournament-stages">
      {stages.map(stage => (
        <div key={stage.id} className={`stage-block ${stage.status === 'Идёт' ? 'active' : ''}`}>
          <div className="stage-header" onClick={() => toggleStage(stage.id)}>
            <div className="stage-info">
              <h3>{stage.name}</h3>
              <span className={`stage-status ${getStatusClass(stage.status)}`}>
                {stage.status}
              </span>
            </div>
            
            <div className="stage-actions">
              {isAdmin && (
                <div className="admin-buttons" onClick={e => e.stopPropagation()}>
                  <button 
                    className="stage-edit-button" 
                    onClick={() => handleEdit(stage)}
                    title="Редактировать этап"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button 
                    className="stage-delete-button" 
                    onClick={() => handleDelete(stage.id)}
                    title="Удалить этап"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )}
              <div className="expand-icon">
                {expandedStages[stage.id] ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
            </div>
          </div>
          
          {expandedStages[stage.id] && (
            <div className="stage-content">
              {stage.format === 'groups' && stage.groups && stage.groups.length > 0 ? (
                <div className="groups-container">
                  <h4>Группы</h4>
                  
                  {stage.groups.map(group => (
                    <div key={group.id} className="group-block">
                      <div 
                        className="group-header" 
                        onClick={() => toggleGroup(group.id)}
                      >
                        <h5>{group.name}</h5>
                        <div className="expand-icon">
                          {expandedGroups[group.id] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        </div>
                      </div>
                      
                      {expandedGroups[group.id] && (
                        <div className="group-content">
                          {/* Таблица команд и статистика */}
                          <div className="group-teams">
                            <table className="standings-table">
                              <thead>
                                <tr>
                                  <th>Команда</th>
                                  <th>И</th>
                                  <th>В</th>
                                  <th>П</th>
                                  <th>О</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.teams && group.teams.map(team => (
                                  <tr key={team.id}>
                                    <td>{team.name}</td>
                                    <td>{team.matches_played || 0}</td>
                                    <td>{team.wins || 0}</td>
                                    <td>{team.losses || 0}</td>
                                    <td><strong>{team.points || 0}</strong></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Матчи в группе */}
                          <TournamentMatches 
                            stageId={stage.id} 
                            groupId={group.id}
                            isAdmin={isAdmin}
                            onMatchesUpdated={loadStages}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : stage.format === 'bracket' ? (
                <div className="bracket-container">
                  <h4>Сетка матчей</h4>
                  <TournamentMatches 
                    stageId={stage.id}
                    isAdmin={isAdmin}
                    onMatchesUpdated={loadStages}
                  />
                </div>
              ) : (
                <div className="no-format">
                  {isAdmin ? 
                    <p>Редактируйте этап, чтобы настроить формат и добавить группы или матчи</p> :
                    <p>Формат проведения еще не определен</p>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TournamentStages; 