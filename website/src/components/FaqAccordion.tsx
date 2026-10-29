import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { FaqItem } from '../types';

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'What is Lyriic?',
      answer:
        'Lyriic is a modern open-source Windows music player crafted for kinetic word-by-word synchronized lyrics, audio-reactive ambient halo lighting, and a translucent smoky glass desktop overlay. It runs natively on Windows 10 and 11.',
    },
    {
      question: 'Is Lyriic free?',
      answer:
        'Yes, Lyriic is 100% free and open source released under the permissive MIT license. There are no subscriptions, no paywalls, no ads, and no premium tiers.',
    },
    {
      question: 'Does Lyriic collect any data or telemetry?',
      answer:
        'Zero telemetry. Lyriic operates entirely offline on your local machine. It has no user accounts, no analytics tracking, no crash telemetry reporting to third parties, and makes no unsolicited outbound network calls.',
    },
    {
      question: 'Which audio formats are supported?',
      answer:
        'Lyriic supports all major local audio formats: MP3, FLAC (lossless up to 24-bit/192kHz), WAV, AAC, OGG, and M4A. You can drag and drop individual songs or import whole folder hierarchies seamlessly.',
    },
    {
      question: 'What are the system requirements?',
      answer:
        'Lyriic runs on Windows 10 (64-bit) and Windows 11 (64-bit). It requires no dedicated GPU or heavy 3D hardware; all lyric animations and ambient glows are optimized for efficient 60-120 FPS rendering on modern Windows PCs.',
    },
    {
      question: 'Is there a portable version available?',
      answer:
        'Yes! Alongside the standard Windows setup installer (Lyriic-Setup-1.0.0.exe), we publish a standalone portable ZIP archive (Lyriic-1.0.0-win.zip) on our GitHub Releases page. Extract it anywhere and run without installation.',
    },
    {
      question: 'How do I report a bug or request a feature?',
      answer:
        'Because Lyriic is open source, all bug reports, feature suggestions, and contributions are tracked openly on GitHub Issues at github.com/jeetron1x/lyriic/issues.',
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 bg-surface/30 border-t border-border-subtle"
      aria-label="Frequently Asked Questions"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-xs font-semibold text-primary mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked
          </div>
          <h2 className="text-3xl sm:text-headline-md font-display font-extrabold text-secondary tracking-tight">
            Common questions.
          </h2>
          <p className="mt-3 text-base sm:text-body-lg text-tertiary">
            Everything you need to know about Lyriic and how it works.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-heading-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={faq.question}
                className={`rounded-[24px] border transition-colors ${
                  isOpen
                    ? 'bg-surface border-primary/40'
                    : 'bg-surface/60 border-border-subtle hover:border-white/20'
                }`}
              >
                <h3>
                  <button
                    id={headingId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(index)}
                    className="w-full flex items-center justify-between p-6 sm:p-7 text-left font-display font-bold text-lg sm:text-xl text-secondary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[24px]"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`ml-4 p-1.5 rounded-full bg-surface-2 border border-white/10 text-tertiary transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={`grid transition-all duration-300 ease-in-out px-6 sm:px-7 ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 pb-6 sm:pb-7'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm sm:text-body-md text-tertiary leading-relaxed pt-2 border-t border-white/5">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
