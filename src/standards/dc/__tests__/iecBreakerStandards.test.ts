/**
 * IEC Breaker Standards Tests
 * Tests IEC/Metric DC circuit breaker specifications
 */

import {
  getIECBreakerSpecifications,
  getPrimaryIECBreakerRecommendation,
  getAvailableIECBreakerRatings,
  IEC_BREAKER_SPECIFICATIONS
} from '../iec/iecBreakerStandards';

describe('IEC Breaker Standards', () => {
  describe('getIECBreakerSpecifications', () => {
    it('should return specifications for common automotive ratings', () => {
      const specs20A = getIECBreakerSpecifications(20, 'automotive');
      const specs25A = getIECBreakerSpecifications(25, 'automotive');
      
      expect(specs20A).toBeInstanceOf(Array);
      expect(specs20A.length).toBeGreaterThan(0);
      expect(specs25A).toBeInstanceOf(Array);
      expect(specs25A.length).toBeGreaterThan(0);
    });

    it('should return breakers suitable for the application', () => {
      const automotiveSpecs = getIECBreakerSpecifications(25, 'automotive');
      
      automotiveSpecs.forEach(spec => {
        expect(spec.applications).toContain('automotive');
        expect(spec.rating).toBe(25);
      });
    });

    it('should return IEC60947 breakers for industrial applications', () => {
      const specs = getIECBreakerSpecifications(32, 'industrial');
      
      const iec60947Breakers = specs.filter(spec => spec.standard === 'IEC60947');
      expect(iec60947Breakers.length).toBeGreaterThan(0);
    });

    it('should return IEC62619 breakers for battery applications', () => {
      const specs = getIECBreakerSpecifications(50, 'battery');
      
      const iec62619Breakers = specs.filter(spec => spec.standard === 'IEC62619');
      expect(iec62619Breakers.length).toBeGreaterThan(0);
      
      iec62619Breakers.forEach(breaker => {
        expect(breaker.thermalRunawayProtection).toBe(true);
      });
    });

    it('should return IEC60898 breakers for low voltage applications', () => {
      const specs = getIECBreakerSpecifications(16, 'automotive');
      
      const iec60898Breakers = specs.filter(spec => spec.standard.includes('IEC60898'));
      expect(iec60898Breakers.length).toBeGreaterThan(0);
    });

    it('should return appropriate voltage ratings', () => {
      const specs = getIECBreakerSpecifications(32, 'automotive');
      
      specs.forEach(spec => {
        expect(spec.voltage).toBeGreaterThanOrEqual(12);
        expect(spec.voltage).toBeLessThanOrEqual(1000);
      });
    });

    it('should return valid specifications', () => {
      const specs = getIECBreakerSpecifications(40, 'marine');
      
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
      const specs = getIECBreakerSpecifications(2000, 'automotive');
      expect(specs).toBeInstanceOf(Array);
      expect(specs.length).toBe(0);
    });
  });

  describe('getPrimaryIECBreakerRecommendation', () => {
    it('should return primary recommendation for standard ratings', () => {
      const primary25A = getPrimaryIECBreakerRecommendation(25, 'automotive');
      const primary50A = getPrimaryIECBreakerRecommendation(50, 'marine');
      
      expect(primary25A).toBeDefined();
      expect(primary25A?.rating).toBe(25);
      expect(primary25A?.applications).toContain('automotive');
      
      expect(primary50A).toBeDefined();
      expect(primary50A?.rating).toBe(50);
      expect(primary50A?.applications).toContain('marine');
    });

    it('should prefer IEC62619 breakers for battery applications', () => {
      const primary = getPrimaryIECBreakerRecommendation(50, 'battery');
      
      if (primary) {
        expect(primary.standard).toBe('IEC62619');
        expect(primary.applications).toContain('battery');
        expect(primary.thermalRunawayProtection).toBe(true);
      }
    });

    it('should prefer IEC60947 breakers for industrial applications', () => {
      const primary = getPrimaryIECBreakerRecommendation(63, 'industrial');
      
      if (primary) {
        expect(primary.standard).toBe('IEC60947');
        expect(primary.applications).toContain('industrial');
      }
    });

    it('should prefer IEC60898-3 breakers for solar applications', () => {
      const primary = getPrimaryIECBreakerRecommendation(25, 'solar');
      
      if (primary) {
        expect(primary.standard).toMatch(/IEC60898-3|IEC60947/);
        expect(primary.applications).toContain('solar');
      }
    });

    it('should prioritize continuous duty breakers', () => {
      const primary = getPrimaryIECBreakerRecommendation(20, 'automotive');
      
      if (primary) {
        expect(primary.continuousDuty).toBe(true);
      }
    });

    it('should return null for unsupported combinations', () => {
      const primary = getPrimaryIECBreakerRecommendation(5000, 'automotive');
      expect(primary).toBeNull();
    });

    it('should return breaker with appropriate specifications', () => {
      const primary = getPrimaryIECBreakerRecommendation(32, 'automotive');
      
      if (primary) {
        expect(primary.rating).toBe(32);
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

  describe('getAvailableIECBreakerRatings', () => {
    it('should return available ratings for each application', () => {
      const applications = ['automotive', 'marine', 'solar', 'telecom', 'battery', 'led', 'industrial'];
      
      applications.forEach(app => {
        const ratings = getAvailableIECBreakerRatings(app as any);
        expect(ratings).toBeInstanceOf(Array);
        expect(ratings.length).toBeGreaterThan(0);
        
        // Ratings should be sorted
        for (let i = 1; i < ratings.length; i++) {
          expect(ratings[i]).toBeGreaterThan(ratings[i - 1]);
        }
      });
    });

    it('should include common automotive ratings', () => {
      const ratings = getAvailableIECBreakerRatings('automotive');
      const expectedCommon = [6, 10, 16, 20, 25];
      
      expectedCommon.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include common marine ratings', () => {
      const ratings = getAvailableIECBreakerRatings('marine');
      const expectedCommon = [6, 10, 16, 20, 25, 32];
      
      expectedCommon.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include higher ratings for solar applications', () => {
      const ratings = getAvailableIECBreakerRatings('solar');
      const expectedHighRatings = [40, 50, 63, 80, 100];
      
      expectedHighRatings.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include battery-specific ratings with IEC62619 compliance', () => {
      const ratings = getAvailableIECBreakerRatings('battery');
      const expectedBatteryRatings = [16, 25, 32, 50, 63, 80, 100];
      
      expectedBatteryRatings.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });

    it('should include standard IEC ratings (6, 10, 16, 20, 25, 32, 40, 50, 63)', () => {
      const ratings = getAvailableIECBreakerRatings('industrial');
      const standardIECRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63];
      
      standardIECRatings.forEach(rating => {
        expect(ratings).toContain(rating);
      });
    });
  });

  describe('IEC_BREAKER_SPECIFICATIONS Array', () => {
    it('should contain IEC60947 rated breakers', () => {
      const iec60947Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC60947');
      expect(iec60947Breakers.length).toBeGreaterThan(0);
    });

    it('should contain IEC62619 rated breakers for battery applications', () => {
      const iec62619Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC62619');
      expect(iec62619Breakers.length).toBeGreaterThan(0);
      
      iec62619Breakers.forEach(breaker => {
        expect(breaker.applications).toContain('battery');
        expect(breaker.thermalRunawayProtection).toBe(true);
      });
    });

    it('should contain IEC60898-1 rated breakers for low voltage', () => {
      const iec60898_1Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC60898-1');
      expect(iec60898_1Breakers.length).toBeGreaterThan(0);
      
      iec60898_1Breakers.forEach(breaker => {
        expect(breaker.voltage).toBeLessThanOrEqual(48);
      });
    });

    it('should contain IEC60898-3 rated breakers for higher voltage DC', () => {
      const iec60898_3Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC60898-3');
      expect(iec60898_3Breakers.length).toBeGreaterThan(0);
      
      iec60898_3Breakers.forEach(breaker => {
        expect(breaker.voltage).toBeGreaterThan(48);
      });
    });

    it('should have valid breaker specifications', () => {
      IEC_BREAKER_SPECIFICATIONS.forEach(spec => {
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
      const automotiveBreakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('automotive')
      );
      
      automotiveBreakers.forEach(breaker => {
        expect(breaker.voltage).toBeGreaterThanOrEqual(12);
        expect(breaker.voltage).toBeLessThanOrEqual(250);
      });
    });

    it('should have higher temperature ratings than NEC equivalents', () => {
      const industrialBreakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('industrial')
      );
      
      industrialBreakers.forEach(breaker => {
        expect(breaker.temperatureRating).toBeGreaterThanOrEqual(85);
      });
    });

    it('should have high interrupting capacity for industrial applications', () => {
      const industrialBreakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.applications.includes('industrial')
      );
      
      industrialBreakers.forEach(breaker => {
        expect(breaker.interruptingCapacity).toBeGreaterThanOrEqual(10000);
      });
    });

    it('should have electronic type breakers for battery applications with thermal protection', () => {
      const batteryBreakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => 
        spec.standard === 'IEC62619' && spec.applications.includes('battery')
      );
      
      batteryBreakers.forEach(breaker => {
        expect(breaker.type).toBe('electronic');
        expect(breaker.thermalRunawayProtection).toBe(true);
      });
    });
  });

  describe('Application-Specific Requirements', () => {
    it('should provide automotive-rated breakers with proper temperature ratings', () => {
      const automotiveSpecs = getIECBreakerSpecifications(25, 'automotive');
      
      automotiveSpecs.forEach(spec => {
        expect(spec.applications).toContain('automotive');
        expect(spec.temperatureRating).toBeGreaterThanOrEqual(85);
      });
    });

    it('should provide marine-rated breakers with IEC environmental standards', () => {
      const marineSpecs = getIECBreakerSpecifications(32, 'marine');
      
      marineSpecs.forEach(spec => {
        expect(spec.applications).toContain('marine');
        expect(spec.temperatureRating).toBeGreaterThanOrEqual(85);
        expect(spec.standard).toMatch(/IEC60947|IEC60898/);
      });
    });

    it('should provide solar-rated breakers for high voltage DC interruption', () => {
      const solarSpecs = getIECBreakerSpecifications(40, 'solar');
      
      solarSpecs.forEach(spec => {
        expect(spec.applications).toContain('solar');
        expect(spec.voltage).toBeGreaterThanOrEqual(120);
        expect(spec.interruptingCapacity).toBeGreaterThanOrEqual(15000);
      });
    });

    it('should provide battery-rated breakers with thermal runaway protection', () => {
      const batterySpecs = getIECBreakerSpecifications(63, 'battery');
      
      batterySpecs.forEach(spec => {
        expect(spec.applications).toContain('battery');
        expect(spec.interruptingCapacity).toBeGreaterThanOrEqual(15000);
        expect(spec.continuousDuty).toBe(true);
        
        if (spec.standard === 'IEC62619') {
          expect(spec.thermalRunawayProtection).toBe(true);
        }
      });
    });

    it('should provide telecom-rated breakers for high reliability', () => {
      const telecomSpecs = getIECBreakerSpecifications(16, 'telecom');
      
      telecomSpecs.forEach(spec => {
        expect(spec.applications).toContain('telecom');
        expect(spec.continuousDuty).toBe(true);
        expect(spec.temperatureRating).toBeGreaterThanOrEqual(85);
      });
    });

    it('should provide LED-rated breakers for low current applications', () => {
      const ledSpecs = getIECBreakerSpecifications(10, 'led');
      
      ledSpecs.forEach(spec => {
        expect(spec.applications).toContain('led');
        expect(spec.rating).toBeLessThanOrEqual(32);
      });
    });
  });

  describe('IEC Standards Separation', () => {
    it('should have separate voltage classes for different IEC standards', () => {
      const iec60898_1Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC60898-1');
      const iec60898_3Breakers = IEC_BREAKER_SPECIFICATIONS.filter(spec => spec.standard === 'IEC60898-3');
      
      iec60898_1Breakers.forEach(breaker => {
        expect(breaker.voltage).toBeLessThanOrEqual(48);
      });
      
      iec60898_3Breakers.forEach(breaker => {
        expect(breaker.voltage).toBeGreaterThan(48);
      });
    });

    it('should have proper frame size classifications', () => {
      const frameSizes = ['MCB', 'DC-MCB', 'Industrial', 'ESS', 'Large'];
      
      IEC_BREAKER_SPECIFICATIONS.forEach(spec => {
        expect(frameSizes).toContain(spec.frameSize);
      });
    });

    it('should have proper trip curve classifications', () => {
      const tripCurves = ['B', 'C', 'D'];
      
      IEC_BREAKER_SPECIFICATIONS.forEach(spec => {
        expect(tripCurves).toContain(spec.tripCurve);
      });
    });
  });
});