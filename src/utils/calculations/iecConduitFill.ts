/**
 * IEC Conduit Fill Calculation Engine
 * Pure Metric/International standards implementation
 * Standards: IEC 60364, EN 61386, IEC 60227/60245
 */

import type {
  ConduitFillCalculationInput,
  ConduitFillCalculationResult,
  ConduitSpecification,
  WireSpecification,
} from "../../types/standards";

import {
  IEC_CONDUIT_SPECIFICATIONS,
  IEC_WIRE_SPECIFICATIONS,
  IEC_XLPE_WIRE_SPECIFICATIONS,
  IEC_CONDUIT_FILL_PERCENTAGES,
  IEC_BUNDLING_FACTORS,
} from "../../standards/iec";

import {
  getApplicationRequirements,
  getInstallationMethodFactors,
  calculateEnvironmentalCompliance as calculateComprehensiveCompliance,
} from "./conduitFillRouter";

/**
 * Calculate conduit fill using IEC/Metric standards (New unified interface)
 */
export function calculateIECConduitFill(
  input: ConduitFillCalculationInput,
): ConduitFillCalculationResult;

/**
 * Calculate conduit fill using IEC/Metric standards (Legacy interface)
 */
export function calculateIECConduitFill(
  input: IECConduitFillInput,
): IECConduitFillResult[];

/**
 * Calculate conduit fill using IEC/Metric standards (Implementation with overloads)
 */
export function calculateIECConduitFill(
  input: ConduitFillCalculationInput | IECConduitFillInput,
): ConduitFillCalculationResult | IECConduitFillResult[] {
  // Check if it's legacy input by checking for 'count' property or by interface shape
  if (
    "wires" in input &&
    (input.wires.length === 0 || "count" in input.wires[0]) &&
    "conduitType" in input &&
    !("wireStandard" in input)
  ) {
    return calculateIECConduitFill_Legacy(input as IECConduitFillInput);
  }

  // New unified interface
  return calculateIECConduitFill_New(input as ConduitFillCalculationInput);
}

/**
 * Internal function for new unified interface
 */
