# Changelog

## 1.1.0 — 2026-10-07

- Fix pause/resume for multiple tracks and position tracking after playback-rate changes.
- Release source nodes on completion, replacement, stop and disposal; track overlapping effects.
- Add batch loading, cancellation, HTTP validation, load deduplication, per-track pause/resume, seek, state/duration/position queries, unloading, master volume, mute and context ownership.
- Import safely in SSR and lazily create the AudioContext; support context/fetch injection and browser unlock.
- Correct CommonJS packaging to `.cjs`, provide ESM/UMD/declarations and package exports, and remove runtime dependencies.
- Add regression/type/package tests, ESLint, Prettier, Husky, CI, contribution/security/conduct policies and six-language documentation.

### Compatibility notes

Existing named export and method arguments remain available. `loop()` and `resumeAll()` now return promises so callers can await playback and catch errors. `stop()` resets position; use `pause()` to retain it. `stopAll()` stops both music and effects; `pauseAll()`/`resumeAll()` apply to regular tracks, not one-shot effects. A global playback rate also applies to future tracks. Invalid/non-finite rates, volumes and offsets now fail explicitly. `dispose()` closes only contexts created by the controller. Browser/WebView playback is supported; SSR import is safe, but native React Native and Node audio are outside the scope.
