/**
 * IEC DC Breaker Calculation Engine Tests
 * Tests pure IEC/Metric standards implementation
 */

import { calculateIECBreakerSize } from '../iecBreakerCalculations';
import type { DCBreakerCalculationInput } from '../../../types/standards';

describe('IEC DC Breaker Calculation Engine', () => {
  describe('Current-Based Calculations', () => {
    it('should calculate breaker size for automotive application with IEC standards', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.recommendedBreakerRating).toBe(25);
      expect(result.standard).toMatch(/IEC60947|IEC60898/);
      expect(result.safetyFactor).toBe(1.25); // IEC automotive continuous
      expect(result.adjustedCurrent).toBe(25); // 20 × 1.25
      expect(result.calculationMethod).toContain('IEC safety factor (1.25)');
    });

    it('should handle intermittent duty cycle with lower safety factor', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'intermittent',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.safetyFactor).toBe(1.15); // IEC automotive intermittent
      expect(result.adjustedCurrent).toBe(23); // 20 × 1.15
    });

    it('should apply IEC marine safety factors', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 25,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.safetyFactor).toBe(1.30); // IEC marine continuous
      expect(result.adjustedCurrent).toBe(32.5); // 25 × 1.30
      expect(result.standard).toMatch(/IEC60947|IEC60898/);
    });
  });

  describe('Solar IEC 62548-1:2023 Calculations', () => {
    it('should apply IEC 62548-1:2023 factor for solar applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'solar',
        dutyCycle: 'continuous',
        shortCircuitCurrent: 15,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.adjustedCurrent).toBe(20.63); // 15 × 1.375 (IEC 62548 bifacial)
      expect(result.calculationMethod).toContain('IEC 62548-1:2023 factor (1.375 for bifacial)');
    });

    it('should calculate from panel specifications with IEC factors', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'solar',
        dutyCycle: 'continuous',
        panelIsc: 9.5,
        numberOfPanels: 2,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.adjustedCurrent).toBe(26.13); // (9.5 × 2) × 1.375
      expect(result.calculationMethod).toContain('Panel ISC (9.5A) × Panels (2) × IEC 62548-1:2023 factor (1.375 for bifacial)');
    });
  });

  describe('Power-Based Calculations', () => {
    it('should calculate breaker size from power and voltage with IEC standards', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 2400,
        systemVoltage: 24,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      // Current = 2400W / 24V = 100A, then × 1.30 (marine factor) = 130A
      expect(result.powerAnalysis?.calculatedCurrent).toBeCloseTo(103.09, 1); // Including efficiency factor
      expect(result.adjustedCurrent).toBeCloseTo(134.02, 1); // 103.09 × 1.30
      expect(result.recommendedBreakerRating).toBe(150); // Next available IEC standard size
    });

    it('should include power analysis in results', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 1200,
        systemVoltage: 48,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.powerAnalysis).toBeDefined();
      expect(result.powerAnalysis?.inputPower).toBe(1200);
      expect(result.powerAnalysis?.systemVoltage).toBe(48);
      expect(result.powerAnalysis?.calculatedCurrent).toBeCloseTo(26.88, 1); // 1200W / 48V / 0.93 efficiency
    });
  });

  describe('Temperature Derating', () => {
    it('should not apply temperature derating for normal temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        ambientTemperature: 25,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.temperatureDerating).toBeUndefined();
    });

    it('should apply IEC temperature derating for elevated temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        ambientTemperature: 40,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.temperatureDerating).toBeLessThan(1.0);
      expect(result.calculationMethod).toContain('IEC temperature derating');
    });

    it('should apply more conservative IEC derating than NEC', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        ambientTemperature: 30,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.temperatureDerating).toBeLessThan(1.0);
      expect(result.temperatureDerating).toBe(0.94); // IEC derating at 30°C
    });
  });

  describe('Environmental Factors', () => {
    it('should apply IEC marine environment factor', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        environment: 'marine',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.calculationMethod).toContain('IEC marine environment factor (1.05)');
    });
  });

  describe('Battery Applications IEC 62619:2022', () => {
    it('should apply IEC 62619 thermal runaway protection for continuous operation', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 50,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        continuousOperation: true,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.calculationMethod).toContain('IEC 62619:2022 thermal runaway factor (1.2)');
    });

    it('should prioritize IEC62619 breakers for battery applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 30,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.standard).toBe('IEC62619');
      expect(result.breakerRecommendations.primary.thermalRunawayProtection).toBe(true);
    });
  });

  describe('Standards Compliance', () => {
    it('should check IEC standard compliance', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.compliance.standardCompliant).toBe(true);
      expect(result.compliance.applicationCompliant).toBe(true);
    });

    it('should check metric wire compatibility', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireGauge: '2.5', // 2.5mm² = 25A capacity
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.compliance.wireCompatible).toBe(true);
    });

    it('should handle metric wire gauge with mm² suffix', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireGauge: '2.5mm²', // Should parse correctly
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.compliance.wireCompatible).toBe(true);
    });
  });

  describe('IEC Standard Selection', () => {
    it('should prefer IEC60947 for industrial applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 40,
        applicationType: 'industrial',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.standard).toBe('IEC60947');
    });

    it('should use IEC60898-1 for low voltage applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.standard).toMatch(/IEC60898-1|IEC60947/);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for missing breaker specification', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 2000, // Very high current
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      expect(() => calculateIECBreakerSize(input)).toThrow('No suitable IEC breaker found');
    });

    it('should handle missing required power input fields', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 1000,
        // Missing systemVoltage
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      expect(() => calculateIECBreakerSize(input)).toThrow('Invalid input method or missing required parameters');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum current values', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 0.5,
        applicationType: 'led',
        dutyCycle: 'continuous',
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.recommendedBreakerRating).toBeGreaterThan(0);
      expect(result.recommendedBreakerRating).toBeLessThanOrEqual(10);
    });

    it('should handle high current battery systems', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 80,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        continuousOperation: true,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      // 80A × 1.40 (battery factor) × 1.2 (thermal runaway) = 134.4A
      expect(result.adjustedCurrent).toBe(134.4);
      expect(result.recommendedBreakerRating).toBe(150); // Next available IEC breaker size
    });

    it('should handle extreme temperature conditions', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        ambientTemperature: 70,
        wireStandard: 'IEC'
      };

      const result = calculateIECBreakerSize(input);

      expect(result.temperatureDerating).toBeLessThan(0.5);
      expect(result.adjustedCurrent).toBeGreaterThan(50); // Significant derating
    });
  });
});