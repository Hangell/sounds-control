// src/sounds-control.ts
export class SoundsControl {
    constructor() {
        this.sources = {};
        this.buffers = {};
        this.isPlaying = {};
        this.isLooping = {};
        this.startTime = {};
        this.pausedTime = {};
        this.currentlyPlaying = null;
        this.playbackRates = {};
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.effectGainNode = this.context.createGain();
        this.effectGainNode.connect(this.context.destination);
    }
    async loadSound(url, id) {
        if (!this.buffers[id]) {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            this.buffers[id] = audioBuffer;
        }
    }
    isSoundLoaded(id) {
        return !!this.buffers[id];
    }
    async play(id, startTime = 0) {
        if (!this.isSoundLoaded(id)) {
            throw new Error(`Sound ${id} not loaded`);
        }
        this.stop(id);
        const source = this.context.createBufferSource();
        source.buffer = this.buffers[id];
        source.connect(this.gainNode);
        source.loop = this.isLooping[id] || false;
        source.playbackRate.value = this.playbackRates[id] || 1;
        source.start(0, startTime);
        this.sources[id] = source;
        this.isPlaying[id] = true;
        this.startTime[id] = this.context.currentTime - startTime;
        this.currentlyPlaying = id;
        source.onended = () => {
            this.isPlaying[id] = false;
        };
    }
    async playEffect(id) {
        if (!this.isSoundLoaded(id)) {
            throw new Error(`Sound ${id} not loaded`);
        }
        const source = this.context.createBufferSource();
        source.buffer = this.buffers[id];
        source.connect(this.effectGainNode);
        source.playbackRate.value = this.playbackRates[id] || 1;
        source.start(0);
    }
    stop(id) {
        if (this.sources[id]) {
            this.pausedTime[id] = this.context.currentTime - this.startTime[id];
            this.sources[id].stop(0);
            this.sources[id].disconnect();
            delete this.sources[id];
            this.isPlaying[id] = false;
            if (this.currentlyPlaying === id) {
                this.currentlyPlaying = null;
            }
        }
    }
    loop(id, startTime = 0) {
        this.isLooping[id] = true;
        this.play(id, startTime);
    }
    setVolume(volume) {
        if (volume < 0) {
            volume = 0;
        }
        else if (volume > 1) {
            volume = 1;
        }
        this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    }
    setEffectVolume(volume) {
        if (volume < 0) {
            volume = 0;
        }
        else if (volume > 1) {
            volume = 1;
        }
        this.effectGainNode.gain.setValueAtTime(volume, this.context.currentTime);
    }
    setPlaybackRate(id, rate) {
        if (this.sources[id]) {
            this.sources[id].playbackRate.value = rate;
        }
        this.playbackRates[id] = rate;
    }
    setGlobalPlaybackRate(rate) {
        Object.keys(this.sources).forEach(id => {
            this.setPlaybackRate(id, rate);
        });
    }
    faster(id, rate = 1.5) {
        this.setPlaybackRate(id, rate);
    }
    slow(id, rate = 0.75) {
        this.setPlaybackRate(id, rate);
    }
    fasterEffect(id, rate = 1.5) {
        this.setPlaybackRate(id, rate);
    }
    slowEffect(id, rate = 0.75) {
        this.setPlaybackRate(id, rate);
    }
    pauseAll() {
        Object.keys(this.sources).forEach(id => {
            if (this.sources[id]) {
                this.pausedTime[id] = this.context.currentTime - this.startTime[id];
                this.sources[id].stop(0);
                this.isPlaying[id] = false;
            }
        });
    }
    resumeAll() {
        if (this.currentlyPlaying && this.pausedTime[this.currentlyPlaying] !== undefined) {
            this.play(this.currentlyPlaying, this.pausedTime[this.currentlyPlaying]);
        }
    }
}
//# sourceMappingURL=sounds-control.js.map