function calculateIECConduitFill_New(
  input: ConduitFillCalculationInput,
): ConduitFillCalculationResult {
  const {
    wires,
    conduitType,
    conduitSize,
    applicationType,
    installationMethod,
    ambientTemperature = 25, // Default IEC ambient
    environment = "dry",
    futureFillReserve = 0,
  } = input;

  // Calculate total wire area
  const wireBreakdown = calculateIECWireBreakdown(wires);
  const totalWireArea = wireBreakdown.reduce(
    (sum, wire) => sum + wire.totalArea,
    0,
  );
  const totalWireCount = wires.reduce((sum, wire) => sum + wire.quantity, 0);

  // Apply future fill reserve
  const adjustedWireArea = totalWireArea * (1 + futureFillReserve / 100);

  // Get available conduits for the specified type
  const availableConduits = IEC_CONDUIT_SPECIFICATIONS.filter(
    (c) => c.type === conduitType,
  ).sort((a, b) => a.internalArea - b.internalArea); // Sort by area (smallest first)

  // If specific conduit size is requested, calculate for that size
  if (conduitSize) {
    const specificConduit = availableConduits.find(
      (c) => c.size === conduitSize,
    );
    if (specificConduit) {
      return calculateSpecificIECConduitFill(
        specificConduit,
        adjustedWireArea,
        totalWireCount,
        wireBreakdown,
        input,
      );
    } else {
      throw new Error(
        `Conduit size ${conduitSize} not found for type ${conduitType}`,
      );
    }
  }

  // Find the smallest compliant conduit
  let recommendedConduit = null;
  let fillPercentage = 0;
  let maxAllowedFillPercentage = 0;
  let fillRule = "";

  for (const conduit of availableConduits) {
    const iecFillData = calculateIECFillData(
      conduit,
      adjustedWireArea,
      totalWireCount,
    );

    if (iecFillData.isCompliant) {
      recommendedConduit = conduit;
      fillPercentage = iecFillData.fillPercentage;
      maxAllowedFillPercentage = iecFillData.maxAllowedFillPercentage;
      fillRule = iecFillData.fillRule;
      break;
    }
  }

  // If no compliant conduit found, use the largest available
  if (!recommendedConduit) {
    recommendedConduit = availableConduits[availableConduits.length - 1];
    const iecFillData = calculateIECFillData(
      recommendedConduit,
      adjustedWireArea,
      totalWireCount,
    );
    fillPercentage = iecFillData.fillPercentage;
    maxAllowedFillPercentage = iecFillData.maxAllowedFillPercentage;
    fillRule = iecFillData.fillRule;
  }

  // Calculate alternatives
  const alternatives = availableConduits.map((conduit) => {
    const iecFillData = calculateIECFillData(
      conduit,
      adjustedWireArea,
      totalWireCount,
    );
    return {
      conduitSize: conduit.size,
      conduitType: conduit.type,
      fillPercentage: iecFillData.fillPercentage,
      isCompliant: iecFillData.isCompliant,
      costFactor: calculateCostFactor(conduit.size, conduit.type),
    };
  });

  // Get application and installation method data
  const applicationRequirements = getApplicationRequirements(
    applicationType,
    "IEC",
  );
  const installationFactors = getInstallationMethodFactors(
    installationMethod,
    "IEC",
  );

  // Calculate environmental compliance
  const environmentalCompliance = calculateComprehensiveCompliance(
    applicationType,
    installationMethod,
    ambientTemperature,
    environment,
    "IEC",
  );

  return {
    recommendedConduitSize: recommendedConduit.size,
    conduitType,
    wireStandard: "IEC",

    fillAnalysis: {
      totalWireArea: adjustedWireArea,
      conduitInternalArea: recommendedConduit.internalArea,
      fillPercentage,
      maxAllowedFillPercentage,
      availableArea: recommendedConduit.internalArea - adjustedWireArea,
      fillRule: fillRule as "53% (1 wire)" | "31% (2 wires)" | "40% (3+ wires)",
    },

    compliance: {
      codeCompliant: fillPercentage <= maxAllowedFillPercentage,
      fillCompliant: fillPercentage <= maxAllowedFillPercentage,
      temperatureCompliant: environmentalCompliance.temperatureCompliance,
      applicationCompliant: environmentalCompliance.applicationCompliance,
      installationCompliant: environmentalCompliance.environmentCompliance,
    },

    wireBreakdown,
    alternatives,

    applicationData: {
      applicationType,
      installationMethod,
      specialRequirements: applicationRequirements.specialRequirements,
      recommendedPractices: applicationRequirements.recommendedPractices,
    },

    calculationMetadata: {
      calculationMethod: "IEC 60364 / EN 61386",
      standardsUsed: ["IEC 60364-5-52", "EN 61386-1", "IEC 60227", "IEC 60245"],
      temperature: ambientTemperature,
      environment,
      safetyFactors: {
        futureFillReserve: futureFillReserve / 100,
        temperatureFactor: installationFactors.temperatureFactor,
        environmentFactor: installationFactors.environmentFactor,
      },
      timestamp: new Date(),
    },
  };
}

/**
 * Calculate wire breakdown for IEC (metric) system
 */
function calculateIECWireBreakdown(
  wires: ConduitFillCalculationInput["wires"],
): ConduitFillCalculationResult["wireBreakdown"] {
  const breakdown: ConduitFillCalculationResult["wireBreakdown"] = [];
  let totalArea = 0;

  for (const wire of wires) {
    const wireSpec = getIECWireSpecification(wire.gauge, wire.insulation);
    if (wireSpec) {
      const wireArea = wireSpec.totalArea * wire.quantity;
      totalArea += wireArea;

      breakdown.push({
        gauge: wire.gauge,
        quantity: wire.quantity,
        insulation: wire.insulation,
        individualArea: wireSpec.totalArea,
        totalArea: wireArea,
        percentage: 0, // Will be calculated after total is known
      });
    }
  }

  // Calculate percentages
  breakdown.forEach((wire) => {
    wire.percentage = (wire.totalArea / totalArea) * 100;
  });

  return breakdown;
}

/**
 * Get IEC wire specification
 */
function getIECWireSpecification(
  gauge: string,
  insulation: string,
): WireSpecification | undefined {
  const wireTable =
    insulation === "XLPE"
      ? IEC_XLPE_WIRE_SPECIFICATIONS
      : IEC_WIRE_SPECIFICATIONS;

  return wireTable.find((wire) => wire.gauge === gauge);
}

