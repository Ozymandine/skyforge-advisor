---
version: alpha
name: Skyforge Advisor
description: "Luxury neoclassical editorial companion for Hypixel SkyBlock — obsidian ink, aged-gold foil, and imperial typography for the discerning player."
colors:
  # Core neutrals — deep obsidian foundations
  obsidian: "#0B0B0E"
  obsidian-elevated: "#121216"
  obsidian-strong: "#1A1A1F"
  parchment: "#F5F0E8"
  parchment-muted: "#E8E0D4"
  parchment-dark: "#2D2A24"

  # Gold foil accent system — the singular interaction driver
  gold-foil: "#C5A059"
  gold-foil-bright: "#DCC48A"
  gold-foil-dim: "#9B7E3E"
  gold-foil-glow: "rgba(197, 160, 89, 0.15)"
  gold-foil-strong: "rgba(197, 160, 89, 0.35)"

  # Oxblood / crimson — high-emphasis warnings, critical margins, danger
  oxblood: "#8B1A1A"
  oxblood-bright: "#B82E2E"
  oxblood-dim: "#5C1212"
  oxblood-glow: "rgba(139, 26, 26, 0.12)"

  # Antique emerald — profit, success, high-value snipes
  antique-emerald: "#2D6B4E"
  antique-emerald-bright: "#3A8F6B"
  antique-emerald-dim: "#1E4A33"
  antique-emerald-glow: "rgba(45, 107, 78, 0.12)"

  # SkyBlock rarity seals — gilded, not flat
  r-common: "#9CA3AF"
  r-uncommon: "#4ADE80"
  r-rare: "#60A5FA"
  r-epic: "#A78BFA"
  r-legendary: "#FBBF24"
  r-mythic: "#F87171"
  r-divine: "#FDBA74"
  r-special: "#E879F9"

  # Semantic aliases for component consumption
  background: "{colors.obsidian}"
  foreground: "{colors.parchment}"
  card: "{colors.obsidian-elevated}"
  card-foreground: "{colors.parchment}"
  popover: "{colors.obsidian-strong}"
  popover-foreground: "{colors.parchment}"
  primary: "{colors.gold-foil}"
  primary-foreground: "{colors.obsidian}"
  secondary: "{colors.obsidian-strong}"
  secondary-foreground: "{colors.parchment-muted}"
  muted: "{colors.obsidian-strong}"
  muted-foreground: "{colors.parchment-muted}"
  accent: "{colors.gold-foil-dim}"
  accent-foreground: "{colors.parchment}"
  destructive: "{colors.oxblood-bright}"
  destructive-foreground: "{colors.parchment}"
  border: "rgba(197, 160, 89, 0.08)"
  input: "rgba(197, 160, 89, 0.12)"
  ring: "{colors.gold-foil}"
  surface: "{colors.obsidian-elevated}"
  surface-strong: "{colors.obsidian-strong}"

  # Chart / data viz
  chart-1: "{colors.gold-foil}"
  chart-2: "{colors.antique-emerald-bright}"
  chart-3: "{colors.oxblood-bright}"
  chart-4: "{colors.r-epic}"
  chart-5: "{colors.r-mythic}"

  # Sidebar
  sidebar: "{colors.obsidian}"
  sidebar-foreground: "{colors.parchment}"
  sidebar-primary: "{colors.gold-foil}"
  sidebar-primary-foreground: "{colors.obsidian}"
  sidebar-accent: "{colors.obsidian-strong}"
  sidebar-accent-foreground: "{colors.parchment}"
  sidebar-border: "rgba(197, 160, 89, 0.06)"
  sidebar-ring: "{colors.gold-foil}"

