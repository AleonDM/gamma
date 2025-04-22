import { useState } from 'react';
import NewsEditModal from './NewsEditModal';
import './NewsItem.css';

const NewsItem = ({ news, isAdmin, onNewsUpdated, isMobile }) => {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleClick = () => {
    if (isAdmin) {
      setShowEditModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
  };

  return (
    <>
      <div 
        className={`NEWSsidebarnews ${isMobile ? 'mobile' : ''}`} 
        onClick={handleClick}
        style={isAdmin ? { cursor: 'pointer' } : {}}
      >
        <div id="dates">{news.date}</div>
        <div id="header">{news.title}</div>
        {news.content && <div id="text">{news.content}</div>}
      </div>

      {isAdmin && showEditModal && (
        <NewsEditModal 
          news={news}
          onClose={handleCloseModal}
          onNewsUpdated={onNewsUpdated}
        />
      )}
    </>
  );
};

export default NewsItem; 