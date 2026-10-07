export interface SoundsControlOptions {
  /** An injected context remains owned by the caller. */
  context?: AudioContext;
  fetch?: typeof fetch;
}

export interface SoundAsset {
  id: string;
  url: string;
}

export interface LoadSoundOptions {
  signal?: AbortSignal;
}

export type SoundState = 'unloaded' | 'ready' | 'playing' | 'paused';

interface Track {
  source?: AudioBufferSourceNode;
  offset: number;
  startedAt: number;
  rate: number;
  loop: boolean;
  paused: boolean;
  playPending: boolean;
  revision: number;
  effectRevision: number;
}

interface PendingLoad {
  controller: AbortController;
  promise: Promise<void>;
}

/** Framework-independent, in-memory Web Audio playback. */
export class SoundsControl {
  private context?: AudioContext;
  private readonly ownsContext: boolean;
  private readonly fetcher?: typeof fetch;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly tracks = new Map<string, Track>();
  private readonly pending = new Map<string, PendingLoad>();
  private readonly effects = new Map<AudioBufferSourceNode, string>();
  private musicGain?: GainNode;
  private effectGain?: GainNode;
  private masterGain?: GainNode;
  private volume = 1;
  private effectVolume = 1;
  private masterVolume = 1;
  private muted = false;
  private globalRate = 1;
  private disposed = false;

  constructor(options: SoundsControlOptions = {}) {
    this.context = options.context;
    this.ownsContext = !options.context;
    this.fetcher = options.fetch;
  }

