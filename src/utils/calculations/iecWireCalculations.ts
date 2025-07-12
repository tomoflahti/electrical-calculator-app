/**
 * IEC Wire Calculations Engine
 * Pure IEC/Metric calculation engine
 * Separated from mixed calculations to prevent standard mixing
 * Follows IEC 60364-5-52 and IEC 60287 standards
 */

import type { WireCalculationInput, WireCalculationResult } from './wireCalculatorRouter';
import { getVoltageDropLimits } from './wireCalculatorRouter';

// IEC-specific cable data interface
interface IECCableSpecification {
  size: string;                   // Cross-sectional area in mm² (0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000)
  crossSectionMm2: number;        // Nominal cross-sectional area
  resistance: number;             // Resistance in ohms per km at 20°C
  reactance: number;              // Reactance in ohms per km
  currentCapacity60C: number;     // Current capacity at 60°C ambient
  currentCapacity70C: number;     // Current capacity at 70°C ambient
  currentCapacity90C: number;     // Current capacity at 90°C ambient
  diameter: number;               // Overall diameter in mm
  weight: number;                 // Weight in kg per km
  insulationThickness: number;    // Typical insulation thickness in mm
}

// IEC Installation Method factors (IEC 60364-5-52)
interface IECInstallationMethodFactor {
  factor: number;
  description: string;
  applicableConditions: string[];
  referenceMethod: string;
}

// IEC Temperature correction factors (IEC 60364-5-52)
interface IECTemperatureCorrection {
  [tempRating: number]: {
    [ambientTemp: number]: number;
  };
}

// IEC Grouping factors (IEC 60364-5-52)
interface IECGroupingFactor {
  [cableCount: number]: number;
}

