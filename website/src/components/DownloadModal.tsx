import React, { useEffect } from 'react';
import { X, Download, FolderArchive, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-surface border border-white/10 rounded-[34px] p-6 sm:p-10 shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-tertiary hover:text-secondary hover:bg-surface-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close download modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-20 text-primary-80 text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Official Release v1.0.0
          </div>
          <h3 id="download-modal-title" className="text-2xl sm:text-3xl font-display font-bold text-secondary">
            Get Lyriic for Windows
          </h3>
          <p className="text-tertiary text-sm mt-1">
            Compatible with Windows 10 and Windows 11 (64-bit). 100% free, local & open source.
          </p>
        </div>

        {/* Download Options */}
        <div className="space-y-4">
          {/* Primary Installer */}
          <a
            href="https://github.com/jeetron1x/lyriic/releases/download/v1.0.0/Lyriic-Setup-1.0.0.exe"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-2 border border-white/10 hover:border-primary/50 transition-all group"
            download
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-secondary group-hover:text-primary transition-colors">
                    Windows Installer (.exe)
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary-80">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-tertiary mt-0.5">
                  Lyriic-Setup-1.0.0.exe · Fast setup with auto-shortcuts
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-tertiary">~78 MB</span>
            </div>
          </a>

          {/* Portable Zip */}
          <a
            href="https://github.com/jeetron1x/lyriic/releases/download/v1.0.0/Lyriic-1.0.0-win.zip"
            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-2/60 border border-white/10 hover:border-white/20 transition-all group"
            download
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-tertiary group-hover:text-secondary group-hover:scale-105 transition-all">
                <FolderArchive className="w-6 h-6" />
              </div>
              <div>
                <span className="font-display font-semibold text-secondary group-hover:text-primary-80 transition-colors">
                  Portable ZIP Archive
                </span>
                <p className="text-xs text-tertiary mt-0.5">
                  Lyriic-1.0.0-win.zip · Extract and run directly without install
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-mono text-tertiary">~82 MB</span>
            </div>
          </a>
        </div>

        {/* Security & Guarantee Info */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 gap-3 text-xs text-tertiary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Zero Telemetry · 100% Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>MIT License · Open Source</span>
          </div>
        </div>

        {/* View on Releases Link */}
        <div className="mt-6 text-center">
          <a
            href="https://github.com/jeetron1x/lyriic/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-tertiary hover:text-primary transition-colors"
          >
            <span>View all assets & changelog on GitHub Releases</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
