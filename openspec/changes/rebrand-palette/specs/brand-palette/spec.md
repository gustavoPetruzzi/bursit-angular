# brand-palette Specification

## Purpose

Normative token→value contract for the rebrand, both modes. Authored for the `bursit-ui-tokens`
rewrite (executed outside this SDD's edit authority) and consumed by `bursit-angular`. Values are the
accepted derivation in this change's `exploration.md` (§3–§4, §10). Contrast ratios cited are that
exploration's own self-derived measurements; no external source is claimed — the `research.md` lane
produced zero validated claims and is not cited.

## Requirements

### Requirement: BP-01 — Primitive ramps are replaced

`indigo` and `cyan` MUST be removed. `wine` (hue 348) and `steel` (hue 210) MUST be added, and the
neutral family MUST be re-derived to hue 210 at ~15 % saturation. Step names MUST be preserved.

| Ramp | Steps (hex) |
|---|---|
| `wine` | 50 `#FCF3F5`, 100 `#F8E2E7`, 200 `#F2C4CE`, 300 `#E8A1AF`, 400 `#D77588`, 500 `#BA3B54`, 600 `#9D3449`, 700 `#7F2F3F`, 800 `#622833`, 900 `#4A2129`, 950 `#2C171B` |
| `steel` | 50 `#F5F7FA`, 100 `#E7EDF3`, 200 `#CEDBE9`, 300 `#AFC7DE`, 400 `#7BA3CC`, 500 `#3A6B9C`, 600 `#305982`, 700 `#294765`, 800 `#23384D`, 900 `#1D2B3A`, 950 `#151F28` |
| `neutral` | 0 `#FFFFFF`, 50 `#F9FAFB`, 100 `#EFF2F5`, 200 `#DDE3E9`, 300 `#C0C9D3`, 400 `#9AA8B6`, 500 `#647587`, 600 `#505E6D`, 700 `#3E4A56`, 800 `#313B44`, 850 `#2B333B`, 900 `#272E35`, 950 `#22282E`, 1000 `#111418` |

#### Scenario: No retired hue survives

- GIVEN the rewritten primitives
- WHEN every declared hex is compared with the retired indigo and cyan values
- THEN none matches, and each ramp declares exactly the steps above

#### Scenario: Neutrals hold the logo's field

- GIVEN the `neutral` ramp
- WHEN each step is converted to HSL
- THEN hue is 208–210 and saturation is 15–16 %

### Requirement: BP-02 — The dark canvas is the mark's own canvas

Dark `--color-bg` MUST be `neutral-950` = `#22282E` exactly, dark `--color-bg-elevated` MUST be
`neutral-900` = `#272E35`, and light `--color-text` MUST be `neutral-900`.

#### Scenario: Exact dark canvas

- GIVEN dark mode
- WHEN `--color-bg` is read from the published package
- THEN it is `#22282E`

### Requirement: BP-03 — The logo's two tones are preserved as anchors

`#835A60` and `#4E383E` MUST be retained as named brand anchors for the mark gradient. They MUST NOT
become ramp steps: their 16–19 % saturation is not monotonic with the ramps.

#### Scenario: Anchors resolve without a call-site literal

- GIVEN the landing's mark gradient
- WHEN its two stops are inspected
- THEN they resolve to `#835A60` and `#4E383E` through tokens

### Requirement: BP-04 — Light-mode semantic mapping

Each token below MUST resolve to the named primitive step (hexes are BP-01). Unlisted tokens MUST keep
their current step name; the hex follows the ramp. `--color-border` and `--color-border-strong` keep
`neutral-200` / `neutral-300`. There is exactly one normative exception to the unlisted-token rule:
light `--color-error-active` MUST be `red-800` `#991B1B`, not `red-700` (see below).

| Token | Step |
|---|---|
| `--color-primary`, `-hover`, `-active`, `-subtle` | `wine-500`, `wine-600`, `wine-700`, `wine-50` |
| `--color-secondary`, `-hover`, `-active`, `-subtle` | `steel-500`, `steel-600`, `steel-700`, `steel-50` |
| `--color-secondary-strong`, `--color-border-control` | `steel-800`, `neutral-500` (new — BP-06, BP-07) |
| `--color-bg`, `-elevated`, `-sunken` | `neutral-50`, `neutral-0`, `neutral-100` |
| `--color-text`, `-muted`, `-subtle` | `neutral-900`, `neutral-600`, `neutral-600` (BP-09) |
| `--color-focus-ring`, `--shadow-glow-primary` | `rgba(wine-500, 0.7)` |
| `--color-success-contrast` | `neutral-950` (was white — CC-05) |
| `--color-error`, `--color-error-hover` | `red-600`, `red-700` |
| `--color-error-active` | `red-800` `#991B1B` (exception to the unlisted-token rule — see below) |
| `--color-info`, `--color-info-text` | `#2563EB`, `#1D4ED8` (BP-10) |
| `--color-warning`, `--color-warning-text` | unchanged |

**Exception — light `--color-error-active` is `$red-800` `#991B1B`.** Reading the unlisted-token rule
literally gives `red-700` `#B91C1C`, but the published component layer wires
`--btn-danger-bg: var(--color-error-hover)` and both `--btn-danger-hover-bg` and
`--btn-danger-active-bg` to `var(--color-error-active)`
(`node_modules/bursit-ui-tokens/src/components/button.scss:125–129`, read-only). With `red-700`, a
danger button's base, hover and active backgrounds collapse to the single colour `#B91C1C` — three
states, one colour. `$red-800` mirrors the existing `$green-800` / `$amber-800` steps, preserves the
state ladder, and measures 8.31:1 against white. The published `bursit-ui-tokens@2.0.0` ships light
`--color-error-active: #991B1B`, so this records the shipped behaviour.

#### Scenario: The danger button's three states stay distinct

- GIVEN light mode
- WHEN `--color-error-active` is resolved
- THEN it is `#991B1B`, distinct from `--color-error-hover` `#B91C1C`

#### Scenario: Light primary is the tuned 500 step

- GIVEN light mode
- WHEN `--color-primary` is resolved
- THEN it is `#BA3B54`

### Requirement: BP-05 — Dark-mode semantic mapping

Each token below MUST resolve to the named step. `--color-border` keeps `neutral-800`.

| Token | Step |
|---|---|
| `--color-primary`, `-hover`, `-active` | `wine-300`, `wine-200`, `wine-100` |
| `--color-secondary` | `steel-400` |
| `--color-secondary-strong`, `--color-border-control` | `steel-100`, `neutral-400` (new — BP-06, BP-07) |
| `--color-bg`, `-elevated` | `neutral-950`, `neutral-900` |
| `--color-text`, `-muted` | `neutral-50`, `neutral-400` |
| `--color-text-subtle` | deferred to `sdd-design` — floor in CC-07 |
| `--color-focus-ring`, `--shadow-glow-primary` | `rgba(wine-300, 0.8)` |
| `--btn-secondary-bg`, `-hover-bg` | `steel-200`, `steel-100` |

#### Scenario: Dark primary is not the 400 step

- GIVEN dark mode
- WHEN `--color-primary` is resolved
- THEN it is `wine-300`; `wine-400` measures 4.49:1, a 0.01 miss

### Requirement: BP-06 — New token: `--color-border-control`

`--color-border-control` MUST be added (`neutral-500` light, `neutral-400` dark). Six component tokens
MUST consume it instead of a bare neutral step: `--input-border-color`, `--checkbox-border-color`,
`--radio-border-color`, `--switch-bg`, `--select-hover-border-color`, `--badge-outline-border-color`.

#### Scenario: Control boundaries clear 3:1 in both modes

- GIVEN `--color-border-control` on the control's own background
- WHEN measured in each mode
- THEN light measures 4.73:1 on `--input-bg` and dark measures 5.66:1

#### Scenario: No control token keeps a bare step

- GIVEN the six tokens above
- WHEN their declarations are read
- THEN each resolves through `var(--color-border-control)`

### Requirement: BP-07 — New token: `--color-secondary-strong`

`--color-secondary-strong` MUST be added (`steel-800` light, `steel-100` dark) so the secondary button
keeps its "one step past active" hover. `--btn-secondary-hover-bg` MUST consume it.

#### Scenario: The cyan literal is gone

- GIVEN the whole package source
- WHEN `#155E75` is searched case-insensitively
- THEN zero hits are returned

#### Scenario: Hover darkening is preserved

- GIVEN the secondary button in light mode
- WHEN hover and active backgrounds are compared
- THEN they differ, and white-on-hover measures 12.04:1

### Requirement: BP-08 — No component token may hardcode a colour

Every component-level colour MUST resolve through `var(...)` or a Sass primitive reference; the
primitive block in `_tokens.scss` is the only legal literal site. This is the rule that retires
`#155E75` — it renders at 7.27:1 today, so no visual check catches its survival.

#### Scenario: Hex sweep over the package source

- GIVEN `bursit-ui-tokens/src`
- WHEN a hex-literal sweep is run
- THEN hits are confined to the primitive declarations
- AND no `rgba(`/`rgb(` call takes a numeric or hex channel argument

### Requirement: BP-09 — Light muted/subtle collapse is accepted

Light `--color-text-muted` and `--color-text-subtle` MUST both be `neutral-600` `#505E6D`. **A visible
lightness delta between them MUST NOT be required.** Both tokens MUST stay declared and MUST keep
their existing consumer roles.

The implication is explicit: the 4.5:1 floor on `--color-bg-sunken` outranks visual separation. At
`neutral-600` the token measures 6.35:1 on `--color-bg` and 5.91:1 on `--color-bg-sunken`; the
alternative `neutral-500` `#647587` measures 4.53:1 on `--color-bg` and **4.21:1** on
`--color-bg-sunken`, so it MUST NOT be selected for light mode.

#### Scenario: Light text-subtle clears AA on all three surfaces

- GIVEN light mode
- WHEN `--color-text-subtle` is measured on `--color-bg`, `--color-bg-elevated` and `--color-bg-sunken`
- THEN every ratio is ≥ 4.5:1

#### Scenario: Equality is not a failure

- GIVEN light mode
- WHEN the two tokens are compared
- THEN equality is accepted and MUST NOT be reported as a defect

### Requirement: BP-10 — Info is decoupled from the brand hue

`--color-info` MUST NOT resolve to a brand ramp step. Light values MUST be `#2563EB` and `#1D4ED8`;
dark MUST be a 400-level step of a decoupled family.

#### Scenario: Info survives a brand re-tint

- GIVEN the info semantic
- WHEN its resolved value is compared with the `wine` ramp
- THEN it is not a wine step

## Values deferred to `sdd-design`

Values, not requirements. The spec states the obligation; design picks the number.

1. Dark `--color-text-subtle` (floor in CC-07).
2. The decoupled family's primitive shape — `--color-info`'s values are settled, its step names are not.
3. Whether light `--color-text-muted` moves to restore a delta, permitted only if the 4.5:1 floor on `--color-bg-sunken` still holds.
4. The focus-indicator mechanism, given `src/lib/forms/checkbox/checkbox.scss:32` sets `outline: none`.
5. The OG card's palette copy (register defaulted in BA-04).
