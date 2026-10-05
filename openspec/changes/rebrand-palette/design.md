# Design: Rebrand Palette

## Technical Approach

Two repositories, one ordered handoff. The palette contract in this document is the artifact
the tokens-repo rewrite executes mechanically; `bursit-angular` consumes the published major.
All contrast figures below are **self-derived measurements produced for this design** with the
WCAG 2.x relative-luminance formula — the `research.md` lane returned zero validated claims and
is not cited anywhere in this document.

Scope note carried from the specs: the real fix scope is **22 pairs, not 18**. CC-04 adds a
class obligation that necessarily covers `--badge-subtle-{success,warning,error,info}-color`,
which the exploration's §5.1 enumeration omitted. This design keeps all 22 and does not narrow
back to the enumeration.

## Architecture Decisions

| # | Decision | Choice | Alternative rejected | Rationale |
|---|---|---|---|---|
| D1 | Dark `--color-text-subtle` (deferred) | `$neutral-400` = `#9AA8B6` | `$neutral-500` `#647587`; `$neutral-300` `#C0C9D3` | 6.13:1 on `#22282E`, 5.66:1 on `#272E35`, 7.05:1 on the dark sunken composite `#181C21`. `neutral-500` measures 3.14/2.90/3.62 — fails CC-07. `neutral-300` (8.88) is *lighter* than muted, inverting the ladder. Equality with dark `--color-text-muted` (already `neutral-400`, BP-05) is the deliberate mirror of BP-09's light collapse: in both modes there is no step between the muted step and the failed candidate. |
| D2 | `blue` family primitive shape | 5 steps, `$blue-400 #60A5FA`, `500 #3B82F6`, `600 #2563EB`, `700 #1D4ED8`, `800 #1E40AF` | 3-step scale; reusing `$indigo-*` | Mirrors the sibling semantic families' shape exactly (`$green-400…800` is 5 steps; `$red-*`/`$amber-*` are 4-5), keeps the `{family}-{step}` naming so BP-08's "alias a primitive, never a literal" holds, and lands light `--color-info`/`-text` precisely on `$blue-600`/`$blue-700` so BP-04's two hexes are the ramp, not literals. Dark takes `$blue-400` (BP-10). Verified: `#22282E` on `$blue-400` 5.85:1, `$blue-400` on dark `--color-info-alpha-10` 4.78:1. |
| D3 | Light `--color-text-muted` (deferred) | **Does not move.** Stays `neutral-600` `#505E6D` | `neutral-700` `#3E4A56` (8.67:1 on `bg`) to restore the delta | BP-09 is normative and names the step. Restoring a delta requires moving muted, and `neutral-700` sits at 8.67:1 against `--color-text`'s 13.15:1 — it trades the lower-tier collapse for an upper-tier one, and re-tiers ~40 landing uses of muted toward near-primary. The delta is unrecoverable without a new primitive between 500 and 600; the spec forbids requiring it. |
| D4 | Focus mechanism (deferred) | Glow retained **plus** a real outline on checkbox: `outline: var(--border-width-medium) solid var(--color-focus-ring); outline-offset: var(--space-xs);` | Glow alone; a new dedicated outline token | `checkbox.scss:32` is the repo's only `outline: none`, and `--color-focus-ring` is currently **declared twice and consumed nowhere** in the package, this repo, or the landing. Adopting it here gives CP-16/CP-17 a pair that actually renders, and `--space-xs` (4px) clears the 3px glow so the outline sits on `--color-bg` on both sides (3.12:1 light / 5.14:1 dark). The declaration shape matches the landing's existing `:focus-visible` rule. Glow-only remains measured through CC-06; radio/switch alignment belongs to the tokens repo (`_mixins.scss:146`), outside this change's authority. |
| D5 | OG card register (deferred) | **Dark register.** All seven literals re-copied from the dark layer; gradient structure unchanged | Mark tonal axis on the card; light register | Choosing the dark register makes `generate-og-image.mjs:20–23`'s claim true for all seven for the first time. The mark's light register measures 1.28:1 against the card surface `#272E35` — invisible; BA-03's three sites are the CSS placeholder marks, not this poster. |
| D6 | Storybook theming API (deferred) | `import { create } from 'storybook/theming/create'` (confirmed: `storybook@10.4.2` declares `./theming/create` as a subpath with `create(vars?: ThemeVarsPartial, rest?)`), building `bursitLight`/`bursitDark` and passing them to the existing `addons.setConfig({ theme })` call | Keeping `themes.light`/`themes.dark` | The manager document is separate from the preview, so `var(--token)` is unreachable there — literals are structurally required, and they sit at `projects/bursit-angular/.storybook/`, outside TC-07's `src/`-scoped hex sweep. Mode switching is untouched because `manager.ts`'s existing `globalsUpdated` + `matchMedia` logic already computes `isDark`; only the object passed to `setConfig` changes. |
| D7 | Light `--color-error-active` step | `$red-800` `#991B1B` — **new primitive; deviates from BP-04's "unlisted tokens keep their step name"** | Following the letter: `$red-700` | BP-04 moves `--color-error`→`red-600` and `-hover`→`red-700`. `--color-error-active` already holds `red-700`, and `button.scss:125–129` wires `--btn-danger-bg: var(--color-error-hover)`, `-hover-bg` and `-active-bg` both to `--color-error-active`. The literal reading therefore makes a danger button's base, hover and active all `#B91C1C` — three states, one colour. `$red-800` mirrors the existing `$green-800`/`$amber-800`; white on it measures 8.31:1. **Requires a spec amendment** (see Open Questions). |
| D8 | `--shadow-glow-secondary` | Pure hue swap, alpha unchanged: `rgba($steel-500, 0.3)` light / `rgba($steel-400, 0.35)` dark | Raising it to 0.7/0.8 like primary | It has zero consumers in the package, this repo, or the landing; it is not a focus indicator, so no 3:1 obligation attaches. Only `--shadow-glow-primary` is the focus indicator and carries the alpha raise. (At 0.3/0.35 it measures 1.52:1/1.88:1 — if it is ever wired as a focus indicator the alpha must rise.) |
| D9 | Shadow hue | Light `--shadow-*` replace `rgba($indigo-950, α)` with `rgba($wine-950, α)` | `$neutral-950` | `$indigo-950` is deleted; shadows are declared "tonalizadas en índigo" and must follow the brand ramp rather than introduce a third hue. Dark shadows already use `$neutral-1000` and are unchanged. |
| D10 | Mark colour delivery | Three new brand tokens; the SVG carries literal `fill`s | `currentColor`; a single mode-independent mark | `currentColor` cannot cross a `background-image: url()` boundary — the SVG is an isolated document. And one register cannot serve both canvases: the light register's facets measure 2.55:1 and 1.39:1 on `#22282E`. See the mark contract below. |

