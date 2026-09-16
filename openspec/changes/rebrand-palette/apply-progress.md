# Apply Progress: rebrand-palette — Phase 1 (contrast harness) + Phase 2 (adoption)

**Change**: `rebrand-palette`
**Phase**: apply — **Phase 1** (`feat/rebrand-palette-harness`, chained PR #1) **and Phase 2** (`feat/rebrand-palette-adopt-2`, chained PR #2)
**Mode**: Strict TDD is active (`openspec/config.yaml` → `strict_tdd: true`). Phase 1 reported a declared deviation from it (see "Strict TDD deviation" below). Phase 2 follows it as far as a dependency bump permits — see "TDD Cycle Evidence (Phase 2)".
**Artifact Store**: openspec (repo-local)
**Date**: Phase 1 2026-09-15 · Phase 2 2026-09-16
**Branch**: Phase 1 `feat/rebrand-palette-harness`; Phase 2 `feat/rebrand-palette-adopt-2` (both target the tracker branch `feat/rebrand-palette`; `feature-branch-chain`)
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

**Phase 1: 6/6 complete** (task 1.7 open, non-blocking). **Phase 2: 6/6 complete and verified.**
Phases 3–5: not started.

Phase 2's open follow-ups are both pre-existing and outside its scope: the Phase 1 task 1.7 spec gap
and the CP-13 spec correction (Phase 1, Issue 2). Phase 1's 485-line review overage still needs the
decision recorded in the Phase 1 section above.

**Next recommended**: `sdd-verify` for independent verification of Phase 2 (and re-verification of the
unchanged Phase 1 evidence).

---

Note: the Phase 1 sections above are preserved verbatim; only the title, the phase metadata block and
this tail were amended for the merge.
