# logo-fidelity — Option A primary + real favicon

## Goal

Make the design system faithful to `logo.jpeg`: `--color-primary` becomes the logo's own mark
tone (Option A, user-approved), `--color-error` stays untouched fire red so primary and danger
stop competing (measured today: 12° hue / 3 lightness points apart), and the landing ships a
real Bursit favicon instead of Astro's stock icon.

## Decisions (settled with the user)

- **Option A approved**: light primary anchors to the mark `#835a60` (already declared as
  `$brand-bright`), dark primary anchors deeper/more saturated than today. Separation from
  error is won on **saturation/chroma** (mark is muted 43-45% S, error is 83% S fire), not on
  hue — the logo hue (~348°) is fixed and error must stay standard red.
- **Logo does not change.** Narrative settled: the converging shards = the bursitis/burst
  origin point; mark color reads as a bruise. Palette follows logo, never the reverse.
- **Error/danger color unchanged** (`#dc2626` / `#f87171`). Danger-icon is a separate
  follow-up, not in this feature.
- **Palette changes ship as a breaking tokens release** (repo precedent: visually breaking =
  major bump → `feat!:` → release-please). Publish gate blocks adoption, same as 2.0.0.

## Known risks / landmines (from prior sessions)

- Dark-mode Option A as sampled is **weak on paper**: dark primary `#d77588` vs dark error
  `#f87171` is still 12° hue, S46 vs S54, L69 vs L71. Task 2 must resolve this with
  measurements before writing SCSS — candidates: desaturate dark primary further (chroma
  gap), or widen lightness. Keep error fixed.
- The contrast harness keys pairs by **token name**; changing values re-measures everything.
  Any pair that flips RED must be justified or the value adjusted — do not edit thresholds to
  pass.
- `manager.ts` literals must be re-synced (8 primary literals: light + dark blocks).
- OG card `PALETTE.primary` literal + regenerated `og-image.png` must follow dark primary.
- Windows CRLF: repo files are CRLF; scripts written with `\n` fail silently.
- Landing has **no test runner**; root Jest collects `**/scripts/**/*.spec.mjs` only.

## Non-goals

- No theme-switching implementation yet — task 8 is an exploratory test the user requested
  for AFTER this feature ("si los usuarios pueden usar otro theme").
- No danger-icon, no logo vector redesign beyond favicon needs.

## Tasks

