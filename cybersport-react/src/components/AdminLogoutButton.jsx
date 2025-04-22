import { useNavigate } from 'react-router-dom';
import './AdminLogoutButton.css';

const AdminLogoutButton = () => {
  const navigate = useNavigate();

  const handleAdminLogout = () => {
    localStorage.removeItem('teamCode');
    window.location.reload(); // Полная перезагрузка для сброса состояния приложения
  };

  return (
    <div className="admin-logout-button" onClick={handleAdminLogout}>
      <center>Выход из администратора</center>
    </div>
  );
};

export default AdminLogoutButton; 