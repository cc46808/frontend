import axios from 'axios';

const API_URL = 'https://soccer-database-api.com/teams';
const API_KEY = 'your_api_key_here';

export const fetchTeams = async () => {
  try {
    const response = await axios.get(`${API_URL}?api_key=${API_KEY}`);
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};
