/**
 * NEC Wire Calculations Engine
 * Pure NEC/Imperial calculation engine
 * Separated from mixed calculations to prevent standard mixing
 * Follows NEC Articles 210, 215, 220, 310, 240
 */

import type { WireCalculationInput, WireCalculationResult } from './wireCalculatorRouter';
import { getVoltageDropLimits } from './wireCalculatorRouter';

// NEC-specific wire data interface
interface NECWireSpecification {
  awg: string;                    // AWG size (14, 12, 10, 8, 6, 4, 3, 2, 1, 1/0, 2/0, 3/0, 4/0, 250, 300, 350, 400, 500, 600, 750, 1000)
  area: number;                   // Wire area in square inches
  resistance: number;             // Resistance in ohms per 1000 feet at 75°C
  ampacity60C: number;            // Ampacity at 60°C (NEC Table 310.15(B)(16))
  ampacity75C: number;            // Ampacity at 75°C (NEC Table 310.15(B)(16))
  ampacity90C: number;            // Ampacity at 90°C (NEC Table 310.15(B)(16))
  diameter: number;               // Overall diameter in inches
  weight: number;                 // Weight in pounds per 1000 feet
  insulationThickness: number;    // Typical insulation thickness in inches
}

// NEC Installation Method factors (NEC Table 310.15(B)(3)(a))
interface NECInstallationMethodFactor {
  factor: number;
  description: string;
  applicableConditions: string[];
}

// NEC Temperature correction factors (NEC Table 310.15(B)(2)(a))
interface NECTemperatureCorrection {
  [tempRating: number]: {
    [ambientTemp: number]: number;
  };
}

// NEC Conductor adjustment factors (NEC Table 310.15(B)(3)(a))
interface NECConductorAdjustment {
  [conductorCount: number]: number;
}

// NEC Wire table data
const NEC_WIRE_SPECIFICATIONS: NECWireSpecification[] = [
  // AWG 14 through 4/0
  { awg: '14', area: 0.0097, resistance: 3.070, ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, diameter: 0.064, weight: 12.4, insulationThickness: 0.015 },
  { awg: '12', area: 0.0133, resistance: 1.930, ampacity60C: 20, ampacity75C: 25, ampacity90C: 30, diameter: 0.081, weight: 19.8, insulationThickness: 0.015 },
  { awg: '10', area: 0.0211, resistance: 1.210, ampacity60C: 30, ampacity75C: 35, ampacity90C: 40, diameter: 0.102, weight: 31.4, insulationThickness: 0.020 },
  { awg: '8', area: 0.0366, resistance: 0.764, ampacity60C: 40, ampacity75C: 50, ampacity90C: 55, diameter: 0.128, weight: 49.8, insulationThickness: 0.020 },
  { awg: '6', area: 0.0507, resistance: 0.491, ampacity60C: 55, ampacity75C: 65, ampacity90C: 75, diameter: 0.162, weight: 79.5, insulationThickness: 0.030 },
  { awg: '4', area: 0.0824, resistance: 0.308, ampacity60C: 70, ampacity75C: 85, ampacity90C: 95, diameter: 0.204, weight: 126.4, insulationThickness: 0.030 },
  { awg: '3', area: 0.1040, resistance: 0.245, ampacity60C: 85, ampacity75C: 100, ampacity90C: 115, diameter: 0.229, weight: 159.3, insulationThickness: 0.030 },
  { awg: '2', area: 0.1318, resistance: 0.194, ampacity60C: 95, ampacity75C: 115, ampacity90C: 130, diameter: 0.258, weight: 201.9, insulationThickness: 0.030 },
  { awg: '1', area: 0.1662, resistance: 0.154, ampacity60C: 110, ampacity75C: 130, ampacity90C: 150, diameter: 0.289, weight: 254.5, insulationThickness: 0.030 },
  { awg: '1/0', area: 0.2109, resistance: 0.122, ampacity60C: 125, ampacity75C: 150, ampacity90C: 170, diameter: 0.325, weight: 322.6, insulationThickness: 0.030 },
  { awg: '2/0', area: 0.2642, resistance: 0.097, ampacity60C: 145, ampacity75C: 175, ampacity90C: 195, diameter: 0.365, weight: 404.7, insulationThickness: 0.030 },
  { awg: '3/0', area: 0.3355, resistance: 0.077, ampacity60C: 165, ampacity75C: 200, ampacity90C: 225, diameter: 0.410, weight: 512.1, insulationThickness: 0.030 },
  { awg: '4/0', area: 0.4202, resistance: 0.061, ampacity60C: 195, ampacity75C: 230, ampacity90C: 260, diameter: 0.460, weight: 640.5, insulationThickness: 0.030 },
  
  // KCMIL sizes
  { awg: '250', area: 0.4963, resistance: 0.052, ampacity60C: 215, ampacity75C: 255, ampacity90C: 290, diameter: 0.505, weight: 772.0, insulationThickness: 0.035 },
  { awg: '300', area: 0.5958, resistance: 0.043, ampacity60C: 240, ampacity75C: 285, ampacity90C: 320, diameter: 0.555, weight: 920.0, insulationThickness: 0.035 },
  { awg: '350', area: 0.6837, resistance: 0.037, ampacity60C: 260, ampacity75C: 310, ampacity90C: 350, diameter: 0.595, weight: 1064.0, insulationThickness: 0.035 },
  { awg: '400', area: 0.7901, resistance: 0.032, ampacity60C: 280, ampacity75C: 335, ampacity90C: 380, diameter: 0.630, weight: 1213.0, insulationThickness: 0.035 },
  { awg: '500', area: 0.9887, resistance: 0.026, ampacity60C: 320, ampacity75C: 380, ampacity90C: 430, diameter: 0.711, weight: 1526.0, insulationThickness: 0.035 },
  { awg: '600', area: 1.1705, resistance: 0.022, ampacity60C: 355, ampacity75C: 420, ampacity90C: 475, diameter: 0.777, weight: 1829.0, insulationThickness: 0.035 },
  { awg: '750', area: 1.4784, resistance: 0.017, ampacity60C: 400, ampacity75C: 475, ampacity90C: 535, diameter: 0.870, weight: 2267.0, insulationThickness: 0.035 },
  { awg: '1000', area: 1.9635, resistance: 0.013, ampacity60C: 455, ampacity75C: 545, ampacity90C: 615, diameter: 1.000, weight: 3718.0, insulationThickness: 0.035 }
];

