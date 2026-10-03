# Apex Arena Design System Specification

> Persistent design specification combining the strengths of **UI/UX Pro Max** (multi-style palettes and mobile optimization), **Anthropic Frontend-Design** (clean motion and typographic hierarchy), and **Interface Design** (strict layout and component consistency).

---

## 1. Visual Identity & Design Philosophy

- **Domain**: High-performance Competitive Esports & Tactical Gaming Hub.
- **Aesthetic**: Cyber-championship dark mode with ambient arena depth, high-intent neon accents, tactile responsiveness, and zero visual clutter.
- **Anti-AI Slop Rules**:
  - **Zero-Pill Discipline**: Avoid enclosing metadata in pill badges. Use unboxed text separated by subtle typographic dots (`·`) or slashes (`/`).
  - **No Generic Purple-on-White Templates**: Root background is grounded in deep obsidian `#080b11` with hairline borders (`border-white/5` or `border-slate-800`).
  - **Intentional Contrast**: Interactive elements must pass WCAG AA contrast (minimum 4.5:1 for body copy, 3:1 for large display text).

---

## 2. Color Palette & Theming (60-30-10 Rule)

### The 60-30-10 Spatial Distribution
- **60% Dominant Canvas**: `#080b11` (Deep obsidian void with subtle 32px radial grid overlay).
- **30% Structural Surfaces**: `slate-900/80` and `slate-950/70` with hairline borders and backdrop blur.
- **10% High-Intent Accents**:
  - *Primary Focal / Electric Cyan*: `#06b6d4` (`rgb(6, 182, 212)`)
  - *Secondary Tactical / Indigo*: `#6366f1` (`rgb(99, 102, 241)`)
  - *Accent Flare / Amber Gold*: `#f59e0b` (`rgb(245, 158, 11)`)
  - *Fair Play Green / Emerald*: `#10b981` (`rgb(16, 185, 129)`)
  - *Critical Alert / Crimson*: `#f43f5e` (`rgb(244, 63, 94)`)

### Theme Tokens
1. **Obsidian Dark (Default)**: `#080b11` background, slate-900 cards, cyan glow highlights.
2. **Cyber Neon**: `#060913` background, electric blue borders, vivid cyan accents.
3. **Midnight OLED**: `#000000` absolute black background, optimized for mobile battery life and infinite contrast.
4. **Esports Crisp**: `#0a0e17` deep slate background with high-contrast tactical white indicators.

---

## 3. Typography Scale & Hierarchy

| Role | Font Family | Weight | Size | Tracking | Optical Compensation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | `Outfit`, sans-serif | 900 (Black) | 36px–48px | `-0.025em` | `text-wrap: balance` |
| **H1 Section** | `Outfit`, sans-serif | 800 (Extrabold) | 28px–32px | `-0.025em` | `leading-tight` |
| **H2 Card Title** | `Outfit`, sans-serif | 700 (Bold) | 18px–22px | `-0.02em` | `text-white` |
| **H3 Subsection** | `Outfit`, sans-serif | 700 (Bold) | 14px–16px | `-0.015em` | `tracking-tight` |
| **Body Primary** | `Plus Jakarta Sans`, sans-serif | 500 (Medium) | 13px–14px | Normal | `text-slate-200`, antialiased |
| **Body Secondary** | `Plus Jakarta Sans`, sans-serif | 400 (Regular) | 12px | Normal | `text-slate-400` |
| **Telemetry / Data** | `JetBrains Mono`, monospace | 600 (Semibold) | 11px–13px | `tabular-nums` | `tracking-normal` |
| **Micro-Badges** | `Outfit`, sans-serif | 700 (Bold) | 9px–10px | `+0.05em` | `uppercase` |

---

## 4. Component Sizing & Radius Rules

### Exact Button Height Specifications
- **Small (Utility / Table Action)**: `h-8` ($32\text{px}$), `px-2.5`, `rounded-xl` ($12\text{px}$), text size `11px font-semibold`.
- **Medium (Standard Navigation / Toolbar)**: `h-10` ($40\text{px}$), `px-4`, `rounded-xl` ($12\text{px}$), text size `13px font-bold`.
- **Large (Hero Call-to-Action / Launch Match)**: `h-12` ($48\text{px}$), `px-6`, `rounded-2xl` ($16\text{px}$), text size `14px font-black`.

### Corner Radius System
- **Small Badges & Tooltips**: `rounded-lg` ($8\text{px}$).
- **Buttons, Form Inputs, & Table Rows**: `rounded-xl` ($12\text{px}$).
- **Cards, Panels, & Drawers**: `rounded-2xl` ($16\text{px}$).
- **Hero Containers & Main Modals**: `rounded-3xl` ($24\text{px}$).

---

## 5. Spacing Scale

Strict adherence to a 4px/8px incremental grid:
- `gap-1` ($4\text{px}$): Icon + text pairings.
- `gap-2` ($8\text{px}$): Button groups, tag lists.
- `gap-3` ($12\text{px}$): Grid card items, telemetry stats.
- `gap-4` ($16\text{px}$): Standard layout sections.
- `gap-6` ($24\text{px}$): Major view panels.
- `gap-8` ($32\text{px}$): Page view hero separation.

---

## 6. Motion & Interactive Physics

- **Default Ease Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Swift acceleration with gentle settling).
- **Duration**:
  - Micro-interactions (hover, active tap): $150\text{ms}–200\text{ms}$.
  - Modal / Drawer transitions: $250\text{ms}$.
  - Step transitions (replays, slides): $200\text{ms}$.
- **Framer Motion Presets**:
  - *Hover elevation*: `whileHover={{ scale: 1.015, y: -1 }}`
  - *Tactile tap*: `whileTap={{ scale: 0.96 }}`
  - *Spring dynamics*: `{ type: 'spring', stiffness: 400, damping: 25 }`
- **Feedback Latency**: Must execute within $\le 200\text{ms}$.

---

## 7. Deep Mobile Optimization & Accessibility

- **Minimum Touch Targets**: Every interactive target is at least $44\text{px} \times 44\text{px}$ on touch devices.
- **Accessible Focus Indicators**:
  ```css
  button:focus-visible, a:focus-visible, input:focus-visible {
    outline: 2px solid #06b6d4;
    outline-offset: 2px;
  }
  ```
- **Safe Area Padding**: Bottom navigation bars respect iOS home indicator (`pb-safe`).
- **No Overflow Scrolling**: Layout avoids horizontal clipping; game boards scale proportionally via `aspect-square`.
