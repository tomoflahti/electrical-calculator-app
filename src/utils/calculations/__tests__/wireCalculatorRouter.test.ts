/**
 * Wire Calculator Router Tests
 * Comprehensive tests for the wire calculation router system
 * Tests all standards: NEC, IEC, BS7671, and DC
 */

import { 
  calculateWireSize, 
  validateWireCalculationInput, 
  isDCStandard, 
  getStandardDefaults, 
  getVoltageDropLimits,
  type WireCalculationInput
} from '../wireCalculatorRouter';

describe('Wire Calculator Router', () => {
  describe('Router Function', () => {
    test('should route to NEC calculation engine', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper',
        temperatureRating: 75
      };

      const result = calculateWireSize(input);
      
      expect(result).toBeDefined();
      expect(result.calculationMetadata.standardUsed).toBe('NEC');
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
    });

    test('should route to IEC calculation engine', () => {
      const input: WireCalculationInput = {
        standard: 'IEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'A1',
        conductorMaterial: 'copper'
      };

      const result = calculateWireSize(input);
      
      expect(result).toBeDefined();
      expect(result.calculationMetadata.standardUsed).toBe('IEC');
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
    });

    test('should route to BS7671 calculation engine', () => {
      const input: WireCalculationInput = {
        standard: 'BS7671',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'A1',
        conductorMaterial: 'copper'
      };

      const result = calculateWireSize(input);
      
      expect(result).toBeDefined();
      expect(result.calculationMetadata.standardUsed).toBe('BS7671');
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
    });

    test('should route to DC calculation engine', () => {
      const input: WireCalculationInput = {
        standard: 'DC_AUTOMOTIVE',
        loadCurrent: 10,
        circuitLength: 20,
        voltage: 12,
        voltageSystem: 'dc',
        installationMethod: 'automotive',
        conductorMaterial: 'copper',
        dcVoltageSystem: '12V',
        dcApplicationType: 'automotive'
      };

      const result = calculateWireSize(input);
      
      expect(result).toBeDefined();
      expect(result.calculationMetadata.standardUsed).toBe('DC_AUTOMOTIVE');
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
    });

    test('should throw error for unsupported standard', () => {
      const input: WireCalculationInput = {
        standard: 'INVALID_STANDARD' as any,
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper'
      };

      expect(() => calculateWireSize(input)).toThrow('Unsupported electrical standard');
    });
  });

  describe('Input Validation', () => {
    test('should pass validation for valid NEC input', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors).toHaveLength(0);
    });

    test('should pass validation for valid IEC input', () => {
      const input: WireCalculationInput = {
        standard: 'IEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'A1',
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors).toHaveLength(0);
    });

    test('should pass validation for valid DC input', () => {
      const input: WireCalculationInput = {
        standard: 'DC_AUTOMOTIVE',
        loadCurrent: 10,
        circuitLength: 20,
        voltage: 12,
        voltageSystem: 'dc',
        installationMethod: 'automotive',
        conductorMaterial: 'copper',
        dcVoltageSystem: '12V',
        dcApplicationType: 'automotive'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation for missing required fields', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 0, // Invalid
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Load current must be greater than 0');
    });

    test('should fail validation for out-of-range values', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper',
        ambientTemperature: 250 // Invalid
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Ambient temperature must be between');
    });

    test('should fail validation for invalid NEC installation method', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'A1', // Invalid for NEC
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Invalid NEC installation method');
    });

    test('should fail validation for invalid IEC installation method', () => {
      const input: WireCalculationInput = {
        standard: 'IEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'conduit', // Invalid for IEC
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Invalid IEC installation method');
    });

    test('should fail validation for DC input without required DC fields', () => {
      const input: WireCalculationInput = {
        standard: 'DC_AUTOMOTIVE',
        loadCurrent: 10,
        circuitLength: 20,
        voltage: 12,
        voltageSystem: 'dc',
        installationMethod: 'automotive',
        conductorMaterial: 'copper'
        // Missing dcVoltageSystem and dcApplicationType
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('DC voltage system must be specified'))).toBe(true);
      expect(errors.some(e => e.includes('DC application type must be specified'))).toBe(true);
    });
  });

  describe('DC Standard Detection', () => {
    test('should correctly identify DC standards', () => {
      expect(isDCStandard('DC_AUTOMOTIVE')).toBe(true);
      expect(isDCStandard('DC_MARINE')).toBe(true);
      expect(isDCStandard('DC_SOLAR')).toBe(true);
      expect(isDCStandard('DC_TELECOM')).toBe(true);
    });

    test('should correctly identify non-DC standards', () => {
      expect(isDCStandard('NEC')).toBe(false);
      expect(isDCStandard('IEC')).toBe(false);
      expect(isDCStandard('BS7671')).toBe(false);
    });
  });

  describe('Standard Defaults', () => {
    test('should provide NEC defaults', () => {
      const defaults = getStandardDefaults('NEC');
      
      expect(defaults.voltage).toBe(120);
      expect(defaults.voltageSystem).toBe('single');
      expect(defaults.installationMethod).toBe('conduit');
      expect(defaults.temperatureRating).toBe(75);
      expect(defaults.includeNECMultiplier).toBe(true);
    });

    test('should provide IEC defaults', () => {
      const defaults = getStandardDefaults('IEC');
      
      expect(defaults.voltage).toBe(230);
      expect(defaults.voltageSystem).toBe('single');
      expect(defaults.installationMethod).toBe('A1');
      expect(defaults.circuitLength).toBe(100);
    });

    test('should provide BS7671 defaults', () => {
      const defaults = getStandardDefaults('BS7671');
      
      expect(defaults.voltage).toBe(230);
      expect(defaults.voltageSystem).toBe('single');
      expect(defaults.installationMethod).toBe('A1');
      expect(defaults.circuitLength).toBe(100);
    });

    test('should provide DC automotive defaults', () => {
      const defaults = getStandardDefaults('DC_AUTOMOTIVE');
      
      expect(defaults.voltage).toBe(12);
      expect(defaults.voltageSystem).toBe('dc');
      expect(defaults.dcVoltageSystem).toBe('12V');
      expect(defaults.dcApplicationType).toBe('automotive');
      expect(defaults.installationMethod).toBe('automotive');
      expect(defaults.allowableVoltageDropPercent).toBe(2);
    });

    test('should provide DC marine defaults', () => {
      const defaults = getStandardDefaults('DC_MARINE');
      
      expect(defaults.voltage).toBe(12);
      expect(defaults.voltageSystem).toBe('dc');
      expect(defaults.dcVoltageSystem).toBe('12V');
      expect(defaults.dcApplicationType).toBe('marine');
      expect(defaults.installationMethod).toBe('marine');
      expect(defaults.allowableVoltageDropPercent).toBe(3);
    });

    test('should provide DC solar defaults', () => {
      const defaults = getStandardDefaults('DC_SOLAR');
      
      expect(defaults.voltage).toBe(24);
      expect(defaults.voltageSystem).toBe('dc');
      expect(defaults.dcVoltageSystem).toBe('24V');
      expect(defaults.dcApplicationType).toBe('solar');
      expect(defaults.installationMethod).toBe('solar_outdoor');
      expect(defaults.allowableVoltageDropPercent).toBe(2);
    });

    test('should provide DC telecom defaults', () => {
      const defaults = getStandardDefaults('DC_TELECOM');
      
      expect(defaults.voltage).toBe(48);
      expect(defaults.voltageSystem).toBe('dc');
      expect(defaults.dcVoltageSystem).toBe('48V');
      expect(defaults.dcApplicationType).toBe('telecom');
      expect(defaults.installationMethod).toBe('free_air');
      expect(defaults.allowableVoltageDropPercent).toBe(1);
    });
  });

  describe('Voltage Drop Limits', () => {
    test('should provide correct NEC voltage drop limits', () => {
      const limits = getVoltageDropLimits('NEC');
      
      expect(limits.normal).toBe(3);
      expect(limits.sensitive).toBe(2);
      expect(limits.critical).toBe(1);
    });

    test('should provide correct IEC voltage drop limits', () => {
      const limits = getVoltageDropLimits('IEC');
      
      expect(limits.normal).toBe(4);
      expect(limits.sensitive).toBe(3);
      expect(limits.critical).toBe(2);
    });

    test('should provide correct BS7671 voltage drop limits', () => {
      const limits = getVoltageDropLimits('BS7671');
      
      expect(limits.normal).toBe(4);
      expect(limits.sensitive).toBe(3);
      expect(limits.critical).toBe(2);
    });

    test('should provide correct DC automotive voltage drop limits', () => {
      const limits = getVoltageDropLimits('DC_AUTOMOTIVE');
      
      expect(limits.normal).toBe(2);
      expect(limits.sensitive).toBe(1);
      expect(limits.critical).toBe(0.5);
    });

    test('should provide correct DC marine voltage drop limits', () => {
      const limits = getVoltageDropLimits('DC_MARINE');
      
      expect(limits.normal).toBe(3);
      expect(limits.sensitive).toBe(2);
      expect(limits.critical).toBe(1);
    });

    test('should provide correct DC solar voltage drop limits', () => {
      const limits = getVoltageDropLimits('DC_SOLAR');
      
      expect(limits.normal).toBe(2);
      expect(limits.sensitive).toBe(1.5);
      expect(limits.critical).toBe(1);
    });

    test('should provide correct DC telecom voltage drop limits', () => {
      const limits = getVoltageDropLimits('DC_TELECOM');
      
      expect(limits.normal).toBe(1);
      expect(limits.sensitive).toBe(0.5);
      expect(limits.critical).toBe(0.25);
    });
  });

  describe('Result Structure', () => {
    test('should return complete result structure for NEC calculation', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 20,
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper',
        temperatureRating: 75
      };

      const result = calculateWireSize(input);
      
      // Check main result fields
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
      expect(result.voltageDropPercent).toBeGreaterThan(0);
      expect(result.voltageDropVolts).toBeGreaterThan(0);
      expect(result.powerLossWatts).toBeGreaterThan(0);
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThan(100);
      
      // Check correction factors
      expect(result.correctionFactors).toBeDefined();
      expect(result.correctionFactors.temperature).toBeGreaterThan(0);
      expect(result.correctionFactors.grouping).toBeGreaterThan(0);
      expect(result.correctionFactors.installation).toBeGreaterThan(0);
      
      // Check compliance
      expect(result.compliance).toBeDefined();
      expect(typeof result.compliance.currentCompliant).toBe('boolean');
      expect(typeof result.compliance.voltageDropCompliant).toBe('boolean');
      expect(typeof result.compliance.standardCompliant).toBe('boolean');
      expect(typeof result.compliance.temperatureCompliant).toBe('boolean');
      expect(typeof result.compliance.installationCompliant).toBe('boolean');
      
      // Check metadata
      expect(result.calculationMetadata).toBeDefined();
      expect(result.calculationMetadata.standardUsed).toBe('NEC');
      expect(result.calculationMetadata.calculationMethod).toBeDefined();
      expect(result.calculationMetadata.voltageDropLimit).toBeDefined();
      expect(result.calculationMetadata.safetyFactors).toBeDefined();
      expect(result.calculationMetadata.assumptionsMade).toBeDefined();
      expect(result.calculationMetadata.warningsGenerated).toBeDefined();
      
      // Check alternatives
      expect(result.alternatives).toBeDefined();
      expect(Array.isArray(result.alternatives)).toBe(true);
      if (result.alternatives && result.alternatives.length > 0) {
        expect(result.alternatives[0].wireSize).toBeDefined();
        expect(result.alternatives[0].currentCapacity).toBeGreaterThan(0);
        expect(result.alternatives[0].voltageDropPercent).toBeGreaterThan(0);
        expect(typeof result.alternatives[0].isCompliant).toBe('boolean');
      }
    });

    test('should return complete result structure for DC calculation', () => {
      const input: WireCalculationInput = {
        standard: 'DC_AUTOMOTIVE',
        loadCurrent: 10,
        circuitLength: 20,
        voltage: 12,
        voltageSystem: 'dc',
        installationMethod: 'automotive',
        conductorMaterial: 'copper',
        dcVoltageSystem: '12V',
        dcApplicationType: 'automotive'
      };

      const result = calculateWireSize(input);
      
      // Check main result fields
      expect(result.recommendedWireSize).toBeDefined();
      expect(result.currentCapacity).toBeGreaterThan(0);
      expect(result.voltageDropPercent).toBeGreaterThan(0);
      expect(result.voltageDropVolts).toBeGreaterThan(0);
      
      // Check DC-specific results
      expect(result.dcSpecificResults).toBeDefined();
      if (result.dcSpecificResults) {
        expect(result.dcSpecificResults.dcApplicationType).toBe('automotive');
        expect(result.dcSpecificResults.dcVoltageSystem).toBe('12V');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle calculation errors gracefully', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 10000, // Very high current that may not have suitable wire
        circuitLength: 100,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper',
        temperatureRating: 75
      };

      expect(() => calculateWireSize(input)).toThrow();
    });

    test('should handle validation errors for multiple issues', () => {
      const input: WireCalculationInput = {
        standard: 'NEC',
        loadCurrent: 0, // Invalid
        circuitLength: 0, // Invalid
        voltage: 0, // Invalid
        voltageSystem: 'single',
        installationMethod: 'conduit',
        conductorMaterial: 'copper'
      };

      const errors = validateWireCalculationInput(input);
      expect(errors.length).toBeGreaterThan(2);
      expect(errors.some(e => e.includes('Load current'))).toBe(true);
      expect(errors.some(e => e.includes('Circuit length'))).toBe(true);
      expect(errors.some(e => e.includes('Voltage'))).toBe(true);
    });
  });
});