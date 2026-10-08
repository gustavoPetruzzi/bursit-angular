```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:fe0da5b4e4c2f0cc9f6ddbdacebce95d2de461ba6dfe8ab121ba9b2c9afb1dd4
verdict: fail
blockers: 2
critical_findings: 2
requirements: 24/29
scenarios: 38/44
test_command: npm run test
test_exit_code: 0
test_output_hash: sha256:7892a653be216a6981aa63a92a86cc978482aa2c07a0953e41177d33635e46a9
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:b26fc0763c98539e3154879d7275300a30af4b843081452d7dc0e985cbeb0c87
```

## Verification Report

**Change**: `rebrand-palette` — **full change** (all 4 delta specs, 29 requirements / 44 scenarios)
**Version**: N/A (change not archived)
**Mode**: Strict TDD (openspec/config.yaml `strict_tdd: true`, Jest available)
**Verified revision**: the complete tracked tree of `HEAD` `d20ba82c12b98a4a5ded86c8693beb557298034f`
(tree `4835db6c5cfbe7ee95d41ddad684ccc779d57559`); `evidence_revision` is the SHA-256 of the
canonical tree listing (`git ls-tree -r HEAD`, LF-normalised) — the exact artifact under verification.
**SDD attempt**: attempt #9 / objective generation 9 (`phase-full-verify`), token
`sha256:cb0585130aaf4727ee2c19107d6b5889c3e383267941d1b1c0b2e5a815a06528`.

### Scope and honesty statement

This report **supersedes the Phase-1-only report** that previously stood here (verdict FAIL, 6/43,
publish gate closed). The gate is open now: `bursit-ui-tokens@2.0.0` is published and adopted. This
run is an independent, read-only verification of the whole change on the integrated tracker: every
command below was executed on this tree, every scenario was adjudicated against repository state or
command output, and **no scenario was assumed compliant**. PARTIAL means "not provable in this
headless run"; FAIL means the repository state contradicts the spec's literal text.

