# Changelog — Bookdarr Media Reader

## 1.0.1 — 2026-02-08 10:23 -06:00
- Add secure login flow for BMS (`/api/v1/auth/*`) with refresh token stored in SecureStore and access token kept in memory.
- Implement 2-step 2FA login UX (password step, then OTP step using `challengeToken`).
- Add a basic authenticated app shell with navigation placeholders for Book Pool and My Library.

## 0.0.3
- Documented authenticated diagnostics flow.

## 0.0.2
- Updated docs for agent handoff.

## 0.0.1
- Expo scaffold + initial docs.
