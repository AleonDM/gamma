import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = ({ isOpen, toggleMenu, toggleNews, isAdmin }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('all');
  
  // Обновляем активную ссылку при изменении маршрута
  useEffect(() => {
    if (location.pathname === '/') {
      const params = new URLSearchParams(location.search);
      const discipline = params.get('discipline');
      setActiveLink(discipline || 'all');
    } else if (location.pathname === '/archive') {
      setActiveLink('archive');
    }
  }, [location]);
  
  // Обработчик для клика по ссылке дисциплины
  const handleDisciplineClick = (discipline) => {
    setActiveLink(discipline);
    // Закрываем меню после выбора
    toggleMenu();
  };

  // Обработчик для выхода из аккаунта администратора
  const handleAdminLogout = () => {
    localStorage.removeItem('teamCode');
    window.location.reload();
    toggleMenu();
  };

  return (
    <div className={`bar ${isOpen ? 'open' : ''}`} id="bar">
      <div id="space-top"></div>
      <div id="space-bottom">
        <Link 
          to="/" 
          id="elem" 
          className={activeLink === 'all' ? 'active' : ''} 
          data-game="all"
          onClick={() => handleDisciplineClick('all')}
        >
          Все дисциплины
        </Link>
        
        <Link 
          to="/?discipline=Dota 2" 
          id="elem" 
          className={activeLink === 'Dota 2' ? 'active' : ''} 
          data-game="Dota 2"
          onClick={() => handleDisciplineClick('Dota 2')}
        >
          Dota 2
        </Link>
        
        <Link 
          to="/?discipline=CS 2" 
          id="elem" 
          className={`even-elem ${activeLink === 'CS 2' ? 'active' : ''}`} 
          data-game="CS 2"
          onClick={() => handleDisciplineClick('CS 2')}
        >
          CS 2
        </Link>
        
        <Link 
          to="/?discipline=Brawl Stars" 
          id="elem" 
          className={activeLink === 'Brawl Stars' ? 'active' : ''} 
          data-game="Brawl Stars"
          onClick={() => handleDisciplineClick('Brawl Stars')}
        >
          Brawl Stars
        </Link>
        
        <Link 
          to="/?discipline=Valorant" 
          id="elem" 
          className={`even-elem ${activeLink === 'Valorant' ? 'active' : ''}`} 
          data-game="Valorant"
          onClick={() => handleDisciplineClick('Valorant')}
        >
          Valorant
        </Link>
        
        <Link 
          to="/archive" 
          id="elem" 
          className={activeLink === 'archive' ? 'active' : ''} 
          data-view="archive"
          onClick={() => handleDisciplineClick('archive')}
        >
          Архив турниров
        </Link>
        
        <Link 
          to="/login" 
          id="elem"
          onClick={toggleMenu}
        >
          <b>вход</b>
        </Link>
        
        <div 
          id="elem" 
          className="even-elem" 
          onClick={() => {
            toggleMenu();
            toggleNews();
          }}
        >
          <b>НОВОСТИ</b>
        </div>

        {isAdmin && (
          <div 
            id="elem" 
            className="admin-logout-mobile" 
            onClick={handleAdminLogout}
          >
            <b>Выход из администратора</b>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu; 