import { createSlice } from '@reduxjs/toolkit';

interface GameState {
  homeTeam: string;
  awayTeam: string;
  location: string;
  startTime: string;
  stats: any[];
}

const initialState: GameState = {
  homeTeam: '',
  awayTeam: '',
  location: '',
  startTime: '',
  stats: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameDetails(state, action) {
      const { homeTeam, awayTeam, location, startTime } = action.payload;
      state.homeTeam = homeTeam;
      state.awayTeam = awayTeam;
      state.location = location;
      state.startTime = startTime;
    },
    addStat(state, action) {
      state.stats.push(action.payload);
    },
  },
});

export const { setGameDetails, addStat } = gameSlice.actions;
export default gameSlice.reducer;
