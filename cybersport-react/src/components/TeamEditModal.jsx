import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './TeamEditModal.css';

// Компонент модального окна для редактирования команды
const TeamEditModal = ({ team, onClose, onTeamUpdated, isNew = false }) => {
  // Состояние формы
  const [formData, setFormData] = useState({
    name: team.name || '',
    code: team.code || '',
    members: Array.isArray(team.members) ? [...team.members] : 
             (typeof team.members === 'string' ? JSON.parse(team.members) : [])
  });
  
  // Состояние для нового участника
  const [newMember, setNewMember] = useState({
    name: '',
    role: ''
  });
  
  // Состояние загрузки и ошибок
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref для модального окна для обработки клика вне окна
  const modalRef = useRef(null);
  
  // Обработчик клика вне модального окна для его закрытия
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Обработчик изменения полей формы команды
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик изменения полей для нового участника
  const handleMemberInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Добавление нового участника в список
  const addMember = () => {
    // Проверка, что имя участника не пустое
    if (!newMember.name.trim()) {
      setError('Имя участника не может быть пустым');
      return;
    }
    
    // Добавляем нового участника в список
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { ...newMember }]
    }));
    
    // Очищаем форму нового участника
    setNewMember({
      name: '',
      role: ''
    });
    
    setError(null);
  };
  
  // Удаление участника из списка
  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };
  
  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем обязательные поля
    if (!formData.name.trim()) {
      setError('Название команды обязательно');
      return;
    }
    
    if (!formData.code.trim()) {
      setError('Код команды обязателен');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Создание новой или обновление существующей команды
      let response;
      if (isNew) {
        response = await axios.post('/api/teams', formData);
      } else {
        response = await axios.put(`/api/teams/${team.id}`, formData);
      }
      
      // Вызываем колбэк с обновленными данными команды
      onTeamUpdated(response.data);
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении команды:', err);
      setError(err.response?.data?.message || 'Ошибка при сохранении команды');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="team-edit-modal">
          <div className="modal-header">
            <h2>{isNew ? 'Создание новой команды' : 'Редактирование команды'}</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
          
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          <form onSubmit={handleSubmit} className="team-form">
            <div className="form-group">
              <label htmlFor="name">Название команды*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите название команды"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="code">Код команды*</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Введите код команды"
                required
              />
              <div className="form-hint">Код используется для входа команды в систему</div>
            </div>
            
            <div className="member-section">
              <h3>Участники команды</h3>
              
              <div className="member-input-group">
                <div className="form-group">
                  <label htmlFor="memberName">Имя участника</label>
                  <input
                    type="text"
                    id="memberName"
                    name="name"
                    value={newMember.name}
                    onChange={handleMemberInputChange}
                    placeholder="Введите имя участника"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="memberRole">Роль</label>
                  <input
                    type="text"
                    id="memberRole"
                    name="role"
                    value={newMember.role}
                    onChange={handleMemberInputChange}
                    placeholder="Например: Капитан, Игрок, Тренер"
                  />
                </div>
                
                <button
                  type="button"
                  className="add-member-btn"
                  onClick={addMember}
                  disabled={!newMember.name.trim()}
                >
                  Добавить
                </button>
              </div>
              
              <div className="members-list">
                {formData.members.length > 0 ? (
                  <ul>
                    {formData.members.map((member, index) => (
                      <li key={index} className="member-item">
                        <div className="member-info">
                          <span className="member-name">{member.name}</span>
                          {member.role && <span className="member-role">{member.role}</span>}
                        </div>
                        <button
                          type="button"
                          className="remove-member-btn"
                          onClick={() => removeMember(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-members">Нет добавленных участников</p>
                )}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : isNew ? 'Создать команду' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamEditModal; 