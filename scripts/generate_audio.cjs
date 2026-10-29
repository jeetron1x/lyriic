// scripts/generate_audio.cjs
// Synthesizes 3 high quality PCM WAV stereo audio files for bundled demo songs
const fs = require('fs');
const path = require('path');

function createWavBuffer(samplesL, samplesR, sampleRate = 44100) {
  const numSamples = samplesL.length;
  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-1, Math.min(1, samplesL[i]));
    const sR = Math.max(-1, Math.min(1, samplesR[i]));
    const intL = sL < 0 ? Math.round(sL * 32768) : Math.round(sL * 32767);
    const intR = sR < 0 ? Math.round(sR * 32768) : Math.round(sR * 32767);
    buffer.writeInt16LE(intL, offset);
    buffer.writeInt16LE(intR, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Generate Track 1: Echoes of Starlight (Dreamy ambient chillwave)
function generateEchoesOfStarlight(durationSec = 52, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Chord progression: Dm7 -> Bbmaj7 -> Fmaj7 -> Cmaj7 (soothing, expansive)
  // Frequencies in Hz:
  const chordNotes = [
    [146.83, 220.00, 261.63, 349.23], // Dm7: D3, A3, C4, F4
    [116.54, 233.08, 293.66, 349.23], // Bbmaj7: Bb2, Bb3, D4, F4
    [174.61, 261.63, 329.63, 392.00], // Fmaj7: F3, C4, E4, G4
    [130.81, 196.00, 261.63, 329.63]  // Cmaj7: C3, G3, C4, E4
  ];

  const chordDuration = 6.5; // seconds per chord
  const arpegNotes = [440, 523.25, 587.33, 659.25, 698.46, 783.99, 880];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor((t % (chordDuration * 4)) / chordDuration);
    const chordTime = (t % chordDuration) / chordDuration;
    const curChord = chordNotes[chordIdx];

    // Warm envelope
    const env = Math.sin(chordTime * Math.PI) * 0.45;

    // Pad synth: rich detuned sines & gentle triangles
    let pad = 0;
    for (let c = 0; c < curChord.length; c++) {
      const freq = curChord[c];
      pad += Math.sin(2 * Math.PI * freq * t) * 0.15;
      pad += Math.sin(2 * Math.PI * (freq * 1.004) * t) * 0.10;
      pad += Math.sin(2 * Math.PI * (freq * 0.996) * t) * 0.10;
    }

    // Melodic high bell / pluck
    const step = Math.floor(t * 3.5);
    const note = arpegNotes[(step * 3 + chordIdx * 2) % arpegNotes.length];
    const noteTime = (t * 3.5) % 1.0;
    const pluckEnv = Math.exp(-noteTime * 4.0) * 0.22;
    const pluck = Math.sin(2 * Math.PI * note * t) * pluckEnv;

    // Sub-bass
    const bassFreq = curChord[0] * 0.5;
    const bass = Math.sin(2 * Math.PI * bassFreq * t) * 0.25;

    // Gentle stereo panning
    const panOffset = Math.sin(t * 0.3) * 0.2;
    left[i] = (pad * env + pluck * (0.8 - panOffset) + bass) * 0.7;
    right[i] = (pad * env + pluck * (0.8 + panOffset) + bass) * 0.7;
  }

  return { left, right };
}

