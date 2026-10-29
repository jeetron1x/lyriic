import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Menu, X, Download } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

interface NavbarProps {
  onOpenDownload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDownload }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Add hairline border after 40px
      if (currentScrollY > 40) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Showcase', href: '#showcase' },
    { label: 'Playground', href: '#playground' },
    { label: 'Shortcuts', href: '#shortcuts' },
    { label: 'Install', href: '#install' },
    { label: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const topOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-neutral transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${hasScrolled ? 'border-b border-border-subtle shadow-sm' : 'border-b border-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1"
            aria-label="Lyriic home"
          >
            <Logo size="md" />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-sm font-medium text-tertiary hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1.5 py-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/jeetron1x/lyriic"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-tertiary hover:text-secondary hover:bg-surface-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="GitHub repository"
            >
              <GithubIcon className="w-5 h-5" />
            </a>

            {/* Compact Primary Pill Button */}
            <button
              onClick={onOpenDownload}
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-secondary text-surface-2 font-bold text-sm hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenDownload}
              className="inline-flex items-center justify-center h-9 px-4 rounded-full bg-secondary text-surface-2 font-bold text-xs"
            >
              Download
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-secondary hover:bg-surface-2 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral flex flex-col justify-between p-8 md:hidden animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-border-subtle pb-6">
            <Logo size="md" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-tertiary hover:text-secondary rounded-full"
              aria-label="Close menu"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex flex-col gap-6 py-8" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-2xl font-display font-bold text-secondary hover:text-primary transition-colors py-2 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-border-subtle flex flex-col gap-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownload();
              }}
              className="w-full h-[52px] rounded-full bg-secondary text-surface-2 font-bold text-base flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download for Windows
            </button>

            <a
              href="https://github.com/jeetron1x/lyriic"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[52px] rounded-full border border-border-strong text-secondary font-bold text-base flex items-center justify-center gap-2 hover:bg-white/5"
            >
              <GithubIcon className="w-5 h-5" />
              Star on GitHub
            </a>
          </div>
        </div>
      )}
    </>
  );
};
