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
- [x] 1.7 **Close the Strict TDD gap for the harness — open, CRITICAL 2 in `verify-report.md`.** Phase 1 shipped no spec-derived RED test: `jest.config.js` sets no `testMatch`, so Jest's default pattern (`[jt]s?(x)`) never collects a `*.spec.mjs`, and the harness's `--self-test` asserts constants the harness itself chose — that is calibration, not RED. **Chosen remediation:** widen Jest's `testMatch` in `jest.config.js` to also match `**/?(*.)+(spec|test).mjs`, add `scripts/check-contrast.spec.mjs`, and run the suite with `NODE_OPTIONS=--experimental-vm-modules` (Jest treats `.mjs` as ESM, and the harness already depends on `import.meta.url`). The alternative — a `.spec.ts` that imports the `.mjs` — needs `allowJs` in `tsconfig.spec.json` and fights the harness's `import.meta` guard once ts-jest emits CJS, so it is not adopted. The test MUST assert harness behaviour (44-line count, per-ID reporting, `MISSING` for an unknown token), not re-assert the harness's own chosen constants. Until 1.7 lands, this obligation is open and MUST NOT be reported complete. **Landed 2026-09-16.** `scripts/check-contrast.spec.mjs` (5 tests) is collected and run by the default suite: `npm run test` reports **27 suites / 319 passed / 2 skipped, exit 0** (was 26 / 314). The harness is unchanged (`sha256:bd2de718…d7fef2` LF-normalised) and its output is line-for-line identical to `contrast-baseline-1.2.0.txt` (83 stdout lines, 44 Group A, 0 differences). Two premises of the remediation above were **refuted by measurement**: (a) `@angular-builders/jest` injects its own project-scoped `testMatch` (`<projectRoot>/**/*(*.)@(spec|test).[tj]s?(x)`), so the widening was required and had to go in `jest.config.js` (that file wins the builder's `lodash.mergeWith`) even though bare Jest 30 already collects `.mjs`; (b) no `NODE_OPTIONS` / `--experimental-vm-modules` was needed — jest-preset-angular transforms the `.mjs` spec as a regular module. The pattern is scoped to `**/scripts/**/*.spec.mjs` rather than the general `**/?(*.)+(spec|test).mjs`, so no file outside the library project and `scripts/` is swept in. Evidence: `apply-progress.md`, section "Task 1.7".

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

- [x] 3.1 `projects/bursit-angular/.storybook/manager.ts:2` — import `create`; build `bursitLight`/`bursitDark` per TC-05; pass to `setConfig`; keep `isDark`/`globalsUpdated`/`matchMedia` → TC-05. **Landed 2026-09-17.** `create` replaces the `themes` import; the built manager bundle carries both objects (`base:"light"` / `base:"dark"`) and `setConfig({theme:o?p:c})`; `themes.light`/`themes.dark` source refs = **0**. **AMENDED 2026-09-17 (`fix/rebrand-palette-chrome-tokens`) — this box was checked on an INCOMPLETE implementation, recorded honestly rather than left as it stood.** The first pass set only **9** vars per theme (8 colours + `base`). The remaining **15** — `appHoverBg`, `appPreviewBg`, `appBorderRadius`, `textInverseColor`, `barTextColor`, `barHoverColor`, `barSelectedColor`, `barBg`, `buttonBg`, `buttonBorder`, `booleanBg`, `booleanSelectedBg`, `inputBg`, `inputTextColor`, `inputBorderRadius` — silently inherited `themes.light`/`themes.dark`, so the chrome carried Storybook's stock palette (`barBg` `#FFFFFF`/`#222325`, `barHoverColor` `#005CC7`/`#70B3FF`, `appHoverBg` `#DBECFF`, `textInverseColor` `#FFFFFF`/`#1B1C1D`, and the four the earlier enumeration missed: `buttonBg`, `buttonBorder`, `booleanBg`, `booleanSelectedBg`). `create()`'s `barSelectedColor: vars.barSelectedColor || inherit.colorSecondary` also resolved the selected accent to `colorSecondary` (`#3A6B9C`/`#7BA3CC`) instead of the brand primary. The prior check proved only that brand hexes were **present**, never that stock colours were **absent** — which is why the defect survived. **Corrected:** all **21** colour vars plus both radii are now set explicitly, every one copied from the installed package's light/dark layers and named to its token; the built-artifact audit traces all 21 + 2 to shipped tokens (0 untraceable). See `apply-progress.md`, "Correction — TC-05 Storybook chrome".
- [x] 3.2 `projects/bursit-angular/src/lib/forms/checkbox/checkbox.scss:31–34` — add `outline: var(--border-width-medium) solid var(--color-focus-ring); outline-offset: var(--space-xs);` → `--color-focus-ring` gains its first consumer. **Landed 2026-09-17.** `outline: none` removed; source consumers of `var(--color-focus-ring)` **0 → 1**; `npm run check:contrast` CC-06 stays 3.12 light / 5.14 dark PASS.
- [x] 3.3 `npm run build-storybook`; toggle the toolbar → chrome tracks mode; TC-06. **Build half PROVEN 2026-09-17**: `build-storybook` exit 0, both themes present and reachable in the built bundle. **Interactive half OBSERVED by the maintainer 2026-09-17, on the tracker preview in a browser**: the theme toolbar moves the mode `system → light → dark`. The maintainer's OS is in light mode, so `system` and the explicit `light` selection resolve to the *same* `bursitLight` theme and therefore produce **no visual change** — that no-op is expected, not a failure — while `dark` visibly applies `bursitDark`. The maintainer confirmed the chrome follows the mode. **Requirement note:** the observed scenario is TC-05's "Chrome tracks the mode"; the task text's `→ TC-06` is a mis-attribution (TC-06 is the no-local-override rule, also satisfied — the correction adds **0** local `:root` declarations).

