// src/renderer/js/app.js
// Main application controller for Lyriic with ambient lighting & dynamic theming

import { Storage } from './storage.js';
import { AudioPlayer } from './audio-player.js';
import { LyricsEngine } from './lyrics-engine.js';

class LyriicApp {
  constructor() {
    this.settings = Storage.getSettings();
    this.audioPlayer = new AudioPlayer();
    this.currentTrack = null;
    this.currentLyricsText = '';
    this.localLibrary = []; // Clean library - no default music cluttering the user
    this.isFullScreen = false;
    this.isOverlay = false;
    this.hudTimer = null;
    this.searchDebounceTimer = null;

    // Beat detection state for ambient lighting
    this.prevBass = 0;
    this.beatBloom = 1.0;
    this.beatDecayRate = 0.94;

    this.initDOM();
    this.initLyricsEngine();
    this.applySettings(this.settings);
    this.restoreLastTheme();
    this.initEventListeners();
    this.initIPCListeners();
    this.initVisualizer();
    this.bootstrapLibrary();
  }

  initDOM() {
    this.appShell = document.getElementById('app-shell');
    this.ambientBackdrop = document.getElementById('ambient-backdrop');
    this.ambientHalo = document.getElementById('ambient-edge-halo');
    this.fullscreenOverlay = document.getElementById('fullscreen-overlay');
    this.desktopOverlayWidget = document.getElementById('desktop-overlay-widget');
    this.settingsModal = document.getElementById('settings-modal');

    // Titlebar
    this.titlebarNowPlaying = document.getElementById('titlebar-nowplaying');
    this.titlebarTitle = document.getElementById('titlebar-title');
    this.titlebarArtist = document.getElementById('titlebar-artist');
    this.btnWinMinimize = document.getElementById('btn-win-minimize');
    this.btnWinMaximize = document.getElementById('btn-win-maximize');
    this.btnWinClose = document.getElementById('btn-win-close');
    this.btnHeaderFullscreen = document.getElementById('btn-header-fullscreen');
    this.btnHeaderOverlay = document.getElementById('btn-header-overlay');
    this.btnHeaderSettings = document.getElementById('btn-header-settings');
    this.btnSidebarSettings = document.getElementById('btn-sidebar-settings');
    this.btnStageSettings = document.getElementById('btn-stage-settings');
    this.btnFsSettings = document.getElementById('btn-fs-settings');

    // Views & Nav
    this.navItems = document.querySelectorAll('.nav-item');
    this.viewPanels = document.querySelectorAll('.view-panel');

    // Lyrics Elements
    this.lyricsContainer = document.getElementById('lyrics-scroll-container');
    this.lyricsList = document.getElementById('lyrics-list');
    this.fsLyricsContainer = document.getElementById('fs-lyrics-container');
    this.fsLyricsList = document.getElementById('fs-lyrics-list');
    this.btnScrollToCurrent = document.getElementById('btn-scroll-to-current');
    this.overlayLyricsLine = document.getElementById('overlay-active-lyrics');

    // Bottom Player Controls
    this.playerCoverImg = document.getElementById('player-cover-img');
    this.playerTitle = document.getElementById('player-title');
    this.playerArtist = document.getElementById('player-artist');
    this.btnPlayerLike = document.getElementById('btn-player-like');
    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.iconPlay = document.getElementById('icon-play');
    this.iconPause = document.getElementById('icon-pause');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.btnShuffle = document.getElementById('btn-shuffle');
    this.btnRepeat = document.getElementById('btn-repeat');
    this.repeatBadge = document.getElementById('repeat-badge');

    // Progress & Seek
    this.timeCurrent = document.getElementById('time-current');
    this.timeTotal = document.getElementById('time-total');
    this.seekTrack = document.getElementById('seek-track');
    this.seekFill = document.getElementById('seek-fill');
    this.seekThumb = document.getElementById('seek-thumb');
    this.seekBuffer = document.getElementById('seek-buffer');
    this.seekTooltip = document.getElementById('seek-tooltip');

    // Volume
    this.btnMute = document.getElementById('btn-mute');
    this.iconVolHigh = document.getElementById('icon-vol-high');
    this.iconVolMute = document.getElementById('icon-vol-mute');
    this.volumeTrack = document.getElementById('volume-track');
    this.volumeFill = document.getElementById('volume-fill');

    // Fullscreen & Overlay buttons
    this.btnPlayerFullscreen = document.getElementById('btn-player-fullscreen');
    this.btnPlayerOverlay = document.getElementById('btn-player-overlay');
    this.btnExitFullscreen = document.getElementById('btn-exit-fullscreen');
    this.fsTrackTitle = document.getElementById('fs-track-title');
    this.fsTrackArtist = document.getElementById('fs-track-artist');
    this.fsHud = document.getElementById('fs-hud');
    this.btnFsPlayPause = document.getElementById('btn-fs-play-pause');
    this.fsIconPlay = document.getElementById('fs-icon-play');
    this.fsIconPause = document.getElementById('fs-icon-pause');
    this.btnFsPrev = document.getElementById('btn-fs-prev');
    this.btnFsNext = document.getElementById('btn-fs-next');
    this.fsSeekTrack = document.getElementById('fs-seek-track');
    this.fsSeekFill = document.getElementById('fs-seek-fill');
    this.fsTimeCurrent = document.getElementById('fs-time-current');
    this.fsTimeTotal = document.getElementById('fs-time-total');

    // Desktop Overlay controls
    this.overlayCoverImg = document.getElementById('overlay-cover-img');
    this.overlayTitle = document.getElementById('overlay-title');
    this.overlayArtist = document.getElementById('overlay-artist');
    this.btnOverlayPlayPause = document.getElementById('btn-overlay-play-pause');
    this.overlayIconPlay = document.getElementById('overlay-icon-play');
    this.overlayIconPause = document.getElementById('overlay-icon-pause');
    this.btnOverlayNext = document.getElementById('btn-overlay-next');
    this.btnOverlayExpand = document.getElementById('btn-overlay-expand');

    // Queue Panel
    this.queuePane = document.getElementById('queue-pane');
    this.btnToggleQueue = document.getElementById('btn-toggle-queue');
    this.btnCloseQueue = document.getElementById('btn-close-queue');
    this.btnClearQueue = document.getElementById('btn-clear-queue');
    this.queueCount = document.getElementById('queue-count');
    this.queueTracksList = document.getElementById('queue-tracks-list');

    // Sidebar preview
    this.sidebarTrackPreview = document.getElementById('sidebar-track-preview');
    this.sidebarCoverImg = document.getElementById('sidebar-cover-img');
    this.sidebarTrackTitle = document.getElementById('sidebar-track-title');
    this.sidebarTrackArtist = document.getElementById('sidebar-track-artist');

    // Search & Library
    this.musicSearchInput = document.getElementById('music-search-input');
    this.btnClearSearch = document.getElementById('btn-clear-search');
    this.searchSpinner = document.getElementById('search-spinner');
    this.searchResultsList = document.getElementById('search-results-list');
    this.libraryTracksList = document.getElementById('library-tracks-list');
    this.favoritesTracksList = document.getElementById('favorites-tracks-list');
    this.historyTracksList = document.getElementById('history-tracks-list');
    this.btnClearHistory = document.getElementById('btn-clear-history');
    this.btnOpenFiles = document.getElementById('btn-open-files');
    this.btnOpenDir = document.getElementById('btn-open-dir');
    this.libraryDropzone = document.getElementById('library-dropzone');

    // Lyrics toolbar buttons
    this.stylePills = document.querySelectorAll('.style-pill');
    this.btnOffsetMinus = document.getElementById('btn-offset-minus');
    this.btnOffsetPlus = document.getElementById('btn-offset-plus');
    this.offsetIndicator = document.getElementById('offset-indicator');
    this.btnImportLrc = document.getElementById('btn-import-lrc');
    this.btnFetchLyrics = document.getElementById('btn-fetch-lyrics');

    // Settings Modal Inputs
    this.btnCloseSettings = document.getElementById('btn-close-settings');
    this.inputGlassBlur = document.getElementById('input-glass-blur');
    this.labelBlurVal = document.getElementById('label-blur-val');
    this.inputAcrylicOpacity = document.getElementById('input-acrylic-opacity');
    this.labelOpacityVal = document.getElementById('label-opacity-val');
    this.inputAmbientIntensity = document.getElementById('input-ambient-intensity');
    this.labelIntensityVal = document.getElementById('label-intensity-val');
    this.inputAmbientSpread = document.getElementById('input-ambient-spread');
    this.labelSpreadVal = document.getElementById('label-spread-val');
    this.inputAmbientSpeed = document.getElementById('input-ambient-speed');
    this.labelSpeedVal = document.getElementById('label-speed-val');
    this.inputBeatSensitivity = document.getElementById('input-beat-sensitivity');
    this.labelSensitivityVal = document.getElementById('label-sensitivity-val');
    this.customAmbientColorRow = document.getElementById('custom-ambient-color-row');
    this.inputCustomAmbientColor = document.getElementById('input-custom-ambient-color');
    this.customThemeColorRow = document.getElementById('custom-theme-color-row');
    this.inputFocusPosition = document.getElementById('input-focus-position');
    this.labelFocusVal = document.getElementById('label-focus-val');
    this.inputCustomColor = document.getElementById('input-custom-color');

    this.toggleAmbientLighting = document.getElementById('toggle-ambient-lighting');
    this.toggleParticles = document.getElementById('toggle-particles');
    this.toggleMinTray = document.getElementById('toggle-min-tray');
    this.toggleCloseTray = document.getElementById('toggle-close-tray');
    this.toggleMediaKeys = document.getElementById('toggle-media-keys');
    this.toggleWordSync = document.getElementById('toggle-word-sync');
    this.toggleAutoLrclib = document.getElementById('toggle-auto-lrclib');
    this.toggleReducedMotion = document.getElementById('toggle-reduced-motion');

    // Playlists & Queue elements
    this.viewPlaylists = document.getElementById('view-playlists');
    this.playlistsGrid = document.getElementById('playlists-grid');
    this.playlistsMainSubview = document.getElementById('playlists-main-subview');
    this.playlistDetailSubview = document.getElementById('playlist-detail-subview');
    this.playlistTracksList = document.getElementById('playlist-tracks-list');
    this.btnCreatePlaylistHeader = document.getElementById('btn-create-playlist-header');
    this.btnBackPlaylists = document.getElementById('btn-back-playlists');
    this.btnPlaylistPlayAll = document.getElementById('btn-playlist-play-all');
    this.btnPlaylistAddQueue = document.getElementById('btn-playlist-add-queue');
    this.btnPlaylistDelete = document.getElementById('btn-playlist-delete');
    this.inputSearchPlaylists = document.getElementById('input-search-playlists');
    this.plDetailCover = document.getElementById('pl-detail-cover');
    this.plDetailTitle = document.getElementById('pl-detail-title');
    this.plDetailDesc = document.getElementById('pl-detail-desc');
    this.plDetailCount = document.getElementById('pl-detail-count');
    this.plDetailDuration = document.getElementById('pl-detail-duration');

    // Modals & Toast
    this.createPlaylistModal = document.getElementById('create-playlist-modal');
    this.inputPlaylistName = document.getElementById('input-playlist-name');
    this.inputPlaylistDesc = document.getElementById('input-playlist-desc');
    this.btnSubmitCreatePlaylist = document.getElementById('btn-submit-create-playlist');
    this.btnCancelCreatePlaylist = document.getElementById('btn-cancel-create-playlist');
    this.btnCloseCreatePlaylist = document.getElementById('btn-close-create-playlist');

    this.addToPlaylistModal = document.getElementById('add-to-playlist-modal');
    this.playlistsPickerList = document.getElementById('playlists-picker-list');
    this.inputQuickPlaylistName = document.getElementById('input-quick-playlist-name');
    this.btnQuickCreatePl = document.getElementById('btn-quick-create-pl');
    this.btnCloseAddPlaylist = document.getElementById('btn-close-add-playlist');
    this.addToPlaylistTrackName = document.getElementById('add-to-playlist-track-name');

    this.firstRunModal = document.getElementById('first-run-modal');
    this.btnWelcomeStart = document.getElementById('btn-welcome-start');
    this.toastContainer = document.getElementById('toast-container');

    this.currentActivePlaylistId = null;
    this.trackPendingPlaylist = null;
  }

