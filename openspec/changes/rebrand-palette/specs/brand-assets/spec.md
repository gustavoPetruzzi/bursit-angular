# brand-assets Specification

## Purpose

The landing surfaces that carry the brand mark: favicons, the three wordmark/code-block marks, and the
Open Graph card. This capability is **partially blocked**: only a raster `logo.jpeg` exists, so the
assets that require vector geometry cannot be built yet. This spec states the precondition rather
than a completion claim.

## Requirements

### Requirement: BA-01 — Vector artwork is a precondition, not a task

No vector source for the mark exists in either repository. Because of this, the brand mark's SVG
derivatives (favicon geometry, wordmark mark, OG card artwork) MUST NOT be treated as implementable
work and MUST NOT be reported as complete. The requirement is satisfiable only once a vector master
(or an equivalent re-rendered source at the required resolution) exists in the repo.

#### Scenario: The blocker is observable

- GIVEN the repo
- WHEN a vector source for the brand mark is searched for
- THEN none exists, and the mark-dependent assets remain incomplete by design

#### Scenario: The work is not silently absorbed

- GIVEN the precondition is unmet at apply time
- WHEN scope is confirmed
- THEN the mark-dependent work is split out or the artwork is produced first — it is not marked done

### Requirement: BA-02 — Favicons stop shipping the framework's mark

**Amended (verify remediation, 2026-09-22).** The favicon swap is mark-dependent work and is
**split out of this change under BA-01** by the same human decision that struck task 4.5 (design.md
"Artwork fork": *they MUST NOT be reported complete while unmet*; `tasks.md` line 25). There is no
vector master, so `favicon.svg` / `favicon.ico` cannot be re-marked here. The deferred MUSTs — the
SVG must stop shipping the Astro logo path (`M50.4 78.5a75.1…`, fills `#000` / `#FFF`) and carry the
brand mark; the ICO must become a real ICO or be removed — transfer **in full** to the artwork
gated change. This change's obligations are that the split is observable (not silently absorbed)
and that the framework-era assets stay inert while they wait: nothing our pages emit requests them.
`favicon.ico` remains the 655-byte PNG file named `.ico` at `landing/public/favicon.ico`.

#### Scenario: The framework logo is gone — while unmet, the deferral is observable

- GIVEN the artwork precondition (BA-01) unmet at verify time
- WHEN `landing/public/favicon.svg` path data and the deferral record are inspected
- THEN the file is unchanged from the framework placeholder and the deferral is recorded in
  `tasks.md` 4.5, design.md and this requirement — it is not marked done

#### Scenario: The implicit request does not 404

- GIVEN a browser requesting `/favicon.ico`
- WHEN every reference to it in the landing source is searched
- THEN our pages emit no such request (0 references in `BaseLayout.astro` or any component; only
  the SVG icon link at `BaseLayout.astro:21` exists), and its replacement or removal is tracked by
  the deferral above

### Requirement: BA-03 — The three placeholder marks carry the mark's tonal axis

`Nav.astro:108`, `Footer.astro:87` and `global.scss:407` all declare the same
`linear-gradient(135deg, var(--color-primary), var(--color-secondary))` square. All three MUST be
handled once and consistently, and MUST carry the mark's own tonal axis (`#835A60` → `#4E383E`) rather
than a gradient between two hue families. Where the real mark is used, BA-01 applies.

#### Scenario: One decision, three sites

- GIVEN the three declarations
- WHEN they are inspected after the change
- THEN all three express the same mark treatment
- AND none is a primary-to-secondary gradient square

### Requirement: BA-04 — The OG card palette is re-copied and its comment is true

The seven literals in `generate-og-image.mjs` MUST be re-copied to the new palette, and
`og-image.png` MUST be regenerated so the committed raster matches the script. The header comment
claims every value comes from the dark layer; that is currently false for `primary` and `secondary`,
which are light-mode values on a dark-surface card. The comment MUST match reality and the register
MUST be chosen deliberately. Default: the dark register.

#### Scenario: No stale literal survives

- GIVEN `PALETTE` in `generate-og-image.mjs`
- WHEN its values are compared with the palette contract
- THEN each is either a dark-register value or is documented as deliberately light
- AND none is a retired-identity colour

#### Scenario: Committed raster matches the script

- GIVEN `npm run og-image`
- WHEN the script's self-check on the 1200×630 output passes
- THEN the committed `og-image.png` is the file it produced

### Requirement: BA-05 — Both landing modes render on the new palette

The landing MUST render correctly in light and dark mode with the new palette, including the hero
atmosphere, which consumes `--color-primary-alpha-15` and `--color-secondary-alpha-8` and needs no
edit but changes appearance materially. This requirement is satisfied by evidence — a light render and
a dark render retained for review — not by a command.

#### Scenario: Two-mode render evidence

- GIVEN the landing built against the published package
- WHEN the home page is rendered in each mode
- THEN both renders are retained and show no retired-identity colour and no unreadable text

## Values deferred to `sdd-design`

1. The OG card's final palette copy per register, including its `textSubtle` value, which depends on the deferred dark `--color-text-subtle` (CC-07).
2. The mark treatment itself (gradient stops, geometry, sizing per surface).
