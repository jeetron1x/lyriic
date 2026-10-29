<div align="center">

# 🎵 Lyriic

### The Ultimate Windows Music Player with Kinetic Word-by-Word Animated Lyrics, Audio-Reactive Ambient Lighting & Translucent Smoky Glass Aesthetics

[![Platform: Windows](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/jeetron1x/lyriic/releases)
[![Website](https://img.shields.io/badge/Website-jeetron1x.github.io%2Flyriic-fb6e90?style=for-the-badge&logo=googlechrome&logoColor=white)](https://jeetron1x.github.io/lyriic/)
[![Version: 1.0.0](https://img.shields.io/badge/Release-v1.0.0-6366f1?style=for-the-badge)](https://github.com/jeetron1x/lyriic/releases)
[![Publisher: Jeetron1x](https://img.shields.io/badge/Publisher-Jeetron1x-10b981?style=for-the-badge&logo=github)](https://github.com/jeetron1x)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/jeetron1x/lyriic?style=for-the-badge&logo=github&color=eab308)](https://github.com/jeetron1x/lyriic/stargazers)

<br/>

**Crafted with passion by [Jeetron1x](https://github.com/jeetron1x)**

[🌐 Official Website](https://jeetron1x.github.io/lyriic/) • [📥 Download Installer (v1.0.0)](https://github.com/jeetron1x/lyriic/releases/latest) • [✨ Features](#-key-features) • [⌨️ Shortcuts](#️-keyboard-shortcuts) • [🛡️ Security](#-anti-reverse-engineering--security) • [⭐ Star on GitHub](https://github.com/jeetron1x)

---

</div>

<br/>

## 🌟 Overview

**Lyriic** is a modern, privacy-friendly desktop music player for Windows built for audiophiles and lyric lovers. Featuring **120 FPS spring-damped word-by-word kinetic lyrics**, **audio-reactive ambient lighting**, **translucent smoky glass overlays**, and **innumerable custom playlists**, Lyriic brings a calm, sleek, and mesmerizing visual stage right to your desktop.

---

## ✨ Key Features

### 🎙️ 1. 120 FPS Kinetic Lyrics with Exact 50vh Center Alignment
- **Word-by-Word Synchronized Highlights**: Lyrics wipe letter-by-letter in real-time, synchronized with audio down to the millisecond.
- **4 Distinct Typography Styles**:
  - **Kinetic Flow**: Modern flowing typography with elastic spring damping.
  - **Spatial 3D Perspective Wall**: 3D perspective depth (`translateZ`, specular tilt, and dynamic fog).
  - **Minimal**: Editorial layout with high-contrast monochrome elegance.
  - **Dual Subtitle Cassette**: Dual cards highlighting the active line and the upcoming line.
- **Exact 50vh Vertical Centering**: Lyrics always stay centered on screen regardless of song length.
- **Instrumental Detection (`···`)**: Detects instrumental intros and guitar/synth solos, rendering pulsing `···` dots to avoid lyrics desync.

### 💡 2. Audio-Reactive Ambient Lighting
- **Audio-Reactive Halo**: Edge-lit window halo pulsing dynamically to the beat and audio frequencies.
- **6 Custom Lighting Modes**:
  - *Beat Pulse* (instantaneous transient kick bloom)
  - *Aurora* (cosmic flowing light waves)
  - *Breathe* (gentle rhythmic breathing glow)
  - *Spectrum* (smooth RGB cycling)
  - *Neon* (high-intensity edge glow)
  - *Static* (subtle calm ambient backlighting)
- **Custom Color Sources**: Album Cover Palette Sync, Pure Monochrome White, Custom Hex, Cyberpunk, or Sunset.

### 🪟 3. Desktop Translucent Smoky Glass Overlay Mode
- Press <kbd>T</kbd> to enter a **floating desktop mini-player**.
- **Smoky Glass Translucency (`0.42` alpha)**: Allows ~58% of your desktop wallpaper, open browser tabs, or windows to show through with frosted blur.
- Word-by-word active lyrics and track controls float right over your desktop.

### 🎶 4. Innumerable Playlists & Smart Queue
- **Unlimited Custom Playlists**: Create innumerable custom playlists with custom names and descriptions.
- **Universal "Add to Playlist"**: 1-click add from Search Results, Local Library, Liked Songs, or History.
- **Smart Up Next Queue**:
  - **"＋ Queue"**: Appends songs to the end of your queue without interrupting playback.
  - **"⏭️ Play Next"**: Queues songs immediately after the currently playing track.
- **Interactive Queue Panel**: View, reorder, remove, or clear upcoming tracks anytime.

### 🔒 5. 100% Privacy-Friendly & Offline First
- **Zero Telemetry**: All listening history, favorites, settings, and custom playlists are stored 100% locally on your machine.
- Local audio file playback support (MP3, FLAC, WAV, AAC, OGG, M4A) with drag & drop and local folder import.

---

## 📥 Download & Installation

### Option 1: Official Windows Installer (Recommended)
1. Download the latest installer: [**`Lyriic-Setup-1.0.0.exe`**](https://github.com/jeetron1x/lyriic/releases/latest)
2. Double-click to run the setup wizard.
3. Official Start Menu & Desktop shortcuts are generated automatically.
4. **Publisher**: `Jeetron1x`

### Option 2: Portable Executable
- Download the portable ZIP from the [Releases](https://github.com/jeetron1x/lyriic/releases) section, extract anywhere, and run `Lyriic.exe`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause |
| <kbd>←</kbd> / <kbd>→</kbd> | Seek ±5 seconds |
| <kbd>Ctrl</kbd> + <kbd>←</kbd> / <kbd>→</kbd> | Previous / Next track |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume Up / Down (±5%) |
| <kbd>L</kbd> | Toggle Lyrics View |
| <kbd>F</kbd> or <kbd>F11</kbd> | Toggle Fullscreen Lyrics Mode |
| <kbd>T</kbd> | Toggle Desktop Translucent Overlay Mode |
| <kbd>M</kbd> | Mute / Unmute |
| <kbd>S</kbd> | Toggle Shuffle |
| <kbd>R</kbd> | Cycle Repeat Mode (*None → All → One*) |
| <kbd>Ctrl</kbd> + <kbd>,</kbd> | Open Settings & Ambient Lighting Modal |
| <kbd>Esc</kbd> | Exit Fullscreen / Close Modals |

---

## 🛡️ Anti-Reverse Engineering & Security

Lyriic is protected with an enterprise-grade security and anti-tamper build pipeline:
- **Base64/RC4 String Array Encryption**: Internal endpoints, tokens, prompts, and variable values are encrypted in memory.
- **Control Flow Flattening**: Core functions are converted into non-linear switch-case state machines, defeating AST decompiler and GitReverse extraction attempts.
- **Hexadecimal Identifier Mangling**: Variable, method, and class names are mangled into hex identifiers.
- **Sealed ASAR Container**: Production distributions are signed by **Jeetron1x** and packaged inside a sealed archive.

---

## 👤 Author & Support

Crafted with ❤️ by **[Jeetron1x](https://github.com/jeetron1x)**.

If you enjoy using **Lyriic**, please take a second to **leave a ⭐ Star on this repository**—it helps support future development and updates!

- **GitHub Profile**: [@jeetron1x](https://github.com/jeetron1x)
- **Issues & Suggestions**: [GitHub Issues](https://github.com/jeetron1x/lyriic/issues)

---

<div align="center">
  <sub>Copyright © 2026 Jeetron1x. Licensed under the MIT License.</sub>
</div>