## Phase 4: Landing Assets + Docs

- [x] 4.1 `landing/scripts/generate-og-image.mjs:25–33` — re-copy all 7 `PALETTE` literals to the dark register; make `:20–23` true; fix the stale "indigo-to-cyan" comment at `:98` → BA-04. **All 7 re-copied from the installed `node_modules/bursit-ui-tokens/index.css` `[bursit-theme=dark], .dark` layer (block `:161–252`):** `surface` `#272e35` ← `--color-bg-elevated` (`:222`), `text` `#f9fafb` ← `--color-text` (`:227`), `textMuted` `#9aa8b6` ← `--color-text-muted` (`:228`), `textSubtle` `#9aa8b6` ← `--color-text-subtle` (`:229`), `border` `#313b44` ← `--color-border` (`:231`), `primary` `#e8a1af` ← `--color-primary` (`:163`), `secondary` `#7ba3cc` ← `--color-secondary` (`:174`). The `:20–23` claim is now true for all seven (the two previously unannotated comments now read `(dark)` too). `:98` reworded to "the same primary-to-secondary axis as the card's wordmark mark, vertical". The `#brand`/`#rail`/glow stops all read `PALETTE`, so they stop being indigo→cyan with no structure change (design D5).
- [x] 4.2 Regenerate `landing/public/og-image.png` (landing `npm run og-image`) → 1200×630 self-check; raster matches script. **Measured: `og-image.png written — 1200x630`, exit 0; Calibri resolved (no font-backend error).** The tracked raster moved `155594 -> 170773 bytes` (committed blob `c6142e93…`), and pixel sampling proves the palette changed: rail top `#6267f1`→`#e7a1af`, rail bottom `#07b5d4`→`#7ca3cc`, surface `#0f172a`→`#272e35`.
- [x] 4.3 `landing/src/components/Nav.astro:108`, `landing/src/components/Footer.astro:87`, `landing/src/styles/global.scss:407` — replace the primary→secondary gradient with `#835A60 → #4E383E` via brand tokens → BA-03. **All three now `linear-gradient(135deg, var(--color-brand-mark-bright), var(--color-brand-mark-deep))`.** Light resolves `#835a60 → #4e383e` (BA-03's exact hexes); dark resolves `#e8a1af → #d77588`. The built `landing/dist/_astro/index.*.css` carries that gradient exactly 3×, and the landing loads the tokens through `global.scss:14 @use 'bursit-ui-tokens' as *`, so both register declarations reach the output.
- [x] 4.4 `AGENTS.md:23` — correct the `file:` claim → TC-03. **The line now reads "external design token package, consumed from the npm registry as `^2.0.0`".** The three manifests all declare `^2.0.0` and both lockfiles resolve the registry tarball; a `file:` sweep over the three manifests returns 0.
- ~~4.5~~ **MOVED OUT OF THIS CHANGE (BA-01).** `landing/public/logo-mark.svg`, `logo-mark-reverse.svg`, `favicon.svg`, `favicon.ico` and the OG card mark geometry all require a vector master; only raster `logo.jpeg` exists. Split into a separate change by human decision after the workload forecast. Outside this change's scope, and MUST NOT be reported complete here.

## Phase 5: Verification

- [x] 5.1 `npm run build`, `npm run test`, `npm run build-storybook`, landing `npm run build` → all four pass (TC-07). **MEASURED 2026-09-17 on the integrated tree:** `npm run build` → exit 0 (schematics tsc + ng-packagr); `npm run test` → **27 suites / 319 passed / 2 skipped, exit 0** (the same command reads **322 passed** once 5.6's gate-wiring tests land); `npm run build-storybook` → exit 0 ("Storybook build completed successfully"); landing `npm run build` → exit 0 (1 page built, 838 ms).
- [x] 5.2 Indigo/cyan hex sweep → zero hits; only `icon.spec.ts:13`/`:47`, `AGENTS.md:90`. **MEASURED:** a repo-wide `git grep -inE "indigo|cyan|#6366f1|#06b6d4|#155e75|#818cf8|#22d3ee|#0ea5e9|#38bdf8|#0891b2|#0e7490|#4f46e5|#4338ca"` returns **zero hits in product source** — every hit is prose inside `openspec/changes/rebrand-palette/*.md` (the change's own historical record). A hex-literal sweep `git grep -nE "#[0-9a-fA-F]{3,8}" -- projects/bursit-angular/src AGENTS.md` returns exactly three: `icon.spec.ts:13` and `:47` (the arbitrary-colour passthrough fixture) and `AGENTS.md:90` (the "do not do this" example). Both expected files confirmed; nothing else remains.
- [x] 5.3 **MEASURED — the declared surface decides, and the harness reports 4.52, not 4.51.** Dark `--color-error-text` `#F87171` on dark `--color-error-alpha-10` (`rgba(248,113,113,0.12)`) is measured by `CC04-03`, whose declared surface is `--color-bg` (the row carries no `surface` override, so it inherits the harness's `DEFAULT_SURFACE`). The harness prints `CC04-03 dark 4.52 need 4.5 PASS` — a **0.02** margin over the 4.5 floor, **not 0.01**. Over `--color-bg-elevated` `#272E35` the same pairing measures **4.19 FAIL**, reproduced with the same harness maths under a surface override. The task text's 4.51 (also carried in the harness header comment) and the design's 5.54 light do not match any single declared surface. **Not rounded, and the colour was not "fixed".** Written record: `specs/contrast-conformance/spec.md` (CC-04 margin note) and `apply-progress.md` (5.3).
- [x] 5.4 BA-05 evidence: light render + dark render forced via `bursit-theme="dark"` on `<html>` (no theme script exists) → both retained. **PRODUCED, with a declared limit.** Retained at `landing/dist/index.html` (`<html lang="en">`, sha256 `01bffd2e…`) and `landing/dist/index.dark.html` (`<html bursit-theme="dark" lang="en">`, sha256 `3a7e1c90…`), differing only by that attribute; `landing/dist/` is gitignored. Premise re-verified: the built render has **0 `<script>` tags** and `bursit-theme` appears only in documentation copy, so no theme script exists; the built CSS carries `[bursit-theme=dark]` and the dark values, so forcing the attribute switches the cascade. Resolved per-mode values recorded in `evidence/ba-05.md`. **NOT captured: no screenshot and no visual judgement** — the run is headless, so BA-05's "show no unreadable text" is not claimed visually; the retired-colour half is covered by 5.2 and the readability half by the contrast harness. A visual confirmation is owed to a human reviewer.
- [x] 5.5 Spec wording amended: **(a)** light `--color-error-active` = `$red-800 #991B1B` recorded in `specs/brand-palette/spec.md` BP-04 as the single normative exception to the unlisted-token rule, with the `button.scss:125–129` collapse evidence and a new "three states stay distinct" scenario; the installed package ships light `--color-error-active: #991b1b`, so this records shipped behaviour. **(b)** `specs/contrast-conformance/spec.md` CC-04 scenario 2 scoped to pairings that **fail 4.5:1**, with an explicit note that the 22-pair set is unchanged. **Note:** the launch prompt placed both amendments in `token-consumption/spec.md`; neither point concerns TC-01…TC-07, so amending that file would have written unrelated requirements into it — both landed in the specs that own them.
- [x] 5.6 Contrast harness **CI gate added** (the maintainer overrode the earlier open question). `.github/workflows/ci.yml` gains a `contrast` job mirroring the library job (Checkout → Set up Node.js → `npm ci` → `npm run check:contrast`); the job name is single-quoted (`name: 'Contrast: check'`) to avoid the unquoted-`name`-`: `-as-nested-mapping defect this repo already shipped once, and the YAML was validated with a parser (`contrast.name` is the string `"Contrast: check"`, jobs `library`/`contrast`/`landing`). The two existing jobs are untouched. Backed by a real failing-first test: `scripts/check-contrast.spec.mjs` gains a `contrast gate wiring` block (RED `1 failed, 7 passed` before the job; GREEN `8 passed` after).
