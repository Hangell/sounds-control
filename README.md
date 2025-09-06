# 🎵 Sounds Control

<p align="center">
  <img src="./assets/sounds-control.png" alt="Sounds Control Logo">
  <br />
  <strong>A versatile JavaScript/TypeScript audio library for advanced sound control</strong>
  <br />
  Perfect for games, web applications, and mobile development
</p>

<p align="center">
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
  <a href="https://github.com/hangell/sounds-control/stargazers">
    <img src="https://img.shields.io/github/stars/hangell/sounds-control.svg?style=social" alt="GitHub stars" />
  </a>
</p>

## ✨ Features

- 🎮 **Game-ready**: Optimized for gaming applications with low-latency audio
- 📱 **Mobile-first**: Seamless audio integration for mobile environments
- ⚡ **Framework compatible**: Works perfectly with Ionic, React Native, Vue, Angular, and vanilla JavaScript
- 🔄 **Advanced controls**: Loop, pause, resume, speed control, and volume management
- 🎯 **Effect system**: Dedicated sound effects with separate volume control
- 📦 **TypeScript support**: Full TypeScript definitions included
- 🌐 **Cross-platform**: Web, Android, iOS support
- 🎛️ **Web Audio API**: Built on modern Web Audio API for superior performance

## 🚀 Quick Start

### Installation

```bash
npm install sounds-control
```

### Basic Usage

```javascript
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();

// Load and play a sound
async function playMusic() {
  await soundsControl.loadSound('./assets/music.mp3', 'background-music');
  soundsControl.play('background-music');
}

playMusic();
```

## 📖 API Reference

### Core Methods

#### `loadSound(url: string, id: string): Promise<void>`
Loads an audio file from a URL and decodes it for later use.

```javascript
await soundsControl.loadSound('./sounds/explosion.mp3', 'explosion');
```

#### `isSoundLoaded(id: string): boolean`
Checks if a sound has been loaded and is ready to play.

```javascript
if (soundsControl.isSoundLoaded('explosion')) {
  // Sound is ready to play
}
```

#### `play(id: string, startTime?: number): Promise<void>`
Plays a sound from a specified start time (in seconds).

```javascript
// Play from beginning
await soundsControl.play('background-music');

// Play from 30 seconds
await soundsControl.play('background-music', 30);
```

#### `playEffect(id: string): Promise<void>`
Plays a sound effect using the dedicated effects audio channel.

```javascript
await soundsControl.playEffect('coin-pickup');
```

#### `stop(id: string): void`
Stops the playback of a sound and stores the pause time for later resumption.

```javascript
soundsControl.stop('background-music');
```

#### `loop(id: string, startTime?: number): void`
Loops a sound continuously from a specified start time.

```javascript
soundsControl.loop('ambient-sound');
```

### Volume Control

#### `setVolume(volume: number): void`
Sets the master volume for all sounds (0.0 to 1.0).

```javascript
soundsControl.setVolume(0.5); // 50% volume
```

#### `setEffectVolume(volume: number): void`
Sets the volume for sound effects only (0.0 to 1.0).

```javascript
soundsControl.setEffectVolume(0.8); // 80% volume for effects
```

### Playback Rate Control

#### `setPlaybackRate(id: string, rate: number): void`
Sets the playback rate for a specific sound.

```javascript
soundsControl.setPlaybackRate('music', 1.5); // 1.5x speed
```

#### `setGlobalPlaybackRate(rate: number): void`
Sets the playback rate for all currently playing sounds.

```javascript
soundsControl.setGlobalPlaybackRate(0.5); // Half speed for all sounds
```

#### `faster(id: string, rate?: number): void`
Makes a sound play faster (default: 1.5x speed).

```javascript
soundsControl.faster('dialogue'); // 1.5x speed
soundsControl.faster('dialogue', 2.0); // 2x speed
```

#### `slow(id: string, rate?: number): void`
Makes a sound play slower (default: 0.75x speed).

```javascript
soundsControl.slow('music'); // 0.75x speed
```

### Global Controls

#### `pauseAll(): void`
Pauses all currently playing sounds and stores their pause times.

```javascript
soundsControl.pauseAll();
```

#### `resumeAll(): void`
Resumes all paused sounds from their stored pause times.

```javascript
soundsControl.resumeAll();
```

## 🔧 Framework Integration

### Angular / Ionic

#### Service Setup

