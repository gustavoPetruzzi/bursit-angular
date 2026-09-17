# Apply Progress: rebrand-palette — Phase 1 (contrast harness), task 1.7 (harness contract test), Phase 2 (adoption), Phase 3 (Storybook chrome + checkbox outline), Phase 4 (landing assets + docs) and Phase 5 (final verification)

**Change**: `rebrand-palette`
**Phase**: apply — **Phase 1** (`feat/rebrand-palette-harness`, chained PR #1), **task 1.7** (`fix/rebrand-palette-harness-spec`, chained PR #3), **Phase 2** (`feat/rebrand-palette-adopt-2`, chained PR #2), **Phase 3** (`feat/rebrand-palette-chrome`, chained PR #4), **Phase 4** (`feat/rebrand-palette-landing`, chained PR #5) **and Phase 5** (`chore/rebrand-palette-final`, final chained slice)
**Mode**: Strict TDD is active (`openspec/config.yaml` → `strict_tdd: true`). Phase 1 originally reported a declared deviation from it; that deviation is **CLOSED by task 1.7** (see the "Task 1.7" section at the end). Phase 2 follows it as far as a dependency bump permits — see "TDD Cycle Evidence (Phase 2)". Phase 5 carries one genuine failing-first assertion (5.6) and declares the rest — see "TDD Cycle Evidence (Phase 5)".
**Artifact Store**: openspec (repo-local)
**Date**: Phase 1 2026-09-15 · Phase 2 2026-09-16 · Phase 3/4/5 2026-09-17
**Branch**: Phase 1 `feat/rebrand-palette-harness`; task 1.7 `fix/rebrand-palette-harness-spec`; Phase 2 `feat/rebrand-palette-adopt-2`; Phase 3 `feat/rebrand-palette-chrome`; Phase 4 `feat/rebrand-palette-landing`; Phase 5 `chore/rebrand-palette-final` (all target the tracker branch `feat/rebrand-palette`; `feature-branch-chain`)
**SDD attempt token**: `sha256:18105916fa20539acf91a0e3b43a18c44603615df57ff114982279c01079f3e2`

## Summary

Phase 1 is complete: 6/6 tasks. `scripts/check-contrast.mjs` is a zero-dependency Node
harness that reads the **installed** `node_modules/bursit-ui-tokens/index.css` and nothing
else, resolves `var()` chains transitively, composites `rgba()` values over a per-pair
declared surface, and reports the WCAG 2.x ratio for 22 pairs in both modes.

The 1.2.0 RED baseline is measured and retained at
`openspec/changes/rebrand-palette/contrast-baseline-1.2.0.txt`.

**Phase 2 (adoption) is complete: 6/6 tasks.** The publish gate opened
(`npm view bursit-ui-tokens@2.0.0 version` → `2.0.0`), and the repo adopted the published
major: **three** manifests moved to `^2.0.0` (the plan named two — see Phase 2 deviation
D-2.1), both lockfiles were regenerated through the registry, and `npm run check:contrast`
now reads **44 PASS / 0 FAIL** where the retained 1.2.0 baseline read 27 FAIL / 17 PASS.
`npm run test`, `npm run build` and the landing `npm run build` are all green.

Phases 3–5 were **not** started (Phase 3 is the next work unit).

## Completed Tasks (6/6 in Phase 1)

- [x] 1.1 `scripts/check-contrast.mjs` parses the installed `index.css` read-only; **21 `:root` blocks** and the `[bursit-theme=dark], .dark` block are both found, and the harness prints the counts on every run.
- [x] 1.2 `var()` chains resolve transitively (with cycle detection and `var(--a, fallback)` support); `rgba()`/`alpha` foregrounds and backgrounds composite over a **per-pair declared surface**.
- [x] 1.3 Every line follows `ID <mode> <ratio> need <threshold> PASS|FAIL`, followed by `| <pairing>`; the 18 CC-03 IDs plus the 4 CC-04 badge pairs produce **exactly 44 lines**, all of which print before the non-zero exit (CC-03).
- [x] 1.4 Group B (BP-06, BP-07, BP-09, CC-05, CC-06) is labelled and tallied separately; Group A is exactly 44 lines.
- [x] 1.5 `"check:contrast": "node scripts/check-contrast.mjs"` added to `package.json`; `npm run check:contrast` runs and exits 1.
- [x] 1.6 RED baseline recorded. **Measured against 1.2.0: 27 of 44 Group A lines FAIL; 21 of the 22 pairs fail in at least one mode; 6 pairs fail in both modes; 17 lines PASS.** The task predicted "22 fail in both modes" — the real number differs and is reported as measured (see Issues 1).

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `scripts/check-contrast.mjs` | Created | The harness: CSS reader, `var()` resolver, colour/composite maths, declared pair tables, Group A/B reporting, `--self-test` calibration |
| `package.json` | Modified | Added the `check:contrast` script (+2/−1 lines) |
| `openspec/changes/rebrand-palette/contrast-baseline-1.2.0.txt` | Created | Retained 1.2.0 RED baseline: 22 provenance lines + the 83-line raw stdout |
| `openspec/changes/rebrand-palette/tasks.md` | Modified | Phase 1 tasks marked `[x]`; task 1.6 annotated with the measured counts |
| `openspec/changes/rebrand-palette/apply-progress.md` | Created | This artifact |
| `scripts/check-contrast.spec.mjs` | Created | Task 1.7: the harness's behavioural contract test (5 tests, 161 lines) |
| `jest.config.js` | Modified | Task 1.7: `testMatch` restates the Angular builder's pattern and adds the harness spec (+6 lines) |

No product source outside the harness and the `package.json` scripts block was touched.
`node_modules/bursit-ui-tokens` and the sibling `bursit-ui-tokens` repository were read
only, never written.

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `node scripts/check-contrast.mjs --self-test` → **exit 0, 9/9 passed** (21.00 max, 1.00 min, `#767676` on white 4.54, 50 % black over white 3.98, hex expansion, 8-digit alpha, `var()` chain, unknown token, shadow colour extraction). Calibrates the pure maths — the harness is a measuring instrument, so it is checked before it is trusted. |
| Runtime harness command and exact result | `npm run check:contrast` → **exit 1**; stdout = **83 lines**, of which **Group A = 44** (22 pairs × 2 modes), **Group B = 25** (13 rows, BP-09 narrowed to light). Tallies: Group A `PASS 17 / FAIL 27 / MISSING 0`, Group B `PASS 4 / FAIL 21 / MISSING 0`, `Result: FAIL - 48 result lines are below threshold`. Run is deterministic (two consecutive runs are byte-identical). |
| Rollback boundary | `scripts/check-contrast.mjs` (new file, delete it) + the single `check:contrast` line in `package.json`. Nothing else in the tree depends on either; reverting both restores the pre-slice state exactly. |

## Strict TDD deviation (declared, not silent)

`openspec/config.yaml` sets `strict_tdd: true` and Jest is available, so Strict TDD Mode
resolves as active. This slice cannot execute RED-first as written:

- The slice's edit authority is `scripts/check-contrast.mjs` + the `package.json` scripts
  block. A Jest spec (`*.spec.ts`) would be a third file, outside that authority and
  outside the rollback boundary the tasks forecast declared for this work unit.
- Jest's default `testMatch` does not pick up `*.spec.mjs`, and the harness's acceptance
  criterion is its own execution against the published artifact (CC-01), which no
  unit test can substitute for.

Compensation instead of a silent fallback: the harness ships an executable
`--self-test` that calibrates the contrast maths against published reference values
(including a compositing case), and `npm run check:contrast` is the acceptance test. The
same evidence is recorded above and in the return summary. **If the orchestrator wants
true RED-first for this slice, the scope must be widened to permit a spec file** — say so
and this is a small, in-file change.

**CLOSED by task 1.7 (2026-09-16).** The scope was widened, the spec file now exists
(`scripts/check-contrast.spec.mjs`), the default suite collects it, and the cycle evidence
is recorded in the "Task 1.7" section at the end of this file. This section is retained as
the Phase 1 record and is no longer the current state of the change.

## Deviations from Design

1. **Four CC-04 pairs are labelled `CC04-01` … `CC04-04`, not `CP-19` … `CP-22`.** The
   specs declare exactly 18 `CP-*` IDs; `CP-19`…`CP-22` exist nowhere. Each row names its
   requirement and the tokens it measures in its own output line.
2. **All 44 lines print, then the process exits non-zero.** The design's harness contract
   says "exits non-zero on the first failure"; `CC-03` requires "one result per ID, no
   aggregate", which is unreachable if the run stops at the first failure. The exit is set
   via `process.exitCode` after a single `stdout.write`, so no result can be lost to a
   premature exit. (Task correction #3; the design text is superseded.)
3. **Surfaces are declared per pair, and the design's blanket surface claim is wrong.**
   The design/tasks correction states that its light figures reproduce only on
   `--color-bg-elevated`. They do not: against the installed 1.2.0, CP-05 measures
   **3.87:1** and CP-07 **2.01:1** on `--color-bg`, which is what the spec's "Today"
   column records. Only CP-02 and CP-03 name a different surface, and they are declared
   as such. Default surface = `--color-bg` in both modes.
4. **A structural invariant check was added** (design silent): if a `:root` block emitted
   *after* the dark block ever redeclares a token the dark block sets, the equal-specificity
   cascade would override dark and every dark reading would be wrong. The harness checks
   this on every run and fails the run if it ever breaks. It passes today, which is the
   runtime confirmation of the tasks-phase claim.
5. **`--self-test` was added** (not in the tasks list) for the TDD reason above.
6. **Group B measures BP-06 through the six control tokens the package declares today**
   rather than through `--color-border-control`, which 1.2.0 does not have. That turns a
   `MISSING` placeholder into a real 3:1 reading and gives the BP-06 obligation a
   measurable RED baseline. `--input-border-color` therefore appears twice — once as CP-03
   and once as a BP-06 control — which is two requirements over one pairing, both reported.
7. **The report is ASCII-only.** A Windows console decodes a child process's stdout with
   its OEM code page, so a non-ASCII dash in the output is mangled in any redirected
   baseline file. This was observed during baseline capture and fixed at the source.

## Issues Found

1. **The predicted 1.2.0 baseline is wrong.** Task 1.6 and the design both expect "22 fail
   in both modes". Measured: **27 of 44 lines FAIL**, 21 of 22 pairs fail in at least one
   mode, 6 fail in both modes (CP-02, CP-03, CP-15, CP-16, CP-17, CP-18). The prediction
   is not reproducible from the installed artifact.
2. **CP-13 passes in both modes today, and its spec "Today" figure is stale.**
   `CC-03` records CP-13 (`--color-warning-contrast` on `--color-warning`) at **2.15:1**.
   Against the installed 1.2.0 it measures **8.31:1** (light) and **11.64:1** (dark): the
   package already ships `--color-warning-contrast: #0f172a`, not white. 2.15:1 is
   white-on-`#f59e0b`. `CC-05` already half-admits this ("Light
   `--color-warning-contrast` already passes (6.40:1)"), but `CC-03`'s table still carries
   the white-ink figure. **The spec's defect evidence for CP-13 needs correcting**; the
   pair belongs in the set as a regression guard, not as a defect.
3. **Two 0.01 rounding deltas against the spec's "Today" column.** CP-06 measures 2.16
   (spec 2.17) and CP-09 3.16 (spec 3.17). Both are re-derived here from the installed
   artifact per CC-01 rather than inherited; the exploration's figures appear rounded
   differently. 15 of the 18 "Today" figures reproduce exactly, which is strong evidence
   the surface model is right.
4. **Mode-scoped IDs repeat information by design.** CP-16 (light-scoped) and CP-17
   (dark-scoped) are the same pairing, so their four lines contain two distinct readings
   twice. This is forced by "18 IDs × 2 modes = 44 lines"; it is called out in the harness
   header so a reviewer does not read it as a bug.
5. **BP-07's dark line FAILs at 2.68:1** — `--btn-secondary-hover-color`
   (`--color-secondary-contrast`, `#080d17` in dark) on
   `--btn-secondary-hover-bg: #155E75`. The mode-independent literal is the BP-08 defect
   itself, and the harness now measures it. Not part of the 22-pair count.
6. **CC-06's glow obligation is measured but not yet *rendered*.** `--shadow-glow-primary`
   is a box-shadow spread value; the harness reads its colour and composites it. The
   checkbox outline that gives `--color-focus-ring` a consumer is Phase 3 (task 3.2).
7. **`npm run check:contrast` stays manual.** No workflow references it (verified against
   `.github/workflows/ci.yml`, which runs `npm run test` and `npm run build` only), per
   task 5.6. The open question about wiring a CI gate is untouched.

## Workload / PR Boundary

- **Mode**: chained PR slice (`feature-branch-chain`, PR #1 of 4) — **`size:exception` was declined by the maintainer, so this overage needs a decision**.
- **Current work unit**: Harness + RED baseline.
- **Boundary**: starts at the tracker branch tip (`feat/rebrand-palette`, master `125e53d`) and ends at a runnable, self-calibrated harness plus the retained 1.2.0 baseline. Nothing after it is included: no manifest bump, no lockfile, no Storybook chrome, no checkbox outline, no landing assets.
- **Review budget impact**: **485 changed lines** (`scripts/check-contrast.mjs` 482 added + `package.json` +2/−1) against the 400-line budget. Breakdown of the 482: 117 comment-only, 61 blank, 304 code — of which 36 lines are the declared pair tables and ~48 are the file docblock that states the reading contract.
- **Why it cannot shrink further**: the 36 declared rows are the deliverable (each row is one requirement's pairing, surface and threshold); the reading contract in the header is what makes a 44-line report reviewable; the parser, `var()` resolver, compositing and WCAG maths are each irreducible for a zero-dependency measurement of the published package. No cohesive slice brings this under 400: splitting the harness from its own pair tables yields a PR that satisfies no acceptance criterion on its own, and splitting Group B out would produce two baselines where task 1.6 requires one.
- **Recommendation**: accept `size:exception` for this slice, or state which of the above should be traded away. Per the apply contract this is reported, not self-approved.

## Verification Evidence (as run)

```
$ npm run check:contrast
bursit-angular - contrast harness (rebrand-palette Phase 1)
source: node_modules/bursit-ui-tokens/index.css (read-only)
formula: WCAG 2.x relative luminance (L1 + 0.05) / (L2 + 0.05), two decimals
light layer: 21 :root blocks
dark layer: [bursit-theme=dark], .dark - found
structure: no later :root block shadows the dark layer - OK

Group A - CC-03 (18 IDs) + CC-04 (4 badge pairs), one line per ID per mode
CP-01 light 4.27 need 4.5 FAIL | --color-primary on --color-bg (landing link)
CP-01 dark 6.52 need 4.5 PASS | --color-primary on --color-bg (landing link)
...
CC04-04 light 2.60 need 4.5 FAIL | badge-subtle info on its own tint (CC-04)
CC04-04 dark 8.03 need 4.5 PASS | badge-subtle info on its own tint (CC-04)
Group A: 22 pairs x 2 modes = 44 lines | PASS 17 | FAIL 27 | MISSING 0 | pairs failing in every mode 6

Group B - supplementary obligations: BP-06, BP-07, BP-09, CC-05, CC-06
BP-06 light 1.23 need 3 FAIL | --input-border-color on --input-bg
...
CC-06 dark 1.78 need 3 FAIL | --shadow-glow-primary on --color-bg (outline: none checkbox)
Group B: 25 lines | PASS 4 | FAIL 21 | MISSING 0

Result: FAIL - 48 result lines are below threshold
exit code: 1
```

Group A line count, asserted by pattern `^(CP-\d\d|CC04-\d\d) (light|dark) ` over the raw
stdout: **44**. Group A lines printed before the non-zero exit: **44 of 44** — the exit is
set after the single stdout write, so no line can be lost.

## Phase 2: Adoption — Completed Tasks (6/6)

- [x] 2.1 Confirmed the gate (read-only): `npm view bursit-ui-tokens@2.0.0 version` → `2.0.0`; the gate is OPEN. → TC-01.
- [x] 2.2 `package.json:26` `^1.2.0` → `^2.0.0`. → TC-02.
- [x] 2.3 `landing/package.json:21` `^1.2.0` → `^2.0.0`; ranges identical across the manifests. → TC-02.
- [x] 2.4 `package-lock.json` regenerated with `npm install` at the repo root (`changed 1 package`); resolved `https://registry.npmjs.org/bursit-ui-tokens/-/bursit-ui-tokens-2.0.0.tgz`; `file:` = 0. → TC-03.
- [x] 2.5 `landing/package-lock.json` regenerated with `npm install` in `landing/` (`changed 1 package`); same registry URL at 2.0.0; `file:` = 0. → TC-03.
- [x] 2.6 `npm run check:contrast` → **Group A `PASS 44 / FAIL 0 / MISSING 0`, `pairs failing in every mode 0`; Group B `PASS 25 / FAIL 0`; `Result: PASS`; exit 0.** The predicted 44 PASS is confirmed by measurement. → CC-03 / CC-04.

### Files Changed (Phase 2)

| File | Action | What Was Done |
|------|--------|---------------|
| `package.json` | Modified | `:26` `bursit-ui-tokens` `^1.2.0` → `^2.0.0` (TC-02) |
| `landing/package.json` | Modified | `:21` same (TC-02) |
| `projects/bursit-angular/package.json` | Modified | `:11` (`dependencies`) same — **not in the plan; deviation D-2.1** |
| `package-lock.json` | Regenerated | `npm install` at repo root; resolved 2.0.0 from the registry |
| `landing/package-lock.json` | Regenerated | `npm install` in `landing/`; resolved 2.0.0 from the registry |

`dist/` was rebuilt by `npm run build` (untracked build output; never hand-edited). The regenerated
`dist/bursit-angular/package.json` now carries `^2.0.0`, which is the observable proof that D-2.1 was
load-bearing, not cosmetic.

### Work Unit Evidence (Phase 2)

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `npm run check:contrast` → **exit 0**; Group A `PASS 44 / FAIL 0 / MISSING 0`, Group B `PASS 25 / FAIL 0`, `Result: PASS`. Calibration: `node scripts/check-contrast.mjs --self-test` → exit 0, **9/9 passed**. |
| Runtime harness command/scenario and exact result | Adopt-then-measure over the real installed artifact. `npm install` (root) → `changed 1 package`, installed `2.0.0`. `npm install` (landing) → `changed 1 package`, installed `2.0.0`. `npm run test` → 26/26 suites, 2 skipped, 314 passed, exit 0. `npm run build` → exit 0. landing `npm run build` → exit 0 (compiles the 2.0.0 SCSS source). |
| Rollback boundary | The three manifest range lines and the two lockfiles — `git diff --stat` = 5 files, 11 insertions / 11 deletions. Reverting the five restores 1.2.0 exactly; nothing else in the tree references the range. |

### TDD Cycle Evidence (Phase 2)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1–2.6 (one work unit: adopt the major) | `scripts/check-contrast.mjs` (existing acceptance harness) | Runtime/acceptance (integration against the installed artifact) | ✅ `--self-test` 9/9; full suite green | ✅ Measured pre-bump against installed 1.2.0: **27 FAIL / 17 PASS**, 6 pairs failing in every mode, exit 1 — reproduces `contrast-baseline-1.2.0.txt` | ✅ Measured post-bump: **44 PASS / 0 FAIL**, exit 0 | ➖ Single transition (the artifact version is the one variable; both modes are already reported per ID) | ➖ None needed (config-only slice) |

**Honest declaration.** This slice is a dependency/version adoption with no production code of its
own, so there is no new unit under test and no new test was invented. The RED is real and measured,
not assumed: the existing harness was run against the still-installed 1.2.0 **in this session** and
reproduced the retained baseline count-for-count (27 FAIL / 17 PASS, 6 pairs failing in every mode,
exit 1) before any manifest moved. The GREEN is the same harness run against the adopted 2.0.0
(44 PASS / 0 FAIL, exit 0). Both endpoints are recorded above. A test asserting a version string in a
JSON file would call no production code, so it was deliberately **not** written.

**Two premises in the launch prompt did not survive measurement — reported, not worked around:**

1. **`scripts/check-contrast.spec.mjs` does not exist.** The launch prompt described it as "the
   existing" RED for this slice (task 1.7). It is absent; `scripts/` holds only `check-contrast.mjs`.
   Task 1.7 remains `[ ]` and open in `tasks.md`. Its chosen remediation (widen Jest `testMatch` to
   `*.spec.mjs` plus `NODE_OPTIONS=--experimental-vm-modules`) is a Phase 1 decision and was **not**
   executed here: it is outside this slice's assigned tasks, and changing Jest's collection config
   from an adoption slice would widen the blast radius of a 22-line diff.
2. **The stated test baseline `27 suites / 319 passed / 2 skipped` does not reproduce.** Measured:
   `26 suites / 316 total / 314 passed / 2 skipped` (exit 0). The difference is not caused by this
   change: `npx jest --listTests` returns **26** spec files, and the committed spec-file count is
   **26 at HEAD and 26 at HEAD~1**. No spec imports `bursit-ui-tokens` or the `bursit-angular` dist
   alias (grep: zero hits), so test discovery and the test count are invariant to this bump. The
   suite is green; the quoted baseline appears stale.

### Test Summary

- **Total tests written (Phase 2)**: 0 new — see the honest declaration above; the slice reuses the existing acceptance harness.
- **Total tests passing**: `npm run test` → 314 passed, 2 skipped, 0 failed of 316, across 26 suites.
- **Layers used**: Unit (26 suites, library) and Runtime/acceptance (1 harness, 2 runs).
- **Approval tests** (refactoring): None — no refactoring task.
- **Pure functions created**: 0 — the diff is version strings in manifests and resolved lockfile entries.

### Phase 2 Deviations from the Plan

**D-2.1 — A third manifest was bumped: `projects/bursit-angular/package.json:11`.** The plan names two
manifests (2.2 `package.json`, 2.3 `landing/package.json`). The repo declares
`"bursit-ui-tokens": "^1.2.0"` in **three** places; the third sits in the library manifest's
`dependencies`, beside `tslib`. That file is what ng-packagr copies into the published library package,
so leaving it at `^1.2.0` would ship a library advertising the retired major to every consumer — the
exact consumer-facing defect class this repo already fixed once (issue #35 / PR #36). **Proof it is
load-bearing:** before the change, `dist/bursit-angular/package.json` (build output) carried `^1.2.0`;
after `npm run build` it carries `^2.0.0`. Bumping it is a deliberate deviation from the plan's file
list, reported here rather than silently absorbed.

**D-2.2 — Task 2.6's prediction is CONFIRMED, and reported as measured.** Unlike the Phase 1 prediction
(which predicted 44 FAIL and was refuted — measured 27 FAIL / 17 PASS), task 2.6's "22/22 both modes →
44 PASS" is **correct**: Group A `PASS 44 / FAIL 0`, exit 0. No number was forced; the per-mode tally
is quoted verbatim from the run above.

### Phase 2 Issues Found

1. **Deleted-token sweep (trap 1) — CLEAN, nothing broke.** 2.0.0 deletes `$indigo-*`/`$cyan-*`. A
   case-insensitive sweep of `projects/**` and `landing/**` for `indigo|cyan|155E75` returns exactly
   **two** hits, neither a token consumption: `landing/scripts/generate-og-image.mjs:98` (a stale
   "indigo-to-cyan" **comment**, already scheduled as task 4.1) and a generated `landing/dist/*.css`
   file (build output, untracked). The repo's SCSS consumes only
   `--color-{bg,bg-elevated,bg-sunken,border,primary,primary-hover,secondary,secondary-active,text,text-muted}`
   — all still shipped by 2.0.0. The 2.0.0 SCSS source itself has zero `indigo|cyan` hits, and both
   builds compile it: Storybook and the landing consume
   `node_modules/bursit-ui-tokens/src/index.scss` (`angular.json:56,60,73,77`), and the landing build
   passed. **No replacement token was invented anywhere.**
2. **Published-artifact contract re-confirmed from the installed tree** (read-only): `#155E75` = **0**;
   `#ba3b54` (wine-500), `#3a6b9c` (steel-500) and `#991B1B` (red-800) each present;
   `--color-border-control` ×8, `--color-secondary-strong` ×3 and `--color-brand-*` ×6 declared;
   `index.css` = 860 lines.
3. **Task 1.7 remains open** — the only Strict-TDD gap in the change. It is Phase 1 scope; it was not
   silently closed here.
4. **`npm audit` on the root install reports 53 vulnerabilities** (3 low / 22 moderate / 25 high /
   3 critical). Pre-existing and unrelated to this bump (the install changed exactly one package).
   Recorded, not acted on — dependency remediation is outside this change's scope.

### Workload / PR Boundary (Phase 2)

- **Mode**: chained PR slice (`feature-branch-chain`, PR #2 of 4). Branch
  `feat/rebrand-palette-adopt-2` targets the tracker `feat/rebrand-palette`.
- **Current work unit**: Adopt the published major.
- **Boundary**: starts at the tracker tip and ends at three manifests declaring `^2.0.0` with two
  regenerated lockfiles resolving 2.0.0 from the registry, verified by the existing harness and both
  builds. Nothing after it is included: no Storybook chrome, no checkbox outline, no landing assets,
  no `AGENTS.md` correction.
- **Review budget impact**: **authored diff = 22 changed lines** (5 files, 11 insertions /
  11 deletions) — well inside the 400-line budget. SDD artifact bookkeeping adds to the recorded total;
  the final count is stated in the return envelope.

---

## Status

**Phase 1: 7/7 complete** (task 1.7 delivered and verified — `fix/rebrand-palette-harness-spec`, PR #43, merged). **Phase 2: 6/6 complete and verified** (44 PASS / 0 FAIL against the published `bursit-ui-tokens@2.0.0` — `feat/rebrand-palette-adopt-2`, PR #44, merged). **Phase 3: 2/3 complete** (3.1 chrome and 3.2 focus-ring consumer delivered and merged — `feat/rebrand-palette-chrome`, PR #45; 3.3's interactive toolbar toggle stays open for the maintainer). **Phase 4: 4/4 complete** (`feat/rebrand-palette-landing`, PR #46). **Phase 5: 6/6 complete** (`chore/rebrand-palette-final`, the integrated tree) — the four builds pass, the suite is 27 suites / 322 passed / 2 skipped, the contrast harness reads 44 PASS / 0 FAIL and is now a CI gate, the indigo/cyan sweep is zero in product source, and both 5.5 spec wordings are amended.

Phase 2's open follow-ups are both pre-existing and outside its scope: the CP-13 spec correction
(Phase 1, Issue 2) and Phase 1's 485-line review overage, which still needs the decision recorded in
the Phase 1 section above.

**Next recommended**: `sdd-verify` for independent verification of the whole change, then archive.
The only task still open anywhere in this change is Phase 3's 3.3 interactive toolbar toggle, which
needs a human at a browser.

---

Note: the Phase 1 sections above are preserved verbatim; only the title, the phase metadata block and
this tail were amended for the merge.

---

# Task 1.7 — Strict TDD remediation: the harness's behavioural contract test

**Date**: 2026-09-16
**Branch**: `fix/rebrand-palette-harness-spec` (branched off the tracker branch `feat/rebrand-palette`)
**Mode**: Strict TDD (spec written first; RED observed, then GREEN — table below)
**Purpose**: close CRITICAL 2 in `verify-report.md` — *"Strict TDD was not followed and no TDD evidence was reported"*
**Working tree**: changes are left **uncommitted** for review and verification.

## Summary

Task 1.7 is complete. The harness's user-facing contract is now covered by 5 tests in
`scripts/check-contrast.spec.mjs`, and the default suite collects and runs them:
`npm run test` reports **27 suites / 319 passed / 2 skipped, exit 0** (was 26 / 314). The
harness itself is **unchanged**: its LF-normalised SHA-256 is still
`bd2de718410927d5551d61b01d26000f32e12fcde8586b3139101571cdd7fef2` (the revision
`verify-report.md` verified), its stdout is line-for-line identical to the retained 1.2.0
baseline (83 lines, 44 Group A, 0 differences), and `contrast-baseline-1.2.0.txt` is
untouched (`git diff` empty).

## Completed Tasks (task 1.7)

- [x] 1.7 `scripts/check-contrast.spec.mjs` added, collected by `npm run test`, and `jest.config.js`'s `testMatch` widened as the remediation required. The tests assert only behaviour that survives the 1.2.0 -> 2.0.0 transition: exactly 44 Group A lines, the documented line shape, the 22 declared IDs reported once per mode, all 44 lines emitted before the verdict, the exit-code contract, and MISSING isolation. No fixed exit code and no fixed PASS/FAIL count is asserted.

## Files Changed (task 1.7)

| File | Action | What Was Done |
|------|--------|---------------|
| `scripts/check-contrast.spec.mjs` | Created | 5 behavioural tests over the harness CLI, spawned as a child process (161 lines) |
| `jest.config.js` | Modified | `testMatch` restates the Angular builder's project pattern and adds `**/scripts/**/*.spec.mjs` (+6 lines) |
| `openspec/changes/rebrand-palette/tasks.md` | Modified | Task 1.7 marked `[x]`, annotated with the measured outcome and the two refuted premises |
| `openspec/changes/rebrand-palette/apply-progress.md` | Modified | This merged section |

## TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.7 (a) 44-line report, line shape, one line per declared ID per mode | `scripts/check-contrast.spec.mjs` | Integration (child process against the real installed package) | `npm run test` = 26 suites / 314 passed / 2 skipped, exit 0, before any edit | **Written first and it failed:** `npx jest scripts/check-contrast.spec.mjs` -> `Tests: 1 failed, 4 passed, 5 total`, exit 1; `expect(received).toBe(expected) // Object.is equality` `Expected: true` `Received: false` at the MISSING-note assertion, and the received note was `(missing --input-border-color, --input-bg, --color-bg)` | `npx jest scripts/check-contrast.spec.mjs` -> **5 passed, 5 total**, exit 0 (1.5 s); `npm run test` -> **27 suites / 319 passed / 2 skipped**, exit 0 | 3 inputs, 3 code paths: the installed 1.2.0 package, a fixture declaring **no** tokens, a fixture declaring only `--color-bg` + `--color-text-subtle` | Clean — one `runHarness()` helper, regexes hoisted to named constants; the focused command re-run after each step |
| 1.7 (b) collection by the default suite | same | Configuration (Jest) | n/a (config change, no existing behaviour touched) | **Real RED:** with the spec on disk, `npm run test` collected **26** suites and never ran it; `grep` of `node_modules/@angular-builders/jest` proved the builder injects its own `testMatch` (`<projectRoot>/**/*(*.)@(spec|test).[tj]s?(x)`) | After adding `testMatch`: `npx jest --listTests` = **27** files including the spec; `npm run test` = **27 suites / 319 passed**, exit 0 | Single (one config path — recorded, not skipped) | None needed |
| 1.7 (c) MISSING reporting for an undeclared token | same | Integration (fixture tokens package in a temp cwd) | as above | Written first — this was the case that failed in (a), with the real received note in the failure output | `5 passed` | 2 cases: all tokens absent (44 MISSING lines, tally `MISSING 44`) and one ID isolated (42 MISSING / 2 measured, `CP-18` only) | Clean |
| 1.7 (d) mutation sensitivity (proves the assertions bite) | same | Integration | `5 passed` before each mutant | **Mutant 1** (exit code forced to `0`): `Tests: 3 failed, 2 passed` — `Expected: 1 / Received: 0`. **Mutant 2** (`measureGroup` returns after the first non-PASS result — a first-failure abort, i.e. a CC-03 violation): `Tests: 5 failed, 5 total` — `Expected length: 44 / Received length: 1`, received `["CP-01 light 4.27 need 4.5 FAIL \| --color-primary on --color-bg (landing link)"]` | Both mutants reverted with `git checkout -- scripts/check-contrast.mjs`; harness SHA-256 back to `bd2de718…d7fef2`, no tracked file modified, `5 passed` again | n/a (mutation check) | None needed |

### Test Summary

- **Total tests written**: 5 (1 file) — the 22-ID x 2-mode report, the exit contract, the
  per-ID MISSING isolation, the all-MISSING case, and the CC-03 completeness check
- **Total tests passing**: 5 — suite: **319 passed / 2 skipped, 27 suites, exit 0**
- **Layers used**: Integration (5) — the harness is a process, so its CLI is the contract; Unit (0)
- **Approval tests** (existing behaviour): 5 — the harness already existed, so this is an
  approval/characterization test. RED is therefore (i) the real failing run in 1.7 (a), and
  (ii) the two mutation checks in 1.7 (d) proving the assertions are not vacuous
- **Pure functions created**: 0 — no production code was written or modified

## Work Unit Evidence (task 1.7)

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `npx jest scripts/check-contrast.spec.mjs` -> **5 passed, 5 total**, exit `0` (1.5 s). RED before the config change: same command -> `1 failed, 4 passed, 5 total`, exit `1` |
| Runtime harness command and exact result | `npm run test` -> **27 suites / 319 passed / 2 skipped**, exit `0` — the default (CI) suite now includes the harness contract test. `npm run check:contrast` -> exit `1` (RED by design against 1.2.0), stdout **83 lines / 44 Group A**, **0 differences** against `contrast-baseline-1.2.0.txt` |
| Rollback boundary | `scripts/check-contrast.spec.mjs` (new file — delete it) plus the `testMatch` line and its comment in `jest.config.js`. Reverting those two restores the pre-slice state exactly; the harness and the retained baseline are untouched |

## Deviations (task 1.7)

8. **The remediation's mechanism was half wrong, and measurement decides it.** (i) Widening
   `testMatch` **was** required, but for a reason the plan did not have:
   `@angular-builders/jest` injects its own `testMatch`
   (`node_modules/@angular-builders/jest/dist/default-config.resolver.js:36`,
   `<projectRoot>/**/*(*.)@(spec|test).[tj]s?(x)`), and `jest.config.js` wins that
   `lodash.mergeWith` — so the widening had to live in `jest.config.js`. Bare Jest 30.4.2
   *does* collect `.mjs` (`npx jest --listTests` -> 27, spec included) while `npm run test`
   collected only 26. (ii) `NODE_OPTIONS=--experimental-vm-modules` was **not needed at all**:
   jest-preset-angular's `transform` already covers `^.+\.(ts|js|mjs|html|svg)$`, so the spec
   runs as a transformed module under both `jest` and `ng test`. Trap 2 (Windows inline env
   vars) never materialised; **no launcher and no `cross-env` were added**, and the default
   `npm run test` path is untouched apart from the collection pattern.
9. **The `testMatch` pattern is narrower than the plan's.** The plan proposed the general
   `**/?(*.)+(spec|test).mjs`; the shipped pattern is the builder's library pattern plus
   `**/scripts/**/*.spec.mjs`. Measured reason: the repo holds exactly 26 spec files under
   `projects/bursit-angular/` and 1 under `scripts/`, so a general pattern would grant
   collection authority over the whole workspace for no benefit. The library set is unchanged
   (26 suites before and after).
10. **The spec spawns the harness instead of importing it** — the alternative the task brief
    permitted, adopted for the reason it gives: the CLI output is the contract tasks 1.3–1.5
    accept, and importing an ESM module would have coupled the spec to Jest's ESM mode.
    `scripts/check-contrast.mjs` now exports nothing new and is byte-identical to the
    verified revision.
11. **No fixed exit code and no fixed PASS/FAIL count**, because 27 of the 44 Group A lines
    fail on 1.2.0 and Phase 2 expects them to pass on 2.0.0. The exit contract is asserted
    **relationally** (`0` iff the run's own `Result:` line reports nothing below threshold),
    which holds in both states. The array merge is index-wise (lodash `mergeWith`), which is
    why the builder's pattern is restated as the first entry.

## Issues Found (task 1.7)

8. **The `testMatch` premise in `verify-report.md` (and in task 1.7's text) is only half
   true.** It is the *builder*, not Jest's defaults, that hides the `.mjs` file:
   `@angular-builders/jest` replaces `testMatch` with a project-scoped `[tj]s?(x)` pattern.
   Whoever debugs this next should read
   `node_modules/@angular-builders/jest/dist/default-config.resolver.js` before the Jest docs.
9. **`ng test` and bare `jest` were silently collecting different sets** (26 vs 27 files)
   before this change, because the builder's `testMatch` differs from Jest's defaults. The
   restated pattern makes the intended set explicit and the two entry points now agree.
10. **A raw `Get-FileHash` of a source file does not reproduce the digests in
    `verify-report.md` on this Windows checkout**, because `core.autocrlf` writes CRLF into
    the working tree while the recorded digests are over LF bytes. Normalising CRLF -> LF
    reproduces `bd2de718…d7fef2` for the harness exactly. A verifier recomputing hashes
    should normalise first (or hash the committed blob), otherwise a perfectly unchanged file
    looks modified.

## Verification Evidence (as run, 2026-09-16)

```
$ npm run test                                             # before, safety net
Test Suites: 26 passed, 26 total
Tests:       2 skipped, 314 passed, 316 total
Time:        25.322 s                     exit 0

$ npx jest scripts/check-contrast.spec.mjs                 # RED (spec first, config unchanged)
FAIL scripts/check-contrast.spec.mjs
  ● contrast harness CLI contract › isolates MISSING to the IDs whose own token is absent
    expect(received).toBe(expected) // Object.is equality
    Expected: true
    Received: false
Test Suites: 1 failed, 1 total
Tests:       1 failed, 4 passed, 5 total   exit 1

$ npx jest scripts/check-contrast.spec.mjs                 # GREEN (expectation corrected)
Tests:       5 passed, 5 total            exit 0   (1.538 s)

$ npx jest --listTests                                     # collection proof
BARE_JEST_COLLECTED=27 · HARNESS_SPEC_PRESENT=1
$ npm run test                                             # after (the CI path)
Test Suites: 27 passed, 27 total
Tests:       2 skipped, 319 passed, 321 total
Time:        13.545 s                     exit 0

$ mutants                                                  # sensitivity (reverted after each)
exit code forced to 0        -> Tests: 3 failed, 2 passed   (Expected: 1 / Received: 0)
abort on first non-PASS      -> Tests: 5 failed, 5 total    (Expected length: 44 / Received length: 1)
harness restored             -> LF SHA-256 bd2de718410927d5551d61b01d26000f32e12fcde8586b3139101571cdd7fef2

$ npm run check:contrast                                   # harness output unchanged
Result: FAIL - 48 result lines are below threshold          exit 1
FRESH_STDOUT_LINES=83 · FRESH_GROUP_A_LINES=44
BASELINE_STDOUT_LINES=83 · BASELINE_GROUP_A_LINES=44
GROUP_A_ORDER_DIFFS=0 · FULL_STDOUT_DIFFS=0 · BASELINE_FILE_UNTOUCHED=True
```

## Workload / PR Boundary (task 1.7)

- **Mode**: chained PR slice (`feature-branch-chain`, child of PR #1 on the tracker branch
  `feat/rebrand-palette`) — this branch targets the harness branch, not `master`.
- **Current work unit**: the harness contract test plus the collection pattern.
- **Boundary**: starts at the merged harness slice and ends at a suite that collects and runs
  the harness's behavioural contract. Nothing else is touched: no manifest bump, no lockfile,
  no Storybook chrome, no checkbox outline, no landing assets.
- **Review budget impact**: **167 changed lines** (161 new spec file + 6 in `jest.config.js`)
  against this attempt's 200-line budget. Nothing was removed or compressed to reach it.
- **Rollback boundary**: the two files above; the harness and baseline are untouched.

## Status (task 1.7)

**Task 1.7 complete — 1/1.** `scripts/check-contrast.spec.mjs` is collected and green in the
default suite (27 suites / 319 passed / 2 skipped, exit 0), the harness is byte-identical to
the verified revision, and its output is unchanged. Phase 1 is now 7/7.

Phases 2–5 remain **0/… and intentionally not started** (blocked on the external publish gate
`npm view bursit-ui-tokens@2.0.0`). Unchanged open items from Phase 1: the 485-line overage of
the harness slice (needs the maintainer's decision) and the CP-13 spec correction.

**Next recommended**: `sdd-verify` for independent verification of task 1.7 (re-run
`npm run test`, `npx jest scripts/check-contrast.spec.mjs`, and `npm run check:contrast`).

> **Superseded by the merge (2026-09-17).** This section is the task 1.7 record as written on
> 2026-09-16, when it was accurate. The "Phases 2-5 not started" line above was true then and is now
> false: Phase 2 is complete and verified (44 PASS / 0 FAIL against the published
> `bursit-ui-tokens@2.0.0`). See the top of this document for the current state.

---

# Phase 3 — Chrome + Checkbox Outline

**Date**: 2026-09-17
**Branch**: `feat/rebrand-palette-chrome` (branched off the tracker `feat/rebrand-palette`, currently at the
merge of PR #43 and PR #44)
**Mode**: Strict TDD is active (`openspec/config.yaml` → `strict_tdd: true`). This slice declares a
deviation from it — see "Strict TDD deviation (Phase 3)".
**Working tree**: changes are left **uncommitted** for review and verification.

## Summary

Phase 3 is **2/3 tasks**. `manager.ts` now builds `bursitLight`/`bursitDark` with `create()` from the exact
TC-05 literals and passes them to the existing `setConfig` call; the mode-detection logic (`isDark`,
`globalsUpdated`, `matchMedia`) is unchanged. `checkbox.scss` replaces the `outline: none` anti-pattern with
a real `--color-focus-ring` outline, giving that token its **first consumer** (source consumers 0 → 1).
`npm run build-storybook`, `npm run test` and `npm run check:contrast` are all green. Task 3.3's build half
is proven; its interactive toolbar toggle is **not** observed and is owed to the maintainer, so 3.3 stays
unchecked.

## Completed Tasks (Phase 3)

- [x] 3.1 `manager.ts:2` — `create` replaces the `themes` import; `bursitLight`/`bursitDark` built per TC-05; passed to `setConfig`; `isDark`/`globalsUpdated`/`matchMedia` untouched.
- [x] 3.2 `checkbox.scss:31–34` — `outline: var(--border-width-medium) solid var(--color-focus-ring);` + `outline-offset: var(--space-xs);` replace `outline: none`; the `box-shadow` declaration is kept.
- [ ] 3.3 `npm run build-storybook` — **PROVEN** (exit 0). The toolbar toggle **NOT observed** — manual, owed to the maintainer.

## Files Changed (Phase 3)

| File | Action | What Was Done |
|------|--------|---------------|
| `projects/bursit-angular/.storybook/manager.ts` | Modified | `:2` `create` import; new `bursitLight`/`bursitDark` (TC-05 literals); `setConfig` theme object switched. Detection logic unchanged (+29/−2) |
| `projects/bursit-angular/src/lib/forms/checkbox/checkbox.scss` | Modified | Focus block: `outline: none` → token outline + offset; `box-shadow` kept (+2/−1) |
| `openspec/changes/rebrand-palette/tasks.md` | Modified | 3.1/3.2 marked `[x]` with evidence; 3.3 annotated, left `[ ]` |
| `openspec/changes/rebrand-palette/apply-progress.md` | Modified | This merged Phase 3 section |

## Work Unit Evidence (Phase 3)

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `npm run build-storybook` → **exit 0**, "Storybook build completed successfully"; both themes present and reachable in `storybook-static/sb-addons/projects-bursit-angular-storybook-5/manager-bundle.js` |
| Runtime harness command/scenario and exact result | `npm run check:contrast` → Group A **PASS 44 / FAIL 0**, Group B **PASS 25 / FAIL 0**, `Result: PASS`, exit 0. `npm run test` → **27 suites / 319 passed / 2 skipped**, exit 0. Built-bundle inspection: `create({base:"light",…})` and `create({base:"dark",…})` both emitted; `setConfig({theme:o?p:c})`; `themes.light`/`themes.dark` source refs = 0 |
| Rollback boundary | `manager.ts` (revert to `import { themes }` + `themes.dark : themes.light`) and `checkbox.scss` (restore `outline: none`). Nothing else depends on either; reverting the two restores the pre-slice state exactly |

## TDD Cycle Evidence (Phase 3)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3.1 | — none; deviation declared | Static/measurement + built-artifact | `npm run test` green (27/319) and `npm run check:contrast` green before editing | `themes.light`/`themes.dark` referenced at `manager.ts:14` — the chrome is Storybook's own default, not brand-tinted; source refs = **1** | Built manager bundle carries both `create({base:"light"…})`/`create({base:"dark"…})` and `setConfig({theme:o?p:c})`; source refs = **0** | ➖ One variable (the object passed to `setConfig`); both modes emitted in one bundle | ➖ None (config slice) |
| 3.2 | — none; deviation declared | Static/measurement | as above | `outline: none` present in the focus block (`checkbox.scss:32`); source consumers of `var(--color-focus-ring)` = **0** | `outline: none` = **0**; source consumers = **1**; `check:contrast` CC-06 still 3.12 / 5.14 PASS | ➖ Single declaration swap | ➖ None (style slice) |
| 3.3 | — none | Runtime build | as above | ➖ Not applicable (a build gate is pass/fail, not RED-first) | `build-storybook` exit 0; both themes in the bundle | ➖ | ➖ |

## Strict TDD deviation (Phase 3) — declared, not silent

Strict TDD Mode resolves as active (`strict_tdd: true` + a working runner), so it is followed **or reported
as failed**. This slice is reported as a **declared deviation**, for a concrete reason per task:

- **3.1** — the theme objects are configuration consumed by Storybook's own manager runtime. `manager.ts`
  calls `addons.register` at import time and does not export the objects; a Jest test would have to mock
  both `storybook/manager-api` and `storybook/theming/create` and then assert the very literal table the
  design fixes — a tautology of the deliverable, not a behavioural assertion. Deliberately **not written**.
- **3.2** — the change is compiled CSS; jsdom does not resolve stylesheets, so no DOM assertion on
  `outline` is possible. A test that re-reads the SCSS source text would re-encode the diff, which the task
  brief explicitly rules out as a tautology.

**The real RED is what the requirements name**: a wrong/retired chrome colour (Storybook's default chrome,
`themes.dark`/`themes.light`, not brand-tinted) and an **unreachable** focus ring (`--color-focus-ring`
declared twice, consumed nowhere; `outline: none` actively removes the focus indicator). The strongest
honest evidence produced is the before/after source measurement plus the built-artifact inspection recorded
in the table above. No behavioural test was written because none exists that is not tautological.

## Test Summary (Phase 3)

- **Total tests written**: **0** — see the declared deviation above; no genuine failing-first unit exists for
  a manager-side config table or for compiled SCSS that jsdom cannot evaluate.
- **Total tests passing**: `npm run test` → **27 suites / 319 passed / 2 skipped, exit 0** (unchanged).
- **Layers used**: Static/measurement (grep counts, before/after) and Runtime build (`build-storybook`) +
  Runtime acceptance (`check:contrast`). Unit: 0 new.
- **Approval tests / Pure functions created**: none.

## Deviations (Phase 3)

**D-3.1 — Strict TDD deviation declared (no test written).** Justified above; the obligation is reported,
not silently dropped. The `strict-tdd.md` module's "no silent fallback" rule is satisfied by this explicit
record.

**D-3.2 — Task 3.3 left unchecked.** Its verbatim text requires toggling the toolbar and observing the
chrome track the mode. That is interactive and cannot be observed in a headless run, so the box is not
closed. The build half is proven and recorded; the toggle is owed to the maintainer.

**D-3.3 — `appContentBg`/`textColor`/`appBg` literals repeat by design.** Dark `appContentBg` and light
`appBg` equal `#22282E`, and light `appContentBg` equals `#FFFFFF` while dark `textColor` equals `#F9FAFB`.
This is the design's table verbatim, not a copy/paste slip; it is left as specified.

## Issues Found (Phase 3)

1. **The built manager entry still destructures `themes`.** Storybook's manager runtime exposes the whole
   `__STORYBOOK_THEMING_CREATE__` namespace, so the emitted bundle contains `{create:l,themes:Te}` even
   though `Te` is unused. This is webpack namespace destructuring, not a `themes.*` reference; the source
   has none (`themes.light`/`themes.dark` = 0). Recorded so a reviewer reading the bundle does not mistake it
   for a leftover.
2. **TC-07 sweep is clean for this slice.** The only `indigo|cyan` hit in source is the stale comment at
   `landing/scripts/generate-og-image.mjs:98`, already scheduled as task 4.1 (Phase 4, out of scope). The
   manager chrome introduces no indigo/cyan value.

## Workload / PR Boundary (Phase 3)

- **Mode**: chained PR slice (`feature-branch-chain`, PR #3 of 4). Branch `feat/rebrand-palette-chrome`
  targets the tracker `feat/rebrand-palette`.
- **Current work unit**: Chrome tint + checkbox focus outline.
- **Boundary**: starts at the merge of PR #43/#44 and ends at a brand-tinted manager plus a checkbox with a
  real focus outline, verified by `build-storybook`, `npm run test` and `check:contrast`. Nothing after it is
  included: no landing assets, no OG card, no `AGENTS.md`.
- **Review budget impact**: **34 authored changed lines** (`manager.ts` +29/−2, `checkbox.scss` +2/−1)
  against the 400-line budget; SDD bookkeeping is counted in the return envelope.

## Status (Phase 3)

**Phase 3: 2/3 complete.** 3.1 and 3.2 landed and measured; 3.3's build half is proven and its interactive
toolbar toggle is owed to the maintainer. Phases 4–5: not started.

**Next recommended**: `sdd-verify` for independent verification of Phase 3 (re-run `npm run build-storybook`,
`npm run test`, `npm run check:contrast`, and inspect the built manager bundle).
# Phase 4 — Landing Assets + Docs (tasks 4.1–4.4)

**Date**: 2026-09-17
**Branch**: `feat/rebrand-palette-landing` (branched off the tracker `feat/rebrand-palette` at `8ec0f03`; `feature-branch-chain`, PR #4 of 4)
**Mode**: Strict TDD is active (`openspec/config.yaml` → `strict_tdd: true`). This slice declares an **honest deviation** — see "TDD obligation (Phase 4)" below. No test was invented.
**Artifact Store**: openspec (repo-local)

## Summary

Phase 4 is complete: 4/4 tasks. The OG card's seven literals now genuinely come from the installed
package's dark layer, the committed raster is regenerated and provably different, the three
placeholder marks carry the mark's own tonal axis through brand tokens, and `AGENTS.md`'s `file:`
claim is correct. `npm run test` is unchanged (27 suites / 319 passed / 2 skipped), the contrast
harness still reads 44 PASS / 0 FAIL, and the landing build is green. Task 4.5 stays **out of this
change** (BA-01, artwork-gated) and is untouched.

## Completed Tasks (4/4 in Phase 4)

- [x] 4.1 `generate-og-image.mjs` — all 7 `PALETTE` literals re-copied from the installed dark layer; the header claim is true; the stale line-98 comment is reworded. → BA-04
- [x] 4.2 `og-image.png` — regenerated with the landing `npm run og-image` self-check (1200×630, exit 0); raster provably changed. → BA-04
- [x] 4.3 Nav/Footer/global.scss — the primary→secondary gradient replaced by the brand-mark tonal axis via tokens. → BA-03
- [x] 4.4 `AGENTS.md:23` — the `file:` claim corrected to the registry consumption the lockfiles prove. → TC-03

## Files Changed (Phase 4)

| File | Action | What Was Done |
|------|--------|---------------|
| `landing/scripts/generate-og-image.mjs` | Modified | 7 `PALETTE` literals → dark register (+2 comment normalisations); `:98` comment reworded |
| `landing/public/og-image.png` | Regenerated | `npm run og-image`; 1200×630; 155594 → 170773 bytes |
| `landing/src/components/Nav.astro` | Modified | `:108` mark gradient → brand tokens |
| `landing/src/components/Footer.astro` | Modified | `:87` mark gradient → brand tokens |
| `landing/src/styles/global.scss` | Modified | `:407` code-block mark gradient → brand tokens |
| `AGENTS.md` | Modified | `:23` `file:` claim → registry `^2.0.0` |
| `openspec/changes/rebrand-palette/tasks.md` | Modified | 4.1–4.4 marked `[x]` with measured evidence |
| `openspec/changes/rebrand-palette/apply-progress.md` | Modified | This merged Phase 4 section |

The Angular library, Storybook config, `jest.config.js`, the dependency manifests,
`scripts/check-contrast.*` and `contrast-baseline-1.2.0.txt` were **not** touched.

## Work Unit Evidence (Phase 4)

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `npm run og-image` (in `landing/`) → **exit 0**, `og-image.png written — 1200x630`. Plus the static product sweep: `git grep -iE "indigo|cyan|#6366f1|#06b6d4|155e75" -- landing projects AGENTS.md` → **0 hits** (exit 1). |
| Runtime harness command/scenario and exact result | Raster regenerated and pixel-sampled: rail top `#6267f1`→`#e7a1af`, rail bottom `#07b5d4`→`#7ca3cc`, surface `#0f172a`→`#272e35`. Landing `npm run build` → **exit 0**; the built `landing/dist/_astro/index.*.css` carries the brand-token gradient 3× and both register declarations. `npm run test` → 27 suites / 319 passed / 2 skipped, exit 0. `npm run check:contrast` → 44 PASS / 0 FAIL, exit 0. |
| Rollback boundary | The six tracked files in the table above (`git checkout -- landing/scripts/generate-og-image.mjs landing/public/og-image.png landing/src/components/Nav.astro landing/src/components/Footer.astro landing/src/styles/global.scss AGENTS.md`). Nothing else depends on them; the SDD artifacts are bookkeeping. |

## TDD obligation (Phase 4) — declared deviation, no invented test

Strict TDD resolves as active, but this slice has no unit under test a Jest run could reach, and
the slice's own instruction forbids changing the mandated suite count. Declared plainly rather
than faked:

- **No test runner exists in `landing/`.** `landing/package.json` declares only
  `dev`/`build`/`preview`/`og-image`/`astro` — no `test`, no jest/vitest, no config file.
- **A root-collected spec cannot be added without breaking the invariant.** `jest.config.js`'s
  `testMatch` includes `**/scripts/**/*.spec.mjs`, which would also collect a spec placed under
  `landing/scripts/`, turning the required **27 suites** into 28. Adding a test runner to the
  landing would mean editing a dependency manifest — also out of scope.
- **The work is not logic-bearing.** It is raster generation, two CSS/Astro gradient declarations,
  and one documentation line. There is no pure function to drive.

Compensation instead of a tautological test — every item below is an executable, observed
instrument output recorded above: the script's own 1200×630 geometry self-check; a pixel-level
before/after sample proving the raster's palette actually changed; a repo-wide sweep proving zero
indigo/cyan in product source; the built-CSS proof that all three sites emit the brand-token
gradient; and the `file:` sweep. If the orchestrator wants true RED-first here, the scope must be
widened to permit a test runner in `landing/` (or to accept a 28th root suite) — say so.

## TDD Cycle Evidence (Phase 4)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4.1 | none — declared deviation | Static/raster (no runner) | ✅ `npm run test` 27/319/2 before any edit | ✅ Measured: `git grep` found `#6366f1`/`#06b6d4`/`indigo-to-cyan` in the script; committed raster sampled `#6267f1`/`#07b5d4` | ✅ Product-source sweep 0 hits; script values equal the installed dark layer | ➖ Single (one register) | ➖ None needed |
| 4.2 | none — declared deviation | Runtime (raster) | N/A (regenerated artifact) | ✅ Pre-change raster: blob `c6142e93…`, 155594 B | ✅ `npm run og-image` exit 0, 1200×630; 170773 B; sampled pixels show the new palette | ➖ Single | ➖ None needed |
| 4.3 | none — declared deviation | Static (built CSS) | ✅ landing build green | ✅ `git grep` found the primary→secondary pair at 3 sites; 0 brand-token gradients | ✅ 3 brand-token gradients in source and in the built CSS; 0 primary→secondary | ✅ 3 sites, both registers (light + dark declarations present) | ➖ None needed |
| 4.4 | none — declared deviation | Static (doc) | N/A (doc line) | ✅ The `AGENTS.md:23` claim was contradicted by the lockfiles; `file:` sweep over the three manifests = 0 | ✅ `:23` names the registry `^2.0.0`; both lockfiles resolve the registry tarball | ➖ Single | ➖ None needed |

## Test Summary (Phase 4)

- **Total tests written (Phase 4)**: **0** — see the declared deviation. No test was invented.
- **Total tests passing**: `npm run test` → **27 suites / 319 passed / 2 skipped**, exit 0 (unchanged).
- **Layers used**: Static/runtime instruments (repo sweep, raster sampling, built-CSS inspection, package-manager output) — 0 new automated tests.
- **Approval tests** (refactoring): None — no refactoring task.
- **Pure functions created**: 0.

## Workload / PR Boundary (Phase 4)

- **Mode**: chained PR slice (`feature-branch-chain`, PR #4 of 4; branch `feat/rebrand-palette-landing` off the tracker `feat/rebrand-palette`).
- **Current work unit**: Landing assets + docs.
- **Boundary**: starts at the tracker tip and ends at a regenerated OG raster, three brand-token mark gradients, and a corrected `AGENTS.md` claim. Nothing after it (Phase 5) is started; task 4.5 stays out of scope.
- **Review budget impact**: authored diff **36 changed lines** (24 insertions + 12 deletions over 5 text files) plus the regenerated binary raster. Well inside the 400-line budget; SDD artifact bookkeeping is counted in the return envelope.

## Status (Phase 4)

**Phase 4 complete — 4/4** (`feat/rebrand-palette-landing`). `npm run test` unchanged at
27 suites / 319 passed / 2 skipped; `npm run check:contrast` 44 PASS / 0 FAIL, exit 0; landing
`npm run build` exit 0. Task 4.5 remains out of this change (BA-01). Phases 3 and 5 remain not
started.

**Next recommended**: `sdd-verify` for independent verification of Phase 4.

---

# Phase 5 — Final Verification (integration tree)

**Date**: 2026-09-17
**Branch**: `chore/rebrand-palette-final` (branched off the tracker `feat/rebrand-palette` at `99b0fca`; `feature-branch-chain`, final slice)
**Mode**: Strict TDD is active (`openspec/config.yaml` → `strict_tdd: true`). This slice contains one genuine failing-first assertion (5.6's CI-gate wiring) and declares honest deviations for the tasks where no non-tautological test exists. No test was invented.
**Artifact Store**: openspec (repo-local)

## Summary

This is the first tree on which the whole change exists at once, and it is green end to end. All four
builds pass; the suite is **27 suites / 322 passed / 2 skipped, exit 0** (319 + the 3 new gate-wiring
tests); `npm run check:contrast` reads **44 PASS / 0 FAIL** (Group A and Group B) with exit 0; the
indigo/cyan sweep is **zero hits in product source**; the two spec wording points are amended; and the
contrast harness is now a CI gate.

The one number worth reading twice is 5.3. The harness reports **4.52**, not the 4.51 the task text
and the harness's own header comment carry; the declared surface (`--color-bg`) decides, and the
elevated-surface counterfactual (4.19, a FAIL) was reproduced rather than inherited.

## Completed Tasks (5.1–5.6)

- [x] 5.1 Four builds green: `npm run build` exit 0; `npm run test` → 27/319/2 exit 0 (pre-spec-edit run); `npm run build-storybook` exit 0; landing `npm run build` exit 0. → TC-07
- [x] 5.2 Indigo/cyan sweep: zero hits in product source; the hex-literal exceptions are exactly `icon.spec.ts:13`/`:47` and `AGENTS.md:90`. → TC-07
- [x] 5.3 Margin recorded: `CC04-03 dark 4.52 need 4.5 PASS` on the declared surface `--color-bg`; `4.19 FAIL` on `--color-bg-elevated`; not rounded, not "fixed".
- [x] 5.4 BA-05: both renders retained (light + forced-dark), checksums in `evidence/ba-05.md`; **no visual capture made** and said so.
- [x] 5.5 Spec wording amended in `brand-palette` BP-04 and `contrast-conformance` CC-04 (the prompt's `token-consumption` attribution was wrong — see deviation D-5.2).
- [x] 5.6 Harness wired into CI as a real gate, backed by a RED→GREEN test.

## Files Changed (Phase 5)

| File | Action | What Was Done |
|------|--------|---------------|
| `.github/workflows/ci.yml` | Modified | New `contrast` job running `npm run check:contrast` (+20) |
| `scripts/check-contrast.spec.mjs` | Modified | `contrast gate wiring` describe block: 3 tests (+42/−1) |
| `openspec/changes/rebrand-palette/specs/brand-palette/spec.md` | Modified | BP-04 exception + scenario (+19/−1) |
| `openspec/changes/rebrand-palette/specs/contrast-conformance/spec.md` | Modified | CC-04 scope + 5.3 margin note (+27/−3) |
| `openspec/changes/rebrand-palette/tasks.md` | Modified | Phase 5 tasks marked with measured evidence (6/6) |
| `openspec/changes/rebrand-palette/evidence/ba-05.md` | Created | Retained BA-05 evidence record (renders, checksums, resolved tokens, stated limits) |
| `openspec/changes/rebrand-palette/apply-progress.md` | Modified | This merged Phase 5 section + Status |

The harness (`scripts/check-contrast.mjs`), `contrast-baseline-1.2.0.txt`, the product source, the
manifests and both lockfiles were **not** touched. `landing/dist/index.dark.html` is a generated
artifact inside a gitignored directory.

## Work Unit Evidence (Phase 5)

| Evidence | Value |
|----------|-------|
| Focused test command and exact result | `npx jest scripts/check-contrast.spec.mjs` → **RED `1 failed, 7 passed, 8 total`** (before the CI job: `contrast gate wiring › runs the harness as a gate`) → **GREEN `8 passed, 8 total`, exit 0** (after). |
| Runtime harness command/scenario and exact result | `npm run check:contrast` → Group A **PASS 44 / FAIL 0 / MISSING 0**, Group B **PASS 25 / FAIL 0**, `Result: PASS`, **exit 0**. CI YAML validated with a parser: `jobs = library, contrast, landing`; `contrast.name` is the string `"Contrast: check"`. |
| Rollback boundary | `.github/workflows/ci.yml` (delete the `contrast` job) and the `contrast gate wiring` block in `scripts/check-contrast.spec.mjs` (delete it). Reverting both restores the pre-slice state; the specs, `tasks.md` and `evidence/` are change bookkeeping that do not affect runtime. |

## TDD Cycle Evidence (Phase 5)

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 5.6 (CI gate wiring) | `scripts/check-contrast.spec.mjs` | Integration (the workflow file is read as an artifact) | `npm run test` green (27/319/2) before the edit | **Written first, observed failing:** `npx jest scripts/check-contrast.spec.mjs` → `1 failed, 7 passed, 8 total`, the failure being `contrast gate wiring › runs the harness as a gate` — no `contrast:` job existed | `npx jest scripts/check-contrast.spec.mjs` → **`8 passed, 8 total`**, exit 0, after the job landed | 3 assertions over 3 artifacts: the gate's presence, the two existing jobs' survival, and the unquoted-`name`-with-`: ` defect class | Clean — one `workflowText()` reader and one pure `unquotedNameWithColon()` helper |
| 5.1, 5.2, 5.4 | none — declared deviation | Runtime/static (builds, sweep, rendered artifact) | n/a (verification tasks) | Real RED is what each check would catch: a failing build, a surviving indigo/cyan literal, a missing render | All observed green/zero as recorded above | ➖ | ➖ |
| 5.3, 5.5 | none — declared deviation | Measurement + document wording | n/a | 5.3's RED is the counterfactual that fails (4.19) and the discrepancy the task carried; 5.5's is the spec text as it stood (a reading that collapses three button states, and a scenario that contradicts CP-05/CP-06) | 5.3 recorded from the harness; 5.5 amended and re-read | ➖ | ➖ |

## Test Summary (Phase 5)

- **Total tests written (Phase 5)**: **3** (one `describe` block, `contrast gate wiring`), all in `scripts/check-contrast.spec.mjs`.
- **Total tests passing**: `npm run test` → **27 suites / 322 passed / 2 skipped, exit 0** (was 27 / 319 / 2).
- **Layers used**: Integration (3 new — the CI workflow is asserted as a readable artifact); runtime acceptance (the harness run, unchanged).
- **Approval tests / Pure functions created**: 1 pure helper (`unquotedNameWithColon`), 1 reader (`workflowText`).

## Deviations (Phase 5)

**D-5.1 — Strict TDD deviation declared for 5.1/5.2/5.3/5.4/5.5.** These tasks are verification, measurement and document wording. No unit under test exists that a Jest run could drive without re-encoding the very literal being checked (a tautology), so no test was written. The strongest honest instruments were used instead: the four real builds, the repo sweep, the harness output, the rendered artifacts with checksums, and a same-math counterfactual measurement. Stated, not silently dropped. Triangulation is explicitly skipped for these tasks under the module's structural criterion: a build exits 0 or it does not, and a sweep is empty or it is not — there is no branching logic for a second case to force out.

**D-5.2 — The prompt's spec-file attribution is wrong, and the amendments went where the requirements live.** The launch prompt said both 5.5 wording points belong in `token-consumption/spec.md`. Neither does: (a) light `--color-error-active` is BP-04 in `brand-palette/spec.md`; (b) CC-04 scenario 2 is in `contrast-conformance/spec.md`. `token-consumption/spec.md` owns TC-01…TC-07 and contains no error-active or CC-04 text, so writing either there would have added unrelated requirements to the wrong capability. Both landed in the owning specs; `token-consumption/spec.md` is unchanged.

**D-5.3 — The 5.3 margin is 0.02, not 0.01, and the recorded 4.51 does not reproduce.** The harness prints `CC04-03 dark 4.52 need 4.5 PASS`. The task text and the harness header comment both carry 4.51; per the slice's instruction the measured value is reported as measured and neither figure is rounded. The task's elevated-surface figure is confirmed exactly (4.19 FAIL).

**D-5.4 — The CI-gate test asserts the workflow as text, not via a YAML parser.** `js-yaml` is present in `node_modules` but is **not** a declared dependency of this package, so a committed test may not rely on it. The test therefore asserts the gate's presence, the existing jobs' survival and the exact quoting defect class with text/regex; parseability itself was validated separately with the parser (one-off, reported) and remains a CI responsibility.

## Issues Found (Phase 5)

1. **The task text's 4.51 is off by 0.01 from the artifact it describes.** `CC04-03 dark` measures 4.52; the same stale 4.51 sits in `scripts/check-contrast.mjs`'s header comment (lines 27–30). The harness must not be edited, so the correction is recorded in the spec and here. A verifier re-reading the header will meet the same 0.01 gap.
2. **The design's CC04-03 figures mix surfaces.** `design.md:148` records "5.54 light / 4.51 dark". 5.54 is the `--color-bg-elevated` light reading; the declared-`--color-bg` light reading is 5.31, and its dark reading is 4.52. No single surface yields the design's pair.
3. **`landing/dist/` is gitignored**, so the two BA-05 renders are retained on disk but are not part of the review diff. The durable record is `evidence/ba-05.md` plus the checksums; the renders are regenerable with `npm run build`.
4. **Phase 3's 3.3 remains 2/3** (the interactive Storybook toolbar toggle is owed to a human). Phase 5 does not and cannot close it: `build-storybook` is proven, the toggle needs a manual run.

## Workload / PR Boundary (Phase 5)

- **Mode**: chained PR slice (`feature-branch-chain`, final slice). Branch `chore/rebrand-palette-final` off the tracker `feat/rebrand-palette` at `99b0fca`.
- **Current work unit**: final verification + spec wording + CI gate.
- **Boundary**: starts at the integrated tree (Phases 1–4 merged) and ends at a green four-build matrix, a gated contrast harness, two amended specs and the retained BA-05 evidence. Nothing else is touched; no product source is modified.
- **Review budget impact**: authored diff **125 changed lines** across 5 tracked text files (114 insertions / 11 deletions) + `evidence/ba-05.md` (48 lines) + this bookkeeping section. Total with bookkeeping is reported in the return envelope; it is inside the 400-line budget.

## Status (Phase 5)

**Phase 5 complete — 6/6.** All four builds green; suite 27 suites / 322 passed / 2 skipped; harness 44 PASS / 0 FAIL exit 0; indigo/cyan sweep zero in product source; specs amended; contrast gate in CI with a RED→GREEN test. The whole change is now green on one tree for the first time. Phase 3's 3.3 toggle remains owed to the maintainer.

**Next recommended**: `sdd-verify` for independent verification of the whole change.
