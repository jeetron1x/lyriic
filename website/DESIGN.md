# Lumn Dark Pulse Design System

This document specifies the design tokens, typography, component geometry, motion choreography, and aesthetic rules for **Lyriic**'s marketing website. Every token defined here is mirrored in `tailwind.config.js` and `src/index.css`.

---

## 1. Philosophy & Aesthetic Rules

- **Pure Flat Minimalist Polish**: No generic drop shadows, no giant muddy gradient blobs, no white backgrounds. Depth is achieved strictly through deliberate contrast, precise hairlines (`rgba(255,255,255,0.08)` and `rgba(255,255,255,0.18)`), and luminous app mockup imagery.
- **Sparing Accent**: The vibrant primary pink (`#fb6e90`) is used sparingly as an electric pulse: brand logo mark, active indicators, interactive hover micro-states, and the razor-thin halo edge-light on the app window.
- **Centering & Spacious Rhythm**: Generous breathing room, centered hierarchy, maximum one primary and one secondary CTA per cluster.
- **Tactile Precision**: Pill buttons, 34px radius cards with inset subtle hairline borders, and snappy micro-interactions.

---

## 2. Color Palette

| Token | Value | Role & Usage |
|---|---|---|
| `neutral` / `page bg` | `#000000` | Canvas base, pure dark void |
| `surface` | `#0b0b0d` | Primary card background, deep charcoal |
| `surface-2` | `#18181b` | Elevated containers, input backgrounds, chips |
| `primary` | `#fb6e90` | Core brand neon pink accent |
| `primary-80` | `#f99ab0` | Soft highlight, hovered accent |
| `primary-60` | `#fbc0cf` | Muted highlight, text accent tint |
| `primary-20` | `#3b1a26` | Deep translucent pink backdrop / badges |
| `secondary` / `on-surface` | `#f4f4f5` | Main high-contrast headings & primary button fill |
| `tertiary` | `#d4d4d8` | Body copy, secondary nav links, subtle labels |
| `error` | `#ff5a67` | Destructive states, alert badges |
| `border-subtle` | `rgba(255, 255, 255, 0.08)` | Default card and hairline dividers |
| `border-strong` | `rgba(255, 255, 255, 0.18)` | Secondary button border, active card highlight |

### CSS Variables
```css
:root {
  --bg-page: #000000;
  --surface: #0b0b0d;
  --surface-2: #18181b;
  --primary: #fb6e90;
  --primary-80: #f99ab0;
  --primary-60: #fbc0cf;
  --primary-20: #3b1a26;
  --on-surface: #f4f4f5;
  --tertiary: #d4d4d8;
  --error: #ff5a67;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.18);
}
```

---

## 3. Typography

Fonts:
- **Display**: `"Bricolage Grotesque"`, sans-serif (700, 800) with `font-display: swap`.
- **UI / Body**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`.

| Style Token | Size / Line-height | Weight | Letter-spacing | Font Family | Usage |
|---|---|---|---|---|---|
| `headline-display` | `clamp(64px, 12vw, 186px)` / 1.08 | 800 | `-0.055em` (down to `-10.23px` on 186px) | Bricolage Grotesque | Hero brand mark headline |
| `headline-lg` | `clamp(48px, 7vw, 104px)` / 1.12 | 800 | `-0.025em` (`-2.16px` at 104px) | Bricolage Grotesque | Section title, Final CTA |
| `headline-md` | `clamp(36px, 4.5vw, 58px)` / 1.15 | 700 | `-0.015em` (`-0.26px` at 58px) | Bricolage Grotesque | Subsection headers |
| `headline-sm` | `32px` / `38px` (1.18) | 600 | `-0.01em` | Bricolage Grotesque | Feature card headers |
| `body-lg` | `18px` / `26px` (1.44) | 500 | `-0.27px` (`-0.015em`) | UI System | Hero sub-copy, lead intros |
| `body-md` | `16px` / `24px` (1.5) | 400 | `-0.2px` | UI System | Standard paragraphs, specs |
| `body-sm` | `14px` / `20px` (1.42) | 400 | `0` | UI System | Dense lists, captions |
| `label-lg` | `16px` / `20px` | 700 | `0` | UI System | Pill button text |
| `label-md` | `14px` / `18px` | 600 | `0` | UI System | Navigation links, chips |
| `label-sm` | `12px` / `16px` | 500 | `0` | UI System | Tags, status pills |
| `caption` | `12px` / `16px` | 400 | `0` | UI System | Fine print, metadata |

---

## 4. Radii & Geometry

- `rounded-sm`: `4px`
- `rounded-md`: `8px`
- `rounded-lg`: `16px`
- `rounded-xl`: `34px` (Cards, Showcase window, Control Playground)
- `rounded-full`: `9999px` (Buttons, Chips, Badges, Search inputs)

### Card Standard
- Radius: `34px`
- Background: `#0b0b0d` (`surface`)
- Border: `1px solid rgba(255, 255, 255, 0.08)` (`border-subtle`)
- Inner Padding: `68px` on desktop (`p-6 sm:p-10 md:p-[68px]` responsive)

---

## 5. Spacing Scale

- `xs`: `2px`
- `sm`: `10px`
- `md`: `18px`
- `lg`: `28px`
- `xl`: `44px`
- `section`: `68px` / `100px`
- `gutter`: `24px`

---

## 6. Button Standards

### Primary Action Pill
- Background: `#f4f4f5` (`secondary / on-surface`)
- Text: `#18181b` (`surface-2`), `font-bold`, `label-lg` (16px)
- Height: `52px`
- Padding: `14px 28px`
- Min-width: `~234px` on desktop (compact `h-10 px-5` in nav)
- Radius: `9999px`
- Hover: Soft scale + magnetic micro-drift

### Secondary Action Pill
- Background: `transparent`
- Text: `#f4f4f5`
- Border: `1px solid rgba(255, 255, 255, 0.18)` (`border-strong`)
- Height: `52px`
- Padding: `14px 28px`
- Radius: `9999px`
- Hover: Background `rgba(255, 255, 255, 0.05)`, border `#fb6e90`

---

## 7. Motion & Interaction Choreography

- **Global reveal**: `gsap.from(target, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 })` triggered at `"top 85%"`.
- **Hero Reveal**: Per-letter clip mask translation: `yPercent: 110` to `0`, `stagger: 0.05`, `ease: "power4.out"`.
- **Pinned Showcase**: ScrollTrigger pin with scrub `1.2`, swapping steps 1-4 with synchronized state changes.
- **Scroll Bar & Smooth Scroll**: Lenis ticker synchronized with GSAP (`gsap.ticker.add(lenis.raf)` and `lagSmoothing(0)`).
- **Reduced Motion**: Complete bypass of pinning, parallax, letter splitting, and Lenis if `window.matchMedia("(prefers-reduced-motion: reduce)").matches` is true.
