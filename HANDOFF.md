# Handoff — Bookdarr Media Reader

## Current Status
- Expo scaffold created.
- Docs updated for agent handoff.
- Login + secure token storage implemented (refresh token in SecureStore; access token in memory).
- 2FA login is two-step (password, then OTP using `challengeToken`).
- Basic authenticated app shell exists with placeholder screens for Book Pool and My Library.
- A comprehensive mobile contract + implementation guide exists at `START_HERE.md`.

## Decisions
- React Native (Expo)
- Offline downloads required
- Local progress persistence
- Optional TTS for ebooks

## Immediate Next Steps
1. Follow `START_HERE.md` (API contract, storage rules, offline/download approach).
2. Implement Book Pool and My Library screens using BMS `/api/v1/library` and `/api/v1/library/my`.
3. Implement book detail + checkout/return.
4. Implement offline downloads using `/api/v1/library/:id/offline-manifest`.
5. Implement audiobook playback, then ebook reading, and finally progress sync.
