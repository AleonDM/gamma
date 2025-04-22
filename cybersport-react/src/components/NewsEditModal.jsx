import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsEditModal.css';

const NewsEditModal = ({ news, onClose, onNewsUpdated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'cybersport',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        content: news.content || '',
        category: news.category || 'cybersport',
      });
    }
  }, [news]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let response;
      if (news && news.id) {
        // Обновление существующей новости
        response = await axios.put(`/api/news/${news.id}`, formData);
      } else {
        // Создание новой новости
        response = await axios.post('/api/news', formData);
      }
      
      onNewsUpdated(response.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при сохранении новости');
      console.error('Ошибка при сохранении новости:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{news && news.id ? 'Редактирование новости' : 'Добавление новости'}</h2>
          <button className="modal-close-button" onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="news-form">
          <div className="form-group">
            <label htmlFor="title">Заголовок</label>
            <input 
              type="text" 
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="cybersport">Киберспорт</option>
              <option value="dota2">Dota 2</option>
              <option value="cs2">CS 2</option>
              <option value="valorant">Valorant</option>
              <option value="brawlstars">Brawl Stars</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Содержание</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={5}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : (news && news.id ? 'Сохранить' : 'Добавить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewsEditModal; 