/**
 * Automotive Voltage System Definitions
 * 12V, 24V, 32V, and 48V automotive electrical systems
 */

import type { DCApplicationType } from '../../../types/standards';
import type { AutomotiveVoltage } from './iso8820Standards';

export interface AutomotiveVoltageSystem {
  voltage: AutomotiveVoltage;
  name: string;
  description: string;
  marketShare: number; // Percentage of automotive market
  applications: string[];
  typicalLoads: Array<{
    component: string;
    powerRange: string;
    currentRange: string;
    fuseRating: string;
  }>;
  efficiency: number; // System efficiency factor
  safetyFactors: {
    continuous: number;
    intermittent: number;
  };
  advantages: string[];
  disadvantages: string[];
  standards: string[];
}

export const AUTOMOTIVE_VOLTAGE_SYSTEMS: AutomotiveVoltageSystem[] = [
  {
    voltage: 12,
    name: '12V System',
    description: 'Standard passenger vehicle electrical system',
    marketShare: 85,
    applications: [
      'Passenger cars and light trucks',
      'Motorcycles and ATVs',
      'RVs and boats (house systems)',
      'Agricultural equipment',
      'Most aftermarket accessories'
    ],
    typicalLoads: [
      { component: 'LED Headlights', powerRange: '120-180W', currentRange: '10-15A', fuseRating: '15A' },
      { component: 'Cooling Fan', powerRange: '240-360W', currentRange: '20-30A', fuseRating: '30A' },
      { component: 'Interior Lighting', powerRange: '60-120W', currentRange: '5-10A', fuseRating: '10A' },
      { component: 'Audio System', powerRange: '120-240W', currentRange: '10-20A', fuseRating: '20A' },
      { component: 'Alternator', powerRange: '720-1440W', currentRange: '60-120A', fuseRating: '80-120A' },
      { component: 'Starter Motor', powerRange: '2400-4800W', currentRange: '200-400A', fuseRating: 'Circuit Breaker' },
      { component: 'Fog Lights', powerRange: '100-150W', currentRange: '8-12A', fuseRating: '15A' },
      { component: 'Electric Windows', powerRange: '120-180W', currentRange: '10-15A', fuseRating: '15A' }
    ],
    efficiency: 0.85,
    safetyFactors: {
      continuous: 1.25,
      intermittent: 1.15
    },
    advantages: [
      'Universal compatibility',
      'Extensive aftermarket support',
      'Well-established infrastructure',
      'Lower cost components',
      'Simplified wiring'
    ],
    disadvantages: [
      'Higher current requirements',
      'Thicker wire gauge needed',
      'Higher I²R losses',
      'Voltage drop issues over distance',
      'Limited high-power capability'
    ],
    standards: ['ISO 8820-3', 'SAE J1284', 'ISO 6722', 'SAE J1128']
  },
  {
    voltage: 24,
    name: '24V System',
    description: 'Commercial and heavy-duty vehicle electrical system',
    marketShare: 12,
    applications: [
      'Heavy trucks and commercial vehicles',
      'Buses and coaches',
      'Marine applications (larger vessels)',
      'Industrial and construction equipment',
      'Military vehicles'
    ],
    typicalLoads: [
      { component: 'LED Lighting', powerRange: '180-240W', currentRange: '7-10A', fuseRating: '10A' },
      { component: 'Cooling Fan', powerRange: '360-480W', currentRange: '15-20A', fuseRating: '20A' },
      { component: 'Cab Systems', powerRange: '240-360W', currentRange: '10-15A', fuseRating: '15A' },
      { component: 'Alternator', powerRange: '1440-2880W', currentRange: '60-120A', fuseRating: '80-120A' },
      { component: 'Starter Motor', powerRange: '4800-7200W', currentRange: '200-300A', fuseRating: 'Circuit Breaker' },
      { component: 'Air Conditioning', powerRange: '960-1440W', currentRange: '40-60A', fuseRating: '60A' },
      { component: 'Hydraulic Pump', powerRange: '720-1200W', currentRange: '30-50A', fuseRating: '50A' },
      { component: 'Work Lights', powerRange: '240-480W', currentRange: '10-20A', fuseRating: '20A' }
    ],
    efficiency: 0.90,
    safetyFactors: {
      continuous: 1.30,
      intermittent: 1.20
    },
    advantages: [
      'Lower current for same power',
      'Reduced wire gauge requirements',
      'Better voltage regulation',
      'Less voltage drop over distance',
      'Higher system efficiency'
    ],
    disadvantages: [
      'Limited consumer market',
      'Higher component costs',
      'Dual voltage complexity',
      'Specialized equipment needed',
      'Less aftermarket support'
    ],
    standards: ['ISO 8820-3', 'SAE J1284', 'ISO 6722', 'SAE J1128']
  },
  {
    voltage: 32,
    name: '32V System',
    description: 'Specialized hybrid and high-power vehicle applications',
    marketShare: 1,
    applications: [
      'Some hybrid vehicles',
      'High-power automotive applications',
      'Industrial mobile equipment',
      'Specialized commercial vehicles',
      'Military and aerospace applications'
    ],
    typicalLoads: [
      { component: 'Hybrid Auxiliaries', powerRange: '320-640W', currentRange: '10-20A', fuseRating: '20A' },
      { component: 'High-Power Lighting', powerRange: '240-480W', currentRange: '7-15A', fuseRating: '15A' },
      { component: 'Electric Cooling', powerRange: '480-960W', currentRange: '15-30A', fuseRating: '30A' },
      { component: 'Power Electronics', powerRange: '640-1280W', currentRange: '20-40A', fuseRating: '40A' },
      { component: 'Motor Controllers', powerRange: '960-1920W', currentRange: '30-60A', fuseRating: '60A' },
      { component: 'Auxiliary Systems', powerRange: '320-480W', currentRange: '10-15A', fuseRating: '15A' }
    ],
    efficiency: 0.92,
    safetyFactors: {
      continuous: 1.25,
      intermittent: 1.15
    },
    advantages: [
      'Higher efficiency than 24V',
      'Lower current requirements',
      'Good voltage regulation',
      'Suitable for high-power applications',
      'Reduced conductor sizing'
    ],
    disadvantages: [
      'Very limited market adoption',
      'Specialized components required',
      'Higher system complexity',
      'Limited fuse availability',
      'Minimal industry support'
    ],
    standards: ['ISO 8820-3', 'SAE J1284']
  },
  {
    voltage: 48,
    name: '48V System',
    description: 'Modern mild hybrid and high-power automotive systems',
    marketShare: 2,
    applications: [
      'Mild hybrid vehicles (48V starter-generator)',
      'Electric turbochargers and superchargers',
      'Active suspension systems',
      'High-power audio systems',
      'Electric AC compressors',
      'Hybrid vehicle auxiliary systems'
    ],
    typicalLoads: [
      { component: 'Starter-Generator', powerRange: '7200-14400W', currentRange: '150-300A', fuseRating: 'Circuit Breaker' },
      { component: 'Electric Turbocharger', powerRange: '4800-9600W', currentRange: '100-200A', fuseRating: 'Circuit Breaker' },
      { component: 'Active Suspension', powerRange: '2400-4800W', currentRange: '50-100A', fuseRating: '100A' },
      { component: 'Electric AC Compressor', powerRange: '1440-3840W', currentRange: '30-80A', fuseRating: '80A' },
      { component: 'High-Power Audio', powerRange: '960-2880W', currentRange: '20-60A', fuseRating: '60A' },
      { component: 'Electric Cooling', powerRange: '480-960W', currentRange: '10-20A', fuseRating: '20A' },
      { component: 'Auxiliary Systems', powerRange: '240-480W', currentRange: '5-10A', fuseRating: '10A' },
      { component: 'Electric Heater', powerRange: '1200-2400W', currentRange: '25-50A', fuseRating: '50A' }
    ],
    efficiency: 0.95,
    safetyFactors: {
      continuous: 1.20,
      intermittent: 1.10
    },
    advantages: [
      'Highest efficiency',
      'Lowest current for high power',
      'Excellent voltage regulation',
      'Future-proof technology',
      'Enables electrification features'
    ],
    disadvantages: [
      'Emerging technology',
      'Higher component costs',
      'Complex system integration',
      'Limited industry standardization',
      'Specialized safety requirements'
    ],
    standards: ['ISO 8820-3', 'SAE J1284', 'ISO 26262 (Functional Safety)']
  }
];