```typescript
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

  play(id: string, startTime?: number): void {
    this.soundsControl.play(id, startTime);
  }

  playEffect(id: string): void {
    this.soundsControl.playEffect(id);
  }

  setVolume(volume: number): void {
    this.soundsControl.setVolume(volume);
  }

  pauseAll(): void {
    this.soundsControl.pauseAll();
  }

  resumeAll(): void {
    this.soundsControl.resumeAll();
  }
}
```

#### Component Usage

```typescript
// game.component.ts
import { Component, OnInit } from '@angular/core';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  
  constructor(private audioService: AudioService) {}

  async ngOnInit() {
    // Load game sounds
    await this.audioService.loadSound('./assets/background.mp3', 'bg-music');
    await this.audioService.loadSound('./assets/jump.mp3', 'jump-effect');
    
    // Start background music
    this.audioService.play('bg-music');
  }

  onJump() {
    this.audioService.playEffect('jump-effect');
  }
}
```

#### App State Management (Ionic)

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { AudioService } from './services/audio.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private audioService: AudioService) {}

  ngOnInit() {
    // Handle app state changes for mobile
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        this.audioService.resumeAll();
      } else {
        this.audioService.pauseAll();
      }
    });
  }
}
```

### React

#### Hook-based Implementation

```tsx
import React, { useEffect, useState, useRef } from 'react';
import { SoundsControl } from 'sounds-control';

const useAudio = () => {
  const soundsControlRef = useRef<SoundsControl>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    soundsControlRef.current = new SoundsControl();
    setIsLoaded(true);

    return () => {
      // Cleanup on unmount
      soundsControlRef.current?.pauseAll();
    };
  }, []);

  return {
    soundsControl: soundsControlRef.current,
    isLoaded
  };
};

// Game Component
const Game: React.FC = () => {
  const { soundsControl, isLoaded } = useAudio();
  const [soundsReady, setSoundsReady] = useState(false);

  useEffect(() => {
    const loadSounds = async () => {
      if (!soundsControl || !isLoaded) return;

      try {
        await soundsControl.loadSound('./assets/music.mp3', 'bg-music');
        await soundsControl.loadSound('./assets/click.mp3', 'click');
        setSoundsReady(true);
        
        // Start background music
        soundsControl.play('bg-music');
      } catch (error) {
        console.error('Failed to load sounds:', error);
      }
    };

    loadSounds();
  }, [soundsControl, isLoaded]);

  const handleClick = () => {
    if (soundsReady && soundsControl) {
      soundsControl.playEffect('click');
    }
  };

  return (
    <div className="game">
      <button onClick={handleClick} disabled={!soundsReady}>
        {soundsReady ? 'Click Me!' : 'Loading...'}
      </button>
    </div>
  );
};

export default Game;
```

### Vue 3

#### Composition API

```vue
<template>
  <div class="audio-player">
    <button @click="playMusic" :disabled="!soundsReady">Play Music</button>
    <button @click="playEffect" :disabled="!soundsReady">Play Effect</button>
    <button @click="pauseAll">Pause All</button>
    <button @click="resumeAll">Resume All</button>
    
    <div class="controls">
      <label>Master Volume: {{ volume }}</label>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.1" 
        v-model="volume" 
        @input="updateVolume"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();
const soundsReady = ref(false);
const volume = ref(1);

onMounted(async () => {
  try {
    await soundsControl.loadSound('./assets/music.mp3', 'music');
    await soundsControl.loadSound('./assets/beep.mp3', 'beep');
    soundsReady.value = true;
  } catch (error) {
    console.error('Failed to load sounds:', error);
  }
});

onUnmounted(() => {
  soundsControl.pauseAll();
});

const playMusic = () => {
  soundsControl.play('music');
};

const playEffect = () => {
  soundsControl.playEffect('beep');
};

const pauseAll = () => {
  soundsControl.pauseAll();
};

const resumeAll = () => {
  soundsControl.resumeAll();
};

const updateVolume = () => {
  soundsControl.setVolume(volume.value);
};
</script>
```

## 🎮 Game Development Examples

### Simple Game Audio Manager

```typescript
class GameAudioManager {
  private soundsControl: SoundsControl;
  private musicVolume = 0.7;
  private effectsVolume = 1.0;

  constructor() {
    this.soundsControl = new SoundsControl();
    this.init();
  }

  private async init() {
    // Load all game sounds
    const sounds = [
      { url: './assets/music/bg-music.mp3', id: 'bg-music' },
      { url: './assets/sfx/jump.mp3', id: 'jump' },
      { url: './assets/sfx/coin.mp3', id: 'coin' },
      { url: './assets/sfx/explosion.mp3', id: 'explosion' },
    ];

    await Promise.all(
      sounds.map(sound => this.soundsControl.loadSound(sound.url, sound.id))
    );

    this.soundsControl.setVolume(this.musicVolume);
    this.soundsControl.setEffectVolume(this.effectsVolume);
  }

