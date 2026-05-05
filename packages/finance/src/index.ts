// FRD-2026-001 v1.3.1 §FR-O-006 — investor-perspective financial simulator.
// Public surface for the @lucia/finance package.

export {
  BASE_ASSUMPTIONS,
  SCENARIOS,
  type ScenarioName,
} from './assumptions.js';

export {
  type CapitalStructure,
  type KEALoanTerms,
  type Sensitivity,
  type SimulationInput,
  type KEALoanScheduleRow,
  type YearlyCashflow,
  type InvestorResult,
  type ValidationResult,
  validateCapitalStructure,
  generateKEALoanSchedule,
  calculateIRR,
  simulateInvestorReturn,
} from './investor-model.js';
