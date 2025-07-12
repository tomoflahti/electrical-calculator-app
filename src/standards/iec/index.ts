/**
 * IEC Standards - Export Index
 * Consolidated exports for IEC electrical standards
 */

// Conduit fill tables
export {
  IEC_CONDUIT_SPECIFICATIONS,
  IEC_CONDUIT_FILL_PERCENTAGES,
  IEC_CONDUIT_INSTALLATION_FACTORS
} from './conduitFillTables';

// Wire tables
export {
  IEC_WIRE_SPECIFICATIONS,
  IEC_XLPE_WIRE_SPECIFICATIONS,
  IEC_BUNDLING_FACTORS
} from './wireTables';

// Application standards
export {
  IEC_APPLICATION_REQUIREMENTS,
  IEC_INSTALLATION_METHOD_FACTORS,
  IEC_TEMPERATURE_CORRECTION_FACTORS,
  IEC_CONDUCTOR_MATERIAL_FACTORS
} from './applicationStandards';

// Legacy compatibility - re-export with legacy names
export { IEC_CONDUIT_SPECIFICATIONS as CONDUIT_SPECIFICATIONS } from './conduitFillTables';
export { IEC_CONDUIT_FILL_PERCENTAGES as CONDUIT_FILL_PERCENTAGES } from './conduitFillTables';
export { IEC_WIRE_SPECIFICATIONS as WIRE_SPECIFICATIONS } from './wireTables';
export { IEC_XLPE_WIRE_SPECIFICATIONS as XLPE_WIRE_SPECIFICATIONS } from './wireTables';
export { IEC_BUNDLING_FACTORS as BUNDLING_FACTORS } from './wireTables';