/**
 * IEC Conduit Tables - Legacy Compatibility
 * @deprecated Use organized imports from '../../standards/iec' instead
 */

// Legacy compatibility - re-export from new organized structure
export { 
  IEC_CONDUIT_SPECIFICATIONS,
  IEC_WIRE_SPECIFICATIONS,
  IEC_XLPE_WIRE_SPECIFICATIONS,
  IEC_CONDUIT_FILL_PERCENTAGES,
  IEC_BUNDLING_FACTORS,
  IEC_CONDUIT_INSTALLATION_FACTORS
} from './index';

// Legacy named exports for backward compatibility
export { IEC_CONDUIT_SPECIFICATIONS as CONDUIT_SPECIFICATIONS } from './index';
export { IEC_WIRE_SPECIFICATIONS as WIRE_SPECIFICATIONS } from './index';
export { IEC_XLPE_WIRE_SPECIFICATIONS as XLPE_WIRE_SPECIFICATIONS } from './index';
export { IEC_CONDUIT_FILL_PERCENTAGES as CONDUIT_FILL_PERCENTAGES } from './index';
export { IEC_BUNDLING_FACTORS as BUNDLING_FACTORS } from './index';