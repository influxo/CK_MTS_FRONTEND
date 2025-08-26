import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import projectsReducer from "./slices/projectsSlice";
import subprojectsReducer from "./slices/subProjectSlice";
import formsReducer from "./slices/formSlice";
import employeesReducer from "./slices/employeesSlice";
import rolesReducer from "./slices/roleSlice";
import activitiesReducer from "./slices/activitySlice";
import beneficiariesReducer from "./slices/beneficiarySlice";
// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    subprojects: subprojectsReducer,
    forms: formsReducer,
    employees: employeesReducer,
    roles: rolesReducer,
    activities: activitiesReducer,
    beneficiaries: beneficiariesReducer,
    // Add other reducers here as your app grows
  },
  // Add middleware or other configuration options here if needed
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
