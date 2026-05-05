// FR-M-007 / FR-S-008 modal context — real provider.
// Wraps the app to expose openBuilding / openReport / openTamper to any consumer.
// Mounts BuildingDetailModal / ReportModal / TamperModal from components/modals/.

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { BuildingDetailModal } from '@/components/modals/BuildingDetailModal';
import { ReportModal } from '@/components/modals/ReportModal';
import { SankeyFlowModal } from '@/components/modals/SankeyFlowModal';
import { TamperModal } from '@/components/modals/TamperModal';
import { TxDetailModal } from '@/components/modals/TxDetailModal';
import type { LedgerRow } from '@/routes/Home/ActivityZone';

// Minimal building shape used by cards (extended by @lucia/contracts BuildingRow later).
//
// The dashboard cards (`BuildingsCard`, `BlockchainCard`, `AnomalyCard`) pass the
// trimmed shape; `BuildingDetailModal` consumes the richer prototype-extended
// shape when drawing the detail view. Until Phase 2 wires up the engine
// endpoints (FR-M-002 backend wiring), the prototype-extended fields are
// optional — the modal coalesces missing values from the trimmed fields.
export interface BuildingLike {
  id: string;
  region: string;
  today: number;
  capacity: number;
  eff: number;
  status: 'ok' | 'warn' | 'alert' | 'maintenance';
  subsidy: number;
  // Prototype-extended demo fields (optional until FR-M-002 backend lands)
  building_id?: string;
  city?: string;
  district?: string;
  installed_kw?: number;
  inverter_count?: number;
  lat?: number;
  lng?: number;
}

export interface LuciaModals {
  openBuilding: (b: BuildingLike) => void;
  openReport: () => void;
  openTamper: () => void;
  openTx: (tx: LedgerRow) => void;
  openSankey: () => void;
  closeAll: () => void;
}

interface ModalState {
  building: BuildingLike | null;
  showReport: boolean;
  showTamper: boolean;
  tx: LedgerRow | null;
  showSankey: boolean;
}

const ModalCtx = createContext<LuciaModals | null>(null);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [state, setState] = useState<ModalState>({
    building: null,
    showReport: false,
    showTamper: false,
    tx: null,
    showSankey: false,
  });

  const openBuilding = useCallback((b: BuildingLike) => {
    setState((s) => ({ ...s, building: b }));
  }, []);

  const openReport = useCallback(() => {
    setState((s) => ({ ...s, showReport: true }));
  }, []);

  const openTamper = useCallback(() => {
    setState((s) => ({ ...s, showTamper: true }));
  }, []);

  const openTx = useCallback((tx: LedgerRow) => {
    setState((s) => ({ ...s, tx }));
  }, []);

  const openSankey = useCallback(() => {
    setState((s) => ({ ...s, showSankey: true }));
  }, []);

  const closeAll = useCallback(() => {
    setState({ building: null, showReport: false, showTamper: false, tx: null, showSankey: false });
  }, []);

  const value = useMemo<LuciaModals>(
    () => ({ openBuilding, openReport, openTamper, openTx, openSankey, closeAll }),
    [openBuilding, openReport, openTamper, openTx, openSankey, closeAll],
  );

  return (
    <ModalCtx.Provider value={value}>
      {children}
      {state.building && <BuildingDetailModal building={state.building} onClose={closeAll} />}
      {state.showReport && <ReportModal onClose={closeAll} />}
      {state.showTamper && <TamperModal onClose={closeAll} />}
      {state.tx && (
        <TxDetailModal
          tx={state.tx}
          onClose={closeAll}
          onEscalateToRejection={
            state.tx.status === 'bad'
              ? () => setState((s) => ({ ...s, tx: null, showTamper: true }))
              : undefined
          }
        />
      )}
      {state.showSankey && <SankeyFlowModal onClose={closeAll} />}
    </ModalCtx.Provider>
  );
}

export function useLuciaModals(): LuciaModals {
  const ctx = useContext(ModalCtx);
  if (!ctx) {
    // Allow card components imported outside the provider (e.g. test harness)
    // to call modal methods without crashing — log instead.
    return {
      openBuilding: (b) => console.warn('[modals] no provider; openBuilding', b.id),
      openReport: () => console.warn('[modals] no provider; openReport'),
      openTamper: () => console.warn('[modals] no provider; openTamper'),
      openTx: (tx) => console.warn('[modals] no provider; openTx', tx.id),
      openSankey: () => console.warn('[modals] no provider; openSankey'),
      closeAll: () => {},
    };
  }
  return ctx;
}

