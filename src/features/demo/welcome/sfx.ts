// The welcome's sounds (11 Nov, #/demo/welcome-liquid): all made live with the Web Audio API, no files, so they are
// tiny and never fail to load. Calm on purpose ("grounded, quietly confident"): soft keys, one warm note per line in
// A major pentatonic, a small chime on Start, a filtered breath of air for the flood. Nothing plays until the
// visitor turns the sound on (browsers only allow audio after a click), and the choice is remembered.

const KEY = 'spark-welcome-sound';
const NOTES = [440, 493.88, 554.37, 659.25, 739.99, 880]; // A4 B4 C#5 E5 F#5 A5

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let on = false;

export function soundPref(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === null ? null : v === 'on';
  } catch {
    return null;
  }
}

/** Call from the click that turns sound on or off. */
export function setSound(v: boolean) {
  on = v;
  try {
    localStorage.setItem(KEY, v ? 'on' : 'off');
  } catch {
    /* this visit only */
  }
  if (!v) return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  ctx ??= new AC();
  void ctx.resume();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
  }
  if (!noise) {
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
}

function ready() {
  return on && ctx && master && noise ? { c: ctx, out: master, n: noise } : null;
}

/** An envelope: up fast to `peak`, down over `fall` seconds. */
function env(c: AudioContext, at: number, peak: number, rise: number, fall: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + rise);
  g.gain.exponentialRampToValueAtTime(0.0001, at + rise + fall);
  return g;
}

function tone(type: OscillatorType, freq: number, at: number, peak: number, fall: number, glideTo?: number) {
  const r = ready();
  if (!r) return;
  const o = r.c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, at + fall);
  const g = env(r.c, at, peak, 0.005, fall);
  o.connect(g).connect(r.out);
  o.start(at);
  o.stop(at + fall + 0.05);
}

function hiss(filter: BiquadFilterType, freq: number, q: number, at: number, peak: number, fall: number, sweepTo?: number) {
  const r = ready();
  if (!r) return;
  const s = r.c.createBufferSource();
  s.buffer = r.n;
  const f = r.c.createBiquadFilter();
  f.type = filter;
  f.frequency.setValueAtTime(freq, at);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + fall);
  f.Q.value = q;
  const g = env(r.c, at, peak, Math.min(0.02, fall / 4), fall);
  s.connect(f).connect(g).connect(r.out);
  s.start(at, Math.random() * 0.5);
  s.stop(at + fall + 0.05);
}

const now = () => ctx?.currentTime ?? 0;

/** One typed key: a soft click and a low tap, a little different each time. */
export function key() {
  const t = now();
  hiss('bandpass', 2400 + Math.random() * 1400, 1.2, t, 0.12 + Math.random() * 0.05, 0.03);
  tone('sine', 130 + Math.random() * 30, t, 0.06, 0.05);
}

/** The end of a typed line: one warm note, rising through the scale line by line. */
export function line(i: number) {
  const t = now();
  tone('triangle', NOTES[i % NOTES.length], t, 0.07, 0.35);
}

/** Sound turned on: two notes, a fifth apart. */
export function soundOn() {
  const t = now();
  tone('sine', NOTES[0], t, 0.09, 0.25);
  tone('sine', NOTES[3], t + 0.09, 0.08, 0.4);
}

/** Start pressed: a small four-note chime, high and quick. */
export function chime() {
  const t = now();
  [1318.51, 1661.22, 1975.53, 2637.02].forEach((f, i) => tone('sine', f, t + i * 0.05, 0.045, 0.5));
}

/** The flood opening onto the portal: air that rises, and a low bloom under it. */
export function flood(seconds = 1.1) {
  const t = now();
  hiss('bandpass', 260, 0.9, t, 0.14, seconds, 2400);
  tone('sine', 110, t, 0.08, seconds * 1.2, 220);
}

/** A soft tick for hovering the buttons. */
export function tick() {
  tone('sine', 1760, now(), 0.025, 0.05);
}

/** The card pouring itself into Dr.AI: a liquid swell. Air rising through a narrow filter, a low tone gliding up
 *  with a slow wobble (the liquid), and three bright drops as it settles into his shape. */
export function morph(seconds = 1.3) {
  const r = ready();
  if (!r) return;
  const t = r.c.currentTime;
  hiss('bandpass', 420, 2.2, t, 0.1, seconds, 3200);
  const o = r.c.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(170, t);
  o.frequency.exponentialRampToValueAtTime(560, t + seconds);
  const lfo = r.c.createOscillator();
  lfo.frequency.value = 7;
  const depth = r.c.createGain();
  depth.gain.value = 18;
  lfo.connect(depth).connect(o.frequency);
  const g = env(r.c, t, 0.09, seconds * 0.6, seconds * 0.5);
  o.connect(g).connect(r.out);
  o.start(t);
  lfo.start(t);
  o.stop(t + seconds * 1.2);
  lfo.stop(t + seconds * 1.2);
  [0.78, 0.9, 1].forEach((k, i) => tone('sine', [1046.5, 1318.51, 1567.98][i], t + seconds * k, 0.035, 0.22));
}

/** The metal clearing to Dr.AI himself: a soft pop and a warm two-note bloom under a high shimmer. */
export function appear() {
  const t = now();
  tone('sine', 880, t, 0.08, 0.12, 440);
  tone('triangle', NOTES[0], t + 0.04, 0.07, 0.6);
  tone('triangle', NOTES[3], t + 0.12, 0.06, 0.7);
  [2093, 2637.02, 3135.96].forEach((f, i) => tone('sine', f, t + 0.08 + i * 0.04, 0.02, 0.35));
}

/** Dr.AI's voice while he types his hello: a short, friendly blip that moves around a small melody. */
const VOICE = [392, 440, 493.88, 440, 523.25, 493.88, 587.33, 523.25];
export function talk(i: number) {
  const t = now();
  const f = VOICE[i % VOICE.length] * (0.98 + Math.random() * 0.04);
  tone('triangle', f, t, 0.045, 0.07, f * 1.08);
  tone('sine', f * 2, t, 0.012, 0.05);
}

/** Dr.AI floating off to his corner in his bubble: a soft rising breath of air with a gentle shimmer on top. */
export function drift(seconds = 1.4) {
  const t = now();
  hiss('bandpass', 700, 1.4, t, 0.07, seconds, 1800);
  [1318.51, 1567.98].forEach((f, i) => tone('sine', f, t + 0.1 + i * 0.12, 0.018, 0.6));
}

/** The bubble breaking as he lands: a small wet pop and a bright tick. */
export function pop() {
  const t = now();
  tone('sine', 520, t, 0.09, 0.08, 1400);
  hiss('highpass', 4200, 0.8, t, 0.06, 0.04);
  tone('sine', 2093, t + 0.03, 0.025, 0.12);
}
