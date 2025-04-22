import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NewsList from './NewsList';
import AdminLoginButton from './AdminLoginButton';
import AdminLogoutButton from './AdminLogoutButton';
import './Sidebar.css';

const Sidebar = ({ isAdmin, className }) => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('all');
  
  // Обновляем активную ссылку при изменении маршрута
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveLink('all');
    } else if (location.pathname === '/archive') {
      setActiveLink('archive');
    }
  }, [location]);
  
  // Обработчик для клика по ссылке дисциплины
  const handleDisciplineClick = (discipline) => {
    setActiveLink(discipline);
  };

  return (
    <div className={`sidebar ${className || ''}`}>
      <div className="contents_inner">
        <div id="space-sidebar"></div>
        <div id="logo">Negr</div>
        <div id="space-sidebar">спорт 1296</div>
        
        <div className="element">
          <Link 
            to="/" 
            id="links" 
            className={activeLink === 'all' ? 'active' : ''} 
            data-game="all"
            onClick={() => handleDisciplineClick('all')}
          >
            Все дисциплины
          </Link>
          
          <Link 
            to="/?discipline=Dota 2" 
            id="links" 
            className={activeLink === 'Dota 2' ? 'active' : ''} 
            data-game="Dota 2"
            onClick={() => handleDisciplineClick('Dota 2')}
          >
            Dota 2
          </Link>
          
          <Link 
            to="/?discipline=CS 2" 
            id="links" 
            className={activeLink === 'CS 2' ? 'active' : ''} 
            data-game="CS 2"
            onClick={() => handleDisciplineClick('CS 2')}
          >
            CS 2
          </Link>
          
          <Link 
            to="/?discipline=Brawl Stars" 
            id="links" 
            className={activeLink === 'Brawl Stars' ? 'active' : ''} 
            data-game="Brawl Stars"
            onClick={() => handleDisciplineClick('Brawl Stars')}
          >
            Brawl Stars
          </Link>
          
          <Link 
            to="/?discipline=Valorant" 
            id="links" 
            className={activeLink === 'Valorant' ? 'active' : ''} 
            data-game="Valorant"
            onClick={() => handleDisciplineClick('Valorant')}
          >
            Valorant
          </Link>
          
          <Link 
            to="/archive" 
            id="links" 
            className={activeLink === 'archive' ? 'active' : ''} 
            data-view="archive"
            onClick={() => handleDisciplineClick('archive')}
          >
            Архив турниров
          </Link>

          {isAdmin && (
            <Link 
              to="/admin" 
              id="links" 
              className={location.pathname === '/admin' ? 'active' : ''} 
              data-view="admin"
            >
              Панель администратора
            </Link>
          )}
          
          <Link to="/login" id="links">
            вход
          </Link>
        </div>
        
        <div className="NEWSsidebar">
          <div className="NEWSsidebartitle">
            <center>НОВОСТИ</center>
          </div>
          <NewsList isAdmin={isAdmin} />
          
          {!isAdmin && <AdminLoginButton />}
          {isAdmin && <AdminLogoutButton />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 