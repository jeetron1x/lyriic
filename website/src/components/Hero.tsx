import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { AppWindowMockup } from './AppWindowMockup';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onOpenDownload: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenDownload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const ctaClusterRef = useRef<HTMLDivElement>(null);
  const mockupWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Show statically without motion
        return;
      }

      // 1. Per-letter mask reveal for "Lyriic"
      const letters = headlineRef.current?.querySelectorAll('.hero-letter');
      if (letters && letters.length > 0) {
        gsap.fromTo(
          letters,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.05,
            ease: 'power4.out',
            delay: 0.1,
          }
        );
      }

      // 2. Sub-copy and CTA cluster fade-up
      gsap.fromTo(
        [subcopyRef.current, ctaClusterRef.current],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.45,
        }
      );

      // 3. Mockup entrance animation & scrubbed parallax on scroll
      if (mockupWrapperRef.current) {
        gsap.fromTo(
          mockupWrapperRef.current,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.65,
          }
        );

        // Scrubbed parallax on scroll
        gsap.to(mockupWrapperRef.current, {
          y: -50,
          ease: 'none',
          scrollTrigger: {
            trigger: mockupWrapperRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroWord = 'Lyriic';

  return (
    <section
      ref={containerRef}
      className="relative pt-28 sm:pt-36 md:pt-44 pb-16 sm:pb-24 overflow-hidden text-center"
      aria-label="Introduction"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-tertiary mb-6 sm:mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-secondary">v1.0.0 Official Release</span>
          <span className="text-white/20">·</span>
          <span>Windows 10 / 11</span>
        </div>

        {/* Per-letter Reveal Display Headline */}
        <h1
          ref={headlineRef}
          className="font-display font-extrabold text-headline-display tracking-tight text-secondary leading-none select-none overflow-hidden pb-2"
          aria-label="Lyriic"
        >
          {heroWord.split('').map((letter, idx) => (
            <span
              key={idx}
              className="inline-block overflow-hidden align-top"
            >
              <span className="hero-letter inline-block">
                {letter}
              </span>
            </span>
          ))}
          <span className="inline-block text-primary">.</span>
        </h1>

        {/* Sub-copy */}
        <p
          ref={subcopyRef}
          className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-body-lg text-tertiary leading-relaxed font-medium"
        >
          A Windows music player with kinetic lyrics, ambient lighting and smoky
          glass. See your music move.
        </p>

        {/* CTA Cluster */}
        <div
          ref={ctaClusterRef}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <button
            onClick={onOpenDownload}
            className="w-full sm:w-auto min-w-[234px] h-[52px] px-7 py-3.5 rounded-full bg-secondary text-surface-2 font-bold text-label-lg hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Download className="w-5 h-5" />
            <span>Download for Windows</span>
          </button>

          {/* Secondary CTA */}
          <a
            href="https://github.com/jeetron1x/lyriic"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto min-w-[234px] h-[52px] px-7 py-3.5 rounded-full border border-border-strong text-secondary font-bold text-label-lg hover:bg-white/5 hover:border-primary/50 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <GithubIcon className="w-5 h-5" />
            <span>Star on GitHub</span>
          </a>
        </div>

        {/* Fine Print Under CTAs */}
        <p className="mt-4 text-xs text-tertiary/70 font-sans tracking-wide">
          Free and open source · Windows 10 or 11 · v1.0.0
        </p>

        {/* Hero App Mockup Window */}
        <div
          ref={mockupWrapperRef}
          className="w-full max-w-5xl mt-14 sm:mt-20 relative"
        >
          <AppWindowMockup
            lightingMode="Beat Pulse"
            customHex="#fb6e90"
            lyricStyle="Kinetic Flow"
            glowIntensity={80}
          />
        </div>
      </div>
    </section>
  );
};
