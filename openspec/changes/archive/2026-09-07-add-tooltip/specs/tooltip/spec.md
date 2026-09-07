# Tooltip Specification

## Purpose

`[bursitTooltip]` / `[bursit-tooltip]` attribute directive (APG non-interactive pattern) that shows contextual help near its host via a CDK overlay. Hover/focus show, Escape/blur hide, flip-on-overflow positioning, configurable delays, token-driven styling, and ARIA wiring.

## Requirements

### Requirement: REQ-tooltip-01 — Directive API & Content

Directive MUST bind content of type `string | TemplateRef<unknown> | null`; `null` MUST NOT show a tooltip. Content changes MUST propagate live to an open panel.

#### Scenario: SCENARIO-tooltip-01 — String and template content

- GIVEN `<button [bursitTooltip]="'Save'">` or a TemplateRef-bound value
- WHEN hover show completes
- THEN panel displays the string text or renders the template

#### Scenario: SCENARIO-tooltip-02 — Live switch to null

- GIVEN an open tooltip
- WHEN `content` becomes `null`
- THEN panel hides and `aria-describedby` is cleared

### Requirement: REQ-tooltip-02 — Triggers & Delays

Show MUST trigger on host mouseenter or focus; hide on host mouseleave, blur, or Escape. Show SHALL wait `showDelay` (default 300ms); hide SHALL wait `hideDelay` (default 100ms). Both MUST be configurable, and their timers cancelled on intermediate trigger events.

#### Scenario: SCENARIO-tooltip-03 — Hover delay

- GIVEN default 300ms `showDelay`
- WHEN mouseenter fires
- THEN no panel before 300ms
- AND panel appears after 300ms

#### Scenario: SCENARIO-tooltip-04 — Escape and rapid blur

- GIVEN an open tooltip or a pending show timer
- WHEN Escape is pressed, or mouseleave/blur occurs within `showDelay`
- THEN the tooltip hides after `hideDelay` and focus stays on the host
- AND the pending show timer cancels — the panel never appears

### Requirement: REQ-tooltip-03 — Positioning & Flip

Panel MUST position per `position` input (top | bottom | left | right, default top). With insufficient room on the preferred edge, the panel MUST flip to an available edge within a viewport margin. Flipping MUST update the panel position class so the arrow re-orients.

#### Scenario: SCENARIO-tooltip-05 — Preferred position

- GIVEN `position="top"` with room above the host
- WHEN the tooltip shows
- THEN the panel renders above the host, inside the viewport margin

#### Scenario: SCENARIO-tooltip-06 — Flip and live position change

- GIVEN `position="right"` with no room to the right, or an open tooltip whose `position` input changes
- WHEN the tooltip shows or the input changes
- THEN the panel uses an edge with room and its position class (arrow) updates

### Requirement: REQ-tooltip-04 — Non-Interactive Panel & Tokens

Panel MUST set `role="tooltip"`, MUST NOT enter the tab order, MUST NOT contain focusable content, and SHALL use `pointer-events: none`. Panel styling MUST use `--tooltip-*` design tokens (background, color, typography, padding, radius, shadow, arrow) with no hardcoded values.

#### Scenario: SCENARIO-tooltip-07 — Role and token styling

- GIVEN an open tooltip
- THEN the panel has `role="tooltip"` and token-driven styles only

#### Scenario: SCENARIO-tooltip-08 — Pointer and tab exclusion

- GIVEN an open tooltip
- WHEN the pointer moves over the panel or Tab is pressed
- THEN events pass through (`pointer-events: none`) and no element inside is focusable

### Requirement: REQ-tooltip-05 — aria-describedby Wiring

On show, the host `aria-describedby` MUST reference the panel id; on hide it MUST be removed or restored. A user-set `aria-describedby` MUST NOT be clobbered — the directive SHALL only touch the attribute when it owns it.

#### Scenario: SCENARIO-tooltip-09 — Set and restore

- GIVEN a host without `aria-describedby`
- WHEN a show then a hide completes
- THEN the host references the panel id while open
- AND the attribute is removed after hide

#### Scenario: SCENARIO-tooltip-10 — User value preserved

- GIVEN a host with user-set `aria-describedby="hint"`
- WHEN a full show/hide cycle runs
- THEN the attribute returns to exactly `"hint"` — the user value is never lost

### Requirement: REQ-tooltip-06 — Disabled State & Outputs

`disabled()` input or host `[disabled]` attribute MUST suppress showing and MUST hide an open tooltip. The directive MUST emit `shown` when show completes and `hidden` when hide completes.

#### Scenario: SCENARIO-tooltip-11 — Disabled suppresses show

- GIVEN `disabled="true"` or a host with `[disabled]`
- WHEN hover/focus fires and the delay elapses
- THEN no panel appears and no `shown` emission occurs

#### Scenario: SCENARIO-tooltip-12 — Shown/hidden emissions

- GIVEN an enabled host
- WHEN show completes and then hide completes
- THEN `shown` emits exactly once and `hidden` emits exactly once

### Requirement: REQ-tooltip-07 — Lifecycle & Packaging

Destroying the host MUST cancel pending timers and dispose the overlay, leaving no leaks. The published package MUST declare `@angular/cdk` as a peer dependency.

#### Scenario: SCENARIO-tooltip-13 — Destroy during pending show

- GIVEN hover fired with a show timer pending
- WHEN the host is destroyed
- THEN the timer cancels, no overlay attaches, and no errors are thrown

#### Scenario: SCENARIO-tooltip-14 — CDK peer dependency

- GIVEN the built package.json
- THEN `@angular/cdk` is present in peerDependencies with a compatible range