/**
 * Calculate IEC fill data for a specific conduit
 */
function calculateIECFillData(
  conduit: ConduitSpecification,
  wireArea: number,
  wireCount: number,
): {
  fillPercentage: number;
  maxAllowedFillPercentage: number;
  fillRule: string;
  isCompliant: boolean;
} {
  // IEC 60364 / EN 61386 fill percentages
  let maxAllowedFillPercentage: number;
  let fillRule: string;

  if (wireCount === 1) {
    maxAllowedFillPercentage = IEC_CONDUIT_FILL_PERCENTAGES[1];
    fillRule = "53% (1 wire)";
  } else if (wireCount === 2) {
    maxAllowedFillPercentage = IEC_CONDUIT_FILL_PERCENTAGES[2];
    fillRule = "31% (2 wires)";
  } else {
    maxAllowedFillPercentage = IEC_CONDUIT_FILL_PERCENTAGES[3];
    fillRule = "40% (3+ wires)";
  }

  const fillPercentage = (wireArea / conduit.internalArea) * 100;
  const maxAllowableArea =
    (conduit.internalArea * maxAllowedFillPercentage) / 100;
  const isCompliant = wireArea <= maxAllowableArea;

  return {
    fillPercentage,
    maxAllowedFillPercentage,
    fillRule,
    isCompliant,
  };
}

/**
 * Calculate specific conduit fill
 */
function calculateSpecificIECConduitFill(
  conduit: ConduitSpecification,
  wireArea: number,
  wireCount: number,
  wireBreakdown: ConduitFillCalculationResult["wireBreakdown"],
  input: ConduitFillCalculationInput,
): ConduitFillCalculationResult {
  const iecFillData = calculateIECFillData(conduit, wireArea, wireCount);
  const applicationRequirements = getApplicationRequirements(
    input.applicationType,
    "IEC",
  );
  const installationFactors = getInstallationMethodFactors(
    input.installationMethod,
    "IEC",
  );

  return {
    recommendedConduitSize: conduit.size,
    conduitType: conduit.type,
    wireStandard: "IEC",

    fillAnalysis: {
      totalWireArea: wireArea,
      conduitInternalArea: conduit.internalArea,
      fillPercentage: iecFillData.fillPercentage,
      maxAllowedFillPercentage: iecFillData.maxAllowedFillPercentage,
      availableArea: conduit.internalArea - wireArea,
      fillRule: iecFillData.fillRule as
        | "53% (1 wire)"
        | "31% (2 wires)"
        | "40% (3+ wires)",
    },

    compliance: {
      codeCompliant: iecFillData.isCompliant,
      fillCompliant: iecFillData.isCompliant,
      temperatureCompliant: true,
      applicationCompliant: true,
      installationCompliant: true,
    },

    wireBreakdown,
    alternatives: [], // Single conduit calculation

    applicationData: {
      applicationType: input.applicationType,
      installationMethod: input.installationMethod,
      specialRequirements: applicationRequirements.specialRequirements,
      recommendedPractices: applicationRequirements.recommendedPractices,
    },

    calculationMetadata: {
      calculationMethod: "IEC 60364 / EN 61386",
      standardsUsed: ["IEC 60364-5-52", "EN 61386-1"],
      temperature: input.ambientTemperature || 25,
      environment: input.environment || "dry",
      safetyFactors: {
        temperatureFactor: installationFactors.temperatureFactor,
        environmentFactor: installationFactors.environmentFactor,
      },
      timestamp: new Date(),
    },
  };
}

/**
 * Calculate relative cost factor for conduit sizing
 */
function calculateCostFactor(conduitSize: string, conduitType: string): number {
  // Base cost factors relative to 16mm PVC
  const sizeCostFactors: Record<string, number> = {
    "16": 1.0,
    "20": 1.2,
    "25": 1.5,
    "32": 2.0,
    "40": 2.8,
    "50": 3.8,
    "63": 5.2,
    "75": 7.0,
    "90": 9.5,
    "110": 13.0,
    "125": 16.0,
    "160": 22.0,
  };

  const typeCostFactors: Record<string, number> = {
    PVC: 1.0,
    Steel: 1.6,
  };

  const sizeFactor = sizeCostFactors[conduitSize] || 1.0;
  const typeFactor = typeCostFactors[conduitType] || 1.0;

  return sizeFactor * typeFactor;
}

