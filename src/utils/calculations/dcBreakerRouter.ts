/**
 * DC Circuit Breaker Calculation Router
 * Routes to appropriate calculation engine based on selected standard
 */

import type {
  DCBreakerCalculationInput,
  DCBreakerCalculationResult,
} from "../../types/standards";

import { calculateNECBreakerSize } from "./necBreakerCalculations";
import { calculateIECBreakerSize } from "./iecBreakerCalculations";
import {
  calculateAutomotiveFuseSize,
  validateAutomotiveFuseInput,
} from "./automotive/automotiveFuseCalculator";

/**
 * Main DC circuit breaker calculation function
 * Routes to appropriate engine based on wire standard and application
 */
export function calculateDCBreakerSize(
  input: DCBreakerCalculationInput,
): DCBreakerCalculationResult {
  const wireStandard = input.wireStandard || "IEC"; // Default to IEC (metric-first approach)

  // Check if automotive fuse should be used instead of circuit breaker
  if (shouldUseAutomotiveFuse(input)) {
    return calculateAutomotiveFuseSize(input);
  }

  if (wireStandard === "NEC") {
    return calculateNECBreakerSize(input);
  } else if (wireStandard === "IEC") {
    return calculateIECBreakerSize(input);
  } else {
    throw new Error(
      `Unsupported wire standard: ${wireStandard}. Use 'NEC' or 'IEC'`,
    );
  }
}

/**
 * Determine if automotive fuse should be used instead of circuit breaker
 */
function shouldUseAutomotiveFuse(input: DCBreakerCalculationInput): boolean {
  // Check if application is automotive-related
  const automotiveApplications = ["automotive", "marine", "led"];
  if (!automotiveApplications.includes(input.applicationType)) {
    return false;
  }

  // Check if voltage is automotive-compatible
  const automotiveVoltages = [12, 24, 32, 48];
  const systemVoltage = input.systemVoltage || 12;
  if (!automotiveVoltages.includes(systemVoltage)) {
    return false;
  }

  // Estimate current with more precise calculation
  let estimatedCurrent: number;
  if (input.inputMethod === "current") {
    estimatedCurrent = input.loadCurrent || 0;
  } else if (
    input.inputMethod === "power" &&
    input.loadPower &&
    input.systemVoltage
  ) {
    // Account for automotive efficiency factors
    const efficiency = getAutomotiveEfficiencyEstimate(
      systemVoltage as 12 | 24 | 32 | 48,
    );
    estimatedCurrent = input.loadPower / (input.systemVoltage * efficiency);
  } else {
    return false;
  }

  // Apply comprehensive safety factors
  const baseSafetyFactor = input.dutyCycle === "continuous" ? 1.25 : 1.15;
  const environmentalFactor = input.applicationType === "marine" ? 1.1 : 1.0;
  const temperatureFactor =
    input.ambientTemperature && input.ambientTemperature > 40 ? 1.1 : 1.0;

  const totalSafetyFactor =
    baseSafetyFactor * environmentalFactor * temperatureFactor;
  const adjustedCurrent = estimatedCurrent * totalSafetyFactor;

  // Use automotive fuse only if current is safely within range (≤120A adjusted, max fuse rating)
  return adjustedCurrent <= 120;
}

/**
 * Get automotive efficiency estimate for current calculation
 */
function getAutomotiveEfficiencyEstimate(voltage: 12 | 24 | 32 | 48): number {
  // Efficiency factors based on automotive voltage systems
  const efficiencyMap = {
    12: 0.85, // 12V systems have lower efficiency
    24: 0.9, // 24V systems are more efficient
    32: 0.92, // 32V systems are quite efficient
    48: 0.95, // 48V systems are most efficient
  };
  return efficiencyMap[voltage];
}

/**
 * Validate DC breaker calculation input (common validation)
 */
