// scripts/generate_covers.cjs
const fs = require('fs');
const path = require('path');

const coversDir = path.join(__dirname, '..', 'src', 'renderer', 'assets', 'covers');
fs.mkdirSync(coversDir, { recursive: true });

// Cover 1: Echoes of Starlight (Obsidian Drift)
const cover1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="starGlow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#4f75ff" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#1e274a" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#0e111a" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#08090d" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="coreLight" cx="50%" cy="38%" r="30%">
      <stop offset="0%" stop-color="#e0eaff" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#7096ff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#4f75ff" stop-opacity="0"/>
    </radialGradient>
    <filter id="glassBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="35" />
    </filter>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" />
    </filter>
  </defs>
  <!-- Background -->
  <rect width="600" height="600" fill="url(#starGlow)"/>

  <!-- Fluid Smoky Blobs -->
  <circle cx="280" cy="240" r="140" fill="#6d83f2" opacity="0.35" filter="url(#glassBlur)"/>
  <circle cx="360" cy="320" r="160" fill="#3854d9" opacity="0.45" filter="url(#glassBlur)"/>
  <circle cx="200" cy="400" r="120" fill="#1b2559" opacity="0.5" filter="url(#glassBlur)"/>

  <!-- Glowing Starlight Sphere -->
  <circle cx="300" cy="270" r="90" fill="url(#coreLight)" filter="url(#softGlow)"/>
  <circle cx="300" cy="270" r="4" fill="#ffffff" opacity="0.95"/>

  <!-- Subtle orbital rings -->
  <ellipse cx="300" cy="270" rx="180" ry="60" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" transform="rotate(-15 300 270)"/>
  <ellipse cx="300" cy="270" rx="220" ry="75" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" transform="rotate(25 300 270)"/>

  <!-- Typography overlay -->
  <g font-family="system-ui, -apple-system, sans-serif" letter-spacing="3">
    <text x="48" y="520" fill="#ffffff" font-size="24" font-weight="600" opacity="0.95">ECHOES OF STARLIGHT</text>
    <text x="48" y="548" fill="#8b9bb4" font-size="13" font-weight="400" letter-spacing="4">AURA &amp; THE MIST</text>
  </g>
</svg>`;

// Cover 2: Midnight Rain (Smoky Windows)
const cover2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="rainBg" cx="40%" cy="45%" r="70%">
      <stop offset="0%" stop-color="#3d2918" stop-opacity="0.9"/>
      <stop offset="40%" stop-color="#1e1815" stop-opacity="0.85"/>
      <stop offset="80%" stop-color="#0f0c0b" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#080706" stop-opacity="1"/>
    </radialGradient>
    <filter id="bokehBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#rainBg)"/>

  <!-- Warm Bokeh Orbs -->
  <circle cx="230" cy="260" r="110" fill="#e69242" opacity="0.45" filter="url(#bokehBlur)"/>
  <circle cx="380" cy="220" r="130" fill="#d96a2b" opacity="0.35" filter="url(#bokehBlur)"/>
  <circle cx="340" cy="360" r="140" fill="#8f4619" opacity="0.5" filter="url(#bokehBlur)"/>
  <circle cx="160" cy="380" r="90" fill="#ffb469" opacity="0.25" filter="url(#bokehBlur)"/>

  <!-- Glass Rain streaks overlay -->
  <line x1="140" y1="80" x2="160" y2="480" stroke="rgba(255,255,255,0.06)" stroke-width="2" stroke-linecap="round"/>
  <line x1="280" y1="50" x2="305" y2="520" stroke="rgba(255,255,255,0.08)" stroke-width="2" stroke-linecap="round"/>
  <line x1="420" y1="90" x2="440" y2="490" stroke="rgba(255,255,255,0.05)" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Typography -->
  <g font-family="system-ui, -apple-system, sans-serif" letter-spacing="3">
    <text x="48" y="520" fill="#ffffff" font-size="24" font-weight="600" opacity="0.95">MIDNIGHT RAIN</text>
    <text x="48" y="548" fill="#c4a58b" font-size="13" font-weight="400" letter-spacing="4">KOMOREBI NOIR</text>
  </g>
</svg>`;

// Cover 3: Velvet Neon (Luminescence)
const cover3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="neonBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#3c1353" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#1f092b" stop-opacity="0.9"/>
      <stop offset="85%" stop-color="#0d0413" stop-opacity="0.98"/>
      <stop offset="100%" stop-color="#050108" stop-opacity="1"/>
    </radialGradient>
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="35" />
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#neonBg)"/>

  <!-- Glowing neon shapes -->
  <path d="M 120 400 C 180 200, 320 180, 480 320" fill="none" stroke="#d92be6" stroke-width="80" opacity="0.4" filter="url(#neonGlow)"/>
  <path d="M 100 240 C 240 380, 380 120, 500 260" fill="none" stroke="#36d1dc" stroke-width="60" opacity="0.35" filter="url(#neonGlow)"/>

  <circle cx="300" cy="290" r="85" fill="#f43f5e" opacity="0.4" filter="url(#neonGlow)"/>
  <circle cx="300" cy="290" r="45" fill="#ffffff" opacity="0.2"/>

  <!-- Typography -->
  <g font-family="system-ui, -apple-system, sans-serif" letter-spacing="3">
    <text x="48" y="520" fill="#ffffff" font-size="24" font-weight="600" opacity="0.95">VELVET NEON</text>
    <text x="48" y="548" fill="#d19fed" font-size="13" font-weight="400" letter-spacing="4">SOLARIS MIRAGE</text>
  </g>
</svg>`;

// Default Cover
const coverDefault = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <radialGradient id="defBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1c2029"/>
      <stop offset="100%" stop-color="#0c0e12"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#defBg)"/>
  <!-- Vinyl disc rings -->
  <circle cx="300" cy="300" r="190" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
  <circle cx="300" cy="300" r="160" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.5"/>
  <circle cx="300" cy="300" r="130" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1.5"/>
  <circle cx="300" cy="300" r="70" fill="rgba(255,255,255,0.08)"/>
  <circle cx="300" cy="300" r="18" fill="#0c0e12"/>

  <g font-family="system-ui, -apple-system, sans-serif" letter-spacing="4">
    <text x="300" y="530" text-anchor="middle" fill="#657285" font-size="14" font-weight="500">LYRIIC PLAYER</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(coversDir, 'echoes-of-starlight.svg'), cover1);
fs.writeFileSync(path.join(coversDir, 'midnight-rain.svg'), cover2);
fs.writeFileSync(path.join(coversDir, 'velvet-neon.svg'), cover3);
fs.writeFileSync(path.join(coversDir, 'default-cover.svg'), coverDefault);
console.log('✓ Album covers generated successfully');