  static isSupported(): boolean {
    return (
      typeof globalThis.AudioContext === 'function' ||
      typeof (
        globalThis as typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext === 'function'
    );
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('SoundsControl has been disposed');
  }

  private audio(): AudioContext {
    this.assertActive();
    if (!this.context) {
      const Constructor =
        globalThis.AudioContext ||
        (
          globalThis as typeof globalThis & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;
      if (!Constructor)
        throw new Error(
          'Web Audio API is unavailable; use a browser or inject an AudioContext'
        );
      this.context = new Constructor();
    }
    if (this.context.state === 'closed')
      throw new Error('AudioContext is closed');
    if (!this.masterGain) {
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.effectGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.effectGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
      this.musicGain.gain.value = this.volume;
      this.effectGain.gain.value = this.effectVolume;
      this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    }
    return this.context;
  }

  /** Call directly from a click/tap handler to satisfy browser autoplay policy. */
  async unlock(): Promise<void> {
    const context = this.audio();
    if (context.state === 'suspended') await context.resume();
    this.assertActive();
  }

  async loadSound(
    url: string,
    id: string,
    options: LoadSoundOptions = {}
  ): Promise<void> {
    this.assertActive();
    if (!id.trim() || !url.trim())
      throw new TypeError('Sound id and URL must not be empty');
    if (options.signal?.aborted)
      throw new DOMException('Load aborted', 'AbortError');
    if (this.buffers.has(id)) return;
    const existing = this.pending.get(id);
    if (existing) return existing.promise;
    const context = this.audio();
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    const promise = (async () => {
      const fetcher = this.fetcher ?? globalThis.fetch;
      if (!fetcher) throw new Error('Fetch API is unavailable');
      const response = await fetcher(url, { signal: controller.signal });
      if (!response.ok)
        throw new Error(
          `Failed to load sound "${id}": HTTP ${response.status}`
        );
      const data = await response.arrayBuffer();
      const buffer = await context.decodeAudioData(data);
      if (controller.signal.aborted || this.disposed)
        throw new DOMException('Load aborted', 'AbortError');
      this.buffers.set(id, buffer);
    })();
    const entry = { controller, promise };
    this.pending.set(id, entry);
    try {
      await promise;
    } finally {
      options.signal?.removeEventListener('abort', abort);
      if (this.pending.get(id) === entry) this.pending.delete(id);
    }
  }

  async loadSounds(
    assets: readonly SoundAsset[],
    options: LoadSoundOptions = {}
  ): Promise<void> {
    this.assertActive();
    await Promise.all(
      assets.map(({ url, id }) => this.loadSound(url, id, options))
    );
  }

  isSoundLoaded(id: string): boolean {
    return this.buffers.has(id);
  }
  getLoadedSounds(): string[] {
    return [...this.buffers.keys()];
  }

  private buffer(id: string): AudioBuffer {
    this.assertActive();
    const buffer = this.buffers.get(id);
    if (!buffer) throw new Error(`Sound ${id} not loaded`);
    return buffer;
  }

  private track(id: string): Track {
    this.assertActive();
    let track = this.tracks.get(id);
    if (!track) {
      track = {
        offset: 0,
        startedAt: 0,
        rate: this.globalRate,
        loop: false,
        paused: false,
        playPending: false,
        revision: 0,
        effectRevision: 0,
      };
      this.tracks.set(id, track);
    }
    return track;
  }

  private position(id: string, track: Track): number {
    const duration = this.buffers.get(id)?.duration ?? 0;
    const elapsed = track.source
      ? (this.audio().currentTime - track.startedAt) * track.rate
      : 0;
    const position = track.offset + elapsed;
    return track.loop && duration > 0
      ? position % duration
      : Math.min(position, duration);
  }

  private detach(track: Track): void {
    track.revision++;
    track.playPending = false;
    if (track.source) {
      track.source.onended = null;
      track.source.stop();
      track.source.disconnect();
      track.source = undefined;
    }
  }

  async play(id: string, startTime = 0): Promise<void> {
    const buffer = this.buffer(id);
    this.validateOffset(startTime, buffer.duration);
    const track = this.track(id);
    this.detach(track);
    track.offset = startTime;
    track.paused = false;
    const revision = track.revision;
    track.playPending = true;
    try {
      await this.unlock();
    } catch (error) {
      if (track.revision === revision) track.playPending = false;
      throw error;
    }
    if (track.revision !== revision) return;
    track.playPending = false;
    const context = this.audio();
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = track.loop;
    source.playbackRate.value = track.rate;
    source.connect(this.musicGain!);
    source.onended = () => {
      if (track.source !== source) return;
      source.disconnect();
      track.source = undefined;
      track.offset = 0;
      track.paused = false;
    };
    try {
      source.start(0, startTime);
    } catch (error) {
      source.disconnect();
      throw error;
    }
    track.source = source;
    track.startedAt = context.currentTime;
  }

  async playEffect(id: string): Promise<void> {
    const buffer = this.buffer(id);
    const track = this.track(id);
    const revision = track.effectRevision;
    await this.unlock();
    if (track.effectRevision !== revision) return;
    const source = this.audio().createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = track.rate;
    source.connect(this.effectGain!);
    source.onended = () => {
      this.effects.delete(source);
      source.disconnect();
    };
    try {
      source.start();
    } catch (error) {
      source.disconnect();
      throw error;
    }
    this.effects.set(source, id);
  }

  stop(id: string): void {
    this.assertActive();
    const track = this.tracks.get(id);
    if (!track) return;
    this.detach(track);
    track.offset = 0;
    track.paused = false;
  }

  pause(id: string): void {
    this.assertActive();
    const track = this.tracks.get(id);
    if (!track || (!track.source && !track.playPending)) return;
    track.offset = this.position(id, track);
    this.detach(track);
    track.paused = true;
  }

  async resume(id: string): Promise<void> {
    this.assertActive();
    const track = this.tracks.get(id);
    if (track?.paused) await this.play(id, track.offset);
  }

  pauseAll(): void {
    this.assertActive();
    for (const id of this.tracks.keys()) this.pause(id);
  }
  async resumeAll(): Promise<void> {
    this.assertActive();
    await Promise.all([...this.tracks.keys()].map((id) => this.resume(id)));
  }
  stopAll(): void {
    this.assertActive();
    for (const id of this.tracks.keys()) this.stop(id);
    this.stopEffects();
  }

  stopEffects(id?: string): void {
    this.assertActive();
    // Also invalidate effects still waiting for unlock().
    for (const [key, track] of this.tracks) {
      if (id === undefined || key === id) track.effectRevision++;
    }
    for (const [source, key] of this.effects) {
      if (id !== undefined && key !== id) continue;
      source.onended = null;
      source.stop();
      source.disconnect();
      this.effects.delete(source);
    }
  }

  async loop(id: string, startTime = 0): Promise<void> {
    this.setLoop(id, true);
    await this.play(id, startTime);
  }
  setLoop(id: string, enabled: boolean): void {
    const track = this.track(id);
    track.offset = this.position(id, track);
    track.startedAt = this.context?.currentTime ?? 0;
    track.loop = enabled;
    if (track.source) track.source.loop = enabled;
  }

  async seek(id: string, seconds: number): Promise<void> {
    const buffer = this.buffer(id);
    this.validateOffset(seconds, buffer.duration);
    const track = this.track(id);
    if (track.source) await this.play(id, seconds);
    else {
      this.detach(track);
      track.offset = seconds;
      track.paused = true;
    }
  }

  getDuration(id: string): number {
    return this.buffer(id).duration;
  }
  getPosition(id: string): number {
    this.buffer(id);
    return this.position(id, this.track(id));
  }
  getState(id: string): SoundState {
    if (!this.buffers.has(id)) return 'unloaded';
    const track = this.tracks.get(id);
    return track?.source ? 'playing' : track?.paused ? 'paused' : 'ready';
  }
  isSoundPlaying(id: string): boolean {
    return this.getState(id) === 'playing';
  }

  private validateOffset(offset: number, duration: number): void {
    if (!Number.isFinite(offset) || offset < 0 || offset > duration)
      throw new RangeError('Offset must be within the sound duration');
  }
  private normalizedVolume(volume: number): number {
    this.assertActive();
    if (!Number.isFinite(volume)) throw new RangeError('Volume must be finite');
    return Math.max(0, Math.min(1, volume));
  }
  setVolume(volume: number): void {
    this.volume = this.normalizedVolume(volume);
    this.musicGain?.gain.setValueAtTime(this.volume, this.context!.currentTime);
  }
  getVolume(): number {
    return this.volume;
  }
  setEffectVolume(volume: number): void {
    this.effectVolume = this.normalizedVolume(volume);
    this.effectGain?.gain.setValueAtTime(
      this.effectVolume,
      this.context!.currentTime
    );
  }
  getEffectVolume(): number {
    return this.effectVolume;
  }
  setMasterVolume(volume: number): void {
    this.masterVolume = this.normalizedVolume(volume);
    this.masterGain?.gain.setValueAtTime(
      this.muted ? 0 : this.masterVolume,
      this.context!.currentTime
    );
  }
  getMasterVolume(): number {
    return this.masterVolume;
  }
  mute(): void {
    this.assertActive();
    this.muted = true;
    this.setMasterVolume(this.masterVolume);
  }
  unmute(): void {
    this.assertActive();
    this.muted = false;
    this.setMasterVolume(this.masterVolume);
  }
  isMuted(): boolean {
    return this.muted;
  }

  setPlaybackRate(id: string, rate: number): void {
    this.assertActive();
    this.validateRate(rate);
    const track = this.track(id);
    track.offset = this.position(id, track);
    track.startedAt = this.context?.currentTime ?? 0;
    track.rate = rate;
    track.source?.playbackRate.setValueAtTime(rate, this.context!.currentTime);
    for (const [source, key] of this.effects)
      if (key === id)
        source.playbackRate.setValueAtTime(rate, this.context!.currentTime);
  }
  private validateRate(rate: number): void {
    if (!Number.isFinite(rate) || rate <= 0)
      throw new RangeError(
        'Playback rate must be finite and greater than zero'
      );
  }
  setGlobalPlaybackRate(rate: number): void {
    this.assertActive();
    this.validateRate(rate);
    this.globalRate = rate;
    for (const id of this.tracks.keys()) this.setPlaybackRate(id, rate);
  }
  faster(id: string, rate = 1.5): void {
    this.setPlaybackRate(id, rate);
  }
  slow(id: string, rate = 0.75): void {
    this.setPlaybackRate(id, rate);
  }
  fasterEffect(id: string, rate = 1.5): void {
    this.setPlaybackRate(id, rate);
  }
  slowEffect(id: string, rate = 0.75): void {
    this.setPlaybackRate(id, rate);
  }

  unloadSound(id: string): void {
    this.assertActive();
    this.stop(id);
    this.stopEffects(id);
    this.pending.get(id)?.controller.abort();
    this.pending.delete(id);
    this.buffers.delete(id);
    this.tracks.delete(id);
  }
  unloadAll(): void {
    this.assertActive();
    for (const id of new Set([
      ...this.buffers.keys(),
      ...this.pending.keys(),
      ...this.tracks.keys(),
    ]))
      this.unloadSound(id);
  }
  /** Stops all audio. Only internally created contexts are closed. Idempotent. */
  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.unloadAll();
    this.musicGain?.disconnect();
    this.effectGain?.disconnect();
    this.masterGain?.disconnect();
    this.disposed = true;
    if (this.ownsContext && this.context && this.context.state !== 'closed')
      await this.context.close();
  }
}
