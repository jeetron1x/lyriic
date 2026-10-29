import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface InstallStepsProps {
  onOpenDownload: () => void;
}

export const InstallSteps: React.FC<InstallStepsProps> = ({ onOpenDownload }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const steps = [
    {
      num: '01',
      title: 'Download Lyriic-Setup-1.0.0.exe',
      description:
        'Grab the official Windows installer directly or download the portable ZIP archive from GitHub Releases.',
      cta: 'Direct Exe Download',
      ctaUrl: 'https://github.com/jeetron1x/lyriic/releases/download/v1.0.0/Lyriic-Setup-1.0.0.exe',
      portableUrl: 'https://github.com/jeetron1x/lyriic/releases/download/v1.0.0/Lyriic-1.0.0-win.zip',
    },
    {
      num: '02',
      title: 'Run the setup wizard',
      description:
        'Launch the installer. Installs cleanly in seconds without admin rights, bloatware, or registry clutter.',
      badge: 'Windows 10 & 11 (64-bit)',
    },
    {
      num: '03',
      title: 'Add your songs',
      description:
        'Drag and drop single music tracks or import your entire music folder library (MP3, FLAC, WAV, AAC, OGG, M4A).',
      badge: 'Local Files & Folders',
    },
    {
      num: '04',
      title: 'Press Space to play',
      description:
        'Sit back and watch your lyrics move. Hit F for immersive full-screen view or T for the translucent smoky glass overlay.',
      badge: 'Shortcuts: Space, F, T',
    },
  ];

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion || !pathRef.current) return;

      const path = pathRef.current;
      const length = path.getTotalLength();

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom 85%',
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="install"
      ref={containerRef}
      className="py-24 sm:py-32 bg-neutral relative overflow-hidden"
      aria-label="Installation guide"
    >
      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <Download className="w-3.5 h-3.5" />
            Fast Setup
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Install in four steps.
          </h2>
          <p className="mt-3 text-base sm:text-body-lg text-tertiary">
            Get up and running in under sixty seconds.
          </p>
        </div>

        {/* Vertical Stepper with Scroll-Drawn SVG Line */}
        <div className="relative">
          {/* Scroll-drawn SVG Line */}
          <div className="hidden md:block absolute left-8 top-10 bottom-10 w-0.5">
            {/* Background subtle line */}
            <div className="w-full h-full bg-white/5" />
            <svg
              className="absolute top-0 left-0 w-8 h-full overflow-visible pointer-events-none -translate-x-[3px]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={pathRef}
                d="M 4 0 L 4 1000"
                stroke="#fb6e90"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Step Cards List */}
          <div className="space-y-8 sm:space-y-12">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col md:flex-row items-start gap-6 sm:gap-10 p-6 sm:p-10 rounded-[34px] bg-surface border border-border-subtle hover:border-primary/30 transition-colors"
              >
                {/* Step Number Circle */}
                <div className="w-16 h-16 rounded-full bg-surface-2 border border-white/10 flex items-center justify-center font-display font-extrabold text-xl text-primary flex-shrink-0 z-10 shadow-md">
                  {step.num}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-secondary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base text-tertiary leading-relaxed mb-4 max-w-2xl">
                    {step.description}
                  </p>

                  {/* Actions for Step 1 (Download buttons) */}
                  {step.cta && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <a
                        href={step.ctaUrl}
                        download
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-secondary text-surface-2 text-xs font-bold hover:bg-white transition-all shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Lyriic-Setup-1.0.0.exe</span>
                      </a>
                      <a
                        href={step.portableUrl}
                        download
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-full border border-border-strong text-secondary text-xs font-semibold hover:bg-white/5 transition-all"
                      >
                        <span>Portable ZIP</span>
                      </a>
                      <button
                        onClick={onOpenDownload}
                        className="text-xs text-primary hover:underline font-semibold ml-2"
                      >
                        More release assets &rarr;
                      </button>
                    </div>
                  )}

                  {/* Badges for other steps */}
                  {step.badge && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-xs font-mono text-tertiary border border-white/5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                      <span>{step.badge}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about portable ZIP */}
        <div className="mt-12 text-center text-xs text-tertiary">
          <span>Prefer a portable setup? </span>
          <a
            href="https://github.com/jeetron1x/lyriic/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-semibold"
          >
            Download the standalone Portable ZIP on GitHub Releases
          </a>
          <span>. No installer required.</span>
        </div>
      </div>
    </section>
  );
};
