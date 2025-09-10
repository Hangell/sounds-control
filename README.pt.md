# 🎵 Sounds Control [![pt-BR](https://img.shields.io/badge/🇧🇷-Português-green)](README.pt.md) [![en](https://img.shields.io/badge/🇺🇸-English-black)](README.md)


<p align="center">
  <img src="./assets/sounds-control.png" alt="Logo do Sounds Control">
  <br />
  <strong>Uma biblioteca de áudio JavaScript/TypeScript versátil para controle avançado de som</strong>
  <br />
  Perfeita para jogos, aplicações web e desenvolvimento mobile
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://badge.fury.io/js/sounds-control.svg" alt="versão npm" />
  </a>
  <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://img.shields.io/npm/dw/sounds-control.svg" alt="downloads npm/semana" />
  </a>
  <a href="https://www.npmjs.com/package/sounds-control">
    <img src="https://img.shields.io/npm/dm/sounds-control.svg" alt="downloads npm/mês" />
  </a>
  <a href="https://github.com/hangell/sounds-control">
    <img src="https://img.shields.io/github/license/hangell/sounds-control.svg" alt="licença" />
  </a>
  <a href="https://github.com/hangell/sounds-control/stargazers">
    <img src="https://img.shields.io/github/stars/hangell/sounds-control.svg?style=social" alt="Stars do GitHub" />
  </a>
</p>

## ✨ Características

- 🎮 **Pronto para jogos**: Otimizado para aplicações de jogos com áudio de baixa latência
- 📱 **Mobile-first**: Integração perfeita de áudio para ambientes móveis
- ⚡ **Compatível com frameworks**: Funciona perfeitamente com Ionic, React Native, Vue, Angular e JavaScript vanilla
- 🔄 **Controles avançados**: Loop, pausar, retomar, controle de velocidade e gerenciamento de volume
- 🎯 **Sistema de efeitos**: Efeitos sonoros dedicados com controle de volume separado
- 📦 **Suporte TypeScript**: Definições completas do TypeScript incluídas
- 🌐 **Multiplataforma**: Suporte para Web, Android, iOS
- 🎛️ **Web Audio API**: Construído na moderna Web Audio API para performance superior

## 🚀 Início Rápido

### Instalação

```bash
npm install sounds-control
```

### Uso Básico

```javascript
import { SoundsControl } from 'sounds-control';

const soundsControl = new SoundsControl();

// Carregar e tocar um som
async function playMusic() {
  await soundsControl.loadSound('./assets/music.mp3', 'background-music');
  soundsControl.play('background-music');
}

playMusic();
```

## 📖 Referência da API

### Métodos Principais

#### `loadSound(url: string, id: string): Promise<void>`
Carrega um arquivo de áudio de uma URL e o decodifica para uso posterior.

```javascript
await soundsControl.loadSound('./sounds/explosion.mp3', 'explosion');
```

#### `isSoundLoaded(id: string): boolean`
Verifica se um som foi carregado e está pronto para tocar.

```javascript
if (soundsControl.isSoundLoaded('explosion')) {
  // Som está pronto para tocar
}
```

#### `play(id: string, startTime?: number): Promise<void>`
Toca um som a partir de um tempo inicial especificado (em segundos).

```javascript
// Tocar do início
await soundsControl.play('background-music');

// Tocar a partir de 30 segundos
await soundsControl.play('background-music', 30);
```

#### `playEffect(id: string): Promise<void>`
Toca um efeito sonoro usando o canal de áudio dedicado para efeitos.

```javascript
await soundsControl.playEffect('coin-pickup');
```

#### `stop(id: string): void`
Para a reprodução de um som e armazena o tempo de pausa para posterior retomada.

```javascript
soundsControl.stop('background-music');
```

#### `loop(id: string, startTime?: number): void`
Reproduz um som continuamente em loop a partir de um tempo inicial especificado.

```javascript
soundsControl.loop('ambient-sound');
```

### Controle de Volume

#### `setVolume(volume: number): void`
Define o volume principal para todos os sons (0.0 a 1.0).

```javascript
soundsControl.setVolume(0.5); // Volume a 50%
```

#### `setEffectVolume(volume: number): void`
Define o volume apenas para efeitos sonoros (0.0 a 1.0).

```javascript
soundsControl.setEffectVolume(0.8); // Volume a 80% para efeitos
```

### Controle de Taxa de Reprodução

#### `setPlaybackRate(id: string, rate: number): void`
Define a taxa de reprodução para um som específico.

```javascript
soundsControl.setPlaybackRate('music', 1.5); // Velocidade 1.5x
```

#### `setGlobalPlaybackRate(rate: number): void`
Define a taxa de reprodução para todos os sons atualmente tocando.

```javascript
soundsControl.setGlobalPlaybackRate(0.5); // Velocidade reduzida pela metade para todos os sons
```

#### `faster(id: string, rate?: number): void`
Faz um som tocar mais rápido (padrão: velocidade 1.5x).

```javascript
soundsControl.faster('dialogue'); // Velocidade 1.5x
soundsControl.faster('dialogue', 2.0); // Velocidade 2x
```

#### `slow(id: string, rate?: number): void`
Faz um som tocar mais devagar (padrão: velocidade 0.75x).

