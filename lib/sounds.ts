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
  | 'startup';        // System boot chime

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

// Startup - warm system boot chime (ascending arpeggio)
function synthesizeStartup(ctx: AudioContext, time: number, volume: number): void {
  // Create a warm, memorable startup chime with ascending notes
  // Notes: C4 -> E4 -> G4 -> C5 (major arpeggio)
  const notes = [
    { freq: 261.63, delay: 0 },      // C4
    { freq: 329.63, delay: 0.12 },   // E4
    { freq: 392.00, delay: 0.24 },   // G4
    { freq: 523.25, delay: 0.36 },   // C5
  ];

  notes.forEach(({ freq, delay }) => {
    // Main tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time + delay);

    // Soft attack, smooth decay
    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(volume * 0.35, time + delay + 0.05);
    gain.gain.exponentialRampToValueAtTime(volume * 0.15, time + delay + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time + delay);
    osc.stop(time + delay + 0.9);

    // Add subtle harmonic (fifth above, very quiet)
    const harmonic = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 1.5, time + delay);

    harmonicGain.gain.setValueAtTime(0, time + delay);
    harmonicGain.gain.linearRampToValueAtTime(volume * 0.08, time + delay + 0.05);
    harmonicGain.gain.exponentialRampToValueAtTime(0.001, time + delay + 0.5);

    harmonic.connect(harmonicGain);
    harmonicGain.connect(ctx.destination);

    harmonic.start(time + delay);
    harmonic.stop(time + delay + 0.6);
  });
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
