/**
 * GoOS Sound System
 *
 * Synthesized UI sounds using Web Audio API.
 * Inspired by macOS system sounds but with a unique character.
 * All sounds are generated programmatically - no audio files needed.
 */

type SoundType =
  | 'click'           // Subtle tap for selections
  | 'clickSoft'       // Even softer click for hovers
  | 'pop'             // Satisfying pop for opens/creates
  | 'popReverse'      // Reverse pop for closes
  | 'minimize'        // Swoosh down for minimize
  | 'maximize'        // Rising tone for maximize
  | 'expand'          // Gentle expand sound
  | 'collapse'        // Gentle collapse sound
  | 'drop'            // Thud for dropping files
  | 'drag'            // Subtle pickup sound
  | 'toggle'          // Switch toggle click
  | 'success'         // Positive confirmation
  | 'delete'          // Soft trash sound
  | 'error'           // Gentle error tone
  | 'notification'    // Attention getter
  | 'whoosh'          // Quick transition
  | 'bubble'          // Bubbly pop
  | 'startup'         // System boot chime
  | 'thinkingHum'     // Soft warm hum for AI understanding phase
  | 'typeClick'       // Crisp mechanical typewriter click for planning phase
  | 'materialize'     // Shimmering crystallization for files appearing on desktop
  | 'chime'           // Warm completion arpeggio for build completion
  | 'swooshIn'        // Gentle whoosh inward for cinematic reveal
  | 'voiceReady';     // Soft ping for voice recording activation

// Audio context singleton
let audioContext: AudioContext | null = null;
let isEnabled = true;
let masterVolume = 0.3;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }

  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  return audioContext;
}

// Check if user prefers reduced motion (we'll treat this as sound preference too)
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Play a synthesized sound effect
 */
export function playSound(type: SoundType, options?: { volume?: number }): void {
  if (!isEnabled || prefersReducedMotion()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const volume = (options?.volume ?? 1) * masterVolume;
  const now = ctx.currentTime;

  switch (type) {
    case 'click':
      synthesizeClick(ctx, now, volume);
      break;
    case 'clickSoft':
      synthesizeClick(ctx, now, volume * 0.5);
      break;
    case 'pop':
      synthesizePop(ctx, now, volume);
      break;
    case 'popReverse':
      synthesizePopReverse(ctx, now, volume);
      break;
    case 'minimize':
      synthesizeMinimize(ctx, now, volume);
      break;
    case 'maximize':
      synthesizeMaximize(ctx, now, volume);
      break;
    case 'expand':
      synthesizeExpand(ctx, now, volume);
      break;
    case 'collapse':
      synthesizeCollapse(ctx, now, volume);
      break;
    case 'drop':
      synthesizeDrop(ctx, now, volume);
      break;
    case 'drag':
      synthesizeDrag(ctx, now, volume);
      break;
    case 'toggle':
      synthesizeToggle(ctx, now, volume);
      break;
    case 'success':
      synthesizeSuccess(ctx, now, volume);
      break;
    case 'delete':
      synthesizeDelete(ctx, now, volume);
      break;
    case 'error':
      synthesizeError(ctx, now, volume);
      break;
    case 'notification':
      synthesizeNotification(ctx, now, volume);
      break;
    case 'whoosh':
      synthesizeWhoosh(ctx, now, volume);
      break;
    case 'bubble':
      synthesizeBubble(ctx, now, volume);
      break;
    case 'startup':
      synthesizeStartup(ctx, now, volume);
      break;
    case 'thinkingHum':
      synthesizeThinkingHum(ctx, now, volume);
      break;
    case 'typeClick':
      synthesizeTypeClick(ctx, now, volume);
      break;
    case 'materialize':
      synthesizeMaterialize(ctx, now, volume);
      break;
    case 'chime':
      synthesizeChime(ctx, now, volume);
      break;
    case 'swooshIn':
      synthesizeSwooshIn(ctx, now, volume);
      break;
    case 'voiceReady':
      synthesizeVoiceReady(ctx, now, volume);
      break;
  }
}

// Helper to create a gain node with envelope
function createEnvelope(
  ctx: AudioContext,
  startTime: number,
  attack: number,
  decay: number,
  sustain: number,
  release: number,
  volume: number
): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.linearRampToValueAtTime(volume * sustain, startTime + attack + decay);
  gain.gain.linearRampToValueAtTime(0, startTime + attack + decay + release);
  return gain;
}

