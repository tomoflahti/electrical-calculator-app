/**
 * BS7671 Wire Calculations Engine
 * Pure BS7671/UK calculation engine
 * Based on BS7671:2018+A2:2022 (IET Wiring Regulations)
 * UK-specific implementation with diversity factors and UK voltage standards
 */

import {
  getVoltageDropLimits,
  type WireCalculationInput,
  type WireCalculationResult,
} from "./wireCalculatorRouter";

// BS7671-specific cable data interface (similar to IEC but with UK-specific values)
interface BS7671CableSpecification {
  size: string; // Cross-sectional area in mm²
  crossSectionMm2: number; // Nominal cross-sectional area
  resistance: number; // Resistance in ohms per km at 20°C
  reactance: number; // Reactance in ohms per km
  currentCapacity60C: number; // Current capacity at 60°C conductor temperature
  currentCapacity70C: number; // Current capacity at 70°C conductor temperature
  currentCapacity90C: number; // Current capacity at 90°C conductor temperature
  diameter: number; // Overall diameter in mm
  weight: number; // Weight in kg per km
  insulationThickness: number; // Typical insulation thickness in mm
  ukStandard: string; // UK standard reference (BS, BS EN)
}

// BS7671 Installation Method factors (BS7671 Appendix 4)
interface BS7671InstallationMethodFactor {
  factor: number;
  description: string;
  applicableConditions: string[];
  referenceMethod: string;
  ukSpecificNotes: string[];
}

// BS7671 Temperature correction factors
interface BS7671TemperatureCorrection {
  [tempRating: number]: {
    [ambientTemp: number]: number;
  };
}

// BS7671 Grouping factors
interface BS7671GroupingFactor {
  [cableCount: number]: number;
}

