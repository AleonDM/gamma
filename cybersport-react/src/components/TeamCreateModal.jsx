import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiX, FiPlusCircle, FiTrash2 } from 'react-icons/fi';
import './TeamCreateModal.css';

const TeamCreateModal = ({ team, onClose, onSave }) => {
  const isNew = !team;
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    members: [],
    tournaments: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  
  useEffect(() => {
    // Если редактируем существующую команду, загружаем её данные
    if (team) {
      setFormData({
        name: team.name || '',
        code: team.code || '',
        members: team.members || [],
        tournaments: team.tournaments || []
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
  }, [team]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember({
      ...newMember,
      [name]: value
    });
  };
  
  const addMember = () => {
    if (!newMember.name || !newMember.role) {
      setError('Укажите имя и роль участника');
      return;
    }
    
    setFormData({
      ...formData,
      members: [...formData.members, { ...newMember }]
    });
    
    // Сбрасываем форму нового участника
    setNewMember({ name: '', role: '' });
    setError(null);
  };
  
  const removeMember = (index) => {
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Название команды обязательно');
      return;
    }
    
    if (!formData.code) {
      setError('Код команды обязателен');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (isNew) {
        // Создаем новую команду
        await axios.post('/api/teams', formData);
      } else {
        // Обновляем существующую команду
        await axios.put(`/api/teams/${team.id}`, formData);
      }
      
      onSave && onSave();
    } catch (err) {
      console.error('Ошибка при сохранении команды:', err);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Не удалось сохранить команду. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для генерации кода команды на основе названия
  const generateTeamCode = () => {
    if (formData.name) {
      // Создаем код из первых букв слов названия команды (аббревиатуру)
      const words = formData.name.split(' ');
      let code = '';
      
      if (words.length > 1) {
        // Если несколько слов, берем первые буквы
        code = words.map(word => word.charAt(0).toLowerCase()).join('');
      } else {
        // Если одно слово, берем первые 2-4 символа
        code = formData.name.substring(0, Math.min(4, formData.name.length)).toLowerCase();
      }
      
      setFormData({
        ...formData,
        code
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content team-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>{isNew ? 'Создать новую команду' : 'Редактировать команду'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="team-form">
          {error && <div className="modal-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Название команды*</label>
            <div className="input-with-button">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Например: Virtus.pro"
                required
              />
              <button 
                type="button" 
                className="generate-code-button"
                onClick={generateTeamCode}
                title="Сгенерировать код команды"
              >
                Генерировать код
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="code">Код команды* (используется в URL)</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Например: vp"
              pattern="[a-z0-9\-]+"
              title="Только строчные латинские буквы, цифры и дефис"
              required
            />
            <div className="input-hint">Только строчные латинские буквы, цифры и дефис</div>
          </div>
          
          <div className="members-section">
            <h3>Состав команды</h3>
            
            <div className="members-list">
              {formData.members.length > 0 ? (
                formData.members.map((member, index) => (
                  <div key={index} className="member-item">
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-role">{member.role}</div>
                    </div>
                    <button
                      type="button"
                      className="remove-member-button"
                      onClick={() => removeMember(index)}
                      title="Удалить участника"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-members-message">В команде пока нет участников</div>
              )}
            </div>
            
            <div className="add-member-form">
              <h4>Добавить участника</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="memberName">Имя</label>
                  <input
                    type="text"
                    id="memberName"
                    name="name"
                    value={newMember.name}
                    onChange={handleMemberChange}
                    placeholder="Имя игрока"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="memberRole">Роль</label>
                  <select
                    id="memberRole"
                    name="role"
                    value={newMember.role}
                    onChange={handleMemberChange}
                  >
                    <option value="">Выберите роль</option>
                    <option value="Капитан">Капитан</option>
                    <option value="Керри">Керри</option>
                    <option value="Мидер">Мидер</option>
                    <option value="Оффлейнер">Оффлейнер</option>
                    <option value="Саппорт">Саппорт</option>
                    <option value="Тренер">Тренер</option>
                    <option value="Снайпер">Снайпер</option>
                    <option value="Штурмовик">Штурмовик</option>
                    <option value="Поддержка">Поддержка</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  className="add-member-button"
                  onClick={addMember}
                >
                  <FiPlusCircle size={20} />
                  Добавить
                </button>
              </div>
            </div>
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
              {loading ? 'Сохранение...' : isNew ? 'Создать команду' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamCreateModal; 