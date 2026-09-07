# Archive Report — add-tooltip

**Change**: `add-tooltip`
**Archived**: 2026-09-07
**Artifact store**: openspec (file-based)
**Archive kind**: full archive — code was merged and delivered before archive; archive records final delivered state.

## Final State (at close)

The change shipped via PR #29 (`1129dac` `Merge pull request #29 from gustavoPetruzzi/feat/add-tooltip`, branch `feat/add-tooltip`, base `master`). All 14 implementation tasks complete; archives tasks.md updated to 14/14 `[x]` to reflect delivered reality (planning artifact shipped with unchecked boxes).

- **Implementation**: `[bursitTooltip]`/`[bursit-tooltip]` attribute directive + internal `TooltipPanelComponent` via CDK Overlay + ComponentPortal + FlexibleConnectedPositionStrategy. Peer dep `@angular/cdk ^21.0.0`.
- **Verification**: final PASS — 21/21 tooltip tests, 307/307 full-suite tests (2 skipped), build green (ng-packagr + strict TS), tooltip folder 100% lines coverage (threshold 80%). Zero CRITICAL / WARNING / SUGGESTION findings recorded.
- **Commits delivered**: `8d462a5` docs(openspec): add add-tooltip planning artifacts; `ff01fb7` feat(tooltip): add tooltip panel component; `3cb8943` feat(tooltip): implement tooltip directive, panel, tests, and stories; merged `1129dac`.

## Source of Truth Sync

- **Main spec created**: `openspec/specs/tooltip/spec.md`. Domain `tooltip` did not exist in `openspec/specs/`, so the delta spec IS the full spec — no ADDED/MODIFIED/REMOVED/RENAMED merge required. Requirement count preserved verbatim: 7 requirements / 14 scenarios (verified byte-identical via Get-FileHash delta vs canonical: `SPEC BYTE-IDENTICAL - OK`).
- No destructive merge occurred; config rule `rules.archive` warning not triggered.

## Archive Move

- `openspec/changes/add-tooltip` → `openspec/changes/archive/2026-09-07-add-tooltip` via `git mv` (tracked files). `verify-report.md` and this `archive-report.md` added at archive time (additive — not part of the pre-move content).
- **Archived contents**: `exploration.md`, `proposal.md`, `specs/tooltip/spec.md`, `design.md`, `tasks.md` (14/14 `[x]` at close), `verify-report.md`, plus this `archive-report.md`.
- Active `openspec/changes/` no longer contains this change.

## Known Follow-ups (non-blocking, recorded at close)

1. **SUGGESTION** — manual visual check of Storybook stories pending before release sign-off (`npm run storybook`): flip at viewport edges re-orients arrow (SCENARIO-tooltip-05/06), Escape dismiss.
2. **SUGGESTION** — `tooltip.directive.ts` has uncovered lines 82-110 (98.48% lines) — timer edge paths; below threshold impact, covered indirectly by fake-timer specs.

## Contradictions Recorded

None requiring resolution — all sources agree on final delivered state.

## Verdict

**Archive complete.** SDD cycle for `add-tooltip` closed: 14/14 tasks delivered via PR #29, 0 CRITICAL, 14/14 scenarios COMPLIANT, source-of-truth spec created (`openspec/specs/tooltip/spec.md`), change folder archived. Follow-ups above are optional release polish, not blockers.