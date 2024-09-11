import React, { useState, useEffect } from 'react';
import { fetchWeatherByCoords, fetchCoordsByCity } from '../api/weatherApi';
import axios from 'axios';

interface Game {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  location: string;
  city: string;
  state: string;
  startTime: string;
  weather: string;
  temperature: number;
}

const GameSetup: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [city, setCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [state, setState] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [startTime, setStartTime] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch city suggestions based on user input
  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const cities = await fetchCoordsByCity(e.target.value);
        setCitySuggestions(cities);
      } catch (error) {
        setError('Failed to fetch city suggestions.');
      }
    } else {
      setCitySuggestions([]);
    }
  };

  // Handle city selection and fetch weather data
  const handleCitySelect = async (lat: number, lon: number, cityName: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setCity(cityName);
    setCitySuggestions([]);

    try {
      const weatherData = await fetchWeatherByCoords(lat, lon, 'imperial');
      setWeather(weatherData);
    } catch (error) {
      setError('Failed to fetch weather data.');
    }
  };

  // Convert the game start time to a Unix timestamp
  const getStartTimeUnix = () => {
    return new Date(startTime).getTime() / 1000;
  };

  // Find the closest hourly weather forecast based on the start time
const findClosestHourlyTemp = (weatherData: any) => {
  const startTimeUnix = getStartTimeUnix(); // Game start time in Unix timestamp
  const hourlyData = weatherData?.hourly || [];
  
  // Ensure there's hourly data available
  if (!hourlyData.length) {
    console.error('No hourly weather data available.');
    return null;
  }

  let closestTemp = null;
  let closestDiff = Number.MAX_SAFE_INTEGER;

  hourlyData.forEach((hour: any) => {
    const diff = Math.abs(hour.dt - startTimeUnix);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestTemp = Math.round(hour.temp); // Round the closest temperature to the nearest whole number
    }
  });

  console.log(`Closest temperature found: ${closestTemp}`);
  return closestTemp;
};

// Fetch all games from the backend
const fetchGames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/games');
      
      // Log the response data to check if the temperature is included
      console.log('Games fetched from backend:', response.data);
      
      setGames(response.data);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    }
  };

  // Save the game (create or update)
  const saveGame = async () => {
    if (!latitude || !longitude || !weather) {
      setError('Please select a city to fetch weather data.');
      return;
    }
  
    // Find the closest temperature based on the game's start time
    const closestTemp = findClosestHourlyTemp(weather);
  
    const gameData = {
      homeTeam,
      awayTeam,
      location: `${latitude}, ${longitude}`,
      city,  
      state,
      startTime,
      weather: weather ? weather.current.weather[0].description : null,
      temperature: closestTemp || null, // Use the closest hourly temperature
    };
  
    // Log the game data to check the temperature value
    console.log('Game Data:', gameData);
  
    try {
      if (editingGameId) {
        const response = await axios.put(`http://localhost:5000/api/games/${editingGameId}`, gameData);
        if (response.status === 200) {
          setSuccess('Game updated successfully!');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/games', gameData);
        if (response.status === 201) {
          setSuccess('Game created successfully!');
        }
      }
      fetchGames();
      resetForm();
    } catch (err) {
      setError('Failed to save game.');
    }
  };
  

  // Delete a game
  const deleteGame = async (gameId: string) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/games/${gameId}`);
      if (response.status === 200) {
        setSuccess('Game deleted successfully!');
        fetchGames(); // Refresh the list of games after deletion
      }
    } catch (error) {
      setError('Failed to delete game.');
    }
  };

  // Populate form with game data for editing
  const editGame = (game: Game) => {
    setHomeTeam(game.homeTeam);
    setAwayTeam(game.awayTeam);
    setCity(game.city);
    setState(game.state);
    setStartTime(game.startTime);
    setEditingGameId(game._id); // Enter editing mode for this game
  };

  // Reset form fields and clear editing mode
  const resetForm = () => {
    setHomeTeam('');
    setAwayTeam('');
    setCity('');
    setState('');
    setLatitude(null);
    setLongitude(null);
    setStartTime('');
    setWeather(null);
    setEditingGameId(null); // Exit editing mode
  };

  // Fetch games when the component mounts
  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{editingGameId ? 'Edit Game' : 'Create a New Game'}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <input
        type="text"
        placeholder="Home Team"
        value={homeTeam}
        onChange={(e) => setHomeTeam(e.target.value)}
        className="border p-2 m-2"
      />
      <input
        type="text"
        placeholder="Away Team"
        value={awayTeam}
        onChange={(e) => setAwayTeam(e.target.value)}
        className="border p-2 m-2"
      />

      <input
        type="text"
        placeholder="Search for City"
        value={city}
        onChange={handleCityChange}
        className="border p-2 m-2"
      />
      {citySuggestions.length > 0 && (
        <ul className="border p-2 m-2">
          {citySuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="cursor-pointer"
              onClick={() => handleCitySelect(suggestion.lat, suggestion.lon, suggestion.name)}
            >
              {suggestion.name}, {suggestion.country} (Lat: {suggestion.lat}, Lon: {suggestion.lon})
            </li>
          ))}
        </ul>
      )}

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="border p-2 m-2"
      />

      {weather && (
        <div className="p-2 m-2">
          <>{`Current Weather: ${weather.current.temp}°F, ${weather.current.weather[0].description}`}</>
        </div>
      )}

      <button onClick={saveGame} className="bg-green-500 text-white p-2 m-2">
        {editingGameId ? 'Update Game' : 'Start Game'}
      </button>

      {/* List of existing games */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Existing Games</h2>
        {games.length > 0 ? (
          <ul className="border p-2 m-2">
            {games.map((game) => (
              <li key={game._id} className="flex justify-between items-center p-2">
                <div>
                  <p>{game.homeTeam} vs {game.awayTeam}</p>
                  <p>{game.city}, {game.state} - {new Date(game.startTime).toLocaleString()}</p>
                  <p>{`Weather: ${game.weather}, Temp: ${game.temperature || 'N/A'}°F`}</p>
                </div>
                <div>
                  <button
                    onClick={() => editGame(game)}
                    className="bg-blue-500 text-white p-1 ml-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGame(game._id)}
                    className="bg-red-500 text-white p-1 ml-2"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No games created yet.</p>
        )}
      </div>
    </div>
  );
};

export default GameSetup;
