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
  const [statusFilter, setStatusFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');

  useEffect(() => {
    loadArchivedTournaments();
  }, []);

  const loadArchivedTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/tournaments?archived=true');
      setTournaments(response.data);
    } catch (error) {
      console.error('Error loading archived tournaments:', error);
      setError('Не удалось загрузить архивные турниры. Пожалуйста, попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTournaments = () => {
    return tournaments.filter(tournament => {
      // Фильтр по поиску (название турнира)
      const tournamentName = tournament.name || '';
      const matchesSearch = tournamentName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Фильтр по статусу
      const matchesStatus = !statusFilter || tournament.status === statusFilter;
      
      // Фильтр по дисциплине
      const matchesDiscipline = !disciplineFilter || tournament.discipline === disciplineFilter;
      
      return matchesSearch && matchesStatus && matchesDiscipline;
    });
  };

  const handleSearchChange = (query, status) => {
    setSearchQuery(query);
    setStatusFilter(status);
  };

  const handleDisciplineChange = (discipline) => {
    setDisciplineFilter(discipline);
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
          initialStatus={statusFilter}
        />

        <div className="discipline-filter">
          <label>Дисциплина:</label>
          <select 
            value={disciplineFilter} 
            onChange={(e) => handleDisciplineChange(e.target.value)}
          >
            <option value="">Все дисциплины</option>
            <option value="Dota 2">Dota 2</option>
            <option value="CS2">CS2</option>
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
          tournaments={getFilteredTournaments()} 
          isAdmin={isAdmin} 
          onTournamentUpdated={handleTournamentUpdated}
        />
      )}
    </div>
  );
};

export default ArchivePage; 