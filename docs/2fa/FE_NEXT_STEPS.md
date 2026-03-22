# Frontend Next Steps (Backend Ready)

## Alignment Snapshot
- **QR image in setup/start**: Implemented (backend). FE modal shows `qrCodeDataUrl` when present.
- **Enrollment token in setup/start**: Implemented (backend).
- **Confirm with enrollment token**: Implemented (backend). FE polls confirm after QR is shown to auto-enable.
- **Recovery codes policy**: Optional improvement (backend not yet changed). FE displays codes when returned.

## E2E Verification Checklist
- **Enable 2FA modal** (`src/pages/Profile.tsx`)
  - Click "Enable 2FA" → modal opens.
  - Verify Network: `POST /auth/mfa/setup/start` returns `qrCodeDataUrl` + `enrollmentToken`.
  - QR is visible. After ~6–10s, FE calls `POST /auth/mfa/setup/confirm` with `{ enrollmentToken }`.
  - Profile refresh shows `twoFactorEnabled: true` and recovery codes render once.
  - Close and reopen Profile → status remains Enabled.
- **Fallback path**
  - Temporarily disable returning `enrollmentToken` → modal shows 6‑digit input.
  - Enter a TOTP from the authenticator app → confirm enables 2FA.
- **Disable**
  - Click "Disable 2FA" → confirm status returns to Disabled.
- **Login flow** (`src/pages/auth/Login.tsx`)
  - With 2FA disabled: returns `{ token, user }` directly.
  - With 2FA enabled: returns `{ mfaRequired, mfaTempToken }`; FE shows code prompt; verify code completes login.

## UX Polish (Optional)
- **i18n**: Add keys for modal copy (currently using fallbacks).
- **Download recovery codes**: Button to download codes as `.txt` after enabling.
- **Timeout feedback**: If auto-enable polling times out (~40s), show a nudge to use the 6‑digit code.

## Notes for Backend (Optional Improvements)
- **Recovery codes endpoints**
  - Keep `GET /auth/mfa/recovery-codes` read-only (masked/remaining).
  - Add `POST /auth/mfa/recovery-codes/regenerate` for plaintext regeneration.
- **Telemetry**
  - Log setup start, confirm (token/code), disable, and recovery code regenerations.
