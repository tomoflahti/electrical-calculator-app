/**
 * NEC Breaker Standards Tests
 * Tests NEC/Imperial DC circuit breaker specifications
 */

import {
  getNECBreakerSpecifications,
  getPrimaryNECBreakerRecommendation,
  getAvailableNECBreakerRatings,
  NEC_BREAKER_SPECIFICATIONS
} from '../nec/necBreakerStandards';

describe('NEC Breaker Standards', () => {
  describe('getNECBreakerSpecifications', () => {
    it('should return specifications for common automotive ratings', () => {
      const specs20A = getNECBreakerSpecifications(20, 'automotive');
      const specs25A = getNECBreakerSpecifications(25, 'automotive');
      
      expect(specs20A).toBeInstanceOf(Array);
      expect(specs20A.length).toBeGreaterThan(0);
      expect(specs25A).toBeInstanceOf(Array);
      expect(specs25A.length).toBeGreaterThan(0);
    });

    it('should return breakers suitable for the application', () => {
      const automotiveSpecs = getNECBreakerSpecifications(25, 'automotive');
      
      automotiveSpecs.forEach(spec => {
        expect(spec.applications).toContain('automotive');
        expect(spec.rating).toBe(25);
      });
    });

    it('should return UL489 breakers for general applications', () => {
      const specs = getNECBreakerSpecifications(30, 'automotive');
      
      const ul489Breakers = specs.filter(spec => spec.standard === 'UL489');
      expect(ul489Breakers.length).toBeGreaterThan(0);
    });

    it('should return SAE breakers for automotive applications', () => {
      const specs = getNECBreakerSpecifications(25, 'automotive');
      
      const saeBreakers = specs.filter(spec => spec.standard === 'SAE');
      expect(saeBreakers.length).toBeGreaterThan(0);
    });

    it('should return ABYC breakers for marine applications', () => {
      const specs = getNECBreakerSpecifications(30, 'marine');
      
      const abycBreakers = specs.filter(spec => spec.standard === 'ABYC');
      expect(abycBreakers.length).toBeGreaterThan(0);
    });

    it('should return appropriate voltage ratings', () => {
      const specs = getNECBreakerSpecifications(30, 'automotive');
      
      specs.forEach(spec => {
        expect(spec.voltage).toBeGreaterThanOrEqual(12);
        expect(spec.voltage).toBeLessThanOrEqual(1000);
      });
    });

    it('should return valid specifications', () => {
      const specs = getNECBreakerSpecifications(40, 'marine');
      
      specs.forEach(spec => {
        expect(spec.rating).toBeGreaterThan(0);
        expect(spec.type).toBeDefined();
        expect(spec.standard).toBeDefined();
        expect(spec.temperatureRating).toBeGreaterThan(0);
        expect(spec.applications).toBeInstanceOf(Array);
        expect(spec.applications.length).toBeGreaterThan(0);
      });
    });

    it('should return empty array for unsupported combinations', () => {
      const specs = getNECBreakerSpecifications(2000, 'automotive');
      expect(specs).toBeInstanceOf(Array);
      expect(specs.length).toBe(0);
    });
  });

  describe('getPrimaryNECBreakerRecommendation', () => {
    it('should return primary recommendation for standard ratings', () => {
      const primary25A = getPrimaryNECBreakerRecommendation(25, 'automotive');
      const primary50A = getPrimaryNECBreakerRecommendation(50, 'marine');
      
      expect(primary25A).toBeDefined();
      expect(primary25A?.rating).toBe(25);
      expect(primary25A?.applications).toContain('automotive');
      
      expect(primary50A).toBeDefined();
      expect(primary50A?.rating).toBe(50);
      expect(primary50A?.applications).toContain('marine');
    });

    it('should prefer SAE breakers for automotive applications', () => {
      const primary = getPrimaryNECBreakerRecommendation(25, 'automotive');
      
      if (primary) {
        expect(primary.standard).toBe('SAE');
        expect(primary.applications).toContain('automotive');
      }
    });

    it('should prefer ABYC breakers for marine applications', () => {
      const primary = getPrimaryNECBreakerRecommendation(30, 'marine');
      
      if (primary) {
        expect(primary.standard).toBe('ABYC');
        expect(primary.applications).toContain('marine');
      }
    });

    it('should prefer UL489 breakers for general applications', () => {
      const primary = getPrimaryNECBreakerRecommendation(60, 'solar');
      
      if (primary) {
        expect(primary.standard).toBe('UL489');
        expect(primary.applications).toContain('solar');
      }
    });

    it('should prioritize continuous duty breakers', () => {
      const primary = getPrimaryNECBreakerRecommendation(20, 'automotive');
      
      if (primary) {
        expect(primary.continuousDuty).toBe(true);
      }
    });

    it('should return null for unsupported combinations', () => {
      const primary = getPrimaryNECBreakerRecommendation(5000, 'automotive');
      expect(primary).toBeNull();
    });

    it('should return breaker with appropriate specifications', () => {
      const primary = getPrimaryNECBreakerRecommendation(30, 'automotive');
      
      if (primary) {
        expect(primary.rating).toBe(30);
        expect(primary.type).toBeDefined();
        expect(primary.voltage).toBeGreaterThan(0);
        expect(primary.standard).toBeDefined();
        expect(typeof primary.continuousDuty).toBe('boolean');
        expect(primary.temperatureRating).toBeGreaterThan(0);
        expect(primary.applications).toContain('automotive');
        expect(primary.interruptingCapacity).toBeGreaterThan(0);
      }
    });
  });

  describe('getAvailableNECBreakerRatings', () => {
    it('should return available ratings for each application', () => {
      const applications = ['automotive', 'marine', 'solar', 'telecom', 'battery', 'led', 'industrial'];
      
      applications.forEach(app => {
        const ratings = getAvailableNECBreakerRatings(app as any);
        expect(ratings).toBeInstanceOf(Array);
        expect(ratings.length).toBeGreaterThan(0);
        
        // Ratings should be sorted
        for (let i = 1; i < ratings.length; i++) {
          expect(ratings[i]).toBeGreaterThan(ratings[i - 1]);
        }
      });
    });

    it('should include common automotive ratings', () => {
      const ratings = getAvailableNECBreakerRatings('automotive');
      const expectedCommon = [10, 15, 20, 25, 30];
      
      expectedCommon.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include common marine ratings', () => {
      const ratings = getAvailableNECBreakerRatings('marine');
      const expectedCommon = [15, 20, 30, 40, 50];
      
      expectedCommon.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include higher ratings for solar applications', () => {
      const ratings = getAvailableNECBreakerRatings('solar');
      const expectedHighRatings = [60, 80, 100, 125];
      
      expectedHighRatings.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include battery-specific ratings', () => {
      const ratings = getAvailableNECBreakerRatings('battery');
      const expectedBatteryRatings = [25, 40, 50, 60, 80, 100];
      
      expectedBatteryRatings.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });
  });

  describe('NEC_BREAKER_SPECIFICATIONS Array', () => {
    it('should contain UL489 rated breakers', () => {
      const ul489Breakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'UL489');
      expect(ul489Breakers.length).toBeGreaterThan(0);
    });

    it('should contain ABYC rated breakers for marine', () => {
      const abycBreakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'ABYC');
      expect(abycBreakers.length).toBeGreaterThan(0);
      
      abycBreakers.forEach(breaker => {
        expect(breaker.applications).toContain('marine');
      });
    });

    it('should contain SAE rated breakers for automotive', () => {
      const saeBreakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'SAE');
      expect(saeBreakers.length).toBeGreaterThan(0);
      
      saeBreakers.forEach(breaker => {
        expect(breaker.applications).toContain('automotive');
      });
    });

    it('should have valid breaker specifications', () => {
      NEC_BREAKER_SPECIFICATIONS.forEach(spec => {
        expect(spec.rating).toBeGreaterThan(0);
        expect(spec.type).toBeDefined();
        expect(spec.voltage).toBeGreaterThan(0);
        expect(spec.standard).toBeDefined();
        expect(typeof spec.continuousDuty).toBe('boolean');
        expect(spec.temperatureRating).toBeGreaterThan(0);
        expect(spec.applications).toBeInstanceOf(Array);
        expect(spec.applications.length).toBeGreaterThan(0);
        expect(spec.interruptingCapacity).toBeGreaterThan(0);
        expect(spec.tripCurve).toBeDefined();
        expect(spec.frameSize).toBeDefined();
      });
    });

    it('should have appropriate voltage ratings for applications', () => {
      const automotiveBreakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('automotive')
      );
      
      automotiveBreakers.forEach(breaker => {
        expect(breaker.voltage).toBeGreaterThanOrEqual(12);
        expect(breaker.voltage).toBeLessThanOrEqual(125);
      });
    });

    it('should have marine-appropriate environmental ratings', () => {
      const marineBreakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('marine')
      );
      
      marineBreakers.forEach(breaker => {
        expect(breaker.temperatureRating).toBeGreaterThanOrEqual(80);
      });
    });

    it('should have high interrupting capacity for solar applications', () => {
      const solarBreakers = NEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('solar')
      );
      
      solarBreakers.forEach(breaker => {
        expect(breaker.interruptingCapacity).toBeGreaterThanOrEqual(15000);
      });
    });
  });

  describe('Application-Specific Requirements', () => {
    it('should provide automotive-rated breakers with proper temperature ratings', () => {
      const automotiveSpecs = getNECBreakerSpecifications(25, 'automotive');
      
      automotiveSpecs.forEach(spec => {
        expect(spec.applications).toContain('automotive');
        expect(spec.temperatureRating).toBeGreaterThanOrEqual(80);
      });
    });

    it('should provide marine-rated breakers with corrosion resistance', () => {
      const marineSpecs = getNECBreakerSpecifications(30, 'marine');
      
      marineSpecs.forEach(spec => {
        expect(spec.applications).toContain('marine');
        expect(spec.temperatureRating).toBeGreaterThanOrEqual(80);
        expect(spec.standard).toMatch(/UL489|ABYC/);
      });
    });

    it('should provide solar-rated breakers for DC interruption', () => {
      const solarSpecs = getNECBreakerSpecifications(60, 'solar');
      
      solarSpecs.forEach(spec => {
        expect(spec.applications).toContain('solar');
        expect(spec.voltage).toBeGreaterThanOrEqual(80);
        expect(spec.interruptingCapacity).toBeGreaterThanOrEqual(15000);
      });
    });

    it('should provide battery-rated breakers for high current applications', () => {
      const batterySpecs = getNECBreakerSpecifications(100, 'battery');
      
      batterySpecs.forEach(spec => {
        expect(spec.applications).toContain('battery');
        expect(spec.interruptingCapacity).toBeGreaterThanOrEqual(15000);
        expect(spec.continuousDuty).toBe(true);
      });
    });
  });
});