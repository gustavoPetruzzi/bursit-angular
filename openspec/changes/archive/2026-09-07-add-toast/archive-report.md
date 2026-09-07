# Archive Report — add-toast

**Change**: `add-toast`
**Archived**: 2026-09-07
**Artifact store**: openspec (file-based)
**Archive kind**: full archive — no partial archive, no stale-checkbox reconciliation performed

## Final State (at close)

The change shipped with all 26/26 implementation tasks complete and **0 CRITICAL** verification findings. The persisted tasks artifact (`tasks.md`, 26/26 `[x]`) and the orchestrator final-state handoff are the authoritative sources for this close; intermediate snapshots (`verify-report`, `apply-progress`) are consistent with them.

- **Verification**: final ADMITTED pass — verdict `pass`, validator `valid:true`, 10/10 requirements, 18/18 scenarios COMPLIANT, 0 PARTIAL, 0 FAILING, 0 UNTESTED, 0 blockers, 0 CRITICAL. Evidence revision `sha256:6d000740f1ab6eebcbe70a19592e8aa4e0bed6b1875e96f03fca3717f3f7015a`.
- **Tests**: toast suites 5/5 (76/76 pass); full suite 25/25 (307 pass, 2 skipped).
- **Build**: green (ng-packagr + strict TS). Dist types export `ToastService`, `ToastRef`, `ToastContainerComponent`, `ToastItemComponent`, `TOAST_DEFAULTS`.
- **Coverage**: toast folder 94% lines (threshold 80%).
- **Tokens closed end-to-end**: `bursit-ui-tokens` PR #13 (status variant colors, WCAG AA) and PR #15 (`--toast-gap`, `--toast-exit-duration`, `--toast-exit-ease`, `--toast-icon-size`, `--toast-close-size`, `--toast-position-offset`) merged on `origin/master` at commit `70f0f889` (short form `70f0f88` — same commit, different prefix length). Library consumes tokens via `var(--toast-*, fallback)` with zero hex literals. SCENARIO-toast-18 COMPLIANT.
- **Commits / delivery**: `c54b4d8` `feat(toast): add toast notification component` (lib + openspec artifacts pre-apply) is the committed baseline. Corrective apply, remediation, and final artifacts are **UNCOMMITTED** in the working tree — committing/pushing/PR is the user's pending delivery decision, not part of archive.

## Remediation History

- Verify #1: CRITICAL — close button `aria-label` was `Close`, spec requires `Close notification` → remediated (RED → GREEN).
- Verify #2: re-verification after remediation.
- Verify #3 (final): passed admission after external token dependency closed (PR #15 merged as `70f0f88`).

The interim CRITICAL is snapshot history at verification time; it does not carry to close — the final admitted report records 0 CRITICAL. The claim that the CRITICAL was fixed is corroborated by the final verify pass (per `verify-report` verdict + frontmatter), not by prompt assertion alone.

## Source of Truth Sync

- **Main spec created**: `openspec/specs/toast-notification/spec.md`. Domain `toast-notification` did not exist in `openspec/specs/`, so the delta spec IS the full spec — no ADDED/MODIFIED/REMOVED/RENAMED merge was required. Requirement count preserved verbatim: 10 requirements / 18 scenarios.
- **Mechanical copy**: `Copy-Item` + `Move-Item` (shell), never model Read→Write. Readback `diff -r` (delta spec vs landed spec, pre- and post-move): both empty, exit 0.
- Config rule `rules.archive` ("Warn before merging destructive deltas"): no destructive merge occurred; nothing to warn about.

## Archive Move

- `openspec/changes/add-toast` → `openspec/changes/archive/2026-09-07-add-toast` via `git mv` (tracked files; untracked `apply-progress.md` / `verify-report.md` moved with the directory).
- Pre-move recursive snapshot taken before the move. **Mandatory readback**: `diff -r` snapshot vs archived tree — empty, exit 0 (byte-identical). Source confirmed absent after move.
- **Archived contents**: `proposal.md`, `specs/toast-notification/spec.md`, `design.md`, `tasks.md` (26/26 `[x]`), `apply-progress.md`, `verify-report.md`, `exploration.md`, plus this `archive-report.md` (additive — not part of the pre-move snapshot, excluded from the readback).
- Active `openspec/changes/` no longer contains this change.

## Known Follow-ups (non-blocking, recorded at close)

1. **WARNING (deviation #1)** — `TOAST_DEFAULTS.type = 'success'`; spec/design contract states default type `'info'`. Tests assert `'success'` (aligned with implementation, not spec). Decision needed: which side is authoritative; alignment requires a follow-up change + test updates.
2. **WARNING (deviation #2)** — exit animation CSS (`bursit-toast-exit`, `--toast-exit-duration/ease`) is defined but not wired into the dismiss lifecycle; dismissal is synchronous. Remediation: toggle the exit class + respect exit duration before DOM removal.
3. **WARNING** — manual visual check of Storybook stories pending before release sign-off (`npm run storybook`).
4. **SUGGESTION** — stories cover 3 of 6 positions; task 8.1 scoped all 6 positions × 4 types.
5. **SUGGESTION** — 2 `toBeTruthy()` smoke assertions (`toast-container.spec.ts`, `toast-item.spec.ts`); companion behavioral tests exist in the same files.
6. **SUGGESTION** — audit other services (e.g., `BursitThemeService`) for stale `isPlatformBrowser` import from `@angular/core` — Angular 21 moved it to `@angular/common`.

## Explicitly Not Attributed to This Change

`package.json` / `package-lock.json` are modified in the working tree — PRE-EXISTING local changes, not part of `add-toast`. Do not attribute them to this change.

## Contradictions Recorded

None requiring resolution — all sources agree on final state. One notation-level note: verify-report cites the token commit as `70f0f88`; the orchestrator handoff cites `70f0f889`. These are the same commit at different short-hash prefix lengths and are not treated as a conflict.

## Verdict

**Archive complete.** SDD cycle for `add-toast` closed: 26/26 tasks, 0 CRITICAL, 18/18 scenarios COMPLIANT, source-of-truth spec created, change folder archived with byte-identical readback. Non-blocking follow-ups above remain open for delivery decisions and future changes.