// BS7671 Cable table data (UK-specific PVC/XLPE cables)
const BS7671_CABLE_SPECIFICATIONS: BS7671CableSpecification[] = [
  // BS7671 Table 4D5A - 70°C thermoplastic insulated cables
  {
    size: "1.0",
    crossSectionMm2: 1.0,
    resistance: 18.1,
    reactance: 0.08,
    currentCapacity60C: 11,
    currentCapacity70C: 13,
    currentCapacity90C: 16,
    diameter: 5.6,
    weight: 45,
    insulationThickness: 0.6,
    ukStandard: "BS 6004",
  },
  {
    size: "1.5",
    crossSectionMm2: 1.5,
    resistance: 12.1,
    reactance: 0.08,
    currentCapacity60C: 14.5,
    currentCapacity70C: 17.5,
    currentCapacity90C: 20,
    diameter: 6.1,
    weight: 58,
    insulationThickness: 0.7,
    ukStandard: "BS 6004",
  },
  {
    size: "2.5",
    crossSectionMm2: 2.5,
    resistance: 7.41,
    reactance: 0.08,
    currentCapacity60C: 20,
    currentCapacity70C: 24,
    currentCapacity90C: 27,
    diameter: 6.8,
    weight: 78,
    insulationThickness: 0.8,
    ukStandard: "BS 6004",
  },
  {
    size: "4",
    crossSectionMm2: 4.0,
    resistance: 4.61,
    reactance: 0.075,
    currentCapacity60C: 26,
    currentCapacity70C: 32,
    currentCapacity90C: 36,
    diameter: 7.5,
    weight: 102,
    insulationThickness: 0.8,
    ukStandard: "BS 6004",
  },
  {
    size: "6",
    crossSectionMm2: 6.0,
    resistance: 3.08,
    reactance: 0.075,
    currentCapacity60C: 34,
    currentCapacity70C: 41,
    currentCapacity90C: 46,
    diameter: 8.2,
    weight: 130,
    insulationThickness: 0.8,
    ukStandard: "BS 6004",
  },
  {
    size: "10",
    crossSectionMm2: 10.0,
    resistance: 1.83,
    reactance: 0.075,
    currentCapacity60C: 46,
    currentCapacity70C: 57,
    currentCapacity90C: 64,
    diameter: 9.5,
    weight: 180,
    insulationThickness: 1.0,
    ukStandard: "BS 6004",
  },
  {
    size: "16",
    crossSectionMm2: 16.0,
    resistance: 1.15,
    reactance: 0.07,
    currentCapacity60C: 61,
    currentCapacity70C: 76,
    currentCapacity90C: 85,
    diameter: 10.5,
    weight: 240,
    insulationThickness: 1.0,
    ukStandard: "BS 6004",
  },
  {
    size: "25",
    crossSectionMm2: 25.0,
    resistance: 0.727,
    reactance: 0.07,
    currentCapacity60C: 80,
    currentCapacity70C: 101,
    currentCapacity90C: 112,
    diameter: 12.2,
    weight: 330,
    insulationThickness: 1.2,
    ukStandard: "BS 6004",
  },
  {
    size: "35",
    crossSectionMm2: 35.0,
    resistance: 0.524,
    reactance: 0.065,
    currentCapacity60C: 99,
    currentCapacity70C: 125,
    currentCapacity90C: 138,
    diameter: 13.4,
    weight: 430,
    insulationThickness: 1.2,
    ukStandard: "BS 6004",
  },
  {
    size: "50",
    crossSectionMm2: 50.0,
    resistance: 0.387,
    reactance: 0.065,
    currentCapacity60C: 119,
    currentCapacity70C: 151,
    currentCapacity90C: 167,
    diameter: 15.0,
    weight: 580,
    insulationThickness: 1.4,
    ukStandard: "BS 6004",
  },
  {
    size: "70",
    crossSectionMm2: 70.0,
    resistance: 0.268,
    reactance: 0.065,
    currentCapacity60C: 151,
    currentCapacity70C: 192,
    currentCapacity90C: 213,
    diameter: 17.0,
    weight: 770,
    insulationThickness: 1.4,
    ukStandard: "BS 6004",
  },
  {
    size: "95",
    crossSectionMm2: 95.0,
    resistance: 0.193,
    reactance: 0.06,
    currentCapacity60C: 182,
    currentCapacity70C: 232,
    currentCapacity90C: 258,
    diameter: 19.2,
    weight: 1000,
    insulationThickness: 1.6,
    ukStandard: "BS 6004",
  },
  {
    size: "120",
    crossSectionMm2: 120.0,
    resistance: 0.153,
    reactance: 0.06,
    currentCapacity60C: 210,
    currentCapacity70C: 269,
    currentCapacity90C: 299,
    diameter: 21.0,
    weight: 1200,
    insulationThickness: 1.6,
    ukStandard: "BS 6004",
  },
  {
    size: "150",
    crossSectionMm2: 150.0,
    resistance: 0.124,
    reactance: 0.055,
    currentCapacity60C: 240,
    currentCapacity70C: 309,
    currentCapacity90C: 344,
    diameter: 22.8,
    weight: 1450,
    insulationThickness: 1.8,
    ukStandard: "BS 6004",
  },
  {
    size: "185",
    crossSectionMm2: 185.0,
    resistance: 0.099,
    reactance: 0.055,
    currentCapacity60C: 273,
    currentCapacity70C: 353,
    currentCapacity90C: 392,
    diameter: 24.8,
    weight: 1750,
    insulationThickness: 1.8,
    ukStandard: "BS 6004",
  },
  {
    size: "240",
    crossSectionMm2: 240.0,
    resistance: 0.077,
    reactance: 0.05,
    currentCapacity60C: 320,
    currentCapacity70C: 415,
    currentCapacity90C: 461,
    diameter: 27.3,
    weight: 2200,
    insulationThickness: 2.0,
    ukStandard: "BS 6004",
  },
  {
    size: "300",
    crossSectionMm2: 300.0,
    resistance: 0.061,
    reactance: 0.05,
    currentCapacity60C: 367,
    currentCapacity70C: 477,
    currentCapacity90C: 530,
    diameter: 29.8,
    weight: 2700,
    insulationThickness: 2.0,
    ukStandard: "BS 6004",
  },
  {
    size: "400",
    crossSectionMm2: 400.0,
    resistance: 0.047,
    reactance: 0.045,
    currentCapacity60C: 419,
    currentCapacity70C: 546,
    currentCapacity90C: 607,
    diameter: 33.0,
    weight: 3400,
    insulationThickness: 2.2,
    ukStandard: "BS 6004",
  },
  {
    size: "500",
    crossSectionMm2: 500.0,
    resistance: 0.037,
    reactance: 0.045,
    currentCapacity60C: 467,
    currentCapacity70C: 609,
    currentCapacity90C: 677,
    diameter: 35.8,
    weight: 4100,
    insulationThickness: 2.2,
    ukStandard: "BS 6004",
  },
  {
    size: "630",
    crossSectionMm2: 630.0,
    resistance: 0.03,
    reactance: 0.04,
    currentCapacity60C: 525,
    currentCapacity70C: 686,
    currentCapacity90C: 763,
    diameter: 39.5,
    weight: 5000,
    insulationThickness: 2.4,
    ukStandard: "BS 6004",
  },
];

