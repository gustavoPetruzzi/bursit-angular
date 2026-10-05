---
contract: gentle-ai.sdd-research/v1
change: rebrand-palette
store: openspec
revision: 1
outcome: blocked
requested_classes:
  - documentation
  - open-web
granted_classes: []
admitted_classes: []
sources: []
validated_claims: []
accessed_at: null
---

# Research: rebrand-palette

Change: `rebrand-palette` · Store: openspec · Revision: 1 · Date: 2026-09-15
**Outcome: `blocked`** — admission denied for every requested evidence class.

## 1. Questions

The `sdd-explore` phase produced `exploration.md` and left six decisions that
require external, source-backed evidence. Retained verbatim as the selected
research request:

| ID | Question | Requested class |
|---|---|---|
| D1 | Secondary direction: is there published precedent for how design systems pair a wine/rose primary with a secondary (steel vs oxblood vs retained cyan)? | documentation, open-web |
| D2 | WCAG 1.4.11 Non-text Contrast: does every input border need 3:1, or only where the border is the sole visual indicator of the control boundary? Normative text plus Understanding guidance. | documentation, open-web |
| D3 | Focus appearance: what do the current WCAG 2.2 focus requirements demand (2.4.11 Focus Not Obscured, 2.4.13 Focus Appearance, and any successor), what are their conformance levels, and does a glow/box-shadow satisfy them (minimum area, minimum contrast)? | documentation, open-web |
| D4 | Existing AA failures: is there a documented best practice for text-on-tinted-surface tokens, and how do established systems (Radix Colors, Tailwind, Material, Primer) structure it? | documentation, open-web |
| D5 | Version mechanics for a design-token package specifically: convention for versioning a visually breaking palette, and expected consumer migration. | documentation, open-web |
| D6 | Scale construction: is there a widely-adopted standard for scale construction and step distribution (Radix Colors 12-step, Tailwind 50–950) worth aligning to, and should the existing inherited structure be kept? | documentation, open-web |

## 2. Admission and Observed Grants

The runtime capability declaration supplied with this phase launch was:

```
documentation = []   (empty)
open-web      = []   (empty)
```

Persistence tools are not evidence grants. No evidence class was admitted.

- **Requested:** `documentation`, `open-web`
- **Granted / observed:** none — both declared grants are empty lists
- **Admitted:** none
- **Effect:** per the fail-closed research lifecycle contract, denial produces
  **no source claims**. This artifact therefore carries zero sources and zero
  validated claims by construction, not by omission.

This phase did not attempt source access through any other channel. Evidence
capability is never inferred from Bash, generic MCP servers, persistence
access, filenames, or unnamed inherited tools. A documentation-retrieval tool
was present in the runtime; it was **not** used, because the declared
`documentation` grant is empty and an empty or undeclared class denies
admission. Using it would have produced claims the contract does not admit.

## 3. Sources

`sources: []` — no source was admitted, so no source can be listed. No URL is
cited in this artifact as evidence. Nothing in §6 below is a source: the
retrieval targets are locators for a future, properly granted run and assert
nothing about their own content.

## 4. Validated Claims

`validated_claims: []` — no claim is admitted.

The task asked for a verdict per decision (confirm or contradict the
exploration). **No such verdict can be issued under this grant set.** Producing
one would require asserting the content of W3C normative text, vendor
documentation, or design-system source without an admitted source, which is
exactly what the contract forbids. There is no partial credit here: an
unvalidated claim is not made safer by labelling it "likely" or "well known".

## 5. Contradictions, Uncertainty, and Freshness

- **Contradictions:** none recorded. Detecting a contradiction requires
  admitted sources on both sides; none were admitted.
- **Uncertainty:** total for D1–D6 as external evidence. The exploration's own
  measurements remain what they were — internally derived, self-consistent, and
  **not externally validated by this phase**.
- **Freshness:** not applicable; `accessed_at: null`.
- **Load-bearing risk:** D2, D3, and D4 each turn on normative accessibility
  text whose wording determines whether the exploration's proposed change is
  *required*, *permitted*, or *optional*. D2 and D3 in particular decide whether
  `--color-border-control` and the raised focus alpha are compliance fixes or
  discretionary refinements. Leaving these unresolved and proceeding to
  `propose` would let a normative question be settled by preference.

## 6. Retrieval Plan (NOT sources — no content asserted)

For a future run with `documentation` and/or `open-web` granted, in priority
order. These are locators only; this artifact asserts nothing about what they
say.

| Decision | Primary (normative/vendor) target class | Secondary (supporting colour only) |
|---|---|---|
| D2 | W3C WCAG 2.2 Success Criterion 1.4.11, plus the WCAG Understanding document for that criterion | — |
| D3 | W3C WCAG 2.2 SC 2.4.11 and SC 2.4.13, plus their Understanding documents; check for any newer successor requirement | — |
| D1 | Published design-system documentation showing secondary/neutral pairing practice | Design-system blog posts |
| D4 | Radix Colors, Tailwind CSS, Material Design, GitHub Primer token documentation for text-on-tinted-surface structure | — |
| D5 | The token package's own release tooling documentation; semantic-versioning guidance for design systems | — |
| D6 | Radix Colors scale documentation; Tailwind CSS colour-scale documentation | — |

Note for D3 in particular: the conformance level of each criterion (AA vs AAA)
must be read from the specification itself. It is precisely the kind of fact
this phase was asked to establish and is therefore deliberately **not** stated
here from model memory.

## 7. Product Choices (separate, non-authoritative)

Recorded for traceability. These are **not** evidence and carry no admission:

- The exploration's recommendation of `steel` for D1, and of a mode-specific
  `--color-border-control` token for D2, remain unratified proposals.
- No product choice is confirmed by this phase.
- Per the research lifecycle contract, product decisions are owned by the
  orchestrator/human and are separate from evidence.

## 8. Blocked Recovery State

- **Blocking condition:** no evidence class granted. Nothing was fabricated as a
  substitute; no source claim was emitted.
- **Retained:** the selected research request (§1) and the exploration
  reference. The request is intact and re-runnable.
- **Persistence:** `gentle-ai.sdd-research/v1` written to this file;
  `gentle-ai.sdd-preproposal/v1` updated at
  `openspec/changes/rebrand-palette/preproposal.md` with
  `proposal_ready: false`.
- **Unblock requires one of:**
  1. Re-launch this phase with `documentation` and/or `open-web` granted, and
     the specific permitted source set declared — then §1 questions can be
     answered with cited, quoted evidence; **or**
  2. An explicit human decision to proceed to `sdd-propose` with D1–D6 treated
     as **unresolved product choices** rather than evidence-backed findings.
     That is a lawful outcome, but it must be stated as such: the proposal
     would then carry unresolved normative questions, and D2/D3 (accessibility
     compliance) would be decided by preference.
- **Do not** treat this artifact as "research found nothing". It records that
  research was **not permitted to look**. The distinction matters for how the
  next phase is allowed to proceed.
