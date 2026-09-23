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
- [ ] **2. Derive Option A ramps with measurements (inline).** Light: anchor 500-step at
  `#835a60`, derive hover/active darker steps, subtle tint, contrast, alphas, focus-ring and
  glow. Dark: pick the primary base that maximizes perceptual distance from fixed error
  `#f87171` while staying logo-true; derive its hover/active (dark pattern: hover goes
  lighter). Measure: contrast pairs (≥4.5 text, ≥3 UI) AND primary-vs-error separation must be
  clearly better than today's 12°/S45-vs-83-light baseline. Record numbers here.
- [ ] **3. Apply ramp to `bursit-ui-tokens` (inline, single file).** `src/_tokens.scss`:
  `--color-primary*` block (light ~L96-104, dark ~L370-378), `--color-focus-ring`,
  `--shadow-glow-primary`. Leave `$brand-*`, error, secondary, neutrals untouched. Then
  `npm run build && npm run validate && npm run lint:css` green.
- [ ] **4. Deliver tokens PR + publish gate (user gates merges).** Branch from
  `origin/master`, `feat(tokens)!:` commit so release-please cuts the major. PR → user merges →
  release PR → user merges → npm publish. Gate: `npm view bursit-ui-tokens@<new> version`
  resolves. **Blocked on user for merges.**
- [ ] **5. Propagate to `bursit-angular` (delegate writer; surfaces: `package.json`,
  `landing/package.json`, `projects/bursit-angular/package.json`, both lockfiles,
  `projects/bursit-angular/.storybook/manager.ts`, `landing/scripts/generate-og-image.mjs`).**
  Adopt `^<new>` in 3 manifests + 2 lockfiles (registry `^`, never `file:`), re-sync the 8
  manager literals, update OG `PALETTE.primary`, regenerate `og-image.png`, update
  `AGENTS.md:23` version pin if it states one.
- [ ] **6. Full verification (delegate `gentle-ai-verify`).** `npm run test` (27 suites/319
  baseline), `npm run check:contrast` (44/0), library build, storybook build, landing build,
  og-image regen. Pixel-compare og-image rail if primary dark moved. Report every number.
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
- Task 1 closed 2026-09-23: spec 7/7 (`npx jest landing/scripts/generate-favicon.spec.mjs`);
  ICO `xxd -l 16` = `0000 0100 0300 ...`; entries 16(offset 54)/32(519)/48(1431) PNG magic
  verified; visual previews at `Temp/favicon-preview.png` + `Temp/ico-16.png`.
