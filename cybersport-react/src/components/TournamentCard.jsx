import React, { useState } from 'react';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import TournamentEditModal from './TournamentEditModal';
import './TournamentCard.css';
import { Link } from 'react-router-dom';

// Icons
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const TournamentCard = ({ tournament, isAdmin, onTournamentUpdated }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Получаем CSS-класс для фона в зависимости от дисциплины
  const getGameClass = (discipline) => {
    if (!discipline) return 'other';
    
    const disciplineMap = {
      'Dota 2': 'dota2',
      'CS 2': 'cs2',
      'Valorant': 'valorant',
      'Brawl Stars': 'brawlstars'
    };
    
    return disciplineMap[discipline] || 'other';
  };

  // Форматируем дату
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Получаем класс для статуса
  const getStatusClass = (status) => {
    if (!status) return 'status-upcoming';
    
    const statusMap = {
      'Запланирован': 'upcoming',
      'Идёт': 'active',
      'Перенесён': 'upcoming',
      'Окончен': 'completed',
      'Отменён': 'canceled'
    };
    
    return `status-${statusMap[status] || 'upcoming'}`;
  };

  // Обработчик переключения деталей
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Обработчик открытия модального окна редактирования
  const handleEditClick = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  // Обработчик закрытия модального окна редактирования
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Обработчик архивации турнира
  const handleArchiveClick = async (e) => {
    e.stopPropagation();
    
    if (window.confirm('Вы уверены, что хотите архивировать этот турнир?')) {
      try {
        setIsArchiving(true);
        await axios.post(`/api/tournaments/${tournament.id}/archive`);
        
        // Обновляем список турниров после архивации
        if (onTournamentUpdated) {
          onTournamentUpdated();
        }
      } catch (error) {
        console.error('Ошибка при архивации турнира:', error);
        alert('Не удалось архивировать турнир. Пожалуйста, попробуйте позже.');
      } finally {
        setIsArchiving(false);
      }
    }
  };

  // Обработчик восстановления турнира из архива
  const handleUnarchiveClick = async (e) => {
    e.stopPropagation();
    
    if (window.confirm('Вы уверены, что хотите восстановить этот турнир из архива?')) {
      try {
        setIsArchiving(true);
        console.log(`Начинаю восстановление турнира ${tournament.id}: ${tournament.name}`);
        const response = await axios.post(`/api/tournaments/${tournament.id}/restore`);
        console.log('Ответ сервера на восстановление:', response.data);
        
        // Обновляем список турниров после восстановления
        if (onTournamentUpdated) {
          console.log('Вызываю onTournamentUpdated для обновления списка турниров');
          onTournamentUpdated();
        }
      } catch (error) {
        console.error('Ошибка при восстановлении турнира из архива:', error);
        alert('Не удалось восстановить турнир. Пожалуйста, попробуйте позже.');
      } finally {
        setIsArchiving(false);
      }
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Не указан';
    
    switch (status) {
      case 'registration': return 'Регистрация';
      case 'ongoing': return 'В процессе';
      case 'completed': return 'Завершен';
      case 'upcoming': return 'Скоро';
      default: return status;
    }
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Даты не указаны';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = start.getDate();
    const startMonth = start.toLocaleString('ru', { month: 'short' });
    const endDay = end.getDate();
    const endMonth = end.toLocaleString('ru', { month: 'short' });
    const endYear = end.getFullYear();
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startDay}-${endDay} ${endMonth} ${endYear}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
    } else {
      const startYear = start.getFullYear();
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
  };

  const formatTimeFromNow = (date) => {
    if (!date) return 'Не указано';
    
    try {
      return formatDistance(new Date(date), new Date(), { 
        addSuffix: true,
        locale: ru 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Неизвестная дата';
    }
  };

  return (
    <>
      <Link to={`/tournament/${tournament.id}`} className="tournament-card-link">
        <div className={`tournament-card ${tournament.archived ? 'archived' : ''}`} onClick={toggleDetails}>
          <div className={`tournament-header game-${getGameClass(tournament.discipline)}`}>
            <div className="tournament-header-overlay">
              <span className={`tournament-status ${getStatusClass(tournament.status)}`}>
                {getStatusText(tournament.status || '')}
              </span>
              <span className="tournament-date">
                <FaCalendarAlt /> {formatDate(tournament.date)}
              </span>
              <span className="tournament-discipline">{tournament.discipline || 'Не указана'}</span>
            </div>
          </div>
          
          <div className="tournament-content">
            <h3 className="tournament-title">{tournament.name || 'Без названия'}</h3>
            
            <div className="tournament-details">
              {tournament.organizer && (
                <div className="tournament-detail">
                  <span className="tournament-detail-icon">🏢</span>
                  <span className="tournament-detail-value">{tournament.organizer}</span>
                </div>
              )}
            </div>
            
            {tournament.location && (
              <div className="tournament-location">
                <FaMapMarkerAlt className="location-icon" />
                {tournament.location}
              </div>
            )}
            
            {showDetails && tournament.description && (
              <div className="tournament-description">
                <p>{tournament.description}</p>
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div className="tournament-footer">
              <div className="tournament-actions">
                <button 
                  className="tournament-button edit-button" 
                  onClick={handleEditClick}
                  disabled={isArchiving}
                >
                  Редактировать
                </button>
                <button 
                  className={`tournament-button ${tournament.archived ? 'unarchive-button' : 'archive-button'}`} 
                  onClick={tournament.archived ? handleUnarchiveClick : handleArchiveClick}
                  disabled={isArchiving}
                >
                  {isArchiving ? 'Обработка...' : tournament.archived ? 'Восстановить' : 'В архив'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Link>
      
      {showEditModal && (
        <TournamentEditModal 
          tournament={tournament} 
          onClose={handleCloseEditModal} 
          onTournamentUpdated={onTournamentUpdated}
        />
      )}
    </>
  );
};

export default TournamentCard; 