  startBackgroundMusic() {
    this.soundsControl.loop('bg-music');
  }

  playJumpSound() {
    this.soundsControl.playEffect('jump');
  }

  playCoinSound() {
    this.soundsControl.faster('coin', 1.2); // Slightly faster for excitement
    this.soundsControl.playEffect('coin');
  }

  playExplosion() {
    this.soundsControl.playEffect('explosion');
  }

  pauseGame() {
    this.soundsControl.pauseAll();
  }

  resumeGame() {
    this.soundsControl.resumeAll();
  }

  setMusicVolume(volume: number) {
    this.musicVolume = volume;
    this.soundsControl.setVolume(volume);
  }

  setEffectsVolume(volume: number) {
    this.effectsVolume = volume;
    this.soundsControl.setEffectVolume(volume);
  }
}
```

## 🛠️ Advanced Usage

### Dynamic Sound Loading

```typescript
class DynamicAudioLoader {
  private soundsControl: SoundsControl;
  private loadingPromises: Map<string, Promise<void>> = new Map();

  constructor() {
    this.soundsControl = new SoundsControl();
  }

  async loadSoundIfNeeded(url: string, id: string): Promise<void> {
    if (this.soundsControl.isSoundLoaded(id)) {
      return;
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id);
    }

    const promise = this.soundsControl.loadSound(url, id);
    this.loadingPromises.set(id, promise);

    try {
      await promise;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  async playWithAutoLoad(url: string, id: string): Promise<void> {
    await this.loadSoundIfNeeded(url, id);
    return this.soundsControl.play(id);
  }
}
```

## 📱 Mobile Considerations

### iOS Audio Context Activation

```typescript
// For iOS, audio context needs user interaction to start
const initializeAudio = async () => {
  const soundsControl = new SoundsControl();
  
  // Add a user interaction listener
  const activateAudio = async () => {
    try {
      // Load a short silent sound to activate audio context
      await soundsControl.loadSound('./assets/silence.mp3', 'silence');
      await soundsControl.play('silence');
      
      document.removeEventListener('touchstart', activateAudio);
      document.removeEventListener('click', activateAudio);
    } catch (error) {
      console.error('Failed to activate audio:', error);
    }
  };

  document.addEventListener('touchstart', activateAudio, { once: true });
  document.addEventListener('click', activateAudio, { once: true });
};
```

## 🔧 Troubleshooting

### Common Issues

**Audio not playing on mobile:**
- Ensure audio is triggered by user interaction
- Check if device is in silent mode
- Verify audio file formats are supported

**Performance issues:**
- Preload frequently used sounds
- Use compressed audio formats (MP3, AAC)
- Limit concurrent audio sources

**Memory usage:**
- Unload unused audio buffers
- Use shorter audio files for effects
- Consider streaming for long music tracks

## 🧪 Testing

```typescript
// Example test setup with Jest
import { SoundsControl } from 'sounds-control';

// Mock AudioContext for testing
global.AudioContext = jest.fn().mockImplementation(() => ({
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() }
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    disconnect: jest.fn()
  })),
  decodeAudioData: jest.fn(),
  currentTime: 0,
  destination: {}
}));

describe('SoundsControl', () => {
  let soundsControl: SoundsControl;

  beforeEach(() => {
    soundsControl = new SoundsControl();
  });

  test('should initialize without errors', () => {
    expect(soundsControl).toBeInstanceOf(SoundsControl);
  });

  // Add more tests...
});
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
git clone https://github.com/hangell/sounds-control.git
cd sounds-control
npm install
npm run build
npm test
```

## 💖 Support

If you found this library helpful, please consider:

- ⭐ Giving it a star on GitHub
- 📝 Reporting issues or requesting features
- 💰 Supporting via Pix: rodrigo@hangell.org

## 👨‍💻 Author
<div align="center">

![Rodrigo Rangel](https://avatars.githubusercontent.com/u/53544561?v=4)

**Rodrigo Rangel**

[![Website](https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://hangell.org)
[![Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/dev?id=5606456325281613718)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UC8_zG7RFM2aMhI-p-6zmixw)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/hangell.org)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rodrigo-rangel-a80810170)

</div>

---

<p align="center">
  Made with ❤️ for the developer community
</p>
