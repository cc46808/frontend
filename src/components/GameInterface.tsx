import React, { useState, useEffect } from 'react';
import socket from '../utils/socket';
import axios from 'axios';

interface GameInterfaceProps {
  stats: any[];
  updateStats: (newStat: any) => void;
}

interface Game {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  location: string;
  startTime: string;
}

interface Stat {
  player: string;
  type: string;
  time: number;
  gameId: string;
}

interface CustomStat {
    name: string;
    enabled: boolean;
  }

const loadSettings = () => {
  const savedSettings = localStorage.getItem('appSettings');
  return savedSettings
    ? JSON.parse(savedSettings)
    : { screenTimeout: 45, enableFouls: true, enableOffsides: true, customStats: [] };
};

// Function to convert plural stat types to singular, handling custom stat types as well
const singularizeStatType = (statType: string) => {
  const singularForms: { [key: string]: string } = {
    Goals: 'Goal',
    Fouls: 'Foul',
    Assists: 'Assist',
    Offsides: 'Offside',
    Corners: 'Corner'
  };
  // Check if it's a hardcoded stat type, otherwise handle custom ones by removing trailing 's'
  return singularForms[statType] || (statType.endsWith('s') ? statType.slice(0, -1) : statType);
};

const GameInterface: React.FC<GameInterfaceProps> = ({ stats, updateStats }) => {
    const [gameClock, setGameClock] = useState(0);
    const [statType, setStatType] = useState('');
    const [player, setPlayer] = useState('');
    const [games, setGames] = useState<Game[]>([]);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [gameStats, setGameStats] = useState<Stat[]>([]); // Track stats for the selected game
    const [customStats, setCustomStats] = useState<CustomStat[]>([]); // Track custom stats
    const [showModal, setShowModal] = useState(false);
  

  const { screenTimeout, enableFouls, enableOffsides } = loadSettings();

  // Fetch the list of games from the backend
  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  // Fetch the stats for the selected game
  const fetchStatsForGame = async (gameId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/games/${gameId}/stats`);
      setGameStats(response.data); // Set the stats for the selected game
    } catch (error) {
      console.error('Failed to fetch stats for game:', error);
    }
  };

    // Fetch custom stats from the backend
    const fetchCustomStats = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/custom-stats'); // Ensure this endpoint exists
          setCustomStats(response.data);
        } catch (error) {
          console.error('Failed to fetch custom stats:', error);
        }
      };

  // Function to handle the game start logic
  const handleGameStart = (game: Game) => {
    const startTime = new Date(game.startTime).getTime();
    const currentTime = Date.now();

    if (startTime > currentTime) {
      setShowModal(true);
    } else {
      const timeDifference = Math.floor((currentTime - startTime) / 1000);
      setGameClock(timeDifference); // Set game clock to time since game started
    }
  };

  // Function to start the game now if the user confirms
  const startGameNow = async () => {
    if (selectedGameId) {
      try {
        const currentTime = new Date().toISOString();
        await axios.put(`http://localhost:5000/api/games/${selectedGameId}`, { startTime: currentTime });
        setShowModal(false); // Close the modal
        setGameClock(0); // Reset game clock to 0
      } catch (error) {
        console.error('Failed to start the game:', error);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setGameClock((prevClock) => prevClock + 1), 1000);
    return () => clearInterval(timer); // Clean up timer on component unmount
  }, []);

  useEffect(() => {
    fetchGames();
    fetchCustomStats(); // Fetch custom stats when component mounts
  }, []);

  useEffect(() => {
    if (selectedGameId) {
      const selectedGame = games.find((game) => game._id === selectedGameId);
      if (selectedGame) {
        handleGameStart(selectedGame);
        fetchStatsForGame(selectedGameId);
      }
    }
  }, [selectedGameId, games]);

 // Function to add a stat for the selected game
 const addStat = async (selectedStatType?: string) => {
    if (!selectedGameId) {
      alert('Please select a game to add stats to.');
      return;
    }

    const stat = selectedStatType || statType;

    if (!stat) {
      alert('Please select a stat type.');
      return;
    }

    const gameTimeInMinutes = Math.ceil(gameClock / 60);
    const newStat = { type: stat, player, time: gameTimeInMinutes, gameId: selectedGameId };
    updateStats(newStat);
    socket.emit('game_update', newStat);

    try {
      await axios.post(`http://localhost:5000/api/games/${selectedGameId}/stats`, newStat);
      console.log('Stat saved successfully:', newStat);
      setGameStats((prevStats) => [...prevStats, newStat]);
    } catch (error) {
      console.error('Failed to save stat:', error);
    }
  };

  useEffect(() => {
    socket.on('game_update', (stat) => {
      if (stat.gameId === selectedGameId) {
        updateStats(stat);
        setGameStats((prevStats) => [...prevStats, stat]);
      }
    });

    return () => {
      socket.off('game_update');
    };
  }, [updateStats, selectedGameId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Game Stats</h1>

      {/* Game selection dropdown */}
      <select
        value={selectedGameId || ''}
        onChange={(e) => setSelectedGameId(e.target.value)}
        className="border p-2 m-2"
      >
        <option value="" disabled>Select a Game</option>
        {games.map((game) => (
          <option key={game._id} value={game._id}>
            {game.homeTeam} vs {game.awayTeam} ({new Date(game.startTime).toLocaleString()})
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Player Name"
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
        className="border p-2 m-2"
      />

      {/* Predefined Stat Types */}
      {enableFouls && (
        <button onClick={() => addStat('Fouls')} className="bg-yellow-500 text-white p-2 m-2">
          Add Foul
        </button>
      )}
      {enableOffsides && (
        <button onClick={() => addStat('Offsides')} className="bg-yellow-500 text-white p-2 m-2">
          Add Offside
        </button>
      )}

      {/* Custom Stat Types (Dynamically loaded from backend) */}
      {customStats.length > 0 &&
        customStats.map(
          (customStat: CustomStat, index: number) =>
            customStat.enabled && (
              <button
                key={index}
                onClick={() => addStat(customStat.name)}
                className="bg-purple-500 text-white p-2 m-2"
              >
                Add {customStat.name}
              </button>
            )
        )}

      {/* Button to Add Stat */}
      <button onClick={() => addStat()} className="bg-green-500 text-white p-2 m-2">
        Add Stat
      </button>

      {/* Display Game Stats */}
      <div className="mt-4">
        <h2 className="font-bold">Stats for Selected Game</h2>
        {gameStats.length > 0 ? (
          gameStats.map((stat, index) => (
            <p key={index}>
              {stat.player} - {singularizeStatType(stat.type)} ({stat.time}')
            </p>
          ))
        ) : (
          <p>No stats recorded yet for this game.</p>
        )}
      </div>

      {/* Modal to confirm starting the game */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-10">
          <div className="flex items-center justify-center h-screen">
            <div className="bg-white rounded-lg shadow-lg p-4 w-1/2">
              <p>The game hasn't started yet. Do you want to start the game now?</p>
              <button onClick={startGameNow} className="bg-green-500 text-white p-2 m-2">
                Yes, Start the Game
              </button>
              <button onClick={() => setShowModal(false)} className="bg-red-500 text-white p-2 m-2">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInterface;