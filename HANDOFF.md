# Handoff — Bookdarr Media Reader

## Current Status
- Expo scaffold created.
- Docs updated for agent handoff.
- Login + secure token storage implemented (refresh token in SecureStore; access token in memory).
- 2FA login is two-step (password, then OTP using `challengeToken`).
- Basic authenticated app shell exists with placeholder screens for Book Pool and My Library.

## Decisions
- React Native (Expo)
- Offline downloads required
- Local progress persistence
- Optional TTS for ebooks

## Immediate Next Steps
1. Implement Book Pool + My Library browsing (call BMS `/api/v1/library` and `/api/v1/my-library`).
2. Book details modal/screen (metadata, checkout/return).
3. Audiobook player (streaming first, then offline).
4. EPUB reader (Readium on-device; fallback plan if needed).
5. Offline download storage (ebooks + audiobooks) with progress + disk usage.
6. Local progress + sync to BMS reader progress endpoints (newest-wins).
