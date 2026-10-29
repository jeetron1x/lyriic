import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

gsap.registerPlugin(ScrollTrigger);

interface FinalCtaProps {
  onOpenDownload: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onOpenDownload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) return;

      // Scrubbed scale / fade on heading
      if (headingRef.current) {
        gsap.fromTo(
          headingRef.current,
          { scale: 0.92, opacity: 0.6 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              end: 'center center',
              scrub: 1,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Subtle magnetic hover on primary pill (max ~12px)
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = primaryButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Limit drift to max 12px
    const maxDrift = 12;
    const clampedX = Math.max(-maxDrift, Math.min(maxDrift, x * 0.2));
    const clampedY = Math.max(-maxDrift, Math.min(maxDrift, y * 0.2));

    btn.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const btn = primaryButtonRef.current;
    if (!btn) return;
    btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
  };

  return (
    <section
      ref={containerRef}
      className="py-28 sm:py-36 bg-neutral relative text-center overflow-hidden"
      aria-label="Download call to action"
    >
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Subtle accent badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>Experience Lyriic Today</span>
        </div>

        {/* Large Display Headline with scrubbed scale */}
        <h2
          ref={headingRef}
          className="font-display font-extrabold text-headline-lg tracking-tight text-secondary leading-tight max-w-4xl"
        >
          Ready to light up your music?
        </h2>

        <p className="mt-6 text-base sm:text-body-lg text-tertiary max-w-xl mx-auto font-medium">
          Download the latest Windows installer or grab the portable ZIP. Free,
          open-source, and zero tracking.
        </p>

        {/* Action Button Cluster */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary Pill with Magnetic Hover */}
          <button
            ref={primaryButtonRef}
            onClick={onOpenDownload}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full sm:w-auto min-w-[234px] h-[52px] px-7 py-3.5 rounded-full bg-secondary text-surface-2 font-bold text-label-lg transition-transform duration-150 ease-out flex items-center justify-center gap-2 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Download className="w-5 h-5" />
            <span>Download for Windows</span>
          </button>

          {/* Secondary Pill */}
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

        {/* Fine Print Caption */}
        <p className="mt-5 text-xs text-tertiary/70 font-sans tracking-wide">
          Free and open source · Windows 10 or 11 · v1.0.0
        </p>
      </div>
    </section>
  );
};
