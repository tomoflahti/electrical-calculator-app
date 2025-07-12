/**
 * Conduit Fill Router Tests
 * Comprehensive test coverage for the central conduit fill router
 */

import { 
  calculateConduitFill,
  validateConduitFillInput,
  getApplicationRequirements,
  getInstallationMethodFactors,
  getConduitFillRecommendations,
  findOptimalConduitSize
} from '../conduitFillRouter';

import type { 
  ConduitFillCalculationInput
} from '../../../types/standards';

describe('Conduit Fill Router', () => {
  describe('calculateConduitFill', () => {
    it('should route to NEC engine when wireStandard is NEC', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const result = calculateConduitFill(input);

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('NEC');
      expect(result.recommendedConduitSize).toBeDefined();
      expect(result.fillAnalysis).toBeDefined();
      expect(result.compliance).toBeDefined();
    });

    it('should route to IEC engine when wireStandard is IEC', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'PVC',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      const result = calculateConduitFill(input);

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('IEC');
      expect(result.recommendedConduitSize).toBeDefined();
      expect(result.fillAnalysis).toBeDefined();
      expect(result.compliance).toBeDefined();
    });

    it('should default to IEC when wireStandard is not specified', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'PVC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      } as any; // Remove wireStandard to test default

      const result = calculateConduitFill(input);

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('IEC');
    });

    it('should throw error for unsupported wireStandard', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'PVC',
        wireStandard: 'INVALID' as any,
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      expect(() => calculateConduitFill(input)).toThrow('Unsupported wire standard: INVALID');
    });

    it('should throw error for invalid input', () => {
      const input: ConduitFillCalculationInput = {
        wires: [],
        conduitType: 'PVC',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      expect(() => calculateConduitFill(input)).toThrow('Input validation failed');
    });
  });

  describe('validateConduitFillInput', () => {
    it('should validate correct NEC input', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toEqual([]);
    });

    it('should validate correct IEC input', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'PVC',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toEqual([]);
    });

    it('should reject empty wire array', () => {
      const input: ConduitFillCalculationInput = {
        wires: [],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('At least one wire must be specified');
    });

    it('should reject missing conduitType', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: '',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Conduit type must be specified');
    });

    it('should reject missing applicationType', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: '' as any,
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Application type must be specified');
    });

    it('should reject missing installationMethod', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: '' as any
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Installation method must be specified');
    });

    it('should reject invalid wire quantity', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 0, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Wire 1: Quantity must be greater than 0');
    });

    it('should reject excessive wire quantity', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 1001, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Wire 1: Quantity exceeds maximum (1000)');
    });

    it('should reject invalid NEC conduit type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'INVALID',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid NEC conduit type'))).toBe(true);
    });

    it('should reject invalid IEC conduit type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'INVALID',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid IEC conduit type'))).toBe(true);
    });

    it('should reject invalid AWG wire gauge', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: 'INVALID', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid AWG gauge'))).toBe(true);
    });

    it('should reject invalid metric wire gauge', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: 'INVALID', quantity: 3, insulation: 'PVC' }
        ],
        conduitType: 'PVC',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid metric gauge'))).toBe(true);
    });

    it('should reject invalid NEC insulation type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'INVALID' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid NEC insulation type'))).toBe(true);
    });

    it('should reject invalid IEC insulation type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '2.5', quantity: 3, insulation: 'INVALID' }
        ],
        conduitType: 'PVC',
        wireStandard: 'IEC',
        applicationType: 'commercial',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid IEC insulation type'))).toBe(true);
    });

    it('should reject invalid ambient temperature', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor',
        ambientTemperature: 200
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Ambient temperature must be between -40°C and 150°C');
    });

    it('should reject invalid future fill reserve', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor',
        futureFillReserve: 60
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Future fill reserve must be between 0% and 50%');
    });

    it('should reject invalid application type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'INVALID' as any,
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid application type'))).toBe(true);
    });

    it('should reject invalid installation method', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'INVALID' as any
      };

      const errors = validateConduitFillInput(input);
      expect(errors.some(err => err.includes('Invalid installation method'))).toBe(true);
    });
  });

  describe('getApplicationRequirements', () => {
    it('should return requirements for residential application', () => {
      const requirements = getApplicationRequirements('residential', 'NEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toBeInstanceOf(Array);
      expect(requirements.recommendedPractices).toBeInstanceOf(Array);
      expect(requirements.specialRequirements).toContain('NEC 314.16 box fill');
    });

    it('should return requirements for commercial application', () => {
      const requirements = getApplicationRequirements('commercial', 'NEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toContain('NEC 314.28 pull box sizing');
    });

    it('should return requirements for industrial application', () => {
      const requirements = getApplicationRequirements('industrial', 'NEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toContain('NEMA 4X in corrosive environments');
    });

    it('should return requirements for hazardous application', () => {
      const requirements = getApplicationRequirements('hazardous', 'NEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toContain('NEC 500-516 hazardous locations');
    });

    it('should return IEC requirements for residential application', () => {
      const requirements = getApplicationRequirements('residential', 'IEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toBeInstanceOf(Array);
      expect(requirements.specialRequirements).toContain('IEC 60364-5-51 equipment selection');
      expect(requirements.temperatureRange).toBeDefined();
      expect(requirements.complianceStandards).toContain('IEC 60364-5-52');
    });

    it('should return IEC requirements for data center application', () => {
      const requirements = getApplicationRequirements('data_center', 'IEC');
      
      expect(requirements).toBeDefined();
      expect(requirements.specialRequirements).toContain('IEC 62040 UPS systems');
      expect(requirements.temperatureRange.min).toBe(18);
      expect(requirements.temperatureRange.max).toBe(25);
    });
  });

  describe('getInstallationMethodFactors', () => {
    it('should return factors for indoor installation', () => {
      const factors = getInstallationMethodFactors('indoor');
      
      expect(factors).toBeDefined();
      expect(factors.temperatureFactor).toBe(1.0);
      expect(factors.environmentFactor).toBe(1.0);
      expect(factors.specialConsiderations).toBeInstanceOf(Array);
    });

    it('should return factors for outdoor installation', () => {
      const factors = getInstallationMethodFactors('outdoor');
      
      expect(factors).toBeDefined();
      expect(factors.temperatureFactor).toBe(1.1);
      expect(factors.environmentFactor).toBe(1.15);
      expect(factors.specialConsiderations).toContain('Weatherproofing');
    });

    it('should return factors for underground installation', () => {
      const factors = getInstallationMethodFactors('underground');
      
      expect(factors).toBeDefined();
      expect(factors.temperatureFactor).toBe(1.0);
      expect(factors.environmentFactor).toBe(1.0);
      expect(factors.specialConsiderations).toContain('Concrete encasement');
    });

    it('should return factors for hazardous installation', () => {
      const factors = getInstallationMethodFactors('hazardous');
      
      expect(factors).toBeDefined();
      expect(factors.temperatureFactor).toBe(1.05);
      expect(factors.environmentFactor).toBe(1.2);
      expect(factors.specialConsiderations).toContain('Explosion-proof');
    });
  });

  describe('getConduitFillRecommendations', () => {
    it('should return recommendations for multiple wire configurations', () => {
      const wireConfigurations = [
        { gauge: '12', quantity: 3, insulation: 'THWN' },
        { gauge: '14', quantity: 2, insulation: 'THWN' }
      ];

      const recommendations = getConduitFillRecommendations(
        wireConfigurations,
        'EMT',
        'residential',
        'indoor',
        'NEC'
      );

      expect(recommendations).toHaveLength(2);
      recommendations.forEach(rec => {
        expect(rec.wireStandard).toBe('NEC');
        expect(rec.recommendedConduitSize).toBeDefined();
        expect(rec.fillAnalysis).toBeDefined();
      });
    });

    it('should use default installation method and wire standard', () => {
      const wireConfigurations = [
        { gauge: '2.5', quantity: 3, insulation: 'PVC' }
      ];

      const recommendations = getConduitFillRecommendations(
        wireConfigurations,
        'PVC',
        'commercial'
      );

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].wireStandard).toBe('IEC');
      expect(recommendations[0].applicationData.installationMethod).toBe('indoor');
    });
  });

  describe('findOptimalConduitSize', () => {
    it('should find optimal conduit size for mixed wire configurations', () => {
      const wireConfigurations = [
        { gauge: '12', quantity: 3, insulation: 'THWN' },
        { gauge: '14', quantity: 2, insulation: 'THWN' }
      ];

      const result = findOptimalConduitSize(
        wireConfigurations,
        'EMT',
        'residential',
        'NEC'
      );

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('NEC');
      expect(result.recommendedConduitSize).toBeDefined();
      expect(result.fillAnalysis).toBeDefined();
      expect(result.wireBreakdown).toHaveLength(2);
    });

    it('should find optimal conduit size for IEC wires', () => {
      const wireConfigurations = [
        { gauge: '2.5', quantity: 3, insulation: 'PVC' },
        { gauge: '1.5', quantity: 2, insulation: 'PVC' }
      ];

      const result = findOptimalConduitSize(
        wireConfigurations,
        'PVC',
        'commercial',
        'IEC'
      );

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('IEC');
      expect(result.recommendedConduitSize).toBeDefined();
      expect(result.fillAnalysis).toBeDefined();
      expect(result.wireBreakdown).toHaveLength(2);
    });

    it('should default to IEC wire standard', () => {
      const wireConfigurations = [
        { gauge: '2.5', quantity: 3, insulation: 'PVC' }
      ];

      const result = findOptimalConduitSize(
        wireConfigurations,
        'PVC',
        'commercial'
      );

      expect(result).toBeDefined();
      expect(result.wireStandard).toBe('IEC');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing wire gauge', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Wire 1: Gauge must be specified');
    });

    it('should handle missing insulation type', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: '' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toContain('Wire 1: Insulation type must be specified');
    });

    it('should handle very large wire configurations', () => {
      const wires = Array(10).fill(null).map(() => ({
        gauge: '12',
        quantity: 10,
        insulation: 'THWN'
      }));

      const input: ConduitFillCalculationInput = {
        wires,
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const result = calculateConduitFill(input);
      expect(result).toBeDefined();
      expect(result.wireBreakdown).toHaveLength(10);
    });

    it('should handle extreme ambient temperature within range', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor',
        ambientTemperature: -40
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toEqual([]);
    });

    it('should handle maximum future fill reserve', () => {
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 3, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor',
        futureFillReserve: 50
      };

      const errors = validateConduitFillInput(input);
      expect(errors).toEqual([]);
    });
  });

  describe('Performance Tests', () => {
    it('should complete calculation within reasonable time', () => {
      const startTime = Date.now();
      
      const input: ConduitFillCalculationInput = {
        wires: [
          { gauge: '12', quantity: 100, insulation: 'THWN' }
        ],
        conduitType: 'EMT',
        wireStandard: 'NEC',
        applicationType: 'residential',
        installationMethod: 'indoor'
      };

      const result = calculateConduitFill(input);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});