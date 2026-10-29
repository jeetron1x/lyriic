import React from 'react';
import { Logo } from './Logo';
import { Heart } from 'lucide-react';
import { GithubIcon, InstagramIcon, LinkedinIcon } from './SocialIcons';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-border-subtle py-16 text-tertiary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Logo size="md" />
            <p className="text-sm text-tertiary/80 max-w-sm leading-relaxed mt-2">
              Windows music player with kinetic word-by-word animated lyrics,
              audio-reactive ambient lighting, and a translucent smoky glass desktop
              overlay.
            </p>
            <div className="flex items-center gap-2 text-xs text-tertiary mt-2">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
              <span>by</span>
              <a
                href="https://github.com/jeetron1x"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary font-bold underline transition-colors"
              >
                Jeetron1x
              </a>
            </div>
          </div>

          {/* Project Links */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-secondary font-bold mb-1">
              Project & Releases
            </span>
            <a
              href="https://github.com/jeetron1x/lyriic/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-secondary transition-colors"
            >
              Releases & Downloads (v1.0.0)
            </a>
            <a
              href="https://github.com/jeetron1x/lyriic/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-secondary transition-colors"
            >
              Report an Issue / Bug
            </a>
            <a
              href="https://github.com/jeetron1x/lyriic/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-secondary transition-colors"
            >
              License (MIT)
            </a>
            <a
              href="https://github.com/jeetron1x/lyriic/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-secondary transition-colors"
            >
              Security Policy
            </a>
          </div>

          {/* Creator & Socials */}
          <div className="md:col-span-3 flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-secondary font-bold mb-1">
              Connect
            </span>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://github.com/jeetron1x"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-secondary transition-colors group"
              >
                <GithubIcon className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                <span>github.com/jeetron1x</span>
              </a>
              <a
                href="https://instagram.com/jeetu.sfx"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-secondary transition-colors group"
              >
                <InstagramIcon className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                <span>@jeetu.sfx</span>
              </a>
              <a
                href="https://www.linkedin.com/in/jeet-kumar-sarkar-329656418"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm hover:text-secondary transition-colors group"
              >
                <LinkedinIcon className="w-4 h-4 text-tertiary group-hover:text-primary transition-colors" />
                <span>Jeet Kumar Sarkar</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-tertiary/60 gap-4">
          <p>&copy; 2026 Jeetron1x. Free and open source software under MIT.</p>
          <div className="flex items-center gap-4">
            <span>Windows 10 / 11</span>
            <span>·</span>
            <span>Version 1.0.0</span>
            <span>·</span>
            <span className="text-primary font-mono">100% Local</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
