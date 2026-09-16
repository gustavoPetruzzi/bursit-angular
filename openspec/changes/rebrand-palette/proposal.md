# Proposal: Rebrand Palette

## Intent

Identity is indigo `#6366f1` + cyan `#06b6d4`. The new logo — a rose mark (hue 348) on slate `#22282E` — has no palette behind it; the shipped palette fails 18 measured WCAG AA pairs.

## Scope

### In Scope
- Palette contract: `wine` 348, `steel` 210, re-derived neutrals, corrected semantics.
- New tokens `--color-border-control`, `--color-secondary-strong`; literal `#155E75` removed.
- The 18 AA/1.4.11 failures, fixed at the pairing — `alert.scss`/`badge.scss` → `--color-*-text`, per `toast.scss`.
- Both manifests to the new major; both lockfiles regenerated.
- Storybook chrome brand-tinted (`manager.ts`).
- Landing favicons, gradient marks, OG script palette, `og-image.png`.
- `AGENTS.md`'s stale `file:` dependency claim.

### Out of Scope
- `bursit-ui-tokens` edits (separate repo, the prerequisite); retiring `--color-secondary`; `_label.scss:7`'s `--space-2xs`; a contrast gate.

## Capabilities

### New Capabilities
- `brand-palette` — token→hex contract, both modes.
- `contrast-conformance` — measured 1.4.3/1.4.11 requirements.
- `brand-assets` — favicon, marks, OG card.
- `token-consumption` — major adoption, Storybook path, breaking release.

### Modified Capabilities
None — no existing spec states a token value.

## Approach

Sequential across two repositories.

1. Tokens repo, own PR, outside edit authority: rewrite the palette, repoint component tokens, regenerate `index.css`, move docs; land `feat!` → release-please publishes the major.
2. Gate: the major resolves on npm.
3. Bump both manifests; regenerate both lockfiles.
4. Tint `manager.ts`; confirm Storybook renders the published palette.
5. Landing assets (artwork-gated).
6. Re-measure every pair, both modes.

If violated: installs fail pre-publish, and a stale `latest` renders indigo/cyan while docs, favicon and OG card claim the new brand.

## Affected Areas

| Area | Change |
|---|---|
| `package.json:26`, `landing/package.json:21` | new major range |
| both lockfiles | regenerated |
| `.storybook/manager.ts` | brand-tinted chrome |
| `landing/public/*`, `landing/scripts/generate-og-image.mjs` | favicons, OG card |
| `Nav.astro:108`, `Footer.astro:87`, `global.scss:407` | squares → mark |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `#155E75` survives — passes at 7.27:1, so nothing looks broken | High | Hex sweep |
| No vector artwork | High | See Dependencies |
| Light `text-subtle` (`$neutral-600`) == light `text-muted` | High | `sdd-spec` resolves muted |
| Publish/consumption inversion | Med | Gate at step 2 |

## Rollback Plan

- Pre-publish: delete the tokens branch.
- **Post-publish: not cleanly reversible.** npm versions are immutable; unpublish fails once a dependent exists. Retag `latest` to 1.2.0, deprecate 2.0.0 — locked installs keep 2.0.0.
- Post-merge here: revert the PR; ranges and lockfiles return to 1.2.0. Clean.
- Post-release: redeploy the prior artifact; else ship a patch re-pinning 1.2.0.

## Dependencies

- **Hard gate:** the `bursit-ui-tokens` major on npm.
- **Blocked:** only raster `logo.jpeg` exists; favicon, marks and OG card need vector artwork. Fork: produce it before apply, or split that work out.
- **Contrast gate:** `scripts/validate-tokens.mjs` is tokens-repo-only and checks referential integrity. Out of scope; pairs re-measured.

## Success Criteria

- [ ] Manifests and lockfiles resolve the new major.
- [ ] All 18 pairs pass in both modes against published values.
- [ ] Light `text-subtle` clears 4.5:1 on `bg` / `bg-elevated` / `bg-sunken`.
- [ ] Hex sweep returns only `icon.spec.ts:13` and the primitive block.
- [ ] No indigo or cyan in Storybook, landing or OG card.
- [ ] Build, tests, `build-storybook` and landing build pass.
