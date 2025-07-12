/**
 * IEC Safety Factors for DC Circuit Breaker Sizing  
 * Metric/International standards: IEC 62548, IEC 60947, IEC 62619
 */

import type { DCApplicationType } from '../../../types/standards';

// IEC-specific safety factors for continuous and intermittent duty
export const IEC_SAFETY_FACTORS: Record<DCApplicationType, {
  continuous: number;
  intermittent: number;
  standard: string;
  description: string;
}> = {
  solar: {
    continuous: 1.375, // IEC 62548-1:2023: 1.25 × 1.1 (K_corr for bifacial modules)
    intermittent: 1.25,
    standard: 'IEC 62548-1:2023',
    description: 'PV protection current: 1.25 × K_corr × I_SC × N_parallel'
  },
  automotive: {
    continuous: 1.25,  // IEC 60364-7-722 automotive electrical installations
    intermittent: 1.15,
    standard: 'IEC 60364-7-722',
    description: 'Automotive electrical installations in vehicles'
  },
  marine: {
    continuous: 1.30,  // IEC 60364-7-709 marina and yacht installations
    intermittent: 1.20,
    standard: 'IEC 60364-7-709',
    description: 'Marina, yacht and similar boat electrical installations'
  },
  telecom: {
    continuous: 1.15,  // IEC 60364-7-711 telecommunications equipment
    intermittent: 1.10,
    standard: 'IEC 60364-7-711',
    description: 'Low voltage electrical installations - Telecommunications equipment'
  },
  battery: {
    continuous: 1.40,  // IEC 62619:2022 with thermal runaway protection
    intermittent: 1.25,
    standard: 'IEC 62619:2022',
    description: 'Secondary lithium cells and batteries for ESS - Safety requirements'
  },
  led: {
    continuous: 1.20,  // IEC 60364-7-715 extra-low voltage lighting
    intermittent: 1.15,
    standard: 'IEC 60364-7-715',
    description: 'Extra-low voltage lighting installations'
  },
  industrial: {
    continuous: 1.25,  // IEC 60364-4-43 overcurrent protection
    intermittent: 1.15,
    standard: 'IEC 60364-4-43',
    description: 'Protection for safety - Protection against overcurrent'
  }
};

// IEC solar-specific factors per IEC 62548-1:2023
export const IEC_SOLAR_FACTORS = {
  baseProtectionFactor: 1.25,    // Base protection factor
  monofacialCorrection: 1.0,     // K_corr for monofacial modules
  bifacialCorrection: 1.1,       // K_corr for bifacial modules
  monofacialCombined: 1.25,      // 1.25 × 1.0
  bifacialCombined: 1.375,       // 1.25 × 1.1
  description: 'IEC 62548-1:2023 protection current calculation'
};

// IEC battery thermal runaway factors per IEC 62619:2022
export const IEC_BATTERY_FACTORS = {
  baseFactor: 1.25,             // Base overcurrent protection factor
  thermalRunawayFactor: 1.2,    // Thermal runaway protection factor
  combined: 1.5,                // 1.25 × 1.2 for systems with thermal runaway protection
  description: 'IEC 62619:2022 battery ESS protection factors'
};

// IEC temperature derating factors (more conservative than NEC)
export const IEC_TEMPERATURE_DERATING: Record<number, number> = {
  25: 1.00,   // Reference temperature
  30: 0.94,   // More conservative than NEC
  35: 0.87,
  40: 0.82,
  45: 0.76,
  50: 0.71,
  55: 0.65,
  60: 0.58,
  65: 0.50,
  70: 0.41,
  75: 0.29,   // Maximum derating
};

/**
 * Get IEC safety factor for application and duty cycle
 */
export function getIECSafetyFactor(
  applicationType: DCApplicationType,
  dutyCycle: 'continuous' | 'intermittent'
): number {
  const factors = IEC_SAFETY_FACTORS[applicationType];
  if (!factors) {
    throw new Error(`Invalid IEC application type: ${applicationType}`);
  }
  return dutyCycle === 'continuous' ? factors.continuous : factors.intermittent;
}

/**
 * Get IEC standard reference for application
 */
export function getIECStandardReference(applicationType: DCApplicationType): string {
  const factors = IEC_SAFETY_FACTORS[applicationType];
  return factors?.standard || 'IEC 60364';
}

/**
 * Calculate IEC solar protection current per IEC 62548-1:2023
 */
export function calculateIECSolarProtectionCurrent(
  shortCircuitCurrent: number,
  moduleType: 'monofacial' | 'bifacial' = 'monofacial'
): number {
  const kCorr = moduleType === 'bifacial' 
    ? IEC_SOLAR_FACTORS.bifacialCorrection 
    : IEC_SOLAR_FACTORS.monofacialCorrection;
  
  return shortCircuitCurrent * IEC_SOLAR_FACTORS.baseProtectionFactor * kCorr;
}

/**
 * Calculate IEC battery protection current per IEC 62619:2022
 */
export function calculateIECBatteryProtectionCurrent(
  batteryPackCurrent: number,
  numberOfStrings: number,
  thermalRunawayProtection: boolean = true
): number {
  let protectionCurrent = batteryPackCurrent * numberOfStrings * IEC_BATTERY_FACTORS.baseFactor;
  
  if (thermalRunawayProtection) {
    protectionCurrent *= IEC_BATTERY_FACTORS.thermalRunawayFactor;
  }
  
  return protectionCurrent;
}

/**
 * Get IEC temperature derating factor
 */
export function getIECTemperatureDerating(temperature: number): number {
  if (temperature <= 25) return 1.0;
  
  // Find the nearest temperature key
  const tempKeys = Object.keys(IEC_TEMPERATURE_DERATING).map(Number).sort((a, b) => a - b);
  const nearestTemp = tempKeys.find(temp => temp >= temperature) || tempKeys[tempKeys.length - 1];
  
  return IEC_TEMPERATURE_DERATING[nearestTemp] || 0.29;
}