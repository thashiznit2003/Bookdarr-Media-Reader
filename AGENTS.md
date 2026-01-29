# AGENTS.md — Bookdarr Media Reader

## Project Intent
iOS‑first mobile app for Bookdarr Media Server (BMS). Focus on audiobook + ebook playback, offline downloads, and local progress.

## Constraints
- Progress stored locally on device (not server)
- Offline mode must work fully
- UI style similar to Apple Books / Audiobookshelf

## Required Files
- README.md
- CHANGELOG.md
- HANDOFF.md
- CHECKLIST.md
- AGENTS.md

## Diagnostics
- Opt‑in diagnostics to Bookdarr‑Media‑Diagnostics under `/reader/`
- Later hidden behind secret unlock

## Handoff Notes
Maintain `HANDOFF.md` after each change.
