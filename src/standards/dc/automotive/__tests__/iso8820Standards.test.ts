/**
 * ISO 8820-3 Automotive Fuse Standards Tests
 * Comprehensive test coverage for automotive fuse specifications
 */

import {
  AUTOMOTIVE_FUSE_SPECIFICATIONS,
  getAutomotiveFuseSpecifications,
  getPrimaryAutomotiveFuseRecommendation,
  getAvailableAutomotiveFuseRatings,
  getNextAutomotiveFuseRating,
  getAutomotiveFuseColor,
  type AutomotiveFuseType,
  type AutomotiveVoltage
} from '../iso8820Standards';

describe('ISO 8820-3 Automotive Fuse Standards', () => {
  describe('Fuse Database Integrity', () => {
    it('should have comprehensive fuse specifications', () => {
      expect(AUTOMOTIVE_FUSE_SPECIFICATIONS).toBeDefined();
      expect(AUTOMOTIVE_FUSE_SPECIFICATIONS.length).toBeGreaterThan(30);
    });

    it('should include all required voltage systems', () => {
      const voltages = new Set<number>();
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        fuse.voltages.forEach(v => voltages.add(v));
      });
      
      expect(voltages.has(12)).toBe(true);
      expect(voltages.has(24)).toBe(true);
      expect(voltages.has(32)).toBe(true);
      expect(voltages.has(48)).toBe(true);
    });

    it('should cover complete current range (0.5A - 120A)', () => {
      const ratings = AUTOMOTIVE_FUSE_SPECIFICATIONS.map(f => f.rating);
      
      expect(Math.min(...ratings)).toBeLessThanOrEqual(0.5);
      expect(Math.max(...ratings)).toBeGreaterThanOrEqual(120);
      
      // Check key ratings are present
      expect(ratings).toContain(0.5);
      expect(ratings).toContain(5);
      expect(ratings).toContain(10);
      expect(ratings).toContain(15);
      expect(ratings).toContain(20);
      expect(ratings).toContain(30);
      expect(ratings).toContain(40);
      expect(ratings).toContain(50);
      expect(ratings).toContain(80);
      expect(ratings).toContain(100);
      expect(ratings).toContain(120);
    });

    it('should have proper ISO 8820-3 color coding', () => {
      const colorMap = new Map<number, string>();
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        if (fuse.type === 'regular') {
          colorMap.set(fuse.rating, fuse.color);
        }
      });

      // Verify standard color coding
      expect(colorMap.get(2)).toBe('grey');
      expect(colorMap.get(3)).toBe('violet');
      expect(colorMap.get(5)).toBe('tan');
      expect(colorMap.get(7.5)).toBe('brown');
      expect(colorMap.get(10)).toBe('red');
      expect(colorMap.get(15)).toBe('blue');
      expect(colorMap.get(20)).toBe('yellow');
      expect(colorMap.get(25)).toBe('white');
      expect(colorMap.get(30)).toBe('green');
      expect(colorMap.get(40)).toBe('orange');
    });

    it('should have consistent fuse types', () => {
      const types = new Set<AutomotiveFuseType>();
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        types.add(fuse.type);
      });

      expect(types.has('regular')).toBe(true);
      expect(types.has('mini')).toBe(true);
      expect(types.has('maxi')).toBe(true);
      expect(types.has('micro2')).toBe(true);
    });

    it('should have proper temperature ranges for automotive use', () => {
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        expect(fuse.temperatureRange.min).toBeLessThanOrEqual(-40);
        expect(fuse.temperatureRange.max).toBeGreaterThanOrEqual(85);
      });
    });

    it('should have appropriate voltage ratings', () => {
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        expect(fuse.voltageRating).toBeGreaterThanOrEqual(48);
        expect(fuse.voltageRating).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('Fuse Type Specifications', () => {
    it('should have regular fuses for 0.5A to 40A range', () => {
      const regularFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(f => f.type === 'regular');
      const ratings = regularFuses.map(f => f.rating);
      
      expect(Math.min(...ratings)).toBeLessThanOrEqual(0.5);
      expect(Math.max(...ratings)).toBeGreaterThanOrEqual(40);
    });

    it('should have mini fuses for space-saving applications', () => {
      const miniFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(f => f.type === 'mini');
      const ratings = miniFuses.map(f => f.rating);
      
      expect(ratings.length).toBeGreaterThan(5);
      expect(Math.min(...ratings)).toBeLessThanOrEqual(5);
      expect(Math.max(...ratings)).toBeGreaterThanOrEqual(30);
    });

    it('should have maxi fuses for high current applications', () => {
      const maxiFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(f => f.type === 'maxi');
      const ratings = maxiFuses.map(f => f.rating);
      
      expect(ratings.length).toBeGreaterThan(8);
      expect(Math.min(...ratings)).toBeLessThanOrEqual(20);
      expect(Math.max(...ratings)).toBeGreaterThanOrEqual(120);
    });

    it('should have micro2 fuses for very compact applications', () => {
      const micro2Fuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(f => f.type === 'micro2');
      const ratings = micro2Fuses.map(f => f.rating);
      
      expect(ratings.length).toBeGreaterThan(4);
      expect(Math.min(...ratings)).toBeLessThanOrEqual(5);
      expect(Math.max(...ratings)).toBeGreaterThanOrEqual(30);
    });

    it('should have appropriate physical sizes for each type', () => {
      const regularFuse = AUTOMOTIVE_FUSE_SPECIFICATIONS.find(f => f.type === 'regular');
      const miniFuse = AUTOMOTIVE_FUSE_SPECIFICATIONS.find(f => f.type === 'mini');
      const maxiFuse = AUTOMOTIVE_FUSE_SPECIFICATIONS.find(f => f.type === 'maxi');
      const micro2Fuse = AUTOMOTIVE_FUSE_SPECIFICATIONS.find(f => f.type === 'micro2');

      // Regular fuses (ATO/ATC)
      expect(regularFuse?.physicalSize.length).toBe(19.1);
      expect(regularFuse?.physicalSize.width).toBe(5.1);

      // Mini fuses (smaller)
      expect(miniFuse?.physicalSize.length).toBe(16.3);
      expect(miniFuse?.physicalSize.width).toBe(5.1);

      // Maxi fuses (larger)
      expect(maxiFuse?.physicalSize.length).toBe(29.2);
      expect(maxiFuse?.physicalSize.width).toBe(8.5);

      // Micro2 fuses (smallest)
      expect(micro2Fuse?.physicalSize.length).toBe(15.0);
      expect(micro2Fuse?.physicalSize.width).toBe(3.6);
    });
  });

  describe('Voltage System Compatibility', () => {
    it('should support all fuses across all voltage systems', () => {
      const voltageCompatibility: Record<AutomotiveVoltage, number> = { 12: 0, 24: 0, 32: 0, 48: 0 };
      
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        fuse.voltages.forEach(voltage => {
          voltageCompatibility[voltage]++;
        });
      });

      // All voltages should have multiple fuse options
      expect(voltageCompatibility[12]).toBeGreaterThan(30);
      expect(voltageCompatibility[24]).toBeGreaterThan(30);
      expect(voltageCompatibility[32]).toBeGreaterThan(30);
      expect(voltageCompatibility[48]).toBeGreaterThan(30);
    });

    it('should have automotive application compatibility', () => {
      const automotiveFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(
        f => f.applications.includes('automotive')
      );
      
      expect(automotiveFuses.length).toBeGreaterThan(25);
    });

    it('should have marine application compatibility', () => {
      const marineFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(
        f => f.applications.includes('marine')
      );
      
      expect(marineFuses.length).toBeGreaterThan(15);
    });

    it('should have LED application compatibility', () => {
      const ledFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(
        f => f.applications.includes('led')
      );
      
      expect(ledFuses.length).toBeGreaterThan(10);
    });
  });

  describe('Fuse Selection Functions', () => {
    describe('getAutomotiveFuseSpecifications', () => {
      it('should return correct fuses for 15A automotive 12V', () => {
        const fuses = getAutomotiveFuseSpecifications(15, 12, 'automotive');
        
        expect(fuses.length).toBeGreaterThan(0);
        fuses.forEach(fuse => {
          expect(fuse.rating).toBe(15);
          expect(fuse.voltages).toContain(12);
          expect(fuse.applications).toContain('automotive');
        });
      });

      it('should return different fuse types for same rating', () => {
        const fuses = getAutomotiveFuseSpecifications(10, 12, 'automotive');
        const types = new Set(fuses.map(f => f.type));
        
        expect(types.size).toBeGreaterThan(1);
        expect(types.has('regular')).toBe(true);
      });

      it('should return empty array for non-existent combinations', () => {
        const fuses = getAutomotiveFuseSpecifications(999, 12, 'automotive');
        expect(fuses).toEqual([]);
      });

      it('should handle marine applications correctly', () => {
        const fuses = getAutomotiveFuseSpecifications(20, 24, 'marine');
        
        expect(fuses.length).toBeGreaterThan(0);
        fuses.forEach(fuse => {
          expect(fuse.applications).toContain('marine');
        });
      });
    });

    describe('getPrimaryAutomotiveFuseRecommendation', () => {
      it('should recommend micro2 for low current automotive loads', () => {
        const fuse = getPrimaryAutomotiveFuseRecommendation(5, 12, 'automotive');
        
        expect(fuse).toBeDefined();
        expect(fuse?.type).toBe('micro2');
        expect(fuse?.rating).toBe(5);
      });

      it('should recommend regular fuses for medium current loads', () => {
        const fuse = getPrimaryAutomotiveFuseRecommendation(25, 12, 'automotive');
        
        expect(fuse).toBeDefined();
        expect(fuse?.type).toBe('regular');
        expect(fuse?.rating).toBe(25);
      });

      it('should recommend maxi fuses for high current loads', () => {
        const fuse = getPrimaryAutomotiveFuseRecommendation(80, 12, 'automotive');
        
        expect(fuse).toBeDefined();
        expect(fuse?.type).toBe('maxi');
        expect(fuse?.rating).toBe(80);
      });

      it('should return null for unavailable combinations', () => {
        const fuse = getPrimaryAutomotiveFuseRecommendation(999, 12, 'automotive');
        expect(fuse).toBeNull();
      });

      it('should work across all voltage systems', () => {
        const voltages: AutomotiveVoltage[] = [12, 24, 32, 48];
        
        voltages.forEach(voltage => {
          const fuse = getPrimaryAutomotiveFuseRecommendation(15, voltage, 'automotive');
          expect(fuse).toBeDefined();
          expect(fuse?.voltages).toContain(voltage);
        });
      });
    });

    describe('getAvailableAutomotiveFuseRatings', () => {
      it('should return comprehensive rating list for 12V automotive', () => {
        const ratings = getAvailableAutomotiveFuseRatings(12, 'automotive');
        
        expect(ratings.length).toBeGreaterThan(15);
        expect(ratings).toContain(5);
        expect(ratings).toContain(10);
        expect(ratings).toContain(15);
        expect(ratings).toContain(30);
        expect(ratings).toContain(50);
        expect(ratings).toContain(80);
        expect(ratings).toContain(100);
      });

      it('should return sorted ratings', () => {
        const ratings = getAvailableAutomotiveFuseRatings(24, 'automotive');
        
        for (let i = 1; i < ratings.length; i++) {
          expect(ratings[i]).toBeGreaterThan(ratings[i - 1]);
        }
      });

      it('should vary by application type', () => {
        const automotiveRatings = getAvailableAutomotiveFuseRatings(12, 'automotive');
        const ledRatings = getAvailableAutomotiveFuseRatings(12, 'led');
        
        expect(automotiveRatings.length).toBeGreaterThanOrEqual(ledRatings.length);
      });

      it('should work for all voltage systems', () => {
        const voltages: AutomotiveVoltage[] = [12, 24, 32, 48];
        
        voltages.forEach(voltage => {
          const ratings = getAvailableAutomotiveFuseRatings(voltage, 'automotive');
          expect(ratings.length).toBeGreaterThan(10);
        });
      });
    });

    describe('getNextAutomotiveFuseRating', () => {
      it('should find exact match when available', () => {
        const rating = getNextAutomotiveFuseRating(15, 12, 'automotive');
        expect(rating).toBe(15);
      });

      it('should find next higher rating when exact match unavailable', () => {
        const rating = getNextAutomotiveFuseRating(12, 12, 'automotive');
        expect(rating).toBe(15); // Next available above 12A
      });

      it('should return null when no suitable rating exists', () => {
        const rating = getNextAutomotiveFuseRating(200, 12, 'automotive');
        expect(rating).toBeNull(); // Exceeds max automotive fuse rating
      });

      it('should handle fractional inputs correctly', () => {
        const rating = getNextAutomotiveFuseRating(7.2, 12, 'automotive');
        expect(rating).toBe(7.5);
      });

      it('should work for minimum ratings', () => {
        const rating = getNextAutomotiveFuseRating(0.3, 12, 'automotive');
        expect(rating).toBe(0.5); // Minimum automotive fuse rating
      });
    });

    describe('getAutomotiveFuseColor', () => {
      it('should return correct colors for standard ratings', () => {
        expect(getAutomotiveFuseColor(5, 'regular')).toBe('tan');
        expect(getAutomotiveFuseColor(10, 'regular')).toBe('red');
        expect(getAutomotiveFuseColor(15, 'regular')).toBe('blue');
        expect(getAutomotiveFuseColor(20, 'regular')).toBe('yellow');
        expect(getAutomotiveFuseColor(30, 'regular')).toBe('green');
      });

      it('should return same colors across fuse types for same rating', () => {
        const regularColor = getAutomotiveFuseColor(10, 'regular');
        const miniColor = getAutomotiveFuseColor(10, 'mini');
        const micro2Color = getAutomotiveFuseColor(10, 'micro2');
        
        expect(regularColor).toBe('red');
        expect(miniColor).toBe('red');
        expect(micro2Color).toBe('red');
      });

      it('should return unknown for non-existent combinations', () => {
        expect(getAutomotiveFuseColor(999, 'regular')).toBe('unknown');
      });

      it('should handle maxi fuse colors correctly', () => {
        expect(getAutomotiveFuseColor(40, 'maxi')).toBe('orange');
        expect(getAutomotiveFuseColor(50, 'maxi')).toBe('red');
        expect(getAutomotiveFuseColor(80, 'maxi')).toBe('clear');
      });
    });
  });

  describe('Standards Compliance', () => {
    it('should have ISO 8820-3 or SAE J1284 standards', () => {
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        expect(['ISO8820-3', 'SAE J1284']).toContain(fuse.standard);
      });
    });

    it('should have appropriate breaking capacity', () => {
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        expect(fuse.breakingCapacity).toBeGreaterThanOrEqual(1000);
      });
    });

    it('should have reasonable physical dimensions', () => {
      AUTOMOTIVE_FUSE_SPECIFICATIONS.forEach(fuse => {
        expect(fuse.physicalSize.length).toBeGreaterThan(10);
        expect(fuse.physicalSize.width).toBeGreaterThan(2);
        expect(fuse.physicalSize.height).toBeGreaterThan(10);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero current gracefully', () => {
      const rating = getNextAutomotiveFuseRating(0, 12, 'automotive');
      expect(rating).toBe(0.5); // Minimum fuse rating
    });

    it('should handle negative current inputs', () => {
      const rating = getNextAutomotiveFuseRating(-5, 12, 'automotive');
      expect(rating).toBe(0.5); // Should default to minimum
    });

    it('should handle unsupported applications gracefully', () => {
      const fuses = getAutomotiveFuseSpecifications(10, 12, 'unsupported' as any);
      expect(fuses).toEqual([]);
    });
  });
});