typography:
  # Display / Hero — Cinzel: regal, imperial, high-contrast serif
  display-xl:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  display-lg:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  display-md:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  display-sm:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.005em"

  # Editorial headings — Fraunces: sophisticated, high-contrast, numeral-aware
  h1:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  h2:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.005em"
  h3:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  h4:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.35
  h5:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
  h6:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4

  # Body & UI — Newsreader: editorial readability, excellent numerals
  body-lg:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  body-xs:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.55

  # Mono / Data — JetBrains Mono: precise, tabular figures, code
  mono-lg:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "'tnum' 1, 'cv04' 1"
  mono-md:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "'tnum' 1, 'cv04' 1"
  mono-sm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "'tnum' 1, 'cv04' 1"

  # Labels / UI chrome — small caps, tracking
  label-lg:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
    textTransform: "uppercase"
  label-md:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  label-sm:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.12em"
    textTransform: "uppercase"

rounded:
  none: 0
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  2xl: "20px"
  full: "9999px"

spacing:
  0: 0
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  12: "48px"
  16: "64px"
  20: "80px"
  24: "96px"

elevation:
  none: "none"
  sm: "0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(197,160,89,0.04)"
  md: "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(197,160,89,0.06)"
  lg: "0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -2px rgba(197,160,89,0.08)"
  xl: "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(197,160,89,0.1)"
  inner: "inset 0 2px 4px 0 rgba(0,0,0,0.3)"
  gold-glow: "0 0 24px -4px rgba(197,160,89,0.25), 0 0 48px -12px rgba(197,160,89,0.15)"

shapes:
  card: "{rounded.md}"
  card-hover: "{rounded.lg}"
  button: "{rounded.sm}"
  button-pill: "{rounded.full}"
  input: "{rounded.sm}"
  badge: "{rounded.full}"
  avatar: "{rounded.full}"
  tooltip: "{rounded.sm}"
  modal: "{rounded.xl}"

# Custom icon system tokens
icons:
  # Stroke weight for custom SVG icons
  stroke-width: 1.5
  stroke-width-bold: 2
  # Icon sizes
  size-xs: "14px"
  size-sm: "18px"
  size-md: "22px"
  size-lg: "28px"
  size-xl: "36px"
  size-2xl: "48px"
  # Semantic color mappings
  color-default: "{colors.muted-foreground}"
  color-primary: "{colors.gold-foil}"
  color-muted: "{colors.muted-foreground}"
  color-destructive: "{colors.oxblood-bright}"
  color-success: "{colors.antique-emerald-bright}"

