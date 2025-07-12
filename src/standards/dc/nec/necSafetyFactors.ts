/**
 * NEC Safety Factors for DC Circuit Breaker Sizing
 * Imperial/US standards: NEC, UL489, ABYC, SAE
 */

import type { DCApplicationType } from '../../../types/standards';

// NEC-specific safety factors for continuous and intermittent duty
export const NEC_SAFETY_FACTORS: Record<DCApplicationType, {
  continuous: number;
  intermittent: number;
  standard: string;
  description: string;
}> = {
  solar: {
    continuous: 1.56,  // NEC 690.8(A): 1.25 × 1.25 for continuous current
    intermittent: 1.25,
    standard: 'NEC 690.8(A)',
    description: 'Solar applications require 125% × 125% for continuous duty protection'
  },
  automotive: {
    continuous: 1.25,  // SAE J1128 automotive wiring standards
    intermittent: 1.15,
    standard: 'SAE J1128',
    description: 'SAE automotive standards with temperature derating'
  },
  marine: {
    continuous: 1.30,  // ABYC E-11 with corrosion and environmental factors
    intermittent: 1.20,
    standard: 'ABYC E-11',
    description: 'ABYC marine standards with environmental protection factors'
  },
  telecom: {
    continuous: 1.15,  // High reliability, controlled environment
    intermittent: 1.10,
    standard: 'NECA/BICSI',
    description: 'Telecommunications high-reliability standards'
  },
  battery: {
    continuous: 1.40,  // High current charging with UL 1973 safety margins
    intermittent: 1.25,
    standard: 'UL 1973/UL 9540A',
    description: 'Battery systems with high inrush currents and charging protection'
  },
  led: {
    continuous: 1.20,  // Standard LED driver protection
    intermittent: 1.15,
    standard: 'UL 8750',
    description: 'LED lighting with driver efficiency considerations'
  },
  industrial: {
    continuous: 1.25,  // Standard NEC industrial safety factor
    intermittent: 1.15,
    standard: 'NEC 430',
    description: 'Industrial applications with standard NEC safety margins'
  }
};

// NEC-specific multipliers for environmental conditions
export const NEC_ENVIRONMENTAL_FACTORS = {
  marine: 1.05,      // ABYC E-11 marine environment factor
  outdoor: 1.02,     // Outdoor exposure factor
  engineRoom: 1.08,  // Engine compartment high temperature
  dusty: 1.03        // Dusty/dirty environment factor
};

// NEC solar-specific calculations per NEC 690.8(A)
export const NEC_SOLAR_FACTORS = {
  continuous: 1.25,     // First 125% factor
  safety: 1.25,         // Second 125% factor  
  combined: 1.56,       // 1.25 × 1.25 = 1.5625
  description: 'NEC 690.8(A) requires 125% × 125% = 156.25% of short circuit current'
};

/**
 * Get NEC safety factor for application and duty cycle
 */
export function getNECSafetyFactor(
  applicationType: DCApplicationType,
  dutyCycle: 'continuous' | 'intermittent'
): number {
  const factors = NEC_SAFETY_FACTORS[applicationType];
  if (!factors) {
    throw new Error(`Invalid NEC application type: ${applicationType}`);
  }
  return dutyCycle === 'continuous' ? factors.continuous : factors.intermittent;
}

/**
 * Get NEC standard reference for application
 */
export function getNECStandardReference(applicationType: DCApplicationType): string {
  const factors = NEC_SAFETY_FACTORS[applicationType];
  return factors?.standard || 'NEC';
}

/**
 * Calculate NEC solar protection current per NEC 690.8(A)
 */
export function calculateNECSolarProtectionCurrent(shortCircuitCurrent: number): number {
  return shortCircuitCurrent * NEC_SOLAR_FACTORS.combined;
}