import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import projectsReducer from "./slices/projectsSlice";
import subprojectsReducer from "./slices/subProjectSlice";
import employeesReducer from "./slices/employeesSlice";
import rolesReducer from "./slices/roleSlice";
import activitiesReducer from "./slices/activitySlice";
import beneficiariesReducer from "./slices/beneficiarySlice";
import servicesReducer from "./slices/serviceSlice";
import userProjectsReducer from "./slices/userProjectsSlice";
import serviceMetricsReducer from "./slices/serviceMetricsSlice";
import kpiReducer from "./slices/kpiSlice";
import demographicsReducer from "./slices/demographicsSlice";
import formsReducer from "./slices/formsSlice";
import formReducer from "./slices/formSlice";
import offlineMiddleware from "./middleware/offlineMiddleware";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    subprojects: subprojectsReducer,
    forms: formsReducer,
    form: formReducer,
    employees: employeesReducer,
    roles: rolesReducer,
    activities: activitiesReducer,
    beneficiaries: beneficiariesReducer,
    services: servicesReducer,
    userProjects: userProjectsReducer,
    serviceMetrics: serviceMetricsReducer,
    kpis: kpiReducer,
    demographics: demographicsReducer,
    // Add other reducers here as your app grows
  },
  // Add offline middleware to intercept API calls and read from IndexedDB
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state for serialization warnings
        ignoredActions: ['form/submitFormResponse/fulfilled'],
        ignoredPaths: ['form.lastSubmission'],
      },
    }).concat(offlineMiddleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
