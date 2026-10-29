// src/main/main.cjs
const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage, globalShortcut, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let userSettings = {
  minimizeToTray: false,
  closeToTray: false,
  globalMediaKeys: true
};
let normalBounds = null;
let isOverlayMode = false;
let isFullScreenMode = false;
let currentTrackInfo = { title: 'Lyriic', artist: 'Calm & Sleek' };

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 420,
    minHeight: 120,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    show: false,
    icon: path.join(__dirname, '../renderer/assets/app-icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false // allow cross-origin audio and local covers
    }
  });

  // Enable CORS headers on all streaming responses for Web Audio API
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['GET, HEAD, OPTIONS'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    callback({ responseHeaders });
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.webContents.on('console-message', (event) => {
    const msg = event.message || event;
    console.log(`[Renderer] ${msg}`);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('[Main] Window ready and shown');
    mainWindow.show();
  });

  mainWindow.on('enter-full-screen', () => {
    isFullScreenMode = true;
    mainWindow.webContents.send('fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    isFullScreenMode = false;
    mainWindow.webContents.send('fullscreen-changed', false);
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting && userSettings.closeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('minimize', (event) => {
    if (userSettings.minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('resize', () => {
    if (!isOverlayMode && !isFullScreenMode && mainWindow && !mainWindow.isFullScreen()) {
      normalBounds = mainWindow.getBounds();
    }
  });

  mainWindow.on('move', () => {
    if (!isOverlayMode && !isFullScreenMode && mainWindow && !mainWindow.isFullScreen()) {
      normalBounds = mainWindow.getBounds();
    }
  });

  createTray();
  registerGlobalShortcuts();
}

function createTray() {
  const iconPath = path.join(__dirname, '../renderer/assets/tray-icon.png');
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('Lyriic - Calm Animated Lyrics');

  updateTrayMenu();

  tray.on('double-click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.focus();
    } else {
      mainWindow.show();
    }
  });
}

function updateTrayMenu(isPlaying = false) {
  if (!tray) return;

  const trackLabel = currentTrackInfo.title && currentTrackInfo.artist
    ? `${currentTrackInfo.title} • ${currentTrackInfo.artist}`
    : 'Lyriic Player';

  const contextMenu = Menu.buildFromTemplate([
    { label: trackLabel, enabled: false },
    { type: 'separator' },
    {
      label: isPlaying ? 'Pause' : 'Play',
      click: () => mainWindow && mainWindow.webContents.send('media-command', 'toggle-play')
    },
    {
      label: 'Next Track',
      click: () => mainWindow && mainWindow.webContents.send('media-command', 'next')
    },
    {
      label: 'Previous Track',
      click: () => mainWindow && mainWindow.webContents.send('media-command', 'prev')
    },
    { type: 'separator' },
    {
      label: isOverlayMode ? 'Full Player Mode' : 'Desktop Lyrics Overlay',
      click: () => toggleOverlayMode()
    },
    {
      label: mainWindow && mainWindow.isVisible() ? 'Hide to Tray' : 'Show Lyriic',
      click: () => {
        if (!mainWindow) return;
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Lyriic',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function registerGlobalShortcuts() {
  if (!userSettings.globalMediaKeys) return;
  try {
    globalShortcut.register('MediaPlayPause', () => {
      mainWindow && mainWindow.webContents.send('media-command', 'toggle-play');
    });
    globalShortcut.register('MediaNextTrack', () => {
      mainWindow && mainWindow.webContents.send('media-command', 'next');
    });
    globalShortcut.register('MediaPreviousTrack', () => {
      mainWindow && mainWindow.webContents.send('media-command', 'prev');
    });
  } catch (err) {
    console.error('Failed to register global shortcuts:', err);
  }
}

function toggleOverlayMode(explicitVal) {
  if (!mainWindow) return;
  const shouldBeOverlay = explicitVal !== undefined ? explicitVal : !isOverlayMode;

  if (shouldBeOverlay && !isOverlayMode) {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
    normalBounds = mainWindow.getBounds();
    isOverlayMode = true;
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setSize(560, 130);
    mainWindow.webContents.send('overlay-mode-changed', true);
  } else if (!shouldBeOverlay && isOverlayMode) {
    isOverlayMode = false;
    mainWindow.setAlwaysOnTop(false);
    if (normalBounds) {
      mainWindow.setBounds(normalBounds);
    } else {
      mainWindow.setSize(1180, 780);
      mainWindow.center();
    }
    mainWindow.webContents.send('overlay-mode-changed', false);
  }
  updateTrayMenu();
}

// Window Controls IPC
ipcMain.handle('window-minimize', () => {
  mainWindow && mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (!mainWindow) return false;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
  return mainWindow.isMaximized();
});

ipcMain.handle('window-close', () => {
  if (userSettings.closeToTray) {
    mainWindow && mainWindow.hide();
  } else {
    isQuitting = true;
    mainWindow && mainWindow.close();
  }
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Fullscreen toggle: sets true Windows fullscreen
ipcMain.handle('toggle-fullscreen', (event, explicitVal) => {
  if (!mainWindow) return false;
  isFullScreenMode = explicitVal !== undefined ? explicitVal : !isFullScreenMode;
  mainWindow.setFullScreen(isFullScreenMode);
  return isFullScreenMode;
});

ipcMain.handle('toggle-overlay-mode', (event, explicitVal) => {
  toggleOverlayMode(explicitVal);
  return isOverlayMode;
});

ipcMain.handle('is-overlay-mode', () => {
  return isOverlayMode;
});

ipcMain.handle('open-external', (event, url) => {
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    shell.openExternal(url);
  }
});

// Native Palette Extraction from Album Cover Image (via Electron nativeImage)
ipcMain.handle('extract-cover-palette', async (event, imgUrl) => {
  if (!imgUrl) return null;
  try {
    let buffer = null;
    if (imgUrl.startsWith('data:')) {
      const parts = imgUrl.split(',');
      if (parts[1]) buffer = Buffer.from(parts[1], 'base64');
    } else if (imgUrl.startsWith('http')) {
      const res = await fetch(imgUrl);
      if (res.ok) {
        buffer = Buffer.from(await res.arrayBuffer());
      }
    } else if (fs.existsSync(imgUrl)) {
      buffer = fs.readFileSync(imgUrl);
    }

    if (!buffer) return null;

    const img = nativeImage.createFromBuffer(buffer);
    if (img.isEmpty()) return null;

    // Resize to 24x24 for instant sampling (576 pixels)
    const resized = img.resize({ width: 24, height: 24, quality: 'good' });
    const bitmap = resized.getBitmap(); // Buffer of BGRA (Windows) or RGBA

    let vibrantR = 99, vibrantG = 136, vibrantB = 255;
    let maxScore = -1;
    let darkR = 0, darkG = 0, darkB = 0;
    let count = 0;

    // Electron getBitmap() is BGRA on Windows
    for (let i = 0; i < bitmap.length; i += 4) {
      const b = bitmap[i];
      const g = bitmap[i + 1];
      const r = bitmap[i + 2];
      const a = bitmap[i + 3];

      if (a < 128) continue;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (max + min) / 510;

      // Score saturated, lively vibrant tones
      if (lum > 0.18 && lum < 0.88 && sat > 0.15) {
        const score = sat * 2.2 + (1 - Math.abs(lum - 0.5));
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
      const bgR = Math.min(22, Math.round((darkR / count) * 0.12));
      const bgG = Math.min(26, Math.round((darkG / count) * 0.12));
      const bgB = Math.min(34, Math.round((darkB / count) * 0.12));

      const accentRgb = `${vibrantR}, ${vibrantG}, ${vibrantB}`;
      const bgRgb = `${bgR}, ${bgG}, ${bgB}`;

      return {
        accentRgb,
        bgRgb,
        orb1: `rgba(${accentRgb}, 0.55)`,
        orb2: `rgba(${Math.min(255, vibrantR + 40)}, ${Math.max(0, vibrantG - 25)}, ${Math.min(255, vibrantB + 60)}, 0.45)`,
        orb3: `rgba(${Math.max(0, vibrantR - 35)}, ${Math.min(255, vibrantG + 40)}, ${vibrantB}, 0.38)`
      };
    }
  } catch (err) {
    console.warn('Native palette extract error:', err.message);
  }
  return null;
});

ipcMain.handle('update-playback-status', (event, info) => {
  if (info) {
    currentTrackInfo.title = info.title || 'Lyriic';
    currentTrackInfo.artist = info.artist || 'Calm & Sleek';
    if (tray) {
      tray.setToolTip(`${currentTrackInfo.title} - ${currentTrackInfo.artist}`);
      updateTrayMenu(info.isPlaying);
    }
  }
});

ipcMain.handle('update-settings', (event, newSettings) => {
  userSettings = { ...userSettings, ...newSettings };
  if (userSettings.globalMediaKeys) {
    registerGlobalShortcuts();
  } else {
    globalShortcut.unregisterAll();
  }
  return userSettings;
});

// File Dialogs & Parsing
ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Audio Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'flac', 'wav', 'm4a', 'ogg', 'aac', 'weba'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return [];
  }

  return await parseAudioFiles(result.filePaths);
});

ipcMain.handle('open-directory-dialog', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Music Folder',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return [];
  }

  const dirPath = result.filePaths[0];
  const audioExtensions = new Set(['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac', '.weba']);
  const files = [];

  function scanDir(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (audioExtensions.has(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (e) {
      console.error('Error scanning folder:', e);
    }
  }

  scanDir(dirPath);
  return await parseAudioFiles(files);
});

ipcMain.handle('open-lrc-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Lyric File (.lrc)',
    properties: ['openFile'],
    filters: [
      { name: 'Lyric Files', extensions: ['lrc', 'txt'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  try {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      filePath,
      content
    };
  } catch (err) {
    console.error('Error reading LRC file:', err);
    return null;
  }
});

// Helper to parse audio metadata
async function parseAudioFiles(filePaths) {
  let musicMetadata;
  try {
    musicMetadata = await import('music-metadata');
  } catch (e) {
    console.warn('music-metadata import failed, using fallback parser', e);
  }

  const tracks = [];
  for (const filePath of filePaths) {
    try {
      let title = path.basename(filePath, path.extname(filePath));
      let artist = 'Unknown Artist';
      let album = 'Unknown Album';
      let duration = 0;
      let coverUrl = null;

      if (musicMetadata) {
        try {
          const metadata = await musicMetadata.parseFile(filePath, { skipCovers: false });
          if (metadata.common) {
            title = metadata.common.title || title;
            artist = metadata.common.artist || artist;
            album = metadata.common.album || album;
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const pic = metadata.common.picture[0];
              const b64 = Buffer.from(pic.data).toString('base64');
              coverUrl = `data:${pic.format};base64,${b64}`;
            }
          }
          if (metadata.format && metadata.format.duration) {
            duration = metadata.format.duration;
          }
        } catch (mErr) {
          console.warn('Metadata parse warning for:', filePath, mErr.message);
        }
      }

      let localLrc = null;
      const baseNoExt = filePath.slice(0, -path.extname(filePath).length);
      const possibleLrc = baseNoExt + '.lrc';
      if (fs.existsSync(possibleLrc)) {
        try {
          localLrc = fs.readFileSync(possibleLrc, 'utf8');
        } catch (lErr) {
          console.warn('Failed reading adjacent lrc:', lErr);
        }
      }

      tracks.push({
        id: 'local_' + Buffer.from(filePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
        title,
        artist,
        album,
        duration,
        src: 'file:///' + filePath.replace(/\\/g, '/'),
        filePath,
        coverUrl,
        isLocal: true,
        localLrc
      });
    } catch (err) {
      console.error('Error processing audio file:', filePath, err);
    }
  }

  return tracks;
}

function cleanHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function cleanTitleForLyrics(title) {
  if (!title) return '';
  return cleanHtmlEntities(title)
    .replace(/\s*[\(\[](feat\.|featuring|with).*?[\)\]]/gi, '')
    .replace(/\s*[\(\[](official\s*(music\s*)?video|lyric\s*video|audio|visualizer).*?[\)\]]/gi, '')
    .replace(/\s*[\(\[](remaster(ed)?\s*(\d{4})?|\d{4}\s*remaster|radio\s*edit|single\s*version|album\s*version|deluxe|bonus\s*track|live(\s*in\s*.*?)?)[\)\]]/gi, '')
    .replace(/\s*-\s*(remaster(ed)?(\s*\d{4})?|\d{4}\s*remaster|radio\s*edit|single\s*version|live).*$/gi, '')
    .replace(/\s*-\s*official.*$/gi, '')
    .trim();
}

// Online Music Search (Full Song Streams via Saavn API + iTunes Fallback)
ipcMain.handle('search-online-music', async (event, query) => {
  if (!query || query.trim().length === 0) return [];
  const cleanQ = query.trim();

  // 1. Try Full Song Search via JioSaavn API
  try {
    const encoded = encodeURIComponent(cleanQ);
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=25&p=1&q=${encoded}&_marker=0`;
    const res = await fetch(saavnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results) && data.results.length > 0) {
        const key = CryptoJS.enc.Utf8.parse('38346591');
        const tracks = [];

        for (const item of data.results) {
          if (!item.encrypted_media_url || !item.song) continue;

          let audioUrl = '';
          try {
            const dec = CryptoJS.DES.decrypt(
              { ciphertext: CryptoJS.enc.Base64.parse(item.encrypted_media_url) },
              key,
              { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
            );
            const decryptedUrl = dec.toString(CryptoJS.enc.Utf8);
            if (decryptedUrl && decryptedUrl.startsWith('http')) {
              audioUrl = decryptedUrl.replace('_96.mp4', '_320.mp4');
            }
          } catch (e) {
            console.warn('Saavn decrypt error for', item.song, e.message);
          }

          if (!audioUrl) continue;

          let cover = item.image || '';
          if (cover.includes('150x150.jpg')) {
            cover = cover.replace('150x150.jpg', '500x500.jpg');
          } else if (cover.includes('50x50.jpg')) {
            cover = cover.replace('50x50.jpg', '500x500.jpg');
          }

          tracks.push({
            id: 'saavn_' + item.id,
            title: cleanHtmlEntities(item.song),
            artist: cleanHtmlEntities(item.primary_artists || item.singers || 'Unknown Artist'),
            album: cleanHtmlEntities(item.album || item.song),
            duration: parseInt(item.duration, 10) || 180,
            src: audioUrl,
            coverUrl: cover,
            isOnline: true
          });
        }

        if (tracks.length > 0) {
          return tracks;
        }
      }
    }
  } catch (err) {
    console.warn('JioSaavn search warning, falling back to iTunes:', err.message);
  }

  // 2. Fallback to iTunes API
  try {
    const encoded = encodeURIComponent(cleanQ);
    const itunesUrl = `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=25`;
    const res = await fetch(itunesUrl);
    if (!res.ok) throw new Error(`iTunes search status ${res.status}`);
    const data = await res.json();
    if (!data.results) return [];

    return data.results
      .filter(item => item.previewUrl && item.trackName)
      .map(item => {
        let cover = item.artworkUrl100 || '';
        if (cover.includes('100x100bb')) {
          cover = cover.replace('100x100bb', '1000x1000bb');
        }

        return {
          id: 'itunes_' + item.trackId,
          title: item.trackName,
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || item.trackName,
          duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
          src: item.previewUrl,
          coverUrl: cover,
          isOnline: true
        };
      });
  } catch (err) {
    console.error('Online search fallback error:', err);
    return [];
  }
});

// LRCLIB Lyrics API Proxy (with Duration Matching & Smart Fallbacks)
ipcMain.handle('fetch-lrclib-lyrics', async (event, { trackName, artistName, duration }) => {
  if (!trackName) return null;
  const cleanTitle = cleanTitleForLyrics(trackName);
  const cleanArtist = artistName && artistName !== 'Unknown Artist' ? cleanHtmlEntities(artistName).split(/[,&]/)[0].trim() : '';

  async function tryGet(title, artist, dur) {
    try {
      const params = new URLSearchParams();
      params.set('track_name', title);
      if (artist) params.set('artist_name', artist);
      if (dur) params.set('duration', Math.round(dur));
      const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return {
            syncedLyrics: data.syncedLyrics,
            plainLyrics: data.plainLyrics,
            source: 'lrclib_exact'
          };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  // 1. Exact get with cleaned title, artist, and duration
  let result = await tryGet(cleanTitle, cleanArtist, duration);
  if (result) return result;

  // 2. Exact get with original trackName and artist
  if (cleanTitle !== trackName) {
    result = await tryGet(trackName, cleanArtist, duration);
    if (result) return result;
  }

  // 3. Exact get without duration (in case track duration differs slightly)
  result = await tryGet(cleanTitle, cleanArtist, null);
  if (result) return result;

  // 4. Search query with duration matching
  try {
    const q = `${cleanTitle} ${cleanArtist}`.trim();
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (Array.isArray(searchData) && searchData.length > 0) {
        const synced = searchData.filter(item => item.syncedLyrics);
        if (synced.length > 0) {
          if (duration) {
            synced.sort((a, b) => Math.abs((a.duration || 0) - duration) - Math.abs((b.duration || 0) - duration));
          }
          return {
            syncedLyrics: synced[0].syncedLyrics,
            plainLyrics: synced[0].plainLyrics || null,
            source: 'lrclib_search'
          };
        }

        return {
          syncedLyrics: searchData[0].syncedLyrics || null,
          plainLyrics: searchData[0].plainLyrics || null,
          source: 'lrclib_search'
        };
      }
    }
  } catch (err) {
    console.warn('LRCLIB search fallback warning:', err.message);
  }

  // 5. Broad search with just clean title
  try {
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (Array.isArray(searchData) && searchData.length > 0) {
        const synced = searchData.filter(item => item.syncedLyrics);
        if (synced.length > 0) {
          if (duration) {
            synced.sort((a, b) => Math.abs((a.duration || 0) - duration) - Math.abs((b.duration || 0) - duration));
          }
          return {
            syncedLyrics: synced[0].syncedLyrics,
            plainLyrics: synced[0].plainLyrics || null,
            source: 'lrclib_search_broad'
          };
        }
      }
    }
  } catch {
    // ignore
  }

  return null;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !userSettings.closeToTray) {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
