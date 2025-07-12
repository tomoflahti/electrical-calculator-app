/**
 * Automotive Voltage Systems Tests
 * Comprehensive test coverage for 12V/24V/32V/48V automotive electrical systems
 */

import {
  AUTOMOTIVE_VOLTAGE_SYSTEMS,
  getAutomotiveVoltageSystem,
  getAutomotiveEfficiency,
  getAutomotiveSafetyFactors,
  calculateAutomotiveCurrent,
  getTypicalAutomotiveLoads,
  getAutomotiveVoltageRecommendations,
  compareAutomotiveVoltageSystems
} from '../automotiveVoltages';

import type { AutomotiveVoltage } from '../iso8820Standards';

describe('Automotive Voltage Systems', () => {
  describe('Voltage System Database', () => {
    it('should have all required voltage systems', () => {
      expect(AUTOMOTIVE_VOLTAGE_SYSTEMS).toHaveLength(4);
      
      const voltages = AUTOMOTIVE_VOLTAGE_SYSTEMS.map(s => s.voltage);
      expect(voltages).toContain(12);
      expect(voltages).toContain(24);
      expect(voltages).toContain(32);
      expect(voltages).toContain(48);
    });

    it('should have realistic market share distribution', () => {
      const totalMarketShare = AUTOMOTIVE_VOLTAGE_SYSTEMS.reduce(
        (sum, system) => sum + system.marketShare, 0
      );
      
      expect(totalMarketShare).toBe(100);
      
      // 12V should have highest market share
      const system12V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 12);
      expect(system12V?.marketShare).toBeGreaterThan(80);
      
      // 48V should have smallest but growing market share
      const system48V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 48);
      expect(system48V?.marketShare).toBeLessThan(5);
    });

    it('should have increasing efficiency with voltage', () => {
      const system12V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 12);
      const system24V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 24);
      const system32V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 32);
      const system48V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 48);
      
      expect(system12V?.efficiency).toBeLessThan(system24V?.efficiency || 0);
      expect(system24V?.efficiency).toBeLessThan(system32V?.efficiency || 0);
      expect(system32V?.efficiency).toBeLessThan(system48V?.efficiency || 0);
    });

    it('should have appropriate applications for each voltage', () => {
      const system12V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 12);
      const system24V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 24);
      const system48V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 48);
      
      expect(system12V?.applications).toContain('Passenger cars and light trucks');
      expect(system24V?.applications).toContain('Heavy trucks and commercial vehicles');
      expect(system48V?.applications).toContain('Mild hybrid vehicles (48V starter-generator)');
    });

    it('should have realistic typical loads for each voltage', () => {
      AUTOMOTIVE_VOLTAGE_SYSTEMS.forEach(system => {
        expect(system.typicalLoads).toBeDefined();
        expect(system.typicalLoads.length).toBeGreaterThan(4);
        
        system.typicalLoads.forEach(load => {
          expect(load.component).toBeDefined();
          expect(load.powerRange).toBeDefined();
          expect(load.currentRange).toBeDefined();
          expect(load.fuseRating).toBeDefined();
        });
      });
    });

    it('should have appropriate safety factors', () => {
      AUTOMOTIVE_VOLTAGE_SYSTEMS.forEach(system => {
        expect(system.safetyFactors.continuous).toBeGreaterThan(1.0);
        expect(system.safetyFactors.continuous).toBeLessThan(2.0);
        expect(system.safetyFactors.intermittent).toBeGreaterThan(1.0);
        expect(system.safetyFactors.intermittent).toBeLessThan(system.safetyFactors.continuous);
      });
    });
  });

  describe('12V Automotive System', () => {
    const system12V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 12)!;

    it('should have correct characteristics', () => {
      expect(system12V.voltage).toBe(12);
      expect(system12V.name).toBe('12V System');
      expect(system12V.marketShare).toBe(85);
      expect(system12V.efficiency).toBe(0.85);
    });

    it('should have appropriate safety factors', () => {
      expect(system12V.safetyFactors.continuous).toBe(1.25);
      expect(system12V.safetyFactors.intermittent).toBe(1.15);
    });

    it('should have realistic typical loads', () => {
      const ledHeadlights = system12V.typicalLoads.find(l => l.component === 'LED Headlights');
      const coolingFan = system12V.typicalLoads.find(l => l.component === 'Cooling Fan');
      const alternator = system12V.typicalLoads.find(l => l.component === 'Alternator');
      
      expect(ledHeadlights).toBeDefined();
      expect(coolingFan).toBeDefined();
      expect(alternator).toBeDefined();
      
      expect(ledHeadlights?.fuseRating).toBe('15A');
      expect(coolingFan?.fuseRating).toBe('30A');
      expect(alternator?.fuseRating).toMatch(/80-120A/);
    });

    it('should have appropriate advantages and disadvantages', () => {
      expect(system12V.advantages).toContain('Universal compatibility');
      expect(system12V.disadvantages).toContain('Higher current requirements');
    });
  });

  describe('24V Automotive System', () => {
    const system24V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 24)!;

    it('should have correct characteristics', () => {
      expect(system24V.voltage).toBe(24);
      expect(system24V.name).toBe('24V System');
      expect(system24V.marketShare).toBe(12);
      expect(system24V.efficiency).toBe(0.90);
    });

    it('should have higher safety factors than 12V', () => {
      expect(system24V.safetyFactors.continuous).toBe(1.30);
      expect(system24V.safetyFactors.intermittent).toBe(1.20);
    });

    it('should have commercial vehicle applications', () => {
      expect(system24V.applications).toContain('Heavy trucks and commercial vehicles');
      expect(system24V.applications).toContain('Buses and coaches');
    });

    it('should have appropriate typical loads', () => {
      const ledLighting = system24V.typicalLoads.find(l => l.component === 'LED Lighting');
      const airConditioning = system24V.typicalLoads.find(l => l.component === 'Air Conditioning');
      
      expect(ledLighting).toBeDefined();
      expect(airConditioning).toBeDefined();
      
      expect(ledLighting?.fuseRating).toBe('10A');
      expect(airConditioning?.fuseRating).toBe('60A');
    });
  });

  describe('32V Automotive System', () => {
    const system32V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 32)!;

    it('should have correct characteristics', () => {
      expect(system32V.voltage).toBe(32);
      expect(system32V.marketShare).toBe(1);
      expect(system32V.efficiency).toBe(0.92);
    });

    it('should have specialized applications', () => {
      expect(system32V.applications).toContain('Some hybrid vehicles');
      expect(system32V.applications).toContain('High-power automotive applications');
    });

    it('should have limited market presence', () => {
      expect(system32V.disadvantages).toContain('Very limited market adoption');
    });
  });

  describe('48V Automotive System', () => {
    const system48V = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === 48)!;

    it('should have correct characteristics', () => {
      expect(system48V.voltage).toBe(48);
      expect(system48V.marketShare).toBe(2);
      expect(system48V.efficiency).toBe(0.95);
    });

    it('should have hybrid/electric applications', () => {
      expect(system48V.applications).toContain('Mild hybrid vehicles (48V starter-generator)');
      expect(system48V.applications).toContain('Electric turbochargers and superchargers');
    });

    it('should have high-power typical loads', () => {
      const starterGenerator = system48V.typicalLoads.find(l => l.component === 'Starter-Generator');
      const electricTurbocharger = system48V.typicalLoads.find(l => l.component === 'Electric Turbocharger');
      
      expect(starterGenerator).toBeDefined();
      expect(electricTurbocharger).toBeDefined();
      
      expect(starterGenerator?.fuseRating).toBe('Circuit Breaker');
      expect(electricTurbocharger?.fuseRating).toBe('Circuit Breaker');
    });

    it('should have lower safety factors due to high efficiency', () => {
      expect(system48V.safetyFactors.continuous).toBe(1.20);
      expect(system48V.safetyFactors.intermittent).toBe(1.10);
    });
  });

  describe('Voltage System Functions', () => {
    describe('getAutomotiveVoltageSystem', () => {
      it('should return correct system for each voltage', () => {
        const system12V = getAutomotiveVoltageSystem(12);
        const system24V = getAutomotiveVoltageSystem(24);
        const system32V = getAutomotiveVoltageSystem(32);
        const system48V = getAutomotiveVoltageSystem(48);
        
        expect(system12V.voltage).toBe(12);
        expect(system24V.voltage).toBe(24);
        expect(system32V.voltage).toBe(32);
        expect(system48V.voltage).toBe(48);
      });

      it('should throw error for unsupported voltage', () => {
        expect(() => getAutomotiveVoltageSystem(6 as AutomotiveVoltage)).toThrow();
        expect(() => getAutomotiveVoltageSystem(60 as AutomotiveVoltage)).toThrow();
      });
    });

    describe('getAutomotiveEfficiency', () => {
      it('should return correct efficiency for each voltage', () => {
        expect(getAutomotiveEfficiency(12)).toBe(0.85);
        expect(getAutomotiveEfficiency(24)).toBe(0.90);
        expect(getAutomotiveEfficiency(32)).toBe(0.92);
        expect(getAutomotiveEfficiency(48)).toBe(0.95);
      });

      it('should have increasing efficiency with voltage', () => {
        expect(getAutomotiveEfficiency(12)).toBeLessThan(getAutomotiveEfficiency(24));
        expect(getAutomotiveEfficiency(24)).toBeLessThan(getAutomotiveEfficiency(32));
        expect(getAutomotiveEfficiency(32)).toBeLessThan(getAutomotiveEfficiency(48));
      });
    });

    describe('getAutomotiveSafetyFactors', () => {
      it('should return correct safety factors for each voltage', () => {
        const factors12V = getAutomotiveSafetyFactors(12);
        const factors24V = getAutomotiveSafetyFactors(24);
        const factors48V = getAutomotiveSafetyFactors(48);
        
        expect(factors12V.continuous).toBe(1.25);
        expect(factors24V.continuous).toBe(1.30);
        expect(factors48V.continuous).toBe(1.20);
      });

      it('should have continuous factors higher than intermittent', () => {
        const voltages: AutomotiveVoltage[] = [12, 24, 32, 48];
        
        voltages.forEach(voltage => {
          const factors = getAutomotiveSafetyFactors(voltage);
          expect(factors.continuous).toBeGreaterThan(factors.intermittent);
        });
      });
    });

    describe('calculateAutomotiveCurrent', () => {
      it('should calculate correct current for 12V system', () => {
        const current = calculateAutomotiveCurrent(240, 12);
        expect(current).toBeCloseTo(23.5, 1); // 240W / 12V / 0.85 efficiency
      });

      it('should calculate correct current for 24V system', () => {
        const current = calculateAutomotiveCurrent(240, 24);
        expect(current).toBeCloseTo(11.1, 1); // 240W / 24V / 0.90 efficiency
      });

      it('should calculate correct current for 48V system', () => {
        const current = calculateAutomotiveCurrent(240, 48);
        expect(current).toBeCloseTo(5.3, 1); // 240W / 48V / 0.95 efficiency
      });

      it('should use custom efficiency factor when provided', () => {
        const current = calculateAutomotiveCurrent(240, 12, 0.90);
        expect(current).toBeCloseTo(22.2, 1); // 240W / 12V / 0.90 efficiency
      });

      it('should handle zero power correctly', () => {
        const current = calculateAutomotiveCurrent(0, 12);
        expect(current).toBe(0);
      });
    });

    describe('getTypicalAutomotiveLoads', () => {
      it('should return loads for each voltage system', () => {
        const loads12V = getTypicalAutomotiveLoads(12);
        const loads24V = getTypicalAutomotiveLoads(24);
        const loads48V = getTypicalAutomotiveLoads(48);
        
        expect(loads12V.length).toBeGreaterThan(5);
        expect(loads24V.length).toBeGreaterThan(5);
        expect(loads48V.length).toBeGreaterThan(5);
      });

      it('should have consistent structure', () => {
        const loads = getTypicalAutomotiveLoads(12);
        
        loads.forEach(load => {
          expect(load.component).toBeDefined();
          expect(load.powerRange).toBeDefined();
          expect(load.currentRange).toBeDefined();
          expect(load.fuseRating).toBeDefined();
        });
      });
    });

    describe('getAutomotiveVoltageRecommendations', () => {
      it('should recommend 12V for low power passenger car loads', () => {
        const recommendations = getAutomotiveVoltageRecommendations(200, 'automotive');
        expect(recommendations).toContain(12);
      });

      it('should recommend 24V for commercial vehicle loads', () => {
        const recommendations = getAutomotiveVoltageRecommendations(1000, 'automotive');
        expect(recommendations).toContain(24);
      });

      it('should recommend 48V for high power hybrid loads', () => {
        const recommendations = getAutomotiveVoltageRecommendations(5000, 'automotive');
        expect(recommendations).toContain(48);
      });

      it('should recommend multiple voltages for mid-range power', () => {
        const recommendations = getAutomotiveVoltageRecommendations(800, 'automotive');
        expect(recommendations.length).toBeGreaterThan(1);
      });

      it('should consider application type', () => {
        const automotiveRecs = getAutomotiveVoltageRecommendations(500, 'automotive');
        const marineRecs = getAutomotiveVoltageRecommendations(500, 'marine');
        
        expect(automotiveRecs).toContain(12);
        expect(marineRecs).toContain(24);
      });
    });

    describe('compareAutomotiveVoltageSystems', () => {
      it('should compare all voltage systems for given power', () => {
        const comparison = compareAutomotiveVoltageSystems(480);
        
        expect(comparison).toHaveLength(4);
        
        comparison.forEach(system => {
          expect(system.voltage).toBeDefined();
          expect(system.current).toBeGreaterThan(0);
          expect(system.efficiency).toBeGreaterThan(0);
          expect(system.fuseRating).toBeDefined();
        });
      });

      it('should show decreasing current with increasing voltage', () => {
        const comparison = compareAutomotiveVoltageSystems(480);
        const sorted = comparison.sort((a, b) => a.voltage - b.voltage);
        
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].current).toBeLessThan(sorted[i - 1].current);
        }
      });

      it('should show increasing efficiency with voltage', () => {
        const comparison = compareAutomotiveVoltageSystems(480);
        const sorted = comparison.sort((a, b) => a.voltage - b.voltage);
        
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].efficiency).toBeGreaterThan(sorted[i - 1].efficiency);
        }
      });

      it('should recommend appropriate fuses for each voltage', () => {
        const comparison = compareAutomotiveVoltageSystems(600);
        
        const system12V = comparison.find(s => s.voltage === 12);
        const system48V = comparison.find(s => s.voltage === 48);
        
        expect(system12V?.fuseRating).toMatch(/A$/); // Should be a fuse rating
        expect(system48V?.fuseRating).toMatch(/A$/);
      });

      it('should handle high power loads correctly', () => {
        const comparison = compareAutomotiveVoltageSystems(10000);
        
        const system12V = comparison.find(s => s.voltage === 12);
        const system48V = comparison.find(s => s.voltage === 48);
        
        expect(system12V?.fuseRating).toBe('Circuit Breaker Required');
        expect(system48V?.current).toBeLessThan(system12V?.current || 0);
      });
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle zero power calculations', () => {
      expect(calculateAutomotiveCurrent(0, 12)).toBe(0);
      expect(calculateAutomotiveCurrent(0, 48)).toBe(0);
    });

    it('should handle very low power calculations', () => {
      const current = calculateAutomotiveCurrent(12, 12);
      expect(current).toBeCloseTo(1.18, 2); // 12W / 12V / 0.85 efficiency
    });

    it('should handle high power calculations', () => {
      const current = calculateAutomotiveCurrent(5000, 48);
      expect(current).toBeCloseTo(109.6, 1); // 5000W / 48V / 0.95 efficiency
    });

    it('should maintain consistency between functions', () => {
      const voltage: AutomotiveVoltage = 24;
      const system = getAutomotiveVoltageSystem(voltage);
      
      expect(getAutomotiveEfficiency(voltage)).toBe(system.efficiency);
      expect(getAutomotiveSafetyFactors(voltage)).toEqual(system.safetyFactors);
      expect(getTypicalAutomotiveLoads(voltage)).toEqual(system.typicalLoads);
    });
  });
});