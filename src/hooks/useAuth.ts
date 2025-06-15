import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  logoutUser, 
  fetchUserProfile,
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError 
} from '../store/slices/authSlice';
import type { LoginRequest } from '../services/auth/authModels';
import type { AppDispatch } from '../store';

/**
 * Custom hook for authentication related functionality
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();  
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginRequest) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.success) {
        // Navigation will be handled by the useEffect in Login component
        // that watches the isAuthenticated state
        return true;
      }
    }
    return false;
  };

  /**
   * Logout user and redirect to login page
   */
  const logout = async () => {
    await dispatch(logoutUser());
    // Navigation will be handled by the ProtectedRoute component
    // when isAuthenticated becomes false
  };

  /**
   * Get current user profile
   */
  const getProfile = async () => {
    return await dispatch(fetchUserProfile());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getProfile
  };
};
