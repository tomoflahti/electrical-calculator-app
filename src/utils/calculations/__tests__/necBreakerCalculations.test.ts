/**
 * NEC DC Breaker Calculation Engine Tests
 * Tests pure NEC/Imperial standards implementation
 */

import { calculateNECBreakerSize } from '../necBreakerCalculations';
import type { DCBreakerCalculationInput } from '../../../types/standards';

describe('NEC DC Breaker Calculation Engine', () => {
  describe('Current-Based Calculations', () => {
    it('should calculate breaker size for automotive application with NEC standards', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.recommendedBreakerRating).toBe(25);
      expect(result.standard).toMatch(/UL489|SAE/);
      expect(result.safetyFactor).toBe(1.25); // NEC automotive continuous
      expect(result.adjustedCurrent).toBe(25); // 20 × 1.25
      expect(result.calculationMethod).toContain('NEC safety factor (1.25)');
    });

    it('should handle intermittent duty cycle with lower safety factor', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'intermittent',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.safetyFactor).toBe(1.15); // NEC automotive intermittent
      expect(result.adjustedCurrent).toBe(23); // 20 × 1.15
    });

    it('should apply NEC marine safety factors', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 25,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.safetyFactor).toBe(1.30); // NEC marine continuous
      expect(result.adjustedCurrent).toBe(32.5); // 25 × 1.30
      expect(result.standard).toMatch(/UL489|ABYC/);
    });
  });

  describe('Solar NEC 690.8(A) Calculations', () => {
    it('should apply NEC 690.8(A) factor for solar applications', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'solar',
        dutyCycle: 'continuous',
        shortCircuitCurrent: 15,
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.adjustedCurrent).toBe(23.4); // 15 × 1.56 (NEC 690.8(A))
      expect(result.calculationMethod).toContain('NEC 690.8(A) factor (1.56)');
    });

    it('should calculate from panel specifications with NEC factors', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 10,
        applicationType: 'solar',
        dutyCycle: 'continuous',
        panelIsc: 9.5,
        numberOfPanels: 2,
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.adjustedCurrent).toBe(29.64); // (9.5 × 2) × 1.56
      expect(result.calculationMethod).toContain('Panel ISC (9.5A) × Panels (2) × NEC 690.8(A) factor (1.56)');
    });
  });

  describe('Power-Based Calculations', () => {
    it('should calculate breaker size from power and voltage with NEC standards', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 2400,
        systemVoltage: 24,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      // Current = 2400W / 24V = 100A, then × 1.30 (marine factor) = 130A
      expect(result.powerAnalysis?.calculatedCurrent).toBeCloseTo(103.09, 1); // Including efficiency factor
      expect(result.adjustedCurrent).toBeCloseTo(134.02, 1); // 103.09 × 1.30
      expect(result.recommendedBreakerRating).toBe(150);
    });

    it('should include power analysis in results', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 1200,
        systemVoltage: 48,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

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
        ambientTemperature: 30,
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.temperatureDerating).toBeUndefined();
    });

    it('should apply NEC temperature derating for high temperatures', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        ambientTemperature: 50,
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.temperatureDerating).toBeLessThan(1.0);
      expect(result.calculationMethod).toContain('NEC temperature derating');
    });
  });

  describe('Environmental Factors', () => {
    it('should apply ABYC marine environment factor', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 20,
        applicationType: 'marine',
        dutyCycle: 'continuous',
        environment: 'marine',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.calculationMethod).toContain('ABYC marine factor (1.05)');
    });
  });

  describe('Battery Applications', () => {
    it('should apply NEC battery inrush factor for continuous operation', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 50,
        applicationType: 'battery',
        dutyCycle: 'continuous',
        continuousOperation: true,
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.calculationMethod).toContain('NEC battery inrush factor (1.1)');
    });
  });

  describe('Standards Compliance', () => {
    it('should check NEC standard compliance', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.compliance.standardCompliant).toBe(true);
      expect(result.compliance.applicationCompliant).toBe(true);
    });

    it('should check AWG wire compatibility', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 15,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireGauge: '12', // 12 AWG = 25A capacity
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.compliance.wireCompatible).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for missing breaker specification', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 2000, // Very high current
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      expect(() => calculateNECBreakerSize(input)).toThrow('No suitable NEC breaker found');
    });

    it('should handle missing required power input fields', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'power',
        loadPower: 1000,
        // Missing systemVoltage
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      expect(() => calculateNECBreakerSize(input)).toThrow('Invalid input method or missing required parameters');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum current values', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 0.5,
        applicationType: 'led',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.recommendedBreakerRating).toBeGreaterThan(0);
      expect(result.recommendedBreakerRating).toBeLessThanOrEqual(10);
    });

    it('should handle high current automotive systems', () => {
      const input: DCBreakerCalculationInput = {
        inputMethod: 'current',
        loadCurrent: 100,
        applicationType: 'automotive',
        dutyCycle: 'continuous',
        wireStandard: 'NEC'
      };

      const result = calculateNECBreakerSize(input);

      expect(result.adjustedCurrent).toBe(125); // 100 × 1.25
      expect(result.recommendedBreakerRating).toBe(125);
    });
  });
});