// IEC Cable table data (common PVC insulated cables)
const IEC_CABLE_SPECIFICATIONS: IECCableSpecification[] = [
  // Small cross-sections
  { size: '0.75', crossSectionMm2: 0.75, resistance: 24.5, reactance: 0.08, currentCapacity60C: 11, currentCapacity70C: 13, currentCapacity90C: 16, diameter: 5.2, weight: 38, insulationThickness: 0.6 },
  { size: '1.0', crossSectionMm2: 1.0, resistance: 18.1, reactance: 0.08, currentCapacity60C: 13, currentCapacity70C: 16, currentCapacity90C: 19, diameter: 5.6, weight: 45, insulationThickness: 0.6 },
  { size: '1.5', crossSectionMm2: 1.5, resistance: 12.1, reactance: 0.08, currentCapacity60C: 17.5, currentCapacity70C: 21, currentCapacity90C: 24, diameter: 6.1, weight: 58, insulationThickness: 0.7 },
  { size: '2.5', crossSectionMm2: 2.5, resistance: 7.41, reactance: 0.08, currentCapacity60C: 24, currentCapacity70C: 28, currentCapacity90C: 32, diameter: 6.8, weight: 78, insulationThickness: 0.8 },
  { size: '4', crossSectionMm2: 4.0, resistance: 4.61, reactance: 0.075, currentCapacity60C: 32, currentCapacity70C: 37, currentCapacity90C: 43, diameter: 7.5, weight: 102, insulationThickness: 0.8 },
  { size: '6', crossSectionMm2: 6.0, resistance: 3.08, reactance: 0.075, currentCapacity60C: 41, currentCapacity70C: 47, currentCapacity90C: 54, diameter: 8.2, weight: 130, insulationThickness: 0.8 },
  { size: '10', crossSectionMm2: 10.0, resistance: 1.83, reactance: 0.075, currentCapacity60C: 57, currentCapacity70C: 66, currentCapacity90C: 75, diameter: 9.5, weight: 180, insulationThickness: 1.0 },
  { size: '16', crossSectionMm2: 16.0, resistance: 1.15, reactance: 0.070, currentCapacity60C: 76, currentCapacity70C: 87, currentCapacity90C: 100, diameter: 10.5, weight: 240, insulationThickness: 1.0 },
  { size: '25', crossSectionMm2: 25.0, resistance: 0.727, reactance: 0.070, currentCapacity60C: 101, currentCapacity70C: 115, currentCapacity90C: 132, diameter: 12.2, weight: 330, insulationThickness: 1.2 },
  { size: '35', crossSectionMm2: 35.0, resistance: 0.524, reactance: 0.065, currentCapacity60C: 125, currentCapacity70C: 144, currentCapacity90C: 165, diameter: 13.4, weight: 430, insulationThickness: 1.2 },
  { size: '50', crossSectionMm2: 50.0, resistance: 0.387, reactance: 0.065, currentCapacity60C: 151, currentCapacity70C: 173, currentCapacity90C: 196, diameter: 15.0, weight: 580, insulationThickness: 1.4 },
  { size: '70', crossSectionMm2: 70.0, resistance: 0.268, reactance: 0.065, currentCapacity60C: 192, currentCapacity70C: 218, currentCapacity90C: 246, diameter: 17.0, weight: 770, insulationThickness: 1.4 },
  { size: '95', crossSectionMm2: 95.0, resistance: 0.193, reactance: 0.060, currentCapacity60C: 232, currentCapacity70C: 263, currentCapacity90C: 297, diameter: 19.2, weight: 1000, insulationThickness: 1.6 },
  { size: '120', crossSectionMm2: 120.0, resistance: 0.153, reactance: 0.060, currentCapacity60C: 269, currentCapacity70C: 305, currentCapacity90C: 344, diameter: 21.0, weight: 1200, insulationThickness: 1.6 },
  { size: '150', crossSectionMm2: 150.0, resistance: 0.124, reactance: 0.055, currentCapacity60C: 309, currentCapacity70C: 350, currentCapacity90C: 394, diameter: 22.8, weight: 1450, insulationThickness: 1.8 },
  { size: '185', crossSectionMm2: 185.0, resistance: 0.099, reactance: 0.055, currentCapacity60C: 353, currentCapacity70C: 400, currentCapacity90C: 450, diameter: 24.8, weight: 1750, insulationThickness: 1.8 },
  { size: '240', crossSectionMm2: 240.0, resistance: 0.077, reactance: 0.050, currentCapacity60C: 415, currentCapacity70C: 469, currentCapacity90C: 527, diameter: 27.3, weight: 2200, insulationThickness: 2.0 },
  { size: '300', crossSectionMm2: 300.0, resistance: 0.061, reactance: 0.050, currentCapacity60C: 477, currentCapacity70C: 539, currentCapacity90C: 606, diameter: 29.8, weight: 2700, insulationThickness: 2.0 },
  { size: '400', crossSectionMm2: 400.0, resistance: 0.047, reactance: 0.045, currentCapacity60C: 546, currentCapacity70C: 618, currentCapacity90C: 695, diameter: 33.0, weight: 3400, insulationThickness: 2.2 },
  { size: '500', crossSectionMm2: 500.0, resistance: 0.037, reactance: 0.045, currentCapacity60C: 609, currentCapacity70C: 689, currentCapacity90C: 775, diameter: 35.8, weight: 4100, insulationThickness: 2.2 },
  { size: '630', crossSectionMm2: 630.0, resistance: 0.030, reactance: 0.040, currentCapacity60C: 686, currentCapacity70C: 776, currentCapacity90C: 873, diameter: 39.5, weight: 5000, insulationThickness: 2.4 },
  { size: '800', crossSectionMm2: 800.0, resistance: 0.023, reactance: 0.040, currentCapacity60C: 758, currentCapacity70C: 857, currentCapacity90C: 964, diameter: 42.8, weight: 6200, insulationThickness: 2.4 },
  { size: '1000', crossSectionMm2: 1000.0, resistance: 0.018, reactance: 0.035, currentCapacity60C: 814, currentCapacity70C: 920, currentCapacity90C: 1035, diameter: 45.8, weight: 7500, insulationThickness: 2.6 }
];

// IEC Temperature correction factors (IEC 60364-5-52)
const IEC_TEMPERATURE_CORRECTION: IECTemperatureCorrection = {
  60: {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
  },
  70: {
    10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58
  },
  90: {
    10: 1.10, 15: 1.08, 20: 1.05, 25: 1.03, 30: 1.00, 35: 0.98, 40: 0.95, 45: 0.93, 50: 0.90, 55: 0.87, 60: 0.84, 65: 0.81, 70: 0.77, 75: 0.74, 80: 0.70, 85: 0.67, 90: 0.63
  }
};

// IEC Grouping factors (IEC 60364-5-52)
const IEC_GROUPING_FACTORS: IECGroupingFactor = {
  1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50,
  10: 0.48, 11: 0.46, 12: 0.45, 13: 0.44, 14: 0.43, 15: 0.42, 16: 0.41, 17: 0.40, 18: 0.39, 19: 0.38, 20: 0.38
};

