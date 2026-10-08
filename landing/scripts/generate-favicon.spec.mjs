/**
 * Favicon deliverable contract (logo-fidelity task 1; discharges the BA-02 deferral).
 *
 * rebrand-palette's verify amended BA-02 to SPLIT the favicon swap out of that change: there
 * was no vector master, so `favicon.svg` stayed the Astro placeholder and `favicon.ico` stayed
 * a 655-byte PNG file wearing an `.ico` name. This spec is the regression guard for the
 * artwork change that finally does the swap, and it asserts the two failure modes BA-02 named:
 *
 *   1. The framework mark must be gone from the SVG (its path signature is the discriminator),
 *      and every fill the SVG emits must be a brand literal - a stray `#000`/`#FFF` is the
 *      exact defect the placeholder ships.
 *   2. The ICO must be a real ICO container, not a PNG. The shipped file begins with the PNG
 *      magic (`89 50 4E 47`); a real ICO begins with ICONDIR (`00 00 01 00`) and carries at
 *      least the 16px and 32px entries browsers pick between. Every entry payload must itself
 *      be a PNG (Vista+ allows PNG-compressed entries, which is what the generator emits).
 *
 * The brand-fill allowlist is intentionally closed: the favicon must not inherit the page's
 * theme story, it must carry the mark's own tone. `#835a60` is the light mark ($brand-bright,
 * 5.59:1 on white chrome); the wine-300/400 pair is the dark-chrome variant.
 *
 * Collected by root Jest via the testMatch entry that globs spec files under any `scripts/`
 * directory, so this adds one suite to the 27-suite baseline (landing has no runner of its
 * own). Caution: never embed a glob whose slash-star terminator appears here — the transform
 * fails with a parse error (from inside the comment), not a test failure, which reads like a
 * broken test instead of a broken comment.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'landing', 'public');
const SVG_PATH = join(PUBLIC_DIR, 'favicon.svg');
const ICO_PATH = join(PUBLIC_DIR, 'favicon.ico');

/** Astro's placeholder path opens with this signature; its fills are black and white literals. */
const ASTRO_PATH_SIGNATURE = 'M50.4 78.5';

/** The mark's own tones: light chrome mark, dark chrome mark, and its two darker steps. */
const BRAND_FILLS = new Set(['#835a60', '#4e383e', '#d77588', '#e8a1af']);

/** 16 and 32 are the two entries a browser must be able to choose between. */
const REQUIRED_ICO_SIZES = [16, 32];

function readIcoEntries(buffer) {
  const reserved = buffer.readUInt16LE(0);
  const type = buffer.readUInt16LE(2);
  const count = buffer.readUInt16LE(4);
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    const base = 6 + i * 16;
    entries.push({
      width: buffer.readUInt8(base) || 256,
      height: buffer.readUInt8(base + 1) || 256,
      planes: buffer.readUInt16LE(base + 4),
      bitCount: buffer.readUInt16LE(base + 6),
      size: buffer.readUInt32LE(base + 8),
      offset: buffer.readUInt32LE(base + 12),
    });
  }
  return { reserved, type, count, entries };
}

describe('favicon deliverable', () => {
  let svg;
  let ico;

  beforeAll(() => {
    svg = readFileSync(SVG_PATH, 'utf8');
    ico = readFileSync(ICO_PATH);
  });

  describe('favicon.svg stops shipping the framework mark', () => {
    it('does not contain the Astro placeholder path', () => {
      expect(svg).not.toContain(ASTRO_PATH_SIGNATURE);
    });

    it('declares a viewBox so it scales into the browser chrome', () => {
      expect(svg).toMatch(/viewBox="0 0 \d+ \d+"/);
    });

    it('emits only brand literals as fills', () => {
      const literals = [...svg.matchAll(/fill="([^"]+)"/g), ...svg.matchAll(/fill:\s*(#[0-9a-fA-F]{3,8})/g)]
        .map((match) => match[1].toLowerCase())
        .filter((value) => value !== 'none');
      expect(literals.length).toBeGreaterThan(0);
      for (const literal of literals) {
        expect(BRAND_FILLS.has(literal)).toBe(true);
      }
    });
  });

  describe('favicon.ico is a real ICO container', () => {
    it('begins with ICONDIR, not the PNG magic the placeholder ships', () => {
      // PNG files named .ico start 89 50 4E 47; ICONDIR starts 00 00 01 00.
      expect(ico.readUInt16LE(0)).toBe(0);
      expect(ico.readUInt16LE(2)).toBe(1);
    });

    it('carries at least the 16px and 32px entries', () => {
      const { count, entries } = readIcoEntries(ico);
      expect(count).toBeGreaterThanOrEqual(2);
      const widths = entries.map((entry) => entry.width);
      for (const size of REQUIRED_ICO_SIZES) {
        expect(widths).toContain(size);
      }
    });

    it('stores a PNG payload inside every entry, fully inside the file', () => {
      const { entries } = readIcoEntries(ico);
      for (const entry of entries) {
        expect(entry.size).toBeGreaterThan(8);
        expect(entry.offset + entry.size).toBeLessThanOrEqual(ico.length);
        const magic = ico.subarray(entry.offset, entry.offset + 4);
        expect([...magic]).toEqual([0x89, 0x50, 0x4e, 0x47]);
      }
    });
  });

  describe('generator is reproducible', () => {
    it('ships the script that owns the vector master', () => {
      expect(existsSync(join(process.cwd(), 'landing', 'scripts', 'generate-favicon.mjs'))).toBe(
        true
      );
    });
  });
});
