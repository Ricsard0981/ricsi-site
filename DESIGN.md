---
version: alpha
name: Ricsi
description: Personal site of Ricsi, a Hungarian video editor, developer and music producer. It should feel like a 2001 media player rebuilt with today's craft, smooth, glossy and confident.
colors:
  ground: "#E9EEF3"     # frosted silver-ice page
  panel: "#F7F9FB"      # raised plastic surfaces
  ink: "#0E1A2B"        # body text, 15.1:1 on ground
  muted: "#46566B"      # secondary text, 6.6:1 on ground
  blueberry: "#00779C"  # primary action + YouTube (white text 4.9:1)
  strawberry: "#C81E54" # music / rix.off. (white text 5.4:1)
  tangerine: "#E8740C"  # code (ink text 6.0:1)
  lime: "#6DBE2E"       # Discord / Minecraft nod (ink text 8.3:1)
typography:
  display:
    fontFamily: Michroma
    fontSize: clamp(3.4rem, 11vw, 9.5rem)
    fontWeight: 400
    letterSpacing: -0.02em
  body:
    fontFamily: Onest
    fontSize: 1.0625rem
    lineHeight: 1.6
  data:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
  pixel:
    fontFamily: Silkscreen
rounded:
  sm: 10px
  md: 18px
  pill: 999px
spacing:
  sm: 12px
  md: 24px
  lg: 56px
  xl: 120px
components:
  button-primary:
    backgroundColor: "{colors.blueberry}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: 14px 26px
---

## Overview

Ricsi edits videos, writes code and makes hyperpop as rix.off. The look comes from the
gear of the era he grew up idolising, not from a generic retro kit: the 1999 iMac G3
"flavors" (Blueberry, Strawberry, Tangerine, Lime), Mac OS X Aqua gloss and pinstripes
(2001), and the media-player skins of the early 2000s. It is executed with modern spacing,
large type and quiet motion, so it reads as current, not as an old site.

Minecraft is a 5% seasoning: the pixel grass-block mark in the logo, the favourite biome
fact, and the 404 page. Nothing else.

## Colors

- **Ground (#E9EEF3)** with faint Aqua pinstripes. Light, because frosted plastic is light.
- **Ink (#0E1A2B)**, deep navy, not black.
- **Flavors** each have one job: Blueberry = action and YouTube, Strawberry = music,
  Tangerine = code, Lime = community/Discord. A flavor only appears where its field does.

## Typography

- **Michroma** (a Microgramma-style wide face, the typeface of 2000s tech) for display only:
  the name, page titles, section titles, row names. Never for body text.
- **Onest** for all reading text and UI labels, in sentence case.
- **JetBrains Mono** only for the timeline timecode and the gear spec readout, data a
  reader actually scans.
- **Silkscreen** only inside the pixel logo mark and the 404 page.

## Layout

Left-aligned, wide container (1240px). The one structural idea: **the page is a timeline**.
The nav carries a scrubber whose clips are the page's sections, sized by their length, with a
playhead and a timecode that follow the scroll. Clicking a clip jumps to it.

## Elevation & Depth

Only three things are glossy plastic: primary buttons, the hero player, and the nav. Rows
and lists stay flat, separated by hairlines. Hovering a channel row fills it with its flavor.

## Shapes

Pill for buttons and chips, 18px for the player and panels, 10px for thumbnails.

## Components

Nav + scrubber and footer are injected by `js/main.js` so every page shares them verbatim.

## Do's and Don'ts

- Do reuse these tokens from `css/style.css` `:root`; add a token here before using a new one.
- Do keep motion to: one staggered hero entrance, the scrubber, row hover fills, smooth scroll.
- Don't use: purple/indigo (C1/C2), near-black + one neon (SD2), cream + terracotta (SD1),
  all-caps eyebrows (SD4/T5), one accented headline word (SD5), decorative 01/02/03 (SD6),
  fake window chrome (SD7), emoji icons (I2), count-up stats (M5), fade-up on every section (M1),
  glass on everything (K3).
