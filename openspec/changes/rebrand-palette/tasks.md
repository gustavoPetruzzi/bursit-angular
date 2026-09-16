# Tasks: Rebrand Palette

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | This repo ~260–400 · external tokens PR ~600–900 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 harness → PR 2 adoption → PR 3 chrome+checkbox → PR 4 landing |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: Medium

Change as a whole is **large**; the substantive diff is the external tokens PR, sized separately.

**Resolved after the forecast (orchestrator + human):**

- **Delivery:** split into chained PRs. A `size:exception` was offered and declined.
- **Chain strategy:** `feature-branch-chain`. PR #1 targets the tracker branch; later children target the immediate previous PR branch so each review diff stays focused; only the tracker reaches `master`.
- **BA-01 (artwork) split out of this change.** There is no vector logo master, so the favicon, wordmark marks and OG card mark geometry cannot be built here. Task 4.5 is removed and those deliverables move to a separate change that lands with the artwork.
- **Slice 1 `size:exception` granted, scoped to that slice only.** `scripts/check-contrast.mjs` landed at 485 changed lines against the 400 budget (482 harness + 2/−1 in `package.json`; of the 482, 117 comment-only, 61 blank, 304 code — and 36 of those are the declared pair tables, which are the deliverable). The apply phase declined to self-approve it and rejected an honest split: separating the harness from its own pair tables yields a PR that satisfies no acceptance criterion alone, and produces two baselines where task 1.6 requires one. Granted for slice 1 only — it does not widen the budget for slices 2–4.

### Suggested Work Units

| Unit | PR | Focused test | Runtime harness | Rollback boundary |
|---|---|---|---|---|
| Harness + RED baseline | 1 | `npm run check:contrast` (non-zero) | run vs installed 1.2.0 | `scripts/check-contrast.mjs` + script entry |
| Adopt major | 2 | `npm run check:contrast` (22/22) | `npm run build`; `npm run test` | 2 manifests + 2 lockfiles |
| Chrome + outline | 3 | `npm run build-storybook` | `npm run storybook` toggle | `manager.ts`, `checkbox.scss` |
| Landing assets | 4 | landing `npm run og-image` | landing dev, light + dark | OG script/raster, 3 marks, `AGENTS.md` |

## External Prerequisites — OUTSIDE THIS SDD (not applyable; not checkboxes)

The palette this change consumes is produced, released and published by a **separate repository
and npm package**, as that repository's own change and its own PR. Nothing below is work to
execute in this change: this change only **waits on and consumes the published result**. No item
names a file or path in that repository's working copy; the only artifacts read from here are the
npm package coordinate and the package **installed** in this repo's own worktree
(`node_modules/bursit-ui-tokens/…`, read-only).

X1–X6 are therefore a dependency contract, not tasks: the dependent release is satisfied only when
**all** of the following acceptance conditions hold for the published `bursit-ui-tokens@2.0.0`.

| # | Required in the dependent release | Acceptance evidence |
|---|---|---|
| X1 | The new primitives and scales ship (`$wine-*`/`$steel-*`/`$blue-400…800`/`$red-800 #991B1B`; `$neutral-*` re-derived; `$indigo-*`/`$cyan-*` deleted) and the new semantic tokens are declared (`--color-border-control`, `--color-secondary-strong`, `--color-brand-*`) | design ramps; new tokens resolve in both modes |
| X2 | Light `:root` and `[bursit-theme=dark], .dark` carry the full semantic table | every row resolves |
| X3 | The six component tokens are repointed and the legacy literal is gone (including the button `#155E75` site and the badge/alert variant inks) | BP-06/07/08 hold; `#155E75` = 0 |
| X4 | The published package ships a regenerated `index.css`, is internally consistent (build, validation and CSS lint green), and has its token docs and README updated | green; the published artifact carries the new scales |
| X5 | It is released as a **breaking major**: `feat(tokens)!:` → release-please → `v2.0.0` | commit-derived major version |
| **X6** | **GATE — the published result is resolvable: `npm view bursit-ui-tokens@2.0.0` (read-only) returns metadata** | when it does not, Phases 2–5 stay blocked |

**Blocking scope.** X6 gates **Phases 2–5**. Phase 1 is deliberately **unblocked**: it records the
RED baseline by measuring the *installed* `bursit-ui-tokens@1.2.0` in `node_modules/` (read-only),
which needs no dependent release. X1–X5 are the dependent release's own obligations, planned and
runtime-accounted in that repository; they are restated here only as the contract this change waits
on and MUST NOT be executed or reported from this change.

## Phase 1: Contrast Harness (RED before GREEN)

