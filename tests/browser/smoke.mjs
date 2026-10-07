import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

// Generate a small PCM WAV locally, so tests need no external audio assets.
const sampleRate = 8000;
const samples = sampleRate * 2;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF');
wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36);
wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++)
  wav.writeInt16LE(
    Math.round(Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 2000),
    44 + i * 2
  );
const files = new Map([
  ['/index.js', readFileSync('dist/index.js')],
  ['/sounds-control.js', readFileSync('dist/sounds-control.js')],
]);
const server = createServer((request, response) => {
  if (request.url === '/') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<button id="play">Play</button>');
  } else if (request.url === '/tone.wav') {
    response.setHeader('Content-Type', 'audio/wav');
    response.end(wav);
  } else if (files.has(request.url)) {
    response.setHeader('Content-Type', 'text/javascript');
    response.end(files.get(request.url));
  } else {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.evaluate(async () => {
    const { SoundsControl } = await import('/index.js');
    const audio = new SoundsControl();
    const context = new AudioContext();
    const shared = new SoundsControl({ context });
    globalThis.audioTest = {
      audio,
      shared,
      context,
      supported: SoundsControl.isSupported(),
      finished: null,
    };
    await audio.loadSounds([
      { id: 'a', url: '/tone.wav' },
      { id: 'b', url: '/tone.wav' },
    ]);
    await shared.loadSound('/tone.wav', 'tone');
    document.querySelector('#play').onclick = () => {
      globalThis.audioTest.finished = (async () => {
        await audio.unlock();
        await shared.unlock();
        await audio.loop('a');
        await audio.play('b', 0.2);
        await audio.playEffect('a');
        await audio.playEffect('a');
        audio.setPlaybackRate('a', 1.5);
        audio.pauseAll();
        const paused = [audio.getState('a'), audio.getState('b')];
        await audio.resumeAll();
        const resumed = [audio.getState('a'), audio.getState('b')];
        await audio.seek('a', 0.5);
        audio.mute();
        const muted = audio.isMuted();
        audio.unmute();
        audio.stopEffects();
        audio.stopAll();
        const stopped = [audio.getState('a'), audio.getState('b')];
        let httpError = false;
        try {
          await audio.loadSound('/missing.wav', 'missing');
        } catch (error) {
          httpError = error.message.includes('HTTP 404');
        }
        await shared.play('tone', 1.99);
        await new Promise((resolve) => setTimeout(resolve, 200));
        const ended = shared.getState('tone');
        const duration = audio.getDuration('a');
        await shared.dispose();
        const sharedState = context.state;
        await context.close();
        await audio.dispose();
        return {
          supported: globalThis.audioTest.supported,
          paused,
          resumed,
          stopped,
          muted,
          httpError,
          ended,
          duration,
          sharedState,
          unloaded: audio.getLoadedSounds(),
        };
      })();
    };
  });
  await page.click('#play');
  const result = await page.evaluate(() => globalThis.audioTest.finished);
  assert.equal(result.supported, true);
  assert.deepEqual(result.paused, ['paused', 'paused']);
  assert.deepEqual(result.resumed, ['playing', 'playing']);
  assert.deepEqual(result.stopped, ['ready', 'ready']);
  assert.equal(result.muted, true);
  assert.equal(result.httpError, true);
  assert.equal(result.ended, 'ready');
  assert.equal(result.duration, 2);
  assert.equal(result.sharedState, 'running');
  assert.deepEqual(result.unloaded, []);
  console.log(
    `Chromium ${browser.version()}: real Web Audio decode/play/pause/resume/seek/effects/mute/end/disposal passed.`
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
