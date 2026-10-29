import React, { useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AppWindowMockup } from './AppWindowMockup';
import { Play, Sparkles, Sun, Monitor } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const Showcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      index: '01',
      title: 'Kinetic Lyrics at 120 FPS',
      subtitle: 'Word-by-word spring-damped motion',
      description:
        'Spring-damped word-by-word animated lyrics, always centered at 50vh. Intelligent instrumental detection automatically pulses subtle "···" dots during solos and drops.',
      icon: Sparkles,
      mockupProps: {
        lightingMode: 'Beat Pulse',
        customHex: '#fb6e90',
        lyricStyle: 'Kinetic Flow',
        glowIntensity: 70,
        isOverlayMode: false,
      },
    },
    {
      index: '02',
      title: '4 Distinct Lyric Styles',
      subtitle: 'Kinetic, 3D Wall, Minimal & Cassette',
      description:
        'Tailor your visual rhythm: Kinetic Flow for fluid bouncy typography, Spatial 3D Perspective Wall for angled depth, Minimal for uncluttered purity, or Dual Subtitle Cassette.',
      icon: Play,
      mockupProps: {
        lightingMode: 'Spectrum',
        customHex: '#a855f7',
        lyricStyle: 'Spatial 3D',
        glowIntensity: 85,
        isOverlayMode: false,
      },
    },
    {
      index: '03',
      title: 'Audio-Reactive Halo Lighting',
      subtitle: 'Edge-lit halo pulsing to the beat',
      description:
        'Window edges illuminate with live audio reactivity. Choose from 6 modes (Beat Pulse, Aurora, Breathe, Spectrum, Neon, Static) and color palettes from Album Art to Cyberpunk.',
      icon: Sun,
      mockupProps: {
        lightingMode: 'Aurora',
        customHex: '#00f2fe',
        lyricStyle: 'Kinetic Flow',
        glowIntensity: 100,
        isOverlayMode: false,
      },
    },
    {
      index: '04',
      title: 'Smoky Glass Desktop Overlay',
      subtitle: 'Press T for translucent float',
      description:
        'Press T anytime to trigger a floating translucent smoky glass desktop mini-player. 0.42 alpha with frosted glass blur lets your lyrics float gracefully over your desktop wallpaper.',
      icon: Monitor,
      mockupProps: {
        lightingMode: 'Neon',
        customHex: '#fb6e90',
        lyricStyle: 'Kinetic Flow',
        glowIntensity: 90,
        isOverlayMode: true,
      },
    },
  ];

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 1024;

    if (prefersReducedMotion || isMobile) {
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=2400',
        pin: pinWrapperRef.current,
        scrub: 0.5,
        onUpdate: (self) => {
          const stepIndex = Math.min(
            Math.floor(self.progress * steps.length),
            steps.length - 1
          );
          setCurrentStep(stepIndex);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [steps.length]);

  const activeStepData = steps[currentStep];

  return (
    <section
      id="showcase"
      ref={sectionRef}
      className="relative bg-neutral py-16 lg:py-0"
      aria-label="See it in action showcase"
    >
      <div
        ref={pinWrapperRef}
        className="lg:min-h-screen flex flex-col justify-center max-w-7xl mx-auto px-6 py-12 lg:py-20"
      >
        {/* Section Header */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            See It In Action
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Designed for the rhythm of your eyes.
          </h2>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Step Navigation & Details */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            {/* Step Progress Line */}
            <div className="relative w-full h-1 bg-surface-2 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>

            {/* Step Tabs for direct interactive selection */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
              {steps.map((s, idx) => (
                <button
                  key={s.index}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentStep === idx
                      ? 'bg-primary text-surface font-extrabold shadow-sm'
                      : 'bg-surface-2 text-tertiary hover:text-secondary'
                  }`}
                  aria-label={`Show ${s.title}`}
                >
                  <span>{s.index}</span>
                  <span className="hidden sm:inline">{s.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Step Details */}
            <div className="min-h-[220px] transition-all duration-300">
              <span className="text-xs uppercase font-mono font-bold tracking-widest text-primary-80">
                Step {activeStepData.index} · {activeStepData.subtitle}
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-secondary mt-2 mb-4 leading-tight">
                {activeStepData.title}
              </h3>
              <p className="text-base sm:text-body-md text-tertiary leading-relaxed">
                {activeStepData.description}
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic State Mockup */}
          <div className="lg:col-span-7 relative">
            {/* If Overlay Mode is active, show wallpaper behind it */}
            <div
              className={`rounded-[34px] p-2 transition-all duration-700 relative overflow-hidden ${
                activeStepData.mockupProps.isOverlayMode
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-rose-950 p-4 sm:p-6 shadow-2xl border border-white/20'
                  : ''
              }`}
            >
              {activeStepData.mockupProps.isOverlayMode && (
                <div className="absolute top-3 left-6 text-[10px] font-mono uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <Monitor className="w-3 h-3 text-primary" />
                  <span>Windows 11 Desktop Wallpaper Simulation</span>
                </div>
              )}

              <AppWindowMockup
                lightingMode={activeStepData.mockupProps.lightingMode}
                customHex={activeStepData.mockupProps.customHex}
                lyricStyle={activeStepData.mockupProps.lyricStyle}
                glowIntensity={activeStepData.mockupProps.glowIntensity}
                isOverlayMode={activeStepData.mockupProps.isOverlayMode}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