- [x] 1.1 Create `scripts/check-contrast.mjs` parsing `node_modules/bursit-ui-tokens/index.css` (read-only): 21 `:root` blocks + dark block → both layers found.
- [x] 1.2 Resolve `var()` chains; composite `rgba()` over a **per-pair declared surface** → one surface edit moves one line.
- [x] 1.3 Print `CP-nn <mode> <ratio> need <threshold> PASS|FAIL` for the 18 spec IDs + 4 CC-04 badge pairs, both modes (44 lines), then exit non-zero; **never on first failure** (CC-03) → 44 lines emitted.
- [x] 1.4 Label Group B (BP-06/07/09, CC-05/06) separately → Group A is exactly 44 lines.
- [x] 1.5 Add `"check:contrast"` to `package.json` scripts → `npm run check:contrast` runs.
- [x] 1.6 Record the 1.2.0 RED baseline → output retained at `contrast-baseline-1.2.0.txt`. **The original prediction is REFUTED.** The plan predicted "22 fail in both modes"; that is arithmetically impossible against the artifact (it would require 44 FAIL and 0 PASS across the 44 Group A lines). **Measured against the installed 1.2.0:** 27 FAIL / 17 PASS across the 44 Group A lines; 21 of the 22 pairs fail in at least one mode; **6** fail in both — CP-02, CP-03, CP-15, CP-16, CP-17, CP-18. Group B: 21 FAIL / 4 PASS of 25 lines. Evidence: `contrast-baseline-1.2.0.txt` and `verify-report.md`.
- [ ] 1.7 **Close the Strict TDD gap for the harness — open, CRITICAL 2 in `verify-report.md`.** Phase 1 shipped no spec-derived RED test: `jest.config.js` sets no `testMatch`, so Jest's default pattern (`[jt]s?(x)`) never collects a `*.spec.mjs`, and the harness's `--self-test` asserts constants the harness itself chose — that is calibration, not RED. **Chosen remediation:** widen Jest's `testMatch` in `jest.config.js` to also match `**/?(*.)+(spec|test).mjs`, add `scripts/check-contrast.spec.mjs`, and run the suite with `NODE_OPTIONS=--experimental-vm-modules` (Jest treats `.mjs` as ESM, and the harness already depends on `import.meta.url`). The alternative — a `.spec.ts` that imports the `.mjs` — needs `allowJs` in `tsconfig.spec.json` and fights the harness's `import.meta` guard once ts-jest emits CJS, so it is not adopted. The test MUST assert harness behaviour (44-line count, per-ID reporting, `MISSING` for an unknown token), not re-assert the harness's own chosen constants. Until 1.7 lands, this obligation is open and MUST NOT be reported complete.

## Corrections applied during Phase 1

Four corrections were applied while Phase 1 was being built. They are recorded here because they were
originally raised only in the launch prompt, which cannot be audited; each entry names what changed,
the evidence that justifies it, and where it landed.

### COR-1 — Surfaces are declared per pair, not globally

- **Correction**: every contrast pair names its own background (its `surface`). The default is
  `--color-bg`; the choice is load-bearing, not cosmetic.
- **Evidence**: only CP-02 (`--color-bg-elevated`) and CP-03 (`--input-bg`) use a surface other than
  the default. With surfaces declared per pair, 15 of the 18 "Today" figures reproduce exactly, and
  CP-05 measures 3.87:1 and CP-07 2.01:1 on `--color-bg`, matching `contrast-baseline-1.2.0.txt`.
- **Landed in**: `scripts/check-contrast.mjs` `GROUP_A` `surface` field (task 1.2); `apply-progress.md`
  deviation #3. The design's blanket-surface claim was superseded.

### COR-2 — The four CC-04 badge pairs are labelled `CC04-01`…`CC04-04`

- **Correction**: the four `--badge-subtle-{success,warning,error,info}-color` pairs carry
  `CC04-01`…`CC04-04`, not `CP-19`…`CP-22`.
- **Evidence**: `specs/contrast-conformance/spec.md` CC-03 declares exactly 18 `CP-*` IDs
  (`CP-01`…`CP-18`); `CP-19`…`CP-22` appear in no spec. `CC-04` owns the four badge pairs, so the
  labels name their requirement.
- **Landed in**: `scripts/check-contrast.mjs` `GROUP_A` (`:98–101`), reported as `CC04-01`…`CC04-04`
  in the run output (task 1.4); `apply-progress.md` deviation #1; the design's invented
  `CP-19`…`CP-22` labels corrected in `design.md`.

### COR-3 — Every result line prints before the non-zero exit

- **Correction**: the harness prints all 44 Group A lines (plus Group B) and only then sets a
  non-zero exit code. It never aborts on the first failure.
- **Evidence**: CC-03 requires one result per ID with no aggregate; a first-failure abort can never
  emit 44 lines. The retained baseline proves 44/44 lines precede exit `1`
  (`contrast-baseline-1.2.0.txt`); the design's "exits non-zero on the first failure" was stale.
- **Landed in**: `scripts/check-contrast.mjs` (`:468–469`, single `stdout.write` then
  `process.exitCode`) (task 1.3); `apply-progress.md` deviation #2; `design.md` harness contract
  corrected.

### COR-4 — `badge.scss` sub-block is `:54–61`, not `:56–61`

- **Correction**: the affected sub-block in the tokens repo's `src/components/badge.scss` is
  `:54–61`.
