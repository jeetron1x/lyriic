// src/renderer/js/lyrics-engine.js
// Advanced kinetic typography, Spatial 3D & Dual Subtitle lyrics engine for Lyriic

export class LyricsEngine {
  constructor(options = {}) {
    this.container = options.container;
    this.listElement = options.listElement;
    this.overlayWordElement = options.overlayWordElement;
    this.onSeek = options.onSeek || (() => {});
    
    this.lines = [];
    this.activeIndex = -1;
    this.offset = 0;
    this.style = 'verci'; // 'verci', 'spatial', 'minimal', 'dual'
    this.alignment = 'left';
    this.focusPosition = 42; // percent from top
    this.glowLevel = 'radiant';
    this.reducedMotion = false;
    this.wordSyncEnabled = true;

    this.isUserScrolling = false;
    this.scrollTimeout = null;
    this.scrollToCurrentBtn = options.scrollToCurrentBtn;

    // 120 FPS continuous spring damping animation state
    this.currentScroll = 0;
    this.targetScroll = 0;
    this.animRafId = null;

    this.initScrollListener();
    this.startScrollLoop();
  }

  startScrollLoop() {
    const loop = () => {
      if (this.container && !this.isUserScrolling) {
        const diff = this.targetScroll - this.currentScroll;
        if (Math.abs(diff) > 0.4) {
          // 120 FPS buttery smooth exponential damping
          this.currentScroll += diff * (this.reducedMotion ? 1 : 0.085);
          this.container.scrollTop = this.currentScroll;
        } else if (this.currentScroll !== this.targetScroll) {
          this.currentScroll = this.targetScroll;
          this.container.scrollTop = this.targetScroll;
        }
      } else if (this.container && this.isUserScrolling) {
        this.currentScroll = this.container.scrollTop;
      }
      this.animRafId = requestAnimationFrame(loop);
    };
    this.animRafId = requestAnimationFrame(loop);
  }

  initScrollListener() {
    if (!this.container) return;

    this.container.addEventListener('wheel', () => this.handleUserScroll(), { passive: true });
    this.container.addEventListener('touchmove', () => this.handleUserScroll(), { passive: true });

    if (this.scrollToCurrentBtn) {
      this.scrollToCurrentBtn.addEventListener('click', () => {
        this.isUserScrolling = false;
        this.scrollToCurrentBtn.classList.remove('visible');
        this.scrollToActiveLine(true);
      });
    }
  }

