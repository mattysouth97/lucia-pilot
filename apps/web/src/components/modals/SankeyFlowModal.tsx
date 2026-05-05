// FR-M-006 — energy/money flow Sankey, surfaced via DistributionAuditCard chevron.

import { Modal } from './Modal.js';

import { SankeyCard } from '@/components/cards/SankeyCard';

export function SankeyFlowModal({ onClose }: { readonly onClose: () => void }) {
  return (
    <Modal open={true} onClose={onClose} width={980}>
      <SankeyCard />
    </Modal>
  );
}
