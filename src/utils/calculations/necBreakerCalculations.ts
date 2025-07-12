/**
 * NEC DC Circuit Breaker Calculation Engine
 * Pure Imperial/US standards implementation
 * Standards: NEC 690.8(A), UL489, ABYC E-11, SAE J1128
 */

import type { 
  DCBreakerCalculationInput, 
  DCBreakerCalculationResult,
  DCApplicationType 
} from '../../types/standards';

import { getNextStandardBreakerSize } from '../../standards/dc/common/standardBreakerRatings';
import { 
  getNECSafetyFactor, 
  calculateNECSolarProtectionCurrent,
  NEC_ENVIRONMENTAL_FACTORS 
} from '../../standards/dc/nec/necSafetyFactors';
import { 
  getNECBreakerSpecifications,
  getPrimaryNECBreakerRecommendation,
  getAvailableNECBreakerRatings 
} from '../../standards/dc/nec/necBreakerStandards';
import { calculateCurrentFromPower, getApplicationEfficiency } from './dcPowerUtils';

/**
 * Calculate DC circuit breaker size using NEC/Imperial standards
 */
export function calculateNECBreakerSize(input: DCBreakerCalculationInput): DCBreakerCalculationResult {
  const {
    inputMethod,
    loadCurrent,
    loadPower,
    systemVoltage,
    applicationType,
    dutyCycle,
    ambientTemperature = 25,
    shortCircuitCurrent,
    numberOfPanels,
    panelIsc,
    panelPower,
    continuousOperation = dutyCycle === 'continuous',
    wireGauge,
    environment = 'indoor',
    efficiencyFactor,
    powerFactor = 1.0
  } = input;

  // Get NEC-specific safety factor
  const safetyFactor = getNECSafetyFactor(applicationType, dutyCycle);
  
  // Determine efficiency factor
  const actualEfficiencyFactor = efficiencyFactor || getApplicationEfficiency(applicationType);
  
  // Calculate base current from input method
  let baseCurrent: number;
  let calculationMethod: string;
  let powerAnalysis: DCBreakerCalculationResult['powerAnalysis'];
  
  if (inputMethod === 'power' && loadPower && systemVoltage) {
    // Power-based calculation: I = P/V
    baseCurrent = calculateCurrentFromPower(loadPower, systemVoltage, actualEfficiencyFactor, powerFactor);
    calculationMethod = `Power (${loadPower}W) ÷ Voltage (${systemVoltage}V) × Efficiency (${actualEfficiencyFactor}) × Power Factor (${powerFactor})`;
    
    powerAnalysis = {
      inputPower: loadPower,
      calculatedCurrent: baseCurrent,
      systemVoltage,
      efficiencyFactor: actualEfficiencyFactor,
      effectivePower: loadPower / actualEfficiencyFactor,
      powerLossWatts: (loadPower / actualEfficiencyFactor) - loadPower,
      powerFactor
    };
  } else if (inputMethod === 'current' && loadCurrent) {
    // Direct current input
    baseCurrent = loadCurrent;
    calculationMethod = `Load current (${loadCurrent}A)`;
  } else {
    throw new Error('Invalid input method or missing required parameters');
  }
  
  // Apply NEC safety factor
  let adjustedCurrent = baseCurrent * safetyFactor;
  calculationMethod += ` × NEC safety factor (${safetyFactor})`;
  
  // NEC Solar-specific calculations per NEC 690.8(A)
  if (applicationType === 'solar') {
    if (shortCircuitCurrent) {
      adjustedCurrent = calculateNECSolarProtectionCurrent(shortCircuitCurrent);
      calculationMethod = `Short circuit current (${shortCircuitCurrent}A) × NEC 690.8(A) factor (1.56)`;
    } else if (panelIsc && numberOfPanels) {
      const totalIsc = panelIsc * numberOfPanels;
      adjustedCurrent = calculateNECSolarProtectionCurrent(totalIsc);
      calculationMethod = `Panel ISC (${panelIsc}A) × Panels (${numberOfPanels}) × NEC 690.8(A) factor (1.56)`;
    } else if (panelPower && numberOfPanels && systemVoltage) {
      const totalPower = panelPower * numberOfPanels;
      const solarCurrent = calculateCurrentFromPower(totalPower, systemVoltage, 0.95);
      adjustedCurrent = calculateNECSolarProtectionCurrent(solarCurrent);
      calculationMethod = `Panel Power (${panelPower}W) × Panels (${numberOfPanels}) ÷ Voltage (${systemVoltage}V) × Solar efficiency (0.95) × NEC 690.8(A) factor (1.56)`;
    }
  }

  // Apply NEC temperature derating (simplified - only above 40°C per NEC)
  let temperatureDerating = 1.0;
  if (ambientTemperature > 40) {
    temperatureDerating = Math.max(0.58, 1 - (ambientTemperature - 40) * 0.01); // NEC simplified derating
    adjustedCurrent = adjustedCurrent / temperatureDerating;
    calculationMethod += ` ÷ NEC temperature derating (${temperatureDerating.toFixed(2)})`;
  }

  // Apply NEC environmental factors
  if (applicationType === 'marine' && environment === 'marine') {
    adjustedCurrent *= NEC_ENVIRONMENTAL_FACTORS.marine;
    calculationMethod += ` × ABYC marine factor (${NEC_ENVIRONMENTAL_FACTORS.marine})`;
  }

  // NEC Battery calculations (UL 1973, UL 9540A)
  if (applicationType === 'battery' && continuousOperation) {
    adjustedCurrent *= 1.1; // NEC battery charging inrush
    calculationMethod += ' × NEC battery inrush factor (1.1)';
  }

  // Find minimum breaker size
  const minimumBreakerSize = Math.ceil(adjustedCurrent);
  const nextStandardSize = getNextStandardBreakerSize(adjustedCurrent);

  // Get available breaker sizes for this application
  const availableBreakerSizes = getAvailableNECBreakerRatings(applicationType);
  
  // Find the recommended breaker rating
  const recommendedBreakerRating = nextStandardSize;
  
  // Get NEC breaker specifications
  const primaryBreaker = getPrimaryNECBreakerRecommendation(recommendedBreakerRating, applicationType);
  const alternativeBreakers = getNECBreakerSpecifications(recommendedBreakerRating, applicationType)
    .filter(breaker => breaker !== primaryBreaker);

  if (!primaryBreaker) {
    throw new Error(`No suitable NEC breaker found for ${recommendedBreakerRating}A ${applicationType} application`);
  }

  // NEC compliance checks
  const standardCompliant = checkNECCompliance(applicationType, recommendedBreakerRating, adjustedCurrent);
  const temperatureCompliant = ambientTemperature <= primaryBreaker.temperatureRating;
  const applicationCompliant = primaryBreaker.applications.includes(applicationType);
  const wireCompatible = wireGauge ? checkNECWireCompatibility(wireGauge, recommendedBreakerRating) : true;

  return {
    recommendedBreakerRating,
    breakerType: primaryBreaker.type,
    standard: primaryBreaker.standard,
    calculationMethod,
    safetyFactor,
    adjustedCurrent: Math.round(adjustedCurrent * 100) / 100,
    temperatureDerating: temperatureDerating < 1.0 ? temperatureDerating : undefined,
    powerAnalysis,
    compliance: {
      standardCompliant,
      wireCompatible,
      applicationCompliant,
      temperatureCompliant
    },
    availableBreakerSizes,
    minimumBreakerSize,
    nextStandardSize,
    breakerRecommendations: {
      primary: primaryBreaker,
      alternatives: alternativeBreakers
    }
  };
}

