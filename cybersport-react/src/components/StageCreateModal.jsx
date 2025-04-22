import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './StageCreateModal.css';

const StageCreateModal = ({ tournamentId, stage, onClose, onSave }) => {
  const isNew = !stage;
  const modalRef = useRef(null);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    format: 'groups',
    status: 'Не начат',
    start_date: '',
    end_date: '',
    description: '',
    groups: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamSearch, setTeamSearch] = useState('');
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  
  useEffect(() => {
    // Загружаем список команд для выбора
    const loadTeams = async () => {
      try {
        const response = await axios.get('/api/teams');
        setTeams(response.data);
        setFilteredTeams(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке команд:', err);
      }
    };
    
    loadTeams();
    
    // Если редактируем существующий этап, загружаем его данные
    if (stage) {
      setFormData({
        name: stage.name || '',
        format: stage.format || 'groups',
        status: stage.status || 'Не начат',
        start_date: stage.start_date || '',
        end_date: stage.end_date || '',
        description: stage.description || '',
        groups: stage.groups || []
      });
    } else {
      // Для нового этапа добавляем одну пустую группу по умолчанию
      setFormData({
        ...formData,
        groups: [{ name: 'Группа A', teams: [] }]
      });
    }
    
    // Обработчик клика вне модального окна
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [stage, tournamentId]);
  
  useEffect(() => {
    // Фильтрация команд при поиске
    if (teamSearch.trim() === '') {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team => 
        team.name.toLowerCase().includes(teamSearch.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [teamSearch, teams]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleGroupNameChange = (index, name) => {
    const updatedGroups = [...formData.groups];
    updatedGroups[index].name = name;
    setFormData({
      ...formData,
      groups: updatedGroups
    });
  };
  
  const addGroup = () => {
    const groupLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextLetter = groupLetters[formData.groups.length % 26];
    
    setFormData({
      ...formData,
      groups: [
        ...formData.groups,
        { name: `Группа ${nextLetter}`, teams: [] }
      ]
    });
    
    // Переключаемся на новую группу
    setCurrentGroup(formData.groups.length);
  };
  
  const removeGroup = (index) => {
    if (formData.groups.length <= 1) {
      return; // Должна остаться хотя бы одна группа
    }
    
    const updatedGroups = formData.groups.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      groups: updatedGroups
    });
    
    // Корректируем активную группу
    if (currentGroup >= updatedGroups.length) {
      setCurrentGroup(updatedGroups.length - 1);
    }
  };
  
  const addTeamToGroup = (team) => {
    // Проверяем, есть ли уже эта команда в текущей группе
    const isTeamInGroup = formData.groups[currentGroup].teams.some(
      t => t.id === team.id
    );
    
    if (isTeamInGroup) {
      return;
    }
    
    const updatedGroups = [...formData.groups];
    updatedGroups[currentGroup].teams = [
      ...updatedGroups[currentGroup].teams,
      { id: team.id, name: team.name }
    ];
    
    setFormData({
      ...formData,
      groups: updatedGroups
    });
    
    // Очищаем поле поиска
    setTeamSearch('');
  };
  
  const removeTeamFromGroup = (teamId) => {
    const updatedGroups = [...formData.groups];
    updatedGroups[currentGroup].teams = updatedGroups[currentGroup].teams.filter(
      team => team.id !== teamId
    );
    
    setFormData({
      ...formData,
      groups: updatedGroups
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Название этапа обязательно');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let newStageId;
      
      if (isNew) {
        // Создаем новый этап без групп сначала
        const stageToCreate = {
          name: formData.name,
          format: formData.format,
          status: formData.status,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description
        };
        
        const response = await axios.post(`/api/tournaments/${tournamentId}/stages`, stageToCreate);
        newStageId = response.data.id;
        
        // Затем создаем группы для этого этапа
        if (formData.format === 'groups' && formData.groups.length > 0) {
          try {
            for (const group of formData.groups) {
              const groupToCreate = {
                name: group.name,
                teams: group.teams || []
              };
              
              await axios.post(`/api/tournaments/stages/${newStageId}/groups`, groupToCreate);
            }
          } catch (groupError) {
            console.error('Ошибка при создании групп:', groupError);
            setError('Этап создан, но возникла ошибка при создании групп. Пожалуйста, проверьте настройки групп.');
          }
        }
      } else {
        // Обновляем существующий этап
        const updatedStage = {
          name: formData.name,
          format: formData.format,
          status: formData.status,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description
        };
        
        await axios.put(`/api/tournaments/${tournamentId}/stages/${stage.id}`, updatedStage);
        
        // Обновляем группы отдельно
        if (formData.format === 'groups' && stage.groups) {
          // Здесь нужна более сложная логика для обработки обновления/удаления/создания групп
          // Можно реализовать по необходимости
        }
      }
      
      onSave && onSave();
    } catch (err) {
      console.error('Ошибка при сохранении этапа:', err);
      setError('Не удалось сохранить этап. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content stage-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>{isNew ? 'Создать новый этап' : 'Редактировать этап'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="stage-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Название этапа*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Групповой этап"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="format">Формат проведения</label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
              >
                <option value="groups">Групповой этап</option>
                <option value="bracket">Плей-офф</option>
                <option value="swiss">Швейцарская система</option>
                <option value="custom">Другой формат</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Статус</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Не начат">Не начат</option>
                <option value="Идёт">Идёт</option>
                <option value="Завершён">Завершён</option>
                <option value="Отменён">Отменён</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Дата начала</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="end_date">Дата окончания</label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Описание формата и правил проведения этапа"
              rows="3"
            ></textarea>
          </div>
          
          {formData.format === 'groups' && (
            <div className="groups-section">
              <h3>Группы и команды</h3>
              
              <div className="groups-tabs">
                {formData.groups.map((group, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`group-tab ${currentGroup === index ? 'active' : ''}`}
                    onClick={() => setCurrentGroup(index)}
                  >
                    {group.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="add-group-button"
                  onClick={addGroup}
                  title="Добавить группу"
                >
                  +
                </button>
              </div>
              
              <div className="current-group">
                <div className="group-header">
                  <input
                    type="text"
                    value={formData.groups[currentGroup]?.name || ''}
                    onChange={(e) => handleGroupNameChange(currentGroup, e.target.value)}
                    className="group-name-input"
                    placeholder="Название группы"
                  />
                  
                  {formData.groups.length > 1 && (
                    <button
                      type="button"
                      className="remove-group-button"
                      onClick={() => removeGroup(currentGroup)}
                      title="Удалить группу"
                    >
                      Удалить
                    </button>
                  )}
                </div>
                
                <div className="team-search">
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    placeholder="Поиск команд..."
                    className="team-search-input"
                  />
                  
                  {teamSearch.trim() !== '' && (
                    <div className="team-search-results">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map(team => (
                          <div 
                            key={team.id} 
                            className="team-search-item"
                            onClick={() => addTeamToGroup(team)}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="no-teams-found">Нет команд</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="group-teams-list">
                  <h4>Команды в группе</h4>
                  
                  {formData.groups[currentGroup]?.teams.length > 0 ? (
                    <div className="group-teams-container">
                      {formData.groups[currentGroup].teams.map(team => (
                        <div key={team.id} className="group-team-item">
                          <span className="group-team-name">{team.name}</span>
                          <button
                            type="button"
                            className="remove-team-button"
                            onClick={() => removeTeamFromGroup(team.id)}
                            title="Удалить команду из группы"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-teams-message">Нет команд в этой группе</div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : isNew ? 'Создать этап' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StageCreateModal; 