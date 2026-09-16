# contrast-conformance Specification

## Purpose

Measured WCAG 1.4.3 (4.5:1 text) and 1.4.11 (3:1 UI components, boundaries, focus indicators)
requirements for the rebrand, in both modes. The 18 `CP-*` pairs below are the corrected set: 17 are
defects the change fixes by explicit decision, and CP-13 is a regression guard (see CC-03). Ratios are
the self-derived measurements in this change's `exploration.md` (§5), taken against the outgoing
palette — they are defect evidence, not authority, and every value is re-measured per CC-01. This
capability introduces no external citation.

## Requirements

### Requirement: CC-01 — Measurement is reproducible against the published package

Every pair in this spec MUST be measured with the WCAG 2.x relative-luminance formula
`(L1 + 0.05) / (L2 + 0.05)`, reported to two decimals, in **both** modes, against the **published**
package values. Measurements MUST be re-run for this change; the exploration's numbers MUST NOT be
inherited as the result.

#### Scenario: Re-measurement, not inheritance

- GIVEN the published major installed in this repo
- WHEN the pair set is measured
- THEN every value is computed from the installed artifact
- AND the result records light and dark separately

**Baseline measurement (installed `bursit-ui-tokens@1.2.0`):** 27 FAIL / 17 PASS across the 44 Group A
lines; 21 of the 22 pairs fail in at least one mode; **6** fail in both — CP-02, CP-03, CP-15, CP-16,
CP-17, CP-18. Group B: 21 FAIL / 4 PASS of 25 lines. The plan originally predicted "22 fail in both
modes"; that prediction is **refuted** — it is arithmetically impossible against the artifact, which
would require all 44 Group A lines to FAIL. Evidence: `verify-report.md` and
`contrast-baseline-1.2.0.txt`.

### Requirement: CC-02 — Threshold selection follows the token's consumer role

Text MUST reach 4.5:1. UI components, control boundaries and focus indicators MUST reach 3:1. Where a
token renders text — including `--input-placeholder-color`, which resolves to `--color-text-subtle`
(`input.scss:64`) — the 4.5:1 threshold applies regardless of the token's name.

#### Scenario: Named "subtle" does not lower the bar

- GIVEN `--color-text-subtle` consumed as placeholder text
- WHEN its threshold is chosen
- THEN 4.5:1 applies

### Requirement: CC-03 — The 18 listed pairs all pass

Each pair below MUST pass its threshold in both modes. Each row is an independently verifiable check
item; a verification run MUST report one result per ID.

| ID | Foreground on background | Today | Need |
|---|---|---|---|
| CP-01 | `--color-primary` text on `--color-bg` (landing `a`, `global.scss:117`) | 4.27:1 | 4.5 |
| CP-02 | `--color-text-subtle` on `--color-bg-elevated` | 2.56:1 | 4.5 |
| CP-03 | `--input-border-color` (`neutral-200`) on `--input-bg` | 1.23:1 | 3 |
| CP-04 | `--badge-primary-color` on `--badge-primary-bg` | 4.47:1 | 4.5 |
| CP-05 | `--color-primary` on `--color-primary-alpha-8` | 3.87:1 | 4.5 |
| CP-06 | `--color-secondary` on `--color-secondary-alpha-8` | 2.17:1 | 4.5 |
| CP-07 | `--alert-success-color` on `--alert-success-bg` | 2.01:1 | 4.5 |
| CP-08 | `--alert-warning-color` on `--alert-warning-bg` | 1.91:1 | 4.5 |
| CP-09 | `--alert-error-color` on `--alert-error-bg` | 3.17:1 | 4.5 |
| CP-10 | `--alert-info-color` on `--alert-info-bg` | 2.60:1 | 4.5 |
| CP-11 | `--color-success-contrast` on `--color-success` (filled badge) | 2.28:1 | 4.5 |
| CP-12 | `--color-error-contrast` on `--color-error` | 3.76:1 | 4.5 |
| CP-13 | `--color-warning-contrast` on `--color-warning` | 8.31:1 (light) / 11.64:1 (dark) | 4.5 |
| CP-14 | `--color-info-contrast` on `--color-info` | 2.98:1 | 4.5 |
| CP-15 | `--shadow-glow-primary` on `--color-bg` | 1.46:1 | 3 |
| CP-16 | `--color-focus-ring` on `--color-bg` (light) | 1.68:1 | 3 |
| CP-17 | `--color-focus-ring` on `--color-bg` (dark) | 2.20:1 | 3 |
| CP-18 | `--color-text-subtle` on `--color-bg` (dark) | 2.57:1 | 4.5 |

**CP-13 is a regression guard, not a defect.** The 2.15:1 figure this row previously recorded
described white on `--color-warning` `#f59e0b` — a pairing this package has never shipped. The
installed `bursit-ui-tokens@1.2.0` declares `--color-warning-contrast: #0f172a` (light,
`index.css:39`) and `#080d17` (dark, `index.css:192`), measuring **8.31:1** and **11.64:1** against
`--color-warning` `#f59e0b` / `#fbbf24`. The shipped pairing already passes in both modes. The row
stays in the set so the value cannot silently regress, but it is **not counted as one of the failures
this change corrects** — the defect count is 17 of the 18 pairs.