// BS7671 Temperature correction factors (BS7671 Appendix 4)
const BS7671_TEMPERATURE_CORRECTION: BS7671TemperatureCorrection = {
  70: {
    10: 1.15,
    15: 1.12,
    20: 1.08,
    25: 1.04,
    30: 1.0,
    35: 0.96,
    40: 0.91,
    45: 0.87,
    50: 0.82,
    55: 0.76,
    60: 0.71,
    65: 0.65,
    70: 0.58,
  },
  90: {
    10: 1.1,
    15: 1.08,
    20: 1.05,
    25: 1.03,
    30: 1.0,
    35: 0.98,
    40: 0.95,
    45: 0.93,
    50: 0.9,
    55: 0.87,
    60: 0.84,
    65: 0.81,
    70: 0.77,
    75: 0.74,
    80: 0.7,
    85: 0.67,
    90: 0.63,
  },
};

// BS7671 Grouping factors (BS7671 Appendix 4)
const BS7671_GROUPING_FACTORS: BS7671GroupingFactor = {
  1: 1.0,
  2: 0.8,
  3: 0.7,
  4: 0.65,
  5: 0.6,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.5,
  10: 0.48,
  11: 0.46,
  12: 0.45,
  13: 0.44,
  14: 0.43,
  15: 0.42,
  16: 0.41,
  17: 0.4,
  18: 0.39,
  19: 0.38,
  20: 0.38,
};

// BS7671 Installation method factors (BS7671 Appendix 4)
const BS7671_INSTALLATION_METHODS: Record<
  string,
  BS7671InstallationMethodFactor
> = {
  A1: {
    factor: 1.0,
    description: "Insulated conductors in conduit in thermally insulating wall",
    applicableConditions: ["Thermal insulation", "Enclosed installation"],
    referenceMethod: "A1",
    ukSpecificNotes: [
      "Part P notification may be required",
      "Building Regulations compliance",
    ],
  },
  A2: {
    factor: 1.0,
    description: "Multicore cable in conduit in thermally insulating wall",
    applicableConditions: ["Thermal insulation", "Multicore cable"],
    referenceMethod: "A2",
    ukSpecificNotes: ["Consider safe zones", "RCD protection requirements"],
  },
  B1: {
    factor: 1.0,
    description: "Insulated conductors in conduit on wall or in trunking",
    applicableConditions: ["Surface mounting", "Good heat dissipation"],
    referenceMethod: "B1",
    ukSpecificNotes: ["IP rating considerations", "Segregation requirements"],
  },
  B2: {
    factor: 1.0,
    description: "Multicore cable in conduit on wall or in trunking",
    applicableConditions: ["Surface mounting", "Multicore cable"],
    referenceMethod: "B2",
    ukSpecificNotes: ["Fire barrier requirements", "Mechanical protection"],
  },
  C: {
    factor: 1.0,
    description: "Multicore cable on wall or ceiling (clipped direct)",
    applicableConditions: ["Clipped to surface", "Free air circulation"],
    referenceMethod: "C",
    ukSpecificNotes: ["Clip spacing requirements", "Support at terminations"],
  },
  D1: {
    factor: 1.0,
    description: "Multicore cable in underground duct",
    applicableConditions: ["Underground installation", "Duct system"],
    referenceMethod: "D1",
    ukSpecificNotes: ["Duct marking requirements", "Depth regulations"],
  },
  D2: {
    factor: 1.0,
    description: "Multicore cable buried direct in ground",
    applicableConditions: ["Direct burial", "Soil thermal resistivity"],
    referenceMethod: "D2",
    ukSpecificNotes: ["Mechanical protection", "Warning tape requirements"],
  },
  E: {
    factor: 1.2,
    description: "Multicore cable in free air (on cable tray)",
    applicableConditions: ["Free air circulation", "Optimal heat dissipation"],
    referenceMethod: "E",
    ukSpecificNotes: ["Tray loading calculations", "Segregation requirements"],
  },
  F: {
    factor: 1.1,
    description: "Single core cables in free air",
    applicableConditions: ["Separated cables", "Free air circulation"],
    referenceMethod: "F",
    ukSpecificNotes: ["Magnetic effect considerations", "Cleat spacing"],
  },
  G: {
    factor: 1.0,
    description: "Single core cables in underground duct",
    applicableConditions: ["Underground installation", "Single core cables"],
    referenceMethod: "G",
    ukSpecificNotes: ["Induced voltage precautions", "Bonding requirements"],
  },
};

