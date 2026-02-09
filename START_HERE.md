# Bookdarr Media Reader (BMR) - Start Here

BMR is an iOS-first React Native (Expo) app for Bookdarr Media Server (BMS). The goal is a 1:1 feature set for Android later (minimal rework).

This document is the handoff for the next agent to start building real features (Book Pool, My Library, offline downloads, audiobook playback, ebook reading, progress sync).

## Current State (Repo)
- Expo app scaffold is present.
- Auth is implemented:
  - `refreshToken` is stored in `expo-secure-store` (Keychain/Keystore).
  - `accessToken` is kept in memory only.
  - A single-flight refresh is implemented to avoid refresh token reuse.
  - Two-step 2FA login is supported (password step, then OTP step).
- Navigation exists with placeholder screens for Book Pool and My Library.

Key files:
- `App.js` wires providers.
- `src/auth/auth-context.js` is the app's auth state machine.
- `src/api/bms-client.js` is the BMS API client (login/2FA/refresh + authenticated fetch).
- `src/navigation/AppNavigator.js` controls signed-in vs signed-out routing.

## BMS Prerequisites (Server Side)
BMR depends on the versioned mobile API under `/api/v1/*`.

Source of truth:
- `GET /api/v1/openapi.json`

Important server assumptions:
- BMS is expected to be HTTPS when exposed publicly.
- BMR uses `Authorization: Bearer <accessToken>` for all `/api/v1/*` requests (including streams).
- Refresh token rotation is one-time-use. Multiple concurrent refreshes will invalidate sessions. The client must single-flight refresh.

## Mobile Auth Contract
Login step 1:
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "joe", "password": "..." }
```

Responses:
- `201` returns `{ user, tokens: { accessToken, refreshToken, tokenType } }`
- `401` returns `{ twoFactorRequired: true, challengeToken }`

Login step 2 (2FA):
```http
POST /api/v1/auth/login/2fa
Content-Type: application/json

{ "otp": "123456", "challengeToken": "..." }
```

Refresh:
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "..." }
```

Logout:
```http
POST /api/v1/auth/logout
Content-Type: application/json

{ "refreshToken": "..." }
```

Password reset (email-based; requires SMTP configured in BMS):
```http
POST /api/v1/auth/password/request
{ "email": "reader@example.com" }

POST /api/v1/auth/password/reset
{ "token": "...", "newPassword": "..." }
```

2FA management (optional, user-driven):
```http
GET  /api/v1/auth/2fa/status
POST /api/v1/auth/2fa/setup
POST /api/v1/auth/2fa/confirm  { "code": "123456" }
POST /api/v1/auth/2fa/disable  { "currentPassword": "...", "code": "123456" }
POST /api/v1/auth/2fa/backup-codes { "currentPassword": "...", "code": "123456" }
```

Storage rules:
- Store `refreshToken` in SecureStore only. Treat it like a password. Never log it.
- Keep `accessToken` in memory only (do not persist it).
- Base URL is user-configured and stored in SecureStore.

## Library Contract (Book Pool / My Library)
Book Pool:
```http
GET /api/v1/library
Authorization: Bearer <accessToken>
```

My Library (checked out by current user):
```http
GET /api/v1/library/my
Authorization: Bearer <accessToken>
```

Book detail:
```http
GET /api/v1/library/{bookId}
Authorization: Bearer <accessToken>
```

Checkout / return:
```http
POST /api/v1/library/{bookId}/checkout
POST /api/v1/library/{bookId}/return
Authorization: Bearer <accessToken>
```

Read status (per-user):
```http
POST /api/v1/library/{bookId}/read
{ "read": true }
```

Offline manifest (mobile contract):
```http
GET /api/v1/library/{bookId}/offline-manifest
Authorization: Bearer <accessToken>
```

Manifest includes file URLs under `/api/v1/library/files/.../stream/...`, sizes, content-type, and optional server-side `sha256` (when available).

Streaming (ebook/audiobook) with Range support:
```http
GET  /api/v1/library/files/{fileId}/stream/{fileName}
HEAD /api/v1/library/files/{fileId}/stream/{fileName}
Range: bytes=0-1048575
Authorization: Bearer <accessToken>
```

## Progress Sync Contract (Cross-Device)
Progress is stored server-side per user per file, and should sync across devices.

Get progress:
```http
GET /api/v1/reader/progress/{kind}/{fileId}
```

Set progress:
```http
POST /api/v1/reader/progress/{kind}/{fileId}
{ "data": { ... }, "updatedAt": 1730000000000 }
```

Sync button behavior (deterministic conflict resolution):
```http
POST /api/v1/reader/progress/{kind}/{fileId}/sync?prefer=server
{ "data": { ... }, "updatedAt": 1730000000000 }
```

Reset to beginning:
```http
POST /api/v1/reader/progress/{kind}/{fileId}/reset
```

Client rule:
- Always include an `updatedAt` (ms since epoch).
- Newest `updatedAt` wins.
- If the same book is open on 2+ devices simultaneously, expose a "Sync" action that pulls server state and overwrites local state.

## Offline Downloads (Device-Side)
Goal behavior:
- User checks out a book -> app downloads ebook and/or audiobook to device storage.
- Show progress immediately (even if it completes quickly).
- After download, playback/reading works without network.
- On return, delete device copy.

Implementation guidance (Expo-managed to start):
- Use `expo-file-system` for downloads and local files.
- Persist offline download state in `expo-sqlite` (preferred) or a small JSON index file. Avoid AsyncStorage for large state.
- For large audiobooks, prefer resumable downloads (and, if needed, chunked Range downloads).
- Verify offline success by file size at minimum; optional: hash verification (compare to manifest `sha256` when present).

Known constraint:
- True background downloading and robust CarPlay integration will likely require adding native modules (EAS build / prebuild). Start with foreground-only downloads for the first iteration.

## Audiobook Playback
Phase 1 (works in Expo):
- Use `expo-av` to play from either a remote stream URL or local file URL.
- Save listening progress frequently (position + duration + fileId) locally and POST to BMS progress endpoints when online.

Phase 2 (CarPlay-quality):
- Plan for native iOS playback (`AVPlayer`) + `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter`.
- CarPlay is not realistic without native code. Keep this in mind when choosing libraries.

## Ebook Reading
Two viable approaches:
1. Near-term (fast): embed a JS reader in a WebView (epub.js-based) and feed it a local file URL (offline) or stream URL (online), then bridge progress events back to React Native.
2. Longer-term (best for iOS): integrate Readium Mobile (native) and wrap it for RN. This is more work but more reliable for real-world EPUBs.

The BMS web UI already has an epub.js reader; BMR should not depend on the BMS web UI (avoid cookie flows, avoid embedding the whole website).

## Running Locally
```bash
npm ci
npm run start
```
Then press `i` for iOS simulator if available.

## What To Build Next (Concrete)
1. Replace placeholder Book Pool screen: call `GET /api/v1/library` and render covers/titles.
2. Replace placeholder My Library: call `GET /api/v1/library/my`.
3. Implement Book Details screen: call `GET /api/v1/library/{id}`, then checkout/return.
4. Implement offline downloads using `/api/v1/library/{id}/offline-manifest`.
5. Implement audiobook playback (streaming first, then local playback).
6. Implement progress sync and Restart/Sync actions using `/api/v1/reader/progress/*`.