  initLyricsEngine() {
    this.lyricsEngine = new LyricsEngine({
      container: this.lyricsContainer,
      listElement: this.lyricsList,
      overlayWordElement: this.overlayLyricsLine,
      scrollToCurrentBtn: this.btnScrollToCurrent,
      onSeek: (time) => this.audioPlayer.seek(time)
    });

    this.fsLyricsEngine = new LyricsEngine({
      container: this.fsLyricsContainer,
      listElement: this.fsLyricsList,
      onSeek: (time) => this.audioPlayer.seek(time)
    });
  }

  bootstrapLibrary() {
    this.renderTracksList(this.libraryTracksList, this.localLibrary, 'library');
    this.renderFavorites();
    this.renderHistory();
    this.renderPlaylists();
    this.checkFirstRun();

    // Default view is Search if library empty
    if (this.localLibrary.length === 0) {
      this.switchTab('search');
    }
  }

  restoreLastTheme() {
    if (this.settings.themePreset === 'dynamic') {
      const lastPalette = Storage.getLastPalette();
      if (lastPalette && lastPalette.accentRgb) {
        this.applyPaletteTheme(lastPalette);
        return;
      }
      const lastTrack = Storage.getLastPlayedTrack();
      if (lastTrack && lastTrack.coverUrl) {
        this.extractPaletteFromCover(lastTrack.coverUrl);
      }
    }
  }

