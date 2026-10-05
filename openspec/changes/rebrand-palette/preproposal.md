---
contract: gentle-ai.sdd-preproposal/v1
change: rebrand-palette
store: openspec
revision: 2
exploration:
  outcome: complete
  reference: openspec/changes/rebrand-palette/exploration.md
research:
  reference: openspec/changes/rebrand-palette/research.md
  request:
    questions: [D1, D2, D3, D4, D5, D6]
    classes: [documentation, open-web]
  admission: denied
  outcome: blocked
  sources_admitted: 0
  validated_claims: 0
  resolution: unselected_by_human_decision
  resolution_basis: recovery-path-2
evidence_references:
  openspec:
    - openspec/changes/rebrand-palette/exploration.md
    - openspec/changes/rebrand-palette/research.md
  engram: []
product_decisions: confirmed
proposal_ready: true
---

# Pre-Proposal State: rebrand-palette

- **Change:** `rebrand-palette`
- **Store:** openspec
- **Revision:** 2
- **Exploration:** complete (`exploration.md`)
- **Research:** requested (`documentation`, `open-web`) → admission denied → outcome `blocked` → **unselected by explicit human decision**
- **Product decisions:** `confirmed`
- **`proposal_ready`: `true`**

## How this became ready

The selected research lane could not run. The executor's contract requires an
orchestrator-supplied `gentle-ai.sdd-research-capability/v1` declaration, and no
definition, schema, config surface, or CLI path for that declaration exists in the
installed build. Admission was denied for every requested class, and the phase
correctly failed closed rather than emitting unvalidated claims.

That is a blocker in the provider, not in this change. It sits on an existing
canonical tracker for the same causal class, and it was reported there as an
occurrence rather than as a new issue.

The human therefore took **recovery path 2** from `research.md`: proceed with the
questions as product choices, accepted knowingly. D2 and D3 are accessibility
conformance questions and were settled by judgement rather than by normative text.
Downstream phases MUST NOT cite any source claim from `research.md`, because that
artifact contains none.

## Confirmed product decisions

| # | Decision | Resolved as |
|---|---|---|
| D1 | Secondary direction | **Steel** — hue 210, taken from the logo's own background field. Chosen over `oxblood` (more logo-true but collapses the key/value distinction in the landing's code blocks and flattens the hero) and over keeping `cyan` (no basis in the new logo). |
| D4 | Scope of the 18 pre-existing AA failures | **Fix all 18.** Accepted knowing this likely exceeds the 400-line review budget; the review-workload guard resolves that after `sdd-tasks` forecasts, via chained PRs or an explicit `size:exception`. |
| — | Technical recommendation bundle | **All accepted:** add `--color-border-control` (no single neutral step reaches 3:1 in both modes); raise focus-indicator alpha from 0.3 to 0.7 light / 0.8 dark; replace the hardcoded `--btn-secondary-hover-bg: #155E75` with a proper `--color-secondary-strong`; raise `--color-text-subtle` to `neutral-600` so it clears AA on `--color-bg-sunken`; declare the palette change breaking (`feat!`) with a major bump; tint the Storybook chrome to the brand instead of Storybook's own themes. |

## Not separately decided

- **Open Graph card register.** No explicit choice was made. Low stakes and
  reversible: default to the dark register, matching the logo's own canvas.

## Notes carried forward

- `alert.scss` and `badge.scss` use a 500-level token as text on a 10% tint of
  itself. `toast.scss` already documents the correct pattern — the fix is to point
  those tokens at `--color-*-text`, not to tune the palette around the bug.
- `--color-success-contrast` cannot stay white: white on any usable mid-green tops
  out near 3.5:1. It becomes ink.
- There is no vector artwork for the new logo anywhere — only raster. Favicon,
  wordmark mark, and the OG card are blocked on someone producing it.
