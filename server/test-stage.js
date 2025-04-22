const db = require('./database');

// ID турнира для создания этапа (выберите существующий ID)
const tournamentId = 1;

async function testStageCreation() {
  console.log('Проверка существования турнира...');
  const tournament = await db.getTournamentById(tournamentId);
  
  if (!tournament) {
    console.error(`Турнир с ID ${tournamentId} не найден`);
    return;
  }
  
  console.log(`Турнир найден: ${tournament.name}`);
  
  console.log('Создание тестового этапа...');
  const stageData = {
    name: 'Тестовый этап',
    format: 'groups',
    status: 'Не начат',
    tournament_id: tournamentId,
    start_date: '2023-12-20',
    end_date: '2023-12-30',
    description: 'Тестовый этап для отладки'
  };
  
  const newStage = db.createStage(stageData);
  console.log('Создан новый этап:', newStage);
  
  console.log('Получение всех этапов для турнира...');
  const stages = db.getStagesByTournamentId(tournamentId);
  console.log(`Получено ${stages ? stages.length : 0} этапов:`);
  if (stages) {
    console.log(JSON.stringify(stages, null, 2));
  } else {
    console.log('Этапы не найдены или возникла ошибка');
  }
}

testStageCreation(); 