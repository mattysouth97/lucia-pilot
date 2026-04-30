# ADR-0006 — Demo Mode Automation Mechanism

**Status**: Accepted
**Date**: 2026-04-30
**Source**: `.omc/plans/lucia-pilot-implementation.md` § ADR-0006

## Context

FRD §13.1 specifies a 9-step storyboard for the LH 본사 ESG 경영실 시연 (demo day). The storyboard covers: live generation overview, Sankey energy flow, blockchain tx stream (FR-M-008), tamper-detection visualization (FR-S-008), anomaly injection and alert (FR-D-002/FR-M-004), resident portal settlement breakdown (FR-M-007), load-test results display (FR-O-001), and audit PDF generation (FR-O-002). The presenter must be able to pause, resume, and jump to any step.

Demo failure is the M+3 disaster scenario (Pre-mortem S3). The mechanism must be:
- Reliable enough to survive dry-runs wk10–wk12 without crashing.
- E2E-testable in CI so failures are caught before demo day, not during.
- Recoverable mid-demo if a step stalls.

A backup pre-recorded video is required per FRD §13.2, but it is supplementary — LH must see live transaction flow, so the live demo mechanism cannot be bypassed entirely.

**FR anchors**: FR-O-004 (demo mode reliability), FR-O-001 (load test display in Step 8), FR-M-008 (live tx stream in Step 3), FR-S-008 (tamper visualization in Step 5).

## Decision

Declarative state machine: a JSON storyboard file (`apps/web/src/demo/storyboard.json`) defines steps as:

```json
{
  "steps": [
    {
      "id": "step-1",
      "label": "...",
      "duration_ms": 60000,
      "action": { "type": "route-nav", "payload": { "path": "/" } }
    }
  ]
}
```

A `DemoController` React component reads the storyboard, sequences actions (route navigation, anomaly injection, tamper trigger, scroll-to, tx stream playback), and exposes pause / resume / jump-to-step controls to the presenter UI. The backend exposes deterministic-mode admin endpoints so each step produces predictable on-screen output regardless of real-time simulator state.

The storyboard JSON is a versioned artifact checked into the repository. Changes to demo steps require a storyboard version bump.

Prototype work in wk5 (task B5.4) wires 3 of 9 steps. Full 9-step wiring in wk7 (task B7.1), gated by the wk6 cross-track integration smoke (A6.6 / B6.0).

## Decision Drivers

- FR-O-004: demo must be reliable; presenter must be able to pause/resume.
- Demo failure is the M+3 disaster scenario — mitigation must be verifiable, not optimistic.
- The declarative storyboard is E2E-testable in Playwright: each step is a named action with a predictable outcome, not an opaque setTimeout chain.
- FRD §13.2: backup pre-recorded video is required, but the live mechanism must be primary.

## Alternatives Considered

- **Imperative `setTimeout` chain**: brittle, untestable, unrecoverable on failure. No pause/resume capability. Rejected.
- **Video playback only**: does not satisfy the "live demo" credibility requirement — LH must see live transaction flow, not a recording. FRD §13.2 explicitly frames the recorded video as a fallback, not a primary satisfier. Rejected.
- **Cypress or Playwright running inside the demo (browser automation driving the UI in real-time)**: heavy; bad UX for a presenter who needs to interact naturally; Playwright visible in the demo environment looks unpolished. Rejected.
- **Manual scripted presenter mode (slide-by-slide cue cards)**: the fallback if wk10 dry-run fails three times (R-9 trigger), not the primary approach. Retained only as a last-resort fallback.

## Why Chosen

Declarative + state-machine equals E2E-testable in Playwright and recoverable mid-demo. Each step is a named, typed action. The `DemoController` can be tested in isolation with mocked backend endpoints. Playwright records the same storyboard for the backup video (P3.3), so test and backup-video production share a single code path.

## Consequences

- Every demo-relevant action must have a controllable backend endpoint (some admin-only, auth-gated). Backend task A8.2 exposes these deterministic-mode endpoints.
- `apps/web/src/demo/storyboard.json` is a versioned artifact; changes require a PR and storyboard version bump.
- The Playwright E2E test suite includes a `demo-full` scenario that runs the storyboard end-to-end (see acceptance gate `make load-test-aws-full && pnpm --filter web test:e2e demo-full` in P3 wk11).
- Backup pre-recorded video (P3.3) is produced by Playwright recording the same storyboard run — not separately scripted.
- B7.1 (full 9-step wiring) is explicitly gated on A6.6/B6.0 cross-track integration smoke passing. Do NOT begin B7.1 if the smoke gate fails.
- Risk R-9: if wk7 first end-to-end run fails 3 times, simplify storyboard (drop a Should-step) and retry; if wk10 dry-run fails, fall back to scripted manual presenter mode.

## Follow-ups

- Backup video produced in wk10 (task P3.3) via Playwright recording the storyboard — supplementary per FRD §13.2, not a primary FR-O-004 satisfier.
- Phase 2: evaluate whether the DemoController storyboard pattern is reusable for customer-facing onboarding walkthroughs.
