# Exploration: rebrand-palette

Change: `rebrand-palette` · Store: openspec · Date: 2026-09-15
Status: exploration complete, awaiting human decisions (§9).

## 1. Current State

### 1.1 What exists today

The brand lives in `C:\Users\yusti\Desktop\programacion\bursit-ui-tokens` (`bursit-ui-tokens@1.2.0`,
published to the npm registry). `bursit-angular` consumes it as a **registry dependency**, not a
`file:` link:

- `package.json:26` → `"bursit-ui-tokens": "^1.2.0"`
- `landing/package.json:21` → `"bursit-ui-tokens": "^1.2.0"` (a second, independent range)
- `package-lock.json` resolves it to `https://registry.npmjs.org/bursit-ui-tokens/-/bursit-ui-tokens-1.2.0.tgz`

> `AGENTS.md` claims the sibling package is "consumed as file: dependency". That is **stale**. The
> lockfile proves registry resolution. Rebrand work must therefore go through a real publish.

Current identity: **indigo `#6366f1` + cyan `#06b6d4`**, cool blue-tinted neutrals, light mode
default, dark mode via `[bursit-theme="dark"], .dark`.

Structure of `bursit-ui-tokens/src/_tokens.scss` (491 lines):

| Region | Lines | Contents |
|---|---|---|
| Primitives | 15–71 | `$indigo-50…950` (11 steps), `$cyan-50…900` (9 steps), `$neutral-0…1000` (14 steps), `$green-*` (5), `$amber-*` (4), `$red-*` (4) |
| `:root` (light) | 77–331 | brand, secondary, neutrals, 4 semantics, surfaces, text, border, focus, typography, spacing, radii, shadows, motion, z-index |
| `[bursit-theme="dark"], .dark` | 340–477 | overrides only: brand, secondary, neutrals (inverted 0↔1000), semantics, surfaces, text, border, focus, shadows |
| `prefers-reduced-motion` | 483–491 | zeroes durations |

Suffix families carried by tokens: `-hover`, `-active`, `-subtle`, `-contrast`, `-alpha-8/10/15/20`,
`-text`. `src/index.scss` forwards `tokens`, all 19 `components/*.scss`, and `mixins`.
`package.json` `files: ["index.css", "src/"]` ships both the compiled `index.css` and the SCSS source.

### 1.2 The new logo (read at `logo.jpeg`)

Asymmetric **shard/starburst mark**: ~9 irregular triangular points radiating from a single apex,
flat faceted fills, no curves, no rounded corners, plus a faint construction seam through the
horizontal axis. There is **no wordmark** — the mark is the entire identity.

Sampled colours (as given; I re-verified them numerically):

| Element | Hex | HSL | Relative luminance | vs white |
|---|---|---|---|---|
| Field | `#22282E` | hsl(210, 15%, 16%) | 0.0205 | 14.88:1 |
| Mark, dark facets | `#4E383E` | hsl(344, 16%, 26%) | 0.0480 | 10.72:1 |
| Mark, light facets | `#835A60` | hsl(351, 19%, 43%) | 0.1298 | 5.84:1 |

**The single most important structural fact: the logo is monochromatic.** It is one hue
(rose/wine, ≈348°) rendered as a high-contrast mark on a desaturated cool slate field. The two mark
tones differ in *lightness*, not hue. The current cyan has no counterpart in the logo — see §4.

## 2. Affected Areas

### 2.1 `bursit-ui-tokens` — OUTSIDE this SDD's edit authority (prerequisite)

| File | Why affected |
|---|---|
| `src/_tokens.scss` | Full primitive + `:root` + dark rewrite. The bulk of the change. |
| `src/components/button.scss:69` | `--btn-secondary-hover-bg: #155E75` — the one hardcoded hex in the package (see §6) |
| `src/components/alert.scss:22–25,28–31,34–37,40–43` | `--alert-*-color` / `-border-color` / `-icon-color` consume the **500-level** token as text on a 10% tint → 4 measured AA failures (§5.4) |
| `src/components/badge.scss:50–61` | `--badge-subtle-*-color` same defect; `--badge-*-color` filled variants use `-contrast` → 4 more failures (§5.4) |
| `src/components/input.scss:54` | `--input-border-color: var(--color-neutral-200)` → 1.23:1, fails WCAG 1.4.11 (§5.5) |
| `src/components/checkbox.scss:11,27`, `radio.scss:11,27`, `switch.scss:12,27`, `select.scss:33` | Control boundaries + focus glows, same 1.4.11 class |
| `index.css` | Compiled artifact — regenerate via `npm run build` (`sass src/index.scss index.css --no-source-map`) and commit |
| `CHANGELOG.md`, `package.json` version | `release.yml` uses `googleapis/release-please-action@v5` (`release-type: node`), so the version is **commit-derived**. A visually breaking palette needs a `feat!:` or `BREAKING CHANGE:` commit, not a hand-edited version |
| `docs/colors.md`, `docs/theming.md`, `docs/buttons.md`, `docs/*.md` | VitePress docs render palettes; all hexes and names must move |
| `README.md` | Documents the palette |
| `scripts/validate-tokens.mjs` | Only asserts *referenced ⇒ defined*. It does **not** check contrast. No automated guard exists. |

### 2.2 `bursit-angular` — inside edit authority

