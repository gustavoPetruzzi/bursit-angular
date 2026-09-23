/**
 * Generates `public/favicon.svg` and `public/favicon.ico` — the Bursit burst mark.
 *
 * Run with `node landing/scripts/generate-favicon.mjs` from the repo root. Idempotent:
 * both outputs are derived deterministically from the parametric master below, so
 * re-running on an unchanged tree rewrites identical bytes.
 *
 * The vector master is the single source of truth: seven thick shards radiating from a
 * point left of center, emitted as polygons with literal brand fills (the spec's
 * allowlist scan reads the emitted file, not this script). The ICO is hand-packed:
 * ICONDIR header, three directory entries, PNG-compressed payloads rendered through
 * `sharp` (which ships librsvg).
 *
 * `sharp` is resolved through an explicit relative URL because this workspace keeps it
 * only under `landing/node_modules`; a bare specifier is not portable here.
 */
import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sharp = (await import(new URL('../node_modules/sharp/dist/index.mjs', import.meta.url)))
  .default;

// -----------------------------------------------------------------------------
// Master geometry.
// -----------------------------------------------------------------------------
const VIEWBOX = 64;
const ORIGIN = { x: 26, y: 35 };

/** [angle degrees, length, halfWidth] per shard. */
const SHARDS = [
  [-65, 31, 4.4],
  [-22, 30, 4.0],
  [6, 33, 4.6],
  [40, 23, 4.0],
  [92, 27, 4.4],
  [176, 22, 4.2],
  [218, 21, 3.6],
];

/** Apex pull-back factor along the shard direction; keeps the convergence solid. */
const PULL = 0.9;

// -----------------------------------------------------------------------------
// Brand fills — literals only, matching the spec allowlist.
// -----------------------------------------------------------------------------
const LIGHT_MARK = '#835a60';
const DARK_MARK = '#e8a1af';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(SCRIPT_DIR, '..', 'public');
const SVG_PATH = resolve(PUBLIC_DIR, 'favicon.svg');
const ICO_PATH = resolve(PUBLIC_DIR, 'favicon.ico');

const ICO_SIZES = [16, 32, 48];
const MASTER_SIZE = 512;

function shardPolygon([angleDeg, length, halfWidth]) {
  const radians = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const px = -dy; // perpendicular to the shard direction
  const py = dx;

  // Apex sits behind the origin so overlapping shards form one solid core.
  const pull = PULL * halfWidth;
  const apexX = ORIGIN.x - dx * pull;
  const apexY = ORIGIN.y - dy * pull;

  // Base is perpendicular at the tip, halfWidth on each side.
  const tipX = ORIGIN.x + dx * length;
  const tipY = ORIGIN.y + dy * length;
  const leftX = tipX + px * halfWidth;
  const leftY = tipY + py * halfWidth;
  const rightX = tipX - px * halfWidth;
  const rightY = tipY - py * halfWidth;

  const fmt = (value) => Number(value.toFixed(3));
  return `${fmt(apexX)},${fmt(apexY)} ${fmt(leftX)},${fmt(leftY)} ${fmt(rightX)},${fmt(rightY)}`;
}

function buildSvg({ withDarkVariant }) {
  const polygons = SHARDS.map(
    (shard) => `    <polygon class="shard" points="${shardPolygon(shard)}" fill="${LIGHT_MARK}"/>`,
  ).join('\n');

  const darkStyle = withDarkVariant
    ? `
  <style>
    @media (prefers-color-scheme: dark) {
      .shard {
        fill: ${DARK_MARK};
      }
    }
  </style>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}">${darkStyle}
  <g>
${polygons}
  </g>
</svg>
`;
}

// -----------------------------------------------------------------------------
// ICO container: 6-byte ICONDIR + 3 x 16-byte entries + concatenated PNG payloads.
// -----------------------------------------------------------------------------
function packIco(pngPayloads) {
  const headerSize = 6;
  const entrySize = 16;
  const offsetToData = headerSize + entrySize * pngPayloads.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngPayloads.length, 4);

  let payloadOffset = offsetToData;
  const entries = pngPayloads.map(({ size, payload }, index) => {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(size, 0); // width, sizes here are all under 256
    entry.writeUInt8(size, 1); // height
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bitCount
    entry.writeUInt32LE(payload.length, 8);
    entry.writeUInt32LE(payloadOffset, 12);
    payloadOffset += payload.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngPayloads.map((entry) => entry.payload)]);
}

async function buildIco() {
  // The ICO always ships the light variant: browser chrome around it does not follow
  // the page's dark-mode story, the mark's own tone does.
  const masterSvg = Buffer.from(buildSvg({ withDarkVariant: false }));

  const pngPayloads = [];
  for (const size of ICO_SIZES) {
    const payload = await sharp(masterSvg)
      .resize(size, size, { kernel: 'lanczos3' })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngPayloads.push({ size, payload });
  }
  return packIco(pngPayloads);
}

async function main() {
  const svg = buildSvg({ withDarkVariant: true });
  const ico = await buildIco();

  await writeFile(SVG_PATH, svg, 'utf8');
  await writeFile(ICO_PATH, ico);

  console.log(`favicon.svg written — ${Buffer.byteLength(svg)} bytes — ${SVG_PATH}`);
  console.log(`favicon.ico written — ${ico.length} bytes — ${ICO_PATH}`);
}

await main();