  applyPaletteTheme(palette) {
    if (!palette || !palette.accentRgb) return;
    const { accentRgb, bgRgb, orb1, orb2, orb3 } = palette;
    document.documentElement.style.setProperty('--accent-color', `rgb(${accentRgb})`);
    document.documentElement.style.setProperty('--accent-color-rgb', accentRgb);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${accentRgb}, 0.65)`);
    if (this.settings.ambientColorSource !== 'custom') {
      document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${accentRgb}, 0.75)`);
    }
    document.documentElement.style.setProperty('--bg-base', `rgb(${bgRgb})`);
    document.documentElement.style.setProperty('--bg-base-rgb', bgRgb);
    if (orb1) document.documentElement.style.setProperty('--orb-color-1', orb1);
    if (orb2) document.documentElement.style.setProperty('--orb-color-2', orb2);
    if (orb3) document.documentElement.style.setProperty('--orb-color-3', orb3);
  }

  applySettings(settings) {
    document.body.className = '';
    const preset = settings.themePreset || 'dynamic';
    document.body.classList.add(`theme-${preset}`);
    document.body.classList.add(`font-${this.getFontClass(settings.fontFamily)}`);
    document.body.classList.add(`size-${settings.fontSize || 'medium'}`);

    if (settings.reducedMotion) {
      document.body.classList.add('reduced-motion');
    }

    document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur || 32}px`);
    document.documentElement.style.setProperty('--glass-surface-opacity', `${settings.acrylicOpacity || 0.65}`);
    document.documentElement.style.setProperty('--ambient-intensity', `${settings.ambientIntensity || 1.0}`);

    // Halo spread
    const spread = settings.ambientSpread || 45;
    document.documentElement.style.setProperty('--halo-spread', `${spread}px`);
    if (this.inputAmbientSpread) {
      this.inputAmbientSpread.value = spread;
      this.labelSpreadVal.textContent = `${spread}px`;
    }

    // Ambient speed
    const speed = settings.ambientSpeed || 1.0;
    document.documentElement.style.setProperty('--ambient-speed', `${speed}`);
    if (this.inputAmbientSpeed) {
      this.inputAmbientSpeed.value = Math.round(speed * 10);
      this.labelSpeedVal.textContent = `${speed.toFixed(1)}x`;
    }

    // Beat sensitivity
    const sens = settings.beatSensitivity || 1.0;
    if (this.inputBeatSensitivity) {
      this.inputBeatSensitivity.value = Math.round(sens * 10);
      this.labelSensitivityVal.textContent = `${sens.toFixed(1)}x`;
    }

    // Color source
    if (this.customAmbientColorRow) {
      this.customAmbientColorRow.classList.toggle('hidden', settings.ambientColorSource !== 'custom');
    }
    if (this.customThemeColorRow) {
      this.customThemeColorRow.classList.toggle('hidden', settings.themePreset !== 'custom');
    }

    if (settings.ambientColorSource === 'monochrome') {
      document.documentElement.style.setProperty('--ambient-glow-color', 'rgba(255, 255, 255, 0.75)');
    } else if (settings.ambientColorSource === 'cyberpunk') {
      document.documentElement.style.setProperty('--ambient-glow-color', 'rgba(0, 240, 255, 0.8)');
    } else if (settings.ambientColorSource === 'sunset') {
      document.documentElement.style.setProperty('--ambient-glow-color', 'rgba(255, 130, 40, 0.8)');
    } else if (settings.ambientColorSource === 'custom' && settings.customAmbientColor) {
      const hex = settings.customAmbientColor;
      const r = parseInt(hex.slice(1, 3), 16) || 255;
      const g = parseInt(hex.slice(3, 5), 16) || 255;
      const b = parseInt(hex.slice(5, 7), 16) || 255;
      document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${r}, ${g}, ${b}, 0.75)`);
      if (this.inputCustomAmbientColor) this.inputCustomAmbientColor.value = hex;
    }

    // Spread Sides
    document.body.classList.remove('sides-all', 'sides-tb', 'sides-lr');
    document.body.classList.add(`sides-${settings.ambientSides || 'all'}`);

    if (settings.themePreset === 'monochrome' || !settings.themePreset) {
      document.documentElement.style.setProperty('--accent-color', '#ffffff');
      document.documentElement.style.setProperty('--accent-color-rgb', '255, 255, 255');
      document.documentElement.style.setProperty('--accent-glow', 'rgba(255, 255, 255, 0.55)');
      document.documentElement.style.setProperty('--bg-base', 'rgb(7, 7, 9)');
      document.documentElement.style.setProperty('--bg-base-rgb', '7, 7, 9');
      document.documentElement.style.setProperty('--orb-color-1', 'rgba(255, 255, 255, 0.08)');
      document.documentElement.style.setProperty('--orb-color-2', 'rgba(180, 180, 180, 0.05)');
      document.documentElement.style.setProperty('--orb-color-3', 'rgba(40, 40, 48, 0.35)');
    } else if (settings.themePreset === 'custom' && settings.customAccentColor) {
      this.applyCustomPalette(settings.customAccentColor);
    } else if (settings.themePreset === 'dynamic') {
      if (this.currentTrack && this.currentTrack.coverUrl) {
        this.extractPaletteFromCover(this.currentTrack.coverUrl);
      } else {
        const lastPalette = Storage.getLastPalette();
        if (lastPalette) this.applyPaletteTheme(lastPalette);
      }
    }

    // Ambient Lighting
    if (this.ambientHalo) {
      this.ambientHalo.classList.toggle('hidden', settings.ambientLighting === false);
    }
    if (this.ambientBackdrop) {
      this.ambientBackdrop.classList.toggle('ambient-disabled', settings.ambientLighting === false);
      this.ambientBackdrop.className = `ambient-backdrop mode-${settings.ambientMode || 'beat'}`;
    }

    // Particle texture
    const noiseEl = document.querySelector('.smoke-noise');
    if (noiseEl) {
      noiseEl.classList.toggle('hidden', settings.showParticles === false);
    }

    // Engine styling
    this.lyricsEngine.setStyle(settings.lyricStyle || 'kinetic');
    this.lyricsEngine.setAlignment(settings.lyricAlign || 'left');
    this.lyricsEngine.setGlowLevel(settings.lyricGlow || 'radiant');
    this.lyricsEngine.setFocusPosition(settings.focusPosition || 42);
    this.lyricsEngine.setReducedMotion(settings.reducedMotion);
    this.lyricsEngine.setWordSync(settings.wordSyncEnabled);

    this.fsLyricsEngine.setStyle(settings.lyricStyle || 'kinetic');
    this.fsLyricsEngine.setAlignment('center');
    this.fsLyricsEngine.setGlowLevel(settings.lyricGlow || 'radiant');
    this.fsLyricsEngine.setReducedMotion(settings.reducedMotion);
    this.fsLyricsEngine.setWordSync(settings.wordSyncEnabled);

    this.stylePills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.style === settings.lyricStyle);
    });

    if (this.inputGlassBlur) {
      this.inputGlassBlur.value = settings.glassBlur || 32;
      this.labelBlurVal.textContent = `${settings.glassBlur || 32}px`;
    }
    if (this.inputAcrylicOpacity) {
      this.inputAcrylicOpacity.value = Math.round((settings.acrylicOpacity || 0.65) * 100);
      this.labelOpacityVal.textContent = `${Math.round((settings.acrylicOpacity || 0.65) * 100)}%`;
    }
    if (this.inputAmbientIntensity) {
      this.inputAmbientIntensity.value = Math.round((settings.ambientIntensity || 1.0) * 100);
      this.labelIntensityVal.textContent = `${Math.round((settings.ambientIntensity || 1.0) * 100)}%`;
    }
    if (this.inputFocusPosition) {
      this.inputFocusPosition.value = settings.focusPosition || 42;
      this.labelFocusVal.textContent = `${settings.focusPosition || 42}%`;
    }
    if (this.inputCustomColor) {
      this.inputCustomColor.value = settings.customAccentColor || '#6388ff';
    }

    if (this.toggleAmbientLighting) this.toggleAmbientLighting.checked = settings.ambientLighting !== false;
    if (this.toggleParticles) this.toggleParticles.checked = settings.showParticles !== false;
    if (this.toggleMinTray) this.toggleMinTray.checked = !!settings.minimizeToTray;
    if (this.toggleCloseTray) this.toggleCloseTray.checked = !!settings.closeToTray;
    if (this.toggleMediaKeys) this.toggleMediaKeys.checked = settings.globalMediaKeys !== false;
    if (this.toggleWordSync) this.toggleWordSync.checked = settings.wordSyncEnabled !== false;
    if (this.toggleAutoLrclib) this.toggleAutoLrclib.checked = settings.autoFetchLyrics !== false;
    if (this.toggleReducedMotion) this.toggleReducedMotion.checked = !!settings.reducedMotion;

    // Sync all settings buttons active highlight state
    document.querySelectorAll('.opt-btn').forEach(btn => {
      const s = btn.dataset.setting;
      const v = btn.dataset.val;
      if (s && settings[s] !== undefined) {
        btn.classList.toggle('active', settings[s] === v);
      }
    });

    if (window.electronAPI) {
      window.electronAPI.updateSettings({
        minimizeToTray: settings.minimizeToTray,
        closeToTray: settings.closeToTray,
        globalMediaKeys: settings.globalMediaKeys
      });
    }
  }

  applyCustomPalette(hex) {
    const r = parseInt(hex.slice(1, 3), 16) || 99;
    const g = parseInt(hex.slice(3, 5), 16) || 136;
    const b = parseInt(hex.slice(5, 7), 16) || 255;
    const rgbStr = `${r}, ${g}, ${b}`;
    const bgR = Math.round(r * 0.10);
    const bgG = Math.round(g * 0.10);
    const bgB = Math.round(b * 0.10);
    const bgRgb = `${bgR}, ${bgG}, ${bgB}`;

    document.documentElement.style.setProperty('--accent-color', `rgb(${rgbStr})`);
    document.documentElement.style.setProperty('--accent-color-rgb', rgbStr);
    document.documentElement.style.setProperty('--accent-glow', `rgba(${rgbStr}, 0.55)`);
    document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${rgbStr}, 0.65)`);
    document.documentElement.style.setProperty('--bg-base', `rgb(${bgRgb})`);
    document.documentElement.style.setProperty('--bg-base-rgb', bgRgb);
    document.documentElement.style.setProperty('--orb-color-1', `rgba(${rgbStr}, 0.45)`);
    document.documentElement.style.setProperty('--orb-color-2', `rgba(${Math.min(255, r + 40)}, ${Math.max(0, g - 20)}, ${Math.min(255, b + 60)}, 0.35)`);
    document.documentElement.style.setProperty('--orb-color-3', `rgba(${Math.max(0, r - 30)}, ${Math.min(255, g + 40)}, ${b}, 0.3)`);
  }

  getFontClass(name) {
    if (!name) return 'inter';
    const lower = name.toLowerCase();
    if (lower.includes('playfair')) return 'playfair';
    if (lower.includes('mono')) return 'mono';
    if (lower.includes('jakarta')) return 'jakarta';
    return 'inter';
  }

  initEventListeners() {
    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        this.switchTab(item.dataset.tab);
      });
    });

    document.getElementById('player-cover-trigger')?.addEventListener('click', () => {
      this.switchTab('lyrics');
    });

    // Playback Controls
    this.btnPlayPause.addEventListener('click', () => this.audioPlayer.togglePlay());
    this.btnPrev.addEventListener('click', () => this.audioPlayer.prev());
    this.btnNext.addEventListener('click', () => this.audioPlayer.next());
    this.btnShuffle.addEventListener('click', () => this.audioPlayer.toggleShuffle());
    this.btnRepeat.addEventListener('click', () => this.audioPlayer.cycleRepeat());

    // Like button
    this.btnPlayerLike.addEventListener('click', () => {
      if (!this.currentTrack) return;
      const isLiked = Storage.toggleLike(this.currentTrack);
      this.btnPlayerLike.classList.toggle('liked', isLiked);
      this.renderFavorites();
      this.updateTrackRowLikes();
    });

    // Seek progress bar
    this.seekTrack.addEventListener('click', (e) => this.handleSeekClick(e));
    this.seekTrack.addEventListener('mousemove', (e) => this.handleSeekHover(e));

    this.fsSeekTrack.addEventListener('click', (e) => {
      const rect = this.fsSeekTrack.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audioPlayer.seek(pct * (this.audioPlayer.audio.duration || 0));
    });

    // Volume control
    this.btnMute.addEventListener('click', () => this.audioPlayer.toggleMute());
    this.volumeTrack.addEventListener('click', (e) => {
      const rect = this.volumeTrack.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.audioPlayer.setVolume(pct);
    });

    // Queue Pane
    this.btnToggleQueue.addEventListener('click', () => {
      this.queuePane.classList.toggle('hidden');
    });
    this.btnCloseQueue.addEventListener('click', () => {
      this.queuePane.classList.add('hidden');
    });
    this.btnClearQueue.addEventListener('click', () => {
      this.audioPlayer.clearQueue();
    });

    // Fullscreen & Overlay Modes
    this.btnPlayerFullscreen.addEventListener('click', () => this.toggleFullscreenMode());
    this.btnHeaderFullscreen.addEventListener('click', () => this.toggleFullscreenMode());
    this.btnExitFullscreen.addEventListener('click', () => this.toggleFullscreenMode(false));

    this.btnPlayerOverlay.addEventListener('click', () => this.toggleOverlayMode());
    this.btnHeaderOverlay.addEventListener('click', () => this.toggleOverlayMode());
    this.btnOverlayExpand.addEventListener('click', () => this.toggleOverlayMode(false));

    this.btnOverlayPlayPause.addEventListener('click', () => this.audioPlayer.togglePlay());
    this.btnOverlayNext.addEventListener('click', () => this.audioPlayer.next());
    this.btnFsPlayPause.addEventListener('click', () => this.audioPlayer.togglePlay());
    this.btnFsPrev.addEventListener('click', () => this.audioPlayer.prev());
    this.btnFsNext.addEventListener('click', () => this.audioPlayer.next());

    this.fullscreenOverlay.addEventListener('mousemove', () => {
      this.fsHud.classList.add('visible');
      clearTimeout(this.hudTimer);
      this.hudTimer = setTimeout(() => {
        if (!this.isHoveringFsHud) {
          this.fsHud.classList.remove('visible');
        }
      }, 3000);
    });

    this.fsHud.addEventListener('mouseenter', () => {
      this.isHoveringFsHud = true;
      clearTimeout(this.hudTimer);
      this.fsHud.classList.add('visible');
    });

    this.fsHud.addEventListener('mouseleave', () => {
      this.isHoveringFsHud = false;
      this.hudTimer = setTimeout(() => {
        this.fsHud.classList.remove('visible');
      }, 2000);
    });

    // Style Pills (Toolbar)
    this.stylePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const style = pill.dataset.style;
        this.settings.lyricStyle = style;
        Storage.saveSettings(this.settings);
        this.lyricsEngine.setStyle(style);
        this.fsLyricsEngine.setStyle(style);
        this.stylePills.forEach(p => p.classList.toggle('active', p === pill));
      });
    });

    // Offset Buttons
    this.btnOffsetMinus.addEventListener('click', () => this.adjustLyricOffset(-0.5));
    this.btnOffsetPlus.addEventListener('click', () => this.adjustLyricOffset(0.5));

    this.btnImportLrc.addEventListener('click', () => this.handleImportLrc());
    this.btnFetchLyrics.addEventListener('click', () => this.fetchLyricsForCurrentTrack(true));

    // Search Input
    this.musicSearchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchDebounceTimer);
      const query = e.target.value.trim();
      this.btnClearSearch.classList.toggle('hidden', query.length === 0);
      if (query.length < 2) {
        this.searchResultsList.innerHTML = '<div class="lyrics-empty-state"><p class="empty-sub">Type a song or artist name to search full tracks</p></div>';
        return;
      }
      this.searchSpinner.classList.remove('hidden');
      this.searchDebounceTimer = setTimeout(() => {
        this.executeSearch(query);
      }, 350);
    });

    this.btnClearSearch.addEventListener('click', () => {
      this.musicSearchInput.value = '';
      this.btnClearSearch.classList.add('hidden');
      this.searchResultsList.innerHTML = '';
    });

    // Local Files
    this.btnOpenFiles.addEventListener('click', () => this.handleOpenFiles());
    this.btnOpenDir.addEventListener('click', () => this.handleOpenDir());

    this.libraryDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.libraryDropzone.classList.add('dragover');
    });
    this.libraryDropzone.addEventListener('dragleave', () => {
      this.libraryDropzone.classList.remove('dragover');
    });
    this.libraryDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.libraryDropzone.classList.remove('dragover');
      this.handleOpenFiles();
    });

    // Settings Modal Open/Close (Accessible everywhere: Titlebar, Sidebar, Stage, and Fullscreen HUD!)
    const openSettings = () => this.settingsModal.classList.remove('hidden');
    if (this.btnHeaderSettings) this.btnHeaderSettings.addEventListener('click', openSettings);
    if (this.btnSidebarSettings) this.btnSidebarSettings.addEventListener('click', openSettings);
    if (this.btnStageSettings) this.btnStageSettings.addEventListener('click', openSettings);
    if (this.btnFsSettings) this.btnFsSettings.addEventListener('click', openSettings);
    this.btnCloseSettings.addEventListener('click', () => {
      this.settingsModal.classList.add('hidden');
    });
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) {
        this.settingsModal.classList.add('hidden');
      }
    });

    // Settings Modal Options
    document.querySelectorAll('.opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const setting = btn.dataset.setting;
        const val = btn.dataset.val;
        this.settings[setting] = val;
        Storage.saveSettings(this.settings);
        this.applySettings(this.settings);
        btn.parentElement.querySelectorAll('.opt-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Sliders
    this.inputGlassBlur.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.labelBlurVal.textContent = `${val}px`;
      this.settings.glassBlur = val;
      Storage.saveSettings(this.settings);
      document.documentElement.style.setProperty('--glass-blur', `${val}px`);
    });

    this.inputAcrylicOpacity.addEventListener('input', (e) => {
      const pct = parseInt(e.target.value, 10);
      this.labelOpacityVal.textContent = `${pct}%`;
      this.settings.acrylicOpacity = pct / 100;
      Storage.saveSettings(this.settings);
      document.documentElement.style.setProperty('--glass-surface-opacity', `${this.settings.acrylicOpacity}`);
    });

    this.inputAmbientIntensity.addEventListener('input', (e) => {
      const pct = parseInt(e.target.value, 10);
      this.labelIntensityVal.textContent = `${pct}%`;
      this.settings.ambientIntensity = pct / 100;
      Storage.saveSettings(this.settings);
      document.documentElement.style.setProperty('--ambient-intensity', `${this.settings.ambientIntensity}`);
    });

    if (this.inputAmbientSpread) {
      this.inputAmbientSpread.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.labelSpreadVal.textContent = `${val}px`;
        this.settings.ambientSpread = val;
        Storage.saveSettings(this.settings);
        document.documentElement.style.setProperty('--halo-spread', `${val}px`);
      });
    }

    if (this.inputAmbientSpeed) {
      this.inputAmbientSpeed.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) / 10;
        this.labelSpeedVal.textContent = `${val.toFixed(1)}x`;
        this.settings.ambientSpeed = val;
        Storage.saveSettings(this.settings);
        document.documentElement.style.setProperty('--ambient-speed', `${val}`);
      });
    }

    if (this.inputBeatSensitivity) {
      this.inputBeatSensitivity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10) / 10;
        this.labelSensitivityVal.textContent = `${val.toFixed(1)}x`;
        this.settings.beatSensitivity = val;
        Storage.saveSettings(this.settings);
      });
    }

    if (this.inputCustomAmbientColor) {
      this.inputCustomAmbientColor.addEventListener('input', (e) => {
        const hex = e.target.value;
        this.settings.customAmbientColor = hex;
        this.settings.ambientColorSource = 'custom';
        Storage.saveSettings(this.settings);
        const r = parseInt(hex.slice(1, 3), 16) || 99;
        const g = parseInt(hex.slice(3, 5), 16) || 136;
        const b = parseInt(hex.slice(5, 7), 16) || 255;
        document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${r}, ${g}, ${b}, 0.75)`);
      });
    }

    this.inputFocusPosition.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.labelFocusVal.textContent = `${val}%`;
      this.settings.focusPosition = val;
      Storage.saveSettings(this.settings);
      this.lyricsEngine.setFocusPosition(val);
    });

    this.inputCustomColor.addEventListener('input', (e) => {
      const hex = e.target.value;
      this.settings.customAccentColor = hex;
      this.settings.themePreset = 'custom';
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    // Toggles
    this.toggleAmbientLighting.addEventListener('change', (e) => {
      this.settings.ambientLighting = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.toggleParticles.addEventListener('change', (e) => {
      this.settings.showParticles = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.toggleMinTray.addEventListener('change', (e) => {
      this.settings.minimizeToTray = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.toggleCloseTray.addEventListener('change', (e) => {
      this.settings.closeToTray = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.toggleMediaKeys.addEventListener('change', (e) => {
      this.settings.globalMediaKeys = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.toggleWordSync.addEventListener('change', (e) => {
      this.settings.wordSyncEnabled = e.target.checked;
      Storage.saveSettings(this.settings);
      this.lyricsEngine.setWordSync(e.target.checked);
      this.fsLyricsEngine.setWordSync(e.target.checked);
    });

    this.toggleAutoLrclib.addEventListener('change', (e) => {
      this.settings.autoFetchLyrics = e.target.checked;
      Storage.saveSettings(this.settings);
    });

    this.toggleReducedMotion.addEventListener('change', (e) => {
      this.settings.reducedMotion = e.target.checked;
      Storage.saveSettings(this.settings);
      this.applySettings(this.settings);
    });

    this.btnClearHistory.addEventListener('click', () => {
      Storage.clearHistory();
      this.renderHistory();
    });

    // Playlists & Modal Event Listeners
    if (this.btnCreatePlaylistHeader) {
      this.btnCreatePlaylistHeader.addEventListener('click', () => this.openCreatePlaylistModal());
    }
    if (this.btnBackPlaylists) {
      this.btnBackPlaylists.addEventListener('click', () => this.closePlaylistDetail());
    }
    if (this.btnPlaylistPlayAll) {
      this.btnPlaylistPlayAll.addEventListener('click', () => this.playCurrentPlaylist());
    }
    if (this.btnPlaylistAddQueue) {
      this.btnPlaylistAddQueue.addEventListener('click', () => this.addCurrentPlaylistToQueue());
    }
    if (this.btnPlaylistDelete) {
      this.btnPlaylistDelete.addEventListener('click', () => this.deleteCurrentPlaylist());
    }
    if (this.inputSearchPlaylists) {
      this.inputSearchPlaylists.addEventListener('input', (e) => this.renderPlaylists(e.target.value.trim()));
    }
    if (this.btnSubmitCreatePlaylist) {
      this.btnSubmitCreatePlaylist.addEventListener('click', () => this.submitCreatePlaylist());
    }
    if (this.btnCancelCreatePlaylist) {
      this.btnCancelCreatePlaylist.addEventListener('click', () => this.closeCreatePlaylistModal());
    }
    if (this.btnCloseCreatePlaylist) {
      this.btnCloseCreatePlaylist.addEventListener('click', () => this.closeCreatePlaylistModal());
    }
    if (this.inputPlaylistName) {
      this.inputPlaylistName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.submitCreatePlaylist();
      });
    }
    if (this.btnCloseAddPlaylist) {
      this.btnCloseAddPlaylist.addEventListener('click', () => this.closeAddToPlaylistModal());
    }
    if (this.btnQuickCreatePl) {
      this.btnQuickCreatePl.addEventListener('click', () => this.quickCreateAndAddTrack());
    }
    if (this.inputQuickPlaylistName) {
      this.inputQuickPlaylistName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.quickCreateAndAddTrack();
      });
    }
    if (this.btnWelcomeStart) {
      this.btnWelcomeStart.addEventListener('click', () => {
        if (this.firstRunModal) this.firstRunModal.classList.add('hidden');
      });
    }

    // GitHub Creator External Link
    document.querySelectorAll('.github-link-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const url = btn.dataset.url || 'https://github.com/jeetron1x';
        if (window.electronAPI) {
          window.electronAPI.openExternal(url);
        } else {
          window.open(url, '_blank');
        }
      });
    });

    if (window.electronAPI) {
      this.btnWinMinimize.addEventListener('click', () => window.electronAPI.minimize());
      this.btnWinMaximize.addEventListener('click', () => window.electronAPI.maximize());
      this.btnWinClose.addEventListener('click', () => window.electronAPI.close());
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Audio Player Callbacks
    this.audioPlayer.onTrackChange = (track) => this.handleTrackChanged(track);
    this.audioPlayer.onTimeUpdate = (currentTime, duration) => this.handleTimeUpdated(currentTime, duration);
    this.audioPlayer.onPlayStateChange = (isPlaying) => this.handlePlayStateChanged(isPlaying);
    this.audioPlayer.onQueueChange = (queue, curIdx) => this.handleQueueChanged(queue, curIdx);
    this.audioPlayer.onVolumeChange = (vol, isMuted) => this.handleVolumeChanged(vol, isMuted);
    this.audioPlayer.onModeChange = (mode) => this.handleModeChanged(mode);
  }

  initIPCListeners() {
    if (!window.electronAPI) return;

    window.electronAPI.onMediaCommand((cmd) => {
      if (cmd === 'toggle-play') this.audioPlayer.togglePlay();
      else if (cmd === 'next') this.audioPlayer.next();
      else if (cmd === 'prev') this.audioPlayer.prev();
      else if (cmd === 'toggle-overlay') this.toggleOverlayMode();
    });

    window.electronAPI.onOverlayModeChanged((isOverlay) => {
      this.isOverlay = isOverlay;
      this.updateOverlayUI();
    });

    window.electronAPI.onFullscreenChanged((isFs) => {
      this.isFullScreen = isFs;
      this.fullscreenOverlay.classList.toggle('hidden', !isFs);
      if (isFs) {
        this.fsLyricsEngine.setStyle(this.settings.lyricStyle || 'kinetic');
        this.fsLyricsEngine.setGlowLevel(this.settings.lyricGlow || 'radiant');
        this.fsLyricsEngine.setWordSync(this.settings.wordSyncEnabled);
        this.fsLyricsEngine.setFocusPosition(50);
        if (this.currentLyricsText) {
          this.fsLyricsEngine.parseLrc(this.currentLyricsText, this.currentTrack ? this.currentTrack.duration : 0);
        }
        this.fsLyricsEngine.update(this.audioPlayer.audio.currentTime || 0);
        setTimeout(() => this.fsLyricsEngine.scrollToActiveLine(false), 50);
      }
    });
  }

  initVisualizer() {
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const orb3 = document.querySelector('.orb-3');

    // Continuous 120 FPS ambient loop for Breathe, Aurora, Spectrum cycle, and organic flow
    const ambientLoop = () => {
      if (this.settings.ambientLighting !== false) {
        const mode = this.settings.ambientMode || 'beat';
        const colorSource = this.settings.ambientColorSource || 'monochrome';
        const speed = this.settings.ambientSpeed || 1.0;
        const intensity = this.settings.ambientIntensity || 1.0;
        const baseSpread = this.settings.ambientSpread || 45;

        // Color Source Handling
        if (colorSource === 'spectrum') {
          const hue = Math.round((performance.now() * 0.05 * speed) % 360);
          document.documentElement.style.setProperty('--ambient-glow-color', `hsla(${hue}, 88%, 62%, 0.75)`);
        } else if (colorSource === 'cyberpunk') {
          const t = Math.sin(performance.now() * 0.002 * speed);
          const r = Math.round(t > 0 ? 0 : 255);
          const g = Math.round(t > 0 ? 230 : 0);
          const b = Math.round(t > 0 ? 255 : 128);
          document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${r}, ${g}, ${b}, 0.75)`);
        } else if (colorSource === 'sunset') {
          const t = (Math.sin(performance.now() * 0.002 * speed) + 1) * 0.5;
          const r = Math.round(255);
          const g = Math.round(120 * t + 40 * (1 - t));
          const b = Math.round(30 * t + 120 * (1 - t));
          document.documentElement.style.setProperty('--ambient-glow-color', `rgba(${r}, ${g}, ${b}, 0.75)`);
        } else if (colorSource === 'monochrome') {
          document.documentElement.style.setProperty('--ambient-glow-color', 'rgba(255, 255, 255, 0.75)');
        }

        // Mode Animation Handling
        if (mode === 'breathe') {
          const breath = (Math.sin(performance.now() * 0.0022 * speed) + 1) * 0.5;
          const currentSpread = Math.round(baseSpread * 0.8 + breath * (baseSpread * 0.6));
          const currentOpacity = (0.45 + breath * 0.45 * intensity).toFixed(2);
          document.documentElement.style.setProperty('--halo-spread', `${currentSpread}px`);
          document.documentElement.style.setProperty('--halo-opacity', `${currentOpacity}`);
        } else if (mode === 'aurora') {
          const wave = (Math.sin(performance.now() * 0.0035 * speed) + Math.cos(performance.now() * 0.002 * speed)) * 0.35 + 0.65;
          const currentSpread = Math.round(baseSpread * wave);
          const currentOpacity = Math.min(1.0, (0.55 + wave * 0.4 * intensity)).toFixed(2);
          document.documentElement.style.setProperty('--halo-spread', `${currentSpread}px`);
          document.documentElement.style.setProperty('--halo-opacity', `${currentOpacity}`);
        } else if (mode === 'neon') {
          document.documentElement.style.setProperty('--halo-spread', '20px');
          document.documentElement.style.setProperty('--halo-opacity', `${(0.95 * intensity).toFixed(2)}`);
        } else if (mode === 'static') {
          document.documentElement.style.setProperty('--halo-spread', `${baseSpread}px`);
          document.documentElement.style.setProperty('--halo-opacity', `${(0.75 * intensity).toFixed(2)}`);
        }
      }

      requestAnimationFrame(ambientLoop);
    };
    requestAnimationFrame(ambientLoop);

    this.audioPlayer.onAudioFrequencies = ({ bass, mid, treble }) => {
      if (this.settings.reducedMotion) return;

      const mode = this.settings.ambientMode || 'beat';
      const sensitivity = this.settings.beatSensitivity || 1.0;
      const intensity = this.settings.ambientIntensity || 1.0;
      const baseSpread = this.settings.ambientSpread || 45;

      const bassDelta = bass - this.prevBass;
      this.prevBass = bass;

      if (bassDelta > 0.04 / sensitivity && bass > 0.28) {
        this.beatBloom = 1.35 * Math.min(1.8, sensitivity);
      } else {
        this.beatBloom = Math.max(1.0, this.beatBloom * this.beatDecayRate);
      }

      const dynamicScale1 = (1 + bass * 0.26 * intensity * this.beatBloom).toFixed(3);
      const dynamicScale2 = (1 + mid * 0.18 * intensity).toFixed(3);
      const dynamicScale3 = (1 + treble * 0.14 * intensity).toFixed(3);

      if (orb1) orb1.style.transform = `scale(${dynamicScale1})`;
      if (orb2) orb2.style.transform = `scale(${dynamicScale2})`;
      if (orb3) orb3.style.transform = `scale(${dynamicScale3})`;

      if (this.settings.ambientLighting !== false && mode === 'beat') {
        const glowSpread = Math.round(baseSpread + bass * 60 * intensity * this.beatBloom);
        const glowOpacity = Math.min(1.0, (0.5 + bass * 0.5 * intensity * this.beatBloom)).toFixed(2);
        document.documentElement.style.setProperty('--halo-spread', `${glowSpread}px`);
        document.documentElement.style.setProperty('--halo-opacity', `${glowOpacity}`);
        document.documentElement.style.setProperty('--beat-bloom', `${this.beatBloom.toFixed(2)}`);
      }
    };
  }

  switchTab(tabId) {
    this.navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabId));
    this.viewPanels.forEach(panel => {
      const isActive = panel.id === `view-${tabId}`;
      panel.classList.toggle('active', isActive);
      if (isActive && tabId === 'lyrics') {
        this.lyricsEngine.scrollToActiveLine(false);
      }
    });
    if (tabId === 'playlists') {
      this.renderPlaylists();
    }
  }

  handleTrackChanged(track) {
    this.currentTrack = track;
    Storage.addToHistory(track);
    Storage.saveLastPlayedTrack(track);
    this.renderHistory();

    const title = track.title || 'Unknown Title';
    const artist = track.artist || 'Unknown Artist';
    const cover = track.coverUrl || 'assets/covers/default-cover.svg';

    this.playerTitle.textContent = title;
    this.playerArtist.textContent = artist;
    this.playerCoverImg.src = cover;

    this.titlebarTitle.textContent = title;
    this.titlebarArtist.textContent = artist;
    if (this.titlebarNowPlaying) this.titlebarNowPlaying.classList.remove('hidden');

    this.sidebarTrackTitle.textContent = title;
    this.sidebarTrackArtist.textContent = artist;
    this.sidebarCoverImg.src = cover;
    if (this.sidebarTrackPreview) this.sidebarTrackPreview.classList.remove('hidden');

    this.fsTrackTitle.textContent = title;
    this.fsTrackArtist.textContent = artist;

    this.overlayTitle.textContent = title;
    this.overlayArtist.textContent = artist;
    this.overlayCoverImg.src = cover;

    const isLiked = Storage.isLiked(track.id);
    this.btnPlayerLike.classList.toggle('liked', isLiked);

    if (window.electronAPI) {
      window.electronAPI.updatePlaybackStatus({
        title,
        artist,
        isPlaying: this.audioPlayer.isPlaying
      });
    }

    // Dynamic Theme extraction
    if (this.settings.themePreset === 'dynamic') {
      this.extractPaletteFromCover(cover);
    }

    this.loadLyricsForTrack(track);
  }

  async loadLyricsForTrack(track) {
    const savedOffset = Storage.getLyricOffset(track.id);
    this.lyricsEngine.setOffset(savedOffset);
    this.fsLyricsEngine.setOffset(savedOffset);
    this.offsetIndicator.textContent = `${savedOffset >= 0 ? '+' : ''}${savedOffset.toFixed(1)}s`;

    if (track.localLrc) {
      this.currentLyricsText = track.localLrc;
      this.lyricsEngine.parseLrc(track.localLrc, track.duration);
      this.fsLyricsEngine.parseLrc(track.localLrc, track.duration);
      return;
    }

    if (this.settings.autoFetchLyrics) {
      await this.fetchLyricsForCurrentTrack(false);
    } else {
      this.lyricsEngine.renderEmpty('No lyrics loaded. Click "Fetch" to search LRCLIB.');
      this.fsLyricsEngine.renderEmpty('No lyrics loaded');
    }
  }

  async fetchLyricsForCurrentTrack(isManual = false) {
    if (!this.currentTrack) return;
    this.btnFetchLyrics.classList.add('loading');

    try {
      if (window.electronAPI) {
        const lyricsData = await window.electronAPI.fetchLrcLibLyrics({
          trackName: this.currentTrack.title,
          artistName: this.currentTrack.artist,
          duration: this.currentTrack.duration
        });

        if (lyricsData && (lyricsData.syncedLyrics || lyricsData.plainLyrics)) {
          const text = lyricsData.syncedLyrics || lyricsData.plainLyrics;
          this.currentLyricsText = text;
          this.lyricsEngine.parseLrc(text, this.currentTrack.duration);
          this.fsLyricsEngine.parseLrc(text, this.currentTrack.duration);
        } else {
          if (isManual) alert(`No lyrics found on LRCLIB for "${this.currentTrack.title}"`);
          this.lyricsEngine.renderEmpty('No lyrics found for this track');
          this.fsLyricsEngine.renderEmpty('No lyrics found');
        }
      }
    } catch (e) {
      console.error('Fetch lyrics error:', e);
    } finally {
      this.btnFetchLyrics.classList.remove('loading');
    }
  }

  adjustLyricOffset(delta) {
    if (!this.currentTrack) return;
    const cur = Storage.getLyricOffset(this.currentTrack.id);
    const updated = Math.round((cur + delta) * 10) / 10;
    Storage.setLyricOffset(this.currentTrack.id, updated);
    this.lyricsEngine.setOffset(updated);
    this.fsLyricsEngine.setOffset(updated);
    this.offsetIndicator.textContent = `${updated >= 0 ? '+' : ''}${updated.toFixed(1)}s`;
  }

  async handleImportLrc() {
    if (!this.currentTrack || !window.electronAPI) return;
    const res = await window.electronAPI.openLrcDialog();
    if (res && res.content) {
      this.currentLyricsText = res.content;
      this.lyricsEngine.parseLrc(res.content, this.currentTrack.duration);
      this.fsLyricsEngine.parseLrc(res.content, this.currentTrack.duration);
    }
  }

  handleTimeUpdated(currentTime, duration) {
    if (duration > 0) {
      const pct = (currentTime / duration) * 100;
      this.seekFill.style.width = `${pct}%`;
      this.seekThumb.style.left = `${pct}%`;
      this.fsSeekFill.style.width = `${pct}%`;
    }

    this.timeCurrent.textContent = this.formatTime(currentTime);
    this.fsTimeCurrent.textContent = this.formatTime(currentTime);

    if (duration > 0) {
      this.timeTotal.textContent = this.formatTime(duration);
      this.fsTimeTotal.textContent = this.formatTime(duration);
    }

    this.lyricsEngine.update(currentTime);
    if (this.isFullScreen) {
      this.fsLyricsEngine.update(currentTime);
    }
  }

  handlePlayStateChanged(isPlaying) {
    this.iconPlay.classList.toggle('hidden', isPlaying);
    this.iconPause.classList.toggle('hidden', !isPlaying);
    this.fsIconPlay.classList.toggle('hidden', isPlaying);
    this.fsIconPause.classList.toggle('hidden', !isPlaying);
    this.overlayIconPlay.classList.toggle('hidden', isPlaying);
    this.overlayIconPause.classList.toggle('hidden', !isPlaying);

    if (window.electronAPI && this.currentTrack) {
      window.electronAPI.updatePlaybackStatus({
        title: this.currentTrack.title,
        artist: this.currentTrack.artist,
        isPlaying
      });
    }
  }

  handleQueueChanged(queue, curIdx) {
    this.queueCount.textContent = `${queue.length} track${queue.length === 1 ? '' : 's'}`;
    this.renderQueueList();
    this.updateTrackRowActive();
  }

  handleVolumeChanged(vol, isMuted) {
    this.volumeFill.style.width = `${(isMuted ? 0 : vol) * 100}%`;
    this.iconVolHigh.classList.toggle('hidden', isMuted || vol === 0);
    this.iconVolMute.classList.toggle('hidden', !isMuted && vol > 0);
  }

  handleModeChanged({ shuffle, repeat }) {
    this.btnShuffle.classList.toggle('active', shuffle);
    this.btnRepeat.classList.toggle('active', repeat !== 'none');
    this.repeatBadge.classList.toggle('hidden', repeat !== 'one');
  }

  handleSeekClick(e) {
    const rect = this.seekTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = this.audioPlayer.audio.duration;
    if (dur && !isNaN(dur)) {
      this.audioPlayer.seek(pct * dur);
    }
  }

  handleSeekHover(e) {
    const rect = this.seekTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = this.audioPlayer.audio.duration || 0;
    this.seekTooltip.textContent = this.formatTime(pct * dur);
    this.seekTooltip.style.left = `${pct * 100}%`;
  }

  toggleFullscreenMode(explicitVal) {
    this.isFullScreen = explicitVal !== undefined ? explicitVal : !this.isFullScreen;
    this.fullscreenOverlay.classList.toggle('hidden', !this.isFullScreen);

    if (window.electronAPI) {
      window.electronAPI.toggleFullscreen(this.isFullScreen);
    }

    if (this.isFullScreen) {
      this.fsLyricsEngine.setStyle(this.settings.lyricStyle || 'kinetic');
      this.fsLyricsEngine.setGlowLevel(this.settings.lyricGlow || 'radiant');
      this.fsLyricsEngine.setWordSync(this.settings.wordSyncEnabled);
      this.fsLyricsEngine.setFocusPosition(50);
      if (this.currentLyricsText) {
        this.fsLyricsEngine.parseLrc(this.currentLyricsText, this.currentTrack ? this.currentTrack.duration : 0);
      }
      this.fsLyricsEngine.update(this.audioPlayer.audio.currentTime || 0);
      setTimeout(() => {
        this.fsLyricsEngine.scrollToActiveLine(false);
      }, 50);
    }
  }

  async toggleOverlayMode(explicitVal) {
    if (!window.electronAPI) return;
    this.isOverlay = explicitVal !== undefined ? explicitVal : !this.isOverlay;
    if (this.isOverlay && this.isFullScreen) {
      this.toggleFullscreenMode(false);
    }
    await window.electronAPI.toggleOverlayMode(this.isOverlay);
    this.updateOverlayUI();
  }

  updateOverlayUI() {
    if (this.isOverlay) {
      document.body.classList.add('is-overlay-mode');
      this.appShell.classList.add('hidden');
      this.desktopOverlayWidget.classList.remove('hidden');
      if (this.lyricsEngine && this.lyricsEngine.lines.length > 0) {
        this.lyricsEngine.updateDesktopOverlay(
          this.lyricsEngine.lines[this.lyricsEngine.activeIndex],
          this.audioPlayer.currentTime
        );
      }
    } else {
      document.body.classList.remove('is-overlay-mode');
      this.appShell.classList.remove('hidden');
      this.desktopOverlayWidget.classList.add('hidden');
    }
  }

  handleKeyboardShortcuts(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.audioPlayer.togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (e.ctrlKey) this.audioPlayer.prev();
        else this.audioPlayer.seekRelative(-5);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (e.ctrlKey) this.audioPlayer.next();
        else this.audioPlayer.seekRelative(5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.audioPlayer.setVolume(this.audioPlayer.volume + 0.05);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.audioPlayer.setVolume(this.audioPlayer.volume - 0.05);
        break;
      case 'KeyL':
        this.switchTab('lyrics');
        break;
      case 'KeyF':
      case 'F11':
        e.preventDefault();
        this.toggleFullscreenMode();
        break;
      case 'KeyT':
        this.toggleOverlayMode();
        break;
      case 'KeyM':
        this.audioPlayer.toggleMute();
        break;
      case 'KeyS':
        this.audioPlayer.toggleShuffle();
        break;
      case 'KeyR':
        this.audioPlayer.cycleRepeat();
        break;
      case 'Comma':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.settingsModal.classList.toggle('hidden');
        }
        break;
      case 'KeyO':
        e.preventDefault();
        this.settingsModal.classList.toggle('hidden');
        break;
      case 'Escape':
        if (this.isFullScreen) this.toggleFullscreenMode(false);
        if (!this.settingsModal.classList.contains('hidden')) {
          this.settingsModal.classList.add('hidden');
        }
        break;
    }
  }

  async executeSearch(query) {
    if (!window.electronAPI) return;

    try {
      const onlineResults = await window.electronAPI.searchOnlineMusic(query);

      const qLower = query.toLowerCase();
      const localMatches = this.localLibrary.filter(t =>
        t.title.toLowerCase().includes(qLower) || t.artist.toLowerCase().includes(qLower)
      );

      const combined = [...localMatches, ...onlineResults];
      this.renderTracksList(this.searchResultsList, combined, 'search');
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      this.searchSpinner.classList.add('hidden');
    }
  }

  async handleOpenFiles() {
    if (!window.electronAPI) return;
    const tracks = await window.electronAPI.openFileDialog();
    if (tracks && tracks.length > 0) {
      this.addTracksToLibrary(tracks);
    }
  }

  async handleOpenDir() {
    if (!window.electronAPI) return;
    const tracks = await window.electronAPI.openDirectoryDialog();
    if (tracks && tracks.length > 0) {
      this.addTracksToLibrary(tracks);
    }
  }

  addTracksToLibrary(newTracks) {
    for (const t of newTracks) {
      if (!this.localLibrary.some(existing => existing.id === t.id)) {
        this.localLibrary.push(t);
      }
    }
    this.renderTracksList(this.libraryTracksList, this.localLibrary, 'library');
    this.audioPlayer.addToQueue(newTracks[0]);
  }

  renderTracksList(container, tracks, listType = 'general') {
    if (!container) return;
    container.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      container.innerHTML = `
        <div class="lyrics-empty-state">
          <p class="empty-msg">${listType === 'library' ? 'Your library is empty' : listType === 'playlist_detail' ? 'This playlist is empty' : 'No tracks found'}</p>
          <p class="empty-sub">${listType === 'library' ? 'Add local audio files or search music online' : listType === 'playlist_detail' ? 'Add songs from Search or your Library to this playlist' : 'Type a song or artist name above'}</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    tracks.forEach((track, index) => {
      const row = document.createElement('div');
      row.className = 'track-row';
      row.dataset.id = track.id;
      if (this.currentTrack && this.currentTrack.id === track.id) {
        row.classList.add('active');
      }

      const coverSrc = track.coverUrl || 'assets/covers/default-cover.svg';
      const isLiked = Storage.isLiked(track.id);

      row.innerHTML = `
        <img class="row-cover" src="${coverSrc}" alt="Cover" loading="lazy">
        <div class="row-info">
          <div class="row-title">${this.escapeHtml(track.title)}</div>
          <div class="row-artist">${this.escapeHtml(track.artist)}</div>
        </div>
        <div class="row-album">${this.escapeHtml(track.album || '')}</div>
        <div class="row-duration">${this.formatTime(track.duration || 0)}</div>
        <div class="row-actions">
          <button class="row-btn like-btn ${isLiked ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="${isLiked ? '#f43f5e' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button class="row-btn btn-add-queue" title="Add to Up Next Queue">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="row-btn btn-play-next" title="Play Next in Queue">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>
          <button class="row-btn btn-add-playlist" title="Add to Playlist">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="16" y2="18"></line>
              <circle cx="4" cy="6" r="2"></circle>
              <circle cx="4" cy="12" r="2"></circle>
              <circle cx="4" cy="18" r="2"></circle>
            </svg>
          </button>
          ${listType === 'playlist_detail' ? `
            <button class="row-btn btn-remove-pl-track" title="Remove from this playlist">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ` : ''}
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('.row-actions')) return;
        this.audioPlayer.loadQueue(tracks, index, true);
        this.switchTab('lyrics');
      });

      const likeBtn = row.querySelector('.like-btn');
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const liked = Storage.toggleLike(track);
        likeBtn.classList.toggle('liked', liked);
        likeBtn.querySelector('svg').setAttribute('fill', liked ? '#f43f5e' : 'none');
        if (this.currentTrack && this.currentTrack.id === track.id) {
          this.btnPlayerLike.classList.toggle('liked', liked);
        }
        this.renderFavorites();
      });

      const addQueueBtn = row.querySelector('.btn-add-queue');
      addQueueBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audioPlayer.addToQueue(track, false);
        this.showToast(`Added to Up Next: "${track.title}"`, '🎶');
      });

      const playNextBtn = row.querySelector('.btn-play-next');
      playNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.audioPlayer.addToQueue(track, true);
        this.showToast(`Playing next: "${track.title}"`, '⏭️');
      });

      const addPlaylistBtn = row.querySelector('.btn-add-playlist');
      addPlaylistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAddToPlaylistModal(track);
      });

      if (listType === 'playlist_detail') {
        const removePlTrackBtn = row.querySelector('.btn-remove-pl-track');
        if (removePlTrackBtn) {
          removePlTrackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.currentActivePlaylistId) {
              Storage.removeTrackFromPlaylist(this.currentActivePlaylistId, track.id);
              this.openPlaylistDetail(this.currentActivePlaylistId);
              this.showToast(`Removed "${track.title}" from playlist`, '🗑');
            }
          });
        }
      }

      fragment.appendChild(row);
    });

    container.appendChild(fragment);
  }

  renderQueueList() {
    this.queueTracksList.innerHTML = '';
    const queue = this.audioPlayer.queue;
    const curIdx = this.audioPlayer.currentIndex;

    if (queue.length === 0) {
      this.queueTracksList.innerHTML = '<div class="lyrics-empty-state"><p class="empty-sub">Queue is empty</p></div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    queue.forEach((track, i) => {
      const item = document.createElement('div');
      item.className = 'queue-item';
      if (i === curIdx) item.classList.add('current');

      const coverSrc = track.coverUrl || 'assets/covers/default-cover.svg';

      item.innerHTML = `
        <img class="queue-item-cover" src="${coverSrc}" alt="Cover">
        <div class="queue-item-meta">
          <div class="queue-item-title">${this.escapeHtml(track.title)}</div>
          <div class="queue-item-artist">${this.escapeHtml(track.artist)}</div>
        </div>
        <button class="queue-item-remove" title="Remove">✕</button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.queue-item-remove')) return;
        this.audioPlayer.currentIndex = i;
        this.audioPlayer.loadTrack(track, true);
        this.renderQueueList();
      });

      item.querySelector('.queue-item-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        this.audioPlayer.removeFromQueue(i);
      });

      fragment.appendChild(item);
    });

    this.queueTracksList.appendChild(fragment);
  }

  renderFavorites() {
    const likes = Storage.getLikes();
    this.renderTracksList(this.favoritesTracksList, likes, 'favorites');
  }

  renderHistory() {
    const history = Storage.getHistory();
    this.renderTracksList(this.historyTracksList, history, 'history');
  }

  updateTrackRowActive() {
    if (!this.currentTrack) return;
    document.querySelectorAll('.track-row').forEach(row => {
      row.classList.toggle('active', row.dataset.id === this.currentTrack.id);
    });
  }

  updateTrackRowLikes() {
    document.querySelectorAll('.track-row').forEach(row => {
      const id = row.dataset.id;
      const isLiked = Storage.isLiked(id);
      const btn = row.querySelector('.like-btn');
      if (btn) {
        btn.classList.toggle('liked', isLiked);
        btn.querySelector('svg').setAttribute('fill', isLiked ? '#f43f5e' : 'none');
      }
    });
  }

  async extractPaletteFromCover(imgUrl) {
    if (!imgUrl) return;

    // 1. Primary: Native Electron image decoder in main process (100% reliable, zero CORS/taint)
    if (window.electronAPI && window.electronAPI.extractCoverPalette) {
      try {
        const palette = await window.electronAPI.extractCoverPalette(imgUrl);
        if (palette && palette.accentRgb) {
          this.applyPaletteTheme(palette);
          Storage.saveLastPalette(palette);
          return;
        }
      } catch (err) {
        console.warn('Native palette IPC warning:', err);
      }
    }

    // 2. Secondary: Client-side canvas fallback
    try {
      let imageSource = imgUrl;
      if (imgUrl.startsWith('http')) {
        try {
          const res = await fetch(imgUrl);
          if (res.ok) {
            const blob = await res.blob();
            imageSource = URL.createObjectURL(blob);
          }
        } catch {
          imageSource = imgUrl;
        }
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 32, 32);
          const data = ctx.getImageData(0, 0, 32, 32).data;

          let vibrantR = 99, vibrantG = 136, vibrantB = 255, maxScore = -1;
          let darkR = 10, darkG = 14, darkB = 20;
          let count = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 128) continue;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            const lum = (max + min) / 510;

            if (lum > 0.18 && lum < 0.88 && sat > 0.15) {
              const score = sat * 2.0 + (1 - Math.abs(lum - 0.5));
              if (score > maxScore) {
                maxScore = score;
                vibrantR = r;
                vibrantG = g;
                vibrantB = b;
              }
            }

            darkR += r;
            darkG += g;
            darkB += b;
            count++;
          }

          if (count > 0) {
            const avgR = Math.min(24, Math.round((darkR / count) * 0.13));
            const avgG = Math.min(28, Math.round((darkG / count) * 0.13));
            const avgB = Math.min(36, Math.round((darkB / count) * 0.13));

            const palette = {
              accentRgb: `${vibrantR}, ${vibrantG}, ${vibrantB}`,
              bgRgb: `${avgR}, ${avgG}, ${avgB}`,
              orb1: `rgba(${vibrantR}, ${vibrantG}, ${vibrantB}, 0.55)`,
              orb2: `rgba(${Math.min(255, vibrantR + 45)}, ${Math.max(0, vibrantG - 25)}, ${Math.min(255, vibrantB + 65)}, 0.45)`,
              orb3: `rgba(${Math.max(0, vibrantR - 35)}, ${Math.min(255, vibrantG + 45)}, ${vibrantB}, 0.38)`
            };

            this.applyPaletteTheme(palette);
            Storage.saveLastPalette(palette);
          }
        } catch (e) {
          console.warn('Canvas palette extraction error:', e.message);
        } finally {
          if (imageSource.startsWith('blob:')) {
            URL.revokeObjectURL(imageSource);
          }
        }
      };
      img.onerror = () => {
        if (imageSource.startsWith('blob:')) {
          URL.revokeObjectURL(imageSource);
        }
      };
      img.src = imageSource;
    } catch (e) {
      console.warn('Cover palette extraction fallback:', e.message);
    }
  }

  // Toast Notifications
  showToast(message, icon = '✓') {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 260);
    }, 2600);
  }

  // First Run / Post-Install Greeting
  checkFirstRun() {
    if (Storage.isFirstRun()) {
      if (this.firstRunModal) {
        this.firstRunModal.classList.remove('hidden');
      }
      if (window.electronAPI) {
        window.electronAPI.openExternal('https://github.com/jeetron1x');
      }
      Storage.setFirstRunDone();
    }
  }

  // Playlists Management
  renderPlaylists(filterText = '') {
    if (!this.playlistsGrid) return;
    this.playlistsGrid.innerHTML = '';
    const allPlaylists = Storage.getPlaylists();

    const filtered = filterText
      ? allPlaylists.filter(p => p.name.toLowerCase().includes(filterText.toLowerCase()))
      : allPlaylists;

    if (filtered.length === 0) {
      this.playlistsGrid.innerHTML = `
        <div class="lyrics-empty-state" style="grid-column: 1 / -1;">
          <p class="empty-msg">${filterText ? 'No matching playlists' : 'No playlists yet'}</p>
          <p class="empty-sub">${filterText ? 'Try a different search query' : 'Create your first playlist and start building your custom music mixes!'}</p>
          ${!filterText ? `
            <button id="btn-create-first-pl" class="primary-button" style="margin-top: 14px;">＋ Create First Playlist</button>
          ` : ''}
        </div>
      `;
      document.getElementById('btn-create-first-pl')?.addEventListener('click', () => this.openCreatePlaylistModal());
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(pl => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      const cover = pl.coverUrl || (pl.tracks && pl.tracks[0]?.coverUrl) || 'assets/covers/default-cover.svg';
      const trackCount = pl.tracks ? pl.tracks.length : 0;

      card.innerHTML = `
        <div class="playlist-thumb-wrap">
          <img class="playlist-thumb" src="${cover}" alt="Playlist Cover" loading="lazy">
          <button class="playlist-quick-play" title="Play Playlist">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
        <div class="playlist-card-title">${this.escapeHtml(pl.name)}</div>
        <div class="playlist-card-meta">
          <span>${trackCount} track${trackCount === 1 ? '' : 's'}</span>
          <button class="playlist-card-delete" title="Delete Playlist">🗑</button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.playlist-quick-play') || e.target.closest('.playlist-card-delete')) return;
        this.openPlaylistDetail(pl.id);
      });

      const playBtn = card.querySelector('.playlist-quick-play');
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pl.tracks && pl.tracks.length > 0) {
          this.audioPlayer.loadQueue(pl.tracks, 0, true);
          this.switchTab('lyrics');
          this.showToast(`Playing playlist: "${pl.name}"`, '▶');
        } else {
          this.showToast(`Playlist "${pl.name}" is empty`, 'ℹ');
        }
      });

      const delBtn = card.querySelector('.playlist-card-delete');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Storage.deletePlaylist(pl.id);
        this.renderPlaylists(this.inputSearchPlaylists?.value.trim() || '');
        this.showToast(`Deleted playlist: "${pl.name}"`, '🗑');
      });

      fragment.appendChild(card);
    });

    this.playlistsGrid.appendChild(fragment);
  }

  openPlaylistDetail(playlistId) {
    const pl = Storage.getPlaylist(playlistId);
    if (!pl) return;
    this.currentActivePlaylistId = playlistId;

    const cover = pl.coverUrl || (pl.tracks && pl.tracks[0]?.coverUrl) || 'assets/covers/default-cover.svg';
    const tracks = pl.tracks || [];
    const totalSecs = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const mins = Math.round(totalSecs / 60);

    if (this.plDetailCover) this.plDetailCover.src = cover;
    if (this.plDetailTitle) this.plDetailTitle.textContent = pl.name;
    if (this.plDetailDesc) this.plDetailDesc.textContent = pl.description || 'Custom playlist created in Lyriic';
    if (this.plDetailCount) this.plDetailCount.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`;
    if (this.plDetailDuration) this.plDetailDuration.textContent = `${mins} min`;

    this.renderTracksList(this.playlistTracksList, tracks, 'playlist_detail');

    if (this.playlistsMainSubview) this.playlistsMainSubview.classList.add('hidden');
    if (this.playlistDetailSubview) this.playlistDetailSubview.classList.remove('hidden');
  }

  closePlaylistDetail() {
    this.currentActivePlaylistId = null;
    if (this.playlistDetailSubview) this.playlistDetailSubview.classList.add('hidden');
    if (this.playlistsMainSubview) this.playlistsMainSubview.classList.remove('hidden');
    this.renderPlaylists(this.inputSearchPlaylists?.value.trim() || '');
  }

  playCurrentPlaylist() {
    if (!this.currentActivePlaylistId) return;
    const pl = Storage.getPlaylist(this.currentActivePlaylistId);
    if (!pl || !pl.tracks || pl.tracks.length === 0) {
      this.showToast('Playlist is empty', 'ℹ');
      return;
    }
    this.audioPlayer.loadQueue(pl.tracks, 0, true);
    this.switchTab('lyrics');
    this.showToast(`Playing playlist: "${pl.name}"`, '▶');
  }

  addCurrentPlaylistToQueue() {
    if (!this.currentActivePlaylistId) return;
    const pl = Storage.getPlaylist(this.currentActivePlaylistId);
    if (!pl || !pl.tracks || pl.tracks.length === 0) {
      this.showToast('Playlist is empty', 'ℹ');
      return;
    }
    this.audioPlayer.addMultipleToQueue(pl.tracks, false);
    this.showToast(`Added ${pl.tracks.length} tracks to Up Next`, '🎶');
  }

  deleteCurrentPlaylist() {
    if (!this.currentActivePlaylistId) return;
    const pl = Storage.getPlaylist(this.currentActivePlaylistId);
    if (!pl) return;
    Storage.deletePlaylist(pl.id);
    this.closePlaylistDetail();
    this.showToast(`Deleted playlist "${pl.name}"`, '🗑');
  }

  // Create Playlist Modal
  openCreatePlaylistModal() {
    if (!this.createPlaylistModal) return;
    this.inputPlaylistName.value = '';
    this.inputPlaylistDesc.value = '';
    this.createPlaylistModal.classList.remove('hidden');
    setTimeout(() => this.inputPlaylistName.focus(), 60);
  }

  closeCreatePlaylistModal() {
    if (this.createPlaylistModal) this.createPlaylistModal.classList.add('hidden');
  }

  submitCreatePlaylist() {
    const name = this.inputPlaylistName.value.trim();
    if (!name) {
      this.inputPlaylistName.focus();
      return;
    }
    const desc = this.inputPlaylistDesc.value.trim();
    const pl = Storage.createPlaylist(name, desc);
    this.closeCreatePlaylistModal();
    this.renderPlaylists();
    this.showToast(`Created playlist: "${pl.name}"`, '✓');
  }

  // Add to Playlist Picker Modal
  openAddToPlaylistModal(track) {
    if (!this.addToPlaylistModal || !track) return;
    this.trackPendingPlaylist = track;
    this.addToPlaylistTrackName.textContent = `Adding: "${track.title}"`;
    this.inputQuickPlaylistName.value = '';
    this.renderPlaylistPickerList();
    this.addToPlaylistModal.classList.remove('hidden');
  }

  closeAddToPlaylistModal() {
    if (this.addToPlaylistModal) this.addToPlaylistModal.classList.add('hidden');
    this.trackPendingPlaylist = null;
  }

  renderPlaylistPickerList() {
    if (!this.playlistsPickerList) return;
    this.playlistsPickerList.innerHTML = '';
    const allPlaylists = Storage.getPlaylists();

    if (allPlaylists.length === 0) {
      this.playlistsPickerList.innerHTML = `
        <div class="empty-sub" style="padding: 12px; text-align: center;">No playlists yet. Create one above!</div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    allPlaylists.forEach(pl => {
      const item = document.createElement('div');
      item.className = 'picker-playlist-item';
      const count = pl.tracks ? pl.tracks.length : 0;

      item.innerHTML = `
        <span class="picker-pl-title">${this.escapeHtml(pl.name)}</span>
        <span class="picker-pl-count">${count} tracks</span>
      `;

      item.addEventListener('click', () => {
        if (!this.trackPendingPlaylist) return;
        const res = Storage.addTrackToPlaylist(pl.id, this.trackPendingPlaylist);
        if (res.alreadyIn) {
          this.showToast(`Already in "${pl.name}"`, 'ℹ');
        } else if (res.success) {
          this.showToast(`Added to "${pl.name}"`, '✓');
          if (this.currentActivePlaylistId === pl.id) {
            this.openPlaylistDetail(pl.id);
          }
        }
        this.closeAddToPlaylistModal();
      });

      fragment.appendChild(item);
    });

    this.playlistsPickerList.appendChild(fragment);
  }

  quickCreateAndAddTrack() {
    const name = this.inputQuickPlaylistName.value.trim();
    if (!name) return;
    const pl = Storage.createPlaylist(name);
    if (this.trackPendingPlaylist) {
      Storage.addTrackToPlaylist(pl.id, this.trackPendingPlaylist);
      this.showToast(`Created "${pl.name}" and added song`, '✓');
      if (this.currentActivePlaylistId === pl.id) {
        this.openPlaylistDetail(pl.id);
      }
    }
    this.closeAddToPlaylistModal();
    this.renderPlaylists();
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.lyriic = new LyriicApp();
});
