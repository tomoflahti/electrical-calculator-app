/**
 * Automotive Fuse Calculator (ISO 8820-3)
 * Calculates fuse sizing for 12V/24V/32V/48V automotive systems
 */

import type {
  DCBreakerCalculationInput,
  DCBreakerCalculationResult,
  DCApplicationType,
  AutomotiveVoltage,
} from "../../../types/standards";

import {
  getAutomotiveFuseSpecifications,
  getPrimaryAutomotiveFuseRecommendation,
  getNextAutomotiveFuseRating,
  getAvailableAutomotiveFuseRatings,
} from "../../../standards/dc/automotive/iso8820Standards";

import {
  getAutomotiveVoltageSystem,
  getAutomotiveEfficiency,
  getAutomotiveSafetyFactors,
  calculateAutomotiveCurrent,
} from "../../../standards/dc/automotive/automotiveVoltages";

/**
 * Calculate automotive fuse size using ISO 8820-3 standards
 */
export function calculateAutomotiveFuseSize(
  input: DCBreakerCalculationInput,
): DCBreakerCalculationResult {
  const {
    inputMethod,
    loadCurrent,
    loadPower,
    systemVoltage,
    applicationType,
    dutyCycle,
    ambientTemperature = 25,
    continuousOperation = dutyCycle === "continuous",
    wireGauge,
    environment = "indoor",
    efficiencyFactor,
  } = input;

  // Validate automotive voltage system
  const automotiveVoltage = (systemVoltage || 12) as AutomotiveVoltage;
  if (![12, 24, 32, 48].includes(automotiveVoltage)) {
    throw new Error(
      `Unsupported automotive voltage: ${automotiveVoltage}V. Supported voltages: 12V, 24V, 32V, 48V`,
    );
  }

  // Calculate base current
  let baseCurrent: number;
  let powerAnalysis:
    | {
        inputPower: number;
        systemVoltage: number;
        efficiencyFactor: number;
        calculatedCurrent: number;
        effectivePower: number;
        powerLossWatts: number;
      }
    | undefined = undefined;

  if (inputMethod === "current") {
    if (!loadCurrent || loadCurrent <= 0) {
      throw new Error(
        "Load current must be greater than 0 for current input method",
      );
    }
    baseCurrent = loadCurrent;
  } else if (inputMethod === "power") {
    if (!loadPower || loadPower <= 0 || !systemVoltage || systemVoltage <= 0) {
      throw new Error("Invalid input method or missing required parameters");
    }

    const efficiency =
      efficiencyFactor || getAutomotiveEfficiency(automotiveVoltage);
    baseCurrent = calculateAutomotiveCurrent(
      loadPower,
      automotiveVoltage,
      efficiency,
    );

    powerAnalysis = {
      inputPower: loadPower,
      systemVoltage: automotiveVoltage,
      efficiencyFactor: efficiency,
      calculatedCurrent: baseCurrent,
      effectivePower: loadPower * efficiency,
      powerLossWatts: loadPower * (1 - efficiency),
    };
  } else {
    throw new Error("Invalid input method or missing required parameters");
  }

  // Get automotive safety factors
  const safetyFactors = getAutomotiveSafetyFactors(automotiveVoltage);
  const safetyFactor = continuousOperation
    ? safetyFactors.continuous
    : safetyFactors.intermittent;

  // Apply safety factor
  let adjustedCurrent = baseCurrent * safetyFactor;

  // Apply temperature derating if needed
  let temperatureDerating: number | undefined;
  if (ambientTemperature > 40) {
    temperatureDerating =
      calculateAutomotiveTemperatureDerating(ambientTemperature);
    adjustedCurrent = adjustedCurrent / temperatureDerating;
  }

  // Apply environment factors
  let environmentFactor = 1.0;
  if (environment === "automotive" || environment === "marine") {
    environmentFactor = 1.05; // Automotive environment factor
    adjustedCurrent = adjustedCurrent * environmentFactor;
  }

  // Check if current exceeds automotive fuse range (>120A)
  if (adjustedCurrent > 120) {
    throw new Error(
      `Adjusted current (${adjustedCurrent.toFixed(1)}A) exceeds automotive fuse range (120A max). Use circuit breaker instead.`,
    );
  }

  // Find appropriate fuse rating
  const recommendedFuseRating = getNextAutomotiveFuseRating(
    adjustedCurrent,
    automotiveVoltage,
    applicationType,
  );
  if (!recommendedFuseRating) {
    throw new Error(
      `No suitable automotive fuse found for ${adjustedCurrent.toFixed(1)}A at ${automotiveVoltage}V`,
    );
  }

  // Get fuse specifications
  const primaryFuse = getPrimaryAutomotiveFuseRecommendation(
    recommendedFuseRating,
    automotiveVoltage,
    applicationType,
  );
  if (!primaryFuse) {
    throw new Error(
      `No automotive fuse specification found for ${recommendedFuseRating}A at ${automotiveVoltage}V`,
    );
  }

  const alternativeFuses = getAutomotiveFuseSpecifications(
    recommendedFuseRating,
    automotiveVoltage,
    applicationType,
  ).filter((fuse) => fuse.type !== primaryFuse.type);

  // Build calculation method description
  const voltageSystem = getAutomotiveVoltageSystem(automotiveVoltage);
  let calculationMethod = `ISO 8820-3 automotive fuse sizing for ${voltageSystem.name}:\n`;

  if (inputMethod === "power") {
    calculationMethod += `Power: ${loadPower}W ÷ ${automotiveVoltage}V ÷ ${(efficiencyFactor || getAutomotiveEfficiency(automotiveVoltage)).toFixed(2)} efficiency = ${baseCurrent.toFixed(1)}A\n`;
  } else {
    calculationMethod += `Base current: ${baseCurrent.toFixed(1)}A\n`;
  }

  calculationMethod += `Safety factor: ${safetyFactor}× (${continuousOperation ? "continuous" : "intermittent"} duty)\n`;

  if (temperatureDerating) {
    calculationMethod += `Temperature derating: ${(temperatureDerating * 100).toFixed(0)}% at ${ambientTemperature}°C\n`;
  }

  if (environmentFactor > 1.0) {
    calculationMethod += `Environment factor: ${environmentFactor}× (${environment})\n`;
  }

  calculationMethod += `Adjusted current: ${adjustedCurrent.toFixed(1)}A → ${recommendedFuseRating}A ${primaryFuse.type} fuse (${primaryFuse.color})`;

  // Check compliance
  const compliance = {
    standardCompliant: true,
    applicationCompliant: primaryFuse.applications.includes(applicationType),
    wireCompatible: wireGauge
      ? checkWireCompatibility(wireGauge, recommendedFuseRating)
      : true,
    temperatureCompliant:
      ambientTemperature >= primaryFuse.temperatureRange.min &&
      ambientTemperature <= primaryFuse.temperatureRange.max,
  };

  return {
    recommendedBreakerRating: recommendedFuseRating,
    adjustedCurrent: adjustedCurrent,
    safetyFactor: safetyFactor,
    minimumBreakerSize: Math.ceil(adjustedCurrent),
    nextStandardSize: recommendedFuseRating,
    breakerType: primaryFuse.type,
    standard: primaryFuse.standard,
    temperatureDerating: temperatureDerating,
    powerAnalysis: powerAnalysis,
    calculationMethod: calculationMethod,
    compliance: compliance,
    availableBreakerSizes: getAvailableAutomotiveFuseRatings(
      automotiveVoltage,
      applicationType,
    ),
    breakerRecommendations: {
      primary: {
        rating: primaryFuse.rating,
        type: primaryFuse.type,
        voltage: primaryFuse.voltageRating,
        standard: primaryFuse.standard,
        continuousDuty: true,
        temperatureRating: primaryFuse.temperatureRange.max,
        applications: primaryFuse.applications,
        color: primaryFuse.color,
        physicalSize: primaryFuse.physicalSize,
        thermalRunawayProtection: false,
      },
      alternatives: alternativeFuses.map((fuse) => ({
        rating: fuse.rating,
        type: fuse.type,
        voltage: fuse.voltageRating,
        standard: fuse.standard,
        continuousDuty: true,
        temperatureRating: fuse.temperatureRange.max,
        applications: fuse.applications,
        color: fuse.color,
        physicalSize: fuse.physicalSize,
        thermalRunawayProtection: false,
      })),
    },
  };
}