// Generate Track 2: Midnight Rain (Smoky Lo-Fi / Jazz Rhodes)
function generateMidnightRain(durationSec = 52, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Chords: Ebmaj9 -> Cm9 -> Fm9 -> Bb13 (classic smoky mood)
  const chords = [
    [155.56, 233.08, 293.66, 349.23, 440.00], // Ebmaj9
    [130.81, 196.00, 261.63, 311.13, 392.00], // Cm9
    [174.61, 261.63, 311.13, 392.00, 440.00], // Fm9
    [116.54, 207.65, 293.66, 349.23, 440.00]  // Bb13
  ];

  const chordDuration = 6.5;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor((t % (chordDuration * 4)) / chordDuration);
    const chordTime = (t % chordDuration) / chordDuration;
    const curChord = chords[chordIdx];

    // Rhodes tremolo
    const tremolo = 1.0 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t);
    const env = Math.exp(-chordTime * 1.8) * 0.6 + 0.15;

    let rhodes = 0;
    for (let c = 0; c < curChord.length; c++) {
      const f = curChord[c];
      rhodes += Math.sin(2 * Math.PI * f * t) * 0.14;
      rhodes += Math.sin(2 * Math.PI * f * 2 * t) * 0.04;
      rhodes += Math.sin(2 * Math.PI * f * 3 * t) * 0.015;
    }
    rhodes *= tremolo * env;

    // Warm sub bass
    const bass = Math.sin(2 * Math.PI * (curChord[0] * 0.5) * t) * 0.28;

    // Subtle soft rain / vinyl crackle texture
    const noise = (Math.random() * 2 - 1) * 0.015;

    left[i] = (rhodes * 0.75 + bass + noise) * 0.7;
    right[i] = (rhodes * 0.8 + bass - noise) * 0.7;
  }

  return { left, right };
}

// Generate Track 3: Velvet Neon (Atmospheric Indie Electronic)
function generateVelvetNeon(durationSec = 52, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const left = new Float32Array(numSamples);
  const right = new Float32Array(numSamples);

  // Chords: Am7 -> Fmaj7 -> Em7 -> G
  const chords = [
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [164.81, 196.00, 246.94, 329.63], // Em7
    [196.00, 246.94, 293.66, 392.00]  // G
  ];

  const chordDuration = 6.5;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIdx = Math.floor((t % (chordDuration * 4)) / chordDuration);
    const chordTime = (t % chordDuration) / chordDuration;
    const curChord = chords[chordIdx];

    // Pulsing sidechain pad
    const beatTime = (t * 2) % 1.0;
    const sidechain = 0.4 + 0.6 * Math.pow(beatTime, 0.7);

    let synth = 0;
    for (let c = 0; c < curChord.length; c++) {
      const f = curChord[c];
      synth += Math.sin(2 * Math.PI * f * t) * 0.16;
      synth += Math.sin(2 * Math.PI * (f * 2.01) * t) * 0.08;
    }

    // Melodic arp
    const arpIdx = Math.floor(t * 4) % curChord.length;
    const arpF = curChord[arpIdx] * 2;
    const arpEnv = Math.exp(-((t * 4) % 1.0) * 5) * 0.2;
    const arp = Math.sin(2 * Math.PI * arpF * t) * arpEnv;

    const bass = Math.sin(2 * Math.PI * (curChord[0] * 0.5) * t) * 0.3;

    left[i] = (synth * sidechain * 0.6 + arp * 0.7 + bass) * 0.7;
    right[i] = (synth * sidechain * 0.6 + arp * 0.9 + bass) * 0.7;
  }

  return { left, right };
}

console.log('Synthesizing demo tracks...');
const outDir = path.join(__dirname, '..', 'src', 'renderer', 'assets', 'audio');
fs.mkdirSync(outDir, { recursive: true });

const t1 = generateEchoesOfStarlight();
fs.writeFileSync(path.join(outDir, 'echoes-of-starlight.wav'), createWavBuffer(t1.left, t1.right));
console.log('✓ Created echoes-of-starlight.wav');

const t2 = generateMidnightRain();
fs.writeFileSync(path.join(outDir, 'midnight-rain.wav'), createWavBuffer(t2.left, t2.right));
console.log('✓ Created midnight-rain.wav');

const t3 = generateVelvetNeon();
fs.writeFileSync(path.join(outDir, 'velvet-neon.wav'), createWavBuffer(t3.left, t3.right));
console.log('✓ Created velvet-neon.wav');
