/**
 * Behavioural contract of the contrast harness (rebrand-palette task 1.7).
 *
 * Phase 1 shipped `scripts/check-contrast.mjs` with only a `--self-test` that asserts the
 * constants the harness itself chose. That is calibration, not a test of behaviour, and it
 * left the harness's user-facing contract unverified. This file is the spec-derived test:
 * the harness is run as a child process and judged on its stdout, its exit code and its
 * handling of a tokens package that does not declare the tokens it measures.
 *
 * Only behaviour that holds across the 1.2.0 -> 2.0.0 transition is asserted. Against the
 * installed 1.2.0 the harness is RED (27 of its 44 Group A lines are below threshold) and
 * Phase 2 is expected to make it GREEN, so no fixed exit code and no fixed PASS/FAIL count
 * appears here. What is asserted is invariant: exactly 44 Group A lines, the documented
 * line shape, the 22 declared IDs reported once per mode, the exit-code contract, and
 * MISSING isolation for a token the package does not declare.
 *
 * The harness is spawned rather than imported on purpose: it is an ES module that reads the
 * installed package through a cwd-relative path, and its CLI output is the contract tasks
 * 1.3-1.5 accept.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO_ROOT = process.cwd();
const HARNESS = join(REPO_ROOT, 'scripts', 'check-contrast.mjs');
const INSTALLED_TOKENS = join(REPO_ROOT, 'node_modules', 'bursit-ui-tokens', 'index.css');
const CI_WORKFLOW = join(REPO_ROOT, '.github', 'workflows', 'ci.yml');

if (!existsSync(HARNESS)) {
  throw new Error(`contrast harness not found at ${HARNESS} - run Jest from the repository root`);
}

/** The 18 CC-03 IDs (CP-01 … CP-18) plus the 4 CC-04 badge pairs: 22 IDs, 2 modes, 44 lines. */
const GROUP_A_IDS = [
  'CP-01',
  'CP-02',
  'CP-03',
  'CP-04',
  'CP-05',
  'CP-06',
  'CP-07',
  'CP-08',
  'CP-09',
  'CP-10',
  'CP-11',
  'CP-12',
  'CP-13',
  'CP-14',
  'CP-15',
  'CP-16',
  'CP-17',
  'CP-18',
  'CC04-01',
  'CC04-02',
  'CC04-03',
  'CC04-04',
];

const MODES = ['light', 'dark'];
const GROUP_A_ID = /^(?:CP-\d\d|CC04-\d\d) /;
const MEASURED_LINE = /^(?:CP-\d\d|CC04-\d\d) (?:light|dark) \d+\.\d\d need \d+(?:\.\d+)? (?:PASS|FAIL) \| \S/;
const MISSING_LINE = /^(?:CP-\d\d|CC04-\d\d) (?:light|dark) n\/a need \d+(?:\.\d+)? MISSING \| .+ \(missing .+\)$/;
const GROUP_A_TALLY = /^Group A: 22 pairs x 2 modes = 44 lines \| PASS (\d+) \| FAIL (\d+) \| MISSING (\d+) \| pairs failing in every mode (\d+)$/m;
const RESULT_LINE = /^Result: (PASS - every measured pair clears its threshold|FAIL - (\d+) result lines are below threshold)$/m;

