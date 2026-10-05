/**
 * Renders `public/og-image.png` — the 1200x630 Open Graph card.
 *
 * Run with `npm run og-image`. The output is committed, so this only needs to
 * run when the card's copy or artwork changes.
 *
 * Why an SVG template instead of drawing with a canvas library: the card is
 * pure typography and geometry, and `sharp` already ships librsvg. One
 * re-runnable script, no extra runtime.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

// -----------------------------------------------------------------------------
// Palette — the one place literal values are allowed.
// -----------------------------------------------------------------------------
// This script draws raster art outside the CSS token runtime, so it cannot read
// `var(--token)`. Every value below is copied from `bursit-ui-tokens` — the
// `[bursit-theme=dark]` layer, which is what a dark card on a design-system
// page should speak in. Nothing here is invented.
// -----------------------------------------------------------------------------
const PALETTE = {
  surface: '#272e35', // --color-bg-elevated (dark)
  text: '#f9fafb', // --color-text (dark)
  textMuted: '#9aa8b6', // --color-text-muted (dark)
  textSubtle: '#9aa8b6', // --color-text-subtle (dark)
  border: '#313b44', // --color-border (dark)
  primary: '#e8a1af', // --color-primary (dark)
  secondary: '#7ba3cc', // --color-secondary (dark)
};

// -----------------------------------------------------------------------------
// Geometry and type
// -----------------------------------------------------------------------------
// librsvg resolves fonts through the host's font backend. On this machine the
// available families are Arial, Verdana, Tahoma and Calibri — Inter is NOT
// resolvable, and an unresolved family silently falls through to a generic
// sans. Calibri is the closest humanist sans available, so it leads the stack.
// -----------------------------------------------------------------------------
const CANVAS = { width: 1200, height: 630 };
const FONT_FAMILY = "'Calibri', 'Segoe UI', Verdana, Tahoma, Arial, sans-serif";
const PADDING_X = 96;
const CONTENT_RIGHT = CANVAS.width - PADDING_X;

const COPY = {
  wordmark: 'Bursit Angular',
  headline: 'Directive-first UI components',
  headlineMuted: 'for Angular 21.',
  supporting: 'Every visual value is a token.',
  url: 'bursit-landing.pages.dev',
  meta: 'Standalone  ·  MIT',
};

const OUTPUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og-image.png');

function buildSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}" viewBox="0 0 ${CANVAS.width} ${CANVAS.height}">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${PALETTE.primary}"/>
      <stop offset="1" stop-color="${PALETTE.secondary}"/>
    </linearGradient>

    <linearGradient id="rail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${PALETTE.primary}"/>
      <stop offset="1" stop-color="${PALETTE.secondary}"/>
    </linearGradient>

    <radialGradient id="glow-primary" cx="0.1" cy="0" r="0.85">
      <stop offset="0" stop-color="${PALETTE.primary}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${PALETTE.primary}" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow-secondary" cx="1" cy="0" r="0.7">
      <stop offset="0" stop-color="${PALETTE.secondary}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${PALETTE.secondary}" stop-opacity="0"/>
    </radialGradient>

    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="${PALETTE.border}" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Surface, hairline grid and the two atmospheric glows. -->
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="${PALETTE.surface}"/>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="url(#grid)" opacity="0.55"/>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="url(#glow-primary)"/>
  <rect width="${CANVAS.width}" height="${CANVAS.height}" fill="url(#glow-secondary)"/>

  <!-- Oversized echo of the wordmark mark, bleeding off the top-right corner. -->
  <rect x="930" y="-120" width="470" height="470" rx="106"
        fill="url(#brand)" opacity="0.13"
        transform="rotate(12 1165 115)"/>

  <!-- Brand rail: the same primary-to-secondary axis as the card's wordmark mark, vertical. -->
  <rect x="0" y="0" width="8" height="${CANVAS.height}" fill="url(#rail)"/>

  <!-- Wordmark: mark plus name, mirroring the site header. -->
  <rect x="${PADDING_X}" y="80" width="64" height="64" rx="16" fill="url(#brand)"/>
  <text x="184" y="124" font-family="${FONT_FAMILY}" font-size="34" font-weight="600"
        fill="${PALETTE.text}" letter-spacing="0.2">${COPY.wordmark}</text>

  <!-- Headline: the page's two-tone title treatment. -->
  <text x="${PADDING_X}" y="316" font-family="${FONT_FAMILY}" font-size="72" font-weight="700"
        fill="${PALETTE.text}" letter-spacing="-1">${COPY.headline}</text>
  <text x="${PADDING_X}" y="392" font-family="${FONT_FAMILY}" font-size="72" font-weight="700"
        fill="${PALETTE.textMuted}" letter-spacing="-1">${COPY.headlineMuted}</text>

  <!-- Supporting line. -->
  <text x="${PADDING_X}" y="454" font-family="${FONT_FAMILY}" font-size="30" font-weight="400"
        fill="${PALETTE.textMuted}">${COPY.supporting}</text>

  <!-- Footer rule and meta. -->
  <line x1="${PADDING_X}" y1="520" x2="${CONTENT_RIGHT}" y2="520"
        stroke="${PALETTE.border}" stroke-width="1"/>
  <text x="${PADDING_X}" y="566" font-family="${FONT_FAMILY}" font-size="24" font-weight="500"
        fill="${PALETTE.textSubtle}" letter-spacing="0.6">${COPY.url}</text>
  <text x="${CONTENT_RIGHT}" y="566" text-anchor="end" font-family="${FONT_FAMILY}" font-size="24"
        font-weight="500" fill="${PALETTE.textSubtle}" letter-spacing="0.6">${COPY.meta}</text>
</svg>`;
}

async function main() {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });

  await sharp(Buffer.from(buildSvg()))
    .resize(CANVAS.width, CANVAS.height, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT_PATH);

  const { width, height } = await sharp(OUTPUT_PATH).metadata();
  if (width !== CANVAS.width || height !== CANVAS.height) {
    throw new Error(
      `og-image.png rendered at ${width}x${height}, expected ${CANVAS.width}x${CANVAS.height}`,
    );
  }

  console.log(`og-image.png written — ${width}x${height}, ${OUTPUT_PATH}`);
}

await main();
