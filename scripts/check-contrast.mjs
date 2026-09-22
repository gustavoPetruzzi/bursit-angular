#!/usr/bin/env node
/**
 * Contrast harness — rebrand-palette Phase 1.
 *
 * Reads `node_modules/bursit-ui-tokens/index.css` and nothing else. CC-01 requires every
 * measurement to be taken from the installed artifact, so this script never imports the
 * SCSS source and never re-declares a token value. The only literals in the file are the
 * pair table below: thresholds and declared surfaces.
 *
 * Usage:
 *   node scripts/check-contrast.mjs              measure the installed package (npm run check:contrast)
 *   node scripts/check-contrast.mjs --self-test  calibrate the pure maths and exit
 *
 * Reading the output:
 *   Group A is the normative pair set — the 18 CC-03 IDs (CP-01 … CP-18) plus the 4 CC-04
 *   badge pairs — reported one line per ID per mode: 22 pairs x 2 modes = 44 lines.
 *   The four CC-04 pairs carry their own `CC04-nn` identifiers rather than invented CP
 *   numbers, because the specs declare exactly 18 CP IDs; each one names the requirement
 *   and the tokens it measures in its own line.
 *   Group B carries the obligations that must not inflate that 22-pair count — BP-06,
 *   BP-07, BP-09, CC-05 and CC-06 — under their own labels.
 *
 * Every line prints before the process exits. The exit code is non-zero when any line
 * fails, but a failure never short-circuits the run: CC-03 requires one result per ID,
 * and a harness that stops on the first failure can never report 22 of them.
 *
 * A pair's `surface` is declared data, never inferred. It is the opaque colour a
 * translucent background is composited over, and it moves the result: dark
 * --color-error-text measures 4.51:1 over --color-bg (#22282E) and 4.19:1 over
 * --color-bg-elevated (#272E35). Editing one surface moves exactly one measurement.
 *
 * The two modes are modelled the way the cascade actually resolves them: the light layer
 * is every `:root` block in source order, and the dark layer overlays the
 * `[bursit-theme=dark], .dark` block. That overlay is only faithful while no *later*
 * `:root` block redeclares a token the dark block sets, so the harness verifies that
 * invariant on every run and fails the run if it ever stops holding.
 *
 * A token that the installed package does not declare is reported as MISSING, never as a
 * silent pass. That is what the two 2.0.0-only tokens (--color-border-control,
 * --color-secondary-strong) would look like if a pair ever measured them directly.
 *
 * The report is deliberately ASCII-only. A Windows console decodes a child process's
 * stdout with its OEM code page, so a non-ASCII character in the output is mangled in
 * any redirected or piped baseline file — which is exactly how this baseline is retained.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Forward slashes so the retained baseline is byte-stable across platforms. */
const TOKENS_CSS = 'node_modules/bursit-ui-tokens/index.css';
const FORMULA = '(L1 + 0.05) / (L2 + 0.05)';

/**
 * Tint pairs composite over the page canvas. The light defect figures for this change
 * reproduce there and not on --color-bg-elevated: against the installed 1.2.0, CP-05
 * measures 3.87:1 and CP-07 2.01:1 on --color-bg, matching the spec's "Today" column.
 * Rows whose spec background is not the canvas override this — CP-02 names
 * --color-bg-elevated and CP-03 names --input-bg.
 */
const DEFAULT_SURFACE = '--color-bg';

/**
 * Group A rows: [id, foreground, background, threshold, description, options?].
 *
 * `options.surface` is the opaque backdrop, stated only when it differs from
 * DEFAULT_SURFACE. `options.modes` narrows a row to one mode; both are the default.
 *
 * Group A is exactly 44 result lines. CP-16 and CP-17 are the same pair measured in
 * different modes under different IDs, so their four lines repeat information by
 * design — the spec scopes each ID to one mode, and this harness reports every ID in
 * both modes so the count stays 22 x 2.
 */
