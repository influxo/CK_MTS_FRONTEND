import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import projectsReducer from "./slices/projectsSlice";
import subprojectsReducer from "./slices/subProjectSlice";
// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    subprojects: subprojectsReducer,
    // Add other reducers here as your app grows
  },
  // Add middleware or other configuration options here if needed
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
