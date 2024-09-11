import socket from './socket';
import axios from 'axios';

// Function to sync data when back online
export const syncData = async (stats: any[]) => {
  try {
    // Send the stats to the server using Socket.io
    socket.emit('game_update', stats);

    // Optionally, you can also use an API call to sync the data
    await axios.post('http://localhost:5000/api/games/sync', { stats });

    console.log('Data synced successfully:', stats);
  } catch (error) {
    console.error('Error syncing data:', error);
  }
};
