import type { 
  DCCalculationInput, 
  DCCalculationResult
} from '../../types/standards';
import { getApplicationStandard, getVoltageDropLimit } from '../../standards/dc/applications';
import { getWireTableByApplication, getTemperatureCorrectionFactor } from '../../standards/dc/wireTables';
import { awgToMm2, findMinimumMetricWireSize } from '../wireConversion';

/**
 * DC Voltage Drop Calculation Engine
 * 
 * Formulas:
 * - Voltage Drop = (2 × I × R × L) / 1000 for copper
 * - Voltage Drop = (2 × I × R × L × 1.61) / 1000 for aluminum  
 * - Power Loss = I² × R × L / 1000
 * - Efficiency = ((V - VD) / V) × 100%
 */

/**
 * Calculate DC voltage drop for a specific wire gauge
 */
export function calculateDCVoltageDrop(input: {
  current: number;        // Amperes
  resistance: number;     // Ohms per 1000 feet (imperial) or Ohms per 1000 meters (metric)
  length: number;         // Feet (imperial) or meters (metric)
  voltage: number;        // Volts
  conductorMaterial: 'copper' | 'aluminum';
  wireStandard?: 'NEC' | 'IEC';
}): {
  voltageDropVolts: number;
  voltageDropPercent: number;
  powerLossWatts: number;
  efficiency: number;
} {
  const { current, resistance, length, voltage, conductorMaterial } = input;
  
  // Resistance multiplier for aluminum (61% more resistance than copper)
  const materialMultiplier = conductorMaterial === 'aluminum' ? 1.61 : 1.0;
  
  // DC voltage drop: VD = 2 × I × R × L / 1000
  // Factor of 2 for round-trip (positive and negative conductors)
  // For NEC: resistance per 1000 feet, length in feet
  // For IEC: resistance per 1000 meters, length in meters
  const voltageDropVolts = (2 * current * resistance * materialMultiplier * length) / 1000;
  const voltageDropPercent = (voltageDropVolts / voltage) * 100;
  
  // Power loss: P = I² × R × L / 1000
  const powerLossWatts = (current * current * resistance * materialMultiplier * length) / 1000;
  
  // Efficiency: η = ((V - VD) / V) × 100%
  const efficiency = ((voltage - voltageDropVolts) / voltage) * 100;
  
  return {
    voltageDropVolts,
    voltageDropPercent,
    powerLossWatts,
    efficiency
  };
}

/**
 * Find recommended wire size for DC application
 */
export function calculateDCWireSize(input: DCCalculationInput): DCCalculationResult {
  const {
    current,
    length,
    voltage,
    applicationType,
    conductorMaterial,
    ambientTemperature = 25,
    allowableVoltageDropPercent,
    loadType = 'continuous',
    wireStandard = 'NEC'
  } = input;
  
  // Use length as-is - NEC uses feet, IEC uses meters
  const lengthForCalculation = length;
  
  // Note: voltageSystem and installationMethod will be used in future enhancements

  // Get application standard
  const appStandard = getApplicationStandard(applicationType);
  
  // Determine voltage drop limit
  const voltageDropLimit = allowableVoltageDropPercent || 
    getVoltageDropLimit(applicationType, loadType === 'continuous');
  
  // Get temperature correction factor
  const tempCorrectionFactor = getTemperatureCorrectionFactor(applicationType, ambientTemperature);
  
  // Apply safety factor to current
  const safetyCurrent = current * appStandard.safetyFactors.ampacity;
  
  // Get appropriate wire table from comprehensive tables
  const wireTable = getWireTableByApplication(applicationType);
  
  // Find suitable wires based on ampacity
  const ampacitySuitableWires = wireTable.filter(wire => {
    const correctedAmpacity = wire.ampacity.continuous * tempCorrectionFactor;
    return correctedAmpacity >= safetyCurrent;
  });
  
  if (ampacitySuitableWires.length === 0) {
    throw new Error('No wire size found with sufficient ampacity for the given current');
  }
  
  // Check voltage drop for each suitable wire
  let selectedWire = ampacitySuitableWires[0];
  let bestVoltageDrop = Infinity;
  
  for (const wire of ampacitySuitableWires) {
    const voltageDropResult = calculateDCVoltageDrop({
      current,
      resistance: wire.resistance,
      length: lengthForCalculation,
      voltage,
      conductorMaterial,
      wireStandard
    });
    
    if (voltageDropResult.voltageDropPercent <= voltageDropLimit) {
      selectedWire = wire;
      bestVoltageDrop = voltageDropResult.voltageDropPercent;
      break;
    }
    
    if (voltageDropResult.voltageDropPercent < bestVoltageDrop) {
      bestVoltageDrop = voltageDropResult.voltageDropPercent;
      selectedWire = wire;
    }
  }
  
  // Calculate final results with selected wire
  const finalResults = calculateDCVoltageDrop({
    current,
    resistance: selectedWire.resistance,
    length: lengthForCalculation,
    voltage,
    conductorMaterial,
    wireStandard
  });
  
  const correctedAmpacity = selectedWire.ampacity.continuous * tempCorrectionFactor;
  
  // Check compliance
  const ampacityCompliant = correctedAmpacity >= safetyCurrent;
  const voltageDropCompliant = finalResults.voltageDropPercent <= voltageDropLimit;
  const temperatureCompliant = ambientTemperature <= selectedWire.temperatureRating;
  const applicationCompliant = selectedWire.applications.includes(applicationType);
  
  // Convert to metric if IEC standard is selected
  let displayWireGauge = selectedWire.gauge;
  if (wireStandard === 'IEC') {
    const awgMm2 = awgToMm2(selectedWire.gauge);
    const metricSize = findMinimumMetricWireSize(awgMm2);
    displayWireGauge = metricSize.toString();
  }

  return {
    recommendedWireGauge: displayWireGauge,
    ampacity: correctedAmpacity,
    voltageDropPercent: finalResults.voltageDropPercent,
    voltageDropVolts: finalResults.voltageDropVolts,
    powerLossWatts: finalResults.powerLossWatts,
    efficiency: finalResults.efficiency,
    compliance: {
      ampacityCompliant,
      voltageDropCompliant,
      temperatureCompliant,
      applicationCompliant
    },
    correctionFactors: {
      temperature: tempCorrectionFactor,
      ambient: ambientTemperature <= 30 ? 1.0 : tempCorrectionFactor,
    }
  };
}

