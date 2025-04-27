import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminTeamManagement from '../components/AdminTeamManagement';
import './AdminPage.css';

const AdminPage = ({ isAdmin }) => {
  const navigate = useNavigate();
  
  // Проверка прав администратора
  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);
  
  // Выход из аккаунта администратора
  const handleLogout = () => {
    localStorage.removeItem('teamCode');
    navigate('/');
    window.location.reload(); // Перезагрузка для сброса состояния приложения
  };
  
  // Если нет прав администратора, возвращаем null (редирект произойдет в useEffect)
  if (!isAdmin) {
    console.log('Нет прав администратора, перенаправление на логин');
    return null;
  }
  
  console.log('Права администратора подтверждены, отображаем панель');
  
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Панель администратора</h1>
      </div>
      
      <div className="admin-content">
        <div className="teams-management">
          <AdminTeamManagement />
        </div>
      </div>
      
      <div className="admin-footer">
        <button className="admin-logout-button" onClick={handleLogout}>
          Выйти из аккаунта администратора
        </button>
      </div>
    </div>
  );
};

export default AdminPage; 