/**
 * Get automotive voltage system by voltage
 */
export function getAutomotiveVoltageSystem(voltage: AutomotiveVoltage): AutomotiveVoltageSystem {
  const system = AUTOMOTIVE_VOLTAGE_SYSTEMS.find(s => s.voltage === voltage);
  if (!system) {
    throw new Error(`Unsupported automotive voltage: ${voltage}V`);
  }
  return system;
}

/**
 * Get automotive efficiency factor by voltage
 */
export function getAutomotiveEfficiency(voltage: AutomotiveVoltage): number {
  return getAutomotiveVoltageSystem(voltage).efficiency;
}

/**
 * Get automotive safety factors by voltage
 */
export function getAutomotiveSafetyFactors(voltage: AutomotiveVoltage): {
  continuous: number;
  intermittent: number;
} {
  return getAutomotiveVoltageSystem(voltage).safetyFactors;
}

/**
 * Calculate automotive current from power and voltage
 */
export function calculateAutomotiveCurrent(
  power: number,
  voltage: AutomotiveVoltage,
  efficiencyFactor?: number
): number {
  const efficiency = efficiencyFactor || getAutomotiveEfficiency(voltage);
  return power / (voltage * efficiency);
}

/**
 * Get typical automotive load examples for voltage system
 */
export function getTypicalAutomotiveLoads(voltage: AutomotiveVoltage): Array<{
  component: string;
  powerRange: string;
  currentRange: string;
  fuseRating: string;
}> {
  return getAutomotiveVoltageSystem(voltage).typicalLoads;
}