| File / area | Why affected |
|---|---|
| `package.json:26` | `^1.2.0` → new major range |
| `landing/package.json:21` | Independent `^1.2.0` → new major range |
| `package-lock.json`, `landing/package-lock.json` | Both lockfiles pin 1.2.0 |
| `landing/public/favicon.svg` | **Currently ships Astro's own logo.** Path `M50.4 78.5a75.1…` is Astro's mark, with `#000` / `#FFF` media-query fills. The live site's favicon is the framework's. |
| `landing/public/favicon.ico` | 655 bytes. Magic bytes `89 50 4E 47 0D 0A 1A 0A` → it is a **PNG named `.ico`**, not an ICO container. Not referenced in `BaseLayout.astro:21` (only `/favicon.svg` is), but browsers request `/favicon.ico` implicitly. |
| `landing/public/og-image.png` | Committed raster, generated by the script below |
| `landing/scripts/generate-og-image.mjs:25–33` | `PALETTE` object with 7 hex literals — the only colour literals allowed outside the token runtime |
| `landing/src/components/Nav.astro:104–110` | `.wordmark__mark` — a 1rem CSS-gradient square placeholder, not the brand mark |
| `landing/src/components/Footer.astro:87` | Second gradient-square mark |
| `landing/src/styles/global.scss:407` | `.code-block__mark` — third gradient square |
| `landing/src/components/Hero.astro:97–98` | Hero atmosphere glows keyed to `--color-primary-alpha-15` and `--color-secondary-alpha-8` |
| `landing/src/components/DesignTokens.astro:11–39` | Section copy: *"The cool counterpart, used for support accents and glows"* — prose hardcodes the assumption that secondary is a contrasting hue |
| `landing/src/styles/global.scss:14` | `@use 'bursit-ui-tokens' as *` — the landing compiles the SCSS source |
| `angular.json:56,73` | Storybook `styles` point at `node_modules/bursit-ui-tokens/src/index.scss` |
| `projects/bursit-angular/.storybook/preview-head.html:5` | `background-color: var(--color-bg)` — token-driven, no literal |
| `projects/bursit-angular/.storybook/manager.ts:14` | `themes.dark` / `themes.light` from `storybook/theming` — Storybook's **own** chrome colours. Does **not** follow the brand and currently is not brand-tinted. |
| `projects/bursit-angular/src/styles/_label.scss:7` | Pre-existing bug: uses `var(--space-2xs)`, which is **not defined** in `_tokens.scss` (only `--space-2xl` exists). Unrelated to the rebrand but shares the file surface. |

**Verified clean:** every `.scss` under `projects/bursit-angular/src/lib/` and `src/styles/` is 100%
token-driven. Zero colour literals. The only literals in the Angular project are
`projects/bursit-angular/src/lib/icon/icon.spec.ts:13` (`color = '#ef4444'`, a test fixture proving
arbitrary colour passthrough) and `AGENTS.md:90` (`color: #7c1a2b;` — the "don't do this" example).

## 3. Proposed Palette

### 3.1 Derivation logic

1. **Hue anchor = 348°.** The two mark samples measure hsl(344) and hsl(351); 348 is their midpoint.
2. **The mark's own saturation (16–19%) is not usable as-is.** A 19%-saturation rose at L=43% is
   artwork, not an interactive colour: as a scale it produces no usable light tints, and text on
   tint at that saturation has almost no contrast headroom. The scale therefore holds the **hue**
   and ramps saturation to 32–64%, which is what earns the AA results in §5.
3. **Both logo tones are preserved as brand anchors** (§3.4), not discarded.
4. **Neutrals are re-derived from the logo's field**, not kept from the indigo era (§3.3).

### 3.2 Primary — `wine` (hue 348)

| Step | Hex | On `#F9FAFB` | vs white | On `#22282E` |
|---|---|---|---|---|
| 50 | `#FCF3F5` | 1.04 | 1.09 | 13.66 |
| 100 | `#F8E2E7` | 1.18 | 1.23 | 12.07 |
| 200 | `#F2C4CE` | 1.48 | 1.55 | 9.61 |
| 300 | `#E8A1AF` | 1.98 | 2.07 | 7.19 |
| 400 | `#D77588` | 2.96 | 3.09 | 4.81 |
| **500** | **`#BA3B54`** | **5.23** | **4.97** | 2.72 |
| 600 | `#9D3449` | 6.65 | 6.50 | 2.29 |
| 700 | `#7F2F3F` | 8.21 | 8.58 | 1.74 |
| 800 | `#622833` | 10.46 | 10.93 | 1.36 |
| 900 | `#4A2129` | 12.63 | 13.20 | 1.13 |
| 950 | `#2C171B` | 15.83 | 16.55 | 1.11 |

500 was **tuned, not guessed**, to satisfy three constraints at once — this is why it sits at
L=48% rather than a "normal" L=55%:

- 5.23:1 as link text on `--color-bg` (needs 4.5)
- 4.68:1 as `--badge-subtle-primary-color` on its own `alpha-8` tint (needs 4.5)
- 5.47:1 for white text on `--badge-primary-bg` (needs 4.5)

### 3.3 Neutrals — hue 210, re-derived from the logo field

The brief asked for a numeric comparison, not adjectives. Measured:

| | Hue | Saturation | Lightness |
|---|---|---|---|
| **Logo field** `#22282E` | 210 | 15% | 16% |
| old `$neutral-950` `#080d17` | 220 | **48%** | 6% |
| old `$neutral-900` `#0f172a` | 222 | **47%** | 11% |
| old `$neutral-850` `#172033` | 221 | **38%** | 15% |
| old `$neutral-800` `#1e293b` | 217 | **33%** | 17% |
| proposed `$neutral-950` `#22282E` | 210 | 15% | 16% |
| proposed `$neutral-900` `#272E35` | 210 | 15% | 18% |
| proposed `$neutral-850` `#2B333B` | 210 | 16% | 20% |
| proposed `$neutral-800` `#313B44` | 208 | 16% | 23% |

The outgoing dark ramp is **+12° bluer and +32 percentage points more saturated** than the logo's
field. At the dark end that is a deep navy, not a neutral — it reads as a *third brand colour*
sitting next to a rose accent. On a rose brand that is the classic half-done-rebrand smell.

Proposal: hold hue 210 and cut saturation to ~15%, and **set `--color-bg` in dark mode to
`#22282E` exactly** — the product's dark canvas becomes literally the mark's canvas.

| Step | Hex | | Step | Hex |
|---|---|---|---|---|
| 0 | `#FFFFFF` | | 700 | `#3E4A56` |
| 50 | `#F9FAFB` | | 800 | `#313B44` |
| 100 | `#EFF2F5` | | 850 | `#2B333B` |
| 200 | `#DDE3E9` | | 900 | `#272E35` |
| 300 | `#C0C9D3` | | **950** | **`#22282E`** ← exact logo field |
| 400 | `#9AA8B6` | | 1000 | `#111418` |
| 500 | `#647587` | | | |
| 600 | `#505E6D` | | | |

The ramp keeps the existing 0↔1000 inversion semantics, so `--color-bg` (dark) = `$neutral-950` =
`#22282E` and `--color-bg-elevated` (dark) = `$neutral-900` = `#272E35`. Light `--color-text` =
`$neutral-900` = `#272E35`, which measures **13.15:1** on `#F9FAFB`.

### 3.4 The two logo tones, preserved

Both sampled colours are retained as named brand anchors — they are *not* scale steps, because
forcing a 19%-saturation colour into a monotonic ramp breaks the ramp:

- `#835A60` (light facets) sits between `wine-600` (#9D3449) and `wine-700` (#7F2F3F): ΔRGB from
  wine-700 = −4, −43, −33. It measures **5.84:1 vs white**, so it *is* usable as a fill.
- `#4E383E` (dark facets) sits between `wine-800` (#622833) and `wine-900` (#4A2129): ΔRGB from
  wine-900 = −4, −23, −21. It measures **10.72:1 vs white**.

Recommended use: `#835A60 → #4E383E` is the exact tonal range for the **logo gradient** on the
landing (`Nav.astro`, `Footer.astro`, `global.scss:407`) and for `og-image.png`, so the gradient
squares stop being generic placeholders and carry the mark's own tonal axis.

## 4. Secondary — the real fork

The logo has no second hue. Every option here is a choice, so all three are laid out with measured
consequences.

| # | Approach | Pros | Cons | Effort |
|---|---|---|---|---|
| **A** | **`steel` — hue 210 at ~46% saturation.** The logo field's hue, saturated enough to read as a colour while neutrals stay at ~15%. | Logo-true hue; keeps the warm-mark/cool-field pairing the logo actually shows; survives every existing usage with measured AA; heroes' second glow stays a real second colour; `.code__value` vs `.code__key` stay distinguishable; `chip--cool` stays distinct from `chip--neutral`. | Two cool families at the same hue is a deliberate saturation-only separation — needs the neutral ramp held at ~15% or it collapses; `.chip--cool` is still a subtle difference. | Medium |
| B | **`oxblood` — the logo's own dark tone, hue 348, deep steps.** Secondary becomes the "deep" register of the one brand hue. | Maximally logo-true (the mark is *literally* two tones of one hue); the brand gradient becomes rose→oxblood, reproducing the logo; retires cyan entirely. | Loses hue-based differentiation — primary and secondary differ only in lightness; `.code__value` (oxblood) vs `.code__key` (rose) become hard to tell apart; `chip--cool` becomes a rose tint, near-indistinguishable from `chip--accent`; the hero's second atmospheric glow becomes a second rose glow, flattening the hero depth. | Medium |
| C | **Keep cyan `#06b6d4`.** | Zero work; and rose↔cyan is genuinely near-complementary (348° vs 189°), so it reads as a deliberate complementary pair. | **No basis in the logo.** A rebrand driven by a new mark that keeps the old secondary is exactly the failure mode the brief warns about. Also drags the outgoing identity into every doc, `index.css`, and the OG card. | Low |

### Recommendation: **A**

`steel` at hue 210 is the only option that is both logo-derived (the field's hue) and functionally
intact. Option B fails where it matters most in practice — the landing's syntax-highlighted code
blocks and the two chip variants both rely on secondary being *hue-distinguishable* from primary,
and B collapses them into one hue. Option C is the honest zero-work answer but leaves the rebrand
provably incomplete.

### `steel` scale (hue 210)

| Step | Hex | On `#F9FAFB` | vs white | On `#22282E` |
|---|---|---|---|---|
| 50 | `#F5F7FA` | 1.03 | 1.07 | 13.87 |
| 100 | `#E7EDF3` | 1.13 | 1.18 | 12.62 |
| 200 | `#CEDBE9` | 1.35 | 1.41 | 10.58 |
| 300 | `#AFC7DE` | 1.67 | 1.74 | 8.54 |
| 400 | `#7BA3CC` | 2.38 | 2.49 | 5.98 |
| **500** | **`#3A6B9C`** | **5.34** | **5.58** | 3.83 |
| 600 | `#305982` | 6.75 | 7.17 | 2.67 |
| 700 | `#294765` | 7.54 | 7.88 | 1.89 |
| 800 | `#23384D` | 10.23 | 10.69 | 1.39 |
| 900 | `#1D2B3A` | 12.88 | 13.46 | 1.11 |
| 950 | `#151F28` | 15.59 | 16.29 | 1.09 |

500 is again constraint-tuned: it must pass as **text** (5.34:1 on `--color-bg`) *and* on its own
`alpha-8` tint (4.82:1), because `--badge-subtle-secondary-color` uses it that way.

## 5. Contrast Reality Check

Every pair below is measured, not assumed. Thresholds: **4.5:1** text (WCAG 1.4.3), **3:1** UI
components and focus indicators (WCAG 1.4.11).

### 5.1 The current palette is already failing

Measured against today's shipped values — these are live defects, not consequences of the rebrand:

| Pair | Now | Need | Verdict |
|---|---|---|---|
| `a { color: var(--color-primary) }` on `--color-bg` (landing `global.scss:117`) | **4.27:1** | 4.5 | **FAIL** |
| `--color-text-subtle` on `--color-bg-elevated` (placeholders, icons, `input.scss:64–65`) | **2.56:1** | 4.5 | **FAIL** |
| `--input-border-color` = `neutral-200` on `#fff` | **1.23:1** | 3 | **FAIL** |
| white on `--badge-primary-bg` (= `--color-primary` 500) | **4.47:1** | 4.5 | **FAIL** |
| `--color-primary` on `primary-alpha-8` (badge-subtle) | **3.87:1** | 4.5 | **FAIL** |
| `--color-secondary` on `secondary-alpha-8` | **2.17:1** | 4.5 | **FAIL** |
| `--alert-success-color` on `success-alpha-10` | **2.01:1** | 4.5 | **FAIL** |
| `--alert-warning-color` on `warning-alpha-10` | **1.91:1** | 4.5 | **FAIL** |
| `--alert-error-color` on `error-alpha-10` | **3.17:1** | 4.5 | **FAIL** |
| `--alert-info-color` on `info-alpha-10` | **2.60:1** | 4.5 | **FAIL** |
| white on `--color-success` `#22c55e` (filled badge) | **2.28:1** | 4.5 | **FAIL** |
| white on `--color-error` `#ef4444` (filled badge) | **3.76:1** | 4.5 | **FAIL** |
| white on `--color-warning` `#f59e0b` (filled badge) | **2.15:1** | 4.5 | **FAIL** |
| white on `--color-info` `#818cf8` (filled badge) | **2.98:1** | 4.5 | **FAIL** |
| `--shadow-glow-primary` `rgba(#6366f1, .3)` on bg (checkbox/radio/switch focus, `outline: none`) | **1.46:1** | 3 | **FAIL** |
| `--color-focus-ring` `rgba(#6366f1, .4)` on bg | **1.68:1** | 3 | **FAIL** |
| dark `--color-focus-ring` `rgba(#818cf8, .45)` on dark bg | **2.20:1** | 3 | **FAIL** |
| dark `--color-text-subtle` `$neutral-600` `#475569` on dark bg | **2.57:1** | 3 | **FAIL** |

Note the *pattern*: the current system uses the **500-level token as text on a 10% tint of itself**
in `alert.scss` and `badge.scss`, while `toast.scss:6–9` documents and uses the correct pattern
(pointer to the `-text` token). **`toast.scss` is the reference implementation; `alert.scss` and
`badge.scss` never got migrated to it.**

### 5.2 Proposed light mode — all critical pairs

| Pair | Ratio | Need | Verdict |
|---|---|---|---|
| `--color-primary` (`#BA3B54`) on `--color-bg` | 5.23:1 | 4.5 | PASS |
| `--color-primary-hover` (`#9D3449`) on `--color-bg` | 6.65:1 | 4.5 | PASS |
| `--color-text` (`#272E35`) on `--color-bg` | 13.15:1 | 4.5 | PASS |
| `--color-text-muted` (`#505E6D`) on `--color-bg` | 6.35:1 | 4.5 | PASS |
| `--color-text-subtle` (`#647587`) on `--color-bg-elevated` | 4.73:1 | 4.5 | PASS |
| `--color-text-subtle` on `--color-bg` | 4.53:1 | 4.5 | PASS |
| white on `--btn-primary-bg` (= `--color-primary-hover`) | 6.95:1 | 4.5 | PASS |
| white on `--badge-primary-bg` (= `--color-primary`) | 5.47:1 | 4.5 | PASS |
| `--color-primary` on `primary-alpha-8` | 4.68:1 | 4.5 | PASS |
| `--btn-outline-hover-color` (`#7F2F3F`) on `--btn-outline-active-bg` (`primary-alpha-15`) | 6.78:1 | 4.5 | PASS |
| `--color-secondary` (`#3A6B9C`) on `secondary-alpha-8` | 4.82:1 | 4.5 | PASS |
| white on `--btn-secondary-bg` (= `--color-secondary-active` `#294765`) | 9.62:1 | 4.5 | PASS |
| white on `--btn-secondary-hover-bg` (= new `--color-secondary-strong` `#23384D`) | 12.04:1 | 4.5 | PASS |
| `--color-success-contrast` (= `$neutral-950` ink) on `--color-success` | 6.53:1 | 4.5 | PASS |
| `--color-warning-contrast` (= `$neutral-900` ink) on `--color-warning` | 6.40:1 | 4.5 | PASS |
| white on `--color-error` (`#DC2626`) | 4.83:1 | 4.5 | PASS |
| white on `--color-error-hover` (`#B91C1C`) | 6.47:1 | 4.5 | PASS |
| white on `--color-info` (`#2563EB`) | 5.17:1 | 4.5 | PASS |
| `-text` on `-alpha-10` (success / warning / error / info) | 6.30 / 6.32 / 5.32 / 5.60 | 4.5 | PASS |
| alert border = `-text` on tint (after `alert.scss` fix) | 6.30 / 6.32 / 5.32 / 5.60 | 3 | PASS |
| `--color-focus-ring` `rgba(wine-500, .7)` on bg | 3.12:1 | 3 | PASS |
| `--input-border-color` → `$neutral-500` on `#fff` | 4.73:1 | 3 | PASS |

### 5.3 Proposed dark mode — all critical pairs

| Pair | Ratio | Need | Verdict |
|---|---|---|---|
| `--color-primary` (= `wine-300` `#E8A1AF`) on dark bg | 7.19:1 | 4.5 | PASS |
| `--color-primary-hover` (`#F2C4CE`) on dark bg | 9.61:1 | 4.5 | PASS |
| `--color-text` (= `$neutral-50`) on dark bg | 14.24:1 | 4.5 | PASS |
| `--color-text-muted` (= `$neutral-400`) on dark bg | 6.13:1 | 4.5 | PASS |
| `--color-text-subtle` → `$neutral-500` on dark bg | 3.14:1 | 3 | PASS |
| ink on `--btn-primary-bg` (= `wine-200`) | 9.61:1 | 4.5 | PASS |
| ink on `--badge-primary-bg` (= `wine-300`) | 7.19:1 | 4.5 | PASS |
| `--badge-subtle-primary-color` (`wine-300`) on `primary-alpha-15` over dark bg | 5.34:1 | 4.5 | PASS |
| `--badge-subtle-secondary-color` (`steel-400`) on `secondary-alpha-8` over dark bg | 4.93:1 | 4.5 | PASS |
| ink on `--btn-secondary-bg` (= `steel-200`) | 10.58:1 | 4.5 | PASS |
| ink on `--btn-secondary-hover-bg` (= `steel-100`) | 12.62:1 | 4.5 | PASS |
| `--color-focus-ring` `rgba(wine-300, .8)` on dark bg | 5.14:1 | 3 | PASS |
| ink on `--color-{success,warning,error,info}` 400-level fills | 8.54 / 8.92 / 5.38 / 7.15 | 4.5 | PASS |
| dark `-text` on `-alpha-12` (toast + alert) | 6.58 / 6.85 / 4.51 / 5.61 | 4.5 | PASS |

**Resolution note for dark `--color-primary`:** `wine-400` (`#D77588`) measures **4.49:1** on
`#22282E` — a 0.01 miss. Dark primary is therefore set to `wine-300` (`#E8A1AF`, 7.19:1), which
also fixes the dark `badge-subtle-primary` pair (3.87 → 5.34). Dark hover → `wine-200`, active →
`wine-100`.

### 5.4 Two failures that require a *component* fix, not a palette value

These cannot be solved by choosing better numbers, because the bug is the token *pairing*:

1. **`alert.scss` / `badge.scss` use the 500-level token as text on a tint of itself.**
   Even with the tuned palette the best achievable is 2.99:1 (success) and 3.22:1 (warning). Fix:
   point `--alert-{v}-color`, `--alert-{v}-icon-color`, `--alert-{v}-border-color`, and
   `--badge-subtle-{v}-color` at `--color-{v}-text`, matching `toast.scss`. Verified result:
   6.30 / 6.32 / 5.32 / 5.60:1. Dark mode is unaffected because dark `-text` equals the 400-level
   token already in use.
2. **`--color-success-contrast` must stop being white.** White on any usable mid-green tops out
   around 3.5:1. Fix: `--color-success-contrast: $neutral-950` → **6.53:1**. (Alternative
   `--color-success: #16A34A` + white measures only 3.30:1 — still failing.) `--color-warning-contrast`
   is *already* `$neutral-900` and correctly passes at 6.40:1; keep it.

### 5.5 The control-boundary class (systemic, WCAG 1.4.11)

`--color-border` is used for both decorative dividers and **interactive control boundaries**.
Measured, no neutral step satisfies both modes at 3:1:

| Value | on light `--input-bg` `#FFF` | on dark `--input-bg` `#272E35` |
|---|---|---|
| `$neutral-300` `#C0C9D3` | 1.68:1 | 8.20:1 |
| `$neutral-400` `#9AA8B6` | 2.43:1 | **5.66:1** |
| `$neutral-500` `#647587` | **4.73:1** | 2.90:1 |

The two modes need *different* steps, which no single primitive alias can express. Affected
component tokens, all currently failing:

- `input.scss:54` `--input-border-color: var(--color-neutral-200)`
- `checkbox.scss:11` `--checkbox-border-color: var(--color-neutral-300)`
- `radio.scss:11` `--radio-border-color: var(--color-neutral-300)`
- `switch.scss:12` `--switch-bg: var(--color-neutral-300)`
- `select.scss:33` `--select-hover-border-color: var(--color-neutral-300)`
- `badge.scss:47` `--badge-outline-border-color: var(--color-neutral-300)`

Recommendation: add a dedicated semantic, `--color-border-control`, declared in `:root` as
`$neutral-500` and re-declared in the dark block as `$neutral-400`, then repoint the six tokens
above. This is one new token and six one-line edits, and it closes a whole defect class.

## 6. The Hardcoded-Value Landmine

Complete inventory, both repositories. There is exactly **one** in `bursit-ui-tokens`, which is
better than feared — but it is a live cyan from the outgoing identity.

### 6.1 `bursit-ui-tokens`

| Location | Value | Analysis |
|---|---|---|
| `src/components/button.scss:69` | `--btn-secondary-hover-bg: #155E75;` | Equals `$cyan-800` — the outgoing secondary at its darkest step. **Survives every scale swap silently**: it is a literal, so it will keep rendering cyan after the entire palette turns rose/steel. Verified: it renders at 7.27:1 today (white on it) so *nothing about it looks broken*, which is exactly why it ships. Nearest new equivalents: `steel-600 #305982`, `steel-700 #294765`, `steel-800 #23384D`. |

Grep evidence: `rg -i "#[0-9a-f]{3,8}\b" burst-ui-tokens/src` returns 47 hits, of which **46 are the
primitive declarations in `_tokens.scss:16–71`** and the 47th is line 69 above.
`rg -i "rgba?\(\s*[0-9#]"` over `src/` returns **zero** — every alpha value already goes through
`sass`'s `rgba($primitive, α)` function.

### 6.2 `bursit-angular`

| Location | Value(s) | Analysis |
|---|---|---|
| `landing/scripts/generate-og-image.mjs:26–32` | `#0f172a`, `#f8fafc`, `#94a3b8`, `#475569`, `#1e293b`, `#6366f1`, `#06b6d4` | Seven literals. Documented as "the one place literal values are allowed" because raster art cannot read `var(--token)`. **All seven must be re-copied.** |
| `landing/public/favicon.svg:4,6` | `#000`, `#FFF` | Astro's logo. Not brand colours, but the whole file is wrong. |
| `projects/bursit-angular/src/lib/icon/icon.spec.ts:13` | `#ef4444` | Test fixture asserting arbitrary colour passthrough. Correct as-is; leave it. |
| `AGENTS.md:90` | `#7c1a2b` | Documentation example of what *not* to do. Ironically a maroon — leave it. |

### 6.3 A documentation inaccuracy worth fixing while you are in there

`generate-og-image.mjs:20–23` asserts *"Every value below is copied from `bursit-ui-tokens` — the
`[bursit-theme=dark]` layer… Nothing here is invented."* That is **only true for five of the seven**.
`primary: '#6366f1'` is the light `--color-primary` (dark `--color-primary` is `$indigo-400`
`#818cf8`) and `secondary: '#06b6d4'` is likewise the light value (dark is `$cyan-400` `#22d3ee`).
The card is dark-surfaced but carries light-mode brand colours. Under the new palette this must be
resolved deliberately — see §9, question 7.

## 7. Approaches for the Change Itself

The palette is one axis; the *delivery split* is the other, and it is constrained by edit authority.

| Approach | Description | Pros | Cons | Effort |
|---|---|---|---|---|
| **1. Palette-spec-first, two-repo handoff** (recommended) | This exploration's palette spec becomes the primary design artifact. `sdd-spec` writes a normative "palette contract" (every token → hex, both modes). Tokens-repo rewrite is executed **outside** this SDD as a prerequisite; `bursit-angular` consumes the published version. | Respects the edit-authority boundary; the tokens rewrite becomes mechanical (fill in a table); the spec doubles as the tokens repo's own acceptance criteria; reviewable. | Requires a real npm publish and a version cascade before Angular work can verify end-to-end. | Medium |
| 2. Inline override inside `bursit-angular` | Ship the new palette as a local `:root` override in `projects/bursit-angular/src/styles/_index.scss` and leave the tokens package alone. | Single-repo, no publish, no version cascade, immediately demoable. | Directly contradicts the library's central claim ("every visual value is a token" / landing `DesignTokens.astro:136–140`); creates two sources of truth; the tokens repo drifts; the landing is not fixed. | Low |
| 3. Retire `--color-secondary` entirely | Remove the token and all ~24 consumer references. | Honest if the logo truly has one colour; shrinks the system. | Breaking for any external consumer of `bursit-ui-tokens`; a much larger diff than the 400-line review budget; forces a rewrite of `DesignTokens.astro`'s copy and several chip/gradient components. | High |

### Recommendation: **1**

Approach 2 is tempting because it is fast, but it breaks the library's own thesis and would leave
the landing and Storybook inconsistent. Approach 3 is the "right" long-term answer but is a
separate change; nothing about the rose palette *requires* removing a token that still has a
meaningful role (a cool accent).

## 8. Consumption Surface — What Actually Changes in `bursit-angular`

1. **Dependency ranges (2 files).** `package.json:26` and `landing/package.json:21` both `^1.2.0`
   → new major. Both lockfiles regenerate. A caret range will **not** pick up a major bump.
2. **Storybook needs a reinstall, not a rebuild.** `angular.json:56,73` load
   `node_modules/bursit-ui-tokens/src/index.scss` — the SCSS source, not the compiled `index.css`.
   So Storybook picks up the new palette as soon as the dependency is installed; no Storybook
   config change is required for colour. `preview-head.html:5` already uses `var(--color-bg)`.
   **But** `manager.ts:14` uses `themes.dark` / `themes.light` from `storybook/theming`, so the
   Storybook **chrome** (toolbar, sidebar) stays Storybook's default blue-grey and will *not*
   match the new brand. Today it doesn't match indigo either. Decision, not defect — see §9.
3. **Landing favicons (2 files).** `favicon.svg` is Astro's mark and must be replaced with the new
   logo as SVG. `favicon.ico` is a 655-byte **PNG misnamed `.ico`**, unreferenced in
   `BaseLayout.astro:21` — replace or delete. Note an asset gap: **no SVG of the new logo exists in
   either repo**; only `logo.jpeg` (raster). Favicon work is blocked until an SVG is produced.
4. **Three CSS gradient marks** become the real mark or the logo gradient:
   `Nav.astro:104–110` (`.wordmark__mark`, 1rem square, `--radius-sm`),
   `Footer.astro:87`, `global.scss:407` (`.code-block__mark`).
   These are three instances of the same placeholder and should be handled once, consistently.
5. **`og-image.png`** must be regenerated by `npm run og-image` (in `landing/`) after
   `generate-og-image.mjs:25–33` is re-copied. The script self-verifies the 1200×630 output.
   The committed PNG is the shipped artifact.
6. **Landing copy** in `DesignTokens.astro:25` (*"The cool counterpart, used for support accents and
   glows"*) still reads correctly under the `steel` recommendation, so no copy change is forced —
   but if Option B is chosen instead, this line and the `Secondary` group name become misleading.
7. **Hero atmosphere** `Hero.astro:97–98` needs no edit — it consumes `--color-primary-alpha-15` and
   `--color-secondary-alpha-8` — but its *appearance* changes materially, so it needs visual review
   under both modes.
8. **No test changes are expected.** No `.spec.ts` asserts a colour value. `icon.spec.ts` passes an
   arbitrary colour and asserts passthrough, which stays true.

**Not affected:** `README.md` at the repo root, `CONTRIBUTING.md`, `jest.config.js`, `tsconfig.json`,
`ng-package.json`, the schematics, and every `.ts`/`.html` under `src/lib/`.

## 9. Risks and Open Questions

### Decisions the palette derivation cannot make on its own

1. **Secondary direction (§4).** Recommend `steel`. If the human prefers `oxblood` (Option B) the
   whole §3.4/§4 table regime changes, plus `DesignTokens.astro` copy.
2. **The `--color-border-control` addition (§5.5).** Adding a token and repointing six component
   tokens changes how every input/checkbox/radio/switch looks — borders go visibly darker. This is
   an accessibility improvement but a deliberate visual regression *relative to today*. Confirm or
   defer to a separate change.
3. **Focus indicators (§5.1).** Raising `--shadow-glow-primary` alpha from 0.3 → 0.7 and
   `--color-focus-ring` from 0.4 → 0.7 (light) / 0.45 → 0.8 (dark) changes focus visuals
   noticeably. Note `checkbox.scss:32` sets `outline: none`, so checkbox/switch focus relies on the
   glow **alone** — this is a genuine 1.4.11 failure today.
4. **How many of the 18 pre-existing failures to fix in this change.** §5.1 lists them. Fixing them
   all expands the diff beyond a pure rebrand and pushes against the 400-line review budget;
   fixing none ships a rebrand onto a known-broken base. Recommend fixing the ones the palette
   rewrite touches anyway (all of §5.4, §5.5) and tracking the rest.
5. **`--btn-secondary-hover-bg` replacement.** Recommend adding `--color-secondary-strong`
   (`steel-800` light / `steel-100` dark), preserving the original "one step past active" intent
   (white on it = 12.04:1). Alternative: repoint to `var(--color-secondary-active)` — zero new
   tokens, but the secondary button silently loses its hover-darkening.
6. **Whether `--color-text-subtle` should also pass 4.5:1 on `--color-bg-sunken`.** At `$neutral-500`
   it measures **4.21:1** there (4.73:1 on `bg-elevated`, 4.53:1 on `bg`) — one marginal miss.
   Raising it to `$neutral-600` (`#505E6D`, 5.91:1 there) collapses the muted/subtle distinction
   entirely, since `--color-text-muted` is already `$neutral-600`.
7. **Which register the OG card's brand gradient uses.** Today it mixes dark surfaces with light-mode
   brand colours (§6.3). Options: (a) dark register — `primary wine-300 #E8A1AF`,
   `secondary steel-400 #7BA3CC`, muted-but-correct; (b) the vivid light register — `#BA3B54` /
   `#3A6B9C`, which pops on the dark card but is not "the dark theme's value". Confirm.
8. **Version bump mechanics.** `release.yml` uses release-please, so the major bump must come from a
   `feat!:` / `BREAKING CHANGE:` conventional commit in the tokens repo. Confirm that a visually
   breaking palette *is* declared breaking, and decide the resulting major number.
9. **Storybook manager chrome.** Keep `themes.dark`/`themes.light`, or tint the Storybook chrome to
   the new brand so the docs site and component browser agree?

### Risks

- **Publish ordering.** Angular work cannot be verified end-to-end until the tokens major is
  published. If the tokens repo is not published first, `bursit-angular` verification is blocked.
- **The `#155E75` literal (§6.1) will survive a naive rewrite.** It is a single line in a 5,369-byte
  file and renders at a perfectly healthy 7.27:1, so nothing will look wrong. Grep for hex literals
  as an explicit verification step, not eyeballing.
- **Design-token docs go stale silently.** `bursit-ui-tokens/docs/*.md` (11 files) render palettes;
  nothing verifies them.
- **No automated contrast gate exists.** `scripts/validate-tokens.mjs` checks only referential
  integrity. Every number in §5 was produced ad hoc for this exploration; nothing will catch a
  regression. Consider adding a contrast assertion to that script.
- **Raster-only logo.** `logo.jpeg` is the only source asset. Every consuming surface (favicon SVG,
  gradient marks, OG card) needs vector or re-rendered artwork that does not exist yet.
- **Non-monotonic perception risk on `wine-400 → wine-500`.** 400 sits at L=63 and 500 at L=48
  (15pp jump vs 12–14pp elsewhere) because 500 was tuned for AA. Visually acceptable, but if the
  scale is ever re-tuned, the three AA constraints in §3.2 must be re-checked.

## 10. Token Mapping Summary

| Token | Now (light) | Proposed (light) | Replaces |
|---|---|---|---|
| `--color-primary` | `#6366f1` | `#BA3B54` | indigo-500 |
| `--color-primary-hover` | `#4f46e5` | `#9D3449` | indigo-600 |
| `--color-primary-active` | `#4338ca` | `#7F2F3F` | indigo-700 |
| `--color-primary-subtle` | `#eef2ff` | `#FCF3F5` | indigo-50 |
| `--color-secondary` | `#06b6d4` | `#3A6B9C` | cyan-500 |
| `--color-secondary-hover` | `#0891b2` | `#305982` | cyan-600 |
| `--color-secondary-active` | `#0e7490` | `#294765` | cyan-700 |
| `--color-secondary-strong` | *(does not exist)* | `#23384D` | new → replaces literal `#155E75` |
| `--color-secondary-subtle` | `#ecfeff` | `#F5F7FA` | cyan-50 |
| `--color-bg` | `#f8fafc` / dark `#080d17` | `#F9FAFB` / dark **`#22282E`** | neutral-50 / neutral-950 |
| `--color-bg-elevated` | `#ffffff` / `#0f172a` | `#FFFFFF` / `#272E35` | neutral-0 / neutral-900 |
| `--color-text` | `#0f172a` / `#f8fafc` | `#272E35` / `#F9FAFB` | neutral-900 / neutral-50 |
| `--color-text-muted` | `#64748b` / `#94a3b8` | `#505E6D` / `#9AA8B6` | neutral-500 / neutral-400 |
| `--color-text-subtle` | `#94a3b8` / `#475569` | `#647587` / `#647587` | neutral-400 / neutral-600 → **neutral-500 both** |
| `--color-border-control` | *(does not exist)* | `#647587` / `#9AA8B6` | new (§5.5) |
| `--color-focus-ring` | `rgba(#6366f1,.4)` | `rgba(#BA3B54,.7)` / `rgba(#E8A1AF,.8)` | indigo-500 @ .4 / indigo-400 @ .45 |
| `--color-success-contrast` | `#ffffff` | `#22282E` | neutral-0 → neutral-950 |
| `--color-error` | `#ef4444` | `#DC2626` | red-500 → red-600 |
| `--color-error-hover` | `#dc2626` | `#B91C1C` | red-600 → red-700 |
| `--color-info` | `#818cf8` | `#2563EB` | **indigo-400 → decoupled blue (brand-coupled, must change)** |
| `--color-info-text` | `#4f46e5` | `#1D4ED8` | indigo-600 → blue-700 |
| `--color-warning`, `--color-warning-text` | `#f59e0b`, `#92400e` | unchanged | functional; already passes |
| `--shadow-glow-primary` | `rgba(#6366f1,.3)` | `rgba(#BA3B54,.7)` / `rgba(#E8A1AF,.8)` | indigo → wine |

## 11. Ready for Proposal

**Yes** — with the §9 decisions answered first. The palette is specified to hex level for both
modes, every critical pair is measured, and the two-repo inventory is complete, so the tokens
rewrite is mechanical and the Angular-side task list is enumerable. The three blocking inputs are:
the secondary-direction choice (§9.1), the scope of the pre-existing contrast fixes (§9.4), and an
SVG of the logo (§8.3), without which the favicon and mark work cannot start.