Two of the three FAILs and both CRITICAL findings are **spec-text defects the change itself created**
(a human-approved scope split and an over-strict HSL band that the spec's own hex table defeats), not
product-code defects. They are reported as failures because the spec is the source of truth — a
verifier must not edit the criteria it is judged against.

**Incident (disclosed, not cleaned up):** the authorized `npm run build --prefix landing` regenerated
`landing/dist/` and removed the retained gitignored dark render `landing/dist/index.dark.html`
recorded in `evidence/ba-05.md`; the regenerated `index.html` no longer matches that file's recorded
SHA-256. The tree is still clean (`git status --porcelain` empty, outputs are gitignored) and the
renders are regenerable, but the tracked evidence file now describes files only partly on disk.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 26 (4.5 struck out and moved out under BA-01) |
| Tasks complete | 26 (26 `[x]`, 0 `[ ]`) |
| Requirements compliant | 24 / 29 |
| Scenarios compliant | 38 / 44 (86 %) |
| Scenarios PARTIAL | 3 (BA-04 s2, BA-05 s1, TC-05 s1) |
| Scenarios FAIL | 3 (BA-02 s1, BA-02 s2, BP-01 s2) |

### Build & Tests Execution

All commands exit `0`; hashes are SHA-256 of the combined stdout+stderr normalised CRLF→LF.

| # | Command | Exit | Key counts | sha256 |
|---|---|---|---|---|
| 1 | `npm run test` | 0 | 27 suites / 322 passed / 2 skipped | `7892a653be216a6981aa63a92a86cc978482aa2c07a0953e41177d33635e46a9` |
| 2 | `npm run build` | 0 | schematics tsc + ng-packagr → `dist/bursit-angular` | `b26fc0763c98539e3154879d7275300a30af4b843081452d7dc0e985cbeb0c87` |
| 3 | `npm run build-storybook` | 0 | "Storybook build completed successfully" | `5451a7e52477b02fdcb949d1267fe58ab5182fcb33823ed6c72b5c3aa1d3665f` |
| 4 | `npm run build --prefix landing` | 0 | Astro: 1 page, sitemap, 4.30 s | `060acae6c56edc91aebc68d306cb923be3d778602be1940fdeba7d2de3754a02` |
| 5 | `npm run check:contrast` | 0 | Group A **PASS 44 / FAIL 0 / MISSING 0**; Group B PASS 25/0 | `da298636a895b01c259f42ac011b36da15e75ad469d54222077f16913c770db2` (identical on 2 runs → reproducible) |
| 6 | `node scripts/check-contrast.mjs --self-test` | 0 | **9/9 passed** | `65ffdd9cb7810f5d49711b763ace8fab49c3c69136e11909e620eaf1f4d7df89` |
| 7 | `npm view bursit-ui-tokens version` | 0 | `2.0.0` (publish 2026-09-16T02:50:53Z) | `c28fcca53637bc88e124af1725df13cb98c69dedefd62fb3cdbe1cdb6b760624` |

**Coverage**: ➖ Not applicable to this change — no `projects/bursit-angular/src/lib/**/*.ts` product
source changed in the verified work units (manager config, SCSS tokens, landing, harness, CI, docs);
the config states `threshold_enforced: false`.

### Audit results

**A. Storybook manager chrome (TC-05)** — built
`storybook-static/sb-addons/projects-bursit-angular-storybook-5/manager-bundle.js` (2742 B):
brand hexes `BA3B54`×3, `E8A1AF`×3, `3A6B9C`×1, `7BA3CC`×1; stock/retired `005CC7`/`70B3FF`/`DBECFF`/
`4F46E5`/`6366F1`/`818CF8` all ×0; `themes.light`/`themes.dark` ×0. Source `manager.ts` sets base +
**21 colour vars + both radii** explicitly in both modes, 0 missing, 0 defaulted (`themes` import
gone). The interactive toolbar toggle is only attested by the recorded maintainer observation
(`tasks.md` 3.3) — see PARTIAL.

**B. Adoption (TC-01/02/03/04)** — `package.json:26`, `landing/package.json:21` and
`projects/bursit-angular/package.json:11` all `^2.0.0`; both lockfiles resolve
`registry.npmjs.org/bursit-ui-tokens/-/bursit-ui-tokens-2.0.0.tgz`; `file:` sweep over all four files
= 0; `AGENTS.md:23` says registry `^2.0.0`. Ordering held: publish `2026-09-16T02:50:53Z` → bump
commit `d6791bd` `2026-09-16T15:12:16Z` (predecessor `743cae6` still 1.2.0). Sibling tokens repo:
`9f719e1 feat(tokens)!:` → `e23749c chore(master): release 2.0.0` (release-please 1.2.0→2.0.0).

**C. BP-08 sibling sweep (`../bursit-ui-tokens/src/`, read-only)** — hex literals: **58 hits, all in
`src/_tokens.scss:16-85`** (primitives + `--brand-mark-*` anchors :83-85); hex hits beyond the
primitive block = **0**; `src/components/*.scss` hex = **0**; `rgba(4-digit/8-digit numeric)` and
`rgba(#…)` = 0; `indigo|cyan` decls = 0; `#155E75` = 0 in sibling **and** installed copy.

**D. TC-07 retired-identity sweep (this repo)** — `git grep` over 19 retired indigo/cyan hexes +
`indigo|cyan`, excluding the change's own prose → **zero hits (exit 1)** across `.storybook`,
`landing/`, OG script. Remaining colour literals in `projects/…/src` + root docs: exactly
`icon.spec.ts:13`, `icon.spec.ts:47`, `AGENTS.md:90` — the documented exceptions. `landing/src` +
`landing/scripts`: only the 7 dark-register `PALETTE` literals (`generate-og-image.mjs:26-32`).

**E. Task completion** — `tasks.md`: 26 `- [x]`, 0 `- [ ]`.

### Spec compliance matrix (44 scenarios)

#### brand-assets (8)

| Scenario | Verdict | Evidence |
|---|---|---|
| BA-01 "The blocker is observable" | COMPLIANT | `git ls-files "*.svg"` = only `landing/public/favicon.svg` (Astro mark); no vector logo exists |
| BA-01 "The work is not silently absorbed" | COMPLIANT | `tasks.md` 4.5 "MOVED OUT OF THIS CHANGE (BA-01)"; 26 checked boxes exclude it |
| BA-02 "The framework logo is gone" | **FAIL** | `landing/public/favicon.svg` still carries the Astro path `M50.4 78.5a75.1…` (1 hit); the split is declared in tasks/design but **BA-02's spec text was never amended** |
| BA-02 "The implicit request does not 404" | **FAIL** | `favicon.ico` = 655 B, magic `89 50 4E 47` (PNG named `.ico`), 0 references; scenario needs valid ICO **or** absent+unreferenced — neither holds |
| BA-03 "One decision, three sites" | COMPLIANT | `Nav.astro:108-112`, `Footer.astro:87-91`, `global.scss:407-410` all `linear-gradient(135deg, var(--color-brand-mark-bright), var(--color-brand-mark-deep))` |
| BA-04 "No stale literal survives" | COMPLIANT | `generate-og-image.mjs:26-32` all 7 = dark layer, annotated; `:20-23` comment true; no retired hex in file |
| BA-04 "Committed raster matches the script" | PARTIAL | tracked `og-image.png` = 170 773 B matches task 4.2; regen **not re-run** (mutates a tracked file — outside read-only authority) |
| BA-05 "Two-mode render evidence" | PARTIAL | `evidence/ba-05.md` records both renders + SHA-256s; **on-disk pair broken this run** (incident above); visual readability never judged headless |

#### brand-palette (15)

| Scenario | Verdict | Evidence |
|---|---|---|
| BP-01 "No retired hue survives" | COMPLIANT | installed `_tokens.scss`: wine 11 / steel 11 / neutral 14 steps, indigo+cyan = 0; all 34 declared hexes present |
| BP-01 "Neutrals hold the logo's field" | **FAIL** | per-step band broken: spec demands HSL hue 208–210 / sat 15–16 % on every step; measured `#FFFFFF` H0/S0, `#F9FAFB` S20.0, `#EFF2F5` S23.1, `#DDE3E9` S21.4, `#C0C9D3` 211.6/17.8, `#111418` 214.3/17.1, `#647587` S14.9, `#9AA8B6` S16.1 (8/14 out of band). Field half holds (`#22282E` 210.0/15.0). No deferral declared |
| BP-02 "Exact dark canvas" | COMPLIANT | dark `--color-bg: #22282e`, `-elevated #272e35`; light `--color-text #272e35` |
| BP-03 "Anchors resolve without a call-site literal" | COMPLIANT | `index.css:11-12` `--color-brand-mark-bright/deep #835a60/#4e383e`; 3 sites use `var()`; anchors are not ramp steps |
| BP-04 "The danger button's three states stay distinct" | COMPLIANT | `index.css:49` `#b91c1c` vs `:50` `#991b1b`; hover/active → error-active |
| BP-04 "Light primary is the tuned 500 step" | COMPLIANT | light `--color-primary: #ba3b54` |
| BP-05 "Dark primary is not the 400 step" | COMPLIANT | dark `--color-primary: #e8a1af` = `$wine-300` |
| BP-06 "Control boundaries clear 3:1 in both modes" | COMPLIANT | harness Group B `BP-06 light 4.73 / dark 5.66 PASS`, 6 pairs × 2 modes |
| BP-06 "No control token keeps a bare step" | COMPLIANT | all six consumers use `var(--color-border-control)`: input:54, checkbox:11, radio:11, switch:12, select:33, badge:52 |
| BP-07 "The cyan literal is gone" | COMPLIANT | `#155e75` = 0 hits case-insensitive in installed src and sibling src |
| BP-07 "Hover darkening is preserved" | COMPLIANT | `button.scss:69` / `index.css:290` hover `--color-secondary-strong #23384d` vs active `#294765`; harness `BP-07 light 12.04 PASS` |
| BP-08 "Hex sweep over the package source" | COMPLIANT | sibling src: 58 hex hits all `_tokens.scss:16-85`, 0 in `:root`/dark, 0 in components; numeric `rgba(` = 0 |
| BP-09 "Light text-subtle clears AA on all three surfaces" | COMPLIANT | `BP-09 light 6.35 / 6.64 / 5.91 PASS` (exact spec figures) |
| BP-09 "Equality is not a failure" | COMPLIANT | `index.css:67-68` both `#505e6d`, both declared, consumers intact; not reported as defect |
| BP-10 "Info survives a brand re-tint" | COMPLIANT | light `#2563eb`/`#1d4ed8`, dark `#60a5fa` — zero wine steps |

#### contrast-conformance (10)

| Scenario | Verdict | Evidence |
|---|---|---|
| CC-01 "Re-measurement, not inheritance" | COMPLIANT | harness reads installed `node_modules/.../index.css` only; run exit 0; per-mode lines; 1.2.0 RED baseline retained |
| CC-02 "Named subtle does not lower the bar" | COMPLIANT | `index.css:340 --input-placeholder-color: var(--color-text-subtle)`; CP-02/CP-18 run `need 4.5` |
| CC-03 "Full pair set reported per ID" | COMPLIANT | run emits exactly 44 Group A lines, one per ID per mode; `22 pairs x 2 modes = 44 lines \| PASS 44 \| FAIL 0` |
| CC-03 "CP-18 uses the text threshold" | COMPLIANT | `CP-18 dark 6.13 need 4.5 PASS` |
| CC-04 "Alert and badge consume the `-text` semantic" | COMPLIANT | `alert.scss:30/36/42/48`, `badge.scss:60/62/64/66` all `var(--color-*-text)` |
| CC-04 "No 500-level token sits below AA on its own tint" | COMPLIANT | all tint pairs PASS both modes (44/0 FAIL); CC04-03 dark 4.52 margin printed |
| CC-05 "Success ink is not white" | COMPLIANT | light `--color-success-contrast: #22282e`; `CC-05 light 6.53 / dark 8.54 PASS` |
| CC-06 "Glow alone passes where the outline is removed" | COMPLIANT | `CC-06 light 3.12 / dark 5.14 PASS`; `--checkbox-focus-shadow → var(--shadow-glow-primary)`; glow measured independent of the restored outline |
| CC-07 "The candidate is rejected" | COMPLIANT | independent recomputation `#647587` on `#22282e` = 3.14 (< 4.5); candidate not adopted (dark subtle = `#9aa8b6`) |
| CC-07 "The adopted step is not white-on-dark by accident" | COMPLIANT | adopted `#9aa8b6`: `CP-18 dark 6.13`, `CP-02 dark 5.66`, both ≥ 4.5 |

#### token-consumption (11)

| Scenario | Verdict | Evidence |
|---|---|---|
| TC-01 "The gate holds before publish" | COMPLIANT | publish `2026-09-16T02:50:53Z` < bump `d6791bd` `2026-09-16T15:12:16Z`; predecessor `743cae6` held 1.2.0 |
| TC-01 "The gate opens on publish" | COMPLIANT | `npm view` → 2.0.0; manifests moved only after |
| TC-02 "Both ranges agree" | COMPLIANT | `package.json:26` = `landing/package.json:21` = `^2.0.0` |
| TC-03 "Lockfile resolution" | COMPLIANT | both locks → registry `…-2.0.0.tgz`; `file:` = 0 |
| TC-03 "Documentation matches resolution" | COMPLIANT | `AGENTS.md:23` registry `^2.0.0`; no `file:` claim remains |
| TC-04 "Version comes from the commit" | COMPLIANT | sibling `9f719e1 feat(tokens)!:` → `e23749c release 2.0.0` (CHANGELOG+lock only) |
| TC-05 "Chrome tracks the mode" | PARTIAL | build half proven (both bases, `setConfig`, 0 `themes.*`, 0 stock/retired hex); interactive toggle only as recorded maintainer observation — not re-observable headless |
| TC-06 "No override layer" | COMPLIANT | `--color-primary:` / `--color-secondary:` declarations in `landing/src`, `projects/…/src`, both `.storybook` dirs → **0** |
| TC-07 "Sweep for the retired identity" | COMPLIANT | `git grep` retired list → exit 1, zero hits outside change docs |
| TC-07 "Remaining colour literals are the documented exceptions" | COMPLIANT | exactly `icon.spec.ts:13`, `:47`, `AGENTS.md:90` |
| TC-07 "Builds still pass after adoption" | COMPLIANT | this run: build 0, test 0 (27/322/2), build-storybook 0, landing build 0 |

**Compliance summary**: 38/44 scenarios compliant (86 %), 3 PARTIAL, 3 FAIL; 24/29 requirements
fully compliant; 0 UNTESTED.

### Coherence (Design)

The implementation matches `design.md`: chained-PR delivery (harness → adoption → chrome → landing →
final → chrome correction), all six slices integrated on the tracker, the TC-05 amendment's declared
built-artifact-audit deviation executed as written, and the artwork fork (BA-01) respected — task 4.5
is struck out, not silently done. The design's own open question (contrast harness as CI gate) was
closed by maintainer decision and is live in `.github/workflows/ci.yml`.

### TDD Compliance (Strict TDD)

Product code (`projects/bursit-angular/src/lib/**`) saw **no behavioural change** in the verified
work units: adoption is a manifest/docs change, the checkbox focus outline is SCSS, the chrome tint is
Storybook manager config, the landing is Astro. Declared, evidenced deviations (see
`apply-progress.md`): the TC-05 built-artifact audit (compensation, RED observed on the real deployed
bundle: 30 untraceable vars → GREEN 0) and task 3.3's human observation. `npm run test` invariant held:
27 suites / 322 passed / 2 skipped.

### Issues Found

**CRITICAL**

1. **BA-02 spec↔tasks contradiction (the change's own defect).** The human-approved artwork split
   (tasks 4.5, design "Artwork fork", BA-01) deferred the favicon swap, but BA-02's spec text still
   carries the unamended MUSTs, so both BA-02 scenarios FAIL against literal repo state. The spec —
   the artifact every future reader is judged against — is out of sync with the change's own recorded
   scope decision.
2. **BP-01 s2's HSL band is stricter than the ramp the same spec tabulates.** "hue 208–210 and
   saturation 15–16 %" fails for 8 of 14 neutral steps (light steps drift to S20–23, `#FFFFFF` is by
   definition H0/S0, `#647587` S14.9). The requirement's own hex table and its scenario are mutually
   contradictory as written; no exception or deferral is declared.

**WARNING**

3. **BA-04 s2 PARTIAL** — `og-image.png` regeneration not re-run (needs permission to mutate a tracked
   file); current raster only attested by byte size against task 4.2.
4. **BA-05 s1 PARTIAL** — the retained dark render was removed by the authorized landing build
   (incident above), and BA-05's visual half ("no unreadable text") remains owed to a human reviewer,
   as `evidence/ba-05.md` itself states.
5. **TC-05 s1 PARTIAL** — the interactive toolbar toggle exists only as the recorded maintainer
   observation of 2026-09-17; not re-observable in a headless run.
6. **Spec counts drift** — the previous report here recorded 43 scenarios; the specs now contain 44
   (CC-07 gained a second scenario). Validators must be called with `--scenarios 44`.

**SUGGESTION**

7. Reconcile BA-02 by amending the requirement to record the artwork-gated deferral (the split is
   already approved in three other artifacts), and reconcile BP-01 s2 by stating the band the shipped
   ramp actually meets (field-level: the logo-field steps hold exactly) or by declaring the light-step
   drift as accepted — rather than repainting a published, contrast-verified 2.0.0 ramp to satisfy a
   scenario written before it shipped.

### Verdict

**FAIL** — builds (4/4), tests (27/322/2), the contrast harness (44 PASS / 0 FAIL, reproducible),
its self-test (9/9) and the publish gate are all green, but **BA-02 and BP-01 s2 contradict the
repository's literal state** (3 FAIL scenarios, 2 CRITICAL findings) and 3 more scenarios are only
PARTIAL in a headless run. `rebrand-palette` is **not verified**; 24/29 requirements and 38/44
scenarios comply. The fix path is spec-text reconciliation plus one regen and one human visual pass —
no product-code change is implicated by this run.

### Evidence appendix

| Evidence | Command / artifact | Exit | Digest |
|---|---|---|---|
| Verified tree | `git ls-tree -r HEAD` @ `d20ba82` (tree `4835db6c`) | 0 | `sha256:fe0da5b4e4c2f0cc9f6ddbdacebce95d2de461ba6dfe8ab121ba9b2c9afb1dd4` |
| Repo test suite | `npm run test` | 0 | `sha256:7892a653be216a6981aa63a92a86cc978482aa2c07a0953e41177d33635e46a9` |
| Repo build | `npm run build` | 0 | `sha256:b26fc0763c98539e3154879d7275300a30af4b843081452d7dc0e985cbeb0c87` |
| Storybook build | `npm run build-storybook` | 0 | `sha256:5451a7e52477b02fdcb949d1267fe58ab5182fcb33823ed6c72b5c3aa1d3665f` |
| Landing build | `npm run build --prefix landing` | 0 | `sha256:060acae6c56edc91aebc68d306cb923be3d778602be1940fdeba7d2de3754a02` |
| Contrast harness | `npm run check:contrast` (×2 runs, identical) | 0 | `sha256:da298636a895b01c259f42ac011b36da15e75ad469d54222077f16913c770db2` |
| Harness self-test | `node scripts/check-contrast.mjs --self-test` | 0 | `sha256:65ffdd9cb7810f5d49711b763ace8fab49c3c69136e11909e620eaf1f4d7df89` |
| Publish gate | `npm view bursit-ui-tokens version` → 2.0.0 | 0 | `sha256:c28fcca53637bc88e124af1725df13cb98c69dedefd62fb3cdbe1cdb6b760624` |
| Manager bundle audit | `storybook-static/.../manager-bundle.js` (2742 B) | — | presence `BA3B54`×3 `E8A1AF`×3 `3A6B9C`×1 `7BA3CC`×1; stock/retired ×0 |
| Tree cleanliness | `git status --porcelain` (repo + sibling) after run | 0 | empty |

`evidence_revision` is the SHA-256 of the canonical git tree listing of the exact tree verified;
every command ran read-only with outputs confined to gitignored directories. The only writes made by
this verification cycle are this report and files under the OS temp directory (the landing-build
incident is disclosed above).
