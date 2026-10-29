import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  Sparkles,
  Minus,
  Square,
  X,
  Music2,
} from 'lucide-react';

interface AppWindowMockupProps {
  className?: string;
  lightingMode?: string;
  colorSource?: string;
  customHex?: string;
  lyricStyle?: string;
  glowIntensity?: number;
  isOverlayMode?: boolean;
}

export const AppWindowMockup: React.FC<AppWindowMockupProps> = ({
  className = '',
  lightingMode = 'Beat Pulse',
  customHex = '#fb6e90',
  lyricStyle = 'Kinetic Flow',
  glowIntensity = 80,
  isOverlayMode = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [trackProgress, setTrackProgress] = useState(38);

  const lyricsLines = [
    {
      words: ['Signals', 'traveling', 'in', 'the', 'midnight', 'rain'],
      time: '01:14',
    },
    {
      words: ['Cascading', 'through', 'the', 'frosted', 'glass', 'again'],
      time: '01:22',
    },
    {
      words: ['We', 'are', 'echoes', 'dancing', 'on', 'the', 'digital', 'vein'],
      time: '01:30',
    },
    {
      words: ['Breathing', 'light', 'where', 'shadows', 'used', 'to', 'remain'],
      time: '01:38',
    },
  ];

  // Looping lyric word & line progression
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTrackProgress((prev) => (prev >= 98 ? 10 : prev + 0.8));

      setActiveWordIndex((prevWord) => {
        const currentLine = lyricsLines[activeLineIndex];
        if (prevWord + 1 < currentLine.words.length) {
          return prevWord + 1;
        } else {
          // Switch to next line or trigger instrumental
          setActiveLineIndex((prevLine) => {
            const nextLine = (prevLine + 1) % lyricsLines.length;
            if (nextLine === 0) {
              setIsInstrumental(true);
              setTimeout(() => setIsInstrumental(false), 2400);
            }
            return nextLine;
          });
          return 0;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isPlaying, activeLineIndex, lyricsLines.length]);

  // Halo glow style calculation
  const getHaloBorderColor = () => {
    if (customHex) return customHex;
    return '#fb6e90';
  };

  const haloColor = getHaloBorderColor();
  const intensityFactor = glowIntensity / 100;

  return (
    <div
      className={`relative w-full rounded-[24px] sm:rounded-[34px] transition-all duration-700 select-none ${
        isOverlayMode
          ? 'bg-neutral/45 backdrop-blur-2xl border-white/20'
          : 'bg-surface border-white/10'
      } ${className}`}
      style={{
        boxShadow: isOverlayMode
          ? `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${haloColor}${Math.round(
              intensityFactor * 40
            ).toString(16)}`
          : `0 25px 50px -12px rgba(0,0,0,0.8), 0 0 ${Math.round(
              intensityFactor * 30
            )}px ${haloColor}${Math.round(intensityFactor * 50).toString(16)}`,
        border: `1px solid ${
          lightingMode === 'Neon'
            ? haloColor
            : `rgba(255, 255, 255, ${isOverlayMode ? 0.2 : 0.1})`
        }`,
      }}
    >
      {/* Edge-lit Window Halo Border Animation */}
      <div
        className="absolute inset-0 rounded-[24px] sm:rounded-[34px] pointer-events-none transition-opacity duration-700"
        style={{
          border: `1.5px solid ${haloColor}`,
          opacity:
            lightingMode === 'Beat Pulse'
              ? 0.75 + Math.sin(Date.now() / 200) * 0.25
              : intensityFactor * 0.6,
        }}
      />

      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 bg-surface-2/40 rounded-t-[24px] sm:rounded-t-[34px]">
        {/* App Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <span className="text-xs font-semibold text-secondary tracking-wide flex items-center gap-2">
            Lyriic
            <span className="text-[10px] text-tertiary px-1.5 py-0.5 rounded bg-white/5 font-mono">
              v1.0.0
            </span>
          </span>
          <span className="text-white/20 text-xs hidden sm:inline">|</span>
          <span className="text-xs text-tertiary truncate max-w-[140px] sm:max-w-xs hidden sm:inline">
            Resonance in Neon — Synthetica
          </span>
        </div>

        {/* Windows Window Controls */}
        <div className="flex items-center gap-3 text-tertiary">
          <button
            className="p-1 hover:text-secondary hover:bg-white/5 rounded"
            aria-label="Minimize window"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 hover:text-secondary hover:bg-white/5 rounded"
            aria-label="Maximize window"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:text-error hover:bg-white/5 rounded"
            aria-label="Close window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Player Content Area */}
      <div className="p-6 sm:p-10 flex flex-col min-h-[380px] sm:min-h-[460px] justify-between relative overflow-hidden">
        {/* Album Artwork & Metadata Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-tr from-primary-20 via-surface-2 to-primary/40 border border-white/10 flex items-center justify-center shadow-lg group">
              <Music2 className="w-7 h-7 text-primary-80 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-secondary flex items-center gap-2">
                Resonance in Neon
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-20 text-primary-80 border border-primary/20 hidden sm:inline-flex">
                  FLAC 96kHz
                </span>
              </h4>
              <p className="text-xs sm:text-sm text-tertiary">Synthetica · Cyber Dreams</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-mono px-3 py-1 rounded-full bg-primary-20 border border-primary/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">{lyricStyle}</span>
              <span className="text-secondary/60">120 FPS</span>
            </span>
          </div>
        </div>

        {/* Dynamic Kinetic Lyric Canvas Area */}
        <div className="my-8 py-6 flex flex-col items-center justify-center text-center relative">
          {isInstrumental ? (
            /* Instrumental Detection View */
            <div className="flex flex-col items-center gap-3 py-8 animate-fadeIn">
              <span className="text-xs uppercase tracking-widest text-primary-80 font-bold">
                Instrumental Break
              </span>
              <div className="flex items-center gap-2 text-primary">
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          ) : (
            /* Kinetic Word-by-Word Lyric Lines */
            <div
              className={`w-full max-w-2xl transition-transform duration-500 ${
                lyricStyle === 'Spatial 3D'
                  ? 'perspective-[800px] rotate-x-[12deg] skew-y-[-1deg]'
                  : ''
              }`}
            >
              {/* Previous Line */}
              <p className="text-sm sm:text-base text-tertiary/40 font-medium tracking-tight mb-3 transition-all duration-500">
                {lyricsLines[(activeLineIndex - 1 + lyricsLines.length) % lyricsLines.length]
                  .words.join(' ')}
              </p>

              {/* Active Line (Word-by-word Spring kinetic highlight) */}
              <div className="text-xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight leading-snug my-2 min-h-[3.5rem] flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3.5">
                {lyricsLines[activeLineIndex].words.map((word, wIdx) => {
                  const isCurrent = wIdx === activeWordIndex;
                  const isPast = wIdx < activeWordIndex;

                  return (
                    <span
                      key={`${activeLineIndex}-${wIdx}`}
                      className={`inline-block transition-all duration-300 transform ${
                        isCurrent
                          ? 'text-primary scale-110 -translate-y-1 drop-shadow-[0_0_12px_rgba(251,110,144,0.7)]'
                          : isPast
                          ? 'text-secondary'
                          : 'text-tertiary/40 scale-100'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>

              {/* Next Line */}
              <p className="text-sm sm:text-base text-tertiary/50 font-medium tracking-tight mt-3 transition-all duration-500">
                {lyricsLines[(activeLineIndex + 1) % lyricsLines.length].words.join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Playback Controls & Scrubber Footer */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-tertiary">01:24</span>
            <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 group-hover:bg-primary-80"
                style={{ width: `${trackProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-tertiary">03:45</span>
          </div>

          {/* Bottom Bar: Action Controls & Status */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-tertiary">
              <button
                className="p-2 hover:text-secondary hover:bg-white/5 rounded-full transition-colors"
                aria-label="Shuffle"
              >
                <Shuffle className="w-4 h-4 text-primary" />
              </button>
              <button
                className="p-2 hover:text-secondary hover:bg-white/5 rounded-full transition-colors"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-secondary text-surface-2 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                className="p-2 hover:text-secondary hover:bg-white/5 rounded-full transition-colors"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:text-secondary hover:bg-white/5 rounded-full transition-colors"
                aria-label="Repeat track"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-tertiary">
              <div className="hidden sm:flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-tertiary rounded-full" />
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] text-tertiary/70 font-mono">
                <kbd className="text-[10px] px-1.5 py-0.5">T</kbd>
                <span>Desktop Overlay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