/**
 * Get IEC conduit specifications
 */
export function getIECConduitSpecifications(
  conduitType?: string,
): ConduitSpecification[] {
  if (conduitType) {
    return IEC_CONDUIT_SPECIFICATIONS.filter((c) => c.type === conduitType);
  }
  return IEC_CONDUIT_SPECIFICATIONS;
}

/**
 * Get IEC wire specifications
 */
export function getIECWireSpecifications(
  insulationType: "PVC" | "XLPE" = "PVC",
): WireSpecification[] {
  return insulationType === "XLPE"
    ? IEC_XLPE_WIRE_SPECIFICATIONS
    : IEC_WIRE_SPECIFICATIONS;
}

/**
 * Find minimum conduit size for given wire area
 */
export function findMinimumIECConduitSize(
  totalWireArea: number,
  wireCount: number,
  conduitType: string,
): string | null {
  const availableConduits = IEC_CONDUIT_SPECIFICATIONS.filter(
    (c) => c.type === conduitType,
  ).sort((a, b) => a.internalArea - b.internalArea);

  for (const conduit of availableConduits) {
    const iecFillData = calculateIECFillData(conduit, totalWireArea, wireCount);
    if (iecFillData.isCompliant) {
      return conduit.size;
    }
  }

  return null; // No compliant size found
}

/**
 * Get bundling factor for IEC calculations
 */
export function getIECBundlingFactor(numberOfCables: number): number {
  const counts = Object.keys(IEC_BUNDLING_FACTORS)
    .map(Number)
    .sort((a, b) => a - b);

  for (const count of counts) {
    if (numberOfCables <= count) {
      return (IEC_BUNDLING_FACTORS as Record<number, number>)[count];
    }
  }

  // For more than 20 cables, use the 20-cable factor
  return IEC_BUNDLING_FACTORS[20];
}

/**
 * Generate conduit fill comparison data
 */
export function generateIECConduitFillComparisonData(
  wires: ConduitFillCalculationInput["wires"],
  conduitType: string = "PVC",
): Array<{
  conduitSize: string;
  fillPercent: number;
  maxFillPercent: number;
  isCompliant: boolean;
  availableArea: number;
  usedArea: number;
}> {
  const wireBreakdown = calculateIECWireBreakdown(wires);
  const totalWireArea = wireBreakdown.reduce(
    (sum, wire) => sum + wire.totalArea,
    0,
  );
  const totalWireCount = wires.reduce((sum, wire) => sum + wire.quantity, 0);

  // Get max fill percentage based on wire count
  let maxFillPercent: number;
  if (totalWireCount === 1) {
    maxFillPercent = IEC_CONDUIT_FILL_PERCENTAGES[1];
  } else if (totalWireCount === 2) {
    maxFillPercent = IEC_CONDUIT_FILL_PERCENTAGES[2];
  } else {
    maxFillPercent = IEC_CONDUIT_FILL_PERCENTAGES[3];
  }

  const conduits = IEC_CONDUIT_SPECIFICATIONS.filter(
    (c) => c.type === conduitType,
  );

  return conduits.map((conduit) => {
    const maxAllowableArea = (conduit.internalArea * maxFillPercent) / 100;
    const fillPercent = (totalWireArea / conduit.internalArea) * 100;
    const isCompliant = totalWireArea <= maxAllowableArea;

    return {
      conduitSize: conduit.size,
      fillPercent: Math.min(fillPercent, 100), // Cap at 100% for display
      maxFillPercent,
      isCompliant,
      availableArea: maxAllowableArea,
      usedArea: totalWireArea,
    };
  });
}

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

// Legacy types for backward compatibility
export interface IECConduitFillInput {
  wires: Array<{
    gauge: string;
    count: number;
    insulationType: "PVC" | "XLPE";
  }>;
  conduitType: "PVC" | "Steel";
}

export interface IECConduitFillResult {
  conduitSize: string;
  fillPercent: number;
  maxWires: number;
  actualWires: number;
  isCompliant: boolean;
  availableArea: number;
  usedArea: number;
  wireBreakdown: Array<{
    gauge: string;
    count: number;
    totalArea: number;
    percentage: number;
  }>;
}

