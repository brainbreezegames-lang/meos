/**
 * StadiumAudio - fully procedural stadium soundscape (WebAudio, no sample files).
 *
 * Layers:
 *  - ambience: filtered noise "crowd murmur" with slow swells
 *  - roar:     noise burst + detuned "ooooh" chord, used on goals / big moments
 *  - horn:     air-horn (3 detuned saws through a low-pass)
 *  - whistle:  referee whistle with vibrato
 *  - claps:    rhythmic crowd clapping (during waves / chants)
 *
 * Everything is routed through a master gain so the game can mute / duck it.
 * Replace any layer with a real recording later by swapping the node in `playBuffer`.
 */
export type Team = 'red' | 'blue';

export class StadiumAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private ambienceGain!: GainNode;
  private noiseBuffer!: AudioBuffer;
  private started = false;
  private muted = false;
  private clapTimer: number | null = null;
  volume = 0.8;

  get running() {
    return this.started && !!this.ctx && this.ctx.state === 'running';
  }

  /** Must be called from a user gesture (click / key). Safe to call repeatedly. */
  async start() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      // gentle compressor so roars never clip
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 20;
      comp.ratio.value = 6;
      comp.attack.value = 0.01;
      comp.release.value = 0.35;
      this.master.connect(comp).connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise(4);
      this.buildAmbience();
    }
    if (this.ctx.state !== 'running') await this.ctx.resume();
    this.started = true;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(m ? 0 : this.volume, this.ctx.currentTime + 0.15);
    }
  }

  dispose() {
    if (this.clapTimer) window.clearInterval(this.clapTimer);
    this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }

  // ------------------------------------------------------------------ layers
  private makeNoise(seconds: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      // pink-ish noise (Paul Kellet's filter) reads much more like a crowd than white noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  private noiseSource(loop = true) {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = loop;
    return src;
  }

  private buildAmbience() {
    const ctx = this.ctx!;
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.value = 0.55;
    this.ambienceGain.connect(this.master);

    // wide murmur bed
    const bed = this.noiseSource();
    const bedLP = ctx.createBiquadFilter();
    bedLP.type = 'lowpass';
    bedLP.frequency.value = 900;
    bedLP.Q.value = 0.4;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.5;
    bed.connect(bedLP).connect(bedGain).connect(this.ambienceGain);
    bed.start();

    // "voices" band with slow random swells (two LFOs at incommensurate rates)
    const voices = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 520;
    bp.Q.value = 0.9;
    const vg = ctx.createGain();
    vg.gain.value = 0.35;
    voices.connect(bp).connect(vg).connect(this.ambienceGain);
    voices.start();
    for (const [rate, depth] of [[0.07, 0.12], [0.19, 0.08]] as const) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rate;
      const lg = ctx.createGain();
      lg.gain.value = depth;
      lfo.connect(lg).connect(vg.gain);
      lfo.start();
    }
    // occasional distant drum / thump so it never feels static
    const thump = () => {
      if (!this.ctx) return;
      this.kick(0.25 + Math.random() * 0.2, 0.18);
      window.setTimeout(thump, 2200 + Math.random() * 4000);
    };
    window.setTimeout(thump, 1500);
  }

  /** Crowd excitement 0..1 -> raises the ambience bed. */
  setExcitement(level: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.ambienceGain.gain.cancelScheduledValues(t);
    this.ambienceGain.gain.linearRampToValueAtTime(0.45 + level * 0.6, t + 0.4);
  }

  /** Big crowd roar (goal, save, kickoff). intensity 0..1 */
  roar(intensity = 1, duration = 3.5) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = this.noiseSource();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.7;
    bp.frequency.setValueAtTime(450, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 0.35);
    bp.frequency.exponentialRampToValueAtTime(700, t + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * intensity, t + 0.25);
    g.gain.setValueAtTime(0.9 * intensity, t + 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.1);

    // "oooh" vowel chord: detuned saws through a formant-ish band-pass
    const chord = ctx.createGain();
    chord.gain.setValueAtTime(0.0001, t);
    chord.gain.exponentialRampToValueAtTime(0.09 * intensity, t + 0.3);
    chord.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.8);
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.value = 380;
    formant.Q.value = 1.4;
    chord.connect(formant).connect(this.master);
    for (const f of [110, 146.8, 164.8, 220]) {
      for (const det of [-9, 0, 7]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = det + (Math.random() - 0.5) * 8;
        o.connect(chord);
        o.start(t);
        o.stop(t + duration);
      }
    }
  }

  horn(duration = 1.4) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1300;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.06);
    g.gain.setValueAtTime(0.35, t + duration - 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    lp.connect(g).connect(this.master);
    for (const f of [174.6, 220, 261.6]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f * 0.97, t);
      o.frequency.exponentialRampToValueAtTime(f, t + 0.12);
      o.connect(lp);
      o.start(t);
      o.stop(t + duration);
    }
  }

  whistle(pattern: 'short' | 'long' | 'triple' = 'long') {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime;
    const blows = pattern === 'triple' ? [[0, 0.22], [0.3, 0.22], [0.6, 0.6]] : pattern === 'short' ? [[0, 0.25]] : [[0, 0.9]];
    for (const [off, len] of blows) {
      const t = t0 + off;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 2650;
      const vib = ctx.createOscillator();
      vib.frequency.value = 38;
      const vg = ctx.createGain();
      vg.gain.value = 90;
      vib.connect(vg).connect(o.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.setValueAtTime(0.18, t + len - 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(this.master);
      o.start(t); vib.start(t);
      o.stop(t + len); vib.stop(t + len);
    }
  }

  private kick(gain = 0.3, len = 0.2) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(38, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + len + 0.02);
  }

  private clap(gain = 0.25) {
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const src = this.noiseSource(false);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500 + Math.random() * 600;
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t, Math.random() * 3);
    src.stop(t + 0.12);
  }

  /** Rhythmic crowd clapping (the classic "clap-clap, clap-clap-clap") for n seconds. */
  clapChant(seconds = 6) {
    if (!this.ctx) return;
    if (this.clapTimer) window.clearInterval(this.clapTimer);
    const pattern = [1, 1, 0, 1, 1, 1, 0, 0];
    let i = 0;
    const end = performance.now() + seconds * 1000;
    this.clapTimer = window.setInterval(() => {
      if (performance.now() > end || !this.ctx) {
        if (this.clapTimer) window.clearInterval(this.clapTimer);
        this.clapTimer = null;
        return;
      }
      if (pattern[i % pattern.length]) {
        this.clap(0.3);
        window.setTimeout(() => this.clap(0.2), 18);
        window.setTimeout(() => this.clap(0.15), 41);
      }
      i++;
    }, 250);
  }

  goalCelebration(_team: Team) {
    this.roar(1, 4.2);
    window.setTimeout(() => this.horn(1.6), 150);
    window.setTimeout(() => this.clapChant(6), 1500);
    this.setExcitement(1);
    window.setTimeout(() => this.setExcitement(0.25), 7000);
  }
}
