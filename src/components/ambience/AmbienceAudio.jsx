// Web Audio synthesized soundscapes — no external files needed

function createReverb(ctx, duration = 2, decay = 2) {
  const length = ctx.sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let i = 0; i < 2; i++) {
    const channel = impulse.getChannelData(i);
    for (let j = 0; j < length; j++) {
      channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

export class AmbienceEngine {
  constructor() {
    this.ctx = null;
    this.nodes = [];
    this.masterGain = null;
  }

  _initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  stop() {
    this.nodes.forEach((n) => { try { n.stop?.(); n.disconnect?.(); } catch (_) {} });
    this.nodes = [];
    this.masterGain = null;
  }

  _master(volume = 0.5) {
    const ctx = this.ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    gain.connect(ctx.destination);
    this.masterGain = gain;
    return gain;
  }

  _noise(type = "brown") {
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === "brown") {
        data[i] = (last + 0.02 * white) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      } else {
        data[i] = white;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  playRain(master) {
    const ctx = this.ctx;
    // Heavy rain noise
    const rain = this._noise("brown");
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1800;
    rainFilter.Q.value = 0.4;
    const rainGain = ctx.createGain();
    rainGain.gain.value = 0.55;
    rain.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    rain.start();

    // High drizzle layer
    const drizzle = this._noise("white");
    const dFilter = ctx.createBiquadFilter();
    dFilter.type = "highpass";
    dFilter.frequency.value = 4000;
    const dGain = ctx.createGain();
    dGain.gain.value = 0.08;
    drizzle.connect(dFilter);
    dFilter.connect(dGain);
    dGain.connect(master);
    drizzle.start();

    // Thunder rumble LFO
    const rumble = this._noise("brown");
    const rFilter = ctx.createBiquadFilter();
    rFilter.type = "lowpass";
    rFilter.frequency.value = 120;
    const rGain = ctx.createGain();
    rGain.gain.value = 0.3;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(rGain.gain);
    lfo.start();
    rumble.connect(rFilter);
    rFilter.connect(rGain);
    rGain.connect(master);
    rumble.start();

    this.nodes.push(rain, drizzle, rumble, lfo);
  }

  playOcean(master) {
    const ctx = this.ctx;
    // Wave noise
    const wave = this._noise("brown");
    const wFilter = ctx.createBiquadFilter();
    wFilter.type = "lowpass";
    wFilter.frequency.value = 800;
    const wGain = ctx.createGain();
    wGain.gain.value = 0.5;

    // LFO for wave rhythm
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(wGain.gain);
    lfo.start();

    wave.connect(wFilter);
    wFilter.connect(wGain);
    wGain.connect(master);
    wave.start();

    // Foam high-freq
    const foam = this._noise("white");
    const fFilter = ctx.createBiquadFilter();
    fFilter.type = "bandpass";
    fFilter.frequency.value = 3000;
    fFilter.Q.value = 0.6;
    const fGain = ctx.createGain();
    fGain.gain.value = 0.06;
    const fLfo = ctx.createOscillator();
    fLfo.frequency.value = 0.1;
    const fLfoGain = ctx.createGain();
    fLfoGain.gain.value = 0.04;
    fLfo.connect(fLfoGain);
    fLfoGain.connect(fGain.gain);
    fLfo.start();
    foam.connect(fFilter);
    fFilter.connect(fGain);
    fGain.connect(master);
    foam.start();

    this.nodes.push(wave, foam, lfo, fLfo);
  }

  playForest(master) {
    const ctx = this.ctx;
    // Wind base
    const wind = this._noise("brown");
    const wFilter = ctx.createBiquadFilter();
    wFilter.type = "bandpass";
    wFilter.frequency.value = 600;
    wFilter.Q.value = 0.3;
    const wGain = ctx.createGain();
    wGain.gain.value = 0.2;
    wind.connect(wFilter);
    wFilter.connect(wGain);
    wGain.connect(master);
    wind.start();

    // Birds — random chirps using oscillators
    const chirpInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = 2000 + Math.random() * 2000;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
      osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.02);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }, 600 + Math.random() * 1400);

    this.nodes.push(wind, { stop: () => clearInterval(chirpInterval) });
  }

  playFire(master) {
    const ctx = this.ctx;
    // Crackle noise
    const crackle = this._noise("brown");
    const cFilter = ctx.createBiquadFilter();
    cFilter.type = "bandpass";
    cFilter.frequency.value = 1000;
    cFilter.Q.value = 0.5;
    const cGain = ctx.createGain();
    cGain.gain.value = 0.4;
    crackle.connect(cFilter);
    cFilter.connect(cGain);
    cGain.connect(master);
    crackle.start();

    // Low rumble
    const rumble = this._noise("brown");
    const rFilter = ctx.createBiquadFilter();
    rFilter.type = "lowpass";
    rFilter.frequency.value = 200;
    const rGain = ctx.createGain();
    rGain.gain.value = 0.35;
    rumble.connect(rFilter);
    rFilter.connect(rGain);
    rGain.connect(master);
    rumble.start();

    // Pops
    const popInterval = setInterval(() => {
      if (!this.ctx) return;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = 80 + Math.random() * 120;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }, 300 + Math.random() * 700);

    this.nodes.push(crackle, rumble, { stop: () => clearInterval(popInterval) });
  }

  playNight(master) {
    const ctx = this.ctx;
    // Soft wind
    const wind = this._noise("brown");
    const wFilter = ctx.createBiquadFilter();
    wFilter.type = "lowpass";
    wFilter.frequency.value = 400;
    const wGain = ctx.createGain();
    wGain.gain.value = 0.12;
    wind.connect(wFilter);
    wFilter.connect(wGain);
    wGain.connect(master);
    wind.start();

    // Crickets
    const cricketInterval = setInterval(() => {
      if (!this.ctx) return;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 4200 + Math.random() * 400;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime + i * 0.04);
        g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + i * 0.04 + 0.01);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.04 + 0.04);
        osc.connect(g);
        g.connect(master);
        osc.start();
        osc.stop(ctx.currentTime + i * 0.04 + 0.06);
      }
    }, 400);

    this.nodes.push(wind, { stop: () => clearInterval(cricketInterval) });
  }

  playStream(master) {
    const ctx = this.ctx;
    const rev = createReverb(ctx, 1.5, 3);
    rev.connect(master);

    const stream = this._noise("brown");
    const sFilter = ctx.createBiquadFilter();
    sFilter.type = "bandpass";
    sFilter.frequency.value = 900;
    sFilter.Q.value = 0.6;
    const sGain = ctx.createGain();
    sGain.gain.value = 0.45;
    stream.connect(sFilter);
    sFilter.connect(sGain);
    sGain.connect(rev);
    stream.start();

    // Gurgle LFO
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(sFilter.frequency);
    lfo.start();

    this.nodes.push(stream, lfo, { stop: () => rev.disconnect() });
  }

  playWind(master) {
    const ctx = this.ctx;
    const rev = createReverb(ctx, 3, 2);
    rev.connect(master);

    // Chime tones
    const CHIME_FREQS = [523, 659, 784, 988, 1047];
    const chimeInterval = setInterval(() => {
      if (!this.ctx) return;
      const freq = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
      osc.connect(g);
      g.connect(rev);
      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    }, 800 + Math.random() * 1500);

    // Soft wind
    const wind = this._noise("brown");
    const wFilter = ctx.createBiquadFilter();
    wFilter.type = "bandpass";
    wFilter.frequency.value = 500;
    wFilter.Q.value = 0.4;
    const wGain = ctx.createGain();
    wGain.gain.value = 0.1;
    wind.connect(wFilter);
    wFilter.connect(wGain);
    wGain.connect(master);
    wind.start();

    this.nodes.push(wind, { stop: () => { clearInterval(chimeInterval); rev.disconnect(); } });
  }

  playThunder(master) {
    const ctx = this.ctx;
    // Heavy rain
    const rain = this._noise("brown");
    const rFilter = ctx.createBiquadFilter();
    rFilter.type = "bandpass";
    rFilter.frequency.value = 2000;
    rFilter.Q.value = 0.3;
    const rGain = ctx.createGain();
    rGain.gain.value = 0.5;
    rain.connect(rFilter);
    rFilter.connect(rGain);
    rGain.connect(master);
    rain.start();

    // Thunder booms
    const thunderInterval = setInterval(() => {
      if (!this.ctx) return;
      const rumble = this._noise("brown");
      const tFilter = ctx.createBiquadFilter();
      tFilter.type = "lowpass";
      tFilter.frequency.value = 150;
      const tGain = ctx.createGain();
      tGain.gain.setValueAtTime(0, ctx.currentTime);
      tGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.1);
      tGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      rumble.connect(tFilter);
      tFilter.connect(tGain);
      tGain.connect(master);
      rumble.start();
      rumble.stop(ctx.currentTime + 4);
      this.nodes.push(rumble);
    }, 4000 + Math.random() * 8000);

    this.nodes.push(rain, { stop: () => clearInterval(thunderInterval) });
  }

  play(sceneId, volume = 0.5) {
    this.stop();
    const ctx = this._initCtx();
    const master = this._master(volume);
    const fn = {
      rain: () => this.playRain(master),
      ocean: () => this.playOcean(master),
      forest: () => this.playForest(master),
      fire: () => this.playFire(master),
      night: () => this.playNight(master),
      stream: () => this.playStream(master),
      wind: () => this.playWind(master),
      thunder: () => this.playThunder(master),
    }[sceneId];
    fn?.();
  }

  setVolume(v) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.5);
    }
  }
}