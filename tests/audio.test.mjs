import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SoundsControl } from '../dist/index.js';
import { Context, response, deferred } from './helpers.mjs';

async function fixture(ids = ['music']) {
  const context = new Context();
  const sounds = new SoundsControl({ context, fetch: async () => response() });
  await sounds.loadSounds(ids.map((id) => ({ id, url: `/${id}.wav` })));
  return { sounds, context };
}

test('SSR import and construction are safe; unsupported playback fails clearly', async () => {
  const sounds = new SoundsControl();
  assert.equal(SoundsControl.isSupported(), false);
  sounds.setVolume(0.5);
  sounds.setEffectVolume(0.3);
  sounds.setMasterVolume(0.2);
  sounds.mute();
  assert.equal(sounds.isMuted(), true);
  sounds.unmute();
  await assert.rejects(sounds.unlock(), /Web Audio API is unavailable/);
  await sounds.dispose();
  await sounds.dispose();
});

test('loads, caches, deduplicates, lists and supports arbitrary ids', async () => {
  const wait = deferred();
  let calls = 0;
  const sounds = new SoundsControl({
    context: new Context(),
    fetch: async () => {
      calls++;
      await wait.promise;
      return response();
    },
  });
  const a = sounds.loadSound('/music.wav', '__proto__');
  const b = sounds.loadSound('/ignored.wav', '__proto__');
  wait.resolve();
  await Promise.all([a, b]);
  await sounds.loadSound('/ignored.wav', '__proto__');
  assert.equal(calls, 1);
  assert.deepEqual(sounds.getLoadedSounds(), ['__proto__']);
  assert.equal(sounds.getDuration('__proto__'), 10);
  assert.equal(sounds.getState('__proto__'), 'ready');
  assert.equal(sounds.getState('unknown'), 'unloaded');
  sounds.unloadSound('__proto__');
  assert.equal(sounds.isSoundLoaded('__proto__'), false);
});

test('network and decoding failures reject and can be retried', async () => {
  const context = new Context();
  let code = 404;
  const sounds = new SoundsControl({
    context,
    fetch: async () => response(code),
  });
  await assert.rejects(sounds.loadSound('/missing', 'x'), /HTTP 404/);
  assert.equal(sounds.isSoundLoaded('x'), false);
  code = 200;
  context.decodeAudioData = async () => {
    throw new Error('Invalid audio');
  };
  await assert.rejects(sounds.loadSound('/bad', 'x'), /Invalid audio/);
  context.decodeAudioData = async () => ({ duration: 10 });
  await sounds.loadSound('/good', 'x');
  await assert.rejects(sounds.loadSound('', 'x'), /must not be empty/);
  await assert.rejects(sounds.loadSound('/x', ' '), /must not be empty/);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    sounds.loadSound('/x', 'x', { signal: controller.signal }),
    { name: 'AbortError' }
  );
});

test('unload, caller abort and disposal cannot resurrect pending buffers', async () => {
  for (const action of ['unload', 'abort', 'dispose']) {
    const context = new Context();
    const decode = deferred();
    const entered = deferred();
    context.decodeAudioData = () => {
      entered.resolve();
      return decode.promise;
    };
    const sounds = new SoundsControl({
      context,
      fetch: async () => response(),
    });
    const controller = new AbortController();
    const loading = sounds.loadSound('/x', 'x', { signal: controller.signal });
    const rejection = assert.rejects(loading, { name: 'AbortError' });
    await entered.promise;
    if (action === 'unload') sounds.unloadSound('x');
    if (action === 'abort') controller.abort();
    if (action === 'dispose') await sounds.dispose();
    decode.resolve({ duration: 10 });
    await rejection;
    assert.equal(sounds.isSoundLoaded('x'), false);
  }
});

test('failed old load does not remove a replacement pending load', async () => {
  const first = deferred();
  const second = deferred();
  let calls = 0;
  const sounds = new SoundsControl({
    context: new Context(),
    fetch: () => (++calls === 1 ? first.promise : second.promise),
  });
  const a = sounds.loadSound('/a', 'x');
  const rejected = assert.rejects(a, /old request/);
  sounds.unloadSound('x');
  const b = sounds.loadSound('/b', 'x');
  first.reject(new Error('old request'));
  await rejected;
  const c = sounds.loadSound('/c', 'x');
  second.resolve(response());
  await Promise.all([b, c]);
  assert.equal(calls, 2);
});

test('playing, natural completion and replay clean up nodes', async () => {
  const { sounds, context } = await fixture();
  await sounds.play('music', 2);
  assert.equal(sounds.isSoundPlaying('music'), true);
  assert.equal(context.sources[0].offset, 2);
  context.currentTime = 3;
  assert.equal(sounds.getPosition('music'), 5);
  const oldEnded = context.sources[0].onended;
  await sounds.play('music');
  oldEnded();
  assert.equal(sounds.isSoundPlaying('music'), true);
  assert.equal(context.sources[0].disconnected, true);
  context.sources[1].end();
  assert.equal(sounds.getState('music'), 'ready');
  assert.equal(sounds.getPosition('music'), 0);
  assert.equal(context.sources[1].disconnected, true);
  sounds.stop('music');
  sounds.stop('unknown');
});

