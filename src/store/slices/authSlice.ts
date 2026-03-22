import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/auth/authService';
import type { LoginRequest, LoginResponse, ResetPasswordRequest, ForgotPasswordRequest, ApiResponse, AcceptInvitationRequest, VerifyTotpRequest, VerifyTotpResponse } from '../../services/auth/authModels';
import type { User } from '../../services/globalModels/User';

// Define the auth state interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // MFA state
  mfaRequired: boolean;
  mfaTempToken: string | null;
}

// Get token from localStorage
const token = localStorage.getItem('token');

// Initial state
const initialState: AuthState = {
  user: null,
  token: token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
  mfaRequired: false,
  mfaTempToken: null,
};

// Async thunks for authentication actions
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

// Verify TOTP code to complete login
export const verifyTotp = createAsyncThunk<
  VerifyTotpResponse,
  VerifyTotpRequest,
  { rejectValue: string }
>('auth/verifyTotp', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.verifyTotp(payload);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Verification failed');
  }
});

export const fetchUserProfile = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getProfile();
    if (!response.success || !response.data) {
      return rejectWithValue(response.message || 'Failed to fetch profile');
    }
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch profile');
  }
});

export const resetPassword = createAsyncThunk<
  ApiResponse,
  ResetPasswordRequest,
  { rejectValue: string }
>('auth/resetPassword', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.resetPassword(credentials);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Password reset failed');
  }
});

export const forgotPassword = createAsyncThunk<
  ApiResponse,
  ForgotPasswordRequest,
  { rejectValue: string }
>('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.forgotPassword(payload);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to send reset email');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  authService.logout();
  return null;
});

export const acceptInvitation = createAsyncThunk<
  LoginResponse,
  AcceptInvitationRequest,
  { rejectValue: string }
>('auth/acceptInvitation', async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.verifyEmail(payload);
    if (!response.success) {
      return rejectWithValue(response.message);
    }
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Accept invitation failed');
  }
});

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data;
        if (data?.mfaRequired) {
          state.mfaRequired = true;
          state.mfaTempToken = data.mfaTempToken || null;
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          return;
        }
        if (data) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
          state.mfaRequired = false;
          state.mfaTempToken = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify TOTP cases
      .addCase(verifyTotp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTotp.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload.data;
        if (data) {
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
        }
        state.mfaRequired = false;
        state.mfaTempToken = null;
      })
      .addCase(verifyTotp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.mfaRequired = false;
        state.mfaTempToken = null;
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        // We don't update auth state here as the user will need to log in after reset
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Accept invitation cases
      .addCase(acceptInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setCredentials, clearCredentials } = authSlice.actions;

// Export selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectMfaRequired = (state: { auth: AuthState }) => state.auth.mfaRequired;
export const selectMfaTempToken = (state: { auth: AuthState }) => state.auth.mfaTempToken;

export default authSlice.reducer;