// NEC Temperature correction factors (NEC Table 310.15(B)(2)(a))
const NEC_TEMPERATURE_CORRECTION: NECTemperatureCorrection = {
  60: {
    21: 1.08, 25: 1.05, 30: 1.00, 35: 0.94, 40: 0.88, 45: 0.82, 50: 0.75, 55: 0.67, 60: 0.58, 65: 0.47, 70: 0.33
  },
  75: {
    21: 1.05, 25: 1.02, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41
  },
  90: {
    21: 1.04, 25: 1.02, 30: 1.00, 35: 0.97, 40: 0.95, 45: 0.92, 50: 0.89, 55: 0.86, 60: 0.83, 65: 0.80, 70: 0.76, 75: 0.73, 80: 0.69, 85: 0.65, 90: 0.61
  }
};

// NEC Conductor adjustment factors (NEC Table 310.15(B)(3)(a))
const NEC_CONDUCTOR_ADJUSTMENT: NECConductorAdjustment = {
  1: 1.00, 2: 1.00, 3: 1.00,
  4: 0.80, 5: 0.80, 6: 0.80,
  7: 0.70, 8: 0.70, 9: 0.70,
  10: 0.70, 11: 0.70, 12: 0.70,
  13: 0.70, 14: 0.70, 15: 0.70,
  16: 0.70, 17: 0.70, 18: 0.70,
  19: 0.70, 20: 0.70, 21: 0.70,
  22: 0.60, 23: 0.60, 24: 0.60,
  25: 0.60, 26: 0.60, 27: 0.60,
  28: 0.60, 29: 0.60, 30: 0.60,
  31: 0.50, 32: 0.50, 33: 0.50,
  34: 0.50, 35: 0.50, 36: 0.50,
  37: 0.50, 38: 0.50, 39: 0.50,
  40: 0.50, 41: 0.45
};

// NEC Installation method factors
const NEC_INSTALLATION_METHODS: Record<string, NECInstallationMethodFactor> = {
  'conduit': {
    factor: 1.0,
    description: 'Conduit or tubing',
    applicableConditions: ['Raceway fill rules apply', 'Standard temperature conditions']
  },
  'cable_tray': {
    factor: 1.0,
    description: 'Cable tray installation',
    applicableConditions: ['Adequate spacing', 'Proper ventilation']
  },
  'direct_burial': {
    factor: 0.8,
    description: 'Direct burial',
    applicableConditions: ['Thermal resistivity considerations', 'Moisture protection']
  },
  'free_air': {
    factor: 1.2,
    description: 'Free air installation',
    applicableConditions: ['Adequate clearances', 'Unobstructed air circulation']
  }
};

