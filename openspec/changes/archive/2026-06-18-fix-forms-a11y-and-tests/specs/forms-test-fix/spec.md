# forms-test-fix Specification

## Purpose

Ensures `InputDirective` tests resolve the real Angular Forms `NgControl` via DI so the directive reads actual `FormControl` state (touched, invalid) rather than falling back to CSS class checks on a detached element.

## Requirements

### Requirement: Test helper MUST resolve real NgControl

The `createWithControl()` helper SHALL NOT override `NgControl` or `ElementRef`. Angular DI MUST provide the `NgControl` created by the `[formControl]` binding and the `ElementRef` for the rendered `<input>` element.

#### Scenario: Untouched required field is not invalid with `touched` interaction

- GIVEN a `FormControl('', Validators.required)` with `validationInteraction='touched'`
- WHEN the directive is created via `createWithControl()` and `ngOnInit` completes
- THEN `directive.invalid()` SHALL return `false`
- AND `control.invalid` SHALL be `true` (underlying control IS invalid, but interaction waits for touch)

#### Scenario: Invalid after touch with `touched` interaction

- GIVEN a `FormControl('', Validators.required)` with `validationInteraction='touched'`
- WHEN `control.markAsTouched()` is called and microtasks are flushed
- THEN `directive.invalid()` SHALL return `true`

#### Scenario: Invalid immediately with `default` interaction

- GIVEN a `FormControl('', Validators.required)` with `validationInteraction='default'`
- WHEN the directive is created via `createWithControl()`
- THEN `directive.invalid()` SHALL return `true` without requiring the control to be touched

#### Scenario: Valid value stays valid after touch

- GIVEN a `FormControl('hello', Validators.required)` with `validationInteraction='touched'`
- WHEN the control is touched and microtasks are flushed
- THEN `directive.invalid()` SHALL return `false`
