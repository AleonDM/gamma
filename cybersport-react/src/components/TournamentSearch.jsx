import { useState, useEffect } from 'react';
import './TournamentSearch.css';

const TournamentSearch = ({ onSearch, searchQuery = '', statusFilter = 'all', initialQuery, initialStatus, isMobile = false }) => {
  // Используем начальные значения из пропсов или значения по умолчанию
  const [localQuery, setLocalQuery] = useState(initialQuery || searchQuery || '');
  const [localStatus, setLocalStatus] = useState(initialStatus || statusFilter || 'all');
  
  // Обновляем локальное состояние при изменении пропсов
  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalQuery(searchQuery);
    }
    if (statusFilter !== undefined) {
      setLocalStatus(statusFilter);
    }
    if (initialQuery !== undefined) {
      setLocalQuery(initialQuery);
    }
    if (initialStatus !== undefined) {
      setLocalStatus(initialStatus);
    }
  }, [searchQuery, statusFilter, initialQuery, initialStatus]);
  
  const handleSearch = (e) => {
    e && e.preventDefault(); // Предотвращаем отправку формы, если событие передано
    console.log('Выполняется поиск:', { localQuery, localStatus });
    onSearch(localQuery, localStatus);
  };
  
  const handleReset = () => {
    setLocalQuery('');
    setLocalStatus('all');
    console.log('Сброс фильтров поиска');
    onSearch('', 'all');
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div className={`search-container${isMobile ? '-mobile' : ''}`}>
      <form className={`search-form${isMobile ? '-mobile' : ''}`} onSubmit={handleSearch}>
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
              type="submit"
              className="search-button-mobile"
            >
              Поиск
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="reset-button-mobile"
            >
              Сбросить
            </button>
          </div>
        ) : (
          <>
            <button
              type="submit"
              className="search-button"
            >
              Поиск
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="reset-button"
            >
              Сбросить
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default TournamentSearch; 