components:
  # ── Navigation ──
  nav-link:
    typography: "{typography.body-sm}"
    textColor: "{colors.muted-foreground}"
    padding: "{spacing.2} {spacing.3}"
    rounded: "{rounded.sm}"
    transition: "color 150ms ease, background-color 150ms ease"
  nav-link-active:
    textColor: "{colors.gold-foil}"
    backgroundColor: "rgba(197,160,89,0.08)"
    borderLeft: "3px solid {colors.gold-foil}"
  nav-link-hover:
    textColor: "{colors.gold-foil-dim}"
    backgroundColor: "rgba(197,160,89,0.04)"

  # ── Buttons ──
  button-primary:
    backgroundColor: "{colors.gold-foil}"
    textColor: "{colors.obsidian}"
    typography: "{typography.label-md}"
    padding: "{spacing.3} {spacing.6}"
    rounded: "{rounded.sm}"
    border: "none"
    boxShadow: "{elevation.gold-glow}"
    transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease"
  button-primary-hover:
    backgroundColor: "{colors.gold-foil-bright}"
    boxShadow: "0 0 32px -4px rgba(197,160,89,0.4), 0 0 64px -16px rgba(197,160,89,0.2)"
    transform: "translateY(-1px)"
  button-primary-active:
    backgroundColor: "{colors.gold-foil-dim}"
    transform: "translateY(0)"
    boxShadow: "{elevation.gold-glow}"
  button-primary-disabled:
    backgroundColor: "rgba(197,160,89,0.3)"
    textColor: "{colors.muted-foreground}"
    boxShadow: "none"
    cursor: "not-allowed"

  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.gold-foil}"
    typography: "{typography.label-md}"
    padding: "{spacing.3} {spacing.6}"
    rounded: "{rounded.sm}"
    border: "1px solid {colors.gold-foil}"
    transition: "background-color 120ms ease, color 120ms ease"
  button-secondary-hover:
    backgroundColor: "rgba(197,160,89,0.08)"
  button-secondary-active:
    backgroundColor: "rgba(197,160,89,0.15)"

  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
    padding: "{spacing.2} {spacing.4}"
    rounded: "{rounded.sm}"
    border: "none"
    transition: "color 120ms ease, background-color 120ms ease"
  button-ghost-hover:
    textColor: "{colors.parchment}"
    backgroundColor: "{colors.obsidian-strong}"

  button-destructive:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.parchment}"
    typography: "{typography.label-md}"
    padding: "{spacing.3} {spacing.6}"
    rounded: "{rounded.sm}"
    border: "none"
    boxShadow: "0 0 24px -4px rgba(139,26,26,0.3)"
  button-destructive-hover:
    backgroundColor: "{colors.oxblood-bright}"
    boxShadow: "0 0 32px -4px rgba(139,26,26,0.4)"

  # ── Cards ──
  card-default:
    backgroundColor: "{colors.card}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    padding: "{spacing.6}"
    boxShadow: "{elevation.sm}"
    transition: "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease"
  card-hover:
    borderColor: "rgba(197,160,89,0.18)"
    boxShadow: "{elevation.md}"
    transform: "translateY(-2px)"
  card-interactive:
    cursor: "pointer"
  card-interactive-hover:
    borderColor: "rgba(197,160,89,0.25)"
    boxShadow: "{elevation.lg}"

  card-gilded:
    backgroundColor: "{colors.card}"
    border: "1px solid {colors.gold-foil-dim}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
    boxShadow: "{elevation.gold-glow}"
    backgroundImage: "linear-gradient(135deg, rgba(197,160,89,0.03) 0%, transparent 50%), url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZmlsdGVyIGlkPSJub2lzZSIgeD0iMCIgeT0iMCI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkwIiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB0eXBlPSJmdXJpdHlEaXN0b3J0aW9uIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSIpIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')"
  card-gilded-hover:
    borderColor: "{colors.gold-foil}"
    boxShadow: "0 0 40px -8px rgba(197,160,89,0.35), 0 20px 30px -10px rgba(0,0,0,0.5)"

  # ── Form Inputs ──
  input-default:
    backgroundColor: "{colors.obsidian-strong}"
    border: "1px solid {colors.input}"
    textColor: "{colors.parchment}"
    placeholderColor: "{colors.muted-foreground}"
    typography: "{typography.body-md}"
    padding: "{spacing.3} {spacing.4}"
    rounded: "{rounded.sm}"
    transition: "border-color 150ms ease, box-shadow 150ms ease"
  input-focus:
    borderColor: "{colors.gold-foil}"
    boxShadow: "0 0 0 3px {colors.gold-foil-glow}"
    outline: "none"
  input-error:
    borderColor: "{colors.oxblood-bright}"
    boxShadow: "0 0 0 3px {colors.oxblood-glow}"

  # ── Badges / Seals ──
  badge-default:
    backgroundColor: "{colors.obsidian-strong}"
    textColor: "{colors.parchment-muted}"
    typography: "{typography.label-sm}"
    padding: "{spacing.1} {spacing.3}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.border}"
  badge-gold:
    backgroundColor: "rgba(197,160,89,0.12)"
    textColor: "{colors.gold-foil-bright}"
    border: "1px solid rgba(197,160,89,0.25)"
  badge-rarity-common:
    textColor: "{colors.r-common}"
    borderColor: "{colors.r-common}"
    backgroundColor: "rgba(156,163,175,0.1)"
  badge-rarity-uncommon:
    textColor: "{colors.r-uncommon}"
    borderColor: "{colors.r-uncommon}"
    backgroundColor: "rgba(74,222,128,0.1)"
  badge-rarity-rare:
    textColor: "{colors.r-rare}"
    borderColor: "{colors.r-rare}"
    backgroundColor: "rgba(96,165,250,0.1)"
  badge-rarity-epic:
    textColor: "{colors.r-epic}"
    borderColor: "{colors.r-epic}"
    backgroundColor: "rgba(167,139,250,0.1)"
  badge-rarity-legendary:
    textColor: "{colors.r-legendary}"
    borderColor: "{colors.r-legendary}"
    backgroundColor: "rgba(251,191,36,0.1)"
  badge-rarity-mythic:
    textColor: "{colors.r-mythic}"
    borderColor: "{colors.r-mythic}"
    backgroundColor: "rgba(248,113,113,0.1)"
  badge-rarity-divine:
    textColor: "{colors.r-divine}"
    borderColor: "{colors.r-divine}"
    backgroundColor: "rgba(253,186,116,0.1)"
  badge-rarity-special:
    textColor: "{colors.r-special}"
    borderColor: "{colors.r-special}"
    backgroundColor: "rgba(232,121,249,0.1)"

  # ── Tables / Data Dense ──
  table-container:
    backgroundColor: "{colors.obsidian-elevated}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.md}"
    overflow: "hidden"
  table-header:
    backgroundColor: "{colors.obsidian-strong}"
    textColor: "{colors.gold-foil-dim}"
    typography: "{typography.label-sm}"
    padding: "{spacing.3} {spacing.4}"
    borderBottom: "1px solid {colors.border}"
  table-row:
    textColor: "{colors.parchment}"
    typography: "{typography.body-sm}"
    padding: "{spacing.3} {spacing.4}"
    borderBottom: "1px solid rgba(197,160,89,0.04)"
    transition: "background-color 120ms ease"
  table-row-hover:
    backgroundColor: "rgba(197,160,89,0.03)"
  table-row-profit:
    textColor: "{colors.antique-emerald-bright}"
  table-row-loss:
    textColor: "{colors.oxblood-bright}"

  # ── Tooltips / Popovers ──
  tooltip-default:
    backgroundColor: "{colors.obsidian-strong}"
    border: "1px solid {colors.gold-foil-dim}"
    textColor: "{colors.parchment}"
    typography: "{typography.body-sm}"
    padding: "{spacing.3} {spacing.4}"
    rounded: "{rounded.sm}"
    boxShadow: "{elevation.lg}"
  popover-default:
    backgroundColor: "{colors.popover}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
    boxShadow: "{elevation.xl}"

  # ── Progress / Meters ──
  progress-track:
    backgroundColor: "{colors.obsidian-strong}"
    rounded: "{rounded.full}"
    height: "6px"
  progress-fill:
    backgroundColor: "{colors.gold-foil}"
    rounded: "{rounded.full}"
    height: "100%"
    transition: "width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
  progress-fill-emerald:
    backgroundColor: "{colors.antique-emerald-bright}"
  progress-fill-oxblood:
    backgroundColor: "{colors.oxblood-bright}"

  # ── Avatar ──
  avatar-default:
    rounded: "{rounded.full}"
    border: "2px solid {colors.gold-foil-dim}"
    backgroundColor: "{colors.obsidian-strong}"
    objectFit: "cover"
  avatar-gilded:
    border: "2px solid {colors.gold-foil}"
    boxShadow: "{elevation.gold-glow}"

  # ── Dividers ──
  divider-default:
    borderColor: "{colors.border}"
  divider-gilded:
    borderColor: "rgba(197,160,89,0.15)"
    borderImage: "linear-gradient(90deg, transparent, {colors.gold-foil-dim}, transparent) 1"

  # ── Scrollbar ──
  scrollbar-track:
    backgroundColor: "{colors.obsidian}"
  scrollbar-thumb:
    backgroundColor: "{colors.obsidian-strong}"
    border: "1px solid {colors.border}"
    rounded: "{rounded.full}"
  scrollbar-thumb-hover:
    backgroundColor: "{colors.gold-foil-dim}"

