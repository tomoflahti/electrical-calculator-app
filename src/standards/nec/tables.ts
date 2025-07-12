/**
 * NEC Tables - Legacy Compatibility
 * @deprecated Use organized imports from '../../standards/nec' instead
 */

// Legacy compatibility - re-export from new organized structure
export { NEC_WIRE_GAUGES as WIRE_GAUGES, NEC_CONDUIT_FILLS as CONDUIT_FILLS } from './index';
export { NEC_TEMPERATURE_CORRECTION_FACTORS as TEMPERATURE_CORRECTION_FACTORS } from './index';
export { NEC_CONDUCTOR_ADJUSTMENT_FACTORS as CONDUCTOR_ADJUSTMENT_FACTORS } from './index';
export { NEC_CONDUCTOR_MATERIALS } from './index';

// Legacy constants
export const ALUMINUM_RESISTANCE_MULTIPLIER = 1.64;
export const VOLTAGE_DROP_LIMITS = {
  BRANCH_CIRCUIT: 3.0,
  FEEDER: 2.5,
  TOTAL: 5.0
};