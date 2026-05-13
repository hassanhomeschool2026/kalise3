// Web Audio API synthesized soundscapes — zero external files

function createReverb(ctx, duration = 2, decay = 2.5) {
  const len = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  const c = ctx.createConvolver();
  c.buffer = buf;
  return c;
}

export class AmbienceEngine {
  constructor() { this.ctx = null; this.nodes = []; this.masterGain = null; }

  _init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  stop() {
    this.nodes.forEach((n) => { try { n.stop?.(); n.disconnect?.(); } catch (_) {} });
    this.nodes = [];
    this.masterGain = null;
  }

  _master(vol = 0.5) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 2.5);
    g.connect(this.ctx.destination);
    this.masterGain = g;
    return g;
  }

  _noise(type = "brown") {
    const ctx = this.ctx;
    const bufSz = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufSz; i++) {
      const w = Math.random() * 2 - 1;
      if (type === "brown") { d[i] = (last + 0.02 * w) / 1.02; last = d[i]; d[i] *= 3.5; }
      else d[i] = w;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true; return src;
  }

  _bpf(freq, Q = 1) { const f = this.ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq; f.Q.value = Q; return f; }
  _lpf(freq) { const f = this.ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = freq; return f; }
  _hpf(freq) { const f = this.ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = freq; return f; }
  _gain(v) { const g = this.ctx.createGain(); g.gain.value = v; return g; }
  _lfo(freq, amt, target) {
    const ctx = this.ctx; const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.frequency.value = freq; g.gain.value = amt; osc.connect(g); g.connect(target); osc.start(); return osc;
  }

  playRain(m) {
    const rain = this._noise("brown"); const rf = this._bpf(1800, 0.4); const rg = this._gain(0.5);
    rain.connect(rf); rf.connect(rg); rg.connect(m); rain.start();
    const drizzle = this._noise("white"); const df = this._hpf(4000); const dg = this._gain(0.08);
    drizzle.connect(df); df.connect(dg); dg.connect(m); drizzle.start();
    const rumble = this._noise("brown"); const rl = this._lpf(120); const rgl = this._gain(0.25);
    const lfo = this._lfo(0.05, 0.12, rgl.gain);
    rumble.connect(rl); rl.connect(rgl); rgl.connect(m); rumble.start();
    this.nodes.push(rain, drizzle, rumble, lfo);
  }

  playOcean(m) {
    const wave = this._noise("brown"); const wf = this._lpf(750); const wg = this._gain(0.45);
    const lfo = this._lfo(0.11, 0.28, wg.gain);
    wave.connect(wf); wf.connect(wg); wg.connect(m); wave.start();
    const foam = this._noise("white"); const ff = this._bpf(3000, 0.6); const fg = this._gain(0.05);
    const lfo2 = this._lfo(0.09, 0.04, fg.gain);
    foam.connect(ff); ff.connect(fg); fg.connect(m); foam.start();
    this.nodes.push(wave, foam, lfo, lfo2);
  }

  playFire(m) {
    const cr = this._noise("brown"); const cf = this._bpf(900, 0.5); const cg = this._gain(0.4);
    cr.connect(cf); cf.connect(cg); cg.connect(m); cr.start();
    const lo = this._noise("brown"); const lf = this._lpf(180); const lg = this._gain(0.32);
    lo.connect(lf); lf.connect(lg); lg.connect(m); lo.start();
    const popInt = setInterval(() => {
      if (!this.ctx) return;
      const o = this.ctx.createOscillator(); o.frequency.value = 90 + Math.random() * 100;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.1, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      o.connect(g); g.connect(m); o.start(); o.stop(this.ctx.currentTime + 0.22);
    }, 250 + Math.random() * 600);
    this.nodes.push(cr, lo, { stop: () => clearInterval(popInt) });
  }

  playForest(m) {
    const wind = this._noise("brown"); const wf = this._bpf(550, 0.3); const wg = this._gain(0.18);
    wind.connect(wf); wf.connect(wg); wg.connect(m); wind.start();
    const birdInt = setInterval(() => {
      if (!this.ctx) return;
      const freq = 2200 + Math.random() * 1800;
      const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      o.frequency.linearRampToValueAtTime(freq * 1.25, this.ctx.currentTime + 0.09);
      o.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.17);
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 0.02);
      g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.22);
      o.connect(g); g.connect(m); o.start(); o.stop(this.ctx.currentTime + 0.28);
    }, 700 + Math.random() * 1200);
    this.nodes.push(wind, { stop: () => clearInterval(birdInt) });
  }

  playNight(m) {
    const wind = this._noise("brown"); const wf = this._lpf(360); const wg = this._gain(0.1);
    wind.connect(wf); wf.connect(wg); wg.connect(m); wind.start();
    const cInt = setInterval(() => {
      if (!this.ctx) return;
      for (let i = 0; i < 4; i++) {
        const o = this.ctx.createOscillator(); o.frequency.value = 4100 + Math.random() * 500;
        const g = this.ctx.createGain(); const t0 = this.ctx.currentTime + i * 0.045;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.018, t0 + 0.012);
        g.gain.linearRampToValueAtTime(0, t0 + 0.045);
        o.connect(g); g.connect(m); o.start(t0); o.stop(t0 + 0.06);
      }
    }, 380);
    this.nodes.push(wind, { stop: () => clearInterval(cInt) });
  }

  playStream(m) {
    const rev = createReverb(this.ctx, 1.2, 3); rev.connect(m);
    const s = this._noise("brown"); const sf = this._bpf(950, 0.65); const sg = this._gain(0.42);
    const lfo = this._lfo(0.85, 180, sf.frequency);
    s.connect(sf); sf.connect(sg); sg.connect(rev); s.start();
    this.nodes.push(s, lfo, { stop: () => rev.disconnect() });
  }

  playWind(m) {
    const rev = createReverb(this.ctx, 3, 2); rev.connect(m);
    const FREQS = [523, 659, 784, 988, 1047, 1319];
    const chInt = setInterval(() => {
      if (!this.ctx) return;
      const f = FREQS[Math.floor(Math.random() * FREQS.length)];
      const o = this.ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(0.1, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);
      o.connect(g); g.connect(rev); o.start(); o.stop(this.ctx.currentTime + 2.5);
    }, 700 + Math.random() * 1400);
    const w = this._noise("brown"); const wf = this._bpf(480, 0.4); const wg = this._gain(0.08);
    w.connect(wf); wf.connect(wg); wg.connect(m); w.start();
    this.nodes.push(w, { stop: () => { clearInterval(chInt); rev.disconnect(); } });
  }

  playThunder(m) {
    const rain = this._noise("brown"); const rf = this._bpf(2000, 0.3); const rg = this._gain(0.48);
    rain.connect(rf); rf.connect(rg); rg.connect(m); rain.start();
    const tInt = setInterval(() => {
      if (!this.ctx) return;
      const rumble = this._noise("brown"); const tf = this._lpf(140); const tg = this._gain(0);
      tg.gain.setValueAtTime(0, this.ctx.currentTime); tg.gain.linearRampToValueAtTime(0.55, this.ctx.currentTime + 0.15);
      tg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.5);
      rumble.connect(tf); tf.connect(tg); tg.connect(m); rumble.start(); rumble.stop(this.ctx.currentTime + 4);
      this.nodes.push(rumble);
    }, 5000 + Math.random() * 8000);
    this.nodes.push(rain, { stop: () => clearInterval(tInt) });
  }

  play(sceneId, volume = 0.5) {
    this.stop();
    this._init();
    const m = this._master(volume);
    const map = {
      rain: () => this.playRain(m), ocean: () => this.playOcean(m),
      fire: () => this.playFire(m), forest: () => this.playForest(m),
      night: () => this.playNight(m), stream: () => this.playStream(m),
      wind: () => this.playWind(m), thunder: () => this.playThunder(m),
    };
    map[sceneId]?.();
  }

  setVolume(v) {
    if (this.masterGain && this.ctx)
      this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.5);
  }
}