// Subtle click - short sine wave burst
function synthesizeClick(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, time);
  osc.frequency.exponentialRampToValueAtTime(1200, time + 0.03);

  gain.gain.setValueAtTime(volume * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.05);
}

// Satisfying pop - rising pitch with slight bounce
function synthesizePop(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, time);
  osc.frequency.exponentialRampToValueAtTime(800, time + 0.05);
  osc.frequency.exponentialRampToValueAtTime(600, time + 0.1);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.5, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.2);
}

// Reverse pop - falling pitch for closing
function synthesizePopReverse(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, time);
  osc.frequency.exponentialRampToValueAtTime(250, time + 0.08);

  gain.gain.setValueAtTime(volume * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

// Minimize - swooshing downward
function synthesizeMinimize(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, time);
  osc.frequency.exponentialRampToValueAtTime(150, time + 0.15);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.exponentialRampToValueAtTime(300, time + 0.15);

  gain.gain.setValueAtTime(volume * 0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.25);
}

// Maximize - rising with fullness
function synthesizeMaximize(ctx: AudioContext, time: number, volume: number): void {
  // Main tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(300, time);
  osc1.frequency.exponentialRampToValueAtTime(600, time + 0.1);
  osc1.frequency.setValueAtTime(600, time + 0.12);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(450, time);
  osc2.frequency.exponentialRampToValueAtTime(900, time + 0.1);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.02);
  gain.gain.setValueAtTime(volume * 0.25, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.25);
  osc2.stop(time + 0.25);
}

// Expand - gentle opening
function synthesizeExpand(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, time);
  osc.frequency.exponentialRampToValueAtTime(700, time + 0.08);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.15);
}

// Collapse - gentle closing
function synthesizeCollapse(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(600, time);
  osc.frequency.exponentialRampToValueAtTime(350, time + 0.08);

  gain.gain.setValueAtTime(volume * 0.25, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

// Drop - soft thud when file lands
function synthesizeDrop(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, time);

  gain.gain.setValueAtTime(volume * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.2);
}

// Drag - light pickup sound
function synthesizeDrag(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, time);
  osc.frequency.exponentialRampToValueAtTime(800, time + 0.03);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.2, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.08);
}

// Toggle - mechanical switch click
function synthesizeToggle(ctx: AudioContext, time: number, volume: number): void {
  // Two quick clicks to simulate switch mechanism
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();

  osc1.type = 'square';
  osc1.frequency.setValueAtTime(2000, time);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1500, time + 0.03);

  gain1.gain.setValueAtTime(volume * 0.15, time);
  gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

  gain2.gain.setValueAtTime(volume * 0.12, time + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

  osc1.connect(gain1);
  osc2.connect(gain2);
  gain1.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time + 0.03);
  osc1.stop(time + 0.03);
  osc2.stop(time + 0.06);
}

// Success - pleasant chord
function synthesizeSuccess(ctx: AudioContext, time: number, volume: number): void {
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

  frequencies.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const delay = i * 0.04;
    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(volume * 0.2, time + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time + delay);
    osc.stop(time + 0.35);
  });
}

// Delete - soft whoosh to trash
function synthesizeDelete(ctx: AudioContext, time: number, volume: number): void {
  // Noise burst with filter sweep
  const bufferSize = ctx.sampleRate * 0.15;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(2000, time);
  filter.frequency.exponentialRampToValueAtTime(200, time + 0.15);
  filter.Q.setValueAtTime(2, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.2);
}

