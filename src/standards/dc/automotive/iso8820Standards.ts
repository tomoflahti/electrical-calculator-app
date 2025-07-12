/**
 * ISO 8820-3 Automotive Fuse Standards
 * Road vehicles - Fuse-links specifications for 12V/24V/32V/48V systems
 * Current range: 0.5A - 120A
 */

import type { DCApplicationType } from '../../../types/standards';

export type AutomotiveFuseType = 'micro2' | 'micro3' | 'mini' | 'regular' | 'maxi' | 'mcase' | 'jcase';
export type AutomotiveVoltage = 12 | 24 | 32 | 48;

export interface DCAutomotiveFuseSpecification {
  rating: number; // Amperes
  type: AutomotiveFuseType;
  voltages: AutomotiveVoltage[]; // Compatible voltage systems
  color: string; // ISO 8820-3 color coding
  standard: 'ISO8820-3' | 'SAE J1284';
  physicalSize: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
  };
  applications: DCApplicationType[];
  temperatureRange: {
    min: number; // °C
    max: number; // °C
  };
  breakingCapacity: number; // Amperes
  voltageRating: number; // Maximum voltage
}

// ISO 8820-3 Automotive Fuse Specifications (Complete Range)
export const AUTOMOTIVE_FUSE_SPECIFICATIONS: DCAutomotiveFuseSpecification[] = [
  // Regular/Standard Fuses (ATO/ATC) - 0.5A to 40A
  {
    rating: 0.5,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'black',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 1,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'black',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 2,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'grey',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 3,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'violet',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 5,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'tan',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 7.5,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'brown',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 10,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'red',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 15,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'blue',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 20,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'yellow',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 25,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'white',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 30,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'green',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 35,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'light green',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 40,
    type: 'regular',
    voltages: [12, 24, 32, 48],
    color: 'orange',
    standard: 'ISO8820-3',
    physicalSize: { length: 19.1, width: 5.1, height: 18.5 },
    applications: ['automotive', 'marine'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },

  // Mini Fuses - 2A to 30A (Space-saving alternative)
  {
    rating: 2,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'grey',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 5,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'tan',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 10,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'red',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 15,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'blue',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 20,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'yellow',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 25,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'white',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 30,
    type: 'mini',
    voltages: [12, 24, 32, 48],
    color: 'green',
    standard: 'ISO8820-3',
    physicalSize: { length: 16.3, width: 5.1, height: 18.5 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },

  // Maxi Fuses - 20A to 120A (High current applications)
  {
    rating: 20,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'yellow',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 30,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'green',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 40,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'orange',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 50,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'red',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 60,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'blue',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 70,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'brown',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 80,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'clear',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 100,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'clear',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 120,
    type: 'maxi',
    voltages: [12, 24, 32, 48],
    color: 'clear',
    standard: 'ISO8820-3',
    physicalSize: { length: 29.2, width: 8.5, height: 34.3 },
    applications: ['automotive', 'marine', 'industrial'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },

  // Micro2 Fuses - 5A to 30A (Very compact)
  {
    rating: 5,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'tan',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 10,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'red',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 15,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'blue',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive', 'led'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 20,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'yellow',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 25,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'white',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  },
  {
    rating: 30,
    type: 'micro2',
    voltages: [12, 24, 32, 48],
    color: 'green',
    standard: 'ISO8820-3',
    physicalSize: { length: 15.0, width: 3.6, height: 16.6 },
    applications: ['automotive'],
    temperatureRange: { min: -40, max: 85 },
    breakingCapacity: 1000,
    voltageRating: 58
  }
];

/**
 * Get automotive fuse specifications for rating and voltage
 */
export function getAutomotiveFuseSpecifications(
  rating: number,
  voltage: AutomotiveVoltage,
  applicationType: DCApplicationType
): DCAutomotiveFuseSpecification[] {
  return AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(
    fuse => fuse.rating === rating && 
            fuse.voltages.includes(voltage) && 
            fuse.applications.includes(applicationType)
  );
}

/**
 * Get primary automotive fuse recommendation
 */
export function getPrimaryAutomotiveFuseRecommendation(
  rating: number,
  voltage: AutomotiveVoltage,
  applicationType: DCApplicationType
): DCAutomotiveFuseSpecification | null {
  const specifications = getAutomotiveFuseSpecifications(rating, voltage, applicationType);
  
  if (specifications.length === 0) return null;
  
  // Prioritize fuse type based on current rating and space constraints
  return specifications.sort((a, b) => {
    // For low current (≤10A), prefer micro2 for space saving
    if (rating <= 10 && a.type === 'micro2' && b.type !== 'micro2') return -1;
    if (rating <= 10 && a.type !== 'micro2' && b.type === 'micro2') return 1;
    
    // For medium current (10-40A), prefer regular fuses
    if (rating <= 40 && a.type === 'regular' && b.type !== 'regular') return -1;
    if (rating <= 40 && a.type !== 'regular' && b.type === 'regular') return 1;
    
    // For high current (>40A), prefer maxi fuses
    if (rating > 40 && a.type === 'maxi' && b.type !== 'maxi') return -1;
    if (rating > 40 && a.type !== 'maxi' && b.type === 'maxi') return 1;
    
    return 0;
  })[0];
}

/**
 * Get available automotive fuse ratings for voltage and application
 */
export function getAvailableAutomotiveFuseRatings(
  voltage: AutomotiveVoltage,
  applicationType: DCApplicationType
): number[] {
  const applicableFuses = AUTOMOTIVE_FUSE_SPECIFICATIONS.filter(
    fuse => fuse.voltages.includes(voltage) && fuse.applications.includes(applicationType)
  );
  
  return Array.from(new Set(applicableFuses.map(fuse => fuse.rating))).sort((a, b) => a - b);
}

/**
 * Get next available automotive fuse rating
 */
export function getNextAutomotiveFuseRating(
  targetRating: number,
  voltage: AutomotiveVoltage,
  applicationType: DCApplicationType
): number | null {
  const availableRatings = getAvailableAutomotiveFuseRatings(voltage, applicationType);
  const nextRating = availableRatings.find(rating => rating >= targetRating);
  return nextRating || null;
}

/**
 * Get automotive fuse color for rating and type
 */
export function getAutomotiveFuseColor(rating: number, type: AutomotiveFuseType): string {
  const fuse = AUTOMOTIVE_FUSE_SPECIFICATIONS.find(f => f.rating === rating && f.type === type);
  return fuse?.color || 'unknown';
}