```javascript
soundsControl.slow('music'); // Velocidade 0.75x
```

### Controles Globais

#### `pauseAll(): void`
Pausa todos os sons atualmente tocando e armazena seus tempos de pausa.

```javascript
soundsControl.pauseAll();
```

#### `resumeAll(): void`
Retoma todos os sons pausados a partir de seus tempos de pausa armazenados.

```javascript
soundsControl.resumeAll();
```

## 🔧 Integração com Frameworks

### Angular / Ionic

#### Configuração do Service

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

#### Uso no Component

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
    // Carregar sons do jogo
    await this.audioService.loadSound('./assets/background.mp3', 'bg-music');
    await this.audioService.loadSound('./assets/jump.mp3', 'jump-effect');
    
    // Iniciar música de fundo
    this.audioService.play('bg-music');
  }

  onJump() {
    this.audioService.playEffect('jump-effect');
  }
}
```

#### Gerenciamento do Estado do App (Ionic)

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
    // Gerenciar mudanças de estado do app para mobile
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

#### Implementação baseada em Hook

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
      // Limpeza ao desmontar
      soundsControlRef.current?.pauseAll();
    };
  }, []);

  return {
    soundsControl: soundsControlRef.current,
    isLoaded
  };
};

// Component do Jogo
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
        
        // Iniciar música de fundo
        soundsControl.play('bg-music');
      } catch (error) {
        console.error('Falha ao carregar sons:', error);
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
        {soundsReady ? 'Clique em mim!' : 'Carregando...'}
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
    <button @click="playMusic" :disabled="!soundsReady">Tocar Música</button>
    <button @click="playEffect" :disabled="!soundsReady">Tocar Efeito</button>
    <button @click="pauseAll">Pausar Tudo</button>
    <button @click="resumeAll">Retomar Tudo</button>
    
    <div class="controls">
      <label>Volume Principal: {{ volume }}</label>
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
    console.error('Falha ao carregar sons:', error);
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

## 🎮 Exemplos de Desenvolvimento de Jogos

### Gerenciador de Áudio Simples para Jogos

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
    // Carregar todos os sons do jogo
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
    this.soundsControl.faster('coin', 1.2); // Ligeiramente mais rápido para emoção
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

## 🛠️ Uso Avançado

### Carregamento Dinâmico de Sons

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

## 📱 Considerações para Mobile

### Ativação do Contexto de Áudio no iOS

```typescript
// Para iOS, o contexto de áudio precisa de interação do usuário para iniciar
const initializeAudio = async () => {
  const soundsControl = new SoundsControl();
  
  // Adicionar um listener de interação do usuário
  const activateAudio = async () => {
    try {
      // Carregar um som silencioso curto para ativar o contexto de áudio
      await soundsControl.loadSound('./assets/silence.mp3', 'silence');
      await soundsControl.play('silence');
      
      document.removeEventListener('touchstart', activateAudio);
      document.removeEventListener('click', activateAudio);
    } catch (error) {
      console.error('Falha ao ativar áudio:', error);
    }
  };

  document.addEventListener('touchstart', activateAudio, { once: true });
  document.addEventListener('click', activateAudio, { once: true });
};
```

## 🔧 Solução de Problemas

### Problemas Comuns

**Áudio não toca no mobile:**
- Certifique-se de que o áudio é acionado por interação do usuário
- Verifique se o dispositivo está no modo silencioso
- Verifique se os formatos de arquivo de áudio são suportados

**Problemas de performance:**
- Pré-carregue sons usados frequentemente
- Use formatos de áudio comprimidos (MP3, AAC)
- Limite fontes de áudio simultâneas

**Uso de memória:**
- Descarregue buffers de áudio não utilizados
- Use arquivos de áudio mais curtos para efeitos
- Considere streaming para faixas de música longas

## 🧪 Testes

```typescript
// Exemplo de configuração de teste com Jest
import { SoundsControl } from 'sounds-control';

// Mock AudioContext para testes
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

  test('deve inicializar sem erros', () => {
    expect(soundsControl).toBeInstanceOf(SoundsControl);
  });

  // Adicionar mais testes...
});
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request. Para grandes mudanças, por favor abra uma issue primeiro para discutir o que você gostaria de mudar.

### Configuração de Desenvolvimento

```bash
git clone https://github.com/hangell/sounds-control.git
cd sounds-control
npm install
npm run build
npm test
```

## 💖 Apoio

Se você achou esta biblioteca útil, por favor considere:

- ⭐ Dar uma estrela no GitHub
- 📝 Relatar problemas ou solicitar recursos
- 💰 Apoiar via Pix: rodrigo@hangell.org

## 👨‍💻 Autor
<div align="center">

![Rodrigo Rangel](https://avatars.githubusercontent.com/u/53544561?v=4)

**Rodrigo Rangel**

[![Site](https://img.shields.io/badge/website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://hangell.org)
[![Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store/apps/dev?id=5606456325281613718)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/channel/UC8_zG7RFM2aMhI-p-6zmixw)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/hangell.org)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-%230077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rodrigo-rangel-a80810170)

</div>

---

<p align="center">
  Feito com ❤️ para a comunidade de desenvolvedores
</p>