// IEC Installation method factors (IEC 60364-5-52)
const IEC_INSTALLATION_METHODS: Record<string, IECInstallationMethodFactor> = {
  'A1': {
    factor: 1.0,
    description: 'Insulated conductors in conduit in thermally insulating wall',
    applicableConditions: ['Thermal insulation', 'Enclosed installation'],
    referenceMethod: 'A1'
  },
  'A2': {
    factor: 1.0,
    description: 'Multicore cable in conduit in thermally insulating wall',
    applicableConditions: ['Thermal insulation', 'Multicore cable'],
    referenceMethod: 'A2'
  },
  'B1': {
    factor: 1.0,
    description: 'Insulated conductors in conduit on wall or in trunking',
    applicableConditions: ['Surface mounting', 'Good heat dissipation'],
    referenceMethod: 'B1'
  },
  'B2': {
    factor: 1.0,
    description: 'Multicore cable in conduit on wall or in trunking',
    applicableConditions: ['Surface mounting', 'Multicore cable'],
    referenceMethod: 'B2'
  },
  'C': {
    factor: 1.0,
    description: 'Multicore cable on wall or ceiling',
    applicableConditions: ['Clipped to surface', 'Free air circulation'],
    referenceMethod: 'C'
  },
  'D1': {
    factor: 1.0,
    description: 'Multicore cable in underground duct',
    applicableConditions: ['Underground installation', 'Duct system'],
    referenceMethod: 'D1'
  },
  'D2': {
    factor: 1.0,
    description: 'Multicore cable buried direct in ground',
    applicableConditions: ['Direct burial', 'Soil thermal resistivity'],
    referenceMethod: 'D2'
  },
  'E': {
    factor: 1.2,
    description: 'Multicore cable in free air',
    applicableConditions: ['Free air circulation', 'Optimal heat dissipation'],
    referenceMethod: 'E'
  },
  'F': {
    factor: 1.1,
    description: 'Single core cables in free air',
    applicableConditions: ['Separated cables', 'Free air circulation'],
    referenceMethod: 'F'
  },
  'G': {
    factor: 1.0,
    description: 'Single core cables in underground duct',
    applicableConditions: ['Underground installation', 'Single core cables'],
    referenceMethod: 'G'
  }
};

// Aluminum resistance multiplier (IEC standard)
const ALUMINUM_RESISTANCE_MULTIPLIER = 1.64;

/**
 * Calculate IEC wire size based on current capacity and voltage drop
 */
