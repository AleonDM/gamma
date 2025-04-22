import { useState, useEffect } from 'react';
import axios from 'axios';
import TeamCard from './TeamCard';
import TeamAddButton from './TeamAddButton';
import './TeamList.css';

const TeamList = ({ isAdmin }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError('Ошибка при загрузке команд');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamUpdated = () => {
    loadTeams();
  };

  if (loading) {
    return <div className="loading-message">Загрузка команд...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!teams || teams.length === 0) {
    return (
      <>
        <div className="no-teams">
          <h3>Нет команд</h3>
          <p>Пока не создано ни одной команды</p>
        </div>
        {isAdmin && <TeamAddButton onTeamAdded={handleTeamUpdated} />}
      </>
    );
  }

  return (
    <div className="team-list">
      {isAdmin && <TeamAddButton onTeamAdded={handleTeamUpdated} />}
      
      {teams.map(team => (
        <TeamCard 
          key={team.id} 
          team={team} 
          isAdmin={isAdmin} 
          onTeamUpdated={handleTeamUpdated}
        />
      ))}
    </div>
  );
};

export default TeamList; 