  handleUserScroll() {
    this.isUserScrolling = true;
    if (this.scrollToCurrentBtn) {
      this.scrollToCurrentBtn.classList.add('visible');
    }

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
      if (this.scrollToCurrentBtn) {
        this.scrollToCurrentBtn.classList.remove('visible');
      }
      this.scrollToActiveLine(true);
    }, 3500);
  }

  setStyle(style) {
    this.style = style;
    if (this.container) {
      this.container.classList.toggle('is-dual-mode', style === 'dual');
    }
    if (this.listElement) {
      this.listElement.classList.remove('style-verci', 'style-spatial', 'style-minimal', 'style-dual');
      this.listElement.classList.add(`style-${style}`);
      this.updateLineClasses();
      this.updateDisplayModes();
      this.scrollToActiveLine(false);
    }
  }

  setAlignment(align) {
    this.alignment = align;
    if (this.listElement) {
      this.listElement.classList.remove('align-left', 'align-center', 'align-right');
      this.listElement.classList.add(`align-${align}`);
    }
  }

  setGlowLevel(level) {
    this.glowLevel = level;
    if (this.listElement) {
      this.listElement.classList.remove('glow-subtle', 'glow-radiant', 'glow-bloom');
      this.listElement.classList.add(`glow-${level}`);
    }
  }

  setFocusPosition(pos) {
    this.focusPosition = pos;
    this.scrollToActiveLine(true);
  }

  setReducedMotion(reduced) {
    this.reducedMotion = !!reduced;
    if (this.listElement) {
      this.listElement.classList.toggle('reduced-motion', this.reducedMotion);
    }
  }

  setWordSync(enabled) {
    this.wordSyncEnabled = !!enabled;
  }

  setOffset(offsetSec) {
    this.offset = offsetSec;
  }

  parseLrc(lrcText, totalDuration = 0) {
    this.lines = [];
    this.activeIndex = -1;

    if (!lrcText || typeof lrcText !== 'string' || !lrcText.trim()) {
      this.renderEmpty('No lyrics available for this track');
      return;
    }

    const rawLines = lrcText.split(/\r?\n/);
    const parsed = [];
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

    for (const raw of rawLines) {
      const line = raw.trim();
      if (!line) continue;

      if (line.startsWith('[ti:') || line.startsWith('[ar:') || line.startsWith('[al:') || line.startsWith('[by:')) {
        continue;
      }
      if (line.startsWith('[offset:')) {
        const off = parseInt(line.replace('[offset:', '').replace(']', ''), 10);
        if (!isNaN(off)) this.offset += off / 1000;
        continue;
      }

      const timestamps = [];
      let match;
      timeRegex.lastIndex = 0;
      while ((match = timeRegex.exec(line)) !== null) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const ms = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);
        timestamps.push(min * 60 + sec + ms / 1000);
      }

      if (timestamps.length === 0) continue;

      const textContent = line.replace(timeRegex, '').trim();
      if (!textContent) continue;

      for (const time of timestamps) {
        parsed.push({
          time,
          rawText: textContent
        });
      }
    }

    parsed.sort((a, b) => a.time - b.time);

    if (parsed.length === 0) {
      this.parsePlainText(lrcText, totalDuration);
      return;
    }

    // Check if the song starts with an instrumental intro (vocal timestamp > 2.0s)
    const firstTimestamp = parsed[0].time;
    if (firstTimestamp > 2.0) {
      const dotStep = firstTimestamp / 3;
      this.lines.push({
        id: 'line_intro_0',
        index: 0,
        isInstrumental: true,
        startTime: 0,
        endTime: firstTimestamp,
        text: '···',
        words: [
          { text: '•', startTime: 0, endTime: dotStep },
          { text: '•', startTime: dotStep, endTime: dotStep * 2 },
          { text: '•', startTime: dotStep * 2, endTime: firstTimestamp }
        ]
      });
    }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      const nextTime = i < parsed.length - 1 ? parsed[i + 1].time : (totalDuration > item.time ? totalDuration : item.time + 4.5);
      const gapToNext = nextTime - item.time;
      const estimatedVocalSpan = Math.min(gapToNext, Math.max(2.2, item.rawText.length * 0.12));
      const lineDuration = gapToNext > 6.5 ? estimatedVocalSpan : Math.max(0.6, gapToNext);
      const lineEndTime = item.time + lineDuration;

      const words = this.extractWordTokens(item.rawText, item.time, lineDuration);

      this.lines.push({
        id: `line_${this.lines.length}`,
        index: this.lines.length,
        isInstrumental: false,
        startTime: item.time,
        endTime: gapToNext > 6.5 ? lineEndTime : nextTime,
        text: words.map(w => w.text).join(' '),
        words
      });

      // Insert musical break / interlude (···) if there is an instrumental solo of 6.5+ seconds
      if (gapToNext > 6.5 && i < parsed.length - 1) {
        const breakStart = lineEndTime + 0.4;
        const breakEnd = parsed[i + 1].time;
        if (breakEnd - breakStart > 2.0) {
          const breakDuration = breakEnd - breakStart;
          const bStep = breakDuration / 3;
          this.lines.push({
            id: `line_break_${this.lines.length}`,
            index: this.lines.length,
            isInstrumental: true,
            startTime: breakStart,
            endTime: breakEnd,
            text: '···',
            words: [
              { text: '•', startTime: breakStart, endTime: breakStart + bStep },
              { text: '•', startTime: breakStart + bStep, endTime: breakStart + bStep * 2 },
              { text: '•', startTime: breakStart + bStep * 2, endTime: breakEnd }
            ]
          });
        }
      }
    }

    this.renderLyrics();
  }

  parsePlainText(text, totalDuration = 180) {
    const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length === 0) {
      this.renderEmpty('No lyrics available');
      return;
    }

    const duration = totalDuration > 10 ? totalDuration : rawLines.length * 4;
    // Add realistic instrumental intro buffer by default for unsynced plain text
    const introSpan = Math.min(16, Math.max(8, duration * 0.08));
    this.lines.push({
      id: 'line_intro_0',
      index: 0,
      isInstrumental: true,
      startTime: 0,
      endTime: introSpan,
      text: '···',
      words: [
        { text: '•', startTime: 0, endTime: introSpan * 0.33 },
        { text: '•', startTime: introSpan * 0.33, endTime: introSpan * 0.66 },
        { text: '•', startTime: introSpan * 0.66, endTime: introSpan }
      ]
    });

    const remainingDuration = duration - introSpan;
    const timePerLine = remainingDuration / rawLines.length;

    for (let i = 0; i < rawLines.length; i++) {
      const startTime = introSpan + i * timePerLine;
      const endTime = introSpan + (i + 1) * timePerLine;
      const lineDuration = endTime - startTime;
      const words = this.extractWordTokens(rawLines[i], startTime, lineDuration);

      this.lines.push({
        id: `line_${this.lines.length}`,
        index: this.lines.length,
        isInstrumental: false,
        startTime,
        endTime,
        text: rawLines[i],
        words
      });
    }

    this.renderLyrics();
  }

  extractWordTokens(rawText, lineStartTime, lineDuration) {
    const wordTimeRegex = /<(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?>/g;
    const hasWordTimestamps = wordTimeRegex.test(rawText);

    if (hasWordTimestamps) {
      wordTimeRegex.lastIndex = 0;
      const tokens = [];
      const parts = rawText.split(/(<\d{1,2}:\d{2}(?:\.\d{1,3})?>)/).filter(Boolean);

      let curTime = lineStartTime;
      for (let p = 0; p < parts.length; p++) {
        const part = parts[p].trim();
        const tagMatch = /<(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?>/.exec(part);
        if (tagMatch) {
          const min = parseInt(tagMatch[1], 10);
          const sec = parseInt(tagMatch[2], 10);
          const msStr = tagMatch[3] || '0';
          const ms = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);
          curTime = min * 60 + sec + ms / 1000;
        } else if (part.length > 0) {
          tokens.push({
            text: part,
            startTime: curTime
          });
        }
      }

      for (let t = 0; t < tokens.length; t++) {
        const nextTime = t < tokens.length - 1 ? tokens[t + 1].startTime : (lineStartTime + lineDuration);
        tokens[t].endTime = Math.max(tokens[t].startTime + 0.15, nextTime);
      }

      return tokens.length > 0 ? tokens : this.synthesizeWordTokens(rawText, lineStartTime, lineDuration);
    } else {
      return this.synthesizeWordTokens(rawText, lineStartTime, lineDuration);
    }
  }

  synthesizeWordTokens(cleanText, lineStartTime, lineDuration) {
    const rawWords = cleanText.split(/\s+/).filter(w => w.length > 0);
    if (rawWords.length === 0) return [];

    const weights = rawWords.map(word => {
      const alpha = word.replace(/[^a-zA-Z0-9]/g, '');
      const vowels = (word.match(/[aeiouyAEIOUY]/g) || []).length;
      return Math.max(1, alpha.length * 0.7 + vowels * 0.8);
    });

    const totalWeight = weights.reduce((acc, val) => acc + val, 0);
    const activeSpan = lineDuration * 0.90;

    let curTime = lineStartTime;
    const tokens = [];

    for (let i = 0; i < rawWords.length; i++) {
      const wordSpan = Math.max(0.18, (weights[i] / totalWeight) * activeSpan);
      tokens.push({
        text: rawWords[i],
        startTime: curTime,
        endTime: curTime + wordSpan
      });
      curTime += wordSpan;
    }

    return tokens;
  }

  renderLyrics() {
    if (!this.listElement) return;
    this.listElement.innerHTML = '';

    if (this.lines.length === 0) {
      this.renderEmpty('No lyrics available');
      return;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lineEl = document.createElement('div');
      lineEl.className = 'lyric-line' + (line.isInstrumental ? ' line-instrumental' : '');
      lineEl.dataset.index = i;
      lineEl.dataset.time = line.startTime;

      if (line.isInstrumental) {
        lineEl.innerHTML = `
          <div class="line-content">
            <span class="instrumental-dots" title="Instrumental break">
              <span class="dot dot-1">•</span>
              <span class="dot dot-2">•</span>
              <span class="dot dot-3">•</span>
            </span>
          </div>
        `;
        lineEl.addEventListener('click', () => {
          this.onSeek(line.startTime);
        });
        fragment.appendChild(lineEl);
        continue;
      }

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'line-content';

      for (let w = 0; w < line.words.length; w++) {
        const word = line.words[w];
        const wordEl = document.createElement('span');
        wordEl.className = 'lyric-word';
        wordEl.dataset.lineIndex = i;
        wordEl.dataset.wordIndex = w;
        wordEl.dataset.startTime = word.startTime;
        wordEl.dataset.endTime = word.endTime;
        wordEl.textContent = word.text;

        wordEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onSeek(word.startTime);
        });

        contentWrapper.appendChild(wordEl);

        if (w < line.words.length - 1) {
          contentWrapper.appendChild(document.createTextNode(' '));
        }
      }

      lineEl.appendChild(contentWrapper);

      lineEl.addEventListener('click', () => {
        this.onSeek(line.startTime);
      });

      fragment.appendChild(lineEl);
    }

    this.listElement.appendChild(fragment);
    this.setStyle(this.style);
    this.setAlignment(this.alignment);
    this.setGlowLevel(this.glowLevel);
    this.setReducedMotion(this.reducedMotion);
    this.updateDisplayModes();
  }

  renderEmpty(message = 'No lyrics available') {
    if (!this.listElement) return;
    this.listElement.innerHTML = `
      <div class="lyrics-empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <p class="empty-msg">${message}</p>
        <p class="empty-sub">Import a .lrc file or search for a song</p>
      </div>
    `;
    if (this.overlayWordElement) {
      this.overlayWordElement.innerHTML = `<span class="dimmed">${message}</span>`;
    }
  }

  update(rawTime) {
    if (this.lines.length === 0) return;

    const currentTime = rawTime + this.offset;

    let newActiveIndex = -1;
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (currentTime >= line.startTime && currentTime < line.endTime) {
        newActiveIndex = i;
        break;
      } else if (currentTime < line.startTime) {
        if (i === 0) {
          // If currentTime is before the very first line, no vocal line is active
          newActiveIndex = -1;
        } else if (currentTime >= this.lines[i - 1].endTime) {
          if (currentTime - this.lines[i - 1].endTime < 1.5) {
            newActiveIndex = i - 1;
          } else {
            newActiveIndex = -1;
          }
        }
        break;
      }
    }

    if (newActiveIndex === -1 && currentTime >= this.lines[this.lines.length - 1].endTime) {
      newActiveIndex = this.lines.length - 1;
    }

    const lineChanged = newActiveIndex !== this.activeIndex;
    this.activeIndex = newActiveIndex;

    if (lineChanged) {
      this.updateLineClasses();
      if (!this.isUserScrolling) {
        this.scrollToActiveLine(true);
      }
      this.updateDisplayModes();
    }

    if (this.activeIndex >= 0 && this.activeIndex < this.lines.length) {
      if (!this.lines[this.activeIndex].isInstrumental) {
        this.updateWordHighlights(this.lines[this.activeIndex], currentTime);
      }
      this.updateDesktopOverlay(this.lines[this.activeIndex], currentTime);
    } else {
      this.updateDesktopOverlay(null, currentTime);
    }
  }

  updateLineClasses() {
    if (!this.listElement) return;
    const lineEls = this.listElement.querySelectorAll('.lyric-line');
    const activeIdx = this.activeIndex;

    lineEls.forEach((el, idx) => {
      el.classList.remove('active', 'past', 'future', 'near-past', 'near-future', 'dual-active', 'dual-next');
      if (activeIdx === -1) {
        el.classList.add('future');
        if (idx === 0) {
          el.classList.add('near-future');
          if (this.style === 'dual') el.classList.add('dual-next');
        }
        return;
      }

      const diff = idx - activeIdx;
      if (idx === activeIdx) {
        el.classList.add('active');
        if (this.style === 'dual') el.classList.add('dual-active');
      } else if (diff < 0) {
        el.classList.add('past');
        if (diff === -1) el.classList.add('near-past');
      } else {
        el.classList.add('future');
        if (diff === 1) {
          el.classList.add('near-future');
          if (this.style === 'dual') el.classList.add('dual-next');
        }
      }
    });
  }

  updateWordHighlights(activeLine, currentTime) {
    if (!this.listElement) return;
    const activeLineEl = this.listElement.querySelector(`.lyric-line[data-index="${this.activeIndex}"]`);
    if (!activeLineEl) return;

    const wordEls = activeLineEl.querySelectorAll('.lyric-word');

    for (let w = 0; w < activeLine.words.length; w++) {
      const word = activeLine.words[w];
      const wordEl = wordEls[w];
      if (!wordEl) continue;

      if (!this.wordSyncEnabled) {
        if (!wordEl.classList.contains('word-passed')) {
          wordEl.classList.add('word-passed');
          wordEl.classList.remove('word-active', 'word-upcoming');
          wordEl.style.removeProperty('--wipe-progress');
        }
        continue;
      }

      if (currentTime < word.startTime) {
        if (!wordEl.classList.contains('word-upcoming')) {
          wordEl.classList.remove('word-active', 'word-passed');
          wordEl.classList.add('word-upcoming');
          wordEl.style.setProperty('--wipe-progress', '0%');
        }
      } else if (currentTime >= word.startTime && currentTime < word.endTime) {
        if (!wordEl.classList.contains('word-active')) {
          wordEl.classList.remove('word-upcoming', 'word-passed');
          wordEl.classList.add('word-active');
        }
        const progress = Math.min(100, Math.max(0, ((currentTime - word.startTime) / (word.endTime - word.startTime)) * 100));
        wordEl.style.setProperty('--wipe-progress', `${progress.toFixed(1)}%`);
      } else {
        if (!wordEl.classList.contains('word-passed')) {
          wordEl.classList.remove('word-active', 'word-upcoming');
          wordEl.classList.add('word-passed');
          wordEl.style.setProperty('--wipe-progress', '100%');
        }
      }
    }
  }

  updateDisplayModes() {
    if (!this.listElement) return;
    const lineEls = this.listElement.querySelectorAll('.lyric-line');

    if (this.style === 'spatial') {
      const activeIdx = Math.max(0, this.activeIndex);
      // High-performance bounded updates for locked 120 FPS
      for (let idx = 0; idx < lineEls.length; idx++) {
        const el = lineEls[idx];
        const offset = idx - activeIdx;
        if (Math.abs(offset) > 7) {
          if (el.dataset.inView !== '0') {
            el.style.transform = 'perspective(1000px) translate3d(0, 0, -180px) scale(0.85)';
            el.style.opacity = '0.06';
            el.style.filter = 'blur(3px)';
            el.dataset.inView = '0';
          }
          continue;
        }
        el.dataset.inView = '1';
        if (offset === 0) {
          el.style.transform = 'perspective(1000px) translate3d(0, 0, 35px) rotateX(0deg) scale(1.04)';
          el.style.opacity = '1';
          el.style.filter = 'blur(0px)';
        } else if (offset < 0) {
          const depth = Math.max(-200, offset * 38);
          const rot = Math.min(18, -offset * 5);
          const blurPx = Math.min(3, Math.abs(offset) * 0.9);
          el.style.transform = `perspective(1000px) translate3d(0, ${offset * 3}px, ${depth}px) rotateX(${rot}deg) scale(0.94)`;
          el.style.opacity = `${Math.max(0.12, 1 + offset * 0.25)}`;
          el.style.filter = `blur(${blurPx}px)`;
        } else {
          const depth = Math.max(-200, -offset * 38);
          const rot = Math.max(-18, -offset * 5);
          const blurPx = Math.min(3, offset * 0.9);
          el.style.transform = `perspective(1000px) translate3d(0, ${offset * 3}px, ${depth}px) rotateX(${rot}deg) scale(0.94)`;
          el.style.opacity = `${Math.max(0.1, 0.75 - offset * 0.18)}`;
          el.style.filter = `blur(${blurPx}px)`;
        }
      }
    } else {
      lineEls.forEach(el => {
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
        el.style.removeProperty('filter');
        delete el.dataset.inView;
      });
    }
  }

  updateDesktopOverlay(activeLine, currentTime) {
    if (!this.overlayWordElement) return;
    const widget = document.getElementById('desktop-overlay-widget');
    if (widget && widget.classList.contains('hidden')) return;

    if (!activeLine || activeLine.isInstrumental) {
      this.overlayWordElement.innerHTML = '<span class="overlay-instrumental">···</span>';
      return;
    }

    const wordsHtml = activeLine.words.map((w) => {
      let cls = 'overlay-word';
      if (currentTime < w.startTime) {
        cls += ' dim';
      } else if (currentTime >= w.startTime && currentTime < w.endTime) {
        cls += ' glow';
      } else {
        cls += ' lit';
      }
      return `<span class="${cls}">${w.text}</span>`;
    }).join(' ');

    this.overlayWordElement.innerHTML = wordsHtml;
  }

  scrollToActiveLine(smooth = true) {
    if (!this.container || !this.listElement) return;
    if (this.style === 'dual') {
      this.targetScroll = 0;
      this.currentScroll = 0;
      this.container.scrollTop = 0;
      return;
    }

    if (this.activeIndex === -1) {
      this.targetScroll = 0;
      if (!smooth || this.reducedMotion) {
        this.currentScroll = 0;
        this.container.scrollTop = 0;
      }
      return;
    }

    const activeEl = this.listElement.querySelector(`.lyric-line[data-index="${this.activeIndex}"]`);
    if (!activeEl) return;

    const containerRect = this.container.getBoundingClientRect();
    if (containerRect.height === 0) return;

    const elRect = activeEl.getBoundingClientRect();
    const elCenter = elRect.top + elRect.height / 2;
    const containerCenter = containerRect.top + containerRect.height / 2;
    const delta = elCenter - containerCenter;

    // Direct, exact center alignment regardless of 3D, perspective, or padding!
    this.targetScroll = Math.max(0, this.container.scrollTop + delta);

    if (!smooth || this.reducedMotion) {
      this.currentScroll = this.targetScroll;
      this.container.scrollTop = this.targetScroll;
    }
  }
}
