import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TournamentList from '../components/TournamentList';
import TournamentSearch from '../components/TournamentSearch';
import './ArchivePage.css';

const ArchivePage = ({ isAdmin }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  useEffect(() => {
    loadArchivedTournaments();
  }, []);

  const loadArchivedTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/tournaments?archived=true');
      console.log('Загруженные архивные турниры:', response.data);
      setTournaments(response.data);
    } catch (error) {
      console.error('Error loading archived tournaments:', error);
      setError('Не удалось загрузить архивные турниры. Пожалуйста, попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const filterTournaments = (tournament) => {
    const tournamentName = (tournament.name || '').toLowerCase();
    const searchLower = searchQuery.toLowerCase().trim();
    
    const matchesSearch = searchLower === '' || tournamentName.includes(searchLower);
    
    const matchesStatus = selectedStatus === 'all' || tournament.status === selectedStatus;
    
    const matchesDiscipline = selectedDiscipline === 'all' || tournament.discipline === selectedDiscipline;
    
    console.log(`Турнир: ${tournament.name}, Дисциплина: ${tournament.discipline}, Выбранная дисциплина: ${selectedDiscipline}, Совпадение: ${matchesDiscipline}`);
    
    return matchesSearch && matchesStatus && matchesDiscipline;
  };

  const handleSearchChange = (query, status) => {
    console.log('Изменены параметры поиска архива:', { query, status });
    setSearchQuery(query);
    setSelectedStatus(status);
  };

  const handleDisciplineChange = (discipline) => {
    setSelectedDiscipline(discipline);
  };

  const handleTournamentUpdated = () => {
    loadArchivedTournaments();
  };

  return (
    <div className="archive-page">
      <div className="archive-header">
        <h1>Архив турниров</h1>
        <p>Здесь представлены все завершенные турниры по различным киберспортивным дисциплинам</p>
      </div>

      <div className="archive-filters">
        <TournamentSearch 
          onSearch={handleSearchChange}
          initialQuery={searchQuery}
          initialStatus={selectedStatus}
        />

        <div className="discipline-filter">
          <label>Дисциплина:</label>
          <select 
            value={selectedDiscipline} 
            onChange={(e) => handleDisciplineChange(e.target.value)}
          >
            <option value="all">Все дисциплины</option>
            <option value="Dota 2">Dota 2</option>
            <option value="CS 2">CS 2</option>
            <option value="Brawl Stars">Brawl Stars</option>
            <option value="Valorant">Valorant</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Загрузка архивных турниров...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <TournamentList 
          tournaments={tournaments.filter(filterTournaments)} 
          isAdmin={isAdmin} 
          onTournamentUpdated={handleTournamentUpdated}
        />
      )}
    </div>
  );
};

export default ArchivePage; 