- [x] **1. Author the real favicon (inline, design judgment).** Replace
  `landing/public/favicon.svg` (currently Astro's stock logo) with a Bursit burst: simplified
  variant — 5-7 main shards, thicker, readable at 16px. Regenerate `landing/public/favicon.ico`
  as a real multi-size ICO (today it is a misnamed 32×32 PNG). Mark color must read on light
  browser chrome too (`#835a60` on white = 5.59:1 ✓). Verify by rendering 16/32/64px.
  **Done**: `landing/scripts/generate-favicon.mjs` (delegated writer per ODD multi-file rule);
  TDD RED 6/1 → GREEN **7/7**; ICO header `00 00 01 00`, 3 PNG entries 16/32/48 (465/912/1252
  bytes, file 2683 total, offsets exact); SVG 850 bytes, fills `#835a60` + dark `#e8a1af` media
  query; visual check 16/32/64px on light AND dark chrome + ICO 16px payload extracted and
  eyeballed — burst reads at 16px; idempotent (two runs, identical bytes).
- [x] **2. Derive Option A ramps with measurements (inline).** Light: anchor 500-step at
  `#835a60`, derive hover/active darker steps, subtle tint, contrast, alphas, focus-ring and
  glow. Dark: pick the primary base that maximizes perceptual distance from fixed error
  `#f87171` while staying logo-true; derive its hover/active (dark pattern: hover goes
  lighter). Measure: contrast pairs (≥4.5 text, ≥3 UI) AND primary-vs-error separation must be
  clearly better than today's 12°/S45-vs-83-light baseline. Record numbers here.
  **Measured 2026-09-23 (CIEDE2000 + WCAG scripts in Temp/, visual sample opened at
  `Temp/dark-candidates/index.html`):**
  - **LIGHT settled**: 500 `#835a60` (on-bg 5.59, white-on 5.84, dE vs error **22.1** vs today's
    14.2), hover 600 `#714e53` (6.89/7.20), active 700 `#5f4145` (8.63/9.02), subtle `#fbf7f7`,
    focus/glow `rgba(#835a60,.7)` = **3.02** on bg (⚠ margin 0.02 — candidate `.75` alpha for
    headroom), CP-05 primary-on-alpha-8 = 5.02. All ≥ thresholds.
  - **The doc's recorded dark direction ("deeper/more saturated", sample `#d77588`) FAILS the
    harness**: CP-05 = 4.33 < 4.5, and it is the WORST on separation (dE2000 **9.7** vs today's
    14.6). The viable deep end at full chroma is `#de788c` (H348 HSVs46, first passes CP-05
    4.55) but it measures dE **9.2** — closer to error than today. Deep+saturated is off the
    table by measurement, not by taste.
  - **Dark finalists (all pairs PASS incl. hover/active; error `#f87171` H0 HSVs54 HSLl71):**
    - A `#e8a1af` (today, control): dE 14.6, sGap 24, lGap 6, ladder `#f2c4ce`/`#f8e2e7`.
    - B `#eba9b9` (chroma parity HSVs28 V92): dE 16.7, sGap 26, ladder `#f5bfcc`/`#fdd7e0`.
    - **C `#ebb2bd` (recommended: logo hue 348 exact, HSVs24 V92): dE 18.0, sGap 30, lGap 9,
      CP-01 8.25 / CP-05 6.97 / CP-15 5.80, ladder `#f5c8d1`/`#fde0e6`.**
    - D `#de788c` (deep viable): dE 9.2, CP-05 4.55 — worst separation, rejected.
  - Raw dE maxima live at V100/L91 pastels (dE 24.3) and V96 (18.8) but they COLLAPSE the
    hover/active ladder (clamped at V100, base==hover==active) — band V≤92 chosen to keep
    state headroom; ladder derives today's pattern (lighten + desaturate, s-6/s-13, v+4/v+7).
  - Sweep constraint recap: dark pairs = CP-01 primary→bg ≥4.5, CP-04 ink `#22282e`→primary
    ≥4.5 (primary-contrast is `$neutral-950` in dark), CP-05 primary→its α8 over bg ≥4.5,
    CP-15/16 `rgba(primary,.8)`→bg ≥3.
  - **DECIDED (user picked C, 2026-09-23)**: dark base `#ebb2bd`, hover `#f5c8d1`, active
    `#fde0e6`, subtle `rgba(#ebb2bd,.15)`, focus/glow `rgba(#ebb2bd,.8)` (CP-15 5.80).
- [x] **3. Apply ramp to `bursit-ui-tokens` (inline, sibling clone — outside delegated-writer
  topology, hence inline).** `src/_tokens.scss`: new `$primary-*` ramp vars derived from
  `$brand-bright` (light 50/500/600/700 + dark 100/200/300; only consumed steps, no invented
  400), then `--color-primary*` blocks (light ~L96-104, dark ~L370-378), `--color-focus-ring`
  (light+dark), `--shadow-glow-primary` (light+dark). Wine scale keeps shadows (`$wine-950`)
  and dark brand-mark facets (`$wine-300/400` — must stay: favicon dark variant is `#e8a1af`);
  fix the stale `// ← primary base` marker on `$wine-500`. **Scope amended 2026-09-23**: also
  update stale primary literals in `README.md` (rows 99-102, 173-175, 204, 307),
  `docs/colors.md` (swatches 14/28/35), `docs/theming.md` (row 65 light+dark) — same PR, stale
  docs = defect. Leave `$brand-*`, error, secondary, neutrals untouched. Then
  `npm run build && npm run validate && npm run lint:css` green (delegated to gentle-ai-verify).
  **Verified 2026-09-23**: build/validate/lint all exit 0; built `index.css` carries the new
  literals (light `#835a60`, dark `--color-primary: #ebb2bd` + hover/active), `#ba3b54` count
  = 0, `--color-error` untouched (`#dc2626`/`#f87171`); `$wine-950/300/400` refs intact in
  source (shadows + dark brand-mark facets), focus/glow both modes on `$primary-*`; dirty set
  exactly `src/_tokens.scss`, `README.md`, `docs/colors.md`, `docs/theming.md` (`index.css`
  gitignored). Gaps closed inline (1-file read-only greps).
- [ ] **4. Deliver tokens PR + publish gate (user gates merges).** Branch from
  `origin/master`, `feat(tokens)!:` commit so release-please cuts the major. PR → user merges →
  release PR → user merges → npm publish. Gate: `npm view bursit-ui-tokens@<new> version`
  resolves. **Blocked on user for merges.**
  **Delivered 2026-09-23**: branch `feat/primary-logo-ramp`, commit `32f635f`
  `feat(tokens)!:` (BREAKING CHANGE footer, 4 files, +50/-36), **PR #18** opened
  (https://github.com/gustavoPetruzzi/bursit-ui-tokens/pull/18). RDD: user decided OFF.
  **#18 MERGED by user 2026-09-23 18:11Z** → `f16fb33` on master; release-please opened
  **PR #19 `chore(master): release 3.0.0`** (open). **Pending (user)**: merge #19 → npm
  publish → I run the publish gate `npm view bursit-ui-tokens@3.0.0 version`.
- [x] **5. Propagate to `bursit-angular` (delegate writer; surfaces: `package.json`,
  `landing/package.json`, `projects/bursit-angular/package.json`, both lockfiles,
  `projects/bursit-angular/.storybook/manager.ts`, `landing/scripts/generate-og-image.mjs`).**
  Adopt `^<new>` in 3 manifests + 2 lockfiles (registry `^`, never `file:`), re-sync the 8
  manager literals, update OG `PALETTE.primary`, regenerate `og-image.png`, update
  `AGENTS.md:23` version pin if it states one.
  **DONE 2026-09-23 (worker mueihxtv-3-9t2t)**: 3 manifests → `^3.0.0`, both lockfiles
  regenerated (`npm install --package-lock-only`), root node_modules = 3.0.0; manager.ts 8
  primary literals re-synced (light `#835A60` + `rgba(131,90,96,.15)`, dark `#EBB2BD` +
  `rgba(235,178,189,.15)`, lines 20/22/23/24 + 51/53/54/55), stale greps `BA3B54`/`^2.0.0`
  = 0; header comment version ref bumped (comment-only deviation, kept — honest); OG
  `PALETTE.primary: '#ebb2bd'` + og-image.png regenerated (sha 4d82a65b→2df65139);
  AGENTS.md:23 pin → `^3.0.0`. 9 surfaces dirty + pre-existing odd doc, nothing staged.
  Caveat: `landing/node_modules` still extracts 2.0.0 → task 6 installs plain `npm install`
  in `landing/` first. RDD: covered by user's keep-off disposition (no review invoked).
- [x] **6. Full verification (delegate `gentle-ai-verify`).** `npm run test` (28 suites
  baseline incl. favicon suite), `npm run check:contrast` (44/0 — NOW against installed
  3.0.0), library build, storybook build, landing build,
  og-image regen. Pixel-compare og-image rail if primary dark moved. Report every number.
  **DONE 2026-09-23 (verify muej9gt4-4-tle9 + inline blocker fix)**: test **28/28 suites,
  329 passed / 2 skipped** (322→329 = favicon suite +7, `--listTests` confirms collection);
  **check:contrast Group A 44 PASS / 0 FAIL, Group B 25/0** against installed 3.0.0 (CP-01
  5.59/8.25, CP-15/16/17 3.02 ≥3); `npm run build` 0; `build-storybook` 0; landing build 0.
  Root CSS: `BA3B54` = 0, `ebb2bd` = 1, `835a60` = 1. **Blocker fixed inline**: landing/
  node_modules had stale-extracted 2.0.0 (npm "up to date" vs hidden lock) → rm + reinstall →
  landing tokens = 3.0.0 (`ebb2bd` 1 / stale 0), rebuilt landing **exit 0 against 3.0.0**,
  dist CSS carries `835a60` (1) and zero `ba3b54`.
- [ ] **7. Deliver `bursit-angular` PR (issue first).** Repo convention: issue with
  `status:approved`, branch `feat/...`, PR `Closes #N`, `type:feature` label, CI green before
  merge. Commit identity recorded in this file as evidence.
- [ ] **8. Theme-usage exploratory test (read-only, user's follow-up).** Investigate whether
  landing/library users can switch theme today (known: landing has NO theme script,
  no `[bursit-theme="light"]` escape hatch) and report options. No implementation without a
  new decision.

## Evidence log

- Baseline measured 2026-09-22: light primary-vs-error 12° hue, S68-vs-83, L48-vs-51;
  `#835a60` on `#f9fafb` = 5.59:1, white-on-`#835a60` = 5.84:1; dark `#d77588` on `#22282e` =
  4.81:1; favicon.ico = 32×32 PNG magic bytes; favicon.svg = Astro stock; `origin/master`
  = `8c8b0ec` (contains #48 + #49).
- Task 1 committed: `64d34d2` on `feat/landing-favicon` (work-unit 1: spec + generator + svg + ico
  + feature doc; 3 dirty openspec files excluded).
- RDD review CLOSED as not-applicable (2026-09-23): ROOT CAUSE FOUND — `rdd_disabled`.
  The 6 START attempts returned `candidate-view-invalid` summaries, but running the exact
  provider-issued start command verbatim surfaced the real pre_native error: receipt-driven
  development is OFF (decided by default; global/clone-local unset). `gentle-ai review mode
  status` confirms `off (decided by default)`. USER DECISION: keep RDD off (his manual commit
  gate stays the flow); switch never touched. Not a bridge bug, not a version mismatch
  (CLI 2.5.0→2.9.1 upgrade ruled out as cause along the way); authority was valid & empty
  throughout, nothing to recover, no consent ever owed.
- Task 1 closed 2026-09-23: spec 7/7 (`npx jest landing/scripts/generate-favicon.spec.mjs`);
  ICO `xxd -l 16` = `0000 0100 0300 ...`; entries 16(offset 54)/32(519)/48(1431) PNG magic
  verified; visual previews at `Temp/favicon-preview.png` + `Temp/ico-16.png`.
