// src/preload/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  toggleFullscreen: (val) => ipcRenderer.invoke('toggle-fullscreen', val),
  toggleOverlayMode: (val) => ipcRenderer.invoke('toggle-overlay-mode', val),
  isOverlayMode: () => ipcRenderer.invoke('is-overlay-mode'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Playback & Tray integration
  updatePlaybackStatus: (info) => ipcRenderer.invoke('update-playback-status', info),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),

  // Local File Access
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  openLrcDialog: () => ipcRenderer.invoke('open-lrc-dialog'),

  // Online Search & Lyrics
  searchOnlineMusic: (query) => ipcRenderer.invoke('search-online-music', query),
  fetchLrcLibLyrics: (params) => ipcRenderer.invoke('fetch-lrclib-lyrics', params),
  extractCoverPalette: (url) => ipcRenderer.invoke('extract-cover-palette', url),

  // IPC Event Listeners
  onMediaCommand: (callback) => {
    const handler = (event, command) => callback(command);
    ipcRenderer.on('media-command', handler);
    return () => ipcRenderer.removeListener('media-command', handler);
  },
  onOverlayModeChanged: (callback) => {
    const handler = (event, isOverlay) => callback(isOverlay);
    ipcRenderer.on('overlay-mode-changed', handler);
    return () => ipcRenderer.removeListener('overlay-mode-changed', handler);
  },
  onFullscreenChanged: (callback) => {
    const handler = (event, isFs) => callback(isFs);
    ipcRenderer.on('fullscreen-changed', handler);
    return () => ipcRenderer.removeListener('fullscreen-changed', handler);
  }
});
