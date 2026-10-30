# Lyriic Marketing Website

Production-ready, high-performance single-page marketing website for **Lyriic** (Windows Music Player with Kinetic Lyrics & Ambient Halo). Built strictly with the **Lyriic Dark Pulse** design system.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom design tokens mirrored in `DESIGN.md`, `tailwind.config.js`, and `src/index.css`)
- **Typography**: `@fontsource/bricolage-grotesque` (700, 800) for Display, system UI for body
- **Smooth Scroll**: Lenis integrated with GSAP's ticker (`gsap.ticker.add` + `lagSmoothing(0)`)
- **Animations**: GSAP + ScrollTrigger (Strict Mode safe with `gsap.context()`, respects `prefers-reduced-motion`)
- **Icons**: Lucide React
- **Zero Heavy 3D**: CSS / Canvas / SVG only, 60–120 FPS kinetic typography.

---

## Getting Started

### 1. Install Dependencies
```bash
cd website
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```
The site runs locally at `http://localhost:5173/`.

### 3. Build for Production
```bash
npm run build
```
Generates a static production bundle in `website/dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

---

## Deployment to GitHub Pages

A dedicated GitHub Actions workflow is provided at `.github/workflows/deploy-website.yml`.

- **Trigger**: Triggers automatically on push to `main` whenever changes occur in `website/**`.
- **Base URL**: Defaults to `/lyriic/` via `VITE_BASE='/lyriic/'`.
- **Manual Trigger**: Can be dispatched manually via the **Actions** tab on GitHub.

### Setting up GitHub Pages in Repository Settings:
1. Go to repository **Settings** &rarr; **Pages**.
2. Under **Build and deployment**, select **Source: GitHub Actions**.
3. Push to `main` or trigger the workflow manually.

---

## How to Swap in Real Screenshots

The marketing page features high-fidelity HTML/CSS dynamic mockup components (`AppWindowMockup.tsx`) that demonstrate kinetic word-by-word lyrics, audio-reactive ambient halo glow, and the translucent smoky glass desktop overlay.

If you capture real PNG screenshots of Lyriic running on Windows 11:

1. Place your screenshots in `website/public/screenshots/`:
   - `app-window.png`: Main player window with kinetic lyrics.
   - `ambient-halo.png`: Edge-lit window halo in dark room.
   - `smoky-overlay.png`: Desktop overlay mode.
   - `kinetic-flow.png`: Word-by-word kinetic typography.
2. In `src/components/AppWindowMockup.tsx` or `src/components/Showcase.tsx`, you can optionally toggle an `<img>` tag:
   ```tsx
   <img
     src={`${import.meta.env.BASE_URL}screenshots/app-window.png`}
     alt="Lyriic on Windows 11"
     className="w-full h-auto rounded-[34px] border border-white/10"
   />
   ```
   Or continue using the live animated code mockup which reacts interactively to the playground chips and sliders!