/**
 * Get automotive voltage system recommendations
 */
export function getAutomotiveVoltageRecommendations(
  powerRequirement: number,
  applicationType: DCApplicationType
): AutomotiveVoltage[] {
  const recommendations: AutomotiveVoltage[] = [];
  
  // 12V suitable for most passenger vehicle applications
  if (powerRequirement <= 1500 && applicationType === 'automotive') {
    recommendations.push(12);
  }
  
  // 24V suitable for commercial vehicles and higher power
  if (powerRequirement <= 3000 && ['automotive', 'marine'].includes(applicationType)) {
    recommendations.push(24);
  }
  
  // 32V suitable for specialized applications
  if (powerRequirement <= 4000 && applicationType === 'automotive') {
    recommendations.push(32);
  }
  
  // 48V suitable for high-power hybrid applications
  if (powerRequirement <= 15000 && applicationType === 'automotive') {
    recommendations.push(48);
  }
  
  return recommendations;
}

/**
 * Compare automotive voltage systems for given power requirement
 */
export function compareAutomotiveVoltageSystems(powerRequirement: number): Array<{
  voltage: AutomotiveVoltage;
  current: number;
  efficiency: number;
  fuseRating: string;
  advantages: string[];
  disadvantages: string[];
}> {
  return AUTOMOTIVE_VOLTAGE_SYSTEMS.map(system => ({
    voltage: system.voltage,
    current: calculateAutomotiveCurrent(powerRequirement, system.voltage),
    efficiency: system.efficiency,
    fuseRating: calculateFuseRating(powerRequirement, system.voltage),
    advantages: system.advantages,
    disadvantages: system.disadvantages
  }));
}

/**
 * Helper function to calculate appropriate fuse rating
 */
function calculateFuseRating(power: number, voltage: AutomotiveVoltage): string {
  const current = calculateAutomotiveCurrent(power, voltage);
  const safetyFactors = getAutomotiveSafetyFactors(voltage);
  const adjustedCurrent = current * safetyFactors.continuous;
  
  if (adjustedCurrent > 120) {
    return 'Circuit Breaker Required';
  }
  
  // Common fuse ratings
  const fuseRatings = [0.5, 1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 35, 40, 50, 60, 70, 80, 100, 120];
  const recommendedFuse = fuseRatings.find(rating => rating >= adjustedCurrent);
  
  return recommendedFuse ? `${recommendedFuse}A` : 'Circuit Breaker Required';
}