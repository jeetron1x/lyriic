// src/renderer/js/storage.js
// Privacy-friendly local storage manager for Lyriic

const STORAGE_KEYS = {
  LIKES: 'lyriic_liked_songs',
  HISTORY: 'lyriic_history',
  SETTINGS: 'lyriic_user_settings',
  QUEUE: 'lyriic_saved_queue',
  OFFSETS: 'lyriic_lyrics_offsets',
  LAST_PALETTE: 'lyriic_last_palette',
  LAST_TRACK: 'lyriic_last_track',
  PLAYLISTS: 'lyriic_playlists',
  FIRST_RUN: 'lyriic_first_run_done'
};

const DEFAULT_SETTINGS = {
  fontFamily: 'Inter', // 'Inter', 'Playfair', 'Plus Jakarta Sans', 'JetBrains Mono'
  fontSize: 'medium', // 'small', 'medium', 'large', 'huge'
  lyricStyle: 'verci', // 'verci' (kinetic), 'spatial' (3D), 'minimal' (editorial), 'dual' (subtitle)
  themePreset: 'monochrome', // 'monochrome' (Black & White default!), 'dynamic', 'obsidian', 'frost', 'amethyst', 'emerald', 'amber', 'custom'
  customAccentColor: '#ffffff',
  glassBlur: 32, // blur px (8..64)
  acrylicOpacity: 0.65, // 0.2..0.9
  ambientLighting: true, // Lumn-style audio-reactive lighting
  ambientMode: 'lumn', // 'lumn' (audio beat sync), 'aurora', 'breathe', 'spectrum', 'neon', 'static'
  ambientColorSource: 'monochrome', // 'monochrome' (B&W pure white halo), 'dynamic' (album cover), 'custom', 'spectrum', 'cyberpunk', 'sunset'
  ambientSpread: 45, // px (10..150)
  ambientSpeed: 1.0, // multiplier (0.2..3.0)
  ambientIntensity: 1.0, // 0.15..2.0
  beatSensitivity: 1.0, // 0.2..3.0
  ambientSides: 'all', // 'all', 'tb', 'lr'
  lyricGlow: 'radiant', // 'subtle', 'radiant', 'bloom'
  lyricAlign: 'left', // 'left', 'center', 'right'
  focusPosition: 50, // % from top (50% is vertical center!)
  showParticles: true,
  reducedMotion: false,
  autoFetchLyrics: true,
  wordSyncEnabled: true,
  minimizeToTray: false,
  closeToTray: false,
  globalMediaKeys: true,
  volume: 0.85
};

export const Storage = {
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return DEFAULT_SETTINGS;
    }
  },

  getLikes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isLiked(trackId) {
    const likes = this.getLikes();
    return likes.some(t => t.id === trackId);
  },

  toggleLike(track) {
    let likes = this.getLikes();
    const idx = likes.findIndex(t => t.id === track.id);
    let isNowLiked = false;
    if (idx >= 0) {
      likes.splice(idx, 1);
      isNowLiked = false;
    } else {
      likes.unshift({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        src: track.src,
        coverUrl: track.coverUrl,
        isLocal: track.isLocal,
        likedAt: Date.now()
      });
      isNowLiked = true;
    }
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    return isNowLiked;
  },

  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(track) {
    if (!track || !track.id) return;
    try {
      let history = this.getHistory();
      history = history.filter(item => item.id !== track.id);
      history.unshift({
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        src: track.src,
        coverUrl: track.coverUrl,
        isLocal: track.isLocal,
        playedAt: Date.now()
      });
      if (history.length > 100) history = history.slice(0, 100);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to record history:', e);
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  getLyricOffset(trackId) {
    try {
      const offsets = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFSETS) || '{}');
      return offsets[trackId] || 0;
    } catch {
      return 0;
    }
  },

  setLyricOffset(trackId, offsetSec) {
    try {
      const offsets = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFSETS) || '{}');
      offsets[trackId] = offsetSec;
      localStorage.setItem(STORAGE_KEYS.OFFSETS, JSON.stringify(offsets));
    } catch (e) {
      console.error('Failed to save lyric offset:', e);
    }
  },

  saveLastPalette(palette) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_PALETTE, JSON.stringify(palette));
    } catch (e) {
      console.error('Failed to save last palette:', e);
    }
  },

  getLastPalette() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_PALETTE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLastPlayedTrack(track) {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_TRACK, JSON.stringify(track));
    } catch (e) {
      console.error('Failed to save last track:', e);
    }
  },

  getLastPlayedTrack() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_TRACK);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Innumerable Playlists Management
  getPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getPlaylist(id) {
    const list = this.getPlaylists();
    return list.find(p => p.id === id) || null;
  },

  createPlaylist(name, description = '') {
    const list = this.getPlaylists();
    const id = 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newPlaylist = {
      id,
      name: name.trim() || 'My Playlist',
      description: description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      coverUrl: null,
      tracks: []
    };
    list.unshift(newPlaylist);
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to create playlist:', e);
    }
    return newPlaylist;
  },

  deletePlaylist(id) {
    let list = this.getPlaylists();
    list = list.filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to delete playlist:', e);
      return false;
    }
  },

  renamePlaylist(id, newName) {
    const list = this.getPlaylists();
    const p = list.find(item => item.id === id);
    if (!p) return false;
    p.name = newName.trim() || p.name;
    p.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to rename playlist:', e);
      return false;
    }
  },

  addTrackToPlaylist(playlistId, track) {
    if (!track || !track.id) return { success: false, reason: 'Invalid track' };
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (!pl) return { success: false, reason: 'Playlist not found' };

    if (!pl.tracks) pl.tracks = [];
    const exists = pl.tracks.some(t => t.id === track.id);
    if (exists) {
      return { success: false, alreadyIn: true, playlistName: pl.name, trackTitle: track.title };
    }

    pl.tracks.push({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      duration: track.duration || 0,
      src: track.src,
      coverUrl: track.coverUrl || '',
      isLocal: !!track.isLocal,
      addedAt: Date.now()
    });

    if (!pl.coverUrl && track.coverUrl) {
      pl.coverUrl = track.coverUrl;
    }
    pl.updatedAt = Date.now();

    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(list));
      return { success: true, playlistName: pl.name, trackTitle: track.title, totalTracks: pl.tracks.length };
    } catch (e) {
      console.error('Failed to add track to playlist:', e);
      return { success: false, reason: 'Storage error' };
    }
  },

  removeTrackFromPlaylist(playlistId, trackId) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (!pl || !pl.tracks) return false;

    pl.tracks = pl.tracks.filter(t => t.id !== trackId);
    if (pl.tracks.length > 0) {
      pl.coverUrl = pl.tracks[0].coverUrl || null;
    } else {
      pl.coverUrl = null;
    }
    pl.updatedAt = Date.now();

    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error('Failed to remove track from playlist:', e);
      return false;
    }
  },

  // First Run / Post-Install Tracking
  isFirstRun() {
    try {
      return localStorage.getItem(STORAGE_KEYS.FIRST_RUN) !== 'done';
    } catch {
      return true;
    }
  },

  setFirstRunDone() {
    try {
      localStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'done');
    } catch {}
  }
};