// Error - gentle dissonant tone
function synthesizeError(ctx: AudioContext, time: number, volume: number): void {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(330, time);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(350, time); // Slight detuning for tension

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.02);
  gain.gain.setValueAtTime(volume * 0.25, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.3);
  osc2.stop(time + 0.3);
}

// Notification - attention-getting ding
function synthesizeNotification(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, time); // A5
  osc.frequency.setValueAtTime(1047, time + 0.1); // C6

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.35, time + 0.01);
  gain.gain.setValueAtTime(volume * 0.35, time + 0.08);
  gain.gain.linearRampToValueAtTime(volume * 0.3, time + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.45);
}

// Whoosh - quick transition sound
function synthesizeWhoosh(ctx: AudioContext, time: number, volume: number): void {
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const progress = i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * Math.sin(progress * Math.PI);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(500, time);
  filter.frequency.exponentialRampToValueAtTime(3000, time + 0.05);
  filter.frequency.exponentialRampToValueAtTime(800, time + 0.1);
  filter.Q.setValueAtTime(1, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.2, time);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.12);
}

// Bubble - playful bubbly pop
function synthesizeBubble(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, time);
  osc.frequency.exponentialRampToValueAtTime(600, time + 0.02);
  osc.frequency.exponentialRampToValueAtTime(400, time + 0.08);

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.4, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.15);
}

// Thinking hum - soft, warm, continuous-feeling hum for AI understanding phase
// Low triangle wave ~180Hz with slow envelope, 800ms
function synthesizeThinkingHum(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, time);
  // Gentle vibrato for organic warmth
  osc.frequency.setValueAtTime(180, time);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(4, time); // Slow 4Hz vibrato
  lfoGain.gain.setValueAtTime(3, time);  // ±3Hz deviation
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  // Slow envelope: gentle fade in, sustain, gentle fade out
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.25, time + 0.15);   // Slow attack
  gain.gain.setValueAtTime(volume * 0.25, time + 0.5);             // Sustain
  gain.gain.linearRampToValueAtTime(0, time + 0.8);                // Slow release

  osc.connect(gain);
  gain.connect(ctx.destination);

  lfo.start(time);
  osc.start(time);
  osc.stop(time + 0.85);
  lfo.stop(time + 0.85);
}

// Type click - crisp mechanical typewriter click for planning phase
// High-freq noise burst with bandpass ~3000Hz, very short 30ms decay
function synthesizeTypeClick(ctx: AudioContext, time: number, volume: number): void {
  const bufferSize = Math.ceil(ctx.sampleRate * 0.04);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, time);
  filter.Q.setValueAtTime(5, time); // Tight resonance for that crisp "click" character

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.04);
}

// Materialize - shimmering crystallization sound for files appearing on desktop
// Ascending sweep 400→2000Hz with chorus effect using two detuned oscillators, 400ms
function synthesizeMaterialize(ctx: AudioContext, time: number, volume: number): void {
  // Primary oscillator - ascending sweep
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(400, time);
  osc1.frequency.exponentialRampToValueAtTime(2000, time + 0.3);
  osc1.frequency.exponentialRampToValueAtTime(1800, time + 0.4); // Slight settle at end

  gain1.gain.setValueAtTime(0, time);
  gain1.gain.linearRampToValueAtTime(volume * 0.3, time + 0.03);
  gain1.gain.setValueAtTime(volume * 0.3, time + 0.2);
  gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  // Detuned chorus oscillator - slightly sharp for shimmer
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(404, time);  // +4Hz detune for chorus beating
  osc2.frequency.exponentialRampToValueAtTime(2012, time + 0.3);
  osc2.frequency.exponentialRampToValueAtTime(1810, time + 0.4);

  gain2.gain.setValueAtTime(0, time);
  gain2.gain.linearRampToValueAtTime(volume * 0.2, time + 0.05);
  gain2.gain.setValueAtTime(volume * 0.2, time + 0.2);
  gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  // High sparkle layer for crystalline character
  const sparkle = ctx.createOscillator();
  const sparkleGain = ctx.createGain();

  sparkle.type = 'sine';
  sparkle.frequency.setValueAtTime(800, time + 0.05);
  sparkle.frequency.exponentialRampToValueAtTime(4000, time + 0.3);

  sparkleGain.gain.setValueAtTime(0, time + 0.05);
  sparkleGain.gain.linearRampToValueAtTime(volume * 0.1, time + 0.08);
  sparkleGain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

  sparkle.connect(sparkleGain);
  sparkleGain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  sparkle.start(time + 0.05);
  osc1.stop(time + 0.45);
  osc2.stop(time + 0.45);
  sparkle.stop(time + 0.4);
}

