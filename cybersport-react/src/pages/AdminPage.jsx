import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentList from '../components/TournamentList';
import TournamentSearch from '../components/TournamentSearch';
import TournamentAddButton from '../components/TournamentAddButton';
import AdminTeamManagement from '../components/AdminTeamManagement';
import './AdminPage.css';

const AdminPage = ({ isAdmin }) => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const navigate = useNavigate();
  
  // Проверка прав администратора
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    } else {
      loadTournaments();
    }
  }, [isAdmin, navigate]);
  
  // Загрузка турниров
  const loadTournaments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tournaments');
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
      }
      const data = await response.json();
      setTournaments(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке турниров:', err);
      setError('Не удалось загрузить список турниров. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновление данных после изменения турнира
  const handleTournamentUpdated = () => {
    loadTournaments();
  };
  
  // Выход из аккаунта администратора
  const handleLogout = () => {
    localStorage.removeItem('teamCode');
    navigate('/');
    window.location.reload(); // Перезагрузка для сброса состояния приложения
  };
  
  // Функция для фильтрации турниров
  const filterTournaments = (tournament) => {
    // Фильтр по поиску
    if (searchQuery && searchQuery.trim() !== '') {
      const tournamentName = (tournament.name || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      if (!tournamentName.includes(query)) {
        return false;
      }
    }
    
    // Фильтр по статусу
    if (statusFilter && statusFilter !== 'all' && tournament.status !== statusFilter) {
      return false;
    }
    
    // Фильтр по дисциплине
    if (disciplineFilter && disciplineFilter !== 'all' && tournament.discipline !== disciplineFilter) {
      return false;
    }
    
    return true;
  };
  
  // Обработка изменения поисковых параметров
  const handleSearch = (query, status) => {
    console.log('Изменены параметры поиска на админке:', { query, status });
    setSearchQuery(query);
    setStatusFilter(status === 'all' ? '' : status);
  };
  
  // Если нет прав администратора, возвращаем null (редирект произойдет в useEffect)
  if (!isAdmin) {
    console.log('Не права администратора, перенаправление на логин');
    return null;
  }
  
  console.log('Права администратора подтверждены, отображаем панель');
  
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Панель администратора</h1>
      </div>
      
      <div className="admin-content">
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'tournaments' ? 'active' : ''}`}
            onClick={() => setActiveTab('tournaments')}
          >
            Турниры
          </button>
          <button 
            className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Команды
          </button>
        </div>
        
        <div className="admin-tab-content">
          {activeTab === 'tournaments' && (
            <div className="tab-pane">
              <div className="admin-actions">
                <h2>Управление турнирами</h2>
                <p>Здесь вы можете добавлять, редактировать и архивировать турниры.</p>
                
                <TournamentSearch 
                  onSearch={handleSearch} 
                  searchQuery={searchQuery} 
                  statusFilter={statusFilter} 
                />
                
                <TournamentAddButton onTournamentAdded={handleTournamentUpdated} />
                
                {isLoading ? (
                  <div className="loading-message">Загрузка турниров...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <TournamentList 
                    tournaments={tournaments.filter(filterTournaments)} 
                    isAdmin={true} 
                    onTournamentUpdated={handleTournamentUpdated} 
                  />
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'teams' && (
            <div className="tab-pane">
              <div className="teams-management">
                <AdminTeamManagement />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="admin-footer">
        <button className="admin-logout-button" onClick={handleLogout}>
          Выйти из аккаунта администратора
        </button>
      </div>
    </div>
  );
};

export default AdminPage; 