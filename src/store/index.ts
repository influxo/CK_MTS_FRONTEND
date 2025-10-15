import { configureStore, combineReducers } from "@reduxjs/toolkit";
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
import { logoutUser } from "./slices/authSlice";
import formsReducer from "./slices/formsSlice";
import formReducer from "./slices/formSlice";

const appReducer = combineReducers({
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
});

// Root reducer that resets the state on logout
const rootReducer = (state: any, action: any) => {
  if (action.type === logoutUser.fulfilled.type) {
    state = undefined; // reset entire redux state to initial slices
  }
  return appReducer(state, action);
};

// Configure the Redux store
export const store = configureStore({
  reducer: rootReducer,
  // Add middleware or other configuration options here if needed
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
