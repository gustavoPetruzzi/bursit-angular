# Apply Progress: rebrand-palette — Phase 1 (contrast harness)

**Change**: `rebrand-palette`
**Phase**: apply — **Phase 1 only** (`feat/rebrand-palette-harness`, chained PR #1)
**Mode**: Standard (see "Strict TDD deviation" below — this is a reported deviation, not a silent fallback)
**Artifact Store**: openspec (repo-local)
**Date**: 2026-09-15
**Branch**: `feat/rebrand-palette-harness` (targets the tracker branch `feat/rebrand-palette`)
**SDD attempt token**: `sha256:18105916fa20539acf91a0e3b43a18c44603615df57ff114982279c01079f3e2`

## Summary

Phase 1 is complete: 6/6 tasks. `scripts/check-contrast.mjs` is a zero-dependency Node
harness that reads the **installed** `node_modules/bursit-ui-tokens/index.css` and nothing
else, resolves `var()` chains transitively, composites `rgba()` values over a per-pair
declared surface, and reports the WCAG 2.x ratio for 22 pairs in both modes.

The 1.2.0 RED baseline is measured and retained at
`openspec/changes/rebrand-palette/contrast-baseline-1.2.0.txt`.

Phases 2–5 were **not** started: they are blocked on the external publish gate
(`npm view bursit-ui-tokens@2.0.0` must resolve).

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

## Status

**Phase 1: 6/6 tasks complete. Phases 2–5: 0/… — intentionally not started** (blocked on
the external publish gate `npm view bursit-ui-tokens@2.0.0`).

The slice is self-contained and verifiable on its own; nothing in it depends on the tokens
major. Two items need a decision before this slice is closed: the 485-line review overage
(section "Workload / PR Boundary") and the CP-13 spec correction (Issue 2).

**Next recommended**: `sdd-verify` for independent verification of Phase 1.
