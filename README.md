# 🎵 Sounds Control

[🇺🇸 English](https://github.com/Hangell/sounds-control/blob/master/README.md) · [🇧🇷 Português (Brasil)](https://github.com/Hangell/sounds-control/blob/master/docs/pt-br/README.md) · [🇮🇳 हिन्दी](https://github.com/Hangell/sounds-control/blob/master/docs/hi/README.md) · [🇪🇸 Español](https://github.com/Hangell/sounds-control/blob/master/docs/es/README.md) · [🇷🇺 Русский](https://github.com/Hangell/sounds-control/blob/master/docs/ru/README.md) · [🇨🇳 简体中文](https://github.com/Hangell/sounds-control/blob/master/docs/zh/README.md)

<p align="center">
  <img src="https://raw.githubusercontent.com/Hangell/sounds-control/master/assets/sounds-control.png" alt="Sounds Control logo" width="280" />
</p>

[![npm](https://img.shields.io/npm/v/sounds-control)](https://www.npmjs.com/package/sounds-control) [![CI](https://github.com/Hangell/sounds-control/actions/workflows/ci.yml/badge.svg)](https://github.com/Hangell/sounds-control/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Hangell/sounds-control/blob/master/LICENSE)

Framework-independent Web Audio control for **JavaScript and TypeScript**. Use the same API in **Ionic, React, Vue, Angular**, games and vanilla web applications. No runtime dependencies.

## Features

- Cached, deduplicated audio loading, batch preload, cancellation and HTTP error handling.
- Multiple independent tracks with pause/resume, loop, seek and position/duration queries.
- Overlapping one-shot effects with a separate volume bus and explicit cleanup.
- Per-sound/global speed, music/effect/master volume, mute and unmute.
- Lazy AudioContext creation, SSR-safe imports, injected context/fetch and deterministic disposal.
- ESM, CommonJS, browser UMD and TypeScript declarations.

## Install

```sh
npm install sounds-control
```

Version 1.1.0 described here is available after a maintainer publishes it; installing from npm before that release retrieves the currently published version. To try the repository version, build it and install its `npm pack` tarball.

Playback requires a browser or WebView with Web Audio and Fetch. Ionic uses its WebView. Native React Native and Node.js audio are outside the scope. SSR can import the library safely; create/play on the client. Node.js 22.14+ is required for development tooling.

## Quick start (JavaScript or TypeScript)

```ts
import { SoundsControl } from 'sounds-control';

const sounds = new SoundsControl();
// Call unlock directly inside a user interaction, before network awaits.
document
  .querySelector<HTMLButtonElement>('#play')!
  .addEventListener('click', async () => {
    try {
      await sounds.unlock();
      await sounds.loadSounds([
        { id: 'music', url: '/audio/music.mp3' },
        { id: 'click', url: '/audio/click.wav' },
      ]);
      sounds.setVolume(0.5);
      await sounds.loop('music');
      await sounds.playEffect('click');
    } catch (error) {
      console.error('Audio could not start', error);
    }
  });

// If you do not preload, loadSound('/audio/music.mp3', 'music') loads one asset.
// When leaving the screen: await sounds.dispose().
```

For plain JavaScript, remove the `<HTMLButtonElement>` generic and the `!` assertion. Asset URLs follow your framework's public/static asset convention. Cross-origin assets need appropriate CORS headers. Decoded audio is kept in memory; this is not a streaming player for large files. Supported codecs depend on the browser. Browser autoplay rules still apply; [`unlock()` resumes the context](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume).

## Common controls

```ts
await sounds.play('music', 10); // offset in seconds
sounds.pause('music');
await sounds.resume('music');
await sounds.seek('music', 20);
sounds.setLoop('music', false);
sounds.setPlaybackRate('music', 1.25); // changes speed AND pitch
sounds.setGlobalPlaybackRate(1); // current and future tracks/effects
sounds.setEffectVolume(0.7);
sounds.setMasterVolume(0.8);
sounds.mute();
sounds.unmute(); // restores the configured master volume

sounds.pauseAll();
await sounds.resumeAll(); // resumes every paused regular track
sounds.stopEffects('click'); // stops all active effects with this id
sounds.stopAll(); // regular tracks AND effects
sounds.unloadSound('music'); // also cancels an in-flight load
await sounds.dispose(); // release nodes; close only an owned context
```

Offsets must be finite and within the sound duration. Rates must be finite and positive. Volumes are clamped to `[0, 1]`; non-finite values throw. `pauseAll()` and `resumeAll()` do not pause one-shot effects. `stop(id)` resets a regular track; use `stopEffects(id)` for effects. Paused loop positions wrap at the sound duration. `playEffect()` allows overlapping instances of the same sound.

## API overview

| API                                                         | Purpose                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| `new SoundsControl({ context?, fetch? })`                   | Optionally inject an AudioContext and fetch implementation |
| `SoundsControl.isSupported()`                               | Detect native/prefixed AudioContext availability           |
| `unlock(): Promise<void>`                                   | Resume a suspended context from a user gesture             |
| `loadSound(url, id, { signal? }?)`                          | Fetch/decode one asset; cache and deduplicate by id        |
| `loadSounds([{ id, url }], { signal? }?)`                   | Load a batch concurrently                                  |
| `isSoundLoaded(id)` / `getLoadedSounds()`                   | Inspect the decoded cache                                  |
| `play(id, offset?)` / `loop(id, offset?)`                   | Start or replace a regular track; return a promise         |
| `playEffect(id)` / `stopEffects(id?)`                       | Play overlapping effects / stop matching or all effects    |
| `pause(id)` / `resume(id)` / `stop(id)`                     | Pause, resume asynchronously or reset one track            |
| `pauseAll()` / `resumeAll()` / `stopAll()`                  | Control all tracks; stopAll also stops effects             |
| `seek(id, seconds)` / `setLoop(id, enabled)`                | Change position asynchronously / toggle looping            |
| `getDuration(id)` / `getPosition(id)`                       | Read seconds; require a loaded sound                       |
| `getState(id)` / `isSoundPlaying(id)`                       | Read regular-track state: unloaded, ready, playing, paused |
| `setVolume(value)` / `getVolume()`                          | Music bus volume                                           |
| `setEffectVolume(value)` / `getEffectVolume()`              | Effect bus volume                                          |
| `setMasterVolume(value)` / `getMasterVolume()`              | Overall volume                                             |
| `mute()` / `unmute()` / `isMuted()`                         | Mute both buses without losing volume settings             |
| `setPlaybackRate(id, rate)` / `setGlobalPlaybackRate(rate)` | Update speed/pitch, including active effects               |
| `faster` / `slow` / `fasterEffect` / `slowEffect`           | Rate aliases; defaults 1.5 and 0.75                        |
| `unloadSound(id)` / `unloadAll()`                           | Stop, cancel loads and remove cached buffers/settings      |
| `dispose(): Promise<void>`                                  | Idempotent cleanup; reject future playback/mutations       |

[Detailed API and lifecycle](https://github.com/Hangell/sounds-control/blob/master/docs/API.md) · [Migration notes](https://github.com/Hangell/sounds-control/blob/master/CHANGELOG.md)

## Framework integration

Keep one controller per component/screen (or share one through your app's service). Preload on mount, unlock in the click/tap handler, and dispose during cleanup. Catch asynchronous failures and display an appropriate message in your application.

### React

```tsx
import { useEffect, useRef } from 'react';
import { SoundsControl } from 'sounds-control';

export function PlayButton() {
  const ref = useRef<SoundsControl | null>(null);
  useEffect(() => {
    const audio = new SoundsControl();
    ref.current = audio;
    return () => {
      ref.current = null;
      void audio.dispose().catch(console.error);
    };
  }, []);
  const play = async () => {
    const audio = ref.current;
    if (!audio) return;
    try {
      await audio.unlock();
      await audio.loadSound('/audio/click.wav', 'click');
      await audio.playEffect('click');
    } catch (error) {
      console.error(error);
    }
  };
  return <button onClick={play}>Play</button>;
}
```

### Vue 3

```vue
<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { SoundsControl } from 'sounds-control';
let audio: SoundsControl | undefined;
onMounted(() => {
  audio = new SoundsControl();
});
onBeforeUnmount(() => {
  void audio?.dispose().catch(console.error);
});
async function play() {
  if (!audio) return;
  try {
    await audio.unlock();
    await audio.loadSound('/audio/click.wav', 'click');
    await audio.playEffect('click');
  } catch (error) {
    console.error(error);
  }
}
</script>
<template><button @click="play">Play</button></template>
```

### Angular and Ionic Angular

```ts
import { Component, OnDestroy } from '@angular/core';
import { SoundsControl } from 'sounds-control';

@Component({
  selector: 'app-play-button',
  standalone: true,
  template: '<button (click)="play()">Play</button>',
})
export class PlayButtonComponent implements OnDestroy {
  private readonly audio = new SoundsControl(); // lazy; safe to construct in SSR
  async play(): Promise<void> {
    try {
      await this.audio.unlock();
      await this.audio.loadSound('/assets/audio/click.wav', 'click');
      await this.audio.playEffect('click');
    } catch (error) {
      console.error(error);
    }
  }
  ngOnDestroy(): void {
    void this.audio.dispose().catch(console.error);
  }
}
```

In Ionic, use the same handler on an `ion-button`. If cached pages should release audio when leaving, dispose in `ionViewDidLeave` and create a new controller in `ionViewDidEnter`. Ionic React/Vue follow the same client lifecycle rules. Actual playback depends on WebView support and device autoplay policies.

### CommonJS and a browser script

```js
const { SoundsControl } = require('sounds-control');
```

CommonJS import works in Node for SSR, package verification and tests with an injected context; it does not add native Node audio.

```html
<!-- Replace 1.1.0 with an actually published version. -->
<script src="https://cdn.jsdelivr.net/npm/sounds-control@1.1.0/dist/index.umd.cjs"></script>
<script>
  const sounds = new SoundsControl.SoundsControl();
</script>
```

## Contributing and quality

Bug reports, feature proposals, examples and translations are welcome. See [CONTRIBUTING](https://github.com/Hangell/sounds-control/blob/master/CONTRIBUTING.md), [Code of Conduct](https://github.com/Hangell/sounds-control/blob/master/CODE_OF_CONDUCT.md) and the private reporting channel in [SECURITY](https://github.com/Hangell/sounds-control/blob/master/SECURITY.md).

```sh
npm ci
npm run check
```

ESLint checks JavaScript/TypeScript, Prettier keeps formatting consistent, Husky runs staged checks before commits and the full check before pushes. CI validates Node 22/24. Tests cover audio state/races, types and the installed npm tarball (ESM, CommonJS and UMD). A separate Chromium smoke test exercises real Web Audio (`npx playwright install chromium && npm run test:browser`) and runs in CI. Validate additional browsers and device WebViews separately.

## License

[MIT](https://github.com/Hangell/sounds-control/blob/master/LICENSE) © Rodrigo Rangel.