// Aluminum resistance multiplier (NEC standard)
const ALUMINUM_RESISTANCE_MULTIPLIER = 1.63;

/**
 * Calculate NEC wire size based on current capacity and voltage drop
 */
export function calculateNECWireSize(input: WireCalculationInput): WireCalculationResult {
  const {
    loadCurrent,
    circuitLength,
    voltage,
    voltageSystem,
    installationMethod,
    conductorMaterial,
    ambientTemperature = 30,
    numberOfConductors = 3,
    powerFactor = 1.0,
    temperatureRating = 75,
    includeNECMultiplier = true
    // strictCompliance is available in input but not used in current implementation
  } = input;

  const warnings: string[] = [];
  const assumptions: string[] = [];

  // Apply NEC 1.25x multiplier for continuous loads (NEC 210.19(A)(1))
  const designCurrent = includeNECMultiplier ? loadCurrent * 1.25 : loadCurrent;
  if (includeNECMultiplier) {
    assumptions.push('Applied NEC 1.25x multiplier for continuous loads');
  }

  // Calculate correction factors
  const correctionFactors = calculateNECCorrectionFactors({
    ambientTemperature,
    numberOfConductors,
    installationMethod,
    temperatureRating
  });

  // Calculate required conductor ampacity
  const requiredAmpacity = designCurrent / (
    correctionFactors.temperature * 
    correctionFactors.grouping * 
    correctionFactors.installation
  );

  // Find suitable conductors based on ampacity
  const suitableWires = NEC_WIRE_SPECIFICATIONS.filter(wire => {
    const ampacity = getAmpacityForTemperature(wire, temperatureRating);
    return ampacity >= requiredAmpacity;
  });

  if (suitableWires.length === 0) {
    throw new Error('No suitable NEC wire size found for the given ampacity requirements');
  }

  // Get voltage drop limits
  const voltageDropLimits = getVoltageDropLimits('NEC');
  let selectedWire = suitableWires[0];
  let voltageDropResult = calculateNECVoltageDropForWire(selectedWire, {
    current: loadCurrent,
    length: circuitLength,
    voltage,
    voltageSystem,
    conductorMaterial,
    powerFactor
  });

  // Check voltage drop compliance and select appropriate wire
  for (const wire of suitableWires) {
    const vdResult = calculateNECVoltageDropForWire(wire, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor
    });

    if (vdResult.voltageDropPercent <= voltageDropLimits.normal) {
      selectedWire = wire;
      voltageDropResult = vdResult;
      break;
    }
  }

  // Calculate power loss
  const powerLoss = calculatePowerLoss(
    loadCurrent,
    selectedWire.resistance,
    circuitLength,
    voltageSystem,
    conductorMaterial
  );

  // Calculate efficiency
  const efficiency = ((voltage - voltageDropResult.voltageDropVolts) / voltage) * 100;

  // Generate alternatives
  const alternatives = suitableWires.slice(0, 5).map(wire => {
    const vdResult = calculateNECVoltageDropForWire(wire, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor
    });
    
    return {
      wireSize: wire.awg,
      currentCapacity: getAmpacityForTemperature(wire, temperatureRating),
      voltageDropPercent: vdResult.voltageDropPercent,
      isCompliant: vdResult.voltageDropPercent <= voltageDropLimits.normal,
      costFactor: getNECWireCostFactor(wire.awg)
    };
  });

  // Compliance checks
  const finalAmpacity = getAmpacityForTemperature(selectedWire, temperatureRating);
  const currentCompliant = finalAmpacity >= requiredAmpacity;
  const voltageDropCompliant = voltageDropResult.voltageDropPercent <= voltageDropLimits.normal;
  const temperatureCompliant = ambientTemperature >= -40 && ambientTemperature <= 90;
  const installationCompliant = NEC_INSTALLATION_METHODS[installationMethod] !== undefined;

  return {
    recommendedWireSize: selectedWire.awg,
    currentCapacity: finalAmpacity,
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
      standardUsed: 'NEC',
      calculationMethod: 'NEC Articles 210, 310, 240',
      voltageDropLimit: voltageDropLimits.normal,
      safetyFactors: {
        continuousLoadMultiplier: includeNECMultiplier ? 1.25 : 1.0,
        temperatureCorrection: correctionFactors.temperature,
        conductorAdjustment: correctionFactors.grouping,
        installationFactor: correctionFactors.installation
      },
      assumptionsMade: assumptions,
      warningsGenerated: warnings
    },
    alternatives
  };
}

/**
 * Calculate NEC correction factors
 */