/**
 * Calculate battery charging wire requirements
 */
export function calculateBatteryChargingWire(input: {
  batteryVoltage: number;     // 12V, 24V, 48V
  chargingCurrent: number;    // Amperes
  cableLength: number;        // Feet
  chargerEfficiency: number;  // 0.85-0.95
  allowableVoltageDropPercent: number; // Usually 1-2% for charging
  conductorMaterial: 'copper' | 'aluminum';
}): DCCalculationResult {
  
  // Convert to standard DC calculation input
  const dcInput: DCCalculationInput = {
    current: input.chargingCurrent,
    length: input.cableLength,
    voltage: input.batteryVoltage,
    voltageSystem: `${input.batteryVoltage}V` as any,
    applicationType: 'battery',
    conductorMaterial: input.conductorMaterial,
    allowableVoltageDropPercent: input.allowableVoltageDropPercent,
    loadType: 'continuous'
  };
  
  return calculateDCWireSize(dcInput);
}

/**
 * Calculate solar panel wire requirements
 */
export function calculateSolarWire(input: {
  panelVoltage: number;       // Panel operating voltage
  shortCircuitCurrent: number; // Panel Isc
  numberOfPanels: number;     // Panels in parallel
  cableLength: number;        // Feet
  ambientTemperature: number; // Celsius
  conductorMaterial: 'copper' | 'aluminum';
}): DCCalculationResult {
  
  // Calculate total current (NEC 690.8(A) - multiply by 1.25)
  const totalCurrent = input.shortCircuitCurrent * input.numberOfPanels * 1.25;
  
  const dcInput: DCCalculationInput = {
    current: totalCurrent,
    length: input.cableLength,
    voltage: input.panelVoltage,
    voltageSystem: `${input.panelVoltage}V` as any,
    applicationType: 'solar',
    conductorMaterial: input.conductorMaterial,
    ambientTemperature: input.ambientTemperature,
    loadType: 'continuous',
    allowableVoltageDropPercent: 2.0 // Efficiency critical
  };
  
  return calculateDCWireSize(dcInput);
}

/**
 * Note: Comprehensive wire tables are now located in /standards/dc/wireTables.ts
 * This provides application-specific wire data for automotive, marine, solar, telecom, battery, and LED applications.
 */

/**
 * Validate DC calculation input
 */
export function validateDCInput(input: DCCalculationInput): string[] {
  const errors: string[] = [];
  
  if (input.current <= 0) {
    errors.push('Current must be greater than 0');
  }
  
  if (input.length <= 0) {
    errors.push('Length must be greater than 0');
  }
  
  if (input.voltage <= 0) {
    errors.push('Voltage must be greater than 0');
  }
  
  if (input.ambientTemperature && (input.ambientTemperature < -40 || input.ambientTemperature > 150)) {
    errors.push('Ambient temperature must be between -40°C and 150°C');
  }
  
  const validApplications = ['automotive', 'marine', 'solar', 'telecom', 'battery', 'led'];
  if (!validApplications.includes(input.applicationType)) {
    errors.push(`Invalid application type. Must be one of: ${validApplications.join(', ')}`);
  }
  
  return errors;
}