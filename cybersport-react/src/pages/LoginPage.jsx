import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ setIsAdmin }) => {
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверяем, если пользователь явно перешел на страницу логина,
    // даем возможность выполнить вход заново, не перенаправляя автоматически
    const urlParams = new URLSearchParams(window.location.search);
    const resetParam = urlParams.get('reset');
    
    // Если явно запрошен сброс авторизации или нет параметра reset
    if (resetParam === 'true') {
      // Очищаем предыдущую авторизацию
      localStorage.removeItem('teamCode');
      localStorage.removeItem('teamName');
      localStorage.removeItem('isAdmin');
      setIsAdmin(false);
    } else {
      // Иначе проверяем наличие авторизации и перенаправляем
      const savedTeamCode = localStorage.getItem('teamCode');
      if (savedTeamCode) {
        navigate('/');
      }
    }
  }, [navigate, setIsAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация ввода
    if (!teamCode.trim()) {
      setError('Введите код команды');
      return;
    }

    try {
      setLoading(true);
      console.log('Попытка входа с кодом:', teamCode);
      
      // Специальная обработка для админа
      if (teamCode.toLowerCase() === 'admin') {
        console.log('Вход администратора успешен');
        localStorage.setItem('teamCode', 'admin');
        localStorage.setItem('teamName', 'Администратор');
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        
        setTimeout(() => {
          navigate('/admin');
        }, 100);
        return;
      }
      
      // Проверка кода команды через API
      const response = await axios.get(`/api/teams/code/${teamCode}`);
      
      if (response.data && response.data.id) {
        // Сохраняем код команды и имя в localStorage
        localStorage.setItem('teamCode', teamCode);
        localStorage.setItem('teamName', response.data.name);
        localStorage.setItem('isAdmin', 'false');
        setIsAdmin(false);
        
        // Переходим на страницу команды вместо главной страницы
        navigate(`/team/${response.data.id}`);
      } else {
        setError('Неверный код команды');
      }
    } catch (err) {
      console.error('Ошибка при проверке кода команды:', err);
      
      if (err.response && err.response.status === 404) {
        setError('Команда с таким кодом не найдена');
      } else {
        setError('Ошибка при проверке кода команды. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход в систему</h1>
        <p className="login-description">
          Введите код вашей команды для доступа к турнирной платформе
        </p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teamCode">Код команды</label>
            <input
              type="text"
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Введите код команды"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Проверка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 