import { useNavigate } from 'react-router-dom';
import './AdminLoginButton.css';

const AdminLoginButton = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/login');
  };

  return (
    <div className="admin-login-button" onClick={handleAdminLogin}>
      <center>Вход для администратора</center>
    </div>
  );
};

export default AdminLoginButton; 