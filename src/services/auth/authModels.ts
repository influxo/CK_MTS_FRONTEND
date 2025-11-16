import type { User } from "../globalModels/User";

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface InviteUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  roleIds: number[];
}

export interface ForgotPasswordRequest {
  email: string;
}

// Accept invitation / verify email request
export interface AcceptInvitationRequest {
  email: string;
  token: string;
  password: string;
}


export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
    // Indicates that login requires a second factor (TOTP)
    mfaRequired?: boolean;
    // Temporary token or challenge identifier to be used when verifying TOTP
    mfaTempToken?: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    verificationToken?: string;
    verificationLink?: string;
  };
}

// 2FA (TOTP) models
export interface VerifyTotpRequest {
  code: string; // 6-digit code
  mfaTempToken: string; // obtained from login response
}

export interface VerifyTotpResponse extends LoginResponse {}

export interface StartTotpSetupResponse {
  success: boolean;
  message: string;
  data?: {
    secret: string;
    otpauthUrl: string;
    // Optional QR image as data URL produced by backend to avoid adding QR libs on FE
    qrCodeDataUrl?: string;
    // Option A: token used to confirm setup without entering a code
    enrollmentToken?: string;
  };
}

export interface ConfirmTotpSetupRequest {
  code?: string;
  enrollmentToken?: string;
}

export interface ConfirmTotpSetupResponse {
  success: boolean;
  message: string;
  data?: {
    recoveryCodes?: string[];
  };
}

export interface RecoveryCodesResponse {
  success: boolean;
  message: string;
  data?: {
    recoveryCodes: string[];
  };
}

export interface DisableTotpResponse extends ApiResponse {}
