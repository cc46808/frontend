import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

interface CustomStat {
  _id?: string; // Add ID to track the custom stat in the database
  name: string;
  enabled: boolean;
}

const SettingsMenu: React.FC = () => {
  const [screenTimeout, setScreenTimeout] = useState<number>(5);
  const [enableOffsides, setEnableOffsides] = useState<boolean>(true);
  const [enableFouls, setEnableFouls] = useState<boolean>(true);
  const [customStats, setCustomStats] = useState<CustomStat[]>([]);
  const [newCustomStat, setNewCustomStat] = useState<string>('');

  // Fetch custom stats from the backend when the component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const savedSettings = await axios.get('http://localhost:5000/api/custom-stats');
        setCustomStats(savedSettings.data || []); // Set the custom stats from the backend
      } catch (error) {
        console.error('Failed to load custom stats:', error);
      }
    };

    fetchSettings();
  }, []);

  // Handle adding a new custom stat
  const addCustomStat = async () => {
    if (newCustomStat.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5000/api/custom-stats', {
          name: newCustomStat,
          enabled: true,
        });
        setCustomStats([...customStats, response.data]); // Add the newly created stat to the state
        setNewCustomStat('');
        toast.success('Custom stat added successfully!');
      } catch (error) {
        console.error('Failed to add custom stat:', error);
      }
    }
  };

  // Handle toggling custom stat enabled/disabled
  const toggleCustomStat = async (index: number) => {
    const updatedCustomStats = customStats.map((stat, idx) =>
      idx === index ? { ...stat, enabled: !stat.enabled } : stat
    );
    setCustomStats(updatedCustomStats);

    // Save the updated stat to the backend
    try {
      const updatedStat = updatedCustomStats[index];
      await axios.put(`http://localhost:5000/api/custom-stats/${updatedStat._id}`, updatedStat);
      toast.success('Custom stat updated successfully!');
    } catch (error) {
      console.error('Failed to update custom stat:', error);
    }
  };

  // Handle deleting a custom stat
  const deleteCustomStat = async (index: number) => {
    const statToDelete = customStats[index];
    try {
      await axios.delete(`http://localhost:5000/api/custom-stats/${statToDelete._id}`);
      const updatedCustomStats = customStats.filter((_, idx) => idx !== index);
      setCustomStats(updatedCustomStats);
      toast.info('Custom stat deleted');
    } catch (error) {
      console.error('Failed to delete custom stat:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Screen Timeout */}
      <div>
        <label>Screen Timeout (minutes):</label>
        <input
          type="number"
          value={screenTimeout}
          onChange={(e) => setScreenTimeout(Number(e.target.value))}
          className="border p-2 m-2"
        />
      </div>

      {/* Predefined stats */}
      <div>
        <input
          type="checkbox"
          checked={enableOffsides}
          onChange={() => setEnableOffsides(!enableOffsides)}
        />
        <label className="ml-2">Enable Offsides</label>
      </div>
      <div>
        <input
          type="checkbox"
          checked={enableFouls}
          onChange={() => setEnableFouls(!enableFouls)}
        />
        <label className="ml-2">Enable Fouls</label>
      </div>

      {/* Custom stat creation */}
      <div className="mt-4">
        <h2 className="font-bold">Custom Stats</h2>
        <input
          type="text"
          placeholder="New Custom Stat"
          value={newCustomStat}
          onChange={(e) => setNewCustomStat(e.target.value)}
          className="border p-2 m-2"
        />
        <button onClick={addCustomStat} className="bg-blue-500 text-white p-2">
          Add Custom Stat
        </button>

        {/* List of custom stats */}
        {customStats.length > 0 && (
          <ul className="mt-4">
            {customStats.map((stat, index) => (
              <li key={stat._id} className="flex justify-between items-center p-2">
                <div>
                  <input
                    type="checkbox"
                    checked={stat.enabled}
                    onChange={() => toggleCustomStat(index)}
                  />
                  <label className="ml-2">Enable {stat.name}</label>
                </div>
                <button
                  onClick={() => deleteCustomStat(index)}
                  className="bg-red-500 text-white p-1 ml-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Toast Container to display notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default SettingsMenu;
