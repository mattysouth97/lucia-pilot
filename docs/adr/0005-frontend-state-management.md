# ADR-0005 — Frontend State Management

**Status**: Accepted
**Date**: 2026-04-30
**Source**: `.omc/plans/lucia-pilot-implementation.md` § ADR-0005

## Context

The Lucia dashboard prototype (see `untitled/project/Lucia 정산 플랫폼.html`) demonstrated that the full dashboard surface — real-time generation charts, Sankey flow, 116-building roster, blockchain tx stream, anomaly alerts, resident portal — can be rendered cleanly with local state and props. The production app adds server data fetching, cache invalidation from a WebSocket live transaction stream (FR-M-008), and a small number of truly global state items (current resident identity in portal mode, demo-mode controller for FR-O-004).

The state management choice must be legible to AI agents, minimize framework ceremony, and handle WebSocket-driven cache invalidation cleanly alongside REST polling.

**FR anchors**: FR-M-001 (main dashboard), FR-M-007 (resident portal), FR-M-008 (live tx stream), FR-O-004 (demo mode controller).

## Decision

**TanStack Query** (formerly react-query) for all server state — REST polling, mutation, and cache invalidation. **Native React state** (`useState`, `useReducer`) for local UI state. **WebSocket** via a custom hook (`useLuciaStream`) that feeds TanStack Query cache invalidation on each incoming `TxStreamMessage`. **React Context** for the two cases of genuine global state: current resident identity in portal mode, and the `DemoController` state machine (ADR-0006).

No Redux. No Zustand.

Each page declares its own `useQuery` calls. Shared query keys are exported from a single `queryKeys.ts` module for discoverability and to prevent key collisions across pages.

## Decision Drivers

- **AI-agent legibility**: TanStack Query is well-known, well-documented, and AI agents are thoroughly trained on it. Reduces hallucination risk on data-fetching patterns.
- **Prototype validation**: the dashboard prototype proved that local state + props is sufficient for the UI surface; the production version adds server state, not a richer local state model.
- **WebSocket integration**: TanStack Query's cache invalidation API (`queryClient.invalidateQueries`) provides a clean integration point for WebSocket events without requiring a separate reactive store.
- **Type safety**: TanStack Query's TypeScript DX is strong; typed query keys and response shapes align with the `packages/contracts` types from ADR-0001.

## Alternatives Considered

- **Zustand global store**: premature for this scale. A single well-typed TanStack Query cache replaces the need for a global reactive store in all current use cases. Adding Zustand would introduce a second state model with no clear boundary. Rejected.
- **Redux Toolkit**: over-ceremony for this scale and team size. Boilerplate (slices, selectors, thunks) adds cognitive load without a corresponding benefit given TanStack Query handles all async state. Rejected.
- **SWR**: TanStack Query has a stronger TypeScript DX, richer mutation API (optimistic updates, rollback), and better tooling (DevTools). SWR would be a viable alternative but offers no advantage over TanStack Query here. Rejected.
- **MobX**: reactive/observable model is a larger mental-model shift for agents and adds bundle weight. Rejected.

## Why Chosen

Minimum framework overhead, maximum ecosystem coverage, agents trained on it. The combination of TanStack Query + React state + Context maps cleanly onto the three tiers of state in this app: server state (TanStack Query), ephemeral UI state (React state), and rare global state (Context). No additional library is needed.

## Consequences

- WebSocket integration is custom (`useLuciaStream` hook) and must be tested in isolation: reconnect with exponential backoff, missed-message catch-up, off-screen circular buffer (last 50 tx for FR-M-008 LiveTxStream card). See tasks B6.4 and B7.3.
- Each page declares its own `useQuery` keys; shared keys are exported from `apps/web/src/queryKeys.ts` (single source of truth).
- TanStack Query DevTools enabled in development, stripped in production build.
- `useLuciaStream` hook wires to engine WebSocket endpoint `/ws/transactions` (task A3.7 backend); reconnect + backoff behavior must be verified against the engine's backpressure-aware broadcast (drop oldest).
- Demo Mode controller state (ADR-0006) lives in React Context, not in TanStack Query, because it is not server state.

## Follow-ups

- Revisit if SSE (Server-Sent Events) is preferred over WebSocket for the live transaction stream in Phase 2 — SSE is simpler and sufficient if the stream is unidirectional.
- Evaluate TanStack Query v5 streaming / `useInfiniteQuery` patterns for the settlements search/filter UI (FR-M-003) if pagination proves complex.
