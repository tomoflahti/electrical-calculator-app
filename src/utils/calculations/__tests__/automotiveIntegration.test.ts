/**
 * Automotive Integration Tests
 * Tests for automotive fuse integration with the DC breaker router system
 */

import {
  calculateDCBreakerSize,
  validateDCBreakerInput,
} from "../dcBreakerRouter";

import type { DCBreakerCalculationInput } from "../../../types/standards";

describe("Automotive Fuse Integration with DC Breaker Router", () => {
  describe("Router Logic - Automotive Fuse vs Circuit Breaker Selection", () => {
    it("should route to automotive fuse calculator for 12V automotive applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.breakerType).toBe("regular");
      expect(result.recommendedBreakerRating).toBe(25);
    });

    it("should route to automotive fuse calculator for 24V commercial applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 15,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 24,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.safetyFactor).toBe(1.3); // 24V safety factor
      expect(result.recommendedBreakerRating).toBe(20);
    });

    it("should route to automotive fuse calculator for 48V hybrid applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 30,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 48,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.safetyFactor).toBe(1.2); // 48V safety factor
      expect(result.recommendedBreakerRating).toBe(40);
    });

    it("should route to automotive fuse calculator for marine applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 12,
        applicationType: "marine",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.breakerType).toBe("regular");
      expect(result.recommendedBreakerRating).toBe(15);
    });

    it("should route to automotive fuse calculator for LED applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 8,
        applicationType: "led",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.breakerType).toBe("micro2");
      expect(result.recommendedBreakerRating).toBe(10);
    });

    it("should route to circuit breaker for high current automotive applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 150,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      // Should route to NEC breaker calculator for high current
      expect(result.standard).toMatch(/UL489|SAE/);
      expect(result.recommendedBreakerRating).toBeGreaterThan(120);
    });

    it("should route to circuit breaker for non-automotive applications", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      // Should route to NEC breaker calculator for solar
      expect(result.standard).toMatch(/NEC|UL489/);
      expect(result.safetyFactor).toBe(1.56); // NEC 690.8(A) solar factor
    });

    it("should route to circuit breaker for unsupported voltages", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 120,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      // Should route to NEC breaker calculator for unsupported voltage
      expect(result.standard).toMatch(/UL489|SAE/);
    });
  });

  describe("Power-Based Routing", () => {
    it("should route power-based calculations to automotive fuse calculator", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "power",
        loadPower: 240,
        systemVoltage: 12,
        applicationType: "automotive",
        dutyCycle: "continuous",
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.powerAnalysis).toBeDefined();
      expect(result.powerAnalysis!.inputPower).toBe(240);
      expect(result.powerAnalysis!.systemVoltage).toBe(12);
    });

    it("should route high power calculations to circuit breaker", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "power",
        loadPower: 2000,
        systemVoltage: 12,
        applicationType: "automotive",
        dutyCycle: "continuous",
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      // 2000W / 12V = 166A, exceeds fuse range
      expect(result.standard).toMatch(/UL489|SAE/);
    });

    it("should handle power calculations across different voltages", () => {
      const inputs = [
        { voltage: 12, power: 240, expectedFuse: 30 },
        { voltage: 24, power: 240, expectedFuse: 15 },
        { voltage: 48, power: 240, expectedFuse: 7.5 },
      ];

      inputs.forEach(({ voltage, power, expectedFuse }) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: power,
          systemVoltage: voltage,
          applicationType: "automotive",
          dutyCycle: "continuous",
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBe(expectedFuse);
      });
    });
  });

  describe("Standards Switching", () => {
    it("should use automotive fuse calculation regardless of wire standard", () => {
      const necInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const iecInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "IEC",
      };

      const necResult = calculateDCBreakerSize(necInput);
      const iecResult = calculateDCBreakerSize(iecInput);

      // Both should use automotive fuse calculation
      expect(necResult.standard).toBe("ISO8820-3");
      expect(iecResult.standard).toBe("ISO8820-3");
      expect(necResult.recommendedBreakerRating).toBe(
        iecResult.recommendedBreakerRating,
      );
    });

    it("should fallback to appropriate standard when automotive fuse not applicable", () => {
      const necInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 150,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const iecInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 150,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "IEC",
      };

      const necResult = calculateDCBreakerSize(necInput);
      const iecResult = calculateDCBreakerSize(iecInput);

      // Should fallback to appropriate breaker standards
      expect(necResult.standard).toMatch(/UL489|SAE/);
      expect(iecResult.standard).toMatch(/IEC/);
    });
  });

  describe("Validation Integration", () => {
    it("should use automotive fuse validation for automotive applications", () => {
      const validInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const errors = validateDCBreakerInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it("should catch automotive-specific validation errors", () => {
      const invalidInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 6, // Unsupported voltage
        wireStandard: "NEC",
      };

      const errors = validateDCBreakerInput(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Unsupported automotive voltage");
    });

    it("should validate temperature limits for automotive fuses", () => {
      const invalidInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        ambientTemperature: 100,
        wireStandard: "NEC",
      };

      const errors = validateDCBreakerInput(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain(
        "Ambient temperature must be between -40°C and 85°C",
      );
    });

    it("should validate current limits for automotive fuses", () => {
      const invalidInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 150,
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const errors = validateDCBreakerInput(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Load current exceeds automotive fuse range");
    });

    it("should validate power-based inputs for automotive applications", () => {
      const invalidInput: DCBreakerCalculationInput = {
        inputMethod: "power",
        loadPower: 2400,
        systemVoltage: 12,
        applicationType: "automotive",
        dutyCycle: "continuous",
        wireStandard: "NEC",
      };

      const errors = validateDCBreakerInput(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain(
        "Calculated current may exceed automotive fuse range",
      );
    });

    it("should fallback to standard validation for non-automotive applications", () => {
      const solarInput: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "solar",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
        shortCircuitCurrent: 25, // Required for solar applications
      };

      const errors = validateDCBreakerInput(solarInput);
      expect(errors).toHaveLength(0); // Should pass standard validation
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle edge case at automotive fuse limit", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 96, // 96A × 1.25 = 120A (exact limit)
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.recommendedBreakerRating).toBe(120);
    });

    it("should handle just over automotive fuse limit", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 97, // 97A × 1.25 = 121.25A (over limit)
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      // Should fallback to circuit breaker
      expect(result.standard).toMatch(/UL489|SAE/);
    });

    it("should handle minimum automotive fuse current", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 0.4, // 0.4A × 1.25 = 0.5A (minimum fuse)
        applicationType: "automotive",
        dutyCycle: "continuous",
        systemVoltage: 12,
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.recommendedBreakerRating).toBe(0.5);
    });

    it("should handle automotive applications with missing voltage", () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: "current",
        loadCurrent: 20,
        applicationType: "automotive",
        dutyCycle: "continuous",
        // Missing systemVoltage - should default to 12V
        wireStandard: "NEC",
      };

      const result = calculateDCBreakerSize(input);

      expect(result.standard).toBe("ISO8820-3");
      expect(result.recommendedBreakerRating).toBe(25);
    });

    it("should handle voltage system compatibility correctly", () => {
      const voltages = [12, 24, 32, 48];

      voltages.forEach((voltage) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "current",
          loadCurrent: 20,
          applicationType: "automotive",
          dutyCycle: "continuous",
          systemVoltage: voltage,
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBeGreaterThan(0);
      });
    });
  });

  describe("Real-World Integration Scenarios", () => {
    it("should handle complete 12V passenger car electrical system", () => {
      const scenarios = [
        { component: "Interior LED", power: 60, expectedFuse: 7.5 }, // 60W/12V = 5A × 1.25 = 6.25A → 7.5A fuse
        { component: "Headlights", power: 144, expectedFuse: 20 }, // 144W/12V = 12A × 1.25 = 15A → 20A fuse
        { component: "Cooling Fan", power: 288, expectedFuse: 40 }, // 288W/12V = 24A × 1.25 = 30A → 40A fuse
        { component: "Audio System", power: 240, expectedFuse: 30 }, // 240W/12V = 20A × 1.25 = 25A → 30A fuse
      ];

      scenarios.forEach(({ power, expectedFuse }) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: power,
          systemVoltage: 12,
          applicationType: "automotive",
          dutyCycle: "continuous",
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBe(expectedFuse);
      });
    });

    it("should handle 24V commercial vehicle electrical system", () => {
      const scenarios = [
        { component: "LED Work Lights", power: 192, expectedFuse: 15 },
        { component: "Cab Systems", power: 288, expectedFuse: 20 },
        { component: "Hydraulic Pump", power: 720, expectedFuse: 50 },
      ];

      scenarios.forEach(({ power, expectedFuse }) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: power,
          systemVoltage: 24,
          applicationType: "automotive",
          dutyCycle: "continuous",
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBe(expectedFuse);
      });
    });

    it("should handle 48V hybrid vehicle electrical system", () => {
      const scenarios = [
        { component: "Auxiliary Systems", power: 240, expectedFuse: 7.5 }, // 240W/48V = 5A × 1.20 = 6A → 7.5A fuse
        { component: "Electric Heater", power: 1200, expectedFuse: 30 }, // 1200W/48V = 25A × 1.20 = 30A → 30A fuse
        { component: "High-Power Audio", power: 960, expectedFuse: 25 }, // 960W/48V = 20A × 1.20 = 24A → 25A fuse
      ];

      scenarios.forEach(({ power, expectedFuse }) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: power,
          systemVoltage: 48,
          applicationType: "automotive",
          dutyCycle: "continuous",
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBe(expectedFuse);
      });
    });

    it("should handle marine electrical systems", () => {
      const scenarios = [
        {
          component: "Navigation Lights",
          power: 96,
          voltage: 12,
          expectedFuse: 15,
        },
        { component: "Bilge Pump", power: 180, voltage: 12, expectedFuse: 25 },
        {
          component: "Cabin Lighting",
          power: 144,
          voltage: 24,
          expectedFuse: 10,
        },
      ];

      scenarios.forEach(({ power, voltage, expectedFuse }) => {
        const input: DCBreakerCalculationInput = {
          inputMethod: "power",
          loadPower: power,
          systemVoltage: voltage,
          applicationType: "marine",
          dutyCycle: "continuous",
          wireStandard: "NEC",
        };

        const result = calculateDCBreakerSize(input);

        expect(result.standard).toBe("ISO8820-3");
        expect(result.recommendedBreakerRating).toBe(expectedFuse);
      });
    });
  });
});
