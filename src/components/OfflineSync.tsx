import React, { useEffect } from 'react';
import { syncData } from '../utils/dataSync';

interface OfflineSyncProps {
  stats: any[]; // List of game stats to sync
}

  /**
   * OfflineSync is a React component that saves game stats to local storage when the user goes offline
   * and syncs them with the server or external storage when the user comes back online.
   *
   * @param {any[]} stats the list of game stats to sync
   * @returns a React component that renders a message indicating that offline sync is active
   */
const OfflineSync: React.FC<OfflineSyncProps> = ({ stats }) => {
  useEffect(() => {
    const saveStatsOffline = () => {
      console.log('You are offline, saving stats locally.');
      const statsToSave = JSON.stringify(stats);
      localStorage.setItem('offlineStats', statsToSave);
    };

    const syncStatsOnline = () => {
      console.log('You are back online, syncing stats.');
      const offlineStats = localStorage.getItem('offlineStats');
      if (offlineStats) {
        syncData(JSON.parse(offlineStats)); // Sync data with the server or external storage
        localStorage.removeItem('offlineStats'); // Clear after sync
      }
    };

    // Attach event listeners for offline and online events
    window.addEventListener('offline', saveStatsOffline);
    window.addEventListener('online', syncStatsOnline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('offline', saveStatsOffline);
      window.removeEventListener('online', syncStatsOnline);
    };
  }, [stats]); // Re-run this effect whenever `stats` changes

  return (
    <div className="fixed bottom-4 left-6 text-left text-gray-200 z-[-1]">
    Online Sync is active
  </div>
  );
};

export default OfflineSync;