- **Evidence**: the four `--badge-subtle-*-color` declarations sit at `:55`, `:57`, `:59`, `:61`,
  with their `-bg` partners at `:54`, `:56`, `:58`, `:60` (read from the installed
  `node_modules/bursit-ui-tokens/src/components/badge.scss`). `:56–61` omits the first `-bg` line and
  misstates the block.
- **Landed in**: `design.md` file-changes table; `tasks.md` X3 already recorded `:47,54–61`.

## Phase 2: Adoption (blocked on X6)

- [x] 2.1 Confirm `npm view bursit-ui-tokens@2.0.0` (read-only) resolves, else stop → TC-01. **Measured: `npm view bursit-ui-tokens@2.0.0 version` → `2.0.0`; gate OPEN.**
- [x] 2.2 `package.json:26` → `^2.0.0` → TC-02.
- [x] 2.3 `landing/package.json:21` → `^2.0.0` → ranges identical. **A third manifest not named by the plan was also bumped: `projects/bursit-angular/package.json:11` (see `apply-progress.md`, Phase 2 deviation D-2.1). All three declare `^2.0.0`.**
- [x] 2.4 Regenerate `package-lock.json` → registry URL at 2.0.0, no `file:`. **Measured: `changed 1 package`; resolved `https://registry.npmjs.org/bursit-ui-tokens/-/bursit-ui-tokens-2.0.0.tgz`; `file:` = 0.**
- [x] 2.5 Regenerate `landing/package-lock.json` → same. **Measured: `changed 1 package`; same registry URL at 2.0.0; `file:` = 0.**
- [x] 2.6 `npm run check:contrast` → 22/22 both modes → 44 PASS lines. **MEASURED AND CONFIRMED: Group A `PASS 44 | FAIL 0 | MISSING 0`, `pairs failing in every mode 0`; Group B `PASS 25 | FAIL 0`; `Result: PASS`; exit code 0. The predicted 44 PASS holds (against 1.2.0 the same harness measured 27 FAIL / 17 PASS).**

## Phase 3: Chrome + Checkbox Outline

- [ ] 3.1 `projects/bursit-angular/.storybook/manager.ts:2` — import `create`; build `bursitLight`/`bursitDark` per TC-05; pass to `setConfig`; keep `isDark`/`globalsUpdated`/`matchMedia` → TC-05.
- [ ] 3.2 `projects/bursit-angular/src/lib/forms/checkbox/checkbox.scss:31–34` — add `outline: var(--border-width-medium) solid var(--color-focus-ring); outline-offset: var(--space-xs);` → `--color-focus-ring` gains its first consumer.
- [ ] 3.3 `npm run build-storybook`; toggle the toolbar → chrome tracks mode; TC-06.

## Phase 4: Landing Assets + Docs

- [ ] 4.1 `landing/scripts/generate-og-image.mjs:25–33` — re-copy all 7 `PALETTE` literals to the dark register; make `:20–23` true; fix the stale "indigo-to-cyan" comment at `:98` → BA-04.
- [ ] 4.2 Regenerate `landing/public/og-image.png` (landing `npm run og-image`) → 1200×630 self-check; raster matches script.
- [ ] 4.3 `landing/src/components/Nav.astro:108`, `landing/src/components/Footer.astro:87`, `landing/src/styles/global.scss:407` — replace the primary→secondary gradient with `#835A60 → #4E383E` via brand tokens → BA-03.
- [ ] 4.4 `AGENTS.md:23` — correct the `file:` claim → TC-03.
- ~~4.5~~ **MOVED OUT OF THIS CHANGE (BA-01).** `landing/public/logo-mark.svg`, `logo-mark-reverse.svg`, `favicon.svg`, `favicon.ico` and the OG card mark geometry all require a vector master; only raster `logo.jpeg` exists. Split into a separate change by human decision after the workload forecast. Outside this change's scope, and MUST NOT be reported complete here.

## Phase 5: Verification

- [ ] 5.1 `npm run build`, `npm run test`, `npm run build-storybook`, landing `npm run build` → all four pass (TC-07).
- [ ] 5.2 Indigo/cyan hex sweep → zero hits; only `icon.spec.ts:13`/`:47`, `AGENTS.md:90`.
- [ ] 5.3 **0.01 margin:** dark `--color-error-text` `#F87171` on dark `--color-error-alpha-10` over `--color-bg` `#22282E` = **4.51:1** vs a 4.5 floor; over `--color-bg-elevated` **4.19:1 (FAIL)**. Record it; the declared surface decides. Do not round up.
- [ ] 5.4 BA-05 evidence: light render + dark render forced via `bursit-theme="dark"` on `<html>` (no theme script exists) → both retained.
- [ ] 5.5 Amend spec wording: (a) light `--color-error-active` = `$red-800 #991B1B`, since the literal `red-700` reading collapses a danger button's base/hover/active to `#B91C1C` (`node_modules/bursit-ui-tokens/src/components/button.scss:125–129`, read-only); (b) scope CC-04 scenario 2 to pairings that **fail 4.5:1** → 22-pair set unchanged.
- [ ] 5.6 `npm run check:contrast` stays **manual**, no CI gate → no workflow references it. **Open question.**
