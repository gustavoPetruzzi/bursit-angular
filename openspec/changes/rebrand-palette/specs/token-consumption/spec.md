# token-consumption Specification

## Purpose

How `bursit-angular` and `landing` adopt the rebranded token package: the publish gate, the version
and lockfile contract, the breaking-release declaration, the Storybook chrome, and the single-source-
of-truth rule. The tokens rewrite happens in a different repository and is a prerequisite, not part of
this change's edit surface.

## Requirements

### Requirement: TC-01 — Adoption MUST NOT precede the published major

Neither manifest in this repo MUST be moved to the new major before the corresponding version resolves
from the registry. The gate is ordering, not convenience: installs fail pre-publish, and a stale
`latest` renders the retired identity while docs, favicon and OG card already claim the new brand.

#### Scenario: The gate holds before publish

- GIVEN the tokens major is not yet published
- WHEN either manifest is read on the default branch
- THEN the range still resolves to the previously published major

#### Scenario: The gate opens on publish

- GIVEN the tokens major is published
- WHEN the registry is queried for the target version
- THEN the version resolves, and only then may the manifests move

### Requirement: TC-02 — Both manifests move to the same major

`package.json:26` and `landing/package.json:21` MUST declare the same new major range. A caret range
MUST NOT be relied on to cross the boundary, because caret ranges do not move across a major.

#### Scenario: Both ranges agree

- GIVEN the two manifests
- WHEN their declared ranges are compared
- THEN they are identical and name the new major

### Requirement: TC-03 — Both lockfiles resolve the published major from the registry

`package-lock.json` and `landing/package-lock.json` MUST resolve the new major through the registry.
No `file:` link MUST be introduced. Any documentation in this repo that describes how the package is
consumed MUST match the lockfile — `AGENTS.md` currently claims a `file:` dependency, which the
lockfile contradicts.

#### Scenario: Lockfile resolution

- GIVEN both lockfiles
- WHEN the resolved entry for the token package is read
- THEN it is a registry URL at the new major

#### Scenario: Documentation matches resolution

- GIVEN `AGENTS.md`
- WHEN its dependency claim is compared with `package-lock.json`
- THEN the two agree

### Requirement: TC-04 — The palette change is declared breaking

The tokens repository MUST declare the change with a `feat!:` or `BREAKING CHANGE:` commit so the
release automation derives the major. The version MUST NOT be hand-edited; it is commit-derived.

#### Scenario: Version comes from the commit

- GIVEN the tokens repository's release workflow
- WHEN the released version is inspected
- THEN it is a major bump derived from a breaking commit, with no hand-edited version

### Requirement: TC-05 — Storybook chrome follows the brand

The Storybook manager chrome MUST be tinted to the new brand in both modes instead of Storybook's own
`themes.dark` / `themes.light`. It MUST keep following the active theme mode (system default, plus
toolbar overrides), which is the existing behaviour.

#### Scenario: Chrome tracks the mode

- GIVEN Storybook open with the theme toolbar changed to dark, then to light
- WHEN the manager chrome is inspected
- THEN it changes accordingly and carries no retired-identity colour

### Requirement: TC-06 — One source of truth for token values

Storybook and the landing MUST consume the package's SCSS source; no local `:root` override of any
brand, surface, text or border token MUST be introduced in this repo.

#### Scenario: No override layer

- GIVEN `bursit-angular` and `landing` styles
- WHEN declarations of `--color-primary` or `--color-secondary` are searched at any level other than the installed package
- THEN zero local declarations are found

### Requirement: TC-07 — No retired-identity colour remains

No indigo or cyan value MUST remain in this repo — not in Storybook, not in the landing, not in the
OG card. The Angular library's own styles are already fully token-driven; the sweep is aimed at
raster-generation literals and Storybook chrome.

#### Scenario: Sweep for the retired identity

- GIVEN the repo, including Storybook config and the landing
- WHEN it is swept for the retired indigo and cyan values
- THEN zero hits are returned

#### Scenario: Remaining colour literals are the documented exceptions

- GIVEN `projects/bursit-angular/src` and repo-root docs
- WHEN a hex-literal sweep is run
- THEN the only hits are `icon.spec.ts:13` and `:47` (arbitrary-colour passthrough fixture) and the "do not do this" example in `AGENTS.md:90`

#### Scenario: Builds still pass after adoption

- GIVEN the new major installed
- WHEN `npm run build`, `npm run test`, `npm run build-storybook` and the landing build are run
- THEN all four succeed

## Values deferred to `sdd-design`

1. Which Storybook theming API path produces the tinted chrome while preserving mode switching.
