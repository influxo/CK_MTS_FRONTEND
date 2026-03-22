import { useSelector, useDispatch } from "react-redux";
import {
  loginUser,
  logoutUser,
  fetchUserProfile,
  resetPassword,
  forgotPassword,
  acceptInvitation,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  verifyTotp,
  selectMfaRequired,
  selectMfaTempToken,
} from "../store/slices/authSlice";
import type {
  LoginRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  AcceptInvitationRequest,
} from "../services/auth/authModels";
import type { AppDispatch } from "../store";

/**
 * Custom hook for authentication related functionality
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const mfaRequired = useSelector(selectMfaRequired);
  const mfaTempToken = useSelector(selectMfaTempToken);

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
   * Verify TOTP code when MFA is required
   */
  const verifyTotpCode = async (code: string, tempToken?: string | null) => {
    const tokenToUse = tempToken ?? mfaTempToken;
    if (!tokenToUse) return false;
    const result = await dispatch(
      verifyTotp({ code, mfaTempToken: tokenToUse }) as any
    );
    if ((verifyTotp as any).fulfilled.match(result)) {
      if (result.payload.success) {
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
   * Reset user password
   */
  const resetPasswordUser = async (credentials: ResetPasswordRequest) => {
    const result = await dispatch(resetPassword(credentials));
    if (resetPassword.fulfilled.match(result)) {
      if (result.payload.success) {
        // Navigation will be handled by the useEffect in ResetPassword component
        // that watches the isAuthenticated state
        return true;
      }
    }
    return false;
  };

  /**
   * Request a password reset email
   */
  const forgotPasswordUser = async (payload: ForgotPasswordRequest) => {
    const result = await dispatch(forgotPassword(payload));
    if (forgotPassword.fulfilled.match(result)) {
      if (result.payload.success) {
        return true;
      }
    }
    return false;
  };

  /**
   * Accept invitation (verify email) with email, token and password
   */
  const acceptInvitationUser = async (payload: AcceptInvitationRequest) => {
    const result = await dispatch(acceptInvitation(payload));
    if (acceptInvitation.fulfilled.match(result)) {
      if (result.payload.success) {
        return true;
      }
    }
    return false;
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
    mfaRequired,
    mfaTempToken,
    login,
    verifyTotpCode,
    logout,
    resetPassword: resetPasswordUser,
    forgotPassword: forgotPasswordUser,
    acceptInvitationUser,
    getProfile,
  };
};
