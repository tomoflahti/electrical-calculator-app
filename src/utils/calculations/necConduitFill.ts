/**
 * NEC Conduit Fill Calculation Engine
 * Pure Imperial/US standards implementation
 * Standards: NEC Chapter 9, NEMA, UL
 */

import type { 
  ConduitFillCalculationInput, 
  ConduitFillCalculationResult
} from '../../types/standards';

import { NEC_WIRE_GAUGES, NEC_CONDUIT_FILLS } from '../../standards/nec';
import { getApplicationRequirements, getInstallationMethodFactors, calculateEnvironmentalCompliance as calculateComprehensiveCompliance } from './conduitFillRouter';

/**
 * Calculate conduit fill using NEC/Imperial standards
 */
export function calculateNECConduitFill(input: ConduitFillCalculationInput): ConduitFillCalculationResult {
  const {
    wires,
    conduitType,
    conduitSize,
    applicationType,
    installationMethod,
    ambientTemperature = 30, // Default NEC ambient
    environment = 'dry',
    futureFillReserve = 0
  } = input;

  // Calculate total wire area
  const wireBreakdown = calculateNECWireBreakdown(wires);
  const totalWireArea = wireBreakdown.reduce((sum, wire) => sum + wire.totalArea, 0);
  const totalWireCount = wires.reduce((sum, wire) => sum + wire.quantity, 0);

  // Apply future fill reserve
  const adjustedWireArea = totalWireArea * (1 + futureFillReserve / 100);

  // Get available conduits for the specified type
  const availableConduits = NEC_CONDUIT_FILLS
    .filter(c => c.conduitType === conduitType)
    .sort((a, b) => a.fillArea - b.fillArea); // Sort by area (smallest first)

  // If specific conduit size is requested, calculate for that size
  if (conduitSize) {
    const specificConduit = availableConduits.find(c => c.conduitSize === conduitSize);
    if (specificConduit) {
      return calculateSpecificNECConduitFill(
        specificConduit,
        adjustedWireArea,
        totalWireCount,
        wireBreakdown,
        input
      );
    } else {
      throw new Error(`Conduit size ${conduitSize} not found for type ${conduitType}`);
    }
  }

  // Find the smallest compliant conduit
  let recommendedConduit = null;
  let fillPercentage = 0;
  let maxAllowedFillPercentage = 0;
  let fillRule = '';

  for (const conduit of availableConduits) {
    const necFillData = calculateNECFillData(conduit, adjustedWireArea, totalWireCount);
    
    if (necFillData.isCompliant) {
      recommendedConduit = conduit;
      fillPercentage = necFillData.fillPercentage;
      maxAllowedFillPercentage = necFillData.maxAllowedFillPercentage;
      fillRule = necFillData.fillRule;
      break;
    }
  }

  // If no compliant conduit found, use the largest available
  if (!recommendedConduit) {
    recommendedConduit = availableConduits[availableConduits.length - 1];
    const necFillData = calculateNECFillData(recommendedConduit, adjustedWireArea, totalWireCount);
    fillPercentage = necFillData.fillPercentage;
    maxAllowedFillPercentage = necFillData.maxAllowedFillPercentage;
    fillRule = necFillData.fillRule;
  }

  // Calculate alternatives
  const alternatives = availableConduits.map(conduit => {
    const necFillData = calculateNECFillData(conduit, adjustedWireArea, totalWireCount);
    return {
      conduitSize: conduit.conduitSize,
      conduitType: conduit.conduitType,
      fillPercentage: necFillData.fillPercentage,
      isCompliant: necFillData.isCompliant,
      costFactor: calculateCostFactor(conduit.conduitSize, conduitType)
    };
  });

  // Get application and installation method data
  const applicationRequirements = getApplicationRequirements(applicationType, 'NEC');
  const installationFactors = getInstallationMethodFactors(installationMethod, 'NEC');

  // Calculate environmental compliance
  const environmentalCompliance = calculateComprehensiveCompliance(
    applicationType,
    installationMethod,
    ambientTemperature,
    environment,
    'NEC'
  );

  return {
    recommendedConduitSize: recommendedConduit.conduitSize,
    conduitType,
    wireStandard: 'NEC',
    
    fillAnalysis: {
      totalWireArea: adjustedWireArea,
      conduitInternalArea: recommendedConduit.fillArea,
      fillPercentage,
      maxAllowedFillPercentage,
      availableArea: recommendedConduit.fillArea - adjustedWireArea,
      fillRule: fillRule as '53% (1 wire)' | '31% (2 wires)' | '40% (3+ wires)'
    },
    
    compliance: {
      codeCompliant: fillPercentage <= maxAllowedFillPercentage,
      fillCompliant: fillPercentage <= maxAllowedFillPercentage,
      temperatureCompliant: environmentalCompliance.temperatureCompliance,
      applicationCompliant: environmentalCompliance.applicationCompliance,
      installationCompliant: environmentalCompliance.environmentCompliance
    },
    
    wireBreakdown,
    alternatives,
    
    applicationData: {
      applicationType,
      installationMethod,
      specialRequirements: applicationRequirements.specialRequirements,
      recommendedPractices: applicationRequirements.recommendedPractices
    },
    
    calculationMetadata: {
      calculationMethod: 'NEC Chapter 9',
      standardsUsed: ['NEC 314.28', 'NEC 300.17', 'NEMA RN-1'],
      temperature: ambientTemperature,
      environment,
      safetyFactors: {
        futureFillReserve: futureFillReserve / 100,
        temperatureFactor: installationFactors.temperatureFactor,
        environmentFactor: installationFactors.environmentFactor
      },
      timestamp: new Date()
    }
  };
}

