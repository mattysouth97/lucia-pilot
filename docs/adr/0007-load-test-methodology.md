# ADR-0007 — Load-Test Methodology for FR-O-001 (9,354동)

**Status**: Accepted
**Date**: 2026-04-30
**Source**: `.omc/plans/lucia-pilot-implementation.md` § ADR-0007

## Context

FR-O-001 requires the system to demonstrate operation at 116 buildings (current pilot), 1,000 buildings (near-term scale), and 9,354 buildings (전국 LH 임대단지 full scale — 가설 전국 규모). FR-O-001 is rated Must-Have in FRD-2026-001. A Must-Have functional requirement cannot be satisfied by a pre-recorded video of a past test run — the system must actually demonstrate the property during the acceptance window.

The load test is also embedded in the demo storyboard as Step 8 (per ADR-0006), making it demo-critical in addition to being an FR acceptance gate.

Two infrastructure risks are present:
1. **Provisioning lead time**: Korean enterprise AWS procurement can exceed 1 week. Deferring AWS provisioning to wk8 (the week before the wk11 load test) leaves no buffer.
2. **Tool MQTT maturity**: not all load-test tools have mature MQTT support; the engine ingestion path is MQTT-first (ADR-0003), so the load generator must speak MQTT natively.

**FR anchors**: FR-O-001 (9,354동 scale demonstration), NFR-1 (throughput), NFR-3 (latency), FR-S-007 (100 TPS chain), FR-D-003 (100 msg/s MQTT).

## Decision

**k6** with the **`xk6-mqtt`** extension. Three scenario tiers run in sequence:

(a) **MQTT publisher tier**: a single k6 process spawns N virtual buildings, each publishing one generation event per minute. N = 116 / 1,000 / 9,354 in ascending runs.

(b) **HTTP load tier**: k6 hits the engine's `/api/settlements` time-range query endpoints to verify FR-M-003's 100k-row ≤2s budget under concurrent load.

(c) **Lighthouse scoring tier**: frontend dashboard scored at each scale to verify UI responsiveness does not degrade.

**AWS provisioning is part of P0 (week 1), task P0.13** — not deferred to wk8. AWS account, IAM role, billing alarm, m6i.2xlarge launch template, and a k6 + xk6-mqtt baked AMI are all provisioned and verified by end of wk1. This eliminates the procurement timing risk.

A smoke load test on AWS runs in wk8 (A8.1) at N=1,000 to validate the pipeline before the full wk11 run. The full 116/1,000/9,354 run executes in P3 wk11 (P3.5) as the FR-O-001 Must-Have acceptance gate.

The pre-recorded backup video (P3.3) is produced by Playwright recording the demo storyboard in wk10. It is the demo-day presentation fallback per FRD §13.2 ONLY — it is not, and cannot be, the FR-O-001 acceptance satisfier.

## Decision Drivers

- FR-O-001 is Must-Have: requires the system to actually demonstrate the property, not record a past demonstration
- FR-O-001 + NFR-1 + NFR-3 acceptance criteria require real load execution
- Korean enterprise procurement lead times can exceed 1 week (Risk R-3); P0.13 provisioning eliminates this risk
- The load test report is embedded in demo Step 8 (ADR-0006 storyboard); if the load test has not run before demo day, Step 8 fails
- FR-D-003 (100 msg/s MQTT) requires MQTT-native load generation

## Alternatives Considered

- **Artillery**: less mature MQTT extension support; would require more custom scripting to match xk6-mqtt's native integration. Rejected.
- **Custom Node.js load script**: reinvents the wheel; poorer built-in reporting; not CI-runnable with standard output formats. Rejected.
- **Defer AWS provisioning to wk8**: rejected — Korean enterprise procurement lead times can exceed 1 week; failing to provision by wk8 leaves no buffer before the wk11 full run. Provisioning moved to P0.13.
- **Recorded video as Must-Have satisfier**: rejected explicitly. Must-Have requires the system to actually demonstrate the property. A video of a past demonstration satisfies the demo presentation (FRD §13.2 fallback) but does not constitute FR-O-001 acceptance. This distinction is non-negotiable.

## Why Chosen

k6 has a native MQTT extension (xk6-mqtt) — one tool, one report, CI-runnable. The three-tier scenario structure (MQTT + HTTP + Lighthouse) covers all FR-O-001 / NFR-1 / NFR-3 dimensions in a single k6 run. P0 provisioning eliminates the wk8 timing risk that was the primary threat to FR-O-001 acceptance.

## Consequences

- AWS account + IAM role + billing alarm provisioned in P0.13; provisioning script committed to `infra/aws/`; AMI ID recorded in this ADR after provisioning (update this file in P0.13 completion commit).
- `aws sts get-caller-identity` must return successfully as part of the P0 acceptance gate.
- Smoke load test on AWS m6i.2xlarge in wk8 (A8.1) at N=1,000 validates the pipeline 3 weeks before the full run.
- Full load test (N=116/1,000/9,354) runs in P3 wk11 (P3.5); results are captured and embedded in demo Step 8 as the FR-O-001 acceptance artifact.
- Pre-recorded backup video produced in wk10 (P3.3) serves only as demo-day presentation fallback per FRD §13.2; it does not substitute for the live load test as an FR-O-001 satisfier.
- Risk R-3 trigger: if AWS access is not functional by EOD wk1, escalate to GCP equivalent. If both fail by EOD wk2, downgrade FR-O-001 to "116 + 1,000 demonstrated, 9,354 simulated locally with degraded numbers."

## Follow-ups

- Update this ADR with the m6i.2xlarge AMI ID after P0.13 provisioning is complete.
- Phase 2: run load tests against the real Hyperledger Fabric production network (not the demo laptop LevelDB instance) and at real 9,354-building MQTT volume.
- Phase 2: re-evaluate Kafka partition strategy (see ADR-0003) at 9,354-building sustained load.