---

## Overview

**Skyforge Advisor** adopts a **Luxury Neoclassical / Editorial** visual identity — "The Arcane Imperial Ledger." 

This is not a gaming dashboard; it is a **compendium of power**. The aesthetic draws from:
- **Luxury horology** (Patek Philippe, A. Lange & Söhne): precision, restraint, precious materials
- **Antique financial ledgers & imperial archives**: density, authority, trust
- **High-end editorial design** (The Economist, Monocle, Wallpaper*): typographic hierarchy, white space as luxury
- **Dark academia / arcane scholarship**: obsidian ink, gold illumination, secrets worth guarding

**First impression:** A player opens Skyforge and feels they've been granted access to a private vault of knowledge — not another neon SaaS tool.

---

## Colors

The palette is **deliberately minimal** — three semantic families, each with purpose:

### Obsidian Foundation (Neutrals)
- **`obsidian` (#0B0B0E)** — True near-black page background. Deeper than standard slate, absorbs light.
- **`obsidian-elevated` (#121216)** — Card surfaces, one step up. Subtle depth without gray washout.
- **`obsidian-strong` (#1A1A1F)** — Interactive surfaces, inputs, hover states. Visible separation.
- **`parchment` (#F5F0E8)** — Primary text. Warm off-white, never pure #FFF. Reduces eye strain, feels aged.
- **`parchment-muted` (#E8E0D4)** — Secondary text, metadata, disabled states.
- **`parchment-dark` (#2D2A24)** — Inverted contexts, dark mode print styles.

### Gold Foil (Primary / Interaction)
- **`gold-foil` (#C5A059)** — **The singular brand color.** Buttons, active states, focus rings, gold-leaf borders. Warm, muted, authentic — not neon yellow.
- **`gold-foil-bright` (#DCC48A)** — Hover, pressed highlights. Catches light like real foil.
- **`gold-foil-dim` (#9B7E3E)** — Subtle borders, dividers, secondary gold accents.
- **`gold-foil-glow` / `gold-foil-strong`** — Ambient glow shadows for elevated cards, primary buttons.

### Semantic Accents (Restrained, Meaningful)
- **`oxblood` (#8B1A1A)** — Danger, critical loss, margin warnings, delete actions. Deep, serious — not alarm-red.
- **`antique-emerald` (#2D6B4E)** — Profit, success, high-value flips, skill completion. Aged verdigris, not bright green.
- **Rarity Seals** — Gilded Minecraft rarity colors with subtle metallic shimmer via gradients, not flat fills.

**Usage Rules:**
- Gold foil appears **only on interactive elements** and **active focus states**. Never as decorative flood.
- Oxblood and Antique Emerald are **data-semantic only** — never used for UI chrome.
- All borders use `rgba(197,160,89,α)` — gold at varying opacity — never gray.

---

## Typography

Three typefaces, each with a distinct role. **No Inter, no system-ui fallbacks for display.**

### Cinzel — Regal Display & Labels
- **Use:** Hero headlines, page titles, section labels (uppercase), badge text, navigation chrome.
- **Character:** High-contrast serif, classical Roman proportions, imperial authority.
- **Weights:** 500, 600, 700. Tight tracking on display sizes; wide tracking on labels.

### Fraunces — Editorial Headings & Numbers
- **Use:** H1–H6, card titles, stat labels, any heading that carries editorial weight.
- **Character:** Sophisticated transitional serif, excellent numerals (tabular by default), softserve curves.
- **Weights:** 500–700. Slightly looser tracking than Cinzel for readability.

### Newsreader — Long-form Body & UI Text
- **Use:** Paragraphs, descriptions, table cells, form labels, tooltip content.
- **Character:** Contemporary editorial serif, generous x-height, superb readability at small sizes.
- **Weights:** 400 (regular), 500 (medium), 600 (semibold for emphasis).

### JetBrains Mono — Precision Data & Code
- **Use:** Coin values, bazaar prices, profit margins, XP numbers, timestamps, code blocks.
- **Character:** Technical monospace, tabular numerals (`tnum`), slashed zero (`cv04`), precise alignment.
- **Weights:** 500 (medium) for data, 400 for code.

**Hierarchy Principle:** Weight and size carry hierarchy. Font family **never** changes for emphasis within a semantic role.

---

## Layout & Spacing

- **Baseline:** 4px (`spacing.1` = 4px). All spacing tokens are multiples.
- **Card padding:** `spacing.6` (24px) default, `spacing.8` (32px) for dense data cards.
- **Section breaks:** `spacing.16` (64px) between major sections, `spacing.12` (48px) between subsections.
- **Inline gaps:** `spacing.3` (12px) for icon+label, `spacing.4` (16px) for button groups.
- **Container max-width:** `1280px` (content), `1440px` (full-bleed tables).

---

## Elevation & Depth

Shadows are **obsidian-first with gold ambient** — never pure black blur.

- **`elevation.sm`** — Default card rest state. Barely perceptible.
- **`elevation.md`** — Card hover, dropdown menus.
- **`elevation.lg`** — Modals, popovers, floating panels.
- **`elevation.xl`** — Full-screen overlays, command palette.
- **`elevation.gold-glow`** — **Signature elevation.** Primary buttons, gilded cards, avatar highlights. The only colored shadow in the system.

**No layered shadows on the same element.** One elevation per surface.

---

## Shapes

- **`rounded.sm` (4px)** — Buttons, inputs, badges, tooltips. Crisp, precise.
- **`rounded.md` (8px)** — Default cards, popovers, modals. The system standard.
- **`rounded.lg` (12px)** — Gilded cards, featured panels.
- **`rounded.full`** — Avatars, pills, progress tracks, rarity badges.

**No `rounded.xl` or larger on interactive elements.** Generous radius feels soft/SaaS; we want crisp/archival.

---

## Components

Component definitions reference tokens via `{colors.xxx}`, `{typography.xxx}`, `{spacing.xxx}`, `{rounded.xxx}`, `{elevation.xxx}`. This keeps the palette single-source.

### Icon System (Custom SVG — Replaces Lucide)

**All icons are custom SVG assets** located at `src/assets/icons/` with the following conventions:

| Icon ID | Visual Metaphor | Usage |
|---------|----------------|-------|
| `coin` | Gold ingot with ₵ mark | Net worth, purse, bank |
| `coins` | Stacked coins with ₵ marks | Multi-currency, bazaar, treasury |
| `bot` | Mechanical robot head | AI features, automation, bots |
| `sparkles` | Four-point stars with center glow | Magic, enchanting, special effects |
| `swords` | Crossed engraved longswords | Combat, dungeons, slayer |
| `sword` | Single engraved longsword | Weapon, melee, individual item |
| `shield` | Heraldic quartered shield | Defense, protection, ward |
| `shield-check` | Shield with wax-seal checkmark | Verified defense, completed ward |
| `shield-alert` | Shield with alert marker | Warning defense, expiring ward |
| `zap` | Gilded lightning bolt | Hot deals, active buffs, speed |
| `target` | Concentric circles | Flip radar, precision, aim |
| `trending-up` | Calligraphic up-stroke with flourish | Profit, positive margin, gain |
| `award` | Laurel circle with banner | Achievements, milestones, rewards |
| `crosshair` | Crosshair reticle | Precision, targeting, sniping |
| `sliders` | Three vertical faders | Settings, tuning, configuration |
| `compass` | Engraved compass rose | Navigation, exploration, wayfinding |
| `boxes` | Isometric stacked crates | Inventory, storage, collections |
| `key-round` | Ornate padlock key | API keys, secrets, access |
| `layout-dashboard` | Four-panel dashboard grid | Overview, dashboard, home |
| `line-chart` | Ascending line chart | Analytics, trends, progress |
| `star` | 8-point compass star with glow | Favorites, bookmarks, featured |
| `lock` | Ornate padlock | Private, premium, secured |
| `circle-check` | Wax seal with check | Success, verified, completed |
| `x-circle` | Wax seal with cross | Error, failed, cancelled |
| `info-circle` | Wax seal with i | Info, tooltips, hints |
| `alert-circle` | Wax seal with exclamation | Warnings, API errors, expiring |
| `check-circle-2` | Wax seal with bold check | Primary success, confirmed |
| `alert-triangle` | Wax seal triangle with exclamation | Caution, attention required |
| `refresh` | Ouroboros circular arrow | Refresh data, re-fetch |
| `external-link` | Arrow breaking seal | External wiki, Hypixel links |
| `chevron-right` | Gold-leaf guillemet | Navigation, expand, next |
| `chevron-down` | Gold-leaf guillemet down | Dropdown, accordion |
| `search` | Engraved magnifying glass | Search, lookup, filter |
| `refresh-cw` | Circular arrow clockwise | Refresh, sync, rotate |
| `arrow-right` | Rightward arrow with feathered tip | Forward, continue, proceed |
| `arrow-left` | Leftward arrow with feathered tip | Back, return, previous |
| `arrow-up` | Upward arrow with feathered tip | Up, ascend, increase |
| `rotate-ccw` | Counter-clockwise rotation | Undo, reset, revert |
| `arrow-down` | Downward arrow with feathered tip | Down, descend, decrease |
| `bar-chart-3` | Three-bar histogram | Flip radar, bazaar analytics |
| `volume-2` | Speaker with sound waves | Audio on, notifications enabled |
| `volume-x` | Speaker with slash | Audio off, notifications muted |
| `scale` | Balance scales | Fair trade, price check, equity |
| `circle-check-2` | Bold wax seal check | Duplicate of check-circle-2 |
| `plus` | Crosshair plus | Add, create, expand |
| `x` | Crosshair X | Close, cancel, remove |
| `gavel` | Auction gavel | Auctions, bidding, hammer price |
| `trash-2` | Waste bin with lid | Delete, discard, cleanup |
| `calculator` | Mechanical calculator | Math, profit calc, conversion |
| `hammer` | Blacksmith hammer | Crafting, forging, anvil work |
| `hammer-2` | Alternate hammer style | Heavy crafting, reforging |
| `shopping-cart` | Merchant cart | Bazaar, purchases, shopping |
| `pickaxe` | Engraved mining pickaxe | Mining, excavation, resources |
| `wheat` | Stalk of wheat | Farming, crops, harvest |
| `flask-conical` | Alchemical flask | Alchemy, potions, brewing |
| `heart` | Classic heart shape | Health, favorites, life |
| `fish` | Stylized fish | Fishing, sea creatures, water |
| `flame` | Gilded flame | Fire, cooking, hot items |
| `moon` | Crescent moon | Night, sleep, dark mode |
| `sprout` | Young plant sprout | Farming, growth, garden |
| `skull` | Human skull | Death, danger, slayer boss |
| `crown` | Imperial 5-peak crown | Legendary/Mythic, royalty, top rank |
| `trophy` | Chalice trophy with handles | Victories, competitions, leaderboards |
| `bell-ring` | Ringing bell with motion lines | Active alerts, notifications firing |
| `menu` | Three-line hamburger | Navigation drawer, menu |
| `play` | Right-pointing triangle | Play, start, begin |
| `panel-left` | Three-panel sidebar | Layout, panels, sections |
| `hourglass` | Flowing sand timer | Time, cooldowns, waiting |
| `clock` | Analog clock face | Time, schedules, timers |
| `loader-2` | Dual arcs spinner | Loading, fetching, processing |
| `pin` | Map pin with flag | Pinned items, bookmarks, location |
| `user-check` | User bust with check | Verified player, trusted |
| `bell` | Silent bell | Notifications, alerts |
| `book-open` | Open grimoire | Wiki, guides, spellbooks |
| `calendar` | Vellum calendar page | Events, garden cycles, elections |
| `check` | Simple checkmark | Done, confirm, select |
| `gauge` | Speedometer gauge | Progress, meters, dials |
| `panel-left-close` | Sidebar with close handle | Collapse sidebar |
| `panel-left-open` | Sidebar with open handle | Expand sidebar |
| `settings` | Armillary sphere / astrolabe | Configuration, preferences |
| `sun` | Radiant sun | Day, light mode, solar |
| `user` | Silhouette bust with laurel | Profile, account, settings |
| `more-horizontal` | Three-dot horizontal | Overflow menu, more actions |
| `filter` | Funnel filter | Filter, sort, refine |
| `sliders-horizontal` | Horizontal fader trio | Advanced settings, tuning |
| `copy` | Document copy | Copy to clipboard, duplicate |
| `dog` | Loyal hound | Pets, companions, taming |
| `radio` | Radio dial | Radio, tuning, frequency |
| `layers` | Stacked parchment sheets | Layers, tabs, multi-view |
| `share-2` | Three-node share graph | Share, export, distribute |
| `download` | Downward arrow to tray | Download, export, save |
| `arrow-up-right` | Diagonal up-right arrow | External link, open new |

**Icon Implementation Rules:**
- All icons are **inline SVG components** (`IconCoin`, `IconCrown`, etc.) — no icon font, no external CDN.
- Stroke width: `1.5` (default), `2` (bold/active). Never fill-only.
- `currentColor` for stroke → inherits text color automatically.
- `size-*` tokens map to `width`/`height` in `rem`.
- Semantic color via `text-{color}` utilities (e.g., `text-gold-foil`, `text-oxblood-bright`).
- Accessibility: `aria-hidden="true"` on decorative icons; `role="img" aria-label="..."` on standalone meaningful icons.

---

## Do's and Don'ts

### Do
- ✅ Use token references (`{colors.gold-foil}`) everywhere — never hardcode hex in components.
- ✅ Restrict gold foil to **interactive affordances only** (buttons, focus rings, active nav, gilded card borders).
- ✅ Use **tabular numerals** (`fontFeature: "'tnum' 1"`) on ALL monetary/XP/stat values.
- ✅ Prefer **density over whitespace** in data tables — this is a ledger, not a landing page.
- ✅ Animate with **respect for `prefers-reduced-motion`** — 120–200ms easings, no parallax.
- ✅ Test contrast at **WCAG AAA** for body text (parchment on obsidian = 14.2:1 ✅).

### Don't
- ❌ **No Lucide, Phosphor, Heroicons, or any third-party icon set.** Custom SVG only.
- ❌ No `rounded.xl` / `rounded.2xl` / `rounded.3xl` on cards or buttons.
- ❌ No pure `#FFFFFF` text — use `parchment` / `parchment-muted`.
- ❌ No gray borders — only `rgba(197,160,89,α)` gold-opacity borders.
- ❌ No neon/cyan/bright green anywhere — not even in charts (use antique-emerald family).
- ❌ No `box-shadow` with pure black/rgba(0,0,0) only — always blend gold ambient.
- ❌ No `Inter`, `Space Grotesk`, `Pixelify Sans`, or system-ui in the new system.
- ❌ Don't nest component variants in DESIGN.md — `button-primary-hover` is a sibling key.
- ❌ Don't introduce new colors without adding them to the palette first.

---

## Implementation Roadmap

### Phase 1: Foundation (Design Tokens + Typography)
1. Replace `src/styles.css` with DESIGN.md-exported Tailwind v4 `@theme` block (via `npx @google/design.md export --format css-tailwind DESIGN.md > theme.css`).
2. Add Google Fonts imports: `Cinzel`, `Fraunces`, `Newsreader`, `JetBrains Mono`.
3. Remove `Space Grotesk`, `Pixelify Sans` from font stack.

### Phase 2: Custom Icon System
1. Create `src/assets/icons/` with 26 custom SVG components.
2. Build `src/components/ui/icon.tsx` wrapper with `size`, `color`, `strokeWidth` props.
3. Codemod: replace all `lucide-react` imports with `@/components/ui/icon`.

### Phase 3: Core Chrome
1. `AppShell` (sidebar, header, navigation) → new tokens, gilded active states.
2. `PageHero`, `PageHeader` → Cinzel display, gold foil accent lines.
3. `Button`, `Input`, `Badge`, `Card` primitives → new component specs.

### Phase 4: Feature Pages
1. Landing (`/`) → prestige vault search, gold foil CTA.
2. Dashboard/Profile → serif stats, gilded cards, mono coin values.
3. Bazaar/Flips/Auction → dense ledger tables, oxblood/emerald semantics.
4. Wiki/Collections → grimoire aesthetic, scroll motifs.

### Phase 5: Polish
1. Scrollbar styling, selection colors, focus-visible rings.
2. Loading skeletons with gold shimmer.
3. Empty states with engraved illustrations.
4. Print stylesheet for "Ledger Export" views.

---

*Generated for Skyforge Advisor v2 — The Arcane Imperial Ledger.*