// UK-specific diversity factors (BS7671 Appendix 1)
const UK_DIVERSITY_FACTORS: Record<string, number> = {
  socket_outlets: 0.4, // Socket outlet final circuits
  lighting: 0.66, // Lighting circuits
  water_heating: 1.0, // Water heating (no diversity)
  space_heating: 1.0, // Space heating (no diversity)
  cooking: 0.1, // Cooking appliances first 10A + 30% remainder + 5A
  motor_loads: 1.0, // Motor loads (no diversity)
  other_loads: 0.75, // Other loads
};

// Aluminum resistance multiplier (BS7671 standard)
const ALUMINUM_RESISTANCE_MULTIPLIER = 1.64;

/**
 * Calculate BS7671 wire size based on current capacity and voltage drop
 */
export function calculateBS7671WireSize(
  input: WireCalculationInput,
): WireCalculationResult {
  const {
    loadCurrent,
    circuitLength,
    voltage,
    voltageSystem,
    installationMethod,
    conductorMaterial,
    ambientTemperature = 20, // UK standard ambient temperature
    numberOfConductors = 3,
    powerFactor = 0.8,
    groupingFactor,
    thermalResistivity = 2.5,
    // strictCompliance is available in input but not used in current implementation
  } = input;

  const warnings: string[] = [];
  const assumptions: string[] = [];

  // BS7671 doesn't apply continuous load multiplier like NEC
  const designCurrent = loadCurrent;
  assumptions.push("No continuous load multiplier applied (BS7671 standard)");

  // Add UK-specific voltage warnings
  if (voltage === 240) {
    warnings.push(
      "240V is deprecated in UK. Use 230V for new installations (BS7671)",
    );
  }

  // UK ambient temperature consideration
  if (ambientTemperature !== 20 && ambientTemperature !== 30) {
    assumptions.push(
      `Using ${ambientTemperature}°C ambient temperature (UK standard assumes 20°C)`,
    );
  }

  // Calculate correction factors
  const correctionFactors = calculateBS7671CorrectionFactors({
    ambientTemperature,
    numberOfConductors,
    installationMethod,
    groupingFactor,
    thermalResistivity,
  });

  // Calculate required cable current capacity
  const requiredCurrentCapacity =
    designCurrent /
    (correctionFactors.temperature *
      correctionFactors.grouping *
      correctionFactors.installation *
      correctionFactors.thermal);

  // Find suitable cables based on current capacity
  const suitableCables = BS7671_CABLE_SPECIFICATIONS.filter((cable) => {
    const capacity = cable.currentCapacity70C; // BS7671 typically uses 70°C rating
    return capacity >= requiredCurrentCapacity;
  });

  if (suitableCables.length === 0) {
    throw new Error(
      "No suitable BS7671 cable size found for the given current requirements",
    );
  }

  // Get voltage drop limits (BS7671 specific)
  const voltageDropLimits = getVoltageDropLimits("BS7671");
  let selectedCable = suitableCables[0];
  let voltageDropResult = calculateBS7671VoltageDropForCable(selectedCable, {
    current: loadCurrent,
    length: circuitLength,
    voltage,
    voltageSystem,
    conductorMaterial,
    powerFactor,
  });

  // Check voltage drop compliance and select appropriate cable
  for (const cable of suitableCables) {
    const vdResult = calculateBS7671VoltageDropForCable(cable, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor,
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
    conductorMaterial,
  );

  // Calculate efficiency
  const efficiency =
    ((voltage - voltageDropResult.voltageDropVolts) / voltage) * 100;

  // Generate alternatives
  const alternatives = suitableCables.slice(0, 5).map((cable) => {
    const vdResult = calculateBS7671VoltageDropForCable(cable, {
      current: loadCurrent,
      length: circuitLength,
      voltage,
      voltageSystem,
      conductorMaterial,
      powerFactor,
    });

    return {
      wireSize: cable.size,
      currentCapacity: cable.currentCapacity70C,
      voltageDropPercent: vdResult.voltageDropPercent,
      isCompliant: vdResult.voltageDropPercent <= voltageDropLimits.normal,
      costFactor: getBS7671CableCostFactor(cable.size),
    };
  });

  // Compliance checks
  const finalCapacity = selectedCable.currentCapacity70C;
  const currentCompliant = finalCapacity >= requiredCurrentCapacity;
  const voltageDropCompliant =
    voltageDropResult.voltageDropPercent <= voltageDropLimits.normal;
  const temperatureCompliant =
    ambientTemperature >= -10 && ambientTemperature <= 70;
  const installationCompliant =
    BS7671_INSTALLATION_METHODS[installationMethod] !== undefined;

  // Add UK-specific compliance checks
  if (voltage < 230 || voltage > 400) {
    warnings.push(
      "Voltage outside standard UK range (230V single-phase, 400V three-phase)",
    );
  }

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
      standardCompliant:
        currentCompliant &&
        voltageDropCompliant &&
        temperatureCompliant &&
        installationCompliant,
      temperatureCompliant,
      installationCompliant,
    },
    calculationMetadata: {
      standardUsed: "BS7671",
      calculationMethod: "BS7671:2018+A2:2022 (IET Wiring Regulations)",
      voltageDropLimit: voltageDropLimits.normal,
      safetyFactors: {
        temperatureCorrection: correctionFactors.temperature,
        groupingFactor: correctionFactors.grouping,
        installationFactor: correctionFactors.installation,
        thermalResistivityFactor: correctionFactors.thermal,
        ukDiversityFactor: 1.0, // Would be applied if load type specified
      },
      assumptionsMade: assumptions,
      warningsGenerated: warnings,
    },
    alternatives,
  };
}

