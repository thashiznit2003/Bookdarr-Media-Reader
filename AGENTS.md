# AGENTS.md — Bookdarr Media Reader

## Project Summary
iOS‑first React Native (Expo) app for BMS. Supports ebooks + audiobooks, offline download, and local progress tracking.

## Constraints
- Progress stored locally on device and synced to BMS when online (newest-wins, with an explicit Sync action).
- Offline must work fully
- UI inspired by Apple Books / Audiobookshelf

## Diagnostics
- No outbound diagnostics/telemetry. Debugging is via on-device logs + BMS on-box logs.

## Required Docs
- README.md
- CHANGELOG.md
- HANDOFF.md
- CHECKLIST.md
- AGENTS.md

## Handoff Discipline
Update `HANDOFF.md` and `CHANGELOG.md` after each meaningful change.
Increment patch version (`x.x.n+1`) for each GitHub push.
