import axios from 'axios';

// One Call API 3.0 URL for fetching weather data
const WEATHER_API_URL = 'https://api.openweathermap.org/data/3.0/onecall';
// Geocoding API URL for fetching coordinates based on city name
const GEOCODING_API_URL = 'http://api.openweathermap.org/geo/1.0/direct';
// Your OpenWeatherMap API key
const WEATHER_API_KEY = 'a6921dc7923f42666e20b2067d9bd227';

// Fetch weather data by geographic coordinates (latitude and longitude)
export const fetchWeatherByCoords = async (lat: number, lon: number, units = 'imperial') => {
  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units, // Dynamic units ('metric' or 'imperial')
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Fetch coordinates for a city name
export const fetchCoordsByCity = async (city: string) => {
  try {
    const response = await axios.get(GEOCODING_API_URL, {
      params: {
        q: city,
        limit: 3, // Limit to 5 suggestions
        appid: WEATHER_API_KEY,
      },
    });
    return response.data; // Returns an array of cities with coords
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    throw error;
  }
};
