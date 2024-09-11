import React, { useState, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import socket from '../utils/socket';
import axios from 'axios';
import StatsTable from './StatsTable';

// Register required chart components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Game {
  _id: string;
  homeTeam: string;
  awayTeam: string;
}

interface Stat {
  player: string;
  type: string;
  time: number;
}

const Leaderboard: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  // Fetch games from the backend
  const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/games');
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  // Fetch stats for the selected game
  const fetchStatsForGame = async (gameId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/games/${gameId}/stats`);
      setStats(response.data);
      updateChartData(response.data);
      updateSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Update chart data based on the fetched stats
  const updateChartData = (stats: Stat[]) => {
    const players = [...new Set(stats.map((stat) => stat.player))]; // Unique players
    const statTypes = [...new Set(stats.map((stat) => stat.type))]; // Unique stat types

    // Initialize datasets for each stat type
    const datasets = statTypes.map((statType) => ({
      label: statType,
      data: players.map((player) => {
        // Count occurrences of each stat type per player
        return stats
          .filter((stat) => stat.player === player && stat.type === statType)
          .reduce((acc, curr) => acc + 1, 0);
      }),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.6)`, // Random color for each stat type
    }));

    const data = {
      labels: players,
      datasets,
    };

    setChartData(data);
  };

  // Update summary data (top player for each stat)
  const updateSummary = (stats: Stat[]) => {
    const statTypes = [...new Set(stats.map((stat) => stat.type))]; // Unique stat types

    // Find the top player for each stat type
    const topPlayers = statTypes.map((statType) => {
      const players = stats
        .filter((stat) => stat.type === statType)
        .reduce((acc: any, stat) => {
          acc[stat.player] = (acc[stat.player] || 0) + 1;
          return acc;
        }, {});

      // Find the player with the highest count
      const topPlayer = Object.keys(players).reduce((a, b) => (players[a] > players[b] ? a : b));
      return { statType, player: topPlayer, count: players[topPlayer] };
    });

    setSummary(topPlayers);
  };

  // Handle game selection
  const handleGameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gameId = e.target.value;
    setSelectedGameId(gameId);
    fetchStatsForGame(gameId);
  };

  // Listen for stat updates via Socket.io
  useEffect(() => {
    if (selectedGameId) {
      socket.on('game_update', (newStat) => {
        // Only update if the stat belongs to the selected game
        if (newStat.gameId === selectedGameId) {
          fetchStatsForGame(selectedGameId);
        }
      });
    }

    // Clean up the socket listener when the component unmounts or game changes
    return () => {
      socket.off('game_update');
    };
  }, [selectedGameId]);

  // Fetch games when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Leaderboard</h1>

      {/* Dropdown to select a game */}
      <select value={selectedGameId || ''} onChange={handleGameSelect} className="border p-2 m-2">
        <option value="" disabled>Select a Game</option>
        {games.map((game) => (
          <option key={game._id} value={game._id}>
            {game.homeTeam} vs {game.awayTeam}
          </option>
        ))}
      </select>

      {/* Display chart only if data is available */}
      {chartData ? (
        <Bar id="leaderboard-chart" data={chartData} />
      ) : (
        <p>Select a game to view the leaderboard</p>
      )}

      <div className="mt-4 flex flex-wrap w-full">
        <h2 className="font-bold w-full">Summary</h2>
        {summary && (
          <div className="flex flex-wrap w-full">
            {summary.map((item: any, index: number) => (
              <div key={index} className="bg-white rounded shadow-md p-4 pr-2 pl-2 m-2 w-1/3 md:w-1/5 lg:w-1/5 xl:w-1/5 ">
                <div className="card">
                  <div className="card-body">
                    <h3 className="font-bold text-lg mb-2">{item.statType}</h3>
                    <p className="flex justify-between w-full">
                      <span>{item.count}</span>
                      <span className="text-right">{item.player}</span>
                    </p>                 
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap w-full">
        <h2 className="font-bold w-full">Stat Timeline</h2>
        <div className="timeline">
          {stats.map((stat, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-date">{stat.type}</div>
              <div className="timeline-value">{stat.time}</div>
            </div>
          ))}
        </div>
      </div>
      <style>
      {`
      .timeline {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background-color: #f7f7f7;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }

      .timeline-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }

      .timeline-date {
        font-size: 16px;
        font-weight: bold;
        margin-right: 10px;
      }

      .timeline-value {
        font-size: 16px;
        color: #666;
      }`}
      </style>
    </div>
  );
};

export default Leaderboard;
