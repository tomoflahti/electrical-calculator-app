// Unit conversion utilities for electrical calculations

import type { ElectricalStandardId } from '../types/standards';

export interface WireConversion {
  awg: string;
  mm2: number;
  approximateEquivalent: boolean;
}

// AWG to mm² conversion table with approximate equivalents
export const AWG_TO_MM2_CONVERSION: WireConversion[] = [
  { awg: '14', mm2: 2.5, approximateEquivalent: true },
  { awg: '12', mm2: 4, approximateEquivalent: true },
  { awg: '10', mm2: 6, approximateEquivalent: true },
  { awg: '8', mm2: 10, approximateEquivalent: true },
  { awg: '6', mm2: 16, approximateEquivalent: true },
  { awg: '4', mm2: 25, approximateEquivalent: true },
  { awg: '3', mm2: 35, approximateEquivalent: true },
  { awg: '2', mm2: 35, approximateEquivalent: true },
  { awg: '1', mm2: 50, approximateEquivalent: true },
  { awg: '1/0', mm2: 70, approximateEquivalent: true },
  { awg: '2/0', mm2: 95, approximateEquivalent: true },
  { awg: '3/0', mm2: 120, approximateEquivalent: true },
  { awg: '4/0', mm2: 150, approximateEquivalent: true },
  { awg: '250', mm2: 185, approximateEquivalent: true },
  { awg: '300', mm2: 240, approximateEquivalent: true },
  { awg: '350', mm2: 300, approximateEquivalent: true },
  { awg: '400', mm2: 400, approximateEquivalent: false },
  { awg: '500', mm2: 500, approximateEquivalent: false }
];

/**
 * Convert AWG to approximate mm² equivalent
 */
export function awgToMm2(awg: string): number | null {
  const conversion = AWG_TO_MM2_CONVERSION.find(conv => conv.awg === awg);
  return conversion ? conversion.mm2 : null;
}

/**
 * Convert mm² to approximate AWG equivalent
 */
export function mm2ToAwg(mm2: number): string | null {
  const conversion = AWG_TO_MM2_CONVERSION.find(conv => conv.mm2 === mm2);
  return conversion ? conversion.awg : null;
}

/**
 * Get closest mm² size for a given AWG
 */
export function getClosestMm2(awg: string): number | null {
  return awgToMm2(awg);
}

/**
 * Get closest AWG size for a given mm²
 */
export function getClosestAwg(mm2: number): string | null {
  // Find the closest mm² value
  let closestConversion = AWG_TO_MM2_CONVERSION[0];
  let minDifference = Math.abs(closestConversion.mm2 - mm2);

  for (const conversion of AWG_TO_MM2_CONVERSION) {
    const difference = Math.abs(conversion.mm2 - mm2);
    if (difference < minDifference) {
      minDifference = difference;
      closestConversion = conversion;
    }
  }

  return closestConversion.awg;
}

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9;
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9 / 5) + 32;
}

/**
 * Format wire size display based on standard
 */
export function formatWireSize(size: string, standard: ElectricalStandardId): string {
  if (standard === 'NEC' || standard.startsWith('DC_')) {
    return `${size} AWG`;
  } else {
    return `${size} mm²`;
  }
}

/**
 * Get voltage options for a given standard
 */
export function getVoltageOptions(standard: ElectricalStandardId): { single: number[], threephase: number[], dc?: number[] } {
  switch (standard) {
    case 'NEC':
      return {
        single: [120, 240],
        threephase: [208, 240, 277, 480]
      };
    case 'IEC':
      return {
        single: [230],
        threephase: [400, 690]
      };
    case 'BS7671':
      return {
        single: [230],
        threephase: [400]
      };
    case 'DC_AUTOMOTIVE':
      return {
        single: [],
        threephase: [],
        dc: [12, 24]
      };
    case 'DC_MARINE':
      return {
        single: [],
        threephase: [],
        dc: [12, 24, 48]
      };
    case 'DC_SOLAR':
      return {
        single: [],
        threephase: [],
        dc: [12, 24, 48]
      };
    case 'DC_TELECOM':
      return {
        single: [],
        threephase: [],
        dc: [24, 48]
      };
    default:
      return { single: [120], threephase: [208] };
  }
}

/**
 * Get temperature rating options for a given standard
 */
export function getTemperatureOptions(standard: ElectricalStandardId): number[] {
  switch (standard) {
    case 'NEC':
      return [60, 75, 90];
    case 'IEC':
    case 'BS7671':
      return [70, 90];
    case 'DC_AUTOMOTIVE':
    case 'DC_MARINE':
    case 'DC_SOLAR':
    case 'DC_TELECOM':
      return [85, 105, 125]; // DC wire temperature ratings
    default:
      return [75];
  }
}

/**
 * Get installation methods for a given standard
 */
export function getInstallationMethods(standard: ElectricalStandardId): Array<{id: string, name: string}> {
  switch (standard) {
    case 'NEC':
      return [
        { id: 'conduit', name: 'In Conduit' },
        { id: 'cable_tray', name: 'Cable Tray' },
        { id: 'direct_burial', name: 'Direct Burial' },
        { id: 'free_air', name: 'Free Air' }
      ];
    case 'IEC':
    case 'BS7671':
      return [
        { id: 'A1', name: 'Single cable clipped direct' },
        { id: 'A2', name: 'Multi-core cable clipped direct' },
        { id: 'B1', name: 'Single cable in conduit on wall' },
        { id: 'B2', name: 'Multi-core cable in conduit on wall' },
        { id: 'C', name: 'Cables in conduit buried in ground' },
        { id: 'D1', name: 'Single cable direct buried' },
        { id: 'D2', name: 'Multi-core cable direct buried' },
        { id: 'E', name: 'Cables in free air' },
        { id: 'F', name: 'Single cable on perforated tray' },
        { id: 'G', name: 'Multi-core cable on tray' }
      ];
    case 'DC_AUTOMOTIVE':
      return [
        { id: 'automotive', name: 'Automotive Installation' },
        { id: 'free_air', name: 'Free Air' }
      ];
    case 'DC_MARINE':
      return [
        { id: 'marine', name: 'Marine Installation' },
        { id: 'conduit', name: 'In Conduit' },
        { id: 'free_air', name: 'Free Air' }
      ];
    case 'DC_SOLAR':
      return [
        { id: 'solar_outdoor', name: 'Solar Outdoor' },
        { id: 'solar_indoor', name: 'Solar Indoor' },
        { id: 'conduit', name: 'In Conduit' }
      ];
    case 'DC_TELECOM':
      return [
        { id: 'conduit', name: 'In Conduit' },
        { id: 'cable_tray', name: 'Cable Tray' }
      ];
    default:
      return [{ id: 'conduit', name: 'In Conduit' }];
  }
}