/**
 * Legacy function: Calculate IEC conduit fill (returns array for backward compatibility)
 */
export function calculateIECConduitFill_Legacy(
  input: IECConduitFillInput,
): IECConduitFillResult[] {
  // Convert legacy input to new format
  const newInput: ConduitFillCalculationInput = {
    wires: input.wires.map((wire) => ({
      gauge: wire.gauge,
      quantity: wire.count,
      insulation: wire.insulationType,
    })),
    conduitType: input.conduitType,
    wireStandard: "IEC",
    applicationType: "commercial",
    installationMethod: "indoor",
  };

  // Get all conduit options
  const availableConduits = IEC_CONDUIT_SPECIFICATIONS.filter(
    (c) => c.type === input.conduitType,
  );

  const results: IECConduitFillResult[] = [];
  const wireBreakdown = calculateIECWireBreakdown(newInput.wires);
  const totalWireArea = wireBreakdown.reduce(
    (sum, wire) => sum + wire.totalArea,
    0,
  );
  const totalWireCount = input.wires.reduce((sum, wire) => sum + wire.count, 0);

  // Handle empty wire array case
  if (totalWireCount === 0) {
    for (const conduit of availableConduits) {
      results.push({
        conduitSize: conduit.size,
        fillPercent: 0,
        maxWires: 0,
        actualWires: 0,
        isCompliant: true,
        availableArea: conduit.internalArea,
        usedArea: 0,
        wireBreakdown: [],
      });
    }
    return results.sort(
      (a, b) => parseFloat(a.conduitSize) - parseFloat(b.conduitSize),
    );
  }

  for (const conduit of availableConduits) {
    const iecFillData = calculateIECFillData(
      conduit,
      totalWireArea,
      totalWireCount,
    );

    // Calculate max wires for this conduit (avoid division by zero)
    const maxWires =
      totalWireCount > 0
        ? Math.floor(
            (iecFillData.maxAllowedFillPercentage * conduit.internalArea) /
              100 /
              (totalWireArea / totalWireCount),
          )
        : 0;

    results.push({
      conduitSize: conduit.size,
      fillPercent: iecFillData.fillPercentage,
      maxWires,
      actualWires: totalWireCount,
      isCompliant: iecFillData.isCompliant,
      availableArea:
        (conduit.internalArea * iecFillData.maxAllowedFillPercentage) / 100,
      usedArea: totalWireArea,
      wireBreakdown: wireBreakdown.map((wire) => ({
        gauge: wire.gauge,
        count: wire.quantity,
        totalArea: wire.totalArea,
        percentage: wire.percentage,
      })),
    });
  }

  return results.sort(
    (a, b) => parseFloat(a.conduitSize) - parseFloat(b.conduitSize),
  );
}

/**
 * Legacy function: Find recommended conduit size
 */
export function findRecommendedConduitSize(
  input: IECConduitFillInput,
): IECConduitFillResult | null {
  const results = calculateIECConduitFill_Legacy(input);
  return results.find((result) => result.isCompliant) || null;
}

/**
 * Legacy function: Calculate specific conduit fill
 */
export function calculateSpecificConduitFill(
  conduitSize: string,
  conduitType: "PVC" | "Steel",
  wires: IECConduitFillInput["wires"],
): IECConduitFillResult | null {
  const input: IECConduitFillInput = {
    wires,
    conduitType,
  };

  const results = calculateIECConduitFill_Legacy(input);
  return results.find((result) => result.conduitSize === conduitSize) || null;
}

/**
 * Legacy function: Generate conduit fill comparison data
 */
export function generateConduitFillComparisonData(
  wires: IECConduitFillInput["wires"],
  conduitType: "PVC" | "Steel" = "PVC",
): Array<{
  conduitSize: string;
  fillPercent: number;
  maxFillPercent: number;
  isCompliant: boolean;
  availableArea: number;
  usedArea: number;
}> {
  const newWires = wires.map((wire) => ({
    gauge: wire.gauge,
    quantity: wire.count,
    insulation: wire.insulationType,
  }));

  return generateIECConduitFillComparisonData(newWires, conduitType);
}
