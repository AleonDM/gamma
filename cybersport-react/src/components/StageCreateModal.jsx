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
        const newStageId = response.data.id;
        
        // Создаем группы, если это групповой формат
        if (formData.format === 'groups') {
          try {
            console.log(`Создаем группы для нового этапа ${newStageId}, групп: ${formData.groups.length}`);
            
            // Создаем группы и сохраняем их ID
            const createdGroups = [];
            
            for (const group of formData.groups) {
              try {
                // Создаем группу с командами в одном запросе
                console.log(`Создаем группу "${group.name}" с ${group.teams ? group.teams.length : 0} командами`);
                
              const groupToCreate = {
                name: group.name,
                teams: group.teams || []
              };
              
              const groupResponse = await axios.post(`/api/tournaments/stages/${newStageId}/groups`, groupToCreate);
                
                if (groupResponse.data && groupResponse.data.id) {
                  console.log(`Группа "${group.name}" создана с ID: ${groupResponse.data.id}`);
                  createdGroups.push({
                    ...group,
                    id: groupResponse.data.id
                  });
                }
              } catch (groupError) {
                console.error(`Ошибка при создании группы "${group.name}":`, groupError);
                if (groupError.response) {
                  console.error(`Статус ошибки: ${groupError.response.status}, данные:`, groupError.response.data);
                }
                setError(`Ошибка при создании группы ${group.name}. Проверьте журнал ошибок.`);
              }
            }
            
            console.log(`Успешно создано ${createdGroups.length} групп из ${formData.groups.length}`);
          } catch (groupsError) {
            console.error('Ошибка при создании групп:', groupsError);
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
        
        // Обновляем группы
        if (formData.format === 'groups') {
          try {
            // Получаем текущие группы этапа
            const existingGroupsResponse = await axios.get(`/api/tournaments/stages/${stage.id}/groups`);
            const existingGroups = existingGroupsResponse.data;
            const existingGroupIds = existingGroups.map(g => g.id);
            
            // Обрабатываем каждую группу в форме
            for (const group of formData.groups) {
              if (group.id) {
                try {
                  console.log(`Обновляем группу ${group.id} (${group.name}) с ${group.teams.length} командами`);
                  
                  // Сначала проверяем, существует ли группа
                  try {
                    const checkGroupResponse = await axios.get(`/api/tournaments/stages/${stage.id}/groups/${group.id}`);
                    
                    if (checkGroupResponse.status === 200) {
                      // Группа существует, обновляем её
                await axios.put(`/api/tournaments/stages/${stage.id}/groups/${group.id}`, {
                        name: group.name,
                        teams: group.teams
                      });
                    }
                  } catch (checkError) {
                    // Группа не существует, создаем новую
                    console.warn(`Группа ${group.id} не найдена. Создаем новую группу.`);
                    const newGroupResponse = await axios.post(`/api/tournaments/stages/${stage.id}/groups`, {
                      name: group.name,
                      teams: group.teams
                    });
                    
                    // Обновляем ID группы в локальных данных
                    group.id = newGroupResponse.data.id;
                }
                
                // Удаляем из списка ID, чтобы не удалить группу позже
                const index = existingGroupIds.indexOf(group.id);
                if (index !== -1) {
                  existingGroupIds.splice(index, 1);
                  }
                } catch (updateError) {
                  console.error(`Ошибка при обработке группы ${group.id}:`, updateError);
                  if (updateError.response) {
                    console.error(`Статус ошибки: ${updateError.response.status}, данные: `, updateError.response.data);
                  }
                  setError(`Ошибка при работе с группой ${group.name}. Проверьте журнал ошибок.`);
                }
              } else {
                // Создаем новую группу со всеми данными сразу
                try {
                  console.log(`Создаем новую группу "${group.name}" с ${group.teams.length} командами`);
                const newGroupResponse = await axios.post(`/api/tournaments/stages/${stage.id}/groups`, {
                    name: group.name,
                    teams: group.teams
                  });
                  
                  // Сохраняем ID созданной группы
                  if (newGroupResponse.data && newGroupResponse.data.id) {
                    group.id = newGroupResponse.data.id;
                    console.log(`Группа создана с ID: ${group.id}`);
                  }
                } catch (createError) {
                  console.error(`Ошибка при создании новой группы "${group.name}":`, createError);
                  if (createError.response) {
                    console.error(`Статус ошибки: ${createError.response.status}, данные: `, createError.response.data);
                  }
                  setError(`Ошибка при создании группы ${group.name}. Проверьте журнал ошибок.`);
                }
              }
            }
            
            // Удаляем группы, которых нет в обновленном списке
            for (const groupId of existingGroupIds) {
              await axios.delete(`/api/tournaments/stages/${stage.id}/groups/${groupId}`);
            }
          } catch (groupsError) {
            console.error('Ошибка при обновлении групп:', groupsError);
            setError('Этап обновлен, но возникла ошибка при обновлении групп.');
          }
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