/**
 * Calculate automotive temperature derating factor
 */
function calculateAutomotiveTemperatureDerating(
  ambientTemperature: number,
): number {
  // ISO 8820-3 temperature derating for automotive fuses
  if (ambientTemperature <= 40) return 1.0;

  // Linear derating from 40°C to 85°C
  const derating = 1.0 - (ambientTemperature - 40) * 0.005;
  return Math.max(derating, 0.5); // Minimum 50% derating
}

/**
 * Check wire compatibility with fuse rating
 */
function checkWireCompatibility(
  wireGauge: string,
  fuseRating: number,
): boolean {
  // Simple wire gauge compatibility check
  // This would need to be expanded with actual wire ampacity tables
  const wireAmpacity = getWireAmpacity(wireGauge);
  return wireAmpacity >= fuseRating;
}

/**
 * Get wire ampacity for gauge (simplified)
 */
function getWireAmpacity(wireGauge: string): number {
  // Simplified wire ampacity lookup for automotive applications
  const awgAmpacity: Record<string, number> = {
    "20": 11,
    "18": 16,
    "16": 22,
    "14": 32,
    "12": 41,
    "10": 55,
    "8": 73,
    "6": 101,
    "4": 135,
    "2": 181,
    "1": 211,
    "1/0": 245,
    "2/0": 283,
    "3/0": 328,
    "4/0": 380,
  };

  return awgAmpacity[wireGauge] || 0;
}

