```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:bd2de718410927d5551d61b01d26000f32e12fcde8586b3139101571cdd7fef2
verdict: fail
blockers: 1
critical_findings: 2
requirements: 1/29
scenarios: 6/43
test_command: npm run test
test_exit_code: 0
test_output_hash: sha256:257329feaef0f3c6d72fb255ae0d6ce8a470ee4553ad7bb6423ebe15bd198560
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:86f3d3eab4c63951361cd6f08efafb249c249094bf5cc6d6f277bac3f0f999a4
```

## Verification Report

**Change**: `rebrand-palette` — **Phase 1 only** (`feat/rebrand-palette-harness`, chained PR #1)
**Version**: N/A (change not archived)
**Mode**: Strict TDD (openspec/config.yaml `strict_tdd: true`, Jest available)
**Verified revision**: `scripts/check-contrast.mjs` `sha256:bd2de718…d7fef2` (482 lines, zero dependencies) + the `check:contrast` entry in `package.json`

### Scope and honesty statement

This report verifies the **Phase 1 slice** (tasks 1.1–1.6): the contrast harness and its retained
1.2.0 RED baseline. It **does not** verify the change. Phases 2–5 are unimplemented — 20 of the
change's 26 task checkboxes are unchecked — because the external publish gate is closed
(`npm view bursit-ui-tokens@2.0.0` → `E404`, `npm view bursit-ui-tokens version` → `1.2.0`).

Read the verdict accordingly: **FAIL** is the correct verdict for the change, and it is not a
criticism of the Phase 1 slice, whose own acceptance criteria are satisfied. A reader must not
take this artifact as evidence that `rebrand-palette` is verified, passing or complete. It is not.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 26 |
| Tasks complete | 6 (Phase 1: 1.1–1.6) |
| Tasks incomplete | 20 (Phase 2: 6, Phase 3: 3, Phase 4: 5 incl. the struck-out 4.5, Phase 5: 6) |
| Requirement groups verified | Phase 1 slice only |

### Build & Tests Execution

**Build**: ✅ Passed — `npm run build` (schematics tsc + ng-packagr), exit `0`, `Built bursit-angular`.
No product source was changed by this slice, so the build only proves the slice is inert.

**Tests**: ✅ 314 passed / 2 skipped / 0 failed, 26 suites — `npm run test` (Jest via
`@angular-builders/jest:run`), exit `0`, 32.5 s. The slice adds no `.spec.ts`; the suite proves the
existing library still passes, nothing about the harness.

**Harness acceptance run** (the slice's own evidence): `npm run check:contrast` → exit `1`
(`RED` by design against 1.2.0), stdout 83 lines, `sha256:0c9487d3…01549c`, stderr 0 bytes,
deterministic across two runs (`sha256:A83A2A56…` for the captured console text of both runs).
`node scripts/check-contrast.mjs --self-test` → exit `0`, 9/9 pass, `sha256:65ffdd9c…4d7df89`.

**Coverage**: ➖ Not applicable to the changed file. `collectCoverageFrom` covers only
`projects/bursit-angular/src/lib/**/*.ts`; `scripts/check-contrast.mjs` is outside it, and the
config states `threshold_enforced: false`.

### Independent verification of the WCAG mathematics

This is the highest-value check in the phase: the harness is the measuring instrument for every
downstream phase, so a wrong luminance or a wrong ratio would make a future GREEN a lie. I
re-derived the ratios from the token values in the **installed**
`node_modules/bursit-ui-tokens/index.css` (1.2.0), by hand and then with a fresh implementation
written from the specs, without importing the harness.

Formula implementation review (`scripts/check-contrast.mjs:323–338`): sRGB linearisation with the
`0.04045` threshold and the `/12.92` low branch, coefficients `0.2126 / 0.7152 / 0.0722`,
`(lighter + 0.05) / (darker + 0.05)`. This is the WCAG 2.x lazy-SRGB model and it is correct.

Hand derivation, CP-01 light (`--color-primary` on `--color-bg`):

```
#6366f1 → r 99/255  → 0.388235 → lin 0.124771
          g 102/255 → 0.400000 → lin 0.132868
          b 241/255 → 0.945098 → lin 0.879639
          L = 0.2126(0.124771) + 0.7152(0.132868) + 0.0722(0.879639) = 0.185063
#f8fafc → L = 0.2126(0.938685) + 0.7152(0.955969) + 0.0722(0.973445) = 0.953556
ratio = (0.953556 + 0.05) / (0.185063 + 0.05) = 1.003556 / 0.235063 = 4.2693 → 4.27
```

| Pair (as declared in the harness table) | Resolved value | Verifier | Harness | Match |
|---|---|---|---|---|
| CP-01 light, solid on solid | `#6366f1` on `#f8fafc` | 4.27 (raw 4.269328) | 4.27 | ✅ |
| CP-03 light, **`var()` chain** | `var(--color-neutral-200)` = `#e2e8f0` on `var(--input-bg → --color-bg-elevated)` = `#ffffff` | 1.23 | 1.23 | ✅ |
| CP-03 dark, `var()` + dark override | `#1e293b` on `#0f172a` | 1.22 | 1.22 | ✅ |
| CP-05 light, **alpha tint composite** | `#6366f1` on `rgba(99,102,241,0.08)` over `#f8fafc` = `rgb(236.08, 238.16, 251.12)` | 3.87 | 3.87 | ✅ |
| CP-05 dark, alpha tint | `#818cf8` on `rgba(129,140,248,0.08)` over `#080d17` | 5.96 | 5.96 | ✅ |
| CC04-01 light, alpha tint through **two** `var()` chains | `--color-success` `#22c55e` on `--color-success-alpha-10` over `#f8fafc` | 2.01 | 2.01 | ✅ |
| CP-16 light, **translucent foreground** | `rgba(99,102,241,0.4)` composited over `#f8fafc` | 1.68 | 1.68 | ✅ |
| CP-15 dark, colour **extracted from a box-shadow** | `rgba(129,140,248,0.35)` from `0 0 0 3px …` over `#080d17` | 1.78 | 1.78 | ✅ |
| CP-02 light, declared surface | `#94a3b8` on `#ffffff` | 2.56 | 2.56 | ✅ |
| CP-13 light | `#0f172a` on `#f59e0b` | 8.31 (raw 8.312541) | 8.31 | ✅ |
| CP-13 dark | `#080d17` on `#fbbf24` | 11.64 (raw 11.644941) | 11.64 | ✅ |

**Every independently derived ratio matches the harness exactly.** Beyond the sampled pairs, I also
wrote a complete independent re-implementation — my own brace scanner, `var()` resolver, colour
extractor, source-over compositor and luminance, with the 22 pairs re-declared from the specs rather
than copied from the harness — and its 44 Group A lines are **identical to the harness's 44 lines,
ID by ID, ratio by ratio, status by status** (`Compare-Object` reports zero differences).

The compositing path is therefore verified against real alpha tints, not just solids: a tint is
composited over its declared surface, a translucent foreground is then composited over the tint,
and the ratio is taken between the two composited colours.

### CC-01 reading scope — the harness reads the installed package and nothing else

| Check | Result | Evidence |
|---|---|---|
| Reads `node_modules/bursit-ui-tokens/index.css` | ✅ | Single `readFileSync(TOKENS_CSS, 'utf8')` at `:436`; `TOKENS_CSS` is a const at `:51`, not argv/env driven |
| Imports no SCSS source | ✅ | Only imports are `node:fs` and `node:url` (`:47–48`); no mention of `bursit-ui-tokens/src`, `_tokens.scss` or any `.scss` path in code |
| No second source / hidden file | ✅ | The file contains exactly one filesystem read; no `fetch`, no `child_process`, no dynamic `require` |
| Does not re-declare token values | ✅ | The pair table carries only token **names**, thresholds and declared surfaces; no token's value appears as a literal |
| Non-token hex literals present | ⚠️ informational | `#767676`, `#abc`, `#0f172a80`, `#123456` are self-test fixtures (`:414–418`); `#22282E`/`#272E35` appear only in comments as 2.0.0 targets. The header's claim "the only literals in the file are the pair table" is imprecise but no CC-01 obligation is broken |
| Both layers found | ✅ | `light layer: 21 :root blocks`, `dark layer: [bursit-theme=dark], .dark - found` |

The 21 `:root` blocks are confirmed: occurrences at lines 1, 239 (nested in a media query), 247,
311, 356, 382, 436, 471, 497, 524, 547, 571, 590, 603, 643, 674, 689, 713, 740, 754, 792. The dark
block is the only one declaring `[bursit-theme=dark], .dark` (line 153).

### Reporting mechanics — verified by running it

| Requirement | Result | Evidence |
|---|---|---|
| Exactly 44 Group A lines | ✅ | Independent `^(CP-\d\d\|CC04-\d\d) (light\|dark) ` match over raw stdout = **44** (22 pairs × 2 modes) |
| Exit code non-zero | ✅ | `1`, via `process.exitCode` (`:469`); `npm run check:contrast` propagates `1` |
| All 44 lines printed **before** the exit | ✅ | The run writes once with `process.stdout.write` (`:468`) and only then sets `process.exitCode` (`:469`); the captured stdout holds all 44 lines together with the exit status `1` in the same invocation — no first-failure abort |
| Deterministic | ✅ | Two consecutive runs are byte-identical (`sha256:A83A2A56…` for both captured console texts) |
| No output lost to stderr | ✅ | stderr = 0 bytes |
| Group B tallied separately | ✅ | 25 Group B lines (`PASS 4 / FAIL 21`), Group A line count unaffected |
| `package.json` script present | ✅ | `"check:contrast": "node scripts/check-contrast.mjs"` (`package.json:13`) |

The design's harness contract said "exits non-zero on the first failure". That contract is
**incompatible** with the spec: CC-03 requires one result per ID, and a first-failure abort can never
emit 22 of them. The harness's all-lines-then-non-zero-exit behaviour is the spec-correct reading,
and the design text is stale (see W-4).

### Label honesty

| Claim | Result |
|---|---|
| The specs declare exactly 18 `CP-*` IDs | ✅ | CC-03 declares `CP-01 … CP-18`; `CP-19 … CP-22` appear nowhere in the four specs |
| No `CP-19 … CP-22` label invented | ✅ | `GROUP_A` holds `CP-01…CP-18` plus `CC04-01…CC04-04` = 22 rows; the run emits no `CP-19…CP-22` line |
| The four CC-04 pairs are labelled `CC04-01 … CC04-04` | ✅ | Confirmed in source (`:98–101`) and in all 8 emitted lines; each line names its requirement and pairing |
| Design's "CP-01…CP-22" is wrong | ⚠️ | `design.md:152, 199, 215` invent `CP-19…CP-22` and attach pairings to them that no spec declares. The apply's deviation #1 is the correct resolution; the design text still needs amending |
| The run reports only what it can see | ✅ | Unresolvable tokens produce `MISSING` with the token list (`:359–362`, `:373`), never a silent pass; `--color-border-control` and `--color-secondary-strong` do not exist in 1.2.0 (grep: 0 hits), and the harness reports `MISSING 0` because no pair measures them directly |

### Adjudication — is the FAIL count 27, and is the plan's "22 in both modes" right?

**The apply's measurements are correct; the plan's prediction is wrong.** Independently recomputed
from the raw stdout (not from the harness's own tally line):

| Claim | Value | Verified |
|---|---|---|
| Group A lines | 44 | ✅ |
| Group A `FAIL` lines | **27** | ✅ (independent parse of the 44 lines) |
| Group A `PASS` lines | 17 | ✅ (27 + 17 = 44) |
| Pairs failing in **at least one** mode | **21 of 22** | ✅ |
| Pairs failing in **both** modes | **6** | ✅ `CP-02, CP-03, CP-15, CP-16, CP-17, CP-18` |
| Plan's "22 fail in both modes" | **not reproducible** | ❌ would require 44 FAIL lines and 0 PASS |

The plan's claim is not merely off by a little: it is arithmetically impossible against the artifact,
because 17 Group A lines pass — mostly the dark-mode readings, where the 400-level dark primitives
sit at high ratios. And the single pair that passes in both modes is **CP-13**, the one pair whose
spec evidence is wrong (next section). So the plan's blanket "all pairs fail" claim and the spec's
stale CP-13 row are the same defect, not two.

Verdict: **the apply is right (27), the plan is wrong (22), and "neither" is not a valid option** —
the measured numbers reproduce exactly under an independent implementation.

### The CP-13 claim — verified, and it needs a spec correction

| Statement | Verified |
|---|---|
| Installed 1.2.0 ships `--color-warning-contrast: #0f172a` (light) / `#080d17` (dark) | ✅ `index.css:39`, `:192` |
| CP-13 measures above threshold in both modes | ✅ 8.31:1 light (raw 8.312541) / 11.64:1 dark (raw 11.644941) |
| CC-03's "2.15:1" is white-on-`#f59e0b` | ✅ `(1 + 0.05) / (0.438904 + 0.05) = 2.1476 → 2.15`, and `exploration.md:248` literally says "white on `--color-warning` `#f59e0b`" |
| 1.2.0 ships white on `--color-warning` anywhere | ❌ No. The filled warning badge consumes `--badge-warning-color: var(--color-warning-contrast)` (`index.css:619–620`); no white-on-warning pairing exists in the package |
| CP-13 is a **regression guard**, not a defect | ✅ The apply's characterization holds |
| CC-05's "6.40:1" for the same pairing | ❌ Does not reproduce (measured 8.31:1), and contradicts CC-03's 2.15:1 inside the same capability |

So the apply's Issue 2 is confirmed and can be strengthened: the spec carries **three different
numbers** for one pairing (2.15 / 6.40 / measured 8.31 light, 11.64 dark). CP-13 does **not** violate
CC-03 — it passes — but the spec's defect evidence for it is wrong and must be amended (W-2).

### The retained baseline

`openspec/changes/rebrand-palette/contrast-baseline-1.2.0.txt` (7 323 bytes,
`sha256:2fecded5…d29335`):

| Check | Result |
|---|---|
| Faithful capture of the run | ✅ The stdout section is byte-identical to a fresh run after line-ending normalisation (`0c9487d3…01549c`) |
| Recorded numbers match a fresh run | ✅ 27 FAIL / 17 PASS, 6 pairs failing in every mode, Group B 21 / 4, `Result: FAIL - 48 result lines`; 48 = 27 + 21 is arithmetically consistent |
| Encoding damage | ✅ None. **0 bytes > 127**, no BOM, ASCII-only — the apply's decision to keep the report ASCII is confirmed as necessary and effective |
| Line endings | ⚠️ Mixed: the 22 provenance lines are LF, the 83 captured stdout lines are CRLF (PowerShell's pipeline inserted the CRs), so the file is not byte-stable across platforms as its own intent states — see S-4 |

### Spec compliance matrix

Legend: ✅ COMPLIANT · ⚠️ PARTIAL · ❌ FAILING · ➖ NOT APPLICABLE (the owning phase has not been
applied; not counted as a pass).

| Requirement | Scenario | Evidence | Result |
|---|---|---|---|
| CC-01 | Re-measurement, not inheritance | Harness run vs installed 1.2.0, both modes recorded; independently re-derived | ✅ COMPLIANT |
| CC-02 | Named "subtle" does not lower the bar | The harness applies 4.5 to the `--color-text-subtle` rows (CP-02, CP-18, BP-09); the component consumer path is Phase 2 | ⚠️ PARTIAL |
| CC-03 | Full pair set reported per ID | 44 lines, one per ID per mode, no aggregate result | ✅ COMPLIANT |
| CC-03 | CP-18 uses the text threshold | `need 4.5` on both CP-18 lines, not 3 | ✅ COMPLIANT |
| CC-03 | *Requirement*: all 18 pairs pass in both modes | 16 of 22 Group A pairs fail in at least one mode | ❌ FAILING (Phase 2) |
| CC-04 | Alert and badge consume the `-text` semantic | Tokens-repo component source; Phase 2 | ➖ NOT APPLICABLE |
| CC-04 | No 500-level token sits on its own tint | Phase 2; the four affected pairs are measured now and all fail light (CC04-01…04) | ➖ NOT APPLICABLE |
| CC-05 | Success ink is not white | Phase 2 (tokens repo) | ➖ NOT APPLICABLE |
| CC-06 | Glow alone passes where the outline is removed | Needs 2.0.0 + Phase 3 checkbox outline; RED baseline exists today (1.46 / 1.78) | ➖ NOT APPLICABLE |
| CC-07 | The candidate is rejected | Design decision on the 2.0.0 ramp | ➖ NOT APPLICABLE |
| CC-07 | The adopted step is not white-on-dark by accident | Same | ➖ NOT APPLICABLE |
| TC-01 | The gate holds before publish | Both manifests declare `^1.2.0`, the lockfile resolves `1.2.0` from the registry, and `npm view bursit-ui-tokens@2.0.0` → `E404` | ✅ COMPLIANT |
| TC-01 | The gate opens on publish | Not published | ➖ NOT APPLICABLE |
| TC-02 | Both ranges agree | Phase 2 | ➖ NOT APPLICABLE |
| TC-03 | Lockfile resolution | Phase 2 | ➖ NOT APPLICABLE |
| TC-03 | Documentation matches resolution | Phase 4 | ➖ NOT APPLICABLE |
| TC-04 | Version comes from the commit | Tokens repo, outside this SDD | ➖ NOT APPLICABLE |
| TC-05 | Chrome tracks the mode | Phase 3 | ➖ NOT APPLICABLE |
| TC-06 | No override layer | Phase 2/3 | ➖ NOT APPLICABLE |
| TC-07 | Sweep for the retired identity | Phase 5 | ➖ NOT APPLICABLE |
| TC-07 | Remaining colour literals are the documented exceptions | Phase 5 | ➖ NOT APPLICABLE |
| TC-07 | Builds still pass after adoption | Requires 2.0.0 installed | ➖ NOT APPLICABLE |
| BP-01 | No retired hue survives | Tokens repo (X1–X5) | ➖ NOT APPLICABLE |
| BP-01 | Neutrals hold the logo's field | Tokens repo | ➖ NOT APPLICABLE |
| BP-02 | Exact dark canvas | Tokens repo | ➖ NOT APPLICABLE |
| BP-03 | Anchors resolve without a call-site literal | Phase 4 | ➖ NOT APPLICABLE |
| BP-04 | Light primary is the tuned 500 step | Tokens repo | ➖ NOT APPLICABLE |
| BP-05 | Dark primary is not the 400 step | Tokens repo | ➖ NOT APPLICABLE |
| BP-06 | Control boundaries clear 3:1 in both modes | Tokens repo; measured now through the six shipped control tokens, all 12 lines FAIL | ➖ NOT APPLICABLE |
| BP-06 | No control token keeps a bare step | Tokens repo | ➖ NOT APPLICABLE |
| BP-07 | The cyan literal is gone | Tokens repo; `--btn-secondary-hover-bg: #155E75` is still present in 1.2.0 (`index.css:274`) and FAILs dark at 2.68:1 | ➖ NOT APPLICABLE |
| BP-07 | Hover darkening is preserved | Tokens repo | ➖ NOT APPLICABLE |
| BP-08 | Hex sweep over the package source | Tokens repo | ➖ NOT APPLICABLE |
| BP-09 | Light text-subtle clears AA on all three surfaces | Tokens repo; the three surfaces are measured now and all three FAIL light | ➖ NOT APPLICABLE |
| BP-09 | Equality is not a failure | Tokens repo | ➖ NOT APPLICABLE |
| BP-10 | Info survives a brand re-tint | Tokens repo | ➖ NOT APPLICABLE |
| BA-01 | The blocker is observable | No vector master exists in either repo (only `landing/public/favicon.svg` — the Astro mark — plus raster `logo.jpeg`) | ✅ COMPLIANT |
| BA-01 | The work is not silently absorbed | Task 4.5 struck out and marked "MOVED OUT OF THIS CHANGE (BA-01)"; not marked done; the mark is nowhere claimed complete | ✅ COMPLIANT |
| BA-02 | The framework logo is gone | Phase 4 | ➖ NOT APPLICABLE |
| BA-02 | The implicit request does not 404 | Phase 4 | ➖ NOT APPLICABLE |
| BA-03 | One decision, three sites | Phase 4 | ➖ NOT APPLICABLE |
| BA-04 | No stale literal survives | Phase 4 | ➖ NOT APPLICABLE |
| BA-04 | Committed raster matches the script | Phase 4 | ➖ NOT APPLICABLE |
| BA-05 | Two-mode render evidence | Phase 5 | ➖ NOT APPLICABLE |

**Compliance summary**: 6/43 scenarios compliant (14 %), 1 partial, 1 failing requirement-level
check, 36 not applicable because their phases are unapplied.

### Correctness (static evidence)

| Requirement | Status | Notes |
|---|---|---|
| CC-01 | ✅ Implemented | The instrument exists, reads only the installed artifact, and re-measures rather than inheriting |
| CC-02 | ⚠️ Partial | Threshold selection is correct in the harness; no consumer-side enforcement exists yet |
| CC-03 | ❌ Not satisfied | Reporting obligation met; the "all 18 pass" obligation cannot be met until Phase 2 |
| CC-04 … CC-07 | ➖ Not implemented | Phases 2–3 |
| TC-01 | ✅ Held | The gate is intact: no manifest moved, no lockfile touched |
| TC-02 … TC-07 | ➖ Not implemented | Phases 2–4 |
| BP-01 … BP-10 | ➖ Not implemented | Tokens repo, outside this SDD |
| BA-01 | ✅ Respected | Precondition honoured; artwork split out |
| BA-02 … BA-05 | ➖ Not implemented | Phase 4 |

### Coherence (Design)

| Decision (design.md) | Followed? | Notes |
|---|---|---|
| Harness reads the installed `index.css` and nothing else | ✅ Yes | Verified by code inspection and by the absence of any other read |
| Parses 21 `:root` blocks + the dark block | ✅ Yes | 21 confirmed by independent count |
| Resolves `var()` chains; composites `rgba()` over a named surface | ✅ Yes | Independently reproduced on 8 pairs, incl. alpha tints, translucent foregrounds and a shadow colour |
| "No component block redeclares a `--color-*` token" | ✅ Confirmed | No later `:root` block redeclares a token the dark block sets; the harness now asserts this invariant at runtime |
| "exits non-zero on the first failure" | ❌ Deviated (spec-correct) | CC-03's per-ID reporting is unreachable with a first-failure abort; design text is stale (W-4) |
| "Group A is CP-01…CP-22" | ❌ Deviated (spec-correct) | The specs declare 18 CP IDs; `CC04-01…04` are honest labels, `CP-19…CP-22` exist nowhere (W-4) |
| "RED against 1.2.0 (records CP-01…CP-22 as failing)" | ❌ Refuted | 17 of 44 lines pass; only 6 pairs fail in both modes (W-1) |
| Storybook chrome theming, OG register, mark treatment | ➖ Not applicable | Phases 3–4 |

### TDD Compliance (Strict TDD module)

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ❌ | `apply-progress.md` contains **no "TDD Cycle Evidence" table** |
| All tasks have tests | ❌ | 0/6 Phase 1 tasks have a spec-derived test file |
| RED confirmed (tests exist) | ❌ | No test file exists; `--self-test` asserts self-chosen constants, which is calibration, not RED |
| GREEN confirmed (tests pass) | ⚠️ | `--self-test` 9/9 passes, `npm run test` 314 pass — but neither covers the harness's behaviour |
| Triangulation adequate | ⚠️ | 9 self-test cases cover 9 distinct concerns; no case covers `MISSING`, `var()` fallback, or the cycle guard |
| Safety Net for modified files | ✅ | `package.json` edit is additive; no pre-existing behaviour depends on it, and the full Jest suite was run after it (314 pass) |

**TDD Compliance**: 1/6 checks passed. This is the declared deviation, not a silent fallback: the
apply records why (edit authority limited to the harness + the `scripts` block; a Jest spec would be
a third file outside the rollback boundary) and offers to widen scope. I verified its technical
premise — `jest.config.js` sets no `testMatch`, and Jest's default patterns accept `[jt]s?(x)` but not
`.mjs` — so a `check-contrast.spec.mjs` genuinely would not be collected. The premise is sound; the
protocol obligation is still unmet, which is why this is a CRITICAL finding rather than a note.

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 0 (change) / 314 (existing repo suite) | 0 (change) / 26 (repo) | Jest + jest-preset-angular |
| Integration | 0 | 0 | not used by this change |
| E2E | 0 | 0 | not installed |
| **Total** | **0 change-specific** | **0** | |

### Changed File Coverage

`scripts/check-contrast.mjs` is outside `collectCoverageFrom` (`projects/bursit-angular/src/lib/**/*.ts`),
so coverage analysis for the changed file is skipped — no coverage tool covers it. The repo suite
reports 314 passing tests; the configured threshold is not enforced (`threshold_enforced: false`),
despite `AGENTS.md` stating 80 %.

### Assertion Quality

No test files were created or modified by this change (per the table above), so there are no
assertions to audit. The harness's `--self-test` was reviewed instead: the nine cases are value
assertions against published WCAG reference numbers (`21.00`, `1.00`, `4.54`, `3.98`), not
tautologies or smoke checks. **Assertion quality**: ✅ no trivial assertions found.

### Quality Metrics

**Linter**: ➖ Not available (`quality.linter: false`).
**Type Checker**: ➖ Not applied to the changed file — `scripts/check-contrast.mjs` is not part of any
`tsconfig` include. The library type check runs as part of `npm run build`, which passed.

### Issues Found

**CRITICAL**

1. **The change is not verified and cannot be completed today.** 20 of 26 tasks are unchecked
   (Phases 2–5). Proof: `npm run check:contrast` against the installed 1.2.0 exits `1` with **27 of 44
   Group A lines and 21 of 25 Group B lines below threshold**; the gate is closed (`npm view
   bursit-ui-tokens@2.0.0` → `E404`; `npm view bursit-ui-tokens version` → `1.2.0`; the lockfile
   resolves `1.2.0`). 27 of 29 requirements are unimplemented. This report must not be read as a
   whole-change pass.
2. **Strict TDD was not followed and no TDD evidence was reported,** although `strict_tdd: true` and
   Jest is available. `apply-progress.md` has no TDD Cycle Evidence table and no spec-derived test
   exists. The deviation is declared honestly (and its `testMatch` premise is verified), but the
   obligation is unmet, and the slice's only test is a self-test that asserts constants the same change
   chose.

**WARNING**

1. **The plan's RED prediction is refuted by measurement.** Task 1.6 predicts "22 fail in both modes"
   and `design.md:215` predicts the harness "records CP-01…CP-22 as failing". Measured: 27/44 FAIL,
   21 pairs failing in at least one mode, **6** in both. Independent recount and an independent
   re-implementation confirm the apply's numbers. `tasks.md` and `design.md` must be corrected so
   Phase 2's GREEN is not compared against a false RED baseline.
2. **CP-13's spec evidence is stale and internally contradictory.** CC-03 records 2.15:1 (white on
   `#f59e0b`, which 1.2.0 does not ship — the filled warning badge consumes
   `--color-warning-contrast: #0f172a`), CC-05 records 6.40:1 for the same pairing, and the artifact
   measures 8.31:1 light / 11.64:1 dark. CP-13 is a regression guard, not a defect: CC-03's "18 defects"
   premise is overstated by one, and the spec must be amended (extend task 5.5).
3. **Three of the 18 "Today" figures do not reproduce** from the installed artifact: CP-06 2.17 vs
   measured 2.16 (raw 2.161132), CP-09 3.17 vs 3.16 (raw 3.164990 — within 1e-4 of the boundary), and
   CP-13 as above. The other 15 reproduce exactly, which corroborates the surface model. CC-01 mandates
   the re-measured value, so compliance thresholds are unaffected, but the spec column is stale.
4. **The design's harness contract is stale in two normative ways** and still asserts what the
   implementation correctly refused: "exits non-zero on the first failure" (incompatible with CC-03's
   per-ID reporting) and "Group A is CP-01…CP-22" (the specs declare 18 CP IDs). The design document
   must be amended to the shipped contract, including the `CC04-nn` labels and the per-pair surfaces.
5. **Two deviations cite a correction document that does not exist in the change.** The apply's
   deviations #2 and #3 reference "Task correction #3" and "the design/tasks correction" (the claim
   that the light figures reproduce only on `--color-bg-elevated`) as superseded authority; grepping
   the whole change directory finds those phrases only in `apply-progress.md` itself. The deviations
   are nonetheless correct as verified above — but their provenance cannot be audited, so either
   record that correction text or drop the reference.
6. **Task 4.5 is a permanently uncheckable checkbox.** `- [ ] ~~4.5~~ **MOVED OUT OF THIS CHANGE
   (BA-01)**` will keep "all tasks complete" false forever and will block any future all-tasks-complete
   verification gate on this change. Convert it to a plain note.

**SUGGESTION**

1. The header's claim "the only literals in the file are the pair table below" is imprecise: the
   self-test carries `#767676`, `#abc`, `#0f172a80`, `#123456`, and comments carry `#22282E`/`#272E35`.
   No token value is re-declared, so CC-01 holds; reword to "no token value is re-declared".
2. Three instrument failure paths are unexercised on 1.2.0: `MISSING`, `var(--a, fallback)` and the
   cycle guard (which throws uncaught, with no test). Adding three self-test cases would surface the
   instrument's failure modes before 2.0.0 lands, where `MISSING` is the most likely to fire.
3. The light layer unions all 21 `:root` blocks, including the one inside
   `@media (prefers-reduced-motion: reduce)`. It declares only `--duration-*`, so no pair is affected —
   but a conditional `:root` that ever declared a colour token would be applied unconditionally by the
   model. The header documents the choice; a guard would make it safe.
4. The retained baseline mixes line endings (22 provenance lines LF, 83 captured stdout lines CRLF,
   because PowerShell's pipeline inserted the CRs), so the file is not byte-stable across platforms as
   the harness intends. Content is faithful and ASCII-clean either way.
5. Spec TC-02 and task 2.2 target `package.json:25`; the tokens dependency now sits at line 26 because
   this slice added a script at line 13. Phase 2 should locate the dependency by name, not by a stale
   line number.
6. `npm run check:contrast` has no CI consumer (verified: nothing under `.github/` references it), so a
   future palette regression would pass CI silently. Task 5.6 explicitly defers this as an open
   question — decide it before Phase 2's GREEN claim.

### Verdict

**FAIL** — for the change: 27 of 29 requirements are unimplemented, Phases 2–5 are blocked on a closed
publish gate, and 27 of 44 Group A lines remain below threshold, so `rebrand-palette` is not verified,
passing or complete.

The **Phase 1 slice itself passes verification**: the harness is a correct, independently reproduced
measuring instrument (44/44 lines identical under an independent implementation), it reads only the
installed artifact, it reports every ID before exiting non-zero, it labels honestly, and its retained
baseline is a faithful ASCII capture. Two plan/spec defects must be closed before Phase 2 can be
trusted: the false "22 fail in both modes" baseline and the CP-13 spec evidence.

### Evidence appendix

| Evidence | Command | Exit | Digest |
|---|---|---|---|
| Verified harness | — | — | `sha256:bd2de718410927d5551d61b01d26000f32e12fcde8586b3139101571cdd7fef2` |
| Harness self-test | `node scripts/check-contrast.mjs --self-test` | 0 | `sha256:65ffdd9cb7810f5d49711b763ace8fab49c3c69136e11909e620eaf1f4d7df89` |
| Harness acceptance run | `npm run check:contrast` | 1 (RED by design) | `sha256:0c9487d39fe7ba56967f73cb1e570aab7938f06de02236497f3a946a8d01549c` |
| Repo test suite | `npm run test` | 0 | `sha256:257329feaef0f3c6d72fb255ae0d6ce8a470ee4553ad7bb6423ebe15bd198560` |
| Repo build | `npm run build` | 0 | `sha256:86f3d3eab4c63951361cd6f08efafb249c249094bf5cc6d6f277bac3f0f999a4` |
| Retained baseline | — | — | `sha256:2fecded532da9a0596318e862334e6f38744f15b2484426054f0236d30d29335` |
| Publish gate probe | `npm view bursit-ui-tokens@2.0.0 version` | 1 (E404) | — |
| Independent derivation | verifier-written scripts, not persisted | 0 | 44/44 lines identical to the harness |

`evidence_revision` is the SHA-256 of `scripts/check-contrast.mjs`, the artifact under verification at
this revision. No source file was modified during verification; the only writes are this report and
files under the OS temp directory.
