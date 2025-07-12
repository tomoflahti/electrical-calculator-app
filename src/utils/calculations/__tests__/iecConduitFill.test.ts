import {
  calculateIECConduitFill,
  findRecommendedConduitSize,
  calculateSpecificConduitFill,
  getIECBundlingFactor,
  generateConduitFillComparisonData,
  getIECWireSpecifications,
  getIECConduitSpecifications
} from '../iecConduitFill';
import { CONDUIT_FILL_SCENARIOS } from '../../testData/electricalScenarios';
import type { IECConduitFillInput } from '../../../types';

describe('IEC Conduit Fill Calculations', () => {
  describe('calculateIECConduitFill', () => {
    it('should calculate conduit fill for simple configuration', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '2.5', count: 3, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      // Check that results are sorted by conduit size
      for (let i = 1; i < results.length; i++) {
        expect(parseFloat(results[i].conduitSize)).toBeGreaterThanOrEqual(
          parseFloat(results[i-1].conduitSize)
        );
      }
    });

    it('should calculate fill percentages correctly', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '4', count: 3, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);
      
      results.forEach(result => {
        expect(result.fillPercent).toBeGreaterThanOrEqual(0);
        expect(result.fillPercent).toBeLessThanOrEqual(100);
        expect(result.usedArea).toBeGreaterThan(0);
        expect(result.availableArea).toBeGreaterThan(0);
      });
    });

    it('should handle mixed wire types and sizes', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '4', count: 2, insulationType: 'PVC' as const },
          { gauge: '2.5', count: 4, insulationType: 'XLPE' as const },
          { gauge: '1.5', count: 3, insulationType: 'PVC' as const }
        ],
        conduitType: 'Steel'
      };

      const results = calculateIECConduitFill(input);

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      
      // Check wire breakdown
      results.forEach(result => {
        expect(result.wireBreakdown).toBeDefined();
        expect(result.wireBreakdown.length).toBe(3);
        
        let totalPercentage = 0;
        result.wireBreakdown.forEach(wire => {
          expect(wire.gauge).toBeDefined();
          expect(wire.count).toBeGreaterThan(0);
          expect(wire.totalArea).toBeGreaterThan(0);
          expect(wire.percentage).toBeGreaterThan(0);
          totalPercentage += wire.percentage;
        });
        
        expect(totalPercentage).toBeCloseTo(100, 1);
      });
    });

    it('should respect conduit fill percentage limits', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '6', count: 1, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);
      
      const compliantResults = results.filter(r => r.isCompliant);
      
      compliantResults.forEach(result => {
        if (result.actualWires === 1) {
          expect(result.fillPercent).toBeLessThanOrEqual(53);
        } else if (result.actualWires === 2) {
          expect(result.fillPercent).toBeLessThanOrEqual(31);
        } else {
          expect(result.fillPercent).toBeLessThanOrEqual(40);
        }
      });
    });
  });

  describe('findRecommendedConduitSize', () => {
    it('should find smallest compliant conduit', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '2.5', count: 3, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const recommended = findRecommendedConduitSize(input);

      expect(recommended).toBeDefined();
      expect(recommended?.isCompliant).toBe(true);
      
      // Verify it's the smallest compliant size
      const allResults = calculateIECConduitFill(input);
      const compliantResults = allResults.filter(r => r.isCompliant);
      
      if (compliantResults.length > 0) {
        expect(recommended?.conduitSize).toBe(compliantResults[0].conduitSize);
      }
    });

    it('should return null when no compliant size exists', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '120', count: 50, insulationType: 'PVC' as const } // Truly impossible to fit
        ],
        conduitType: 'PVC'
      };

      const recommended = findRecommendedConduitSize(input);
      expect(recommended).toBeNull();
    });
  });

  describe('calculateSpecificConduitFill', () => {
    it('should calculate fill for specific conduit size', () => {
      const wires = [
        { gauge: '4', count: 3, insulationType: 'PVC' as const }
      ];

      const result = calculateSpecificConduitFill('25', 'PVC', wires);

      expect(result).toBeDefined();
      expect(result?.conduitSize).toBe('25');
      expect(result?.fillPercent).toBeGreaterThan(0);
      expect(result?.wireBreakdown.length).toBe(1);
    });

    it('should return null for invalid conduit size', () => {
      const wires = [
        { gauge: '4', count: 3, insulationType: 'PVC' as const }
      ];

      const result = calculateSpecificConduitFill('999', 'PVC', wires);
      expect(result).toBeNull();
    });
  });

  describe('getIECBundlingFactor', () => {
    it('should return correct bundling factors', () => {
      expect(getIECBundlingFactor(1)).toBe(1.00);
      expect(getIECBundlingFactor(2)).toBe(0.80);
      expect(getIECBundlingFactor(3)).toBe(0.70);
      expect(getIECBundlingFactor(10)).toBe(0.48);
      expect(getIECBundlingFactor(20)).toBe(0.38);
      expect(getIECBundlingFactor(25)).toBe(0.38); // Should use 20-cable factor
    });
  });

  describe('generateConduitFillComparisonData', () => {
    it('should generate comparison data for all conduit sizes', () => {
      const wires = [
        { gauge: '4', count: 3, insulationType: 'PVC' as const }
      ];

      const data = generateConduitFillComparisonData(wires, 'PVC');

      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      data.forEach(item => {
        expect(item.conduitSize).toBeDefined();
        expect(item.fillPercent).toBeGreaterThanOrEqual(0);
        expect(item.maxFillPercent).toBeGreaterThan(0);
        expect(typeof item.isCompliant).toBe('boolean');
        expect(item.availableArea).toBeGreaterThan(0);
        expect(item.usedArea).toBeGreaterThan(0);
      });
    });

    it('should cap fill percentage at 100%', () => {
      const wires = [
        { gauge: '50', count: 10, insulationType: 'PVC' as const } // Large wires
      ];

      const data = generateConduitFillComparisonData(wires, 'PVC');

      data.forEach(item => {
        expect(item.fillPercent).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getIECWireSpecifications', () => {
    it('should return PVC wire specifications', () => {
      const specs = getIECWireSpecifications('PVC');

      expect(specs).toBeDefined();
      expect(Array.isArray(specs)).toBe(true);
      expect(specs.length).toBeGreaterThan(0);

      specs.forEach(spec => {
        expect(spec.gauge).toBeDefined();
        expect(spec.totalArea).toBeGreaterThan(0);
        expect(spec.insulationType).toBe('PVC');
      });
    });

    it('should return XLPE wire specifications', () => {
      const specs = getIECWireSpecifications('XLPE');

      expect(specs).toBeDefined();
      expect(Array.isArray(specs)).toBe(true);
      expect(specs.length).toBeGreaterThan(0);

      specs.forEach(spec => {
        expect(spec.gauge).toBeDefined();
        expect(spec.totalArea).toBeGreaterThan(0);
        expect(spec.insulationType).toBe('XLPE');
      });
    });

    it('should default to PVC when no type specified', () => {
      const defaultSpecs = getIECWireSpecifications();
      const pvcSpecs = getIECWireSpecifications('PVC');

      expect(defaultSpecs).toEqual(pvcSpecs);
    });
  });

  describe('getIECConduitSpecifications', () => {
    it('should return all conduit specifications when no type specified', () => {
      const specs = getIECConduitSpecifications();

      expect(specs).toBeDefined();
      expect(Array.isArray(specs)).toBe(true);
      expect(specs.length).toBeGreaterThan(0);

      // Should include both PVC and Steel
      const pvcSpecs = specs.filter(s => s.type === 'PVC');
      const steelSpecs = specs.filter(s => s.type === 'Steel');
      
      expect(pvcSpecs.length).toBeGreaterThan(0);
      expect(steelSpecs.length).toBeGreaterThan(0);
    });

    it('should filter by conduit type', () => {
      const pvcSpecs = getIECConduitSpecifications('PVC');
      const steelSpecs = getIECConduitSpecifications('Steel');

      expect(pvcSpecs.every(s => s.type === 'PVC')).toBe(true);
      expect(steelSpecs.every(s => s.type === 'Steel')).toBe(true);
    });
  });

  describe('Test Scenarios Validation', () => {
    it('should pass all predefined conduit fill test scenarios', () => {
      CONDUIT_FILL_SCENARIOS.forEach(scenario => {
        const input: IECConduitFillInput = {
          wires: scenario.wires,
          conduitType: scenario.conduitType
        };

        const recommended = findRecommendedConduitSize(input);

        if (scenario.expectedResults.isCompliant) {
          expect(recommended).toBeDefined();
          expect(recommended?.conduitSize).toBe(scenario.expectedResults.minimumConduitSize);
          expect(recommended?.fillPercent).toBeCloseTo(
            scenario.expectedResults.fillPercent,
            1 // Allow 1 decimal place precision
          );
        } else {
          // For non-compliant scenarios, check that no compliant size exists
          // or that the suggested size exceeds normal conduit sizes
          const results = calculateIECConduitFill(input);
          const compliantResults = results.filter(r => r.isCompliant);
          expect(compliantResults.length).toBe(0);
        }
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty wire array', () => {
      const input: IECConduitFillInput = {
        wires: [],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      
      // All conduits should be compliant with no wires
      results.forEach(result => {
        expect(result.fillPercent).toBe(0);
        expect(result.isCompliant).toBe(true);
      });
    });

    it('should handle single wire', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '4', count: 1, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);
      
      // Should use single-cable fill limit (53%)
      const compliantResults = results.filter(r => r.isCompliant);
      compliantResults.forEach(result => {
        expect(result.fillPercent).toBeLessThanOrEqual(53);
      });
    });

    it('should handle invalid wire gauge gracefully', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: 'invalid', count: 1, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      // Should not throw, but may return default calculations
      expect(() => calculateIECConduitFill(input)).not.toThrow();
    });

    it('should handle zero wire count', () => {
      const input: IECConduitFillInput = {
        wires: [
          { gauge: '4', count: 0, insulationType: 'PVC' as const }
        ],
        conduitType: 'PVC'
      };

      const results = calculateIECConduitFill(input);
      expect(results).toBeDefined();
      
      results.forEach(result => {
        expect(result.actualWires).toBe(0);
        expect(result.fillPercent).toBe(0);
        expect(result.isCompliant).toBe(true);
      });
    });
  });
});