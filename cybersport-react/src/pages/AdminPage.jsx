import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentList from '../components/TournamentList';
import TournamentSearch from '../components/TournamentSearch';
import TournamentAddButton from '../components/TournamentAddButton';
import TeamList from '../components/TeamList';
import './AdminPage.css';

const AdminPage = ({ isAdmin }) => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  
  // Фильтрация турниров по поисковому запросу и статусу
  const getFilteredTournaments = () => {
    return tournaments.filter(tournament => {
      const matchesQuery = tournament.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || tournament.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  };
  
  // Обработчик поиска
  const handleSearch = (query, status) => {
    setSearchQuery(query);
    setStatusFilter(status);
  };
  
  // Если нет прав администратора, возвращаем null (редирект произойдет в useEffect)
  if (!isAdmin) {
    return null;
  }
  
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
                    tournaments={getFilteredTournaments()} 
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
                <h2>Управление командами</h2>
                <p>Здесь вы можете добавлять и редактировать команды.</p>
                
                <TeamList isAdmin={true} />
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