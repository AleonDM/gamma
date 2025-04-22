import { useState } from 'react';
import NewsEditModal from './NewsEditModal';
import './NewsAddButton.css';

const NewsAddButton = ({ onNewsAdded, isMobile }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleClick = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleNewsAdded = () => {
    onNewsAdded && onNewsAdded();
    setShowAddModal(false);
  };

  // Создаем пустой объект новости для создания
  const emptyNews = {
    id: null,
    date: new Date().toLocaleDateString('ru-RU'),
    title: '',
    content: '',
    category: 'cybersport'
  };

  return (
    <>
      <div 
        className={`news-add-button ${isMobile ? 'mobile' : ''}`}
        onClick={handleClick}
      >
        <center>+ Добавить новость</center>
      </div>

      {showAddModal && (
        <NewsEditModal 
          news={emptyNews}
          onClose={handleCloseModal}
          onNewsUpdated={handleNewsAdded}
          isNew={true}
        />
      )}
    </>
  );
};

export default NewsAddButton; 