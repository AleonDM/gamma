import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileMenu from './MobileMenu';
import MobileNewsContainer from './MobileNewsContainer';
import MobileNewsButton from './MobileNewsButton';
import './Layout.css';

const Layout = ({ isAdmin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNewsOpen, setIsMobileNewsOpen] = useState(false);
  
  // Обработчик для переключения мобильного меню
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Если открываем меню, закрываем новости
    if (!isMobileMenuOpen && isMobileNewsOpen) {
      setIsMobileNewsOpen(false);
    }
    
    // Управление прокруткой страницы
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  // Обработчик для переключения мобильных новостей
  const toggleMobileNews = () => {
    setIsMobileNewsOpen(!isMobileNewsOpen);
    
    // Если открываем новости, закрываем меню
    if (!isMobileNewsOpen && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    
    // Управление прокруткой страницы
    if (!isMobileNewsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  // Сброс overflow при размонтировании компонента
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="app-container">
      {/* Десктопная версия */}
      <Sidebar isAdmin={isAdmin} className="desktop-only" />
      
      {/* Мобильная версия */}
      <button 
        className={`button-sidebar mobile-only ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? '<' : 'X'}
      </button>
      
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        toggleMenu={toggleMobileMenu}
        toggleNews={toggleMobileNews}
        isAdmin={isAdmin}
      />
      
      <MobileNewsContainer 
        isOpen={isMobileNewsOpen}
        toggleNews={toggleMobileNews}
        isAdmin={isAdmin}
      />
      
      <MobileNewsButton toggleNews={toggleMobileNews} />
      
      {/* Основное содержимое */}
      <main className="content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 