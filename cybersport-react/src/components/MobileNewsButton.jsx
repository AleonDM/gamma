import React from 'react';
import './MobileNewsButton.css';

const MobileNewsButton = ({ toggleNews }) => {
  return (
    <button 
      className="mobile-news-button" 
      onClick={toggleNews}
      aria-label="Показать новости"
    >
      <span className="news-icon">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          fill="none" 
          stroke="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8M18 10h-8M18 6h-8"></path>
        </svg>
      </span>
      <span className="news-text">Новости</span>
    </button>
  );
};

export default MobileNewsButton; 