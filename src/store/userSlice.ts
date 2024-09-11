import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  role: string; // 'admin' or 'user'
}

const initialState: UserState = {
  name: '',
  email: '',
  role: 'user',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails(state, action) {
      const { name, email, role } = action.payload;
      state.name = name;
      state.email = email;
      state.role = role;
    },
  },
});

export const { setUserDetails } = userSlice.actions;
export default userSlice.reducer;