/**
 * Calculate BS7671 correction factors
 */
function calculateBS7671CorrectionFactors({
  ambientTemperature,
  numberOfConductors,
  installationMethod,
  groupingFactor,
  thermalResistivity,
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
  // Temperature correction factor (using 70°C rating)
  const tempCorrection = BS7671_TEMPERATURE_CORRECTION[70];
  const tempKeys = Object.keys(tempCorrection)
    .map(Number)
    .sort((a, b) => a - b);
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
    const groupingKeys = Object.keys(BS7671_GROUPING_FACTORS)
      .map(Number)
      .sort((a, b) => a - b);
    groupingFactorValue = 1.0;

    for (const count of groupingKeys) {
      if (numberOfConductors <= count) {
        groupingFactorValue = BS7671_GROUPING_FACTORS[count];
        break;
      }
    }

    // If more cables than in table, use the lowest factor
    if (numberOfConductors > groupingKeys[groupingKeys.length - 1]) {
      groupingFactorValue =
        BS7671_GROUPING_FACTORS[groupingKeys[groupingKeys.length - 1]];
    }
  }

  // Installation method factor
  const installationFactor =
    BS7671_INSTALLATION_METHODS[installationMethod]?.factor || 1.0;

  // Thermal resistivity factor (for underground installations)
  let thermalFactor = 1.0;
  if (installationMethod === "D2" || installationMethod === "D1") {
    // Apply thermal resistivity correction for underground installations
    if (thermalResistivity > 2.5) {
      thermalFactor = 2.5 / thermalResistivity;
    }
  }

  return {
    temperature: temperatureFactor,
    grouping: groupingFactorValue,
    installation: installationFactor,
    thermal: thermalFactor,
  };
}

/**
 * Calculate BS7671 voltage drop for a specific cable
 */
