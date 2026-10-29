// src/renderer/js/audio-player.js
// Native Audio Player Engine with 120fps Smooth Interpolation, Web Audio Analyser & MediaSession

export class AudioPlayer {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';

    // Queue & Playback state
    this.queue = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.85;
    this.shuffle = false;
    this.repeatMode = 'all'; // 'none', 'all', 'one'
    this.shuffledIndices = [];
    this.shufflePointer = 0;

    // 120fps Smooth Clock tracking
    this.lastAudioTime = 0;
    this.lastPerfTime = 0;
    this.rafId = null;

    // Web Audio API context for frequency visualization
    this.audioCtx = null;
    this.analyser = null;
    this.sourceNode = null;
    this.frequencyData = null;
    this.isAudioCtxInitialized = false;

    // Callbacks
    this.onTrackChange = () => {};
    this.onTimeUpdate = () => {};
    this.onPlayStateChange = () => {};
    this.onQueueChange = () => {};
    this.onVolumeChange = () => {};
    this.onModeChange = () => {};
    this.onAudioFrequencies = () => {};

    this.initAudioEvents();
    this.initMediaSession();
    this.startClockLoop();
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.lastAudioTime = this.audio.currentTime;
      this.lastPerfTime = performance.now();
      this.onPlayStateChange(true);
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.onPlayStateChange(false);
      this.updateMediaSessionState();
    });

    this.audio.addEventListener('timeupdate', () => {
      this.lastAudioTime = this.audio.currentTime;
      this.lastPerfTime = performance.now();
      this.updateMediaSessionPosition();
    });

    this.audio.addEventListener('seeking', () => {
      this.lastAudioTime = this.audio.currentTime;
      this.lastPerfTime = performance.now();
    });

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error (trying next if queue):', e);
      if (this.queue.length > 1) {
        setTimeout(() => this.next(), 800);
      }
    });

    // Start Web Audio on user gesture
    const startWebAudio = () => {
      if (!this.isAudioCtxInitialized) {
        this.initWebAudio();
      }
      window.removeEventListener('click', startWebAudio);
      window.removeEventListener('keydown', startWebAudio);
    };
    window.addEventListener('click', startWebAudio);
    window.addEventListener('keydown', startWebAudio);
  }

  startClockLoop() {
    const loop = () => {
      if (this.isPlaying && !this.audio.paused) {
        const duration = this.audio.duration || 0;
        const curTime = this.audio.currentTime || 0;

        // Sub-millisecond 120fps smooth interpolation anchored directly to audio clock
        const elapsedSinceTick = (performance.now() - this.lastPerfTime) / 1000;
        let smoothTime = this.lastAudioTime + elapsedSinceTick;

        // Guard against any network lag/buffering drift
        if (Math.abs(smoothTime - curTime) > 0.1 || this.audio.seeking) {
          smoothTime = curTime;
          this.lastAudioTime = curTime;
          this.lastPerfTime = performance.now();
        }

        if (duration > 0) {
          smoothTime = Math.min(smoothTime, duration);
        }
        this.onTimeUpdate(smoothTime, duration);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  initWebAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.isAudioCtxInitialized = true;

      this.startAnalyserLoop();
    } catch (err) {
      console.warn('Web Audio note (using procedural rhythm fallback if CORS):', err.message);
      this.startProceduralAnalyserFallback();
    }
  }

  startAnalyserLoop() {
    const loop = () => {
      if (this.analyser && this.isPlaying) {
        this.analyser.getByteFrequencyData(this.frequencyData);

        let bassSum = 0, midSum = 0, trebleSum = 0;
        const count = this.frequencyData.length;
        const bassEnd = Math.floor(count * 0.25);
        const midEnd = Math.floor(count * 0.65);

        for (let i = 0; i < count; i++) {
          const val = this.frequencyData[i] / 255;
          if (i < bassEnd) bassSum += val;
          else if (i < midEnd) midSum += val;
          else trebleSum += val;
        }

        const bass = bassSum / (bassEnd || 1);
        const mid = midSum / ((midEnd - bassEnd) || 1);
        const treble = trebleSum / ((count - midEnd) || 1);

        // If Web Audio returned real data
        if (bass > 0.01 || mid > 0.01) {
          this.onAudioFrequencies({ bass, mid, treble });
        } else {
          // Procedural pulse fallback so visualizer is always responsive
          this.emitProceduralPulse();
        }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  startProceduralAnalyserFallback() {
    const loop = () => {
      if (this.isPlaying) {
        this.emitProceduralPulse();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  emitProceduralPulse() {
    const t = (performance.now() / 1000);
    // Procedural beat ~120 BPM with sub-bass kick
    const beat = Math.pow(Math.sin(t * Math.PI * 2), 4);
    const mid = 0.2 + 0.15 * Math.sin(t * 3.5);
    const treble = 0.15 + 0.1 * Math.cos(t * 5.2);
    this.onAudioFrequencies({ bass: Math.max(0.1, beat * 0.75), mid, treble });
  }

  initMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.max(this.audio.currentTime - offset, 0));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seek(Math.min(this.audio.currentTime + offset, this.audio.duration || 0));
      });
    }
  }

  updateMediaSessionMetadata(track) {
    if (!('mediaSession' in navigator) || !track) return;

    const artworkList = [];
    if (track.coverUrl && (track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:'))) {
      artworkList.push(
        { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      );
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Lyriic',
        artwork: artworkList
      });
    } catch (e) {
      console.warn('MediaSession metadata note:', e.message);
    }
  }

  updateMediaSessionState() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
    }
  }

  updateMediaSessionPosition() {
    if ('mediaSession' in navigator && this.audio.duration && !isNaN(this.audio.duration)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: this.audio.duration,
          playbackRate: this.audio.playbackRate || 1,
          position: this.audio.currentTime
        });
      } catch {}
    }
  }

  loadQueue(tracks, startIndex = 0, autoPlay = true) {
    this.queue = [...tracks];
    this.currentIndex = startIndex;
    if (this.shuffle) {
      this.rebuildShuffleList();
    }
    this.onQueueChange(this.queue, this.currentIndex);

    if (this.queue.length > 0 && startIndex >= 0 && startIndex < this.queue.length) {
      this.loadTrack(this.queue[startIndex], autoPlay);
    }
  }

  loadTrack(track, autoPlay = true) {
    if (!track || !track.src) return;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.audio.src = track.src;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.lastAudioTime = 0;
    this.lastPerfTime = performance.now();

    this.updateMediaSessionMetadata(track);
    this.onTrackChange(track);

    if (autoPlay) {
      this.play();
    }
  }

  async play() {
    if (!this.audio.src) {
      if (this.queue.length > 0) {
        this.loadTrack(this.queue[0], true);
      }
      return;
    }
    try {
      await this.audio.play();
    } catch (e) {
      console.warn('Audio play request interrupted:', e.message);
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(timeInSec) {
    if (isNaN(timeInSec)) return;
    const dur = this.audio.duration;
    if (dur && !isNaN(dur)) {
      this.audio.currentTime = Math.max(0, Math.min(timeInSec, dur));
    } else {
      this.audio.currentTime = Math.max(0, timeInSec);
    }
    this.lastAudioTime = this.audio.currentTime;
    this.lastPerfTime = performance.now();
  }

  seekRelative(deltaSec) {
    this.seek(this.audio.currentTime + deltaSec);
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.repeatMode === 'one') {
      this.seek(0);
      this.play();
      return;
    }

    if (this.shuffle && this.shuffledIndices.length === this.queue.length) {
      this.shufflePointer++;
      if (this.shufflePointer >= this.shuffledIndices.length) {
        if (this.repeatMode === 'none') {
          this.pause();
          this.seek(0);
          return;
        }
        this.shufflePointer = 0;
      }
      this.currentIndex = this.shuffledIndices[this.shufflePointer];
    } else {
      let nextIdx = this.currentIndex + 1;
      if (nextIdx >= this.queue.length) {
        if (this.repeatMode === 'none') {
          this.pause();
          this.seek(0);
          return;
        }
        nextIdx = 0;
      }
      this.currentIndex = nextIdx;
    }

    this.onQueueChange(this.queue, this.currentIndex);
    this.loadTrack(this.queue[this.currentIndex], true);
  }

  prev() {
    if (this.queue.length === 0) return;

    if (this.audio.currentTime > 3) {
      this.seek(0);
      return;
    }

    if (this.shuffle && this.shuffledIndices.length === this.queue.length) {
      this.shufflePointer = Math.max(0, this.shufflePointer - 1);
      this.currentIndex = this.shuffledIndices[this.shufflePointer];
    } else {
      let prevIdx = this.currentIndex - 1;
      if (prevIdx < 0) {
        prevIdx = this.repeatMode === 'all' ? this.queue.length - 1 : 0;
      }
      this.currentIndex = prevIdx;
    }

    this.onQueueChange(this.queue, this.currentIndex);
    this.loadTrack(this.queue[this.currentIndex], true);
  }

  handleTrackEnded() {
    if (this.repeatMode === 'one') {
      this.seek(0);
      this.play();
    } else {
      this.next();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.isMuted && this.volume > 0) {
      this.isMuted = false;
    }
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.onVolumeChange(this.volume, this.isMuted);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.onVolumeChange(this.volume, this.isMuted);
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.shuffle) {
      this.rebuildShuffleList();
    }
    this.onModeChange({ shuffle: this.shuffle, repeat: this.repeatMode });
  }

  rebuildShuffleList() {
    const indices = this.queue.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    if (this.currentIndex >= 0) {
      const curPos = indices.indexOf(this.currentIndex);
      if (curPos > 0) {
        indices.splice(curPos, 1);
        indices.unshift(this.currentIndex);
      }
    }
    this.shuffledIndices = indices;
    this.shufflePointer = 0;
  }

  cycleRepeat() {
    const modes = ['none', 'all', 'one'];
    const curIdx = modes.indexOf(this.repeatMode);
    this.repeatMode = modes[(curIdx + 1) % modes.length];
    this.onModeChange({ shuffle: this.shuffle, repeat: this.repeatMode });
  }

  addToQueue(track, playNext = false) {
    if (!track) return;
    if (this.queue.length === 0 || this.currentIndex === -1) {
      this.loadQueue([track], 0, true);
      return;
    }
    if (playNext && this.currentIndex >= 0) {
      this.queue.splice(this.currentIndex + 1, 0, track);
    } else {
      this.queue.push(track);
    }
    if (this.shuffle) {
      this.rebuildShuffleList();
    }
    this.onQueueChange(this.queue, this.currentIndex);
  }

  addMultipleToQueue(tracks, playNext = false) {
    if (!tracks || tracks.length === 0) return;
    if (this.queue.length === 0 || this.currentIndex === -1) {
      this.loadQueue(tracks, 0, true);
      return;
    }
    if (playNext && this.currentIndex >= 0) {
      this.queue.splice(this.currentIndex + 1, 0, ...tracks);
    } else {
      this.queue.push(...tracks);
    }
    if (this.shuffle) {
      this.rebuildShuffleList();
    }
    this.onQueueChange(this.queue, this.currentIndex);
  }

  removeFromQueue(index) {
    if (index < 0 || index >= this.queue.length) return;
    this.queue.splice(index, 1);
    if (this.currentIndex > index) {
      this.currentIndex--;
    } else if (this.currentIndex === index) {
      if (this.queue.length > 0) {
        this.currentIndex = Math.min(this.currentIndex, this.queue.length - 1);
        this.loadTrack(this.queue[this.currentIndex], this.isPlaying);
      } else {
        this.pause();
        this.currentIndex = -1;
        this.audio.src = '';
      }
    }
    if (this.shuffle) this.rebuildShuffleList();
    this.onQueueChange(this.queue, this.currentIndex);
  }

  clearQueue() {
    this.pause();
    this.queue = [];
    this.currentIndex = -1;
    this.audio.src = '';
    this.shuffledIndices = [];
    this.onQueueChange(this.queue, this.currentIndex);
  }

  getCurrentTrack() {
    return this.queue[this.currentIndex] || null;
  }
}
