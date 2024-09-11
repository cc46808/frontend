import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './store/gameSlice';
import userReducer from './store/userSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