export function validateDCBreakerInput(
  input: DCBreakerCalculationInput,
): string[] {
  const errors: string[] = [];

  // Check if automotive application needs specific validation (regardless of whether fuse will be used)
  if (["automotive", "marine", "led"].includes(input.applicationType)) {
    const automotiveErrors = validateAutomotiveFuseInput(input);
    if (automotiveErrors.length > 0) {
      return automotiveErrors;
    }
  }

  // Validate input method and required fields
  if (input.inputMethod === "current") {
    if (!input.loadCurrent || input.loadCurrent <= 0) {
      errors.push("Load current must be greater than 0");
    }
    if (input.loadCurrent && input.loadCurrent > 1000) {
      errors.push("Load current exceeds maximum supported range (1000A)");
    }
  } else if (input.inputMethod === "power") {
    if (!input.loadPower || input.loadPower <= 0) {
      errors.push("Load power must be greater than 0");
    }
    if (!input.systemVoltage || input.systemVoltage <= 0) {
      errors.push("System voltage must be greater than 0");
    }
    if (input.loadPower && input.loadPower > 100000) {
      errors.push("Load power exceeds maximum supported range (100kW)");
    }
    if (input.systemVoltage && input.systemVoltage > 1000) {
      errors.push("System voltage exceeds maximum supported range (1000V DC)");
    }
    // Check for realistic power/voltage combinations
    if (input.loadPower && input.systemVoltage) {
      const calculatedCurrent = input.loadPower / input.systemVoltage;
      if (calculatedCurrent > 1000) {
        errors.push(
          "Calculated current exceeds 1000A - check power and voltage values",
        );
      }
    }
  } else {
    errors.push('Input method must be either "current" or "power"');
  }

  // Validate common fields
  if (input.ambientTemperature) {
    const minTemp = -40;
    const maxTemp = ["automotive", "marine", "led"].includes(
      input.applicationType,
    )
      ? 85
      : 150;
    if (
      input.ambientTemperature < minTemp ||
      input.ambientTemperature > maxTemp
    ) {
      if (maxTemp === 85) {
        errors.push(
          `Ambient temperature must be between -40°C and 85°C for automotive fuses`,
        );
      } else {
        errors.push("Ambient temperature must be between -40°C and 150°C");
      }
    }
  }

  // Solar application specific validation
  if (input.applicationType === "solar") {
    if (
      !input.shortCircuitCurrent &&
      (!input.panelIsc || !input.numberOfPanels)
    ) {
      errors.push(
        "Solar applications require either shortCircuitCurrent or panelIsc with numberOfPanels",
      );
    }
  }

  // Application type validation
  const validApplications = [
    "automotive",
    "marine",
    "solar",
    "telecom",
    "battery",
    "led",
    "industrial",
  ];
  if (!validApplications.includes(input.applicationType)) {
    errors.push(
      `Invalid application type. Must be one of: ${validApplications.join(", ")}`,
    );
  }

  // Wire standard validation
  if (input.wireStandard && !["NEC", "IEC"].includes(input.wireStandard)) {
    errors.push('Wire standard must be either "NEC" or "IEC"');
  }

  return errors;
}

/**
 * Calculate solar breaker size from panel specifications
 * Routes to appropriate standard-specific calculation
 */
export function calculateSolarBreakerFromPanels(
  panelIsc: number,
  numberOfPanels: number,
  stringConfiguration: "series" | "parallel" = "parallel",
  standard: "NEC" | "IEC" = "IEC",
): number {
  if (stringConfiguration === "parallel") {
    // Parallel strings - currents add up
    const totalIsc = panelIsc * numberOfPanels;

    if (standard === "NEC") {
      return totalIsc * 1.56; // NEC 690.8(A)
    } else {
      return totalIsc * 1.375; // IEC 62548-1:2023 (bifacial)
    }
  } else {
    // Series strings - current remains the same
    if (standard === "NEC") {
      return panelIsc * 1.56;
    } else {
      return panelIsc * 1.375;
    }
  }
}

/**
 * Get breaker recommendations for multiple current levels
 * Routes to appropriate standard-specific calculation
 */
export function getBreakerRecommendations(
  currentLevels: number[],
  applicationType: string,
  dutyCycle: "continuous" | "intermittent" = "continuous",
  wireStandard: "NEC" | "IEC" = "IEC",
): DCBreakerCalculationResult[] {
  return currentLevels.map((current) => {
    const input: DCBreakerCalculationInput = {
      inputMethod: "current",
      loadCurrent: current,
      applicationType: applicationType as any,
      dutyCycle,
      wireStandard,
    };
    return calculateDCBreakerSize(input);
  });
}