function calculateNECCorrectionFactors({
  ambientTemperature,
  numberOfConductors,
  installationMethod,
  temperatureRating
}: {
  ambientTemperature: number;
  numberOfConductors: number;
  installationMethod: string;
  temperatureRating: number;
}): {
  temperature: number;
  grouping: number;
  installation: number;
  thermal: number;
} {
  // Temperature correction factor
  const tempCorrection = NEC_TEMPERATURE_CORRECTION[temperatureRating];
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

  // Conductor adjustment factor (bundling/grouping)
  const conductorKeys = Object.keys(NEC_CONDUCTOR_ADJUSTMENT).map(Number).sort((a, b) => a - b);
  let groupingFactor = 1.0;
  
  for (const count of conductorKeys) {
    if (numberOfConductors <= count) {
      groupingFactor = NEC_CONDUCTOR_ADJUSTMENT[count];
      break;
    }
  }
  
  // If more conductors than in table, use the lowest factor
  if (numberOfConductors > conductorKeys[conductorKeys.length - 1]) {
    groupingFactor = NEC_CONDUCTOR_ADJUSTMENT[conductorKeys[conductorKeys.length - 1]];
  }

  // Installation method factor
  const installationFactor = NEC_INSTALLATION_METHODS[installationMethod]?.factor || 1.0;

  return {
    temperature: temperatureFactor,
    grouping: groupingFactor,
    installation: installationFactor,
    thermal: 1.0 // NEC doesn't typically use thermal resistivity factor like IEC
  };
}

/**
 * Calculate NEC voltage drop for a specific wire
 */
function calculateNECVoltageDropForWire(
  wire: NECWireSpecification,
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
    ? wire.resistance * ALUMINUM_RESISTANCE_MULTIPLIER 
    : wire.resistance;
  
  // Calculate voltage drop based on voltage system
  let voltageDropVolts: number;
  
  if (voltageSystem === 'single') {
    // Single phase: VD = 2 × I × L × R × cos(φ) / 1000
    voltageDropVolts = (2 * current * length * resistance * powerFactor) / 1000;
  } else {
    // Three phase: VD = √3 × I × L × R × cos(φ) / 1000
    voltageDropVolts = (Math.sqrt(3) * current * length * resistance * powerFactor) / 1000;
  }
  
  const voltageDropPercent = (voltageDropVolts / voltage) * 100;
  
  return {
    voltageDropPercent,
    voltageDropVolts
  };
}

/**
 * Get ampacity for specific temperature rating
 */
function getAmpacityForTemperature(wire: NECWireSpecification, temperatureRating: number): number {
  switch (temperatureRating) {
    case 60:
      return wire.ampacity60C;
    case 75:
      return wire.ampacity75C;
    case 90:
      return wire.ampacity90C;
    default:
      return wire.ampacity75C; // Default to 75°C if invalid rating
  }
}

/**
 * Calculate power loss in NEC circuits
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
 * Get relative cost factor for NEC wire sizes
 */
function getNECWireCostFactor(awg: string): number {
  const costFactors: Record<string, number> = {
    '14': 1.0, '12': 1.2, '10': 1.8, '8': 2.5, '6': 3.2, '4': 4.1,
    '3': 4.8, '2': 5.6, '1': 6.5, '1/0': 7.5, '2/0': 8.8, '3/0': 10.2,
    '4/0': 11.8, '250': 13.5, '300': 15.2, '350': 16.8, '400': 18.5,
    '500': 22.0, '600': 25.5, '750': 30.0, '1000': 36.0
  };
  return costFactors[awg] || 1.0;
}

/**
 * Get NEC wire specifications
 */
export function getNECWireSpecifications(): NECWireSpecification[] {
  return [...NEC_WIRE_SPECIFICATIONS];
}

/**
 * Get NEC wire data by AWG size
 */
export function getNECWireData(awg: string): NECWireSpecification | undefined {
  return NEC_WIRE_SPECIFICATIONS.find(wire => wire.awg === awg);
}

/**
 * Get available NEC wire sizes
 */
export function getNECWireSizes(): string[] {
  return NEC_WIRE_SPECIFICATIONS.map(wire => wire.awg);
}

/**
 * Get NEC temperature correction factors
 */
export function getNECTemperatureCorrectionFactors(): NECTemperatureCorrection {
  return { ...NEC_TEMPERATURE_CORRECTION };
}

/**
 * Get NEC conductor adjustment factors
 */
export function getNECConductorAdjustmentFactors(): NECConductorAdjustment {
  return { ...NEC_CONDUCTOR_ADJUSTMENT };
}