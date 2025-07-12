/**
 * DC Application Types and Common Definitions
 * Shared across both NEC and IEC standards
 */

import type { DCApplicationType } from '../../../types/standards';

// Application-specific voltage ranges (DC volts)
export const APPLICATION_VOLTAGE_RANGES: Record<DCApplicationType, { min: number; max: number }> = {
  automotive: { min: 12, max: 48 },     // 12V, 24V, 48V automotive systems
  marine: { min: 12, max: 48 },         // 12V, 24V, 32V, 48V marine systems  
  solar: { min: 12, max: 1000 },        // 12V to 1000V DC solar systems
  telecom: { min: 12, max: 60 },        // 12V, 24V, 48V, 60V telecom systems
  battery: { min: 12, max: 400 },       // 12V to 400V battery storage systems
  led: { min: 12, max: 48 },            // 12V, 24V, 48V LED lighting
  industrial: { min: 24, max: 600 }     // 24V to 600V industrial DC systems
};

// Application temperature operating ranges (Celsius)
export const APPLICATION_TEMPERATURE_RANGES: Record<DCApplicationType, { min: number; max: number }> = {
  automotive: { min: -40, max: 125 },   // Engine compartment extremes
  marine: { min: -20, max: 80 },        // Marine environment
  solar: { min: -40, max: 90 },         // Outdoor solar installations
  telecom: { min: -40, max: 65 },       // Telecom equipment rooms
  battery: { min: -20, max: 60 },       // Battery storage systems
  led: { min: -30, max: 85 },           // LED lighting installations
  industrial: { min: -10, max: 70 }     // Industrial facilities
};

// Application descriptions
export const APPLICATION_DESCRIPTIONS: Record<DCApplicationType, string> = {
  automotive: 'Automotive electrical systems (12V-48V)',
  marine: 'Marine and boat electrical systems (12V-48V)', 
  solar: 'Solar photovoltaic systems (12V-1000V)',
  telecom: 'Telecommunications equipment (12V-60V)',
  battery: 'Battery energy storage systems (12V-400V)',
  led: 'LED lighting systems (12V-48V)',
  industrial: 'Industrial DC systems (24V-600V)'
};

/**
 * Check if voltage is valid for application type
 */
export function isValidVoltageForApplication(voltage: number, applicationType: DCApplicationType): boolean {
  const range = APPLICATION_VOLTAGE_RANGES[applicationType];
  return voltage >= range.min && voltage <= range.max;
}

/**
 * Check if temperature is valid for application type
 */
export function isValidTemperatureForApplication(temperature: number, applicationType: DCApplicationType): boolean {
  const range = APPLICATION_TEMPERATURE_RANGES[applicationType];
  return temperature >= range.min && temperature <= range.max;
}