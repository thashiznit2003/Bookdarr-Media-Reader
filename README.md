# Bookdarr Media Reader

iOS‑first React Native (Expo) app for Bookdarr Media Server (BMS). Provides ebook + audiobook playback, offline downloads, and local progress tracking.

Start here:
- `START_HERE.md`

## Goals
- iPhone/iPad first
- Easy Android port later
- Offline downloads
- Local progress persistence
- Optional TTS for ebooks

## Tech Stack
- React Native (Expo)

## Diagnostics (dev)
No outbound diagnostics/telemetry. Debugging is done via on-device logs and BMS on-box logs (SSH).

## Auth model
- Base URL is configured by the user (ex: `https://bms.example.com`).
- Login:
  - `POST /api/v1/auth/login` with `{ username, password }`
  - If `401` with `twoFactorRequired=true`, complete:
    - `POST /api/v1/auth/login/2fa` with `{ otp, challengeToken }`
- The app stores the `refreshToken` in SecureStore (Keychain/Keystore).
- The app keeps the `accessToken` in memory and sends `Authorization: Bearer <accessToken>` for `/api/v1/*`.
- On `401`, the app calls `POST /api/v1/auth/refresh` and retries once.

## Docs
- AGENTS.md
- HANDOFF.md
- START_HERE.md
- CHECKLIST.md
- CHANGELOG.md

## License
MIT (see LICENSE)
