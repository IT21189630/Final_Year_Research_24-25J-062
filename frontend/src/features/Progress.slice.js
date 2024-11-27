import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current_level: null,
  course_name: null,
  course_id: null,
};

export const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    save: (state, action) => {
      state.current_level = action.payload.current_level;
      state.course_name = action.payload.course_name;
      state.course_id = action.payload.course_id;
    },
    reset: (state) => {
      state.current_level = null;
      state.course_name = null;
      state.course_id = null;
    },
    updateProgress: (state, action) => {
      state.current_level = action.payload.current_level;
    },
  },
});

export const { save, reset, updateProgress } = progressSlice.actions;

export default progressSlice.reducer;
