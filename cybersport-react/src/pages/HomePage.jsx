import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TournamentList from '../components/TournamentList';
import TournamentSearch from '../components/TournamentSearch';
import TournamentAddButton from '../components/TournamentAddButton';
import './HomePage.css';

// Мок-данные для использования при отсутствии API
const mockTournaments = [
  {
    id: 1,
    name: "Чемпионат по Dota 2",
    discipline: "dota2",
    date: new Date().toISOString(),
    status: "upcoming",
    prize_pool: "100000 ₽",
    format: "5v5",
    location: "Онлайн",
    teams_registered: 12,
    teams_max: 16,
    description: "Ежегодный турнир по Dota 2 с участием лучших команд."
  },
  {
    id: 2,
    name: "Кибертурнир CS 2",
    discipline: "cs2", 
    date: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // +7 дней
    status: "registration",
    prize_pool: "50000 ₽",
    format: "5v5",
    location: "Москва",
    teams_registered: 8,
    teams_max: 16,
    description: "Открытый турнир по CS 2 для всех желающих."
  },
  {
    id: 3,
    name: "Brawl Stars Championship",
    discipline: "brawlstars",
    date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), // -3 дня
    status: "ongoing",
    prize_pool: "25000 ₽",
    format: "3v3",
    location: "Онлайн",
    teams_registered: 24,
    teams_max: 32,
    description: "Соревнования по Brawl Stars среди молодежных команд."
  },
  {
    id: 4,
    name: "Valorant Open Cup",
    discipline: "valorant",
    date: new Date(Date.now() - 30*24*60*60*1000).toISOString(), // -30 дней
    status: "completed",
    prize_pool: "75000 ₽",
    format: "5v5",
    location: "Санкт-Петербург",
    teams_registered: 16,
    teams_max: 16,
    description: "Завершенный турнир по Valorant."
  }
];

const HomePage = ({ isAdmin }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем дисциплину из URL параметров
  const urlParams = new URLSearchParams(location.search);
  const disciplineParam = urlParams.get('discipline');
  
  useEffect(() => {
    // Сбрасываем фильтры при изменении дисциплины
    setSearchQuery('');
    setStatusFilter('');
    
    loadTournaments();
  }, [disciplineParam]);
  
  const loadTournaments = async () => {
    try {
      setLoading(true);
      
      try {
        // Пытаемся загрузить данные от API
        const response = await axios.get('/api/tournaments');
        setTournaments(response.data);
      } catch (apiErr) {
        console.error('Не удалось загрузить турниры из API:', apiErr);
        
        // Если API недоступен, используем мок-данные
        setTournaments(mockTournaments);
      }
      
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке турниров:', err);
      setError('Не удалось загрузить список турниров');
    } finally {
      setLoading(false);
    }
  };
  
  const getFilteredTournaments = () => {
    return tournaments.filter(tournament => {
      // Фильтр по дисциплине
      if (disciplineParam && tournament.discipline !== disciplineParam) {
        return false;
      }
      
      // Фильтр по поиску
      if (searchQuery && !(tournament.name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Фильтр по статусу
      if (statusFilter && tournament.status !== statusFilter) {
        return false;
      }
      
      // Не показываем архивные турниры на главной странице
      if (tournament.archived) {
        return false;
      }
      
      return true;
    });
  };
  
  const handleSearch = (query, status) => {
    setSearchQuery(query);
    setStatusFilter(status);
  };
  
  const handleTournamentUpdated = () => {
    loadTournaments();
  };
  
  const getDisciplineTitle = () => {
    switch (disciplineParam) {
      case 'dota2':
        return 'Dota 2';
      case 'cs2':
        return 'CS 2';
      case 'valorant':
        return 'Valorant';
      case 'brawlstars':
        return 'Brawl Stars';
      default:
        return 'Все дисциплины';
    }
  };
  
  const filteredTournaments = getFilteredTournaments();
  
  return (
    <div className="home-page">
      <div className="desktop-content">
        <h1 className="discipline-title">{getDisciplineTitle()}</h1>
        
        <div className="search-and-add">
          <TournamentSearch 
            onSearch={handleSearch}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
          
          {isAdmin && (
            <TournamentAddButton onTournamentAdded={handleTournamentUpdated} />
          )}
        </div>
        
        {loading ? (
          <div className="loading-message">Загрузка турниров...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <TournamentList 
            tournaments={filteredTournaments} 
            isAdmin={isAdmin}
            onTournamentUpdated={handleTournamentUpdated}
          />
        )}
      </div>
      
      <div className="mobile-content">
        <h2 className="discipline-title-mobile">{getDisciplineTitle()}</h2>
        
        <TournamentSearch 
          onSearch={handleSearch}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          isMobile={true}
        />
        
        {loading ? (
          <div className="loading-message">Загрузка турниров...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <TournamentList 
            tournaments={filteredTournaments} 
            isAdmin={isAdmin}
            onTournamentUpdated={handleTournamentUpdated}
            isMobile={true}
          />
        )}
        
        {isAdmin && (
          <TournamentAddButton 
            onTournamentAdded={handleTournamentUpdated} 
            isMobile={true}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage; 