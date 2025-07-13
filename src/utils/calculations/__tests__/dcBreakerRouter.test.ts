/**
 * DC Breaker Router Tests
 * Tests the routing logic between NEC and IEC calculation engines
 */

import {
  calculateDCBreakerSize,
  validateDCBreakerInput,
  calculateSolarBreakerFromPanels,
  getBreakerRecommendations,
} from "../dcBreakerRouter";
import type { DCBreakerCalculationInput } from "../../../types/standards";

// Mock the calculation engines
jest.mock("../necBreakerCalculations", () => ({
  calculateNECBreakerSize: jest.fn(() => ({
    recommendedBreakerRating: 25,
    breakerType: "thermal-magnetic",
    standard: "UL489",
    calculationMethod: "NEC calculation",
    safetyFactor: 1.25,
    adjustedCurrent: 25.0,
    compliance: {
      standardCompliant: true,
      wireCompatible: true,
      applicationCompliant: true,
      temperatureCompliant: true,
    },
    availableBreakerSizes: [10, 15, 20, 25, 30],
    minimumBreakerSize: 25,
    nextStandardSize: 25,
    breakerRecommendations: {
      primary: {
        rating: 25,
        type: "thermal-magnetic",
        voltage: 125,
        standard: "UL489",
        continuousDuty: true,
        temperatureRating: 80,
        applications: ["automotive"],
        interruptingCapacity: 15000,
        tripCurve: "C",
        frameSize: "Standard",
      },
      alternatives: [],
    },
  })),
}));

jest.mock("../iecBreakerCalculations", () => ({
  calculateIECBreakerSize: jest.fn(() => ({
    recommendedBreakerRating: 25,
    breakerType: "thermal-magnetic",
    standard: "IEC60947",
    calculationMethod: "IEC calculation",
    safetyFactor: 1.25,
    adjustedCurrent: 25.0,
    compliance: {
      standardCompliant: true,
      wireCompatible: true,
      applicationCompliant: true,
      temperatureCompliant: true,
    },
    availableBreakerSizes: [6, 10, 16, 20, 25, 32],
    minimumBreakerSize: 25,
    nextStandardSize: 25,
    breakerRecommendations: {
      primary: {
        rating: 25,
        type: "thermal-magnetic",
        voltage: 250,
        standard: "IEC60947",
        continuousDuty: true,
        temperatureRating: 85,
        applications: ["automotive"],
        interruptingCapacity: 15000,
        tripCurve: "C",
        frameSize: "Industrial",
      },
      alternatives: [],
    },
  })),
}));