function calculateBS7671VoltageDropForCable(
  cable: BS7671CableSpecification,
  params: {
    current: number;
    length: number;
    voltage: number;
    voltageSystem: string;
    conductorMaterial: string;
    powerFactor: number;
  },
): { voltageDropPercent: number; voltageDropVolts: number } {
  const {
    current,
    length,
    voltage,
    voltageSystem,
    conductorMaterial,
    powerFactor,
  } = params;

  // Adjust resistance for conductor material
  const resistance =
    conductorMaterial === "aluminum"
      ? cable.resistance * ALUMINUM_RESISTANCE_MULTIPLIER
      : cable.resistance;

  // Calculate voltage drop based on voltage system
  let voltageDropVolts: number;

  if (voltageSystem === "single") {
    // Single phase: VD = 2 × I × L × (R × cos φ + X × sin φ) / 1000
    const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
    voltageDropVolts =
      2 *
      current *
      (length / 1000) *
      (resistance * powerFactor + cable.reactance * sinPhi);
  } else {
    // Three phase: VD = √3 × I × L × (R × cos φ + X × sin φ) / 1000
    const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
    voltageDropVolts =
      Math.sqrt(3) *
      current *
      (length / 1000) *
      (resistance * powerFactor + cable.reactance * sinPhi);
  }

  const voltageDropPercent = (voltageDropVolts / voltage) * 100;

  return {
    voltageDropPercent,
    voltageDropVolts,
  };
}

/**
 * Calculate power loss in BS7671 circuits
 */
function calculatePowerLoss(
  current: number,
  resistance: number,
  length: number,
  voltageSystem: string,
  conductorMaterial: string,
): number {
  // Adjust resistance for conductor material
  const adjustedResistance =
    conductorMaterial === "aluminum"
      ? resistance * ALUMINUM_RESISTANCE_MULTIPLIER
      : resistance;

  // Power loss: P = I² × R × L / 1000
  const multiplier = voltageSystem === "single" ? 1 : 3; // 3 for three-phase
  return multiplier * current * current * adjustedResistance * (length / 1000);
}

/**
 * Get relative cost factor for BS7671 cable sizes
 */
function getBS7671CableCostFactor(size: string): number {
  const costFactors: Record<string, number> = {
    "1.0": 1.0,
    "1.5": 1.1,
    "2.5": 1.3,
    "4": 1.6,
    "6": 1.9,
    "10": 2.4,
    "16": 3.0,
    "25": 3.8,
    "35": 4.6,
    "50": 5.7,
    "70": 7.1,
    "95": 8.6,
    "120": 10.4,
    "150": 12.5,
    "185": 14.8,
    "240": 17.8,
    "300": 20.9,
    "400": 24.8,
    "500": 28.8,
    "630": 34.2,
  };
  return costFactors[size] || 1.0;
}

/**
 * Apply UK diversity factors based on load type
 */
export function applyUKDiversityFactor(
  current: number,
  loadType: string,
): number {
  const diversityFactor = UK_DIVERSITY_FACTORS[loadType] || 1.0;
  return current * diversityFactor;
}

/**
 * Get BS7671 cable specifications
 */
export function getBS7671CableSpecifications(): BS7671CableSpecification[] {
  return [...BS7671_CABLE_SPECIFICATIONS];
}

/**
 * Get BS7671 cable data by size
 */
export function getBS7671CableData(
  size: string,
): BS7671CableSpecification | undefined {
  return BS7671_CABLE_SPECIFICATIONS.find((cable) => cable.size === size);
}

/**
 * Get available BS7671 cable sizes
 */
export function getBS7671CableSizes(): string[] {
  return BS7671_CABLE_SPECIFICATIONS.map((cable) => cable.size);
}

/**
 * Get BS7671 temperature correction factors
 */
export function getBS7671TemperatureCorrectionFactors(): BS7671TemperatureCorrection {
  return { ...BS7671_TEMPERATURE_CORRECTION };
}

/**
 * Get BS7671 grouping factors
 */
export function getBS7671GroupingFactors(): BS7671GroupingFactor {
  return { ...BS7671_GROUPING_FACTORS };
}

/**
 * Get BS7671 installation method factors
 */
export function getBS7671InstallationMethodFactors(): Record<
  string,
  BS7671InstallationMethodFactor
> {
  return { ...BS7671_INSTALLATION_METHODS };
}

/**
 * Get UK diversity factors
 */
export function getUKDiversityFactors(): Record<string, number> {
  return { ...UK_DIVERSITY_FACTORS };
}