const GROUP_A = [
  // CC-03 — the 18 corrected pairs.
  ['CP-01', '--color-primary', '--color-bg', 4.5, '--color-primary on --color-bg (landing link)'],
  ['CP-02', '--color-text-subtle', '--color-bg-elevated', 4.5, '--color-text-subtle on --color-bg-elevated', { surface: '--color-bg-elevated' }],
  ['CP-03', '--input-border-color', '--input-bg', 3, '--input-border-color on --input-bg', { surface: '--input-bg' }],
  ['CP-04', '--badge-primary-color', '--badge-primary-bg', 4.5, '--badge-primary-color on --badge-primary-bg (filled badge)'],
  ['CP-05', '--color-primary', '--color-primary-alpha-8', 4.5, '--color-primary on --color-primary-alpha-8'],
  ['CP-06', '--color-secondary', '--color-secondary-alpha-8', 4.5, '--color-secondary on --color-secondary-alpha-8'],
  ['CP-07', '--alert-success-color', '--alert-success-bg', 4.5, '--alert-success-color on --alert-success-bg'],
  ['CP-08', '--alert-warning-color', '--alert-warning-bg', 4.5, '--alert-warning-color on --alert-warning-bg'],
  ['CP-09', '--alert-error-color', '--alert-error-bg', 4.5, '--alert-error-color on --alert-error-bg'],
  ['CP-10', '--alert-info-color', '--alert-info-bg', 4.5, '--alert-info-color on --alert-info-bg'],
  ['CP-11', '--color-success-contrast', '--color-success', 4.5, '--color-success-contrast on --color-success (filled badge)'],
  ['CP-12', '--color-error-contrast', '--color-error', 4.5, '--color-error-contrast on --color-error'],
  ['CP-13', '--color-warning-contrast', '--color-warning', 4.5, '--color-warning-contrast on --color-warning'],
  ['CP-14', '--color-info-contrast', '--color-info', 4.5, '--color-info-contrast on --color-info'],
  ['CP-15', '--shadow-glow-primary', '--color-bg', 3, '--shadow-glow-primary on --color-bg (focus glow)'],
  ['CP-16', '--color-focus-ring', '--color-bg', 3, '--color-focus-ring on --color-bg (spec ID is light-scoped)'],
  ['CP-17', '--color-focus-ring', '--color-bg', 3, '--color-focus-ring on --color-bg (spec ID is dark-scoped)'],
  ['CP-18', '--color-text-subtle', '--color-bg', 4.5, '--color-text-subtle on --color-bg (spec ID is dark-scoped)'],

  // CC-04 — the four badge pairs that close the tint-as-text defect class. The specs
  // declare CP-01 … CP-18 only, so these rows use their own identifiers instead of
  // inventing CP-19 … CP-22.
  ['CC04-01', '--badge-subtle-success-color', '--badge-subtle-success-bg', 4.5, 'badge-subtle success on its own tint (CC-04)'],
  ['CC04-02', '--badge-subtle-warning-color', '--badge-subtle-warning-bg', 4.5, 'badge-subtle warning on its own tint (CC-04)'],
  ['CC04-03', '--badge-subtle-error-color', '--badge-subtle-error-bg', 4.5, 'badge-subtle error on its own tint (CC-04)'],
  ['CC04-04', '--badge-subtle-info-color', '--badge-subtle-info-bg', 4.5, 'badge-subtle info on its own tint (CC-04)'],
];

/**
 * Group B rows: same shape as Group A. These carry the obligations that are not part of
 * the 22-pair count.
 *
 * BP-06 is measured through the six control tokens the package declares today, so the
 * 3:1 obligation produces a real reading rather than a MISSING placeholder; the
 * `--color-border-control` indirection they must adopt in 2.0.0 is a structural
 * assertion, not a contrast one. `--input-border-color` appears here and as CP-03 —
 * two requirements, one pairing, both readings reported.
 *
 * BP-09 is light-only by its own scenarios; dark --color-text-subtle is covered by CP-18
 * (on --color-bg) and CP-02 (on --color-bg-elevated).
 */
const GROUP_B = [
  ['BP-06', '--input-border-color', '--input-bg', 3, '--input-border-color on --input-bg', { surface: '--input-bg' }],
  ['BP-06', '--checkbox-border-color', '--checkbox-bg', 3, '--checkbox-border-color on --checkbox-bg', { surface: '--checkbox-bg' }],
  ['BP-06', '--radio-border-color', '--radio-bg', 3, '--radio-border-color on --radio-bg', { surface: '--radio-bg' }],
  ['BP-06', '--switch-bg', '--color-bg-elevated', 3, '--switch-bg on --color-bg-elevated', { surface: '--color-bg-elevated' }],
  ['BP-06', '--select-hover-border-color', '--select-bg', 3, '--select-hover-border-color on --select-bg', { surface: '--select-bg' }],
  ['BP-06', '--badge-outline-border-color', '--color-bg-elevated', 3, '--badge-outline-border-color on --color-bg-elevated', { surface: '--color-bg-elevated' }],
  ['BP-07', '--btn-secondary-hover-color', '--btn-secondary-hover-bg', 4.5, 'secondary hover ink (--color-secondary-strong fills this bg in 2.0.0)'],
  ['BP-09', '--color-text-subtle', '--color-bg', 4.5, 'light --color-text-subtle on --color-bg', { modes: ['light'] }],
  ['BP-09', '--color-text-subtle', '--color-bg-elevated', 4.5, 'light --color-text-subtle on --color-bg-elevated', { modes: ['light'] }],
  ['BP-09', '--color-text-subtle', '--color-bg-sunken', 4.5, 'light --color-text-subtle on --color-bg-sunken', { modes: ['light'] }],
  ['CC-05', '--color-success-contrast', '--color-success', 4.5, '--color-success-contrast on --color-success'],
  ['CC-05', '--color-warning-contrast', '--color-warning', 4.5, '--color-warning-contrast on --color-warning'],
  ['CC-06', '--color-focus-ring', '--color-bg', 3, '--color-focus-ring on --color-bg'],
  ['CC-06', '--shadow-glow-primary', '--color-bg', 3, '--shadow-glow-primary on --color-bg (outline: none checkbox)'],
];

