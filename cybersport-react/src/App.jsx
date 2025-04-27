import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import LoginPage from './pages/LoginPage';
import TeamPage from './pages/TeamPage';
import TeamDetailsPage from './components/TeamDetailsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import TournamentPage from './pages/TournamentPage';
import { ADMIN_CODE, API_BASE_URL } from './utils/env';
import './index.css';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Проверка авторизации администратора при загрузке
    const teamCode = localStorage.getItem('teamCode');
    console.log('Проверка авторизации администратора, код команды:', teamCode);
    if (teamCode === ADMIN_CODE) {
      console.log('Авторизация администратора подтверждена');
      setIsAdmin(true);
    }

    // Проверка соединения с API
    const checkApiConnection = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        console.log('API статус:', response.data);
      } catch (error) {
        console.error('Ошибка соединения с API:', error);
        setErrorMessage(`Не удалось подключиться к API по адресу ${API_BASE_URL}`);
      }
    };

    checkApiConnection();
  }, []);

  return (
    <>
      {errorMessage && (
        <div className="api-error-message">
          <p>{errorMessage}</p>
          <p>Проверьте настройки подключения и перезагрузите страницу.</p>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Layout isAdmin={isAdmin} />}>
          <Route index element={<HomePage isAdmin={isAdmin} />} />
          <Route path="archive" element={<ArchivePage isAdmin={isAdmin} />} />
          <Route path="login" element={<LoginPage setIsAdmin={setIsAdmin} />} />
          <Route path="team/:teamId" element={<TeamPage />} />
          <Route path="tournament/:tournamentId" element={<TournamentPage isAdmin={isAdmin} />} />
          <Route path="admin" element={<AdminPage isAdmin={isAdmin} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App; 