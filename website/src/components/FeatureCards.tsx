import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ListMusic, HardDrive, Keyboard, ShieldOff } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FeatureCardData {
  title: string;
  tagline: string;
  description: string;
  badge: string;
  icon: React.ElementType;
  specs: string[];
}

export const FeatureCards: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const features: FeatureCardData[] = [
    {
      title: 'Playlists & Smart Queue',
      tagline: 'Instant queue manipulation',
      description:
        'Craft unlimited playlists and control your playback order with intelligent "+ Queue" and "Play Next" actions. Reorder tracks on the fly with fluid drag-and-drop.',
      badge: 'Smart Queue',
      icon: ListMusic,
      specs: ['Unlimited Playlists', 'Play Next Priority', 'Reorderable Queue Panel'],
    },
    {
      title: 'Local Files & Formats',
      tagline: 'High fidelity audio playback',
      description:
        'Built for your personal music collection. Seamless drag-and-drop import for individual audio files or entire folder directories with zero cloud lag.',
      badge: 'Wide Format Support',
      icon: HardDrive,
      specs: ['MP3, FLAC, WAV', 'AAC, OGG, M4A', 'Drag & Drop Folder Import'],
    },
    {
      title: 'Keyboard-First Control',
      tagline: 'Muscle memory precision',
      description:
        'Operate every facet of Lyriic without lifting your fingers from the keyboard. Seek, volume, fullscreen, queue, and overlay mode all mapped to instant tactile keys.',
      badge: 'Zero Mouse Friction',
      icon: Keyboard,
      specs: ['Space Play/Pause', 'T Desktop Overlay', 'F/F11 Fullscreen Lyrics'],
    },
    {
      title: '100% Local, Zero Telemetry',
      tagline: 'Private by fundamental design',
      description:
        'Lyriic has no user accounts, no analytic pings, no internet tracking, and no external telemetry calls. Your library stays strictly on your machine.',
      badge: '100% Offline',
      icon: ShieldOff,
      specs: ['Zero Analytics', 'No Account Required', 'MIT Open Source'],
    },
  ];

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      const validCards = cardsRef.current.filter(Boolean);
      gsap.fromTo(
        validCards,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    const card = cardsRef.current[index];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-24 sm:py-32 bg-neutral relative"
      aria-label="Features"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Core Architecture
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Crafted for pure local listening.
          </h2>
          <p className="mt-4 text-base sm:text-body-lg text-tertiary">
            Zero cloud dependence. Lightning fast response times. Pure acoustic
            fidelity on Windows.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                ref={(el) => (cardsRef.current[idx] = el)}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                className="group relative rounded-[34px] bg-surface p-8 sm:p-12 md:p-[56px] border border-border-subtle flex flex-col justify-between overflow-hidden transition-all duration-300"
                style={
                  {
                    '--mouse-x': '50%',
                    '--mouse-y': '50%',
                  } as React.CSSProperties
                }
              >
                {/* Cursor-follow radial border highlight (border only, no big glow) */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[34px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(251, 110, 144, 0.4), transparent 70%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                  }}
                />

                {/* Top Row: Icon & Tag */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-white/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-surface-2 text-tertiary border border-white/5">
                    {feat.badge}
                  </span>
                </div>

                {/* Body Content */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-secondary mb-3 group-hover:text-primary-80 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-base text-tertiary leading-relaxed mb-6 font-normal">
                    {feat.description}
                  </p>
                </div>

                {/* Specs List */}
                <div className="pt-6 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {feat.specs.map((spec) => (
                    <div
                      key={spec}
                      className="text-xs font-mono text-tertiary/80 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
