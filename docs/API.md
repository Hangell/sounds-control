# API and lifecycle

## Runtime and ownership

`SoundsControl` has no framework or runtime dependencies. Importing and construction do not access `window` or create audio hardware. `unlock`, loading and playback initialize an AudioContext lazily. Native and `webkitAudioContext` constructors are supported. An injected `context` remains owned by the caller and is never closed by `dispose`. A controller using a shared context disconnects only its own nodes.

Audio graph: regular sources → music gain → master gain → destination; effect sources → effect gain → master gain → destination. Music and effect volumes default to 1; master volume defaults to 1. Mute affects master output only and preserves configured volumes. Volumes/rates can be configured before audio initialization.

## Loading

`loadSound(url: string, id: string, options?: { signal?: AbortSignal }): Promise<void>` validates nonempty ids/URLs, HTTP status and audio decoding. Buffers and pending requests use Maps, so ids such as `__proto__` are valid. Loading a cached id is a no-op, even if the URL differs; unload the id to replace it.

Concurrent requests for the same id share the first request. Its URL and signal determine the shared operation; subsequent callers do not add independent cancellation. `unloadSound` aborts that request and prevents late decoding from repopulating the cache. Abort during decoding cannot interrupt the browser decoder, but its result is discarded. Abort errors use `DOMException` with name `AbortError`. Network/HTTP/codec errors reject and allow retry. `loadSounds(assets, options?)` uses Promise.all: it rejects on the first failure; other loads continue and successful buffers remain cached.

Use `isSoundLoaded(id)` and `getLoadedSounds()` to inspect decoded assets. There is no streaming or built-in file size limit; choose suitable assets and application-level limits.

## Regular tracks

`play(id, offset = 0): Promise<void>` replaces the regular source for an id. Different ids play independently. Every play creates a new source because Web Audio source nodes can only be started once ([Web Audio documentation](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)). `loop(id, offset = 0)` enables looping and starts playback. `setLoop(id, enabled)` changes a track's loop setting without restarting; the setting persists until changed/unloaded.

`pause(id)` retains the current buffer position, including speed changes. `resume(id): Promise<void>` acts only on a paused track. `stop(id)` resets position and cancels pending regular playback, while retaining loop/rate settings. Unknown ids are a no-op for pause/resume/stop. `pauseAll` and `resumeAll` apply to all regular tracks; effects are not paused. `stopAll` resets tracks and stops effects.

`seek(id, seconds): Promise<void>` replaces a playing source; a ready/paused track becomes paused at the requested position. `getDuration` and `getPosition` return seconds and require a loaded sound. Offsets are finite and within `[0, duration]`. At the exact end, a non-looping source ends immediately in the browser. Looping positions wrap modulo duration. Natural completion returns the track to ready at position zero.

`getState(id): SoundState` returns `unloaded`, `ready`, `playing` or `paused`; `isSoundPlaying` checks regular playback only. These do not report overlapping effect state. A pending play waiting for context resume is not yet playing. Later play/stop/unload supersedes an earlier pending regular play.

## Effects and rates

`playEffect(id): Promise<void>` creates a one-shot source; several instances can overlap. Regular loop settings do not apply to effects. `stopEffects(id?)` stops all effects for an id or every effect, including starts still waiting for unlock. `stop(id)` affects only regular playback. Both types of sources disconnect when ended/stopped.

`setPlaybackRate(id, rate)` affects an active regular source, all active effects of that id and future plays of that id. Rate must be finite and positive. `setGlobalPlaybackRate(rate)` applies to existing tracks/effects and becomes the default for new ids. Speed also changes pitch; there is no time stretching. `faster`/`fasterEffect` default to 1.5, `slow`/`slowEffect` to 0.75 and accept an optional rate. These are aliases for `setPlaybackRate`.

## Volume and cleanup

`setVolume`/`getVolume` control music, `setEffectVolume`/`getEffectVolume` control effects and `setMasterVolume`/`getMasterVolume` control overall gain. Setters clamp finite input to `[0, 1]` and reject NaN/Infinity. `mute`, `unmute` and `isMuted` preserve the configured master volume while silencing both buses.

`unloadSound(id)` stops regular/effect sources, aborts loading and removes buffers/track settings. `unloadAll` does this for every cached, pending or configured id. `dispose(): Promise<void>` unloads everything, disconnects gain nodes and closes an internally created context. It is idempotent. A disposed controller rejects future playback, loading and mutations; create a new instance to reuse audio. Cache/state/volume getters remain readable after disposal. Always handle rejected promises in application event handlers and cleanup.

## Autoplay and frameworks

Call `unlock()` directly inside a click/tap handler before awaiting network work. It resumes a suspended context and surfaces browser failures; it cannot override user/browser policy. Bind playback to client events in React/Vue/Angular/Ionic, use public/static asset URLs and release audio on unmount or page leave. Test actual browsers and WebViews for CORS, codec and autoplay behavior.

## Exports

Named runtime export: `SoundsControl`. Type-only exports: `SoundsControlOptions`, `SoundAsset`, `LoadSoundOptions`, `SoundState`. ESM is `dist/index.js`, CommonJS is `dist/index.cjs`, declarations are `dist/index.d.ts`, and browser UMD exposes `SoundsControl.SoundsControl` from `dist/index.umd.cjs`. Package exports route import/require automatically. Old deep imports into generated dist files are not public API.