test('pause/resume all preserves independent positions and is repeatable', async () => {
  const { sounds, context } = await fixture(['a', 'b']);
  await sounds.play('a', 1);
  await sounds.play('b', 3);
  context.currentTime = 2;
  sounds.pauseAll();
  sounds.pauseAll();
  assert.equal(sounds.getState('a'), 'paused');
  assert.equal(sounds.getPosition('a'), 3);
  assert.equal(sounds.getPosition('b'), 5);
  context.currentTime = 20;
  await sounds.resumeAll();
  assert.equal(sounds.isSoundPlaying('a'), true);
  assert.equal(sounds.isSoundPlaying('b'), true);
  assert.equal(context.sources[2].offset, 3);
  assert.equal(context.sources[3].offset, 5);
  await sounds.resume('unknown');
  sounds.pause('unknown');
  sounds.stopAll();
  await sounds.resumeAll();
  assert.equal(sounds.getState('a'), 'ready');
});

test('position integrates rate changes and wraps loops; seek preserves paused state', async () => {
  const { sounds, context } = await fixture();
  await sounds.play('music', 1);
  context.currentTime = 2;
  sounds.faster('music', 2);
  context.currentTime = 4;
  assert.equal(sounds.getPosition('music'), 7);
  sounds.pause('music');
  context.currentTime = 20;
  await sounds.resume('music');
  context.currentTime = 21;
  assert.equal(sounds.getPosition('music'), 9);
  await sounds.seek('music', 4);
  assert.equal(sounds.getPosition('music'), 4);
  sounds.pause('music');
  await sounds.seek('music', 2);
  assert.equal(sounds.getState('music'), 'paused');
  await sounds.resume('music');
  await sounds.loop('music', 8);
  context.currentTime += 3;
  assert.equal(sounds.getPosition('music'), 4);
  sounds.setLoop('music', false);
  context.currentTime += 10;
  assert.equal(sounds.getPosition('music'), 10);
  sounds.stop('music');
  assert.equal(sounds.getPosition('music'), 0);
});

test('global rate applies to future tracks; aliases and active effects use rates', async () => {
  const { sounds, context } = await fixture(['a', 'b']);
  sounds.setGlobalPlaybackRate(2);
  await sounds.play('a');
  await sounds.playEffect('a');
  await sounds.playEffect('a');
  assert.equal(context.sources[0].playbackRate.value, 2);
  sounds.slow('a');
  assert.equal(context.sources[0].playbackRate.value, 0.75);
  assert.equal(context.sources[1].playbackRate.value, 0.75);
  sounds.fasterEffect('a');
  assert.equal(context.sources[2].playbackRate.value, 1.5);
  sounds.slowEffect('a', 0.5);
  assert.equal(context.sources[1].playbackRate.value, 0.5);
  sounds.setGlobalPlaybackRate(3);
  await sounds.play('b');
  assert.equal(context.sources.at(-1).playbackRate.value, 3);
});

test('effects overlap, end, stop selectively and stopAll includes effects', async () => {
  const { sounds, context } = await fixture(['a', 'b']);
  await sounds.playEffect('a');
  await sounds.playEffect('a');
  await sounds.playEffect('b');
  context.sources[0].end();
  assert.equal(context.sources[0].disconnected, true);
  sounds.stopEffects('a');
  assert.equal(context.sources[1].stopped, true);
  assert.equal(context.sources[2].stopped, false);
  sounds.stopAll();
  assert.equal(context.sources[2].stopped, true);
  sounds.stopEffects();
});

test('gain routing, clamping, mute restoration and initial values', async () => {
  const context = new Context();
  const sounds = new SoundsControl({ context, fetch: async () => response() });
  sounds.setVolume(0.4);
  sounds.setEffectVolume(0.6);
  sounds.setMasterVolume(0.8);
  sounds.mute();
  await sounds.loadSound('/a', 'a');
  const [master, music, effects] = context.gains;
  assert.equal(master.gain.value, 0);
  assert.equal(music.gain.value, 0.4);
  assert.equal(effects.gain.value, 0.6);
  assert.equal(music.connections[0], master);
  assert.equal(effects.connections[0], master);
  sounds.unmute();
  assert.equal(master.gain.value, 0.8);
  assert.equal(sounds.isMuted(), false);
  sounds.setVolume(-1);
  sounds.setEffectVolume(3);
  sounds.setMasterVolume(0.2);
  assert.equal(sounds.getVolume(), 0);
  assert.equal(sounds.getEffectVolume(), 1);
  assert.equal(sounds.getMasterVolume(), 0.2);
  sounds.mute();
  sounds.setMasterVolume(0.5);
  assert.equal(master.gain.value, 0);
  sounds.unmute();
  assert.equal(master.gain.value, 0.5);
});

