---
name: Build Kos
description: Manajemen kos dalam satu lantai tegel; setiap kamar adalah satu ubin, motifnya adalah statusnya.
colors:
  primary: "#2f5bdc"
  primary-hover: "#264bc0"
  primary-soft: "#eef3ff"
  primary-tint: "#dbe7ff"
  cobalt-mid: "#96b4fb"
  brand-amber: "#fbbf24"
  brand-amber-soft: "#fef3c7"
  repair-stripe: "#fcd980"
  repair-ink: "#9a6500"
  ink: "#1c2541"
  gray-50: "#f6f8fc"
  gray-100: "#eef1f8"
  gray-200: "#dfe5f1"
  gray-300: "#c8d0e2"
  gray-400: "#8993b0"
  gray-500: "#66708f"
  gray-600: "#4a5578"
  gray-700: "#343e5e"
  gray-800: "#252d4a"
  surface: "#ffffff"
  danger: "#b42318"
  danger-soft: "#fef3f2"
  danger-border: "#f5c2bd"
  invalid: "#d92d20"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Geist, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.5rem, 6.2vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, Geist, ui-sans-serif, sans-serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Geist, ui-sans-serif, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1
  tile-number:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
rounded:
  sm: "6px"
  md: "8px"
  xl: "14px"
  tile-sm: "4px"
spacing:
  tile-gap: "8px"
  card-pad: "24px"
  section-y: "96px"
  gutter: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.gray-800}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gray-700}"
    rounded: "{rounded.md}"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    height: "40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.gray-900}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "24px"
  tile-available:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.gray-700}"
    rounded: "{rounded.md}"
  tile-occupied:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
  tile-repair:
    backgroundColor: "{colors.brand-amber-soft}"
    textColor: "{colors.gray-900}"
    rounded: "{rounded.md}"
  tile-pending:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.gray-700}"
    rounded: "{rounded.md}"
---

# Design System: Build Kos

## Overview

**Creative North Star: "Tegel Kunci"**

One tiled floor. Every room is one tile, and the tile's pattern is its status. The system is light only: a pale blue-gray ground, thin grout-like lines, one cobalt accent, and amber reserved for the logo and for repair. Surfaces are flat ink-on-paper with hard-edged patterns. There are no decorative gradients, no blur, and no photographs or rasters in the shipped system.

The same system serves landing, auth, owner and staff dashboards, renter dashboard, and admin. Landing uses it in Persuade mode (large Bricolage headings, tile floor as the only hero visual); the app uses it in Operate mode (dense Geist UI, tabular numbers, status tiles as legend swatches). The tenant public page `kos/[subdomain]` is the one place where an owner overrides primary color, font, and template style through injected CSS variables; it must stay legible on any chosen theme and keeps the neutral scale, radii, and button/field shapes.

