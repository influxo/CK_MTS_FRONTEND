# FE/BE Sync Status: TOTP 2FA

## Alignment Snapshot
- **QR image in setup/start**: Implemented (BE) → FE modal displays `qrCodeDataUrl` when present.
- **Enrollment token in setup/start**: Implemented (BE) → FE polls confirm with `{ enrollmentToken }` after QR is shown to auto-enable.
- **Confirm with enrollment token**: Implemented (BE) → FE auto-enable path active.
- **MFA Login**: Implemented (BE) → FE shows TOTP step when `{ mfaRequired, mfaTempToken }` returned.
- **Recovery codes**: Implemented (BE) → FE renders codes when returned after enable or on explicit request.

## Current Frontend State
- **Profile modal** (`src/pages/Profile.tsx`):
  - "Enable 2FA" opens a Dialog, calls `startTotpSetup()`, shows QR (or `otpauthUrl`/`secret` fallback).
  - Auto-enable polling with `{ enrollmentToken }` after QR appears (timeout ~40s) → refreshes profile and shows `twoFactorEnabled: true`.
  - Fallback manual 6‑digit code confirm if no token is present.
- **Login flow** (`src/pages/auth/Login.tsx`):
  - Renders TOTP code step when BE returns `{ mfaRequired, mfaTempToken }`.
- **State/Service**: `authModels.ts`, `authService.ts`, `authSlice.ts`, `useAuth.ts` updated to support the above.

## E2E Verification Plan (Next)
- **Enable 2FA**
  - Expect `setup/start` → `qrCodeDataUrl` + `enrollmentToken`.
  - Observe auto-enable within ~6–40s; profile shows Enabled and recovery codes appear.
- **Fallback path**
  - Temporarily omit `enrollmentToken` in `setup/start` → code input confirm enables 2FA.
- **Login**
  - With 2FA disabled → direct `{ token, user }`.
  - With 2FA enabled → `{ mfaRequired, mfaTempToken }`, then verify code to receive `{ token, user }`.
- **Disable 2FA** and re-enable to validate full lifecycle.

## Backend Tasks (Optional Improvements)
- **Recovery codes endpoints** (recommended):
  - Make `GET /auth/mfa/recovery-codes` read-only (masked/remaining).
  - Add `POST /auth/mfa/recovery-codes/regenerate` to produce new plaintext codes (invalidate previous).
- **Telemetry & Rate Limits**: Audit logs for setup/confirm/disable; rate limit verify; token TTL and single-use enforcement.

## Notes
- If the modal shows text (not an image), ensure `TOTP_QR=true` is set so `qrCodeDataUrl` is returned.
- If auto-enable shows "Setup not started", confirm `enrollmentToken` was returned and is valid/unexpired.
