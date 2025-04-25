import { useNavigate } from 'react-router-dom';
import './AdminLoginButton.css';

const AdminLoginButton = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    console.log('Нажатие на кнопку входа для администратора');
    // Используем прямую навигацию через window.location для обхода любых потенциальных проблем с React Router
    window.location.href = '/login';
    
    // Запасной вариант с React Router, если прямая навигация не сработает через 500мс
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  return (
    <div className="admin-login-button" onClick={handleAdminLogin}>
      <center>Вход для администратора</center>
    </div>
  );
};

export default AdminLoginButton; 