import { 
  calculateDCVoltageDrop, 
  calculateDCWireSize, 
  calculateBatteryChargingWire,
  calculateSolarWire,
  validateDCInput 
} from '../dc';
import type { DCCalculationInput } from '../../../types/standards';

describe('DC Voltage Drop Calculations', () => {
  describe('calculateDCVoltageDrop', () => {
    it('should calculate voltage drop for 12V automotive circuit', () => {
      const result = calculateDCVoltageDrop({
        current: 20,
        resistance: 1.588, // 12 AWG copper
        length: 10,
        voltage: 12,
        conductorMaterial: 'copper'
      });

      expect(result.voltageDropVolts).toBeCloseTo(0.6352, 2); // 2 × 20 × 1.588 × 10 / 1000
      expect(result.voltageDropPercent).toBeCloseTo(5.29, 1); // (0.6352 / 12) × 100
      expect(result.powerLossWatts).toBeCloseTo(6.35, 2); // 20² × 1.588 × 10 / 1000
      expect(result.efficiency).toBeCloseTo(94.71, 1); // ((12 - 0.6352) / 12) × 100
    });

    it('should account for aluminum resistance multiplier', () => {
      const copperResult = calculateDCVoltageDrop({
        current: 15,
        resistance: 2.525, // 14 AWG
        length: 15,
        voltage: 24,
        conductorMaterial: 'copper'
      });

      const aluminumResult = calculateDCVoltageDrop({
        current: 15,
        resistance: 2.525, // 14 AWG
        length: 15,
        voltage: 24,
        conductorMaterial: 'aluminum'
      });

      expect(aluminumResult.voltageDropVolts).toBeCloseTo(copperResult.voltageDropVolts * 1.61, 2);
      expect(aluminumResult.powerLossWatts).toBeCloseTo(copperResult.powerLossWatts * 1.61, 2);
    });

    it('should handle 48V telecom circuit', () => {
      const result = calculateDCVoltageDrop({
        current: 5,
        resistance: 0.628, // 8 AWG
        length: 100,
        voltage: 48,
        conductorMaterial: 'copper'
      });

      expect(result.voltageDropVolts).toBeCloseTo(0.628, 2); // 2 × 5 × 0.628 × 100 / 1000
      expect(result.voltageDropPercent).toBeCloseTo(1.31, 2); // Very low for telecom requirements
      expect(result.efficiency).toBeGreaterThan(98.5); // High efficiency requirement
    });
  });

  describe('calculateDCWireSize', () => {
    it('should recommend appropriate wire for automotive application', () => {
      const input: DCCalculationInput = {
        current: 25,
        length: 8,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper',
        ambientTemperature: 80, // Hot engine compartment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);

      expect(result.recommendedWireGauge).toBeDefined();
      expect(result.compliance.ampacityCompliant).toBe(true);
      expect(result.compliance.voltageDropCompliant).toBe(true);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(2.0); // Automotive strict limit
      expect(result.efficiency).toBeGreaterThan(95); // Automotive efficiency requirement
    });

    it('should handle marine environment with corrosion factors', () => {
      const input: DCCalculationInput = {
        current: 30,
        length: 15,
        voltage: 24,
        voltageSystem: '24V',
        applicationType: 'marine',
        conductorMaterial: 'copper',
        ambientTemperature: 40, // Marine environment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);

      expect(result.compliance.temperatureCompliant).toBe(true);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(3.0); // ABYC marine limit
      expect(result.correctionFactors.temperature).toBeGreaterThan(0.8); // Temperature derating
    });

    it('should optimize for solar efficiency', () => {
      const input: DCCalculationInput = {
        current: 15,
        length: 50,
        voltage: 48,
        voltageSystem: '48V',
        applicationType: 'solar',
        conductorMaterial: 'copper',
        ambientTemperature: 70, // Hot solar panel environment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);

      expect(result.voltageDropPercent).toBeLessThanOrEqual(2.0); // Solar efficiency critical
      expect(result.powerLossWatts).toBeLessThan(20); // Minimize power loss
      expect(result.efficiency).toBeGreaterThan(98); // Solar efficiency requirement
    });

    it('should meet strict telecom requirements', () => {
      const input: DCCalculationInput = {
        current: 8,
        length: 25,
        voltage: 48,
        voltageSystem: '48V',
        applicationType: 'telecom',
        conductorMaterial: 'copper',
        ambientTemperature: 25, // Controlled environment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);

      expect(result.voltageDropPercent).toBeLessThanOrEqual(1.0); // Very strict telecom limit
      expect(result.compliance.applicationCompliant).toBe(true);
      expect(result.efficiency).toBeGreaterThan(99); // Telecom reliability requirement
    });
  });

  describe('calculateBatteryChargingWire', () => {
    it('should calculate battery charging wire for 12V system', () => {
      const result = calculateBatteryChargingWire({
        batteryVoltage: 12,
        chargingCurrent: 50,
        cableLength: 6,
        chargerEfficiency: 0.9,
        allowableVoltageDropPercent: 1.5,
        conductorMaterial: 'copper'
      });

      expect(result.voltageDropPercent).toBeLessThanOrEqual(1.5);
      expect(result.compliance.voltageDropCompliant).toBe(true);
      expect(result.powerLossWatts).toBeLessThan(50); // Reasonable power loss
    });

    it('should handle high current 48V battery system', () => {
      const result = calculateBatteryChargingWire({
        batteryVoltage: 48,
        chargingCurrent: 100,
        cableLength: 10,
        chargerEfficiency: 0.95,
        allowableVoltageDropPercent: 1.0,
        conductorMaterial: 'copper'
      });

      expect(result.ampacity).toBeGreaterThanOrEqual(125); // 100A × 1.25 safety factor
      expect(result.voltageDropPercent).toBeLessThanOrEqual(1.0);
      expect(result.efficiency).toBeGreaterThan(98);
    });
  });

  describe('calculateSolarWire', () => {
    it('should calculate solar panel wire with NEC 1.25 factor', () => {
      const result = calculateSolarWire({
        panelVoltage: 24,
        shortCircuitCurrent: 8,
        numberOfPanels: 4,
        cableLength: 30,
        ambientTemperature: 80,
        conductorMaterial: 'copper'
      });

      // Total current should be 8A × 4 panels × 1.25 NEC factor = 40A
      expect(result.compliance.ampacityCompliant).toBe(true);
      expect(result.voltageDropPercent).toBeLessThanOrEqual(2.0);
      expect(result.correctionFactors.temperature).toBeLessThan(1.0); // High temp derating
    });

    it('should handle large solar array', () => {
      const result = calculateSolarWire({
        panelVoltage: 48,
        shortCircuitCurrent: 12,
        numberOfPanels: 10,
        cableLength: 100,
        ambientTemperature: 60,
        conductorMaterial: 'copper'
      });

      // Total current: 12A × 10 × 1.25 = 150A
      expect(result.ampacity).toBeGreaterThanOrEqual(150);
      expect(result.powerLossWatts).toBeLessThan(200); // Efficiency critical
      expect(result.efficiency).toBeGreaterThan(96);
    });
  });

  describe('validateDCInput', () => {
    it('should validate correct input', () => {
      const input: DCCalculationInput = {
        current: 20,
        length: 10,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper',
        ambientTemperature: 25,
        loadType: 'continuous'
      };

      const errors = validateDCInput(input);
      expect(errors).toHaveLength(0);
    });

    it('should catch invalid current', () => {
      const input: DCCalculationInput = {
        current: -5, // Invalid
        length: 10,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper'
      };

      const errors = validateDCInput(input);
      expect(errors).toContain('Current must be greater than 0');
    });

    it('should catch invalid length', () => {
      const input: DCCalculationInput = {
        current: 20,
        length: 0, // Invalid
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper'
      };

      const errors = validateDCInput(input);
      expect(errors).toContain('Length must be greater than 0');
    });

    it('should catch invalid temperature', () => {
      const input: DCCalculationInput = {
        current: 20,
        length: 10,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper',
        ambientTemperature: 200 // Too hot
      };

      const errors = validateDCInput(input);
      expect(errors).toContain('Ambient temperature must be between -40°C and 150°C');
    });

    it('should catch invalid application type', () => {
      const input: DCCalculationInput = {
        current: 20,
        length: 10,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'invalid' as any,
        conductorMaterial: 'copper'
      };

      const errors = validateDCInput(input);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Invalid application type');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle automotive ECU power supply (critical load)', () => {
      const input: DCCalculationInput = {
        current: 3,
        length: 20,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'automotive',
        conductorMaterial: 'copper',
        ambientTemperature: 100, // Engine compartment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);
      
      // ECU requires very stable voltage
      expect(result.voltageDropPercent).toBeLessThanOrEqual(1.0);
      expect(result.compliance.temperatureCompliant).toBe(true);
    });

    it('should handle marine navigation lights', () => {
      const input: DCCalculationInput = {
        current: 2,
        length: 40,
        voltage: 12,
        voltageSystem: '12V',
        applicationType: 'marine',
        conductorMaterial: 'copper',
        ambientTemperature: 0, // Cold marine environment
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);
      
      expect(result.voltageDropPercent).toBeLessThanOrEqual(3.0); // ABYC limit
      expect(result.correctionFactors.temperature).toBeGreaterThan(1.0); // Cold boost
    });

    it('should handle solar MPPT controller connection', () => {
      const input: DCCalculationInput = {
        current: 60,
        length: 5,
        voltage: 48,
        voltageSystem: '48V',
        applicationType: 'solar',
        conductorMaterial: 'copper',
        ambientTemperature: 60,
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);
      
      // High current, short distance - should use large gauge
      expect(result.ampacity).toBeGreaterThanOrEqual(75); // 60A × 1.25
      expect(result.voltageDropPercent).toBeLessThanOrEqual(1.0); // Efficiency critical
    });

    it('should handle telecom equipment power feed', () => {
      const input: DCCalculationInput = {
        current: 10,
        length: 100,
        voltage: 48,
        voltageSystem: '48V',
        applicationType: 'telecom',
        conductorMaterial: 'copper',
        ambientTemperature: 25,
        loadType: 'continuous'
      };

      const result = calculateDCWireSize(input);
      
      // Long distance telecom feed - voltage drop will be higher due to distance
      // The calculator should select appropriate wire to meet requirements
      expect(result.voltageDropPercent).toBeLessThanOrEqual(5.0); // Reasonable for 100ft
      expect(result.efficiency).toBeGreaterThan(95); // Still good efficiency
    });
  });
});