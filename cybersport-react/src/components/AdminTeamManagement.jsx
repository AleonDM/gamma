import { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTeamManagement.css';

const AdminTeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    members: []
  });
  const [newMember, setNewMember] = useState({ name: '', role: '' });

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
      setError('Не удалось загрузить команды. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      code: '',
      members: []
    });
    setShowCreateForm(true);
    setShowEditForm(false);
  };

  const handleEditClick = (team) => {
    setCurrentTeam(team);
    setFormData({
      name: team.name,
      code: team.code,
      members: Array.isArray(team.members) ? [...team.members] : []
    });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleDeleteClick = async (teamId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту команду?')) {
      try {
        await axios.delete(`/api/teams/${teamId}`);
        loadTeams();
      } catch (err) {
        console.error('Ошибка при удалении команды:', err);
        setError('Не удалось удалить команду. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember({
      ...newMember,
      [name]: value
    });
  };

  const addMember = () => {
    if (!newMember.name) {
      return;
    }
    
    setFormData({
      ...formData,
      members: [...formData.members, { ...newMember }]
    });
    
    setNewMember({ name: '', role: '' });
  };

  const removeMember = (index) => {
    const updatedMembers = [...formData.members];
    updatedMembers.splice(index, 1);
    
    setFormData({
      ...formData,
      members: updatedMembers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      setError('Название и код команды обязательны');
      return;
    }
    
    try {
      if (showCreateForm) {
        // Создать новую команду
        await axios.post('/api/teams', formData);
      } else if (showEditForm && currentTeam) {
        // Обновить существующую команду
        await axios.put(`/api/teams/${currentTeam.id}`, formData);
      }
      
      // Перезагрузить список команд и скрыть формы
      loadTeams();
      setShowCreateForm(false);
      setShowEditForm(false);
      setError(null);
    } catch (err) {
      console.error('Ошибка при сохранении команды:', err);
      
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Не удалось сохранить команду. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setError(null);
  };

  if (loading) {
    return <div className="admin-loading">Загрузка команд...</div>;
  }

  return (
    <div className="admin-team-management">
      <div className="admin-team-header">
        <h2>Управление командами</h2>
        <button className="create-team-btn" onClick={handleCreateClick}>
          Создать команду
        </button>
      </div>
      
      {error && <div className="admin-error">{error}</div>}
      
      {showCreateForm || showEditForm ? (
        <div className="team-form-container">
          <h3>{showCreateForm ? 'Создание новой команды' : 'Редактирование команды'}</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Название команды:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Код команды:</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                required
              />
              <div className="form-hint">Код команды используется для входа в систему</div>
            </div>
            
            <div className="form-group">
              <label>Участники команды:</label>
              
              <div className="member-inputs">
                <div className="member-field">
                  <input
                    type="text"
                    name="name"
                    placeholder="Имя участника"
                    value={newMember.name}
                    onChange={handleMemberChange}
                  />
                </div>
                
                <div className="member-field">
                  <input
                    type="text"
                    name="role"
                    placeholder="Роль"
                    value={newMember.role}
                    onChange={handleMemberChange}
                  />
                </div>
                
                <button type="button" className="add-member-btn" onClick={addMember}>
                  Добавить
                </button>
              </div>
              
              {formData.members.length > 0 && (
                <div className="members-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Имя</th>
                        <th>Роль</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.members.map((member, index) => (
                        <tr key={index}>
                          <td>{member.name}</td>
                          <td>{member.role || '-'}</td>
                          <td>
                            <button 
                              type="button" 
                              className="remove-btn"
                              onClick={() => removeMember(index)}
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Отмена
              </button>
              <button type="submit" className="submit-btn">
                {showCreateForm ? 'Создать' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="teams-list">
          {teams.length === 0 ? (
            <div className="no-teams">Команды отсутствуют</div>
          ) : (
            <table className="teams-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Код</th>
                  <th>Участники</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team.id}>
                    <td>{team.id}</td>
                    <td>{team.name}</td>
                    <td>{team.code}</td>
                    <td>
                      {Array.isArray(team.members) && team.members.length > 0 
                        ? team.members.map(m => m.name).join(', ')
                        : 'Нет участников'}
                    </td>
                    <td className="team-actions">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditClick(team)}
                      >
                        Редактировать
                      </button>
                      {team.code !== 'admin' && (
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteClick(team.id)}
                        >
                          Удалить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminTeamManagement; 