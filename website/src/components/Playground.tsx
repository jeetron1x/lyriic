import React, { useState } from 'react';
import type { LightingMode, ColorSource, LyricStyle } from '../types';
import { AppWindowMockup } from './AppWindowMockup';
import { Palette, Activity, Layers, Monitor, Sliders } from 'lucide-react';

export const Playground: React.FC = () => {
  const [lightingMode, setLightingMode] = useState<LightingMode>('Aurora');
  const [colorSource, setColorSource] = useState<ColorSource>('Cyberpunk');
  const [customHex, setCustomHex] = useState('#fb6e90');
  const [lyricStyle, setLyricStyle] = useState<LyricStyle>('Kinetic Flow');
  const [glowIntensity, setGlowIntensity] = useState(85);

  const lightingModes: LightingMode[] = [
    'Beat Pulse',
    'Aurora',
    'Breathe',
    'Spectrum',
    'Neon',
    'Static',
  ];

  const colorSources: { name: ColorSource; hex: string }[] = [
    { name: 'Album Cover', hex: '#fb6e90' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Cyberpunk', hex: '#00f2fe' },
    { name: 'Sunset', hex: '#ff5e62' },
    { name: 'Custom Hex', hex: customHex },
  ];

  const lyricStyles: LyricStyle[] = [
    'Kinetic Flow',
    'Spatial 3D',
    'Minimal',
    'Dual Cassette',
  ];

  // Resolve current active color
  const resolveColor = () => {
    const found = colorSources.find((c) => c.name === colorSource);
    if (colorSource === 'Custom Hex') return customHex;
    return found ? found.hex : '#fb6e90';
  };

  const featureRows = [
    {
      title: 'Any color you like',
      description:
        'Extract palette from your album art or dial in custom hex shades to match your setup.',
      icon: Palette,
    },
    {
      title: 'Moves with the beat',
      description:
        '6 real-time audio reactive halo modes that pulse with the rhythm and cadence.',
      icon: Activity,
    },
    {
      title: 'Lyrics in 4 styles',
      description:
        'From kinetic bouncy typography to 3D perspective depth and dual cassette subtitles.',
      icon: Layers,
    },
    {
      title: 'Glass over your desktop',
      description:
        'A featherlight 0.42 alpha frosted overlay that never blocks your workflow. Just hit T.',
      icon: Monitor,
    },
  ];

  return (
    <section
      id="playground"
      className="py-20 sm:py-28 bg-neutral relative overflow-hidden"
      aria-label="Interactive Playground"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Interactive Playground
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Make it yours.
          </h2>
          <p className="mt-4 text-base sm:text-body-lg text-tertiary">
            Customize the ambient window glow, lyric animation engines, and color
            harmonies in real-time.
          </p>
        </div>

        {/* Control Panel Card + Live Preview Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Working Control Panel Card */}
          <div className="lg:col-span-5 bg-surface border border-border-subtle rounded-[34px] p-6 sm:p-10 flex flex-col gap-7">
            {/* 1. Lighting Mode Chips */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-tertiary block mb-3 font-semibold">
                Ambient Lighting Mode
              </label>
              <div className="flex flex-wrap gap-2">
                {lightingModes.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLightingMode(mode)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                      lightingMode === mode
                        ? 'bg-secondary text-surface-2 font-bold shadow-sm'
                        : 'bg-surface-2 text-tertiary hover:text-secondary hover:bg-white/5'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Source Chips */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-tertiary block mb-3 font-semibold">
                Color Source
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {colorSources.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setColorSource(col.name)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                      colorSource === col.name
                        ? 'bg-secondary text-surface-2 font-bold shadow-sm'
                        : 'bg-surface-2 text-tertiary hover:text-secondary hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}

                {/* Custom Color Picker Input */}
                {colorSource === 'Custom Hex' && (
                  <div className="flex items-center gap-2 mt-2 w-full pt-2 border-t border-white/5">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-8 h-8 rounded-full border-0 cursor-pointer bg-transparent p-0"
                      aria-label="Pick custom hex color"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => setCustomHex(e.target.value)}
                      className="w-28 px-3 py-1 text-xs font-mono rounded-full bg-surface-2 border border-white/10 text-secondary uppercase"
                      aria-label="Custom hex code"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 3. Lyric Style Chips */}
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-tertiary block mb-3 font-semibold">
                Lyric Layout Engine
              </label>
              <div className="flex flex-wrap gap-2">
                {lyricStyles.map((style) => (
                  <button
                    key={style}
                    onClick={() => setLyricStyle(style)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                      lyricStyle === style
                        ? 'bg-primary text-surface font-extrabold shadow-sm'
                        : 'bg-surface-2 text-tertiary hover:text-secondary hover:bg-white/5'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Glow Intensity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-tertiary mb-3">
                <span className="font-semibold">Halo Intensity</span>
                <span className="text-secondary font-bold">{glowIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(Number(e.target.value))}
                className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Glow Intensity"
              />
            </div>
          </div>

          {/* Live Preview Window Beside It */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <AppWindowMockup
                lightingMode={lightingMode}
                customHex={resolveColor()}
                lyricStyle={lyricStyle}
                glowIntensity={glowIntensity}
                isOverlayMode={false}
              />
            </div>
          </div>
        </div>

        {/* 4 Short Feature Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 sm:mt-24">
          {featureRows.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-6 sm:p-8 rounded-[24px] bg-surface/60 border border-border-subtle flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-primary mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-secondary mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-tertiary leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
