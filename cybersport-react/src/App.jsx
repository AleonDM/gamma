import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import LoginPage from './pages/LoginPage';
import TeamPage from './pages/TeamPage';
import TeamDetailsPage from './components/TeamDetailsPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import TournamentPage from './pages/TournamentPage';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Проверка авторизации администратора при загрузке
    const teamCode = localStorage.getItem('teamCode');
    console.log('Проверка авторизации администратора, код команды:', teamCode);
    if (teamCode === 'admin') {
      console.log('Авторизация администратора подтверждена');
      setIsAdmin(true);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout isAdmin={isAdmin} />}>
        <Route index element={<HomePage isAdmin={isAdmin} />} />
        <Route path="archive" element={<ArchivePage isAdmin={isAdmin} />} />
        <Route path="login" element={<LoginPage setIsAdmin={setIsAdmin} />} />
        <Route path="team/:teamId" element={<TeamDetailsPage />} />
        <Route path="tournament/:tournamentId" element={<TournamentPage isAdmin={isAdmin} />} />
        <Route path="admin" element={<AdminPage isAdmin={isAdmin} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App; 