describe("DC Breaker Router", () => {
  describe("Standard Routing", () => {
    it("should route to NEC engine when wireStandard is NEC", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.calculationMethod).toBe("NEC calculation");
      expect(result.standard).toBe("UL489");
    });

    it("should route to IEC engine when wireStandard is IEC", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        wireStandard: "IEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.calculationMethod).toBe("IEC calculation");
      expect(result.standard).toBe("IEC60947");
    });

    it("should default to IEC when wireStandard is not specified (metric-first)", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        // wireStandard not specified
      };

      const result = calculateDCBreakerSize(input);

      expect(result.calculationMethod).toBe("IEC calculation");
      expect(result.standard).toBe("IEC60947");
    });

    it("should throw error for invalid wireStandard", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        wireStandard: "INVALID" as any,
      };

      expect(() => calculateDCBreakerSize(input)).toThrow(
        "Unsupported wire standard: INVALID",
      );
    });
  });

  describe("Input Validation", () => {
    describe("Current Input Method", () => {
      it("should pass valid current input", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toHaveLength(0);
      });

      it("should reject missing load current", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain("Load current must be greater than 0");
      });

      it("should reject zero load current", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 0,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain("Load current must be greater than 0");
      });

      it("should reject excessive load current", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 1500,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Load current exceeds automotive fuse range (120A max)",
        );
      });
    });

    describe("Power Input Method", () => {
      it("should pass valid power input", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: 2400,
          systemVoltage: 24,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toHaveLength(0);
      });

      it("should reject missing load power", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          systemVoltage: 24,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain("Load power must be greater than 0");
      });

      it("should reject missing system voltage", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: 2400,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain("System voltage must be greater than 0");
      });

      it("should reject excessive power", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: 150000,
          systemVoltage: 24,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Calculated current may exceed automotive fuse range (120A max)",
        );
      });

      it("should reject excessive voltage", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: 2400,
          systemVoltage: 1500,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Unsupported automotive voltage: 1500V. Supported: 12V, 24V, 32V, 48V",
        );
      });

      it("should reject unrealistic power/voltage combinations", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: 48000, // 48kW
          systemVoltage: 12, // 12V = 4000A current
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Calculated current may exceed automotive fuse range (120A max)",
        );
      });
    });

    describe("Common Validation", () => {
      it("should reject invalid input method", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "invalid" as any,
          applicationType: "automotive",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          'Input method must be either "current" or "power"',
        );
      });

      it("should reject invalid temperature range", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "automotive",
          dutyCycle: "continuous",
          ambientTemperature: 200,
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Ambient temperature must be between -40°C and 85°C for automotive fuses",
        );
      });

      it("should reject invalid application type", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "invalid" as any,
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Invalid application type. Must be one of: automotive, marine, solar, telecom, battery, led, industrial",
        );
      });

      it("should require solar-specific inputs for solar application", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "solar",
          dutyCycle: "continuous",
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain(
          "Solar applications require either shortCircuitCurrent or panelIsc with numberOfPanels",
        );
      });

      it("should reject invalid wire standard", () => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "automotive",
          dutyCycle: "continuous",
          wireStandard: "INVALID" as any,
        };

        const errors = validateDCBreakerInput(input);
        expect(errors).toContain('Wire standard must be either "NEC" or "IEC"');
      });
    });
  });

  describe("Helper Functions", () => {
    describe("calculateSolarBreakerFromPanels", () => {
      it("should calculate parallel string breaker size with NEC factor", () => {
        const result = calculateSolarBreakerFromPanels(
          9.5,
          2,
          "parallel",
          "NEC",
        );
        expect(result).toBe(29.64); // (9.5 × 2) × 1.56
      });

      it("should calculate series string breaker size with NEC factor", () => {
        const result = calculateSolarBreakerFromPanels(9.5, 2, "series", "NEC");
        expect(result).toBe(14.82); // 9.5 × 1.56
      });

      it("should calculate parallel string breaker size with IEC factor", () => {
        const result = calculateSolarBreakerFromPanels(
          9.5,
          2,
          "parallel",
          "IEC",
        );
        expect(result).toBe(26.125); // (9.5 × 2) × 1.375
      });

      it("should default to parallel configuration", () => {
        const result = calculateSolarBreakerFromPanels(9.5, 2);
        expect(result).toBe(26.125); // Parallel + IEC default
      });

      it("should default to IEC standard", () => {
        const result = calculateSolarBreakerFromPanels(9.5, 2, "parallel");
        expect(result).toBe(26.125); // IEC factor
      });
    });

    describe("getBreakerRecommendations", () => {
      it("should return recommendations for multiple current levels", () => {
        const currentLevels = [10, 20, 30];
        const results = getBreakerRecommendations(
          currentLevels,
          "automotive",
          "continuous",
          "IEC",
        );

        expect(results).toHaveLength(3);
        results.forEach((result) => {
          expect(result.standard).toBe("ISO8820-3");
          expect(result.calculationMethod).toContain(
            "ISO 8820-3 automotive fuse sizing",
          );
        });
      });

      it("should handle different duty cycles", () => {
        const currentLevels = [15, 25];
        const results = getBreakerRecommendations(
          currentLevels,
          "marine",
          "intermittent",
          "NEC",
        );

        expect(results).toHaveLength(2);
        results.forEach((result) => {
          expect(result.standard).toBe("ISO8820-3");
          expect(result.calculationMethod).toContain(
            "ISO 8820-3 automotive fuse sizing",
          );
        });
      });

      it("should default to IEC standard", () => {
        const currentLevels = [20];
        const results = getBreakerRecommendations(currentLevels, "automotive");

        expect(results).toHaveLength(1);
        expect(results[0].standard).toBe("ISO8820-3");
      });
    });
  });
});