## Data Flow

Two repositories, one hard gate. Nothing in `bursit-angular` is verifiable end-to-end before step 5.

    bursit-ui-tokens (outside this SDD's edit authority)          bursit-angular (this repo)
    ──────────────────────────────────────────────────           ──────────────────────────
    1 rewrite _tokens.scss + 8 component files
    2 npm run build  ──▶ index.css regenerated
    3 npm run validate / lint:css  ──▶ green
    4 commit feat(tokens)!: ...  ──▶ PR (title = the breaking commit)
    5 release-please opens Release PR ──▶ merge ──▶ v2.0.0 tag
    6 publish job: npm ci && npm publish
         └─ prepublishOnly ──▶ npm run build (index.css rebuilt into the tarball)
    7 ┌─────────────── GATE: npm view bursit-ui-tokens@2.0.0 ──────────────┐
      │   must resolve before any manifest in this repo moves            │
      └──────────────────────────────────────────────────────────────────┘
                                                                 8 npm run check:contrast  (RED, 1.2.0)
                                                                 9 bump both manifests + lockfiles
                                                                10 npm run check:contrast  (GREEN, 22/22)
                                                                11 manager.ts chrome; checkbox outline
                                                                12 landing assets, AGENTS.md
                                                                13 build · test · build-storybook · astro build

Discipline for the mark: `background-image: url(...)` means the CSS cannot colour the SVG, so the
SVG is the source of truth for its own fills and the tokens are the source of truth for the
*gradient placeholder* used until artwork lands. The harness asserts the two agree.

## File Changes

| File | Action | Description |
|---|---|---|
| **`bursit-ui-tokens` — prerequisite, own PR, outside edit authority** | | |
| `src/_tokens.scss` | Modify | Primitives 15–71 (delete `$indigo-*`/`$cyan-*`, add `$wine-*`/`$steel-*`/`$blue-*`/`$red-800` + 3 brand primitives, re-derive `$neutral-*`); `:root` 77–331; dark block 340–477. Update the Spanish palette comments that name Índigo/Cian. |
| `src/components/button.scss` | Modify | `:69` `#155E75` → `var(--color-secondary-strong)` |
| `src/components/input.scss` | Modify | `:54` `--input-border-color` → `var(--color-border-control)` |
| `src/components/checkbox.scss` `radio.scss` | Modify | `:11` `--*-border-color` → `var(--color-border-control)` |
| `src/components/switch.scss` | Modify | `:12` `--switch-bg` → `var(--color-border-control)` |
| `src/components/select.scss` | Modify | `:33` `--select-hover-border-color` → `var(--color-border-control)` |
| `src/components/badge.scss` | Modify | `:47` outline border → `--color-border-control`; `:54–61` the four `--badge-subtle-{success,warning,error,info}-color` → `--color-{v}-text` |
| `src/components/alert.scss` | Modify | `:21–25, 27–31, 33–37, 40–43` — `-color`, `-icon-color`, `-border-color` → `--color-{v}-text` |
| `index.css` | Regenerate | `npm run build`; `prepublishOnly` rebuilds it into the tarball. Commit it as hygiene. |
| `docs/colors.md`, `docs/theming.md` | Modify | The only two docs carrying hex literals (24 and 30). `README.md` carries names/`rgb()` only. |
| `README.md` | Modify | 13 indigo/cyan mentions; `:293` documents `--shadow-glow-secondary` |
| **`bursit-angular` — this repo** | | |
| `scripts/check-contrast.mjs` | Create | The verification harness. Parses the installed `index.css`; prints one line per pair; exits non-zero on any failure. |
| `package.json` | Modify | `:26` → `^2.0.0`; add `"check:contrast"` |
| `package-lock.json` | Regenerate | Root install resolves the published major |
| `landing/package.json` | Modify | `:21` → `^2.0.0` |
| `landing/package-lock.json` | Regenerate | Independent range, independently resolved |
| `projects/bursit-angular/.storybook/manager.ts` | Modify | `:2` import `create`; replace `themes.light`/`themes.dark` |
| `projects/bursit-angular/src/lib/forms/checkbox/checkbox.scss` | Modify | `:31–34` restore a real outline alongside the glow (D4) |
| `landing/scripts/generate-og-image.mjs` | Modify | `:25–33` `PALETTE` → dark register; make the `:20–23` comment true |
| `landing/public/og-image.png` | Regenerate | `npm run og-image` |
| `landing/public/logo-mark.svg`, `logo-mark-reverse.svg` | Create | **Artwork-gated (BA-01)** |
| `landing/public/favicon.svg` | Modify | **Artwork-gated** — currently Astro's mark (`M50.4 78.5a75.1…`) |
| `landing/public/favicon.ico` | Replace or Delete | **Artwork-gated** — verified 655 bytes, magic `89 50 4E 47`, i.e. a PNG named `.ico`; unreferenced at `BaseLayout.astro:21` |
| `landing/src/components/Nav.astro` `Footer.astro`, `landing/src/styles/global.scss` | Modify | The three placeholder gradient squares |
| `AGENTS.md` | Modify | `:23`'s `file:` dependency claim — the lockfile proves registry resolution |

## Interfaces / Contracts

### Token table — the deliverable

Primitives (all values also listed in BP-01; `blue` and `$red-800` are D2/D7). Steps are deleted
for `indigo`/`cyan` and preserved for `neutral`.

| Family | Steps |
|---|---|
| `wine` (348) | 50 `#FCF3F5`, 100 `#F8E2E7`, 200 `#F2C4CE`, 300 `#E8A1AF`, 400 `#D77588`, 500 `#BA3B54`, 600 `#9D3449`, 700 `#7F2F3F`, 800 `#622833`, 900 `#4A2129`, 950 `#2C171B` |
| `steel` (210) | 50 `#F5F7FA`, 100 `#E7EDF3`, 200 `#CEDBE9`, 300 `#AFC7DE`, 400 `#7BA3CC`, 500 `#3A6B9C`, 600 `#305982`, 700 `#294765`, 800 `#23384D`, 900 `#1D2B3A`, 950 `#151F28` |
| `neutral` (210) | 0 `#FFFFFF`, 50 `#F9FAFB`, 100 `#EFF2F5`, 200 `#DDE3E9`, 300 `#C0C9D3`, 400 `#9AA8B6`, 500 `#647587`, 600 `#505E6D`, 700 `#3E4A56`, 800 `#313B44`, 850 `#2B333B`, 900 `#272E35`, 950 `#22282E`, 1000 `#111418` |
| `blue` (D2) | 400 `#60A5FA`, 500 `#3B82F6`, 600 `#2563EB`, 700 `#1D4ED8`, 800 `#1E40AF` |
| `red` | 400 `#f87171`, 500 `#ef4444`, 600 `#dc2626`, 700 `#b91c1c`, **800 `#991B1B`** (D7) |
| brand anchors (not ramp steps, BP-03) | `$brand-field: #22282E`, `$brand-bright: #835A60`, `$brand-deep: #4E383E` |

Semantic tokens, both modes. Every row states the contrast obligation it carries; a row with no
obligation is decorative by role.

| Token | Light | Dark | Obligation (measured) |
|---|---|---|---|
| `--color-primary` | `wine-500` `#BA3B54` | `wine-300` `#E8A1AF` | text ≥4.5 — 5.23:1 on `bg` light; 7.19:1 dark |
| `--color-primary-hover` | `wine-600` `#9D3449` | `wine-200` `#F2C4CE` | 6.65 / 9.61 |
| `--color-primary-active` | `wine-700` `#7F2F3F` | `wine-100` `#F8E2E7` | — |
| `--color-primary-subtle` | `wine-50` `#FCF3F5` | `rgba($wine-500, .15)` | — |
| `--color-primary-contrast` | `neutral-0` `#FFFFFF` | `neutral-950` `#22282E` | ≥4.5 on `--btn-primary-bg` (`= -hover`): 6.95 light; on `wine-300` 7.19 dark |
| `--color-primary-alpha-8 / -15 / -20` | `rgba($wine-500, .08/.15/.2)` | `rgba($wine-300, …)` | `-alpha-8` carries CP-05: 4.68:1 |
| `--color-secondary` | `steel-500` `#3A6B9C` | `steel-400` `#7BA3CC` | text ≥4.5 — 5.34 light; on `-alpha-8` 4.82 (CP-06) / 4.93 dark |
| `--color-secondary-hover` | `steel-600` `#305982` | `steel-300` `#AFC7DE` | text ≥4.5 — 6.75:1 on `bg` light |
| `--color-secondary-active` | `steel-700` `#294765` | `steel-200` `#CEDBE9` | `--btn-secondary-bg` ink 9.62 / 10.58 |
| `--color-secondary-strong` **(new, BP-07)** | `steel-800` `#23384D` | `steel-100` `#E7EDF3` | `--btn-secondary-hover-bg` ink 12.04 / 12.62 |
| `--color-secondary-subtle` | `steel-50` `#F5F7FA` | `rgba($steel-500, .12)` | — |
| `--color-secondary-contrast` | `neutral-0` | `neutral-950` | as above |
| `--color-secondary-alpha-8 / -15` | `rgba($steel-500, …)` | `rgba($steel-400, …)` | `-alpha-8` carries CP-06 |
| `--color-neutral-0 … -1000` | ramp order | **inverted 0↔1000** (unchanged semantics) | BP-02: dark `--color-neutral-950` = `#F9FAFB` |
| `--color-bg` | `neutral-50` `#F9FAFB` | `neutral-950` `#22282E` | BP-02 exact |
| `--color-bg-elevated` | `neutral-0` `#FFFFFF` | `neutral-900` `#272E35` | BP-02 exact |
| `--color-bg-sunken` | `neutral-100` `#EFF2F5` | `rgba($neutral-1000, .6)` → `#181C21` | Pins `--color-text-subtle` at ≥`neutral-600` |
| `--color-overlay` | `rgba($neutral-900, .55)` | `rgba($neutral-1000, .7)` | — |
| `--color-text` | `neutral-900` `#272E35` | `neutral-50` `#F9FAFB` | 13.15 / 14.24 on `bg` |
| `--color-text-muted` | `neutral-600` `#505E6D` | `neutral-400` `#9AA8B6` | 6.35 / 6.13; equals `-subtle` by intention (D3 / BP-09) |
| `--color-text-subtle` | `neutral-600` `#505E6D` | `neutral-400` `#9AA8B6` **(D1)** | ≥4.5 on `bg`, `bg-elevated`, `bg-sunken`: light 6.35/6.64/5.91; dark 6.13/5.66/7.05 |
| `--color-text-inverse` | `neutral-0` | `neutral-950` | — |
| `--color-border` | `neutral-200` `#DDE3E9` | `neutral-800` `#313B44` | decorative |
| `--color-border-strong` | `neutral-300` `#C0C9D3` | `neutral-700` `#3E4A56` | decorative |
| `--color-border-control` **(new, BP-06)** | `neutral-500` `#647587` | `neutral-400` `#9AA8B6` | UI ≥3 on the control's own bg: 4.73 light on `#FFFFFF`; 5.66 dark on `#272E35` |
| `--color-focus-ring` | `rgba($wine-500, .7)` | `rgba($wine-300, .8)` | focus ≥3 on `bg`: 3.12 / 5.14 (CP-16/17); now consumed by checkbox (D4) |
| `--color-success` | `green-500` (unchanged) | `green-400` | fill |
| `--color-success-hover/-active` | `green-600`/`green-700` | `green-500`/`green-600` | — |
| `--color-success-contrast` | **`neutral-950` `#22282E`** (was white) | `neutral-950` | CC-05: 6.53 light; 8.54 dark |
| `--color-success-alpha-10/-15`, `--color-success-text` | `rgba($green-500, …)`, `green-800` `#166534` | `rgba($green-400, .12/.18)`, `green-400` | `-text` on `-alpha-10`: 6.54 light (CC04-01) / 6.58 dark |
| `--color-warning` / `-hover` / `-active` | `amber-500` / `amber-600` / `amber-600` (unchanged) | `amber-400` / `amber-500` / `amber-500` | fill |
| `--color-warning-contrast` | `neutral-900` `#272E35` (unchanged) | `neutral-950` | 6.40 light (CC-05) |
| `--color-warning-alpha-10/-15`, `-text` | `rgba($amber-500, …)`, `amber-800` `#92400e` | `rgba($amber-400, .12/.18)`, `amber-400` | 6.56 / 6.85 (CC04-02) |
| `--color-error` | **`red-600` `#DC2626`** (was `red-500`) | `red-400` | CP-12: white on it 4.83 light; ink 5.38 dark |
| `--color-error-hover` | `red-700` `#B91C1C` | `red-500` | 6.19:1 on `bg` light; white on it 6.47 |
| `--color-error-active` | **`red-800` `#991B1B`** (D7) | `red-600` | preserves the danger-button state ladder |
| `--color-error-contrast` | `neutral-0` | `neutral-950` | CP-12 |
| `--color-error-alpha-10/-15` | now `rgba($red-600, …)` (was `$red-500`) | `rgba($red-400, .12/.18)` | tint follows the fill; CC04-03 at 5.54 light / 4.51 dark (**0.01 margin — see Open Questions**) |
| `--color-error-text` | `red-700` | `red-400` | CP-09/CC04-03 |
| `--color-info` | **`$blue-600` `#2563EB`** (was `$indigo-400`) | **`$blue-400` `#60A5FA`** | CP-14: white on it 5.17; ink 5.85 dark |
| `--color-info-contrast` | `neutral-0` | `neutral-950` | CP-14 |
| `--color-info-alpha-10/-15` | `rgba($blue-600, .1/.15)` | `rgba($blue-400, .12/.18)` | CC04-04: 5.82 light / 4.78 dark |
| `--color-info-text` | **`$blue-700` `#1D4ED8`** | **`$blue-400`** | BP-10 decoupled |
| `--shadow-xs…2xl, -inner` | `rgba($wine-950, …)` (was `$indigo-950`) | `rgba($neutral-1000, …)` unchanged | — |
| `--shadow-glow-primary` | `rgba($wine-500, .7)` (was .3) | `rgba($wine-300, .8)` (was .35) | focus ≥3: 3.12 / 5.14 (CP-15) |
| `--shadow-glow-secondary` | `rgba($steel-500, .3)` | `rgba($steel-400, .35)` | none — D8 |
| `--color-brand-field` **(new, BP-03)** | `#22282E` | `#22282E` | literal primitive reference, never `var(--color-neutral-950)` — that alias inverts |
| `--color-brand-mark-bright` **(new, BP-03)** | `#835A60` | `#E8A1AF` | light-register facet on `#FFFFFF`: 5.84 |
| `--color-brand-mark-deep` **(new, BP-03)** | `#4E383E` | `#D77588` | light-register facet on `#FFFFFF`: 10.72; dark register plate stop on `#22282E`: 4.81 |

Everything not listed keeps its current declaration shape (`--font-*`, `--space-*`, `--radius-*`,
`--border-*`, `--duration-*`, `--ease-*`, `--z-index-*`, `--color-white-alpha-15`,
`--color-black-alpha-10`).

### Mark artwork contract (BA-01 drop-in)

| Aspect | Requirement |
|---|---|
| Files | `landing/public/logo-mark.svg` (default register), `landing/public/logo-mark-reverse.svg` (dark canvas) |
| Geometry | One vector master, two registers. `<svg viewBox="0 0 64 64">` with **no** `width`/`height`; CSS sizes it |
| Colour | Literal `fill` attributes. `currentColor` **cannot** be used — the SVG is loaded via `background-image: url()` and is an isolated document |
| Default register | plate `#22282E`; facets `#835A60` → `#4E383E` (the BP-03 anchors, used verbatim) |
| Reverse register | plate gradient `#E8A1AF` → `#D77588`; mark knocked out in `#22282E` |
| Why two | The light register's facets measure 2.55:1 and 1.39:1 on `#22282E` — invisible on the dark canvas, where the plate also disappears. The reverse register measures 7.19:1 / 4.81:1 plate-on-canvas and 7.19:1 / 4.81:1 mark-on-plate |
| Accessible name | `<title id>` + `aria-labelledby` + `role="img"` when inlined; when used as `background-image` the host element carries the label |
| Consumer CSS | `background-size: contain; background-repeat: no-repeat; background-position: center; background-color: var(--color-brand-field)` |
| Register swap | `[bursit-theme='dark'] .wordmark__mark, [bursit-theme='dark'] .code-block__mark, .dark .wordmark__mark { background-image: url('/logo-mark-reverse.svg'); }` — the same selector the token layer uses, so no JS is added |
| Sizes | Nav/Footer mark `var(--space-md)` (1rem); `.code-block__mark` `var(--space-sm)`; favicon 32×32 with ~15 % inset; OG card 64×64 at `x=96,y=80` |

### Storybook theme contract (TC-05)

`create()` from `storybook/theming/create`; `ThemeVarsPartial` needs `base` plus any subset of
`colorPrimary`, `colorSecondary`, `appBg`, `appContentBg`, `appPreviewBg`, `appHoverBg`,
`appBorderColor`, `appBorderRadius`, `textColor`, `textInverseColor`, `textMutedColor`, `barBg`,
`barTextColor`, `barHoverColor`, `barSelectedColor`, `inputBg`, `inputBorder`, `inputTextColor`,
`inputBorderRadius`, `brandTitle`. Map light to `#BA3B54`/`#3A6B9C`/`#F9FAFB`/`#FFFFFF`/
`#272E35`/`#505E6D` and dark to `#E8A1AF`/`#7BA3CC`/`#22282E`/`#272E35`/`#F9FAFB`/`#9AA8B6`,
`appBorderColor` `#DDE3E9` / `#313B44`, `inputBorder` `--color-border-control`'s `#647587` /
`#9AA8B6`.

### Verification harness contract (`scripts/check-contrast.mjs`)

Reads `node_modules/bursit-ui-tokens/index.css` and nothing else — CC-01 requires the measurement
be taken from the installed artifact, not from source. Parses the `:root` blocks (the compiled file
emits 21: the tokens block, the 19 component blocks, and the reduced-motion block) and the
`[bursit-theme=dark], .dark` block, resolves `var()` chains, composites `rgba()` backgrounds over
an explicitly named surface, computes `(L1 + 0.05) / (L2 + 0.05)`, prints
`CP-nn <mode> <ratio> need <threshold> PASS|FAIL`, prints one result line per ID per mode, and exits
non-zero only after every line has been printed — never on the first failure (CC-03 requires a result
per ID, which a first-failure abort cannot emit). Group A is the 18 `CP-*` IDs (`CP-01`…`CP-18`) plus
the four CC-04 badge pairs labelled `CC04-01`…`CC04-04`, and reports one line per ID per mode (44
lines). Group B covers BP-06/BP-07/BP-09/CC-05/CC-06 obligations under their own labels so the 22
count stays clean.

No component block redeclares a `--color-*` token (verified by grep), so the dark block's
declarations stand despite the compiled file emitting it before the component blocks — and the
`--color-border-control` / `--color-secondary-strong` indirection is exactly what lets one
component declaration serve both modes.

Pair table rows are keyed by **token name**, not by value, so the same harness run against 1.2.0
produces the 18 "today" ratios and against 2.0.0 produces the result — the RED baseline is a
real measurement, not an inherited number.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Value | 22 pairs + BP/CC obligations, both modes | `npm run check:contrast` against the installed package. The 1.2.0 baseline was measured, not assumed: 27 of 44 Group A lines FAIL, 21 of 22 pairs fail in at least one mode and 6 in both (CP-02, CP-03, CP-15, CP-16, CP-17, CP-18); the earlier "every pair fails" prediction is refuted (see `verify-report.md` and `contrast-baseline-1.2.0.txt`). GREEN against 2.0.0. |
| Static | No retired identity; no literals outside the primitive block | Hex sweep over `bursit-ui-tokens/src` (`#155E75` = 0 hits, hits confined to primitives, no numeric/hex `rgba()` channel) and over this repo (only `icon.spec.ts:13`/`:47`, `AGENTS.md:90`, plus the documented raster/manager literal sites). Also assert each `logo-mark*.svg` fill equals its token's value (D10). |
| Unit | Existing Jest suite | `npm run test` — no `.spec.ts` asserts a colour; `icon.spec.ts` passthrough stays true. `checkbox.scss` gains no TS behaviour. |
| Build | Library, Storybook, landing | `npm run build`, `npm run build-storybook`, landing `npm run build`, `npm run og-image` (self-checks 1200×630). |
| Visual | Landing light + dark, hero atmosphere | BA-05 needs retained renders. **The landing has no theme script** — `bursit-theme` is never set by any `.astro` file and `global.scss` has no `prefers-color-scheme` rule, so the dark render must be produced by forcing `bursit-theme="dark"` on `<html>`. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or
process-integration boundary. The harness is a read-only local script; the only automated process
integration (release-please + npm publish) lives in the tokens repo and is unchanged by this design.

## Migration / Rollout

Ordered, with a hard gate (see Data Flow). Violations and their consequence:

| Violation | Consequence |
|---|---|
| Manifests bumped before step 6 | `npm error notarget No matching version found for bursit-ui-tokens@^2.0.0`; committed lockfiles break `npm ci` from a clean checkout |
| Tokens major published, this repo not bumped | Nothing updates — a caret range never crosses a major. The repo keeps rendering indigo/cyan while the tokens docs, favicon and OG card claim the new brand. |
| `latest` left on 1.2.0 after publishing 2.0.0 | `^1.2.0` consumers keep the old palette; Storybook and the landing are unchanged |

Rollback: pre-publish, delete the tokens branch (clean). **Post-publish, not cleanly reversible** —
npm versions are immutable; retag `latest` to 1.2.0 and deprecate 2.0.0, accepting that locked
installs keep 2.0.0. Post-merge here, revert the PR: ranges and lockfiles return to 1.2.0 (clean).
Post-release, redeploy the prior artifact.

Artwork fork (BA-01): produce the vector master before apply, or split the four mark-dependent
files (`logo-mark.svg`, `logo-mark-reverse.svg`, `favicon.svg`, `favicon.ico`) plus the OG card's
mark geometry out of this change. They MUST NOT be reported complete while unmet.

## Open Questions

- [ ] **D7 needs a spec amendment.** BP-04's "unlisted tokens keep their current step name" makes
      light `--color-error-active` `red-700`, which collapses `--btn-danger-bg`,
      `-hover-bg` and `-active-bg` to one colour. The design adopts `$red-800` `#991B1B`; the spec
      text should be reconciled (or the collapse knowingly accepted).
- [ ] **CC-04's class wording contradicts CP-05/CP-06.** CC-04 scenario 2 requires *zero* pairings
      of a 500-level token over its own `-alpha-*` tint, but `--badge-subtle-primary-color` /
      `-secondary-color` are exactly that, and CP-05/CP-06 mandate they pass by *tuning* rather
      than by repointing (there is no `--color-primary-text` token). Recommended fix: scope the
      class to pairings that **fail 4.5:1**. No behaviour change; the 22-pair set is unaffected.
- [ ] **Dark `--color-error-text` on `--color-error-alpha-10` is 4.51:1 against the exploration's
      4.51 and a 4.5 floor** — a 0.01 margin. Confirm it is accepted, or raise dark `-alpha-10`.
- [ ] **A contrast harness is committed but not wired into CI.** The proposal lists "a contrast
      gate" as out of scope; CC-01/CC-03 still require reproducible measurement. This design reads
      those as compatible: the harness exists and is run, no blocking gate is added. Confirm.
- [ ] **Discovered, not in scope:** light `--alert-close-color` (`--color-neutral-400` `#9AA8B6`)
      measures 2.00–2.16:1 on the alert tints — an icon at 1.4.11's 3:1 below threshold, outside
      the 18. And `--switch-hover-bg` (`--color-neutral-400`) measures 2.43:1 light / 2.24:1 dark —
      the same control-boundary class as BP-06, but not one of its six tokens. Both are reported,
      not silently added.
