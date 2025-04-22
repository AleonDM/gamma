import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MatchCreateModal.css';

const MatchCreateModal = ({ stageId, groupId, match, onClose, onSave }) => {
  const isNew = !match;
  const modalRef = useRef(null);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    team1_id: '',
    team1_name: '',
    team1_score: '',
    team2_id: '',
    team2_name: '',
    team2_score: '',
    date: '',
    time: '',
    status: 'Запланирован',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Загружаем список команд для выбора
    const loadTeams = async () => {
      try {
        let endpoint = '/api/teams';
        
        // Если это групповой этап, загружаем только команды из нужной группы
        if (groupId) {
          endpoint = `/api/tournaments/stages/${stageId}/groups/${groupId}/teams`;
        }
        
        const response = await axios.get(endpoint);
        setTeams(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке команд:', err);
      }
    };
    
    loadTeams();
    
    // Если редактируем существующий матч, загружаем его данные
    if (match) {
      const dateTime = match.date ? new Date(match.date) : new Date();
      const formattedDate = dateTime.toISOString().split('T')[0];
      const hours = dateTime.getHours().toString().padStart(2, '0');
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setFormData({
        team1_id: match.team1_id || '',
        team1_name: match.team1_name || '',
        team1_score: match.team1_score !== null ? match.team1_score.toString() : '',
        team2_id: match.team2_id || '',
        team2_name: match.team2_name || '',
        team2_score: match.team2_score !== null ? match.team2_score.toString() : '',
        date: formattedDate,
        time: formattedTime,
        status: match.status || 'Запланирован',
        location: match.location || '',
        description: match.description || ''
      });
    } else {
      // Для нового матча устанавливаем текущую дату
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setFormData({
        ...formData,
        date: formattedDate,
        time: formattedTime
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
  }, [match, stageId, groupId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Если выбрана команда, добавляем её имя автоматически
    if (name === 'team1_id' || name === 'team2_id') {
      const selectedTeam = teams.find(team => team.id.toString() === value);
      if (selectedTeam) {
        const nameField = name === 'team1_id' ? 'team1_name' : 'team2_name';
        setFormData(prev => ({
          ...prev,
          [nameField]: selectedTeam.name
        }));
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.team1_id || !formData.team2_id) {
      setError('Выберите обе команды');
      return;
    }
    
    if (formData.team1_id === formData.team2_id) {
      setError('Команды должны быть разными');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        team1_score: formData.team1_score ? parseInt(formData.team1_score) : null,
        team2_score: formData.team2_score ? parseInt(formData.team2_score) : null,
        // Объединяем дату и время
        date: formData.date && formData.time 
          ? `${formData.date}T${formData.time}:00`
          : formData.date ? `${formData.date}T00:00:00` : null
      };
      
      // Определяем endpoint в зависимости от типа (группа или нет)
      let endpoint = `/api/tournaments/stages/${stageId}/matches`;
      if (groupId) {
        endpoint = `/api/tournaments/stages/${stageId}/groups/${groupId}/matches`;
      }
      
      if (isNew) {
        // Создаем новый матч
        await axios.post(endpoint, submitData);
      } else {
        // Обновляем существующий матч
        await axios.put(`${endpoint}/${match.id}`, submitData);
      }
      
      onSave && onSave();
    } catch (err) {
      console.error('Ошибка при сохранении матча:', err);
      setError('Не удалось сохранить матч. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-content match-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>{isNew ? 'Создать новый матч' : 'Редактировать матч'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="match-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="match-teams-section">
            <div className="match-team-row">
              <div className="form-group">
                <label htmlFor="team1_id">Команда 1*</label>
                <select
                  id="team1_id"
                  name="team1_id"
                  value={formData.team1_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите команду</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="vs-separator">vs</div>
              
              <div className="form-group">
                <label htmlFor="team2_id">Команда 2*</label>
                <select
                  id="team2_id"
                  name="team2_id"
                  value={formData.team2_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите команду</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="match-score-row">
              <div className="form-group">
                <label htmlFor="team1_score">Счёт команды 1</label>
                <input
                  type="number"
                  id="team1_score"
                  name="team1_score"
                  value={formData.team1_score}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
              
              <div className="score-separator">:</div>
              
              <div className="form-group">
                <label htmlFor="team2_score">Счёт команды 2</label>
                <input
                  type="number"
                  id="team2_score"
                  name="team2_score"
                  value={formData.team2_score}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Дата</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Время</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Статус</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Запланирован">Запланирован</option>
                <option value="Идёт">Идёт</option>
                <option value="Завершён">Завершён</option>
                <option value="Отменён">Отменён</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Место проведения</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Например: Онлайн / Москва, Арена ..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Комментарий</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Дополнительная информация о матче"
              rows="3"
            ></textarea>
          </div>
          
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
              {loading ? 'Сохранение...' : isNew ? 'Создать матч' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchCreateModal; 