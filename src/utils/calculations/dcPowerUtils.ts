import type { DCApplicationType } from '../../types/standards';

/**
 * DC Power Calculation Utilities
 * Helper functions for power-based DC circuit breaker calculations
 */

// Application-specific efficiency factors
export const APPLICATION_EFFICIENCY_FACTORS: Record<DCApplicationType, number> = {
  solar: 0.95,      // MPPT efficiency loss
  automotive: 0.98, // Direct DC connections
  marine: 0.97,     // Marine environment resistance
  telecom: 0.99,    // High-efficiency switching supplies
  battery: 0.93,    // Charging efficiency
  led: 0.90,        // LED driver efficiency
  industrial: 0.96  // Industrial motor drives and equipment
};

// Power factor considerations for different load types
export const LOAD_POWER_FACTORS: Record<string, number> = {
  resistive: 1.0,     // Heaters, lights, resistive loads
  motor: 0.85,        // DC motors (typical)
  switching: 0.95,    // Switching power supplies
  battery: 1.0,       // Battery charging (DC)
  led: 0.95,          // LED drivers
  inverter: 0.92      // DC-AC inverters
};

/**
 * Calculate current from power using Ohm's law: I = P/V
 */
export function calculateCurrentFromPower(
  power: number, 
  voltage: number, 
  efficiencyFactor: number = 1.0,
  powerFactor: number = 1.0
): number {
  if (voltage <= 0) {
    throw new Error('Voltage must be greater than 0');
  }
  
  if (power < 0) {
    throw new Error('Power cannot be negative');
  }

  // Calculate effective power considering efficiency and power factor
  const effectivePower = power / (efficiencyFactor * powerFactor);
  
  // I = P/V
  return effectivePower / voltage;
}

/**
 * Calculate power from current: P = V × I
 */
export function calculatePowerFromCurrent(
  current: number,
  voltage: number,
  efficiencyFactor: number = 1.0,
  powerFactor: number = 1.0
): number {
  if (voltage <= 0) {
    throw new Error('Voltage must be greater than 0');
  }
  
  if (current < 0) {
    throw new Error('Current cannot be negative');
  }

  // P = V × I
  const basePower = voltage * current;
  
  // Apply efficiency and power factor
  return basePower * efficiencyFactor * powerFactor;
}

/**
 * Get application-specific efficiency factor
 */
export function getApplicationEfficiency(applicationType: DCApplicationType): number {
  return APPLICATION_EFFICIENCY_FACTORS[applicationType] || 0.95;
}

/**
 * Get power factor for load type
 */
export function getLoadPowerFactor(loadType: string): number {
  return LOAD_POWER_FACTORS[loadType.toLowerCase()] || 1.0;
}

/**
 * Calculate solar panel array current from panel specifications
 */
export function calculateSolarArrayCurrent(
  panelPower: number,
  numberOfPanels: number,
  systemVoltage: number,
  stringConfiguration: 'series' | 'parallel' = 'parallel'
): number {
  const totalPower = panelPower * numberOfPanels;
  
  if (stringConfiguration === 'parallel') {
    // Parallel: all panels at system voltage, currents add
    return calculateCurrentFromPower(totalPower, systemVoltage);
  } else {
    // Series: voltage adds, current of single panel
    const panelVoltage = systemVoltage / numberOfPanels;
    return calculateCurrentFromPower(panelPower, panelVoltage);
  }
}

/**
 * Calculate battery charging current requirements
 */
export function calculateBatteryChargingCurrent(
  batteryCapacityAh: number,
  chargeRate: number = 0.1, // C/10 charge rate
  _systemVoltage: number,
  chargingEfficiency: number = 0.93
): number {
  // Charging current = Capacity × Charge rate
  const chargingCurrent = batteryCapacityAh * chargeRate;
  
  // Account for charging efficiency
  return chargingCurrent / chargingEfficiency;
}

/**
 * Calculate automotive accessory current
 */
export function calculateAutomotiveAccessoryCurrent(
  accessoryPower: number,
  vehicleVoltage: number = 12, // 12V or 24V systems
  simultaneousFactor: number = 0.7 // Not all accessories run at once
): number {
  const adjustedPower = accessoryPower * simultaneousFactor;
  return calculateCurrentFromPower(adjustedPower, vehicleVoltage);
}

/**
 * Validate power calculation inputs
 */
export function validatePowerInputs(power: number, voltage: number): string[] {
  const errors: string[] = [];

  if (power <= 0) {
    errors.push('Power must be greater than 0 watts');
  }

  if (power > 100000) { // 100kW limit
    errors.push('Power exceeds maximum supported limit (100kW)');
  }

  if (voltage <= 0) {
    errors.push('Voltage must be greater than 0 volts');
  }

  if (voltage > 1000) { // 1000V DC limit
    errors.push('Voltage exceeds maximum supported limit (1000V DC)');
  }

  // Check for realistic power/voltage combinations
  const calculatedCurrent = power / voltage;
  if (calculatedCurrent > 1000) {
    errors.push('Calculated current exceeds 1000A - check power and voltage values');
  }

  return errors;
}

/**
 * Calculate power loss in breaker and wiring
 */
export function calculatePowerLoss(
  current: number,
  resistance: number, // Total circuit resistance in ohms
  voltage: number
): {
  powerLossWatts: number;
  voltageDrop: number;
  efficiency: number;
} {
  // Power loss: P = I²R
  const powerLossWatts = Math.pow(current, 2) * resistance;
  
  // Voltage drop: V = IR
  const voltageDrop = current * resistance;
  
  // Efficiency: η = (Vout/Vin) × 100%
  const efficiency = ((voltage - voltageDrop) / voltage) * 100;

  return {
    powerLossWatts,
    voltageDrop,
    efficiency
  };
}

/**
 * Calculate inrush current for motor loads
 */
export function calculateMotorInrushCurrent(
  motorPower: number,
  voltage: number,
  inrushFactor: number = 6.0 // Typical 6x running current
): number {
  const runningCurrent = calculateCurrentFromPower(motorPower, voltage, 0.85); // 85% motor efficiency
  return runningCurrent * inrushFactor;
}

/**
 * Get recommended wire gauge for given current
 */
export function getRecommendedWireGauge(
  current: number,
  wireStandard: 'NEC' | 'IEC' = 'NEC'
): string {
  if (wireStandard === 'NEC') {
    // AWG wire recommendations
    if (current <= 15) return '14';
    if (current <= 20) return '12';
    if (current <= 30) return '10';
    if (current <= 40) return '8';
    if (current <= 55) return '6';
    if (current <= 70) return '4';
    if (current <= 95) return '2';
    if (current <= 110) return '1';
    if (current <= 125) return '1/0';
    if (current <= 145) return '2/0';
    if (current <= 165) return '3/0';
    return '4/0';
  } else {
    // Metric wire recommendations (mm²)
    if (current <= 15) return '2.5';
    if (current <= 20) return '4';
    if (current <= 30) return '6';
    if (current <= 40) return '10';
    if (current <= 55) return '16';
    if (current <= 70) return '25';
    if (current <= 95) return '35';
    if (current <= 110) return '50';
    if (current <= 125) return '70';
    if (current <= 145) return '95';
    if (current <= 165) return '120';
    return '150';
  }
}