function runHarness(cwd) {
  const result = spawnSync(process.execPath, [HARNESS], { cwd, encoding: 'utf8' });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

const groupALines = (stdout) => stdout.split(/\r?\n/).filter((line) => GROUP_A_ID.test(line));

/** Run the harness in a throwaway cwd whose tokens package holds exactly `css`. */
function runAgainstFixture(css) {
  const directory = mkdtempSync(join(tmpdir(), 'bursit-contrast-'));
  const packageDirectory = join(directory, 'node_modules', 'bursit-ui-tokens');
  mkdirSync(packageDirectory, { recursive: true });
  writeFileSync(join(packageDirectory, 'index.css'), css);
  try {
    return runHarness(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('contrast harness CLI contract', () => {
  let installed;

  beforeAll(() => {
    expect(existsSync(INSTALLED_TOKENS)).toBe(true);
    installed = runHarness(REPO_ROOT);
  });

  it('reports the 22 declared IDs once per mode, in the documented line shape', () => {
    const lines = groupALines(installed.stdout);

    expect(installed.stderr).toBe('');
    expect(lines).toHaveLength(44);
    for (const line of lines) {
      expect(MEASURED_LINE.test(line) || MISSING_LINE.test(line)).toBe(true);
    }
    for (const id of GROUP_A_IDS) {
      const modes = lines.filter((line) => line.startsWith(`${id} `)).map((line) => line.split(' ')[1]);
      expect(modes.slice().sort()).toEqual(MODES.slice().sort());
    }
  });

  it('emits every line before the verdict, even when lines fail', () => {
    const lines = groupALines(installed.stdout);
    const tally = GROUP_A_TALLY.exec(installed.stdout);
    const result = RESULT_LINE.exec(installed.stdout);

    expect(tally).not.toBeNull();
    expect(result).not.toBeNull();
    expect(Number(tally[1]) + Number(tally[2]) + Number(tally[3])).toBe(44);
    expect(Number(tally[1]) + Number(tally[2]) + Number(tally[3])).toBe(lines.length);
    expect(installed.stdout.indexOf(tally[0])).toBeLessThan(installed.stdout.indexOf(result[0]));
    expect(installed.stdout.trimEnd().endsWith(result[0])).toBe(true);
  });

  it('exits 0 only when no line is below threshold', () => {
    const tally = GROUP_A_TALLY.exec(installed.stdout);
    const result = RESULT_LINE.exec(installed.stdout);
    const groupAFailing = Number(tally[2]) + Number(tally[3]);
    const belowThreshold = result[2] === undefined ? 0 : Number(result[2]);

    expect([0, 1]).toContain(installed.status);
    expect(installed.status).toBe(belowThreshold > 0 ? 1 : 0);
    expect(groupAFailing).toBeLessThanOrEqual(belowThreshold);
  });

  it('reports MISSING instead of a silent pass when no pair token is declared', () => {
    const run = runAgainstFixture('/* the package declares no custom properties */\n');
    const lines = groupALines(run.stdout);

    expect(lines).toHaveLength(44);
    expect(lines.every((line) => MISSING_LINE.test(line))).toBe(true);
    expect(Number(GROUP_A_TALLY.exec(run.stdout)[3])).toBe(44);
    expect(run.status).toBe(1);
  });

  it('isolates MISSING to the IDs whose own token is absent', () => {
    // Only --color-bg and --color-text-subtle exist, so CP-18 (its only Group A consumer)
    // is measurable while the other 21 IDs have no readable colour.
    const run = runAgainstFixture(
      ':root {\n  --color-bg: #f8fafc;\n  --color-text-subtle: #475569;\n}\n'
    );
    const lines = groupALines(run.stdout);
    const measured = lines.filter((line) => MEASURED_LINE.test(line));
    const missing = lines.filter((line) => MISSING_LINE.test(line));

    expect(lines).toHaveLength(44);
    expect(measured.map((line) => line.split(' ')[0])).toEqual(['CP-18', 'CP-18']);
    expect(missing).toHaveLength(42);
    // The note names the tokens that could not be read; CP-03's are --input-* tokens, so it
    // is the naming, not a particular prefix, that the format guarantees.
    expect(missing.every((line) => /\(missing --[\w-]+(, --[\w-]+)*\)$/.test(line))).toBe(true);
    expect(run.status).toBe(1);
  });
});

/**
 * Task 5.6 wires the harness into CI as a real gate. That wiring is an artifact the suite can
 * assert: it is readable, it can be removed by accident, and this repository has already
 * shipped a workflow that failed in 0 seconds because an unquoted `name:` value contained
 * ": " and was re-parsed as a nested mapping. The assertions below are deliberately free of
 * a YAML dependency (the parser in node_modules is transitive, not declared).
 */
describe('contrast gate wiring', () => {
  const workflowText = () => readFileSync(CI_WORKFLOW, 'utf8');

  /** Unquoted mapping values containing ": " — the exact defect this repository shipped once. */
  const unquotedNameWithColon = (text) =>
    text
      .split(/\r?\n/)
      .filter((line) => /^\s*name:\s/.test(line))
      .map((line) => line.replace(/^\s*name:\s*/, ''))
      .filter((value) => !/^'.*'$/.test(value) && !/^".*"$/.test(value) && value.includes(': '));

  it('runs the harness as a gate', () => {
    const workflow = workflowText();

    expect(workflow).toMatch(/^\s{2}contrast:\s*$/m);
    expect(workflow).toMatch(/^\s*run:\s*npm run check:contrast\s*$/m);
  });

  it('leaves the existing jobs intact', () => {
    const workflow = workflowText();

    expect(workflow).toMatch(/^\s{2}library:\s*$/m);
    expect(workflow).toMatch(/^\s{2}landing:\s*$/m);
    expect(workflow).toMatch(/^\s*run:\s*npm run test\s*$/m);
    expect(workflow).toMatch(/^\s*name: 'Library: test and build'\s*$/m);
    expect(workflow).toMatch(/^\s*name: 'Landing: build'\s*$/m);
  });

  it('quotes every name value that contains a colon', () => {
    expect(unquotedNameWithColon(workflowText())).toEqual([]);
  });
});
