export class Param {
  value = 1;
  setValueAtTime(value) {
    this.value = value;
  }
}
export class Gain {
  gain = new Param();
  connections = [];
  disconnected = false;
  connect(node) {
    this.connections.push(node);
  }
  disconnect() {
    this.disconnected = true;
  }
}
export class Source extends Gain {
  playbackRate = new Param();
  loop = false;
  buffer = null;
  onended = null;
  stopped = false;
  start(when = 0, offset = 0) {
    this.when = when;
    this.offset = offset;
  }
  stop() {
    if (this.stopped) throw new Error('Source stopped twice');
    this.stopped = true;
    this.onended?.();
  }
  end() {
    this.onended?.();
  }
}
export class Context {
  state = 'running';
  currentTime = 0;
  destination = {};
  sources = [];
  gains = [];
  resumed = 0;
  closed = 0;
  createGain() {
    const node = new Gain();
    this.gains.push(node);
    return node;
  }
  createBufferSource() {
    const node = new Source();
    this.sources.push(node);
    return node;
  }
  async decodeAudioData() {
    return { duration: 10 };
  }
  async resume() {
    this.resumed++;
    this.state = 'running';
  }
  async close() {
    this.closed++;
    this.state = 'closed';
  }
}
export function response(status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async arrayBuffer() {
      return new ArrayBuffer(8);
    },
  };
}
export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
