import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { TopBanner } from './components/TopBanner';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarqueeStrip } from './components/MarqueeStrip';
import { Showcase } from './components/Showcase';
import { Playground } from './components/Playground';
import { FeatureCards } from './components/FeatureCards';
import { Shortcuts } from './components/Shortcuts';
import { InstallSteps } from './components/InstallSteps';
import { FaqAccordion } from './components/FaqAccordion';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { DownloadModal } from './components/DownloadModal';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
    });

    // Update ScrollTrigger on Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    // Wire Lenis into GSAP ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Refresh ScrollTrigger after fonts are ready
    if ('fonts' in document) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral text-secondary font-sans selection:bg-primary-20 selection:text-primary-80 flex flex-col">
      {/* 0. Slim Top Banner */}
      <TopBanner />

      {/* 1. Navbar */}
      <Navbar onOpenDownload={() => setIsDownloadOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero */}
        <Hero onOpenDownload={() => setIsDownloadOpen(true)} />

        {/* 3. Marquee Strip */}
        <MarqueeStrip />

        {/* 4. See it in Action Pinned Showcase */}
        <Showcase />

        {/* 5. Make it Yours Interactive Playground */}
        <Playground />

        {/* 6. Feature Cards */}
        <FeatureCards />

        {/* 7. Keyboard Shortcuts */}
        <Shortcuts />

        {/* 8. Install in Four Steps */}
        <InstallSteps onOpenDownload={() => setIsDownloadOpen(true)} />

        {/* 9. FAQ Accordion */}
        <FaqAccordion />

        {/* 10. Final CTA */}
        <FinalCta onOpenDownload={() => setIsDownloadOpen(true)} />
      </main>

      {/* 11. Footer */}
      <Footer />

      {/* Direct Download & Release Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
};

export default App;
