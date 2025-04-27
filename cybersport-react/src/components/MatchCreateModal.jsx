import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './MatchCreateModal.css';

const MatchCreateModal = ({ stageId, groupId, match, onClose, onSave }) => {
  // Конвертируем groupId в число, если это строка
  const numericGroupId = groupId ? parseInt(groupId, 10) : null;
  
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
    description: '',
    showingAllTeams: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Загружаем команды при монтировании компонента
    const loadTeams = async () => {
      try {
        let response;
        
        // Загружаем только команды из этапа турнира
        response = await axios.get(`/api/tournaments/stages/${stageId}/teams`);
        
        // Если команд в этапе нет, загружаем все команды как запасной вариант
        if (!response.data || response.data.length === 0) {
          console.log('В этапе нет команд, загружаем все команды');
          const allTeamsResponse = await axios.get('/api/teams');
          
          // Устанавливаем флаг, что мы показываем все команды
          setFormData(prev => ({ ...prev, showingAllTeams: true }));
          
          setTeams(allTeamsResponse.data);
        } else {
          console.log(`Загружено ${response.data.length} команд из этапа`);
          
          // Устанавливаем флаг, что мы показываем только команды из этапа
          setFormData(prev => ({ ...prev, showingAllTeams: false }));
          
          setTeams(response.data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке команд:', err);
        // В случае ошибки, пробуем загрузить все команды
        try {
          const allTeamsResponse = await axios.get('/api/teams');
          setTeams(allTeamsResponse.data);
        } catch (fallbackErr) {
          console.error('Ошибка при загрузке всех команд:', fallbackErr);
          setError('Не удалось загрузить список команд');
        }
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
  }, [match, stageId, numericGroupId]);
  
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
      if (numericGroupId) {
        endpoint = `/api/tournaments/stages/${stageId}/groups/${numericGroupId}/matches`;
      }
      
      if (isNew) {
        // Создаем новый матч
        const response = await axios.post(endpoint, submitData);
        console.log('Создан новый матч:', response.data);
      } else {
        // Обновляем существующий матч
        const response = await axios.put(`${endpoint}/${match.id}`, submitData);
        console.log('Обновлен существующий матч:', response.data);
      }
      
      // Проверяем, был ли завершен матч
      if (formData.status === 'Завершён') {
        console.log('Матч завершен, статистика должна обновиться автоматически');
      }
      
      // Задержка для того, чтобы сервер успел обработать запрос
      setTimeout(() => {
        onSave && onSave();
      }, 300);
    } catch (err) {
      console.error('Ошибка при сохранении матча:', err);
      console.error('Детали ошибки:', err.response?.data || err.message);
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
            <div className="match-team-info">
              <p className={`team-selection-info ${formData.showingAllTeams ? 'warning' : ''}`}>
                {teams.length > 0 
                  ? formData.showingAllTeams
                    ? `Внимание: показаны все команды, поскольку в этапе нет команд. Сначала добавьте команды в группы.`
                    : `Доступны команды из текущего этапа (${teams.length})` 
                  : 'Не найдены команды. Сначала создайте команды и добавьте их в группы.'}
              </p>
            </div>
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