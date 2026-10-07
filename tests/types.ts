import {
  SoundsControl,
  type SoundAsset,
  type SoundState,
} from '../src/index.js';
const assets: SoundAsset[] = [{ id: 'music', url: '/music.wav' }];
const sounds = new SoundsControl();
void sounds.loadSounds(assets);
const state: SoundState = sounds.getState('music');
void state;
// @ts-expect-error A rate must be numeric.
sounds.setPlaybackRate('music', 'fast');
// @ts-expect-error Asset ids are required.
void sounds.loadSounds([{ url: '/music.wav' }]);