/**
 * Calculate wire breakdown for NEC (AWG) system
 */
function calculateNECWireBreakdown(wires: ConduitFillCalculationInput['wires']): ConduitFillCalculationResult['wireBreakdown'] {
  const breakdown: ConduitFillCalculationResult['wireBreakdown'] = [];
  let totalArea = 0;

  for (const wire of wires) {
    const wireSpec = NEC_WIRE_GAUGES.find(w => w.awg === wire.gauge);
    if (wireSpec) {
      const wireArea = wireSpec.area * wire.quantity;
      totalArea += wireArea;
      
      breakdown.push({
        gauge: wire.gauge,
        quantity: wire.quantity,
        insulation: wire.insulation,
        individualArea: wireSpec.area,
        totalArea: wireArea,
        percentage: 0 // Will be calculated after total is known
      });
    }
  }

  // Calculate percentages
  breakdown.forEach(wire => {
    wire.percentage = (wire.totalArea / totalArea) * 100;
  });

  return breakdown;
}

/**
 * Calculate NEC fill data for a specific conduit
 */
function calculateNECFillData(
  conduit: typeof NEC_CONDUIT_FILLS[0],
  wireArea: number,
  wireCount: number
): {
  fillPercentage: number;
  maxAllowedFillPercentage: number;
  fillRule: string;
  isCompliant: boolean;
} {
  // NEC Chapter 9 fill percentages
  let maxAllowedFillPercentage: number;
  let fillRule: string;

  if (wireCount === 1) {
    maxAllowedFillPercentage = 53;
    fillRule = '53% (1 wire)';
  } else if (wireCount === 2) {
    maxAllowedFillPercentage = 31;
    fillRule = '31% (2 wires)';
  } else {
    maxAllowedFillPercentage = 40;
    fillRule = '40% (3+ wires)';
  }

  const fillPercentage = (wireArea / conduit.fillArea) * 100;
  const maxAllowableArea = (conduit.fillArea * maxAllowedFillPercentage) / 100;
  const isCompliant = wireArea <= maxAllowableArea;

  return {
    fillPercentage,
    maxAllowedFillPercentage,
    fillRule,
    isCompliant
  };
}

/**
 * Calculate specific conduit fill
 */
