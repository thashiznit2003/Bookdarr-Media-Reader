# Bookdarr Media Reader

iOS‑first React Native (Expo) app for Bookdarr Media Server (BMS). Provides ebook + audiobook playback, offline downloads, and local progress tracking.

## Goals
- iPhone/iPad first
- Easy Android port later
- Offline downloads
- Local progress persistence
- Optional TTS for ebooks

## Tech Stack
- React Native (Expo)

## Diagnostics (dev)
Diagnostics require auth while BMS is configured with JWT secrets.

Example flow:

```bash
curl -X POST http://localhost:9797/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reader@example.com","password":"password123"}'
```

```bash
curl -X POST http://localhost:9797/diagnostics \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{"event":"reader-startup","level":"info","source":"reader","data":{"version":"0.0.1"}}'
```

## Docs
- AGENTS.md
- HANDOFF.md
- CHECKLIST.md
- CHANGELOG.md

## License
MIT (see LICENSE)
