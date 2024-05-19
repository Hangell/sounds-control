<p align="center">
<img src="./assets/sounds-control.png">
  <br />
`sounds-control` is a versatile JavaScript/TypeScript audio library designed to provide advanced sound control functions, making it an ideal choice for games and various web applications. This library stands out by offering seamless audio integration for mobile environments, particularly addressing the common conflicts found in other libraries when used with frameworks like Ionic, React Native, and Vue. With `sounds-control`, you can effortlessly manage audio in web, Ionic, React Native (Android and iOS), ensuring a smooth and reliable experience across all platforms.
<br>
<br>
 <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://badge.fury.io/js/sounds-control.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://img.shields.io/npm/dw/sounds-control.svg" alt="npm downloads/week" />
  </a>
  <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://img.shields.io/npm/dm/sounds-control.svg" alt="npm downloads/month" />
  </a>
  <a href="https://github.com/hangell/sounds-control">
    <img src="https://img.shields.io/github/license/hangell/sounds-control.svg" alt="license" />
  </a>
</p>

## Quick Links

* 📖 Read the [blog](https://hangell.org)

## Installation

```sh
npm install sounds-control
```

## Available Functions

### `loadSound(url: string, id: string): Promise<void>`

Loads an audio file from a URL and decodes it for later use.

### `isSoundLoaded(id: string): boolean`

Checks if a sound has been loaded.

### `play(id: string, startTime: number = 0): Promise<void>`

Plays a sound from a specified start time.

### `playEffect(id: string): Promise<void>`

Plays a sound effect.

### `stop(id: string): void`

Stops the playback of a sound and stores the pause time.

### `loop(id: string, startTime: number = 0): void`

Loops a sound from a specified start time.

### `setVolume(volume: number): void`

Sets the overall playback volume.

### `setEffectVolume(volume: number): void`

Sets the volume for sound effects.

### `setPlaybackRate(id: string, rate: number): void`

Sets the playback rate for a specific sound.

### `setGlobalPlaybackRate(rate: number): void`

Sets the global playback rate for all sounds.

### `faster(id: string, rate: number = 1.5): void`

Sets a faster playback rate for a specific sound.

### `slow(id: string, rate: number = 0.75): void`

Sets a slower playback rate for a specific sound.

### `fasterEffect(id: string, rate: number = 1.5): void`

Sets a faster playback rate for a specific sound effect.

### `slowEffect(id: string, rate: number = 0.75): void`

Sets a slower playback rate for a specific sound effect.

### `pauseAll(): void`

Pauses all sounds and stores the pause time.

### `resumeAll(): void`

Resumes playback of all sounds from the stored pause time.

## Usage Examples

### Plain JavaScript

```javascript
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();

async function init() {
  await soundsControl.loadSound('path/to/sound.mp3', 'sound1');
  soundsControl.play('sound1');
}

init();
```

### Angular  / Ionic

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AudioService } from './audio.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [AudioService],
  bootstrap: [AppComponent]
})
export class AppModule {}

// audio.service.ts
import { Injectable } from '@angular/core';
import { SoundsControl } from 'sounds-control';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private soundsControl: SoundsControl;

  constructor() {
    this.soundsControl = new SoundsControl();
  }

  async loadSound(url: string, id: string): Promise<void> {
    await this.soundsControl.loadSound(url, id);
  }

  play(id: string): void {
    this.soundsControl.play(id);
  }
}
```

### Angular / Ionic Pause and Resume
```typescript
  ngOnInit() {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.audioService.resumeAll();
      } else {
        this.audioService.pauseAll();
      }
    });
  }
```
### React

```jsx
import React, { useEffect } from 'react';
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();

function App() {
  useEffect(() => {
    async function init() {
      await soundsControl.loadSound('path/to/sound.mp3', 'sound1');
      soundsControl.play('sound1');
    }
    init();
  }, []);

  return <div className="App">Playing sound...</div>;
}

export default App;
```

### Vue

```vue
<template>
  <div>
    <button @click="playSound">Play Sound</button>
  </div>
</template>

<script>
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();

export default {
  methods: {
    async playSound() {
      await soundsControl.loadSound('path/to/sound.mp3', 'sound1');
      soundsControl.play('sound1');
    }
  }
};
</script>
```

## License

Sounds Control  is licensed under the MIT license. Please refer to the LICENSE file for more information.
© [Rodrigo Rangel](https://github.com/Hangell)

## Doações
If you enjoyed using `sounds-control`, please consider making a donation to support the continuous development of the project. You can make a donation using one of the following options:
* Pix: rodrigo@hangell.org

<div>
<a href="https://hangell.org" target="_blank"><img src="https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white" target="_blank"></a>
  <a href="https://play.google.com/store/apps/dev?id=5606456325281613718" target="_blank"><img src="https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white" target="_blank"></a>
  <a href="https://www.youtube.com/channel/UC8_zG7RFM2aMhI-p-6zmixw" target="_blank"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" target="_blank"></a>
  <a href="https://www.facebook.com/hangell.org" target="_blank"><img src="	https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" target="_blank"></a>
  <a href="https://www.linkedin.com/in/rodrigo-rangel-a80810170" target="_blank"><img src="https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white" target="_blank"></a>
</div>