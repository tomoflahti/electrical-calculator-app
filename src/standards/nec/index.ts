/**
 * NEC Standards - Export Index
 * Consolidated exports for NEC electrical standards
 */

// Conduit fill tables
export {
  NEC_CONDUIT_FILLS,
  NEC_CONDUIT_FILL_PERCENTAGES,
  NEC_CONDUIT_TYPES
} from './conduitFillTables';

// Wire tables
export {
  NEC_WIRE_GAUGES,
  NEC_TEMPERATURE_CORRECTION_FACTORS,
  NEC_CONDUCTOR_ADJUSTMENT_FACTORS,
  NEC_CONDUCTOR_MATERIALS,
  NEC_INSULATION_TYPES
} from './wireTables';

// Application standards
export {
  NEC_APPLICATION_REQUIREMENTS,
  NEC_INSTALLATION_METHOD_FACTORS,
  NEC_VOLTAGE_DROP_LIMITS,
  NEC_SAFETY_FACTORS,
  NEC_BOX_FILL_REQUIREMENTS
} from './applicationStandards';

// Legacy compatibility - re-export with legacy names
export {
  NEC_CONDUIT_FILLS as CONDUIT_FILLS
} from './conduitFillTables';

export {
  NEC_WIRE_GAUGES as WIRE_GAUGES,
  NEC_TEMPERATURE_CORRECTION_FACTORS as TEMPERATURE_CORRECTION_FACTORS,
  NEC_CONDUCTOR_ADJUSTMENT_FACTORS as CONDUCTOR_ADJUSTMENT_FACTORS
} from './wireTables';