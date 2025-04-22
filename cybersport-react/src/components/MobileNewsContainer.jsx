import { useEffect } from 'react';
import NewsList from './NewsList';
import './MobileNewsContainer.css';

const MobileNewsContainer = ({ isOpen, toggleNews, isAdmin }) => {
  useEffect(() => {
    // Сбрасываем overflow при размонтировании компонента
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className={`mobile-news-container ${isOpen ? 'open' : 'closed'}`}>
      <div className="mobile-news-header">
        <h2>Новости</h2>
        <button className="mobile-news-close" onClick={toggleNews}>✕</button>
      </div>
      
      <div className="mobile-news-content">
        {isOpen && <NewsList isAdmin={isAdmin} isMobile={true} />}
      </div>
    </div>
  );
};

export default MobileNewsContainer; 