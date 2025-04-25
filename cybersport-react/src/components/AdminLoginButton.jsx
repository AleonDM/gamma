import { useNavigate } from 'react-router-dom';
import './AdminLoginButton.css';

const AdminLoginButton = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    console.log('Нажатие на кнопку входа для администратора');
    // Используем навигацию с параметром reset=true, чтобы сбросить текущую авторизацию
    window.location.href = '/login?reset=true';
  };

  return (
    <div className="admin-login-button" onClick={handleAdminLogin}>
      <center>Вход для администратора</center>
    </div>
  );
};

export default AdminLoginButton; 