**Key Characteristics:**
- Light theme only; no dark mode, no dark surfaces. Cobalt (#2f5bdc) is the one mid-tone block color, used as a solid band, never as a dark ground.
- Status is read from pattern first, color second: outline, solid fill with diamond, diagonal stripes, dots.
- Two radii: 8px for controls and tiles, 14px for cards and modals.
- Tinted cool neutrals; no pure gray, no pure black text.
- Indonesian copy, sentence case, short declarative headings ending in a period.

## Colors

A cool blue-gray neutral scale, one cobalt accent, and amber held back for two jobs.

### Primary
- **Cobalt Key** (`{colors.primary}`): the only system accent. Primary buttons, occupied tiles, focus ring, links of emphasis, the closing CTA band, the large address line in the website band.
- **Cobalt Pressed** (`{colors.primary-hover}`): hover of primary button and of occupied tiles.
- **Cobalt Mist** (`{colors.primary-soft}`) and **Cobalt Tint** (`{colors.primary-tint}`): section bands, empty-tile outline, pending tile ground, selection highlight.
- **Cobalt Dot** (`{colors.cobalt-mid}`): the dot pattern on pending tiles.

### Secondary
- **Logo Amber** (`{colors.brand-amber}`): the house logo chip, the repair tile border, and the tile strip. Nowhere else.
- **Amber Wash** (`{colors.brand-amber-soft}`) with **Stripe Amber** (`{colors.repair-stripe}`): repair stripes and the repair feature card.
- **Repair Ink** (`{colors.repair-ink}`): diamond and hover border on repair tiles.

### Neutral
- **Night Ink** (`{colors.ink}`, same as gray-900): body text and headings.
- **Gray 50 to 300** (`{colors.gray-50}` page ground, `{colors.gray-100}` hover wash, `{colors.gray-200}` card and divider lines, `{colors.gray-300}` field border and scrollbar): the grout lines.
- **Gray 400 to 800**: placeholder and secondary text (`{colors.gray-500}`, `{colors.gray-600}`), button text (`{colors.gray-700}`, `{colors.gray-800}`).
- **White** (`{colors.surface}`): cards, fields, alternate section bands, header.
- **Danger** (`{colors.danger}`, `{colors.danger-soft}`, `{colors.danger-border}`, `{colors.invalid}`): destructive buttons and invalid field border.

Tailwind's gray, slate, blue, indigo, purple, and violet scales are all remapped in `@theme` to the neutral and cobalt scales above, so older screens that say `purple-600` or `indigo-500` render cobalt. New work uses `primary`, `primary-soft`, `brand`, and `gray-*` names.

### Named Rules
**The One Accent Rule.** Cobalt is the sole accent. Amber appears only on the logo chip, repair status, and the tile strip.
**The Pattern Before Color Rule.** A status never relies on hue alone; it always carries its tile pattern.

## Typography

**Display Font:** Bricolage Grotesque (with Geist, sans-serif)
**Body Font:** Geist (with system-ui, sans-serif)
**Label/Mono Font:** Geist Mono, for room numbers and counts, with tabular numerals in table cells.

**Character:** Bricolage gives headings a slightly quirky, tightly tracked voice; Geist keeps the interface quiet and exact.

### Hierarchy
- **Display** (800, clamp 2.5rem to 4.75rem, 1.02): landing H1, left aligned, two lines at most. Closing CTA H2 is 800 at 4xl to 6xl.
- **Headline** (700, 1.875rem rising to 3rem at md): section H2.
- **Title** (700, 1.25rem to 1.875rem): card and step headings, FAQ and feature terms at 1.125rem.
- **Body** (400, 1rem to 1.125rem, relaxed): paragraphs in gray-600, capped near `max-w-xl` or `max-w-prose`.
- **Label** (600, 0.875rem): buttons, nav links (500), legends.
- **Tile number** (Geist Mono 600, 0.75rem): room numbers on tiles, legend counts.

### Named Rules
**The Tracking Rule.** Display faces use tight tracking (`tracking-tight`); headings use `text-wrap: balance`.

## Layout

Container is `max-w-7xl` with 20px side padding (32px from `sm`). Sections are separated by background alternation (gray-50, white, cobalt mist, white, gray-50, white, cobalt) rather than borders, with 64px vertical padding rising to 96px at `md`. The header is a single 64px sticky row, white, with a bottom line. Headings are left aligned with `max-w-2xl` to `max-w-4xl` measure. The tile floor is full width: a grid with 8px gaps on a gray-200 grout ground, 4 columns on phones, 6 at `sm`, 8 at `md`, 12 at `lg` (two floors of 12 rooms). The feature section is an intentionally uneven 6-column bento at `md` (4+2, 2+2... with a double-height lead cell); steps are stacked rows with dividers, not cards. Tenant pages follow the same container and spacing but with owner-chosen color and font.

## Elevation & Depth

Flat by default. Depth is carried by tonal layering: white cards on a pale ground, 1px gray-200 borders, and bands of color. Two shadow tokens exist and are soft ambient, never hard offset: a card shadow (barely lifted) and a pop shadow for modals and menus. Tiles lift 2px on hover/focus with no shadow.

### Shadow Vocabulary
- **Card** (`box-shadow: 0 1px 2px rgb(28 37 65 / 0.06), 0 10px 28px -14px rgb(28 37 65 / 0.16)`): `.card`.
- **Pop** (`box-shadow: 0 2px 6px rgb(28 37 65 / 0.08), 0 24px 48px -20px rgb(28 37 65 / 0.28)`): modals and floating panels.
- **Field focus ring** (`box-shadow: 0 0 0 3px rgb(47 91 220 / 0.18)` plus cobalt border).

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat at rest; lift is a state response (tile hover, focus ring), not decoration.

## Shapes

Square-leaning, tile-like geometry. 8px for buttons, fields, tiles, and the logo chip; 14px for cards and modals; 6px small and 4px for legend swatches. Tiles are always square (`aspect-ratio: 1`) with a 2px border and a rotated 45-degree diamond (32% width) at the center-low position. Repair stripes run at 135 degrees. The tile strip is a 14px conic-gradient checker (cobalt, tint, amber, mist, 28px cell) used as an edge band between content and footer, never behind text.

## Components

### Buttons
- **Shape:** 8px radius, 40px high (48px for `lg`), 600 weight, 0.875rem (1rem for `lg`).
- **Primary:** cobalt fill, white text; hover deepens to Cobalt Pressed.
- **Secondary:** white with gray-200 border; hover gray-50 and gray-300 border.
- **Ghost:** transparent, gray-700 text, gray-100 hover.
- **Danger:** white with red text and soft red border.
- **Active / Disabled:** 1px downward press; disabled is 55% opacity. Focus is the global 2px cobalt outline with 2px offset.
- **On cobalt bands:** a white-filled button with cobalt text, plus an outlined white-border button.

### Cards / Containers
- 14px radius, white, 1px gray-200 border, card shadow, 24px to 32px padding. Colored variants (cobalt mist, amber wash, solid cobalt) are used inside the bento to carry status meaning.

### Inputs / Fields
- 44px high, white, 1px gray-300 border, 8px radius, 0.9375rem. Hover darkens border to gray-400; focus swaps to a cobalt border with a 3px soft cobalt ring; invalid uses a red border.

### Status Tile (signature)
- One tile per room. **Available (Kosong):** white fill, cobalt-tint outline, cobalt diamond outline. **Occupied (Terisi):** solid cobalt, white diamond. **Repair (Perbaikan):** amber 135-degree stripes, amber border, repair-ink diamond. **Pending (Menunggu):** cobalt-mist ground with cobalt dots.
- Interactive tiles (buttons) lift 2px and invert on hover or focus; entrance is a staggered 550ms rise (26ms per tile) honoring reduced motion. `tile-sm` (20px wide) is the legend swatch.

### Navigation
- Landing: white 64px sticky header, logo left, gray-600 links at 14px medium (hover to gray-900), Masuk (ghost) and Daftar (primary) right. Links collapse below `md`. App sidebars share the same neutral and cobalt tokens.

### FAQ
- Native `details` rows between divider lines; the marker is a small rotated diamond outline that fills cobalt when open.

## Do's and Don'ts

### Do:
- **Do** show room, booking, and payment state with the tile pattern plus a text label (Kosong, Terisi, Perbaikan, Menunggu).
- **Do** use `.btn`, `.field`, `.card`, `.tile` classes and `primary` / `gray-*` tokens for new screens.
- **Do** keep text on gray-900 or gray-600 or darker for AA contrast; white text only on cobalt.
- **Do** label sample data as an example ("Contoh denah", "Contoh alamat halaman kos").
- **Do** keep tenant-themed pages legible: fall back to the neutral scale and the 8/14 radii when the owner color is light.
- **Do** keep Indonesian copy and `lang="id"`.

### Don't:
- **Don't** add dark mode or any dark surface band.
- **Don't** use amber for anything except the logo chip, repair status, and the tile strip.
- **Don't** introduce a second accent hue or a third radius.
- **Don't** use decorative gradients, blur, or hard offset shadows; the only gradients are the tile patterns.
- **Don't** use a two-column hero with a fake dashboard mockup, or three equal feature cards.
- **Don't** invent testimonials, customers, prices, or usage numbers.
- **Don't** put the tile strip behind text.