export function calculateIECWireSize(input: WireCalculationInput): WireCalculationResult {
  const {
    loadCurrent,
    circuitLength,
    voltage,
    voltageSystem,
    installationMethod,
    conductorMaterial,
    ambientTemperature = 30,
    numberOfConductors = 3,
    powerFactor = 0.8,
    groupingFactor,
    thermalResistivity = 2.5
    // strictCompliance is available in input but not used in current implementation
  } = input;

  const warnings: string[] = [];
  const assumptions: string[] = [];

  // IEC doesn't apply continuous load multiplier like NEC
  const designCurrent = loadCurrent;
  assumptions.push('No continuous load multiplier applied (IEC standard)');

  // Calculate correction factors
  const correctionFactors = calculateIECCorrectionFactors({
    ambientTemperature,
    numberOfConductors,
    installationMethod,
    groupingFactor,
    thermalResistivity
  });

  // Calculate required cable current capacity
  const requiredCurrentCapacity = designCurrent / (
    correctionFactors.temperature * 
    correctionFactors.grouping * 
    correctionFactors.installation * 
    correctionFactors.thermal
  );

  // Find suitable cables based on current capacity
  const suitableCables = IEC_CABLE_SPECIFICATIONS.filter(cable => {
    const capacity = cable.currentCapacity90C; // IEC typically uses 90°C rating
    return capacity >= requiredCurrentCapacity;
  });

  if (suitableCables.length === 0) {
    throw new Error('No suitable IEC cable size found for the given current requirements');
  }

  // Get voltage drop limits
  const voltageDropLimits = getVoltageDropLimits('IEC');
  let selectedCable = suitableCables[0];
  let voltageDropResult = calculateIECVoltageDropForCable(selectedCable, {
    current: loadCurrent,
    length: circuitLength,
    voltage,
    voltageSystem,
    conductorMaterial,
    powerFactor
  });

  // Check voltage drop compliance and select appropriate cable
  for (const cable of suitableCables) {
    const vdResult = calculateIECVoltageDropForCable(cable, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor
    });

    if (vdResult.voltageDropPercent <= voltageDropLimits.normal) {
      selectedCable = cable;
      voltageDropResult = vdResult;
      break;
    }
  }

  // Calculate power loss
  const powerLoss = calculatePowerLoss(
    loadCurrent,
    selectedCable.resistance,
    circuitLength,
    voltageSystem,
    conductorMaterial
  );

  // Calculate efficiency
  const efficiency = ((voltage - voltageDropResult.voltageDropVolts) / voltage) * 100;

  // Generate alternatives
  const alternatives = suitableCables.slice(0, 5).map(cable => {
    const vdResult = calculateIECVoltageDropForCable(cable, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor
    });
    
    return {
      wireSize: cable.size,
      currentCapacity: cable.currentCapacity90C,
      voltageDropPercent: vdResult.voltageDropPercent,
      isCompliant: vdResult.voltageDropPercent <= voltageDropLimits.normal,
      costFactor: getIECCableCostFactor(cable.size)
    };
  });

  // Compliance checks
  const finalCapacity = selectedCable.currentCapacity90C;
  const currentCompliant = finalCapacity >= requiredCurrentCapacity;
  const voltageDropCompliant = voltageDropResult.voltageDropPercent <= voltageDropLimits.normal;
  const temperatureCompliant = ambientTemperature >= -40 && ambientTemperature <= 90;
  const installationCompliant = IEC_INSTALLATION_METHODS[installationMethod] !== undefined;

  return {
    recommendedWireSize: selectedCable.size,
    currentCapacity: finalCapacity,
    voltageDropPercent: voltageDropResult.voltageDropPercent,
    voltageDropVolts: voltageDropResult.voltageDropVolts,
    powerLossWatts: powerLoss,
    efficiency,
    correctionFactors,
    compliance: {
      currentCompliant,
      voltageDropCompliant,
      standardCompliant: currentCompliant && voltageDropCompliant && temperatureCompliant && installationCompliant,
      temperatureCompliant,
      installationCompliant
    },
    calculationMetadata: {
      standardUsed: 'IEC',
      calculationMethod: 'IEC 60364-5-52, IEC 60287',
      voltageDropLimit: voltageDropLimits.normal,
      safetyFactors: {
        temperatureCorrection: correctionFactors.temperature,
        groupingFactor: correctionFactors.grouping,
        installationFactor: correctionFactors.installation,
        thermalResistivityFactor: correctionFactors.thermal
      },
      assumptionsMade: assumptions,
      warningsGenerated: warnings
    },
    alternatives
  };
}

/**
 * Calculate IEC correction factors
 */
function calculateIECCorrectionFactors({
  ambientTemperature,
  numberOfConductors,
  installationMethod,
  groupingFactor,
  thermalResistivity
}: {
  ambientTemperature: number;
  numberOfConductors: number;
  installationMethod: string;
  groupingFactor?: number;
  thermalResistivity: number;
}): {
  temperature: number;
  grouping: number;
  installation: number;
  thermal: number;
} {
  // Temperature correction factor (using 90°C rating)
  const tempCorrection = IEC_TEMPERATURE_CORRECTION[90];
  const tempKeys = Object.keys(tempCorrection).map(Number).sort((a, b) => a - b);
  let temperatureFactor = 1.0;
  
  for (const temp of tempKeys) {
    if (ambientTemperature <= temp) {
      temperatureFactor = tempCorrection[temp];
      break;
    }
  }
  
  // If temperature is higher than the highest in table, use the lowest factor
  if (ambientTemperature > tempKeys[tempKeys.length - 1]) {
    temperatureFactor = tempCorrection[tempKeys[tempKeys.length - 1]];
  }

  // Grouping factor (cable bundling)
  let groupingFactorValue = groupingFactor;
  if (!groupingFactorValue) {
    const groupingKeys = Object.keys(IEC_GROUPING_FACTORS).map(Number).sort((a, b) => a - b);
    groupingFactorValue = 1.0;
    
    for (const count of groupingKeys) {
      if (numberOfConductors <= count) {
        groupingFactorValue = IEC_GROUPING_FACTORS[count];
        break;
      }
    }
    
    // If more cables than in table, use the lowest factor
    if (numberOfConductors > groupingKeys[groupingKeys.length - 1]) {
      groupingFactorValue = IEC_GROUPING_FACTORS[groupingKeys[groupingKeys.length - 1]];
    }
  }

  // Installation method factor
  const installationFactor = IEC_INSTALLATION_METHODS[installationMethod]?.factor || 1.0;

  // Thermal resistivity factor (for underground installations)
  let thermalFactor = 1.0;
  if (installationMethod === 'D2' || installationMethod === 'D1') {
    // Apply thermal resistivity correction for underground installations
    if (thermalResistivity > 2.5) {
      thermalFactor = 2.5 / thermalResistivity;
    }
  }

  return {
    temperature: temperatureFactor,
    grouping: groupingFactorValue,
    installation: installationFactor,
    thermal: thermalFactor
  };
}

