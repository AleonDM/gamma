import { useState, useEffect } from 'react';
import axios from 'axios';
import NewsItem from './NewsItem';
import NewsAddButton from './NewsAddButton';
import './NewsList.css';

const NewsList = ({ isAdmin, isMobile = false }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/news?category=cybersport');
      setNews(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке новостей:', err);
      setError('Ошибка при загрузке новостей');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsUpdate = () => {
    loadNews();
  };

  if (loading) {
    return <div className="loading-news">Загрузка новостей...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!news || news.length === 0) {
    return (
      <>
        <div className="NEWSsidebarnews">
          <div id="header">Нет новостей</div>
        </div>
        {isAdmin && <NewsAddButton onNewsAdded={handleNewsUpdate} isMobile={isMobile} />}
      </>
    );
  }

  return (
    <>
      {news.map(item => (
        <NewsItem 
          key={item.id} 
          news={item} 
          isAdmin={isAdmin} 
          onNewsUpdated={handleNewsUpdate}
          isMobile={isMobile}
        />
      ))}
      {isAdmin && <NewsAddButton onNewsAdded={handleNewsUpdate} isMobile={isMobile} />}
    </>
  );
};

export default NewsList; 