function calculateSpecificNECConduitFill(
  conduit: typeof NEC_CONDUIT_FILLS[0],
  wireArea: number,
  wireCount: number,
  wireBreakdown: ConduitFillCalculationResult['wireBreakdown'],
  input: ConduitFillCalculationInput
): ConduitFillCalculationResult {
  const necFillData = calculateNECFillData(conduit, wireArea, wireCount);
  const applicationRequirements = getApplicationRequirements(input.applicationType, 'NEC');
  const installationFactors = getInstallationMethodFactors(input.installationMethod, 'NEC');

  return {
    recommendedConduitSize: conduit.conduitSize,
    conduitType: input.conduitType,
    wireStandard: 'NEC',
    
    fillAnalysis: {
      totalWireArea: wireArea,
      conduitInternalArea: conduit.fillArea,
      fillPercentage: necFillData.fillPercentage,
      maxAllowedFillPercentage: necFillData.maxAllowedFillPercentage,
      availableArea: conduit.fillArea - wireArea,
      fillRule: necFillData.fillRule as '53% (1 wire)' | '31% (2 wires)' | '40% (3+ wires)'
    },
    
    compliance: {
      codeCompliant: necFillData.isCompliant,
      fillCompliant: necFillData.isCompliant,
      temperatureCompliant: true,
      applicationCompliant: true,
      installationCompliant: true
    },
    
    wireBreakdown,
    alternatives: [], // Single conduit calculation
    
    applicationData: {
      applicationType: input.applicationType,
      installationMethod: input.installationMethod,
      specialRequirements: applicationRequirements.specialRequirements,
      recommendedPractices: applicationRequirements.recommendedPractices
    },
    
    calculationMetadata: {
      calculationMethod: 'NEC Chapter 9',
      standardsUsed: ['NEC 314.28', 'NEC 300.17'],
      temperature: input.ambientTemperature || 30,
      environment: input.environment || 'dry',
      safetyFactors: {
        temperatureFactor: installationFactors.temperatureFactor,
        environmentFactor: installationFactors.environmentFactor
      },
      timestamp: new Date()
    }
  };
}


/**
 * Calculate relative cost factor for conduit sizing
 */
function calculateCostFactor(conduitSize: string, conduitType: string): number {
  // Base cost factors relative to 1/2" EMT
  const sizeCostFactors: Record<string, number> = {
    '1/2': 1.0,
    '3/4': 1.3,
    '1': 1.8,
    '1-1/4': 2.5,
    '1-1/2': 3.2,
    '2': 4.5,
    '2-1/2': 6.8,
    '3': 9.5,
    '3-1/2': 12.0,
    '4': 15.0
  };

  const typeCostFactors: Record<string, number> = {
    'EMT': 1.0,
    'PVC': 0.6,
    'Steel': 1.4,
    'IMC': 1.2,
    'RMC': 1.8
  };

  const sizeFactor = sizeCostFactors[conduitSize] || 1.0;
  const typeFactor = typeCostFactors[conduitType] || 1.0;

  return sizeFactor * typeFactor;
}

/**
 * Get NEC conduit specifications
 */
export function getNECConduitSpecifications(conduitType?: string): typeof NEC_CONDUIT_FILLS {
  if (conduitType) {
    return NEC_CONDUIT_FILLS.filter(c => c.conduitType === conduitType);
  }
  return NEC_CONDUIT_FILLS;
}

/**
 * Get NEC wire specifications
 */
export function getNECWireSpecifications(): typeof NEC_WIRE_GAUGES {
  return NEC_WIRE_GAUGES;
}

/**
 * Find minimum conduit size for given wire area
 */
export function findMinimumNECConduitSize(
  totalWireArea: number,
  wireCount: number,
  conduitType: string
): string | null {
  const availableConduits = NEC_CONDUIT_FILLS
    .filter(c => c.conduitType === conduitType)
    .sort((a, b) => a.fillArea - b.fillArea);

  for (const conduit of availableConduits) {
    const necFillData = calculateNECFillData(conduit, totalWireArea, wireCount);
    if (necFillData.isCompliant) {
      return conduit.conduitSize;
    }
  }

  return null; // No compliant size found
}