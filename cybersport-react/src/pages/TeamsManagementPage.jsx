import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiUsers } from 'react-icons/fi';
import TeamCreateModal from '../components/TeamCreateModal';
import '../styles/TeamsManagementPage.css';

const TeamsManagementPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Загрузка команд
  useEffect(() => {
    loadTeams();
  }, []);
  
  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teams');
      setTeams(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке команд:', err);
      setError('Не удалось загрузить список команд');
    } finally {
      setLoading(false);
    }
  };
  
  // Фильтрация команд по поисковому запросу
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Открытие модального окна для создания новой команды
  const handleAddTeam = () => {
    setSelectedTeam(null);
    setShowModal(true);
  };
  
  // Открытие модального окна для редактирования команды
  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };
  
  // Закрытие модального окна
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Сохранение команды и обновление списка
  const handleSaveTeam = () => {
    setShowModal(false);
    loadTeams();
  };
  
  // Удаление команды
  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`/api/teams/${teamId}`);
      loadTeams();
      setConfirmDelete(null);
    } catch (err) {
      console.error('Ошибка при удалении команды:', err);
      alert('Не удалось удалить команду. Пожалуйста, попробуйте позже.');
    }
  };
  
  return (
    <div className="teams-management-container">
      <div className="page-header">
        <h1>Управление командами</h1>
        <button className="add-team-button" onClick={handleAddTeam}>
          <FiPlus size={18} />
          Создать команду
        </button>
      </div>
      
      <div className="search-bar">
        <FiSearch size={18} />
        <input
          type="text"
          placeholder="Поиск по названию или коду команды..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка команд...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadTeams}>Попробовать снова</button>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <p>Не найдено команд, соответствующих запросу "{searchTerm}"</p>
              <button onClick={() => setSearchTerm('')}>Сбросить поиск</button>
            </>
          ) : (
            <>
              <FiUsers size={48} />
              <p>Команд пока нет</p>
              <button onClick={handleAddTeam}>Создать первую команду</button>
            </>
          )}
        </div>
      ) : (
        <div className="teams-grid">
          {filteredTeams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-card-header">
                <h2>{team.name}</h2>
                <div className="team-actions">
                  <button 
                    className="edit-button" 
                    onClick={() => handleEditTeam(team)}
                    title="Редактировать команду"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => setConfirmDelete(team.id)}
                    title="Удалить команду"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                {confirmDelete === team.id && (
                  <div className="confirm-delete">
                    <p>Удалить команду?</p>
                    <div className="confirm-buttons">
                      <button onClick={() => handleDeleteTeam(team.id)}>Да</button>
                      <button onClick={() => setConfirmDelete(null)}>Нет</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="team-code">Код: {team.code}</div>
              
              <div className="team-members">
                <h3>Состав команды</h3>
                {team.members && team.members.length > 0 ? (
                  <ul>
                    {team.members.map((member, index) => (
                      <li key={index}>
                        <span className="member-name">{member.name}</span>
                        <span className="member-role">{member.role}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-members">Нет участников</p>
                )}
              </div>
              
              <Link to={`/teams/${team.code}`} className="view-team-link">
                Открыть страницу команды
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {showModal && (
        <TeamCreateModal
          team={selectedTeam}
          onClose={handleCloseModal}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
};

export default TeamsManagementPage; 