const MODES = ['light', 'dark'];

// ---------------------------------------------------------------------------
// Stylesheet reading
// ---------------------------------------------------------------------------

/** Walk the stylesheet and return every declaration block plus its opening order. */
function scanBlocks(css) {
  const blocks = [];
  const open = [];
  let sequence = 0;
  let prelude = '';
  let index = 0;

  while (index < css.length) {
    const char = css[index];

    if (char === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2);
      index = end === -1 ? css.length : end + 2;
      continue;
    }
    if (char === '{') {
      sequence += 1;
      open.push({ selector: prelude.trim(), start: index + 1, order: sequence });
      prelude = '';
      index += 1;
      continue;
    }
    if (char === '}') {
      const frame = open.pop();
      if (frame) {
        blocks.push({
          order: frame.order,
          selector: frame.selector,
          body: css.slice(frame.start, index),
        });
      }
      prelude = '';
      index += 1;
      continue;
    }
    prelude += char;
    index += 1;
  }

  return blocks;
}

function splitSelectors(selector) {
  return selector
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseDeclarations(body) {
  const declarations = new Map();
  for (const statement of body.split(';')) {
    const colon = statement.indexOf(':');
    if (colon === -1) continue;
    const name = statement.slice(0, colon).trim();
    if (!name.startsWith('--')) continue;
    declarations.set(name, statement.slice(colon + 1).trim());
  }
  return declarations;
}

/**
 * Build the light and dark token layers.
 *
 * The light layer is every `:root` block, in source order, including the one nested in
 * the reduced-motion media query. The dark layer overlays the dark block's own
 * declarations on top of it.
 */
function buildLayers(css) {
  const rootBlocks = [];
  const darkBlocks = [];

  for (const block of scanBlocks(css)) {
    const selectors = splitSelectors(block.selector);
    if (selectors.includes(':root')) rootBlocks.push(block);
    else if (selectors.includes('[bursit-theme=dark]') || selectors.includes('.dark')) darkBlocks.push(block);
  }

  const light = new Map();
  for (const block of rootBlocks) {
    for (const [name, value] of parseDeclarations(block.body)) light.set(name, value);
  }

  const dark = new Map(light);
  const darkOwn = new Map();
  for (const block of darkBlocks) {
    for (const [name, value] of parseDeclarations(block.body)) {
      dark.set(name, value);
      darkOwn.set(name, value);
    }
  }

  return { rootBlocks, darkBlocks, light, dark, darkOwn };
}

/**
 * Report tokens the dark block sets but a later `:root` block redeclares. Same
 * specificity means source order wins, so any such token would break the dark layer and
 * the harness must not report numbers built on a broken model.
 */
function findShadowedDarkTokens({ rootBlocks, darkBlocks, darkOwn }) {
  if (darkBlocks.length === 0) return [];
  const firstDarkOrder = Math.min(...darkBlocks.map((block) => block.order));
  const shadowed = new Set();

  for (const block of rootBlocks) {
    if (block.order < firstDarkOrder) continue;
    for (const name of parseDeclarations(block.body).keys()) {
      if (darkOwn.has(name)) shadowed.add(name);
    }
  }

  return [...shadowed];
}

const VAR_REFERENCE = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/;

/** Resolve a custom property through its `var()` chain, transitively. */
function resolveToken(name, layer, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular var() chain while resolving ${name}`);
  seen.add(name);

  const value = layer.get(name);
  if (value === undefined) return undefined;

  const reference = VAR_REFERENCE.exec(value);
  if (!reference) return value;

  const resolved = resolveToken(reference[1], layer, seen);
  if (resolved !== undefined) return resolved;
  return reference[2] === undefined ? undefined : reference[2].trim();
}

// ---------------------------------------------------------------------------
// Colour maths
// ---------------------------------------------------------------------------

function parseColor(text) {
  const hex = /^#([0-9a-f]+)$/i.exec(text);
  if (hex) {
    const digits = hex[1];
    if (![3, 4, 6, 8].includes(digits.length)) return undefined;
    const pairs = digits.length <= 4 ? [...digits].map((digit) => digit + digit) : digits.match(/../g);
    return {
      r: parseInt(pairs[0], 16),
      g: parseInt(pairs[1], 16),
      b: parseInt(pairs[2], 16),
      a: pairs.length === 4 ? parseInt(pairs[3], 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(text);
  if (!rgb) return undefined;
  return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: rgb[4] === undefined ? 1 : +rgb[4] };
}

const COLOR_TOKEN = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;

/**
 * Read the colour out of a token value. A shadow or gradient carries its colour inside a
 * longer value, and it is the last colour in the value that is painted nearest the eye.
 */
function extractColor(value) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (trimmed === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const direct = parseColor(trimmed);
  if (direct) return direct;

  const matches = [...trimmed.matchAll(COLOR_TOKEN)];
  if (matches.length === 0) return undefined;
  return parseColor(matches[matches.length - 1][0]);
}

/** Paint a possibly translucent foreground over an opaque backdrop. */
function composite(foreground, backdrop) {
  if (foreground.a >= 1) return foreground;
  const mix = (over, under) => over * foreground.a + under * (1 - foreground.a);
  return { r: mix(foreground.r, backdrop.r), g: mix(foreground.g, backdrop.g), b: mix(foreground.b, backdrop.b), a: 1 };
}

function toLinear(channel) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(one, other) {
  const first = relativeLuminance(one);
  const second = relativeLuminance(other);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

function toRow([id, foreground, background, threshold, description, options = {}]) {
  return {
    id,
    foreground,
    background,
    threshold,
    description,
    surface: options.surface ?? DEFAULT_SURFACE,
    modes: options.modes ?? MODES,
  };
}

/** `layer` is the pair of resolved token maps, one per mode. */
function measure(row, mode, layer) {
  const tokens = layer[mode];
  const missing = [row.foreground, row.background, row.surface].filter(
    (name) => extractColor(resolveToken(name, tokens)) === undefined
  );
  if (missing.length > 0) return { status: 'MISSING', detail: missing.join(', ') };

  const backdrop = composite(extractColor(resolveToken(row.background, tokens)), extractColor(resolveToken(row.surface, tokens)));
  const ink = composite(extractColor(resolveToken(row.foreground, tokens)), backdrop);
  const ratio = contrastRatio(ink, backdrop);

  return { status: ratio >= row.threshold ? 'PASS' : 'FAIL', ratio };
}

function formatLine(id, mode, result, threshold, description) {
  const value = result.status === 'MISSING' ? 'n/a' : result.ratio.toFixed(2);
  const note = result.status === 'MISSING' ? ` (missing ${result.detail})` : '';
  return `${id} ${mode} ${value} need ${threshold} ${result.status} | ${description}${note}`;
}

function measureGroup(rows, layer) {
  const lines = [];
  const tally = { PASS: 0, FAIL: 0, MISSING: 0 };

  for (const row of rows) {
    const parsed = toRow(row);
    for (const mode of parsed.modes) {
      const result = measure(parsed, mode, layer);
      tally[result.status] += 1;
      lines.push(formatLine(parsed.id, mode, result, parsed.threshold, parsed.description));
    }
  }

  return { lines, tally };
}

/** Count how many distinct Group A identifiers fail in every mode they are reported in. */
function countFailingPairs(rows, layer) {
  let failing = 0;
  for (const row of rows) {
    const parsed = toRow(row);
    const results = parsed.modes.map((mode) => measure(parsed, mode, layer).status);
    if (results.every((status) => status !== 'PASS')) failing += 1;
  }
  return failing;
}

// ---------------------------------------------------------------------------
// Self-test — calibrates the pure maths against the WCAG reference values
// ---------------------------------------------------------------------------

function selfTest() {
  const cases = [];
  const check = (description, actual, expected) => cases.push({ description, actual, expected, ok: actual === expected });

  check('black on white is the 21:1 maximum', contrastRatio({ r: 0, g: 0, b: 0, a: 1 }, { r: 255, g: 255, b: 255, a: 1 }).toFixed(2), '21.00');
  check('white on white is the 1:1 minimum', contrastRatio({ r: 255, g: 255, b: 255, a: 1 }, { r: 255, g: 255, b: 255, a: 1 }).toFixed(2), '1.00');
  check('#767676 on white is the documented 4.54:1', contrastRatio({ r: 118, g: 118, b: 118, a: 1 }, { r: 255, g: 255, b: 255, a: 1 }).toFixed(2), '4.54');
  check('50% black over white reads 3.98:1 against white', contrastRatio(composite({ r: 0, g: 0, b: 0, a: 0.5 }, { r: 255, g: 255, b: 255, a: 1 }), { r: 255, g: 255, b: 255, a: 1 }).toFixed(2), '3.98');
  check('three-digit hex expands to six', JSON.stringify(parseColor('#abc')), JSON.stringify({ r: 170, g: 187, b: 204, a: 1 }));
  check('eight-digit hex carries its alpha', parseColor('#0f172a80').a.toFixed(3), '0.502');
  check('a var() chain resolves to its terminal value', resolveToken('--alias', new Map([['--alias', 'var(--base)'], ['--base', '#123456']])), '#123456');
  check('an unknown token resolves to undefined', resolveToken('--absent', new Map()), undefined);
  check('a shadow value yields its colour', JSON.stringify(extractColor('0 0 0 3px rgba(1, 2, 3, 0.4)')), JSON.stringify({ r: 1, g: 2, b: 3, a: 0.4 }));

  for (const testCase of cases) {
    console.log(`${testCase.ok ? 'PASS' : 'FAIL'} self-test: ${testCase.description} (got ${testCase.actual}, expected ${testCase.expected})`);
  }

  const failed = cases.filter((testCase) => !testCase.ok).length;
  console.log(`self-test: ${cases.length - failed}/${cases.length} passed`);
  return failed === 0;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

function run() {
  const structure = buildLayers(readFileSync(TOKENS_CSS, 'utf8'));
  const shadowed = findShadowedDarkTokens(structure);
  const layer = { light: structure.light, dark: structure.dark };

  const groupA = measureGroup(GROUP_A, layer);
  const groupB = measureGroup(GROUP_B, layer);
  const failingPairs = countFailingPairs(GROUP_A, layer);
  const failingLines = groupA.tally.FAIL + groupA.tally.MISSING + groupB.tally.FAIL + groupB.tally.MISSING + shadowed.length;

  const lines = [
    'bursit-angular - contrast harness (rebrand-palette Phase 1)',
    `source: ${TOKENS_CSS} (read-only)`,
    `formula: WCAG 2.x relative luminance ${FORMULA}, two decimals`,
    `light layer: ${structure.rootBlocks.length} :root blocks`,
    `dark layer: [bursit-theme=dark], .dark - ${structure.darkBlocks.length === 1 ? 'found' : `${structure.darkBlocks.length} blocks found`}`,
    shadowed.length === 0
      ? 'structure: no later :root block shadows the dark layer - OK'
      : `structure: the dark layer is shadowed by a later :root block - ${shadowed.join(', ')}`,
    '',
    'Group A - CC-03 (18 IDs) + CC-04 (4 badge pairs), one line per ID per mode',
    ...groupA.lines,
    `Group A: ${GROUP_A.length} pairs x ${MODES.length} modes = ${groupA.lines.length} lines | PASS ${groupA.tally.PASS} | FAIL ${groupA.tally.FAIL} | MISSING ${groupA.tally.MISSING} | pairs failing in every mode ${failingPairs}`,
    '',
    'Group B - supplementary obligations: BP-06, BP-07, BP-09, CC-05, CC-06',
    ...groupB.lines,
    `Group B: ${groupB.lines.length} lines | PASS ${groupB.tally.PASS} | FAIL ${groupB.tally.FAIL} | MISSING ${groupB.tally.MISSING}`,
    '',
    failingLines === 0
      ? 'Result: PASS - every measured pair clears its threshold'
      : `Result: FAIL - ${failingLines} result lines are below threshold`,
  ];

  process.stdout.write(`${lines.join('\n')}\n`);
  process.exitCode = failingLines === 0 ? 0 : 1;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;

if (isMain) {
  if (process.argv.includes('--self-test')) {
    process.exitCode = selfTest() ? 0 : 1;
  } else {
    run();
  }
}

export { buildLayers, composite, contrastRatio, extractColor, measure, parseColor, resolveToken, scanBlocks, selfTest };
