import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './TournamentEditModal.css';

const TournamentEditModal = ({ tournament, onClose, onTournamentUpdated, isNew = false }) => {
  // Преобразуем строковую дату в формат для input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Если дата невалидная, возвращаем пустую строку
      return '';
    }
    
    return date.toISOString().split('T')[0];
  };
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: tournament.name || '',
    discipline: tournament.discipline || 'Dota 2',
    date: formatDateForInput(tournament.date) || new Date().toISOString().split('T')[0],
    status: tournament.status || 'Запланирован',
    prize_pool: tournament.prize_pool || 0,
    location: tournament.location || '',
    organizer: tournament.organizer || '',
    description: tournament.description || ''
  });
  
  // Состояние ошибок и загрузки
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ref для модального окна (для закрытия по клику вне окна)
  const modalRef = useRef(null);
  
  // Закрытие модального окна по клику вне его
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
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    // Преобразуем числовые значения
    if (name === 'prize_pool') {
      finalValue = value === '' ? 0 : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };
  
  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    if (!formData.name.trim()) {
      setError('Название турнира обязательно');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Создание нового или обновление существующего турнира
      let response;
      if (isNew) {
        response = await axios.post('/api/tournaments', formData);
      } else {
        response = await axios.put(`/api/tournaments/${tournament.id}`, formData);
      }
      
      // Вызываем колбэк с обновленными данными
      onTournamentUpdated(response.data);
      onClose();
    } catch (err) {
      console.error('Ошибка при сохранении турнира:', err);
      setError(err.response?.data?.message || 'Ошибка при сохранении турнира');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Обработчик клика на фон для предотвращения закрытия
  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{isNew ? 'Добавление турнира' : 'Редактирование турнира'}</h2>
          <button className="modal-close-button" onClick={onClose}>✕</button>
        </div>
        
        {error && (
          <div className="modal-error">{error}</div>
        )}
        
        <form className="tournament-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Название турнира*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите название турнира"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="discipline">Дисциплина</label>
              <select
                id="discipline"
                name="discipline"
                value={formData.discipline}
                onChange={handleChange}
              >
                <option value="Dota 2">Dota 2</option>
                <option value="CS 2">CS 2</option>
                <option value="Valorant">Valorant</option>
                <option value="Brawl Stars">Brawl Stars</option>
                <option value="Другое">Другое</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date">Дата проведения</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row">
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
                <option value="Перенесён">Перенесён</option>
                <option value="Окончен">Окончен</option>
                <option value="Отменён">Отменён</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="prize_pool">Призовой фонд</label>
              <input
                type="number"
                id="prize_pool"
                name="prize_pool"
                value={formData.prize_pool}
                onChange={handleChange}
                min="0"
                placeholder="Введите сумму в рублях"
              />
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
              placeholder="Например: Москва, Киберспортивная арена"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="organizer">Организатор</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              placeholder="Название организации-организатора"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Добавьте подробное описание турнира"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : isNew ? 'Создать турнир' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentEditModal; 