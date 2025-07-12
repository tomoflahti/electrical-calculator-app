/**
 * IEC DC Circuit Breaker Calculation Engine
 * Pure Metric/International standards implementation
 * Standards: IEC 62548-1:2023, IEC 60947, IEC 62619:2022, IEC 60898
 */

import type { 
  DCBreakerCalculationInput, 
  DCBreakerCalculationResult,
  DCApplicationType 
} from '../../types/standards';

import { getNextStandardBreakerSize } from '../../standards/dc/common/standardBreakerRatings';
import { 
  getIECSafetyFactor, 
  calculateIECSolarProtectionCurrent,
  getIECTemperatureDerating 
} from '../../standards/dc/iec/iecSafetyFactors';
import { 
  getIECBreakerSpecifications,
  getPrimaryIECBreakerRecommendation,
  getAvailableIECBreakerRatings 
} from '../../standards/dc/iec/iecBreakerStandards';
import { calculateCurrentFromPower, getApplicationEfficiency } from './dcPowerUtils';

/**
 * Calculate DC circuit breaker size using IEC/Metric standards
 */
export function calculateIECBreakerSize(input: DCBreakerCalculationInput): DCBreakerCalculationResult {
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

  // Get IEC-specific safety factor
  const safetyFactor = getIECSafetyFactor(applicationType, dutyCycle);
  
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
  
  // Apply IEC safety factor
  let adjustedCurrent = baseCurrent * safetyFactor;
  calculationMethod += ` × IEC safety factor (${safetyFactor})`;
  
  // IEC Solar-specific calculations per IEC 62548-1:2023
  if (applicationType === 'solar') {
    // Assume bifacial modules for conservative calculation (user can override)
    const moduleType = 'bifacial'; // More conservative than monofacial
    
    if (shortCircuitCurrent) {
      adjustedCurrent = calculateIECSolarProtectionCurrent(shortCircuitCurrent, moduleType);
      calculationMethod = `Short circuit current (${shortCircuitCurrent}A) × IEC 62548-1:2023 factor (1.375 for bifacial)`;
    } else if (panelIsc && numberOfPanels) {
      const totalIsc = panelIsc * numberOfPanels;
      adjustedCurrent = calculateIECSolarProtectionCurrent(totalIsc, moduleType);
      calculationMethod = `Panel ISC (${panelIsc}A) × Panels (${numberOfPanels}) × IEC 62548-1:2023 factor (1.375 for bifacial)`;
    } else if (panelPower && numberOfPanels && systemVoltage) {
      const totalPower = panelPower * numberOfPanels;
      const solarCurrent = calculateCurrentFromPower(totalPower, systemVoltage, 0.95);
      adjustedCurrent = calculateIECSolarProtectionCurrent(solarCurrent, moduleType);
      calculationMethod = `Panel Power (${panelPower}W) × Panels (${numberOfPanels}) ÷ Voltage (${systemVoltage}V) × Solar efficiency (0.95) × IEC 62548-1:2023 factor (1.375 for bifacial)`;
    }
  }

  // Apply IEC temperature derating (more conservative than NEC)
  let temperatureDerating = 1.0;
  if (ambientTemperature > 25) {
    temperatureDerating = getIECTemperatureDerating(ambientTemperature);
    adjustedCurrent = adjustedCurrent / temperatureDerating;
    calculationMethod += ` ÷ IEC temperature derating (${temperatureDerating.toFixed(2)})`;
  }

  // Marine environment factor per IEC 60364-7-709
  if (applicationType === 'marine' && environment === 'marine') {
    adjustedCurrent *= 1.05; // IEC marine environment factor
    calculationMethod += ' × IEC marine environment factor (1.05)';
  }

  // IEC Battery calculations per IEC 62619:2022
  if (applicationType === 'battery') {
    if (continuousOperation) {
      // IEC 62619:2022 thermal runaway protection
      adjustedCurrent *= 1.2;
      calculationMethod += ' × IEC 62619:2022 thermal runaway factor (1.2)';
    } else {
      adjustedCurrent *= 1.1; // Standard battery inrush factor
      calculationMethod += ' × Battery inrush factor (1.1)';
    }
  }

  // Find minimum breaker size
  const minimumBreakerSize = Math.ceil(adjustedCurrent);
  const nextStandardSize = getNextStandardBreakerSize(adjustedCurrent);

  // Get available breaker sizes for this application
  const availableBreakerSizes = getAvailableIECBreakerRatings(applicationType);
  
  // Find the recommended breaker rating
  const recommendedBreakerRating = nextStandardSize;
  
  // Get IEC breaker specifications
  const primaryBreaker = getPrimaryIECBreakerRecommendation(recommendedBreakerRating, applicationType);
  const alternativeBreakers = getIECBreakerSpecifications(recommendedBreakerRating, applicationType)
    .filter(breaker => breaker !== primaryBreaker);

  if (!primaryBreaker) {
    throw new Error(`No suitable IEC breaker found for ${recommendedBreakerRating}A ${applicationType} application`);
  }

  // IEC compliance checks
  const standardCompliant = checkIECCompliance(applicationType, recommendedBreakerRating, adjustedCurrent);
  const temperatureCompliant = ambientTemperature <= primaryBreaker.temperatureRating;
  const applicationCompliant = primaryBreaker.applications.includes(applicationType);
  const wireCompatible = wireGauge ? checkIECWireCompatibility(wireGauge, recommendedBreakerRating) : true;

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
 * Check IEC compliance for breaker sizing
 */
function checkIECCompliance(
  applicationType: DCApplicationType, 
  breakerRating: number, 
  adjustedCurrent: number
): boolean {
  switch (applicationType) {
    case 'solar':
      // IEC 62548 compliance
      return breakerRating >= adjustedCurrent;
    
    case 'marine':
      // IEC 60364-7-709 compliance (more conservative than NEC)
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.4;
    
    case 'automotive':
      // IEC 60364-7-722 standards (more conservative than SAE)
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.25;
    
    case 'telecom':
      // IEC 60364-7-711 high reliability
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.2;
    
    case 'battery':
      // IEC 62619:2022 battery ESS
      return breakerRating >= adjustedCurrent;
    
    case 'led':
      // IEC 60364-7-715 LED installations (more conservative)
      return breakerRating >= adjustedCurrent && breakerRating <= adjustedCurrent * 1.3;
    
    case 'industrial':
      // IEC 60364-4-43 overcurrent protection
      return breakerRating >= adjustedCurrent;
    
    default:
      return breakerRating >= adjustedCurrent;
  }
}

/**
 * Check IEC wire compatibility (metric mm² system)
 */
function checkIECWireCompatibility(wireGauge: string, breakerRating: number): boolean {
  // Metric wire ampacity ratings (IEC 60364-5-52)
  const metricAmpacityMap: Record<string, number> = {
    '1.5': 18,    // 1.5mm²
    '2.5': 25,    // 2.5mm²
    '4': 35,      // 4mm²
    '6': 45,      // 6mm²
    '10': 65,     // 10mm²
    '16': 85,     // 16mm²
    '25': 115,    // 25mm²
    '35': 130,    // 35mm²
    '50': 155,    // 50mm²
    '70': 195,    // 70mm²
    '95': 230,    // 95mm²
    '120': 270,   // 120mm²
    '150': 310,   // 150mm²
    '185': 355,   // 185mm²
    '240': 415,   // 240mm²
    '300': 480    // 300mm²
  };

  // Also support mm² suffix format
  const cleanGauge = wireGauge.replace(/mm2?$/i, '');
  const wireAmpacity = metricAmpacityMap[cleanGauge];
  if (!wireAmpacity) return true; // Unknown wire size, assume compatible

  return wireAmpacity >= breakerRating;
}