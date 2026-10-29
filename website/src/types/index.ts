export type LightingMode = 'Beat Pulse' | 'Aurora' | 'Breathe' | 'Spectrum' | 'Neon' | 'Static';

export type ColorSource = 'Album Cover' | 'Pure White' | 'Custom Hex' | 'Cyberpunk' | 'Sunset';

export type LyricStyle = 'Kinetic Flow' | 'Spatial 3D' | 'Minimal' | 'Dual Cassette';

export interface ShortcutItem {
  keyCombo: string[];
  action: string;
  category: 'Playback' | 'View' | 'Library';
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InstallStepItem {
  number: number;
  title: string;
  description: string;
  codeSnippet?: string;
  badge?: string;
}
