/**
 * DC Power Utilities Unit Tests
 * Comprehensive tests for power-based DC circuit calculations
 */

import {
  calculateCurrentFromPower,
  calculatePowerFromCurrent,
  getApplicationEfficiency,
  getLoadPowerFactor,
  calculateSolarArrayCurrent,
  calculateBatteryChargingCurrent,
  calculateAutomotiveAccessoryCurrent,
  validatePowerInputs,
  calculatePowerLoss,
  calculateMotorInrushCurrent,
  getRecommendedWireGauge,
  APPLICATION_EFFICIENCY_FACTORS,
  LOAD_POWER_FACTORS
} from '../dcPowerUtils';

describe('DC Power Utilities', () => {
  describe('Basic Power Calculations', () => {
    describe('calculateCurrentFromPower', () => {
      it('should calculate current correctly using Ohm\'s law', () => {
        expect(calculateCurrentFromPower(240, 12)).toBeCloseTo(20, 2);
        expect(calculateCurrentFromPower(100, 24)).toBeCloseTo(4.17, 2);
        expect(calculateCurrentFromPower(1000, 48)).toBeCloseTo(20.83, 2);
      });

      it('should account for efficiency factor', () => {
        const result = calculateCurrentFromPower(240, 12, 0.9);
        expect(result).toBeCloseTo(22.22, 2); // 240 / (12 * 0.9)
      });

      it('should account for power factor', () => {
        const result = calculateCurrentFromPower(240, 12, 1.0, 0.85);
        expect(result).toBeCloseTo(23.53, 2); // 240 / (12 * 1.0 * 0.85)
      });

      it('should account for both efficiency and power factor', () => {
        const result = calculateCurrentFromPower(240, 12, 0.9, 0.85);
        expect(result).toBeCloseTo(26.14, 2); // 240 / (12 * 0.9 * 0.85)
      });

      it('should throw error for zero or negative voltage', () => {
        expect(() => calculateCurrentFromPower(240, 0)).toThrow('Voltage must be greater than 0');
        expect(() => calculateCurrentFromPower(240, -12)).toThrow('Voltage must be greater than 0');
      });

      it('should throw error for negative power', () => {
        expect(() => calculateCurrentFromPower(-100, 12)).toThrow('Power cannot be negative');
      });

      it('should handle zero power', () => {
        expect(calculateCurrentFromPower(0, 12)).toBe(0);
      });
    });

    describe('calculatePowerFromCurrent', () => {
      it('should calculate power correctly using Ohm\'s law', () => {
        expect(calculatePowerFromCurrent(20, 12)).toBe(240);
        expect(calculatePowerFromCurrent(10, 24)).toBe(240);
        expect(calculatePowerFromCurrent(5, 48)).toBe(240);
      });

      it('should account for efficiency factor', () => {
        const result = calculatePowerFromCurrent(20, 12, 0.9);
        expect(result).toBe(216); // 20 * 12 * 0.9
      });

      it('should account for power factor', () => {
        const result = calculatePowerFromCurrent(20, 12, 1.0, 0.85);
        expect(result).toBe(204); // 20 * 12 * 1.0 * 0.85
      });

      it('should throw error for zero or negative voltage', () => {
        expect(() => calculatePowerFromCurrent(20, 0)).toThrow('Voltage must be greater than 0');
        expect(() => calculatePowerFromCurrent(20, -12)).toThrow('Voltage must be greater than 0');
      });

      it('should throw error for negative current', () => {
        expect(() => calculatePowerFromCurrent(-10, 12)).toThrow('Current cannot be negative');
      });

      it('should handle zero current', () => {
        expect(calculatePowerFromCurrent(0, 12)).toBe(0);
      });
    });
  });

  describe('Application-Specific Calculations', () => {
    describe('getApplicationEfficiency', () => {
      it('should return correct efficiency factors', () => {
        expect(getApplicationEfficiency('solar')).toBe(0.95);
        expect(getApplicationEfficiency('automotive')).toBe(0.98);
        expect(getApplicationEfficiency('marine')).toBe(0.97);
        expect(getApplicationEfficiency('telecom')).toBe(0.99);
        expect(getApplicationEfficiency('battery')).toBe(0.93);
        expect(getApplicationEfficiency('led')).toBe(0.90);
      });

      it('should return default efficiency for unknown application', () => {
        expect(getApplicationEfficiency('unknown' as any)).toBe(0.95);
      });
    });

    describe('getLoadPowerFactor', () => {
      it('should return correct power factors', () => {
        expect(getLoadPowerFactor('resistive')).toBe(1.0);
        expect(getLoadPowerFactor('motor')).toBe(0.85);
        expect(getLoadPowerFactor('switching')).toBe(0.95);
        expect(getLoadPowerFactor('battery')).toBe(1.0);
        expect(getLoadPowerFactor('led')).toBe(0.95);
        expect(getLoadPowerFactor('inverter')).toBe(0.92);
      });

      it('should be case insensitive', () => {
        expect(getLoadPowerFactor('MOTOR')).toBe(0.85);
        expect(getLoadPowerFactor('Switching')).toBe(0.95);
      });

      it('should return default power factor for unknown load type', () => {
        expect(getLoadPowerFactor('unknown')).toBe(1.0);
      });
    });

    describe('calculateSolarArrayCurrent', () => {
      it('should calculate parallel array current correctly', () => {
        const result = calculateSolarArrayCurrent(300, 10, 48, 'parallel');
        expect(result).toBeCloseTo(62.5, 1); // (300 * 10) / 48
      });

      it('should calculate series array current correctly', () => {
        const result = calculateSolarArrayCurrent(300, 10, 480, 'series');
        expect(result).toBeCloseTo(6.25, 2); // 300 / (480 / 10)
      });

      it('should default to parallel configuration', () => {
        const parallel = calculateSolarArrayCurrent(300, 10, 48, 'parallel');
        const defaultConfig = calculateSolarArrayCurrent(300, 10, 48);
        expect(parallel).toBe(defaultConfig);
      });
    });

    describe('calculateBatteryChargingCurrent', () => {
      it('should calculate charging current with default rate', () => {
        const result = calculateBatteryChargingCurrent(100, 0.1, 12);
        expect(result).toBeCloseTo(10.75, 2); // (100 * 0.1) / 0.93
      });

      it('should calculate charging current with custom rate', () => {
        const result = calculateBatteryChargingCurrent(200, 0.2, 24);
        expect(result).toBeCloseTo(43.01, 2); // (200 * 0.2) / 0.93
      });

      it('should calculate charging current with custom efficiency', () => {
        const result = calculateBatteryChargingCurrent(100, 0.1, 12, 0.95);
        expect(result).toBeCloseTo(10.53, 2); // (100 * 0.1) / 0.95
      });
    });

    describe('calculateAutomotiveAccessoryCurrent', () => {
      it('should calculate accessory current with default values', () => {
        const result = calculateAutomotiveAccessoryCurrent(240);
        expect(result).toBeCloseTo(14, 1); // (240 * 0.7) / 12
      });

      it('should calculate accessory current with custom voltage', () => {
        const result = calculateAutomotiveAccessoryCurrent(480, 24);
        expect(result).toBeCloseTo(14, 1); // (480 * 0.7) / 24
      });

      it('should calculate accessory current with custom simultaneity factor', () => {
        const result = calculateAutomotiveAccessoryCurrent(240, 12, 0.8);
        expect(result).toBe(16); // (240 * 0.8) / 12
      });
    });
  });

  describe('Power System Analysis', () => {
    describe('calculatePowerLoss', () => {
      it('should calculate power loss correctly', () => {
        const result = calculatePowerLoss(10, 0.5, 12);
        expect(result.powerLossWatts).toBe(50); // 10² * 0.5
        expect(result.voltageDrop).toBe(5); // 10 * 0.5
        expect(result.efficiency).toBeCloseTo(58.33, 2); // ((12-5)/12) * 100
      });

      it('should handle zero current', () => {
        const result = calculatePowerLoss(0, 0.5, 12);
        expect(result.powerLossWatts).toBe(0);
        expect(result.voltageDrop).toBe(0);
        expect(result.efficiency).toBe(100);
      });

      it('should handle zero resistance', () => {
        const result = calculatePowerLoss(10, 0, 12);
        expect(result.powerLossWatts).toBe(0);
        expect(result.voltageDrop).toBe(0);
        expect(result.efficiency).toBe(100);
      });
    });

    describe('calculateMotorInrushCurrent', () => {
      it('should calculate motor inrush with default values', () => {
        const result = calculateMotorInrushCurrent(1000, 12);
        // Running current: 1000 / (12 * 0.85) ≈ 98.04
        // Inrush: 98.04 * 6 ≈ 588.24
        expect(result).toBeCloseTo(588.24, 1);
      });

      it('should calculate motor inrush with custom factor', () => {
        const result = calculateMotorInrushCurrent(1000, 12, 8);
        // Running current: 1000 / (12 * 0.85) ≈ 98.04
        // Inrush: 98.04 * 8 ≈ 784.31
        expect(result).toBeCloseTo(784.31, 1);
      });

      it('should handle different voltages', () => {
        const result24V = calculateMotorInrushCurrent(1000, 24);
        const result12V = calculateMotorInrushCurrent(1000, 12);
        expect(result24V).toBeCloseTo(result12V / 2, 1);
      });
    });
  });

  describe('Wire Sizing Recommendations', () => {
    describe('getRecommendedWireGauge', () => {
      it('should recommend correct AWG sizes', () => {
        expect(getRecommendedWireGauge(10, 'NEC')).toBe('14');
        expect(getRecommendedWireGauge(18, 'NEC')).toBe('12');
        expect(getRecommendedWireGauge(25, 'NEC')).toBe('10');
        expect(getRecommendedWireGauge(35, 'NEC')).toBe('8');
        expect(getRecommendedWireGauge(50, 'NEC')).toBe('6');
        expect(getRecommendedWireGauge(65, 'NEC')).toBe('4');
        expect(getRecommendedWireGauge(90, 'NEC')).toBe('2');
        expect(getRecommendedWireGauge(105, 'NEC')).toBe('1');
        expect(getRecommendedWireGauge(120, 'NEC')).toBe('1/0');
        expect(getRecommendedWireGauge(140, 'NEC')).toBe('2/0');
        expect(getRecommendedWireGauge(160, 'NEC')).toBe('3/0');
        expect(getRecommendedWireGauge(200, 'NEC')).toBe('4/0');
      });

      it('should recommend correct metric sizes', () => {
        expect(getRecommendedWireGauge(10, 'IEC')).toBe('2.5');
        expect(getRecommendedWireGauge(18, 'IEC')).toBe('4');
        expect(getRecommendedWireGauge(25, 'IEC')).toBe('6');
        expect(getRecommendedWireGauge(35, 'IEC')).toBe('10');
        expect(getRecommendedWireGauge(50, 'IEC')).toBe('16');
        expect(getRecommendedWireGauge(65, 'IEC')).toBe('25');
        expect(getRecommendedWireGauge(90, 'IEC')).toBe('35');
        expect(getRecommendedWireGauge(105, 'IEC')).toBe('50');
        expect(getRecommendedWireGauge(120, 'IEC')).toBe('70');
        expect(getRecommendedWireGauge(140, 'IEC')).toBe('95');
        expect(getRecommendedWireGauge(160, 'IEC')).toBe('120');
        expect(getRecommendedWireGauge(200, 'IEC')).toBe('150');
      });

      it('should default to NEC standard', () => {
        const necResult = getRecommendedWireGauge(25, 'NEC');
        const defaultResult = getRecommendedWireGauge(25);
        expect(necResult).toBe(defaultResult);
      });
    });
  });

  describe('Input Validation', () => {
    describe('validatePowerInputs', () => {
      it('should pass valid inputs', () => {
        expect(validatePowerInputs(240, 12)).toEqual([]);
        expect(validatePowerInputs(1000, 24)).toEqual([]);
        expect(validatePowerInputs(24000, 48)).toEqual([]); // 500A, which is acceptable
      });

      it('should reject zero or negative power', () => {
        const errors1 = validatePowerInputs(0, 12);
        expect(errors1).toContain('Power must be greater than 0 watts');
        
        const errors2 = validatePowerInputs(-100, 12);
        expect(errors2).toContain('Power must be greater than 0 watts');
      });

      it('should reject excessive power', () => {
        const errors = validatePowerInputs(150000, 12);
        expect(errors).toContain('Power exceeds maximum supported limit (100kW)');
      });

      it('should reject zero or negative voltage', () => {
        const errors1 = validatePowerInputs(240, 0);
        expect(errors1).toContain('Voltage must be greater than 0 volts');
        
        const errors2 = validatePowerInputs(240, -12);
        expect(errors2).toContain('Voltage must be greater than 0 volts');
      });

      it('should reject excessive voltage', () => {
        const errors = validatePowerInputs(240, 1500);
        expect(errors).toContain('Voltage exceeds maximum supported limit (1000V DC)');
      });

      it('should reject unrealistic power/voltage combinations', () => {
        const errors = validatePowerInputs(50000, 5); // Would result in 10,000A
        expect(errors).toContain('Calculated current exceeds 1000A - check power and voltage values');
      });

      it('should return multiple errors for multiple issues', () => {
        const errors = validatePowerInputs(-100, -12);
        expect(errors).toHaveLength(2);
        expect(errors).toContain('Power must be greater than 0 watts');
        expect(errors).toContain('Voltage must be greater than 0 volts');
      });
    });
  });

  describe('Constants and Configuration', () => {
    describe('APPLICATION_EFFICIENCY_FACTORS', () => {
      it('should have all required application types', () => {
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('solar');
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('automotive');
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('marine');
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('telecom');
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('battery');
        expect(APPLICATION_EFFICIENCY_FACTORS).toHaveProperty('led');
      });

      it('should have realistic efficiency values', () => {
        Object.values(APPLICATION_EFFICIENCY_FACTORS).forEach(efficiency => {
          expect(efficiency).toBeGreaterThan(0);
          expect(efficiency).toBeLessThanOrEqual(1);
        });
      });
    });

    describe('LOAD_POWER_FACTORS', () => {
      it('should have all required load types', () => {
        expect(LOAD_POWER_FACTORS).toHaveProperty('resistive');
        expect(LOAD_POWER_FACTORS).toHaveProperty('motor');
        expect(LOAD_POWER_FACTORS).toHaveProperty('switching');
        expect(LOAD_POWER_FACTORS).toHaveProperty('battery');
        expect(LOAD_POWER_FACTORS).toHaveProperty('led');
        expect(LOAD_POWER_FACTORS).toHaveProperty('inverter');
      });

      it('should have realistic power factor values', () => {
        Object.values(LOAD_POWER_FACTORS).forEach(powerFactor => {
          expect(powerFactor).toBeGreaterThan(0);
          expect(powerFactor).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle very small power values', () => {
      const result = calculateCurrentFromPower(0.1, 12);
      expect(result).toBeCloseTo(0.0083, 4);
    });

    it('should handle very small voltage values', () => {
      const result = calculateCurrentFromPower(240, 0.1);
      expect(result).toBe(2400);
    });

    it('should handle very large power values within limits', () => {
      const result = calculateCurrentFromPower(99999, 1000);
      expect(result).toBeCloseTo(99.999, 3);
    });

    it('should maintain precision for small efficiency factors', () => {
      const result = calculateCurrentFromPower(240, 12, 0.01);
      expect(result).toBe(2000);
    });

    it('should maintain precision for small power factors', () => {
      const result = calculateCurrentFromPower(240, 12, 1.0, 0.01);
      expect(result).toBe(2000);
    });
  });
});