/**
 * Get automotive fuse type recommendation based on current and application
 */
export function getAutomotiveFuseTypeRecommendation(
  current: number,
  _voltage: AutomotiveVoltage,
  _applicationType: DCApplicationType,
): string {
  if (current <= 10) {
    return "micro2"; // Space-saving for low current
  } else if (current <= 40) {
    return "regular"; // Standard for medium current
  } else if (current <= 120) {
    return "maxi"; // High current applications
  } else {
    return "circuit-breaker"; // Exceeds fuse range
  }
}

/**
 * Validate automotive fuse calculation input
 */
export function validateAutomotiveFuseInput(
  input: DCBreakerCalculationInput,
): string[] {
  const errors: string[] = [];

  // Validate voltage system
  const voltage = input.systemVoltage || 12;
  if (![12, 24, 32, 48].includes(voltage)) {
    errors.push(
      `Unsupported automotive voltage: ${voltage}V. Supported: 12V, 24V, 32V, 48V`,
    );
  }

  // Validate application type
  if (!["automotive", "marine", "led"].includes(input.applicationType)) {
    errors.push(
      "Automotive fuses are only supported for automotive, marine, and LED applications",
    );
  }

  // Validate input method
  if (input.inputMethod === "current") {
    if (!input.loadCurrent || input.loadCurrent <= 0) {
      errors.push("Load current must be greater than 0");
    }
    if (input.loadCurrent && input.loadCurrent > 120) {
      errors.push("Load current exceeds automotive fuse range (120A max)");
    }
  } else if (input.inputMethod === "power") {
    if (!input.loadPower || input.loadPower <= 0) {
      errors.push("Load power must be greater than 0");
    }
    if (!input.systemVoltage || input.systemVoltage <= 0) {
      errors.push("System voltage must be greater than 0");
    }

    // Check if resulting current would exceed fuse range
    if (input.loadPower && input.systemVoltage) {
      const estimatedCurrent = input.loadPower / input.systemVoltage;
      if (estimatedCurrent > 100) {
        // Leave room for safety factors
        errors.push(
          "Calculated current may exceed automotive fuse range (120A max)",
        );
      }
    }
  }

  // Validate temperature range
  if (
    input.ambientTemperature &&
    (input.ambientTemperature < -40 || input.ambientTemperature > 85)
  ) {
    errors.push(
      "Ambient temperature must be between -40°C and 85°C for automotive fuses",
    );
  }

  return errors;
}