/**
 * Calculate IEC voltage drop for a specific cable
 */
function calculateIECVoltageDropForCable(
  cable: IECCableSpecification,
  params: {
    current: number;
    length: number;
    voltage: number;
    voltageSystem: string;
    conductorMaterial: string;
    powerFactor: number;
  }
): { voltageDropPercent: number; voltageDropVolts: number } {
  const { current, length, voltage, voltageSystem, conductorMaterial, powerFactor } = params;
  
  // Adjust resistance for conductor material
  const resistance = conductorMaterial === 'aluminum' 
    ? cable.resistance * ALUMINUM_RESISTANCE_MULTIPLIER 
    : cable.resistance;
  
  // Calculate voltage drop based on voltage system
  let voltageDropVolts: number;
  
  if (voltageSystem === 'single') {
    // Single phase: VD = 2 × I × L × (R × cos φ + X × sin φ) / 1000
    const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
    voltageDropVolts = 2 * current * (length / 1000) * (resistance * powerFactor + cable.reactance * sinPhi);
  } else {
    // Three phase: VD = √3 × I × L × (R × cos φ + X × sin φ) / 1000
    const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
    voltageDropVolts = Math.sqrt(3) * current * (length / 1000) * (resistance * powerFactor + cable.reactance * sinPhi);
  }
  
  const voltageDropPercent = (voltageDropVolts / voltage) * 100;
  
  return {
    voltageDropPercent,
    voltageDropVolts
  };
}

/**
 * Calculate power loss in IEC circuits
 */
function calculatePowerLoss(
  current: number,
  resistance: number,
  length: number,
  voltageSystem: string,
  conductorMaterial: string
): number {
  // Adjust resistance for conductor material
  const adjustedResistance = conductorMaterial === 'aluminum' 
    ? resistance * ALUMINUM_RESISTANCE_MULTIPLIER 
    : resistance;
  
  // Power loss: P = I² × R × L / 1000
  const multiplier = voltageSystem === 'single' ? 1 : 3; // 3 for three-phase
  return multiplier * current * current * adjustedResistance * (length / 1000);
}

/**
 * Get relative cost factor for IEC cable sizes
 */
function getIECCableCostFactor(size: string): number {
  const costFactors: Record<string, number> = {
    '0.75': 1.0, '1.0': 1.1, '1.5': 1.2, '2.5': 1.4, '4': 1.7, '6': 2.0,
    '10': 2.5, '16': 3.2, '25': 4.1, '35': 5.0, '50': 6.2, '70': 7.8,
    '95': 9.5, '120': 11.5, '150': 13.8, '185': 16.2, '240': 19.5, '300': 23.0,
    '400': 27.5, '500': 32.0, '630': 38.0, '800': 45.0, '1000': 52.0
  };
  return costFactors[size] || 1.0;
}

/**
 * Get IEC cable specifications
 */
export function getIECCableSpecifications(): IECCableSpecification[] {
  return [...IEC_CABLE_SPECIFICATIONS];
}

/**
 * Get IEC cable data by size
 */
export function getIECCableData(size: string): IECCableSpecification | undefined {
  return IEC_CABLE_SPECIFICATIONS.find(cable => cable.size === size);
}

/**
 * Get available IEC cable sizes
 */
export function getIECCableSizes(): string[] {
  return IEC_CABLE_SPECIFICATIONS.map(cable => cable.size);
}

/**
 * Get IEC temperature correction factors
 */
export function getIECTemperatureCorrectionFactors(): IECTemperatureCorrection {
  return { ...IEC_TEMPERATURE_CORRECTION };
}

/**
 * Get IEC grouping factors
 */
export function getIECGroupingFactors(): IECGroupingFactor {
  return { ...IEC_GROUPING_FACTORS };
}

/**
 * Get IEC installation method factors
 */
export function getIECInstallationMethodFactors(): Record<string, IECInstallationMethodFactor> {
  return { ...IEC_INSTALLATION_METHODS };
}