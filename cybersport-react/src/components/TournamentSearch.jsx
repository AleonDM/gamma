import { useState, useEffect } from 'react';
import './TournamentSearch.css';

const TournamentSearch = ({ onSearch, searchQuery, statusFilter, isMobile = false }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [localStatus, setLocalStatus] = useState(statusFilter || 'all');
  
  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    setLocalQuery(searchQuery || '');
    setLocalStatus(statusFilter || 'all');
  }, [searchQuery, statusFilter]);
  
  const handleSearch = () => {
    onSearch(localQuery, localStatus);
  };
  
  const handleReset = () => {
    setLocalQuery('');
    setLocalStatus('all');
    onSearch('', 'all');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className={`search-container${isMobile ? '-mobile' : ''}`}>
      <div className={`search-form${isMobile ? '-mobile' : ''}`}>
        <input
          type="text"
          placeholder={isMobile ? "Поиск по названию..." : "Поиск по названию турнира..."}
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`search-input${isMobile ? '-mobile' : ''}`}
        />
        
        <select
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value)}
          className={`status-filter${isMobile ? '-mobile' : ''}`}
        >
          <option value="all">Все статусы</option>
          <option value="Запланирован">Запланирован</option>
          <option value="Идёт">Идёт</option>
          <option value="Перенесён">Перенесён</option>
          <option value="Окончен">Окончен</option>
          <option value="Отменён">Отменён</option>
        </select>
        
        {isMobile ? (
          <div className="mobile-buttons">
            <button
              onClick={handleSearch}
              className="search-button-mobile"
            >
              Поиск
            </button>
            <button
              onClick={handleReset}
              className="reset-button-mobile"
            >
              Сбросить
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleSearch}
              className="search-button"
            >
              Поиск
            </button>
            <button
              onClick={handleReset}
              className="reset-button"
            >
              Сбросить
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TournamentSearch; 