/**
 * Check NEC compliance for breaker sizing
 */
function checkNECCompliance(
  applicationType: DCApplicationType, 
  breakerRating: number, 
  adjustedCurrent: number
): boolean {
  switch (applicationType) {
    case 'solar':
      // NEC 690.8(A) compliance
      return breakerRating >= adjustedCurrent;
    
    case 'marine':
      // ABYC E-11 compliance
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.5;
    
    case 'automotive':
      // SAE standards
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.3;
    
    case 'telecom':
      // High reliability
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.2;
    
    case 'battery':
    case 'led':
    case 'industrial':
      // Standard NEC protection
      return breakerRating >= adjustedCurrent;
    
    default:
      return breakerRating >= adjustedCurrent;
  }
}

/**
 * Check NEC wire compatibility (AWG system)
 */
function checkNECWireCompatibility(wireGauge: string, breakerRating: number): boolean {
  // AWG wire ampacity ratings at 75°C (NEC Table 310.15(B)(16))
  const awgAmpacityMap: Record<string, number> = {
    '14': 20,    // 14 AWG
    '12': 25,    // 12 AWG
    '10': 35,    // 10 AWG
    '8': 50,     // 8 AWG
    '6': 65,     // 6 AWG
    '4': 85,     // 4 AWG
    '2': 115,    // 2 AWG
    '1': 130,    // 1 AWG
    '1/0': 150,  // 1/0 AWG
    '2/0': 175,  // 2/0 AWG
    '3/0': 200,  // 3/0 AWG
    '4/0': 230   // 4/0 AWG
  };

  const wireAmpacity = awgAmpacityMap[wireGauge];
  if (!wireAmpacity) return true; // Unknown wire size, assume compatible

  return wireAmpacity >= breakerRating;
}