// Chime - warm completion arpeggio for build completion
// C5→E5→G5→C6 arpeggio with triangle waves, each note 150ms with overlap, reverb tail
function synthesizeChime(ctx: AudioContext, time: number, volume: number): void {
  // Create a reverb-like effect for the tail
  const convolver = ctx.createConvolver();
  const reverbTime = 1.2;
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * reverbTime;
  const impulse = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  convolver.buffer = impulse;

  const wetGain = ctx.createGain();
  wetGain.gain.setValueAtTime(0.2, time);

  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(0.8, time);

  convolver.connect(wetGain);
  wetGain.connect(ctx.destination);
  dryGain.connect(ctx.destination);

  // C5 → E5 → G5 → C6 arpeggio
  const notes = [
    { freq: 523.25, delay: 0 },        // C5
    { freq: 659.25, delay: 0.1 },       // E5 (overlaps with C5)
    { freq: 783.99, delay: 0.2 },       // G5 (overlaps with E5)
    { freq: 1046.50, delay: 0.3 },      // C6 (overlaps with G5, bright finish)
  ];

  notes.forEach(({ freq, delay }, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time + delay);

    // Bell-like envelope with 150ms sustain and overlap
    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(volume * 0.3, time + delay + 0.015);
    gain.gain.exponentialRampToValueAtTime(volume * 0.15, time + delay + 0.08);
    // Last note rings longer
    const tailDuration = i === 3 ? 0.6 : 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + tailDuration);

    osc.connect(gain);
    gain.connect(dryGain);
    gain.connect(convolver);

    osc.start(time + delay);
    osc.stop(time + delay + tailDuration + 0.1);
  });
}

// Swoosh in - gentle whoosh inward for cinematic reveal
// Bandpass noise sweep 4000→800Hz, 200ms
function synthesizeSwooshIn(ctx: AudioContext, time: number, volume: number): void {
  const bufferSize = Math.ceil(ctx.sampleRate * 0.25);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Shaped noise: ramp up then down for swoosh envelope
  for (let i = 0; i < bufferSize; i++) {
    const progress = i / bufferSize;
    // Peak at 40% through, then taper - gives the "arriving" feel
    const envelope = progress < 0.4
      ? progress / 0.4
      : Math.pow(1 - (progress - 0.4) / 0.6, 2);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(4000, time);
  filter.frequency.exponentialRampToValueAtTime(800, time + 0.2);
  filter.Q.setValueAtTime(1.5, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.25);
}

// Voice ready - soft ping for voice recording activation
// Pure sine 880Hz, quick 100ms with fade
function synthesizeVoiceReady(ctx: AudioContext, time: number, volume: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, time); // A5

  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(volume * 0.35, time + 0.01);  // Quick attack
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);      // Quick fade

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + 0.12);
}