#### Scenario: Full pair set reported per ID

- GIVEN the published palette
- WHEN CC-03 is verified
- THEN 18 results are reported, each naming its ID, mode and ratio
- AND no result is reported as a single aggregate

#### Scenario: CP-18 uses the text threshold

- GIVEN CP-18
- WHEN its threshold is applied
- THEN 4.5:1 is used, not the 3:1 the exploration recorded — the token renders placeholder text

### Requirement: CC-04 — The tint-as-text defect class is closed

No token that resolves to a 500-level primitive MUST be used as a foreground on an `-alpha-*` tint of
itself. `alert.scss` and `badge.scss` MUST consume `--color-{variant}-text` for
`--alert-{variant}-color`, `--alert-{variant}-icon-color`, `--alert-{variant}-border-color` and
`--badge-subtle-{variant}-color`, matching `toast.scss:6–9`, which documents the correct pattern.
The fix is the pairing, not the palette: with the tuned ramp the best achievable in the defect shape
is 2.99:1 (success) and 3.22:1 (warning).

This closes four further pairs with the identical defect that the §5.1 enumeration omits:
`--badge-subtle-{success,warning,error,info}-color` on its own tint, measured at the same ratios as
their alert counterparts.

#### Scenario: Alert and badge consume the `-text` semantic

- GIVEN `alert.scss` and `badge.scss`
- WHEN their variant colour tokens are read
- THEN each foreground resolves to `--color-{variant}-text`

#### Scenario: No 500-level token sits on its own tint

- GIVEN the whole component source
- WHEN a token resolving to a 500-level primitive is used as a colour over its own `-alpha-*` background
- THEN zero such pairings remain

### Requirement: CC-05 — Filled-variant ink is chosen per fill

`--color-{variant}-contrast` MUST reach ≥ 4.5:1 on its own fill in each mode. Light
`--color-success-contrast` MUST become `neutral-950` ink (6.53:1); white on any usable mid-green
cannot pass, and the alternative mid-green + white measures 3.30:1. Light
`--color-warning-contrast` already passes against the shipped 1.2.0 (`#0f172a` on `#f59e0b` = 8.31:1;
dark `#080d17` on `#fbbf24` = 11.64:1 — see CC-03) and MUST NOT change.

#### Scenario: Success ink is not white

- GIVEN light mode
- WHEN `--color-success-contrast` is read
- THEN it is `#22282E`
- AND white-on-`--color-success` is not a shipped pairing

### Requirement: CC-06 — Focus indicators are independently sufficient

`--color-focus-ring` and `--shadow-glow-primary` MUST each measure ≥ 3:1 on `--color-bg` in both
modes (light `rgba(wine-500, 0.7)` measures 3.12:1; dark `rgba(wine-300, 0.8)` measures 5.14:1).
`projects/bursit-angular/src/lib/forms/checkbox/checkbox.scss:32` sets `outline: none` on
`:focus-visible`, so checkbox focus MUST be satisfied by `--checkbox-focus-shadow` (which resolves to
`--shadow-glow-primary`) alone. It is the only `outline: none` in this repo; radio and switch do not
suppress their outline.

#### Scenario: Glow alone passes where the outline is removed

- GIVEN a focused checkbox (`outline: none`, focus rendered by `--checkbox-focus-shadow`)
- WHEN the glow is measured against the background
- THEN it is ≥ 3:1 in both modes

### Requirement: CC-07 — Dark `--color-text-subtle` clears the text threshold

Dark `--color-text-subtle` MUST reach ≥ 4.5:1 on `--color-bg`, because it renders placeholder text
(CC-02). The exploration's candidate `neutral-500` `#647587` measures **3.14:1** and therefore MUST
NOT be adopted. The step itself is a `sdd-design` value decision.

Note a measurement mismatch to reconcile in design: the 2.57:1 figure for CP-18 was taken against the
**outgoing** dark background; the exploration's 3.14:1 candidate is measured against the new
`#22282E`. The same step does not hold its ratio across the two canvases.

#### Scenario: The candidate is rejected

- GIVEN `neutral-500` as dark `--color-text-subtle`
- WHEN it is measured on `#22282E`
- THEN the ratio is 3.14:1 and the candidate fails

#### Scenario: The adopted step is not white-on-dark by accident

- GIVEN the adopted dark `--color-text-subtle`
- WHEN measured on `--color-bg` and `--color-bg-elevated`
- THEN both ratios are ≥ 4.5:1

## Values deferred to `sdd-design`

1. The dark `--color-text-subtle` step satisfying CC-07.
2. The focus-indicator mechanism (glow alpha is settled; whether an outline is restored is not).
