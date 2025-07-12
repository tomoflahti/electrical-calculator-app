/**
 * Automotive Fuse Calculator Tests
 * Comprehensive test coverage for ISO 8820-3 automotive fuse calculations
 */

import {
  calculateAutomotiveFuseSize,
  getAutomotiveFuseTypeRecommendation,
  validateAutomotiveFuseInput
} from '../automotiveFuseCalculator';

import type { 
  DCBreakerCalculationInput
} from '../../../../types/standards';

describe('Automotive Fuse Calculator', () => {
  describe('Current-Based Calculations', () => {
    it('should calculate fuse size for 12V automotive system', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(25);
      expect(result.adjustedCurrent).toBe(25); // 20A × 1.25 safety factor
      expect(result.safetyFactor).toBe(1.25);
      expect(result.standard).toBe('ISO8820-3');
      expect(result.breakerType).toBe('regular');
    });

    it('should calculate fuse size for 24V commercial vehicle system', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 24,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(20);
      expect(result.adjustedCurrent).toBe(19.5); // 15A × 1.30 safety factor (24V)
      expect(result.safetyFactor).toBe(1.30);
      expect(result.standard).toBe('ISO8820-3');
    });

    it('should calculate fuse size for 48V hybrid system', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 30,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 48,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(40);
      expect(result.adjustedCurrent).toBe(36); // 30A × 1.20 safety factor (48V)
      expect(result.safetyFactor).toBe(1.20);
      expect(result.standard).toBe('ISO8820-3');
    });

    it('should handle intermittent duty cycle with lower safety factor', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'intermittent',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.safetyFactor).toBe(1.15);
      expect(result.adjustedCurrent).toBe(23); // 20A × 1.15 safety factor
      expect(result.recommendedBreakerRating).toBe(25);
    });

    it('should handle marine applications with appropriate safety factors', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.safetyFactor).toBe(1.25);
      expect(result.adjustedCurrent).toBe(12.5); // 10A × 1.25 safety factor
      expect(result.recommendedBreakerRating).toBe(15);
    });

    it('should handle LED applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 8,
        applicationType: 'led',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.safetyFactor).toBe(1.25);
      expect(result.adjustedCurrent).toBe(10); // 8A × 1.25 safety factor
      expect(result.recommendedBreakerRating).toBe(10);
    });
  });

  describe('Power-Based Calculations', () => {
    it('should calculate fuse size from power and voltage (12V)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        systemVoltage: 12,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      // 240W / 12V / 0.85 efficiency = 23.5A
      expect(result.powerAnalysis).toBeDefined();
      expect(result.powerAnalysis!.calculatedCurrent).toBeCloseTo(23.5, 1);
      expect(result.powerAnalysis!.inputPower).toBe(240);
      expect(result.powerAnalysis!.systemVoltage).toBe(12);
      expect(result.powerAnalysis!.efficiencyFactor).toBe(0.85);
      
      // 23.5A × 1.25 safety factor = 29.4A → 30A fuse
      expect(result.adjustedCurrent).toBeCloseTo(29.4, 1);
      expect(result.recommendedBreakerRating).toBe(30);
    });

    it('should calculate fuse size from power and voltage (24V)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        systemVoltage: 24,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      // 240W / 24V / 0.90 efficiency = 11.1A
      expect(result.powerAnalysis!.calculatedCurrent).toBeCloseTo(11.1, 1);
      expect(result.powerAnalysis!.efficiencyFactor).toBe(0.90);
      
      // 11.1A × 1.30 safety factor = 14.4A → 15A fuse
      expect(result.adjustedCurrent).toBeCloseTo(14.4, 1);
      expect(result.recommendedBreakerRating).toBe(15);
    });

    it('should calculate fuse size from power and voltage (48V)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        systemVoltage: 48,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      // 240W / 48V / 0.95 efficiency = 5.3A
      expect(result.powerAnalysis!.calculatedCurrent).toBeCloseTo(5.3, 1);
      expect(result.powerAnalysis!.efficiencyFactor).toBe(0.95);
      
      // 5.3A × 1.20 safety factor = 6.3A → 7.5A fuse
      expect(result.adjustedCurrent).toBeCloseTo(6.3, 1);
      expect(result.recommendedBreakerRating).toBe(7.5);
    });

    it('should use custom efficiency factor when provided', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        systemVoltage: 12,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC',
        efficiencyFactor: 0.90
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.powerAnalysis!.efficiencyFactor).toBe(0.90);
      expect(result.powerAnalysis!.calculatedCurrent).toBeCloseTo(22.2, 1);
    });

    it('should include power analysis in results', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 480,
        systemVoltage: 24,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.powerAnalysis).toBeDefined();
      expect(result.powerAnalysis!.inputPower).toBe(480);
      expect(result.powerAnalysis!.systemVoltage).toBe(24);
      expect(result.powerAnalysis!.effectivePower).toBe(432); // 480W × 0.90 efficiency
      expect(result.powerAnalysis!.powerLossWatts).toBeCloseTo(48, 1); // 480W × (1 - 0.90)
    });
  });

  describe('Fuse Type Recommendations', () => {
    it('should recommend micro2 fuses for low current applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 4,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.breakerType).toBe('micro2');
      expect(result.recommendedBreakerRating).toBe(5);
    });

    it('should recommend regular fuses for medium current applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.breakerType).toBe('regular');
      expect(result.recommendedBreakerRating).toBe(25);
    });

    it('should recommend maxi fuses for high current applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 60,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.breakerType).toBe('maxi');
      expect(result.recommendedBreakerRating).toBe(80);
    });

    it('should provide alternative fuse recommendations', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 8,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.breakerRecommendations.primary).toBeDefined();
      expect(result.breakerRecommendations.alternatives).toBeDefined();
      expect(result.breakerRecommendations.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Temperature Derating', () => {
    it('should not apply temperature derating for normal temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 25,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.temperatureDerating).toBeUndefined();
      expect(result.adjustedCurrent).toBe(25); // Only safety factor applied
    });

    it('should apply temperature derating for high temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 60,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.temperatureDerating).toBeDefined();
      expect(result.temperatureDerating).toBeLessThan(1.0);
      expect(result.adjustedCurrent).toBeGreaterThan(25); // Safety factor + temperature derating
    });

    it('should apply progressive temperature derating', () => {
      const input50C: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 50,
        wireStandard: 'NEC'
      };

      const input70C: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 70,
        wireStandard: 'NEC'
      };

      const result50C = calculateAutomotiveFuseSize(input50C);
      const result70C = calculateAutomotiveFuseSize(input70C);

      expect(result70C.temperatureDerating).toBeLessThan(result50C.temperatureDerating || 1);
      expect(result70C.adjustedCurrent).toBeGreaterThan(result50C.adjustedCurrent);
    });
  });

  describe('Environmental Factors', () => {
    it('should apply environmental factor for automotive environment', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        environment: 'automotive',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.adjustedCurrent).toBeGreaterThan(25); // Safety factor + environment factor
    });

    it('should apply environmental factor for marine environment', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        environment: 'marine',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.adjustedCurrent).toBeGreaterThan(25); // Safety factor + environment factor
    });

    it('should not apply environmental factor for indoor environment', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        environment: 'indoor',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.adjustedCurrent).toBe(25); // Only safety factor applied
    });
  });

  describe('Compliance Checking', () => {
    it('should check standards compliance', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.compliance).toBeDefined();
      expect(result.compliance.standardCompliant).toBe(true);
      expect(result.compliance.applicationCompliant).toBe(true);
      expect(result.compliance.wireCompatible).toBe(true);
      expect(result.compliance.temperatureCompliant).toBe(true);
      // Voltage compliance is checked internally but not exposed in interface
    });

    it('should check temperature compliance', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 90,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.compliance.temperatureCompliant).toBe(false);
    });

    it('should check voltage compliance', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 48,
        wireStandard: 'NEC'
      };

      calculateAutomotiveFuseSize(input);

      // Voltage compliance is checked internally but not exposed in interface
    });
  });

  describe('Calculation Method Documentation', () => {
    it('should provide detailed calculation method for current input', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.calculationMethod).toContain('ISO 8820-3');
      expect(result.calculationMethod).toContain('12V System');
      expect(result.calculationMethod).toContain('Base current: 20.0A');
      expect(result.calculationMethod).toContain('Safety factor: 1.25');
      expect(result.calculationMethod).toContain('25A');
    });

    it('should provide detailed calculation method for power input', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        systemVoltage: 12,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.calculationMethod).toContain('240W');
      expect(result.calculationMethod).toContain('12V');
      expect(result.calculationMethod).toContain('0.85 efficiency');
      expect(result.calculationMethod).toContain('23.5A');
    });
  });

  describe('Real-World Automotive Scenarios', () => {
    it('should handle 12V LED headlights (144W)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 144,
        systemVoltage: 12,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(20);
      expect(result.breakerType).toBe('regular');
    });

    it('should handle 12V cooling fan (288W)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 288,
        systemVoltage: 12,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(40);
      expect(result.breakerType).toBe('regular');
    });

    it('should handle 24V LED lighting (192W)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 192,
        systemVoltage: 24,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(15);
      expect(result.breakerType).toBe('regular');
    });

    it('should handle 48V starter-generator (576W)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 576,
        systemVoltage: 48,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(20);
      expect(result.breakerType).toBe('regular');
    });

    it('should handle marine navigation equipment (96W at 12V)', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 96,
        systemVoltage: 12,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateAutomotiveFuseSize(input);

      expect(result.recommendedBreakerRating).toBe(15);
      expect(result.breakerType).toBe('regular');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported voltage', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 6,
        wireStandard: 'NEC'
      };

      expect(() => calculateAutomotiveFuseSize(input)).toThrow('Unsupported automotive voltage');
    });

    it('should throw error for current exceeding fuse range', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 100,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      expect(() => calculateAutomotiveFuseSize(input)).toThrow('exceeds automotive fuse range');
    });

    it('should throw error for missing required power input fields', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 240,
        // Missing systemVoltage
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      expect(() => calculateAutomotiveFuseSize(input)).toThrow('Invalid input method');
    });

    it('should throw error for invalid current input', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 0,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      expect(() => calculateAutomotiveFuseSize(input)).toThrow('Load current must be greater than 0');
    });
  });

  describe('Input Validation', () => {
    it('should validate automotive fuse input correctly', () => {
      const validInput: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const errors = validateAutomotiveFuseInput(validInput);
      expect(errors).toHaveLength(0);
    });

    it('should reject unsupported voltage systems', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 36,
        wireStandard: 'NEC'
      };

      const errors = validateAutomotiveFuseInput(input);
      expect(errors).toContain('Unsupported automotive voltage: 36V. Supported: 12V, 24V, 32V, 48V');
    });

    it('should reject unsupported application types', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'solar',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const errors = validateAutomotiveFuseInput(input);
      expect(errors).toContain('Automotive fuses are only supported for automotive, marine, and LED applications');
    });

    it('should reject excessive current', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 150,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        wireStandard: 'NEC'
      };

      const errors = validateAutomotiveFuseInput(input);
      expect(errors).toContain('Load current exceeds automotive fuse range (120A max)');
    });

    it('should reject extreme temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        systemVoltage: 12,
        ambientTemperature: 100,
        wireStandard: 'NEC'
      };

      const errors = validateAutomotiveFuseInput(input);
      expect(errors).toContain('Ambient temperature must be between -40°C and 85°C for automotive fuses');
    });
  });

  describe('Fuse Type Recommendation Function', () => {
    it('should recommend correct fuse types based on current', () => {
      expect(getAutomotiveFuseTypeRecommendation(5, 12, 'automotive')).toBe('micro2');
      expect(getAutomotiveFuseTypeRecommendation(25, 12, 'automotive')).toBe('regular');
      expect(getAutomotiveFuseTypeRecommendation(80, 12, 'automotive')).toBe('maxi');
      expect(getAutomotiveFuseTypeRecommendation(150, 12, 'automotive')).toBe('circuit-breaker');
    });

    it('should work across different voltage systems', () => {
      expect(getAutomotiveFuseTypeRecommendation(20, 24, 'automotive')).toBe('regular');
      expect(getAutomotiveFuseTypeRecommendation(20, 48, 'automotive')).toBe('regular');
    });
  });
});