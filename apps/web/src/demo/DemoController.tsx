// FR-O-004 Demo Mode controller — declarative storyboard runner per ADR-0006.
//
// Reads `storyboard.json`, advances steps on a wall-clock timer, and exposes a hook
// (`useDemoController`) so the Sidebar / AdminConsole / Topbar can render running state
// and provide pause / resume / jump-to-step controls.
//
// Per ADR-0006 the storyboard is purely declarative — actions dispatch real frontend
// effects (navigate, scroll-to, trigger-modal) and call admin endpoints when needed
// (inject_anomaly). No demo-only mock state lives in components.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import storyboard from './storyboard.json';

import { useLuciaModals } from '@/lib/modals';

// ─── Types ──────────────────────────────────────────────────────────────────

export type DemoActionType =
  | 'noop'
  | 'navigate'
  | 'inject_anomaly'
  | 'trigger_tamper'
  | 'trigger_report'
  | 'scroll_to'
  | 'play_tx_stream';

export interface DemoAction {
  type: DemoActionType;
  payload: Record<string, unknown>;
}

export interface DemoStep {
  id: string;
  label: string;
  duration_ms: number;
  action: DemoAction;
}

export interface DemoState {
  running: boolean;
  currentStep: number;
  elapsedMs: number;
  steps: DemoStep[];
}

export interface DemoController extends DemoState {
  start: () => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  reset: () => void;
  jumpTo: (stepIndex: number) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const DemoCtx = createContext<DemoController | null>(null);

interface DemoProviderProps {
  children: ReactNode;
}

const STEPS: DemoStep[] = storyboard as DemoStep[];

const TICK_MS = 250;

export function DemoProvider({ children }: DemoProviderProps) {
  const navigate = useNavigate();
  const { openTamper, openReport } = useLuciaModals();

  const [state, setState] = useState<DemoState>({
    running: false,
    currentStep: 0,
    elapsedMs: 0,
    steps: STEPS,
  });

  // Refs let the tick callback read the latest state without re-creating the interval.
  const stateRef = useRef(state);
  stateRef.current = state;
  const dispatchedStepRef = useRef<number>(-1);

  // Dispatch the action for a given step exactly once.
  const dispatch = useCallback(
    (step: DemoStep) => {
      const { type, payload } = step.action;
      switch (type) {
        case 'navigate': {
          const path = typeof payload.path === 'string' ? payload.path : '/';
          navigate(path);
          break;
        }
        case 'scroll_to': {
          const id = typeof payload.id === 'string' ? payload.id : null;
          if (id) {
            const el = document.getElementById(id);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          break;
        }
        case 'trigger_tamper':
          openTamper();
          break;
        case 'trigger_report':
          openReport();
          break;
        case 'inject_anomaly': {
          // Fires admin endpoint; in P0 the engine route is a placeholder.
          const buildingId = typeof payload.building_id === 'string' ? payload.building_id : '';
          const anomalyType = typeof payload.type === 'string' ? payload.type : 'inverter_fail';
          void fetch(
            (import.meta.env.VITE_API_BASE ?? 'http://localhost:3000') + '/api/admin/anomaly',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ building_id: buildingId, type: anomalyType }),
            },
          ).catch(() => {
            console.warn('[demo] inject_anomaly endpoint not available yet', buildingId, anomalyType);
          });
          break;
        }
        case 'play_tx_stream':
          // The live tx stream auto-plays via WebSocket; this action is a marker for the UI
          // (Sidebar) to highlight that step. No additional dispatch needed.
          break;
        case 'noop':
        default:
          break;
      }
    },
    [navigate, openTamper, openReport],
  );

  // Wall-clock advance loop.
  useEffect(() => {
    if (!state.running) return;
    const id = window.setInterval(() => {
      const cur = stateRef.current;
      const step = cur.steps[cur.currentStep];
      if (!step) return;

      // Dispatch action on entry into a new step.
      if (dispatchedStepRef.current !== cur.currentStep) {
        dispatchedStepRef.current = cur.currentStep;
        dispatch(step);
      }

      const nextElapsed = cur.elapsedMs + TICK_MS;
      if (nextElapsed >= step.duration_ms) {
        const nextIdx = cur.currentStep + 1;
        if (nextIdx >= cur.steps.length) {
          setState((s) => ({ ...s, running: false, elapsedMs: step.duration_ms }));
          return;
        }
        setState((s) => ({ ...s, currentStep: nextIdx, elapsedMs: 0 }));
        return;
      }
      setState((s) => ({ ...s, elapsedMs: nextElapsed }));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [state.running, dispatch]);

  // ─── Controls ─────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    dispatchedStepRef.current = -1;
    setState((s) => ({ ...s, running: true, currentStep: 0, elapsedMs: 0 }));
  }, []);

  const pause = useCallback(() => {
    setState((s) => ({ ...s, running: false }));
  }, []);

  const resume = useCallback(() => {
    setState((s) => ({ ...s, running: true }));
  }, []);

  const toggle = useCallback(() => {
    setState((s) => ({ ...s, running: !s.running }));
  }, []);

  const reset = useCallback(() => {
    dispatchedStepRef.current = -1;
    setState((s) => ({ ...s, running: false, currentStep: 0, elapsedMs: 0 }));
  }, []);

  const jumpTo = useCallback((stepIndex: number) => {
    dispatchedStepRef.current = -1;
    setState((s) => ({
      ...s,
      currentStep: Math.min(Math.max(0, stepIndex), s.steps.length - 1),
      elapsedMs: 0,
    }));
  }, []);

  const controller = useMemo<DemoController>(
    () => ({
      ...state,
      start,
      pause,
      resume,
      toggle,
      reset,
      jumpTo,
    }),
    [state, start, pause, resume, toggle, reset, jumpTo],
  );

  return <DemoCtx.Provider value={controller}>{children}</DemoCtx.Provider>;
}

export function useDemoController(): DemoController {
  const ctx = useContext(DemoCtx);
  if (!ctx) {
    // Safe no-op shim for components rendered outside the provider (e.g. tests).
    const noop = () => {};
    return {
      running: false,
      currentStep: 0,
      elapsedMs: 0,
      steps: STEPS,
      start: noop,
      pause: noop,
      resume: noop,
      toggle: noop,
      reset: noop,
      jumpTo: noop,
    };
  }
  return ctx;
}
