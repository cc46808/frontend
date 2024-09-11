import React, { useState } from 'react';
import GameSetup from './components/GameSetup';
import GameInterface from './components/GameInterface';
import Leaderboard from './components/Leaderboard';
import SettingsMenu from './components/SettingsMenu';
import OfflineSync from './components/OfflineSync';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const App: React.FC = () => {
  // Manage the game stats in App state so that they can be passed to OfflineSync
  const [stats, setStats] = useState<any[]>([]);

  // Function to update the stats from GameInterface
  const updateStats = (newStat: any) => {
    setStats((prevStats) => [...prevStats, newStat]);
  };

  return (
    <Router>
      <div className="App">
        {/* Header with Links */}
        <header className="bg-gray-800 p-4">
          <nav className="flex justify-around">
            <Link to="/" className="text-white hover:text-gray-300">Game Setup</Link>
            <Link to="/game" className="text-white hover:text-gray-300">Game Interface</Link>
            <Link to="/leaderboard" className="text-white hover:text-gray-300">Leaderboard</Link>
            <Link to="/settings" className="text-white hover:text-gray-300">Settings</Link>
          </nav>
        </header>

        {/* Routes for the application */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<GameSetup />} />
            <Route
              path="/game"
              element={<GameInterface stats={stats} updateStats={updateStats} />}
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<SettingsMenu />} />
          </Routes>
        </div>

        {/* Pass the current stats to OfflineSync */}
        <OfflineSync stats={stats} />
      </div>
    </Router>
  );
};

export default App;