// Startup - iconic goOS welcome chime
// Memorable 3-note motif: playful, warm, and distinctly "goOS"
function synthesizeStartup(ctx: AudioContext, time: number, volume: number): void {
  // Create a reverb-like effect
  const convolver = ctx.createConvolver();
  const reverbTime = 1.5;
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * reverbTime;
  const impulse = ctx.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  convolver.buffer = impulse;

  // Master gain for wet signal
  const wetGain = ctx.createGain();
  wetGain.gain.setValueAtTime(0.15, time);

  // Dry gain
  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(0.85, time);

  convolver.connect(wetGain);
  wetGain.connect(ctx.destination);
  dryGain.connect(ctx.destination);

  // Iconic 3-note goOS melody: "go-O-S" feel
  // G4 -> Bb4 -> D5 (playful minor with bright ending)
  const notes = [
    { freq: 392.00, delay: 0, duration: 0.4 },      // G4 - "go"
    { freq: 466.16, delay: 0.15, duration: 0.35 },  // Bb4 - "O"
    { freq: 587.33, delay: 0.35, duration: 0.8 },   // D5 - "S" (longer, bright ending)
  ];

  notes.forEach(({ freq, delay, duration }, i) => {
    // Main bell-like tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time + delay);

    // Bell-like envelope: quick attack, smooth decay
    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(volume * 0.5, time + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(volume * 0.25, time + delay + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration);

    osc.connect(gain);
    gain.connect(dryGain);
    gain.connect(convolver);

    osc.start(time + delay);
    osc.stop(time + delay + duration + 0.1);

    // Warm harmonic (octave below, adds richness)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq / 2, time + delay);

    subGain.gain.setValueAtTime(0, time + delay);
    subGain.gain.linearRampToValueAtTime(volume * 0.15, time + delay + 0.03);
    subGain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration * 0.7);

    subOsc.connect(subGain);
    subGain.connect(dryGain);

    subOsc.start(time + delay);
    subOsc.stop(time + delay + duration);

    // Bright sparkle (2 octaves up, very subtle)
    if (i === 2) { // Only on the last note
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();

      sparkle.type = 'sine';
      sparkle.frequency.setValueAtTime(freq * 2, time + delay + 0.1);

      sparkleGain.gain.setValueAtTime(0, time + delay + 0.1);
      sparkleGain.gain.linearRampToValueAtTime(volume * 0.12, time + delay + 0.12);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.5);

      sparkle.connect(sparkleGain);
      sparkleGain.connect(dryGain);
      sparkleGain.connect(convolver);

      sparkle.start(time + delay + 0.1);
      sparkle.stop(time + delay + 0.6);
    }
  });

  // Add a subtle "quack" character at the very end (duck personality!)
  const quackOsc = ctx.createOscillator();
  const quackGain = ctx.createGain();
  const quackFilter = ctx.createBiquadFilter();

  quackOsc.type = 'sawtooth';
  quackOsc.frequency.setValueAtTime(300, time + 0.55);
  quackOsc.frequency.exponentialRampToValueAtTime(200, time + 0.62);
  quackOsc.frequency.exponentialRampToValueAtTime(250, time + 0.65);

  quackFilter.type = 'bandpass';
  quackFilter.frequency.setValueAtTime(800, time + 0.55);
  quackFilter.Q.setValueAtTime(3, time + 0.55);

  quackGain.gain.setValueAtTime(0, time + 0.55);
  quackGain.gain.linearRampToValueAtTime(volume * 0.08, time + 0.57);
  quackGain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

  quackOsc.connect(quackFilter);
  quackFilter.connect(quackGain);
  quackGain.connect(dryGain);

  quackOsc.start(time + 0.55);
  quackOsc.stop(time + 0.75);
}

/**
 * Enable or disable all sounds
 */
export function setSoundEnabled(enabled: boolean): void {
  isEnabled = enabled;
}

/**
 * Check if sounds are enabled
 */
export function isSoundEnabled(): boolean {
  return isEnabled;
}

/**
 * Set master volume (0-1)
 */
export function setMasterVolume(volume: number): void {
  masterVolume = Math.max(0, Math.min(1, volume));
}

/**
 * Get current master volume
 */
export function getMasterVolume(): number {
  return masterVolume;
}

// Export types for TypeScript
export type { SoundType };