test('validation rejects missing sounds, invalid offsets, rates and volumes', async () => {
  const { sounds } = await fixture();
  await assert.rejects(sounds.play('missing'), /not loaded/);
  await assert.rejects(sounds.playEffect('missing'), /not loaded/);
  assert.throws(() => sounds.getDuration('missing'), /not loaded/);
  for (const number of [-1, 11, NaN, Infinity]) {
    await assert.rejects(sounds.play('music', number), RangeError);
    await assert.rejects(sounds.seek('music', number), RangeError);
  }
  for (const number of [0, -1, NaN, Infinity]) {
    assert.throws(() => sounds.setPlaybackRate('music', number), RangeError);
    assert.throws(() => sounds.setGlobalPlaybackRate(number), RangeError);
  }
  for (const method of ['setVolume', 'setEffectVolume', 'setMasterVolume'])
    assert.throws(() => sounds[method](NaN), RangeError);
  await sounds.seek('music', 10);
  assert.equal(sounds.getPosition('music'), 10);
});

test('suspended context is resumed and pending playback respects stop/unload', async () => {
  const { sounds, context } = await fixture();
  context.state = 'suspended';
  await sounds.play('music');
  assert.equal(context.resumed, 1);
  sounds.stop('music');
  const playing = sounds.play('music');
  sounds.stop('music');
  await playing;
  assert.equal(sounds.getState('music'), 'ready');
  const effect = sounds.playEffect('music');
  sounds.stopEffects();
  await effect;
  assert.equal(context.sources.length, 1);
  const last = sounds.play('music');
  sounds.unloadSound('music');
  await last;
  assert.equal(sounds.getState('music'), 'unloaded');
});

test('latest play wins when unlock is pending; stopping effects does not cancel music', async () => {
  const { sounds, context } = await fixture();
  const a = sounds.play('music', 1);
  const b = sounds.play('music', 3);
  sounds.stopEffects();
  await Promise.all([a, b]);
  assert.equal(context.sources.length, 1);
  assert.equal(context.sources[0].offset, 3);
});

test('dispose disconnects nodes, unloads sounds, rejects mutations, preserves caller context', async () => {
  const { sounds, context } = await fixture();
  await sounds.play('music');
  await sounds.playEffect('music');
  await sounds.dispose();
  await sounds.dispose();
  assert.equal(context.closed, 0);
  assert.ok(context.gains.every((node) => node.disconnected));
  assert.deepEqual(sounds.getLoadedSounds(), []);
  assert.throws(() => sounds.stopAll(), /disposed/);
  await assert.rejects(sounds.play('music'), /disposed/);
  await assert.rejects(sounds.loadSound('/x', 'x'), /disposed/);
});

test('owned contexts are created lazily and closed, including prefixed fallback', async () => {
  for (const key of ['AudioContext', 'webkitAudioContext']) {
    let owned;
    globalThis[key] = class extends Context {
      constructor() {
        super();
        owned = this;
      }
    };
    try {
      assert.equal(SoundsControl.isSupported(), true);
      const sounds = new SoundsControl({ fetch: async () => response() });
      await sounds.loadSound('/a', 'a');
      await sounds.dispose();
      assert.equal(owned.closed, 1);
      const closed = new Context();
      closed.state = 'closed';
      await assert.rejects(
        new SoundsControl({ context: closed }).unlock(),
        /closed/
      );
      await new SoundsControl({ context: closed }).dispose();
    } finally {
      delete globalThis[key];
    }
  }
});

test('start failures disconnect failed music/effect sources', async () => {
  const { sounds, context } = await fixture();
  const create = context.createBufferSource.bind(context);
  context.createBufferSource = () => {
    const source = create();
    source.start = () => {
      throw new Error('start failed');
    };
    return source;
  };
  await assert.rejects(sounds.play('music'), /start failed/);
  await assert.rejects(sounds.playEffect('music'), /start failed/);
  assert.ok(context.sources.every((node) => node.disconnected));
});

test('pause/seek supersede a regular play waiting for context resume', async () => {
  const { sounds, context } = await fixture();
  const waiting = deferred();
  context.state = 'suspended';
  context.resume = async () => {
    await waiting.promise;
    context.state = 'running';
  };
  const playing = sounds.play('music', 3);
  sounds.pause('music');
  assert.equal(sounds.getState('music'), 'paused');
  waiting.resolve();
  await playing;
  assert.equal(context.sources.length, 0);
  await sounds.resume('music');
  assert.equal(context.sources[0].offset, 3);
  sounds.stop('music');
  const playingAgain = sounds.play('music', 1);
  await sounds.seek('music', 4);
  await playingAgain;
  assert.equal(sounds.getState('music'), 'paused');
  assert.equal(sounds.getPosition('music'), 4);
  assert.equal(context.sources.length, 1);
});

test('unlock failures reject playback without leaving a pending play', async () => {
  const { sounds, context } = await fixture();
  context.state = 'suspended';
  context.resume = async () => {
    throw new Error('Resume denied');
  };
  await assert.rejects(sounds.play('music'), /Resume denied/);
  sounds.pause('music');
  assert.equal(sounds.getState('music'), 'ready');
});
