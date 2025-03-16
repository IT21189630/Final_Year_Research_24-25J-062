import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lesson_id: null,
};

export const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    mountLesson: (state, action) => {
      state.lesson_id = action.payload.lesson_id;
    },
    unmountLesson: (state) => {
      state.lesson_id = null;
    },
  },
});

export const { mountLesson, unmountLesson } = lessonSlice.actions;

export default lessonSlice.reducer;
