/**
 * IEC/Metric DC Circuit Breaker Specifications
 * International Standards: IEC 60947, IEC 62619, IEC 60898
 */

import type { DCBreakerSpecification, DCApplicationType } from '../../../types/standards';

// IEC/Metric DC Circuit Breaker Specifications
export const IEC_BREAKER_SPECIFICATIONS: DCBreakerSpecification[] = [
  // IEC 60947-2 Industrial Circuit Breakers
  {
    rating: 6,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom', 'led'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 10,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom', 'led'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 16,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 20,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 25,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 32,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 40,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 50,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 63,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 80,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 100,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 125,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 160,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 50000,
    tripCurve: 'C',
    frameSize: 'Large'
  },
  {
    rating: 200,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 50000,
    tripCurve: 'C',
    frameSize: 'Large'
  },
  {
    rating: 80,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 100,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 125,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },
  {
    rating: 160,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 50000,
    tripCurve: 'C',
    frameSize: 'Large'
  },
  {
    rating: 150,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 50000,
    tripCurve: 'C',
    frameSize: 'Large'
  },

  // IEC 62619:2022 Battery Energy Storage System Breakers
  {
    rating: 16,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 25,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 32,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 50,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 63,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 80,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 30000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 100,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 90,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 35000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },
  {
    rating: 60,
    type: 'electronic',
    voltage: 120,
    standard: 'IEC62619',
    continuousDuty: true,
    temperatureRating: 60,
    applications: ['battery'],
    interruptingCapacity: 30000,
    tripCurve: 'C',
    frameSize: 'ESS',
    thermalRunawayProtection: true
  },

  // IEC 60898-1 Miniature Circuit Breakers (≤48V DC)
  {
    rating: 1,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'led'],
    interruptingCapacity: 6000,
    tripCurve: 'B',
    frameSize: 'MCB'
  },
  {
    rating: 2,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'led'],
    interruptingCapacity: 6000,
    tripCurve: 'B',
    frameSize: 'MCB'
  },
  {
    rating: 6,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom', 'led'],
    interruptingCapacity: 6000,
    tripCurve: 'B',
    frameSize: 'MCB'
  },
  {
    rating: 10,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom', 'led'],
    interruptingCapacity: 6000,
    tripCurve: 'B',
    frameSize: 'MCB'
  },
  {
    rating: 15,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom'],
    interruptingCapacity: 6000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 16,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'telecom', 'battery'],
    interruptingCapacity: 6000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 20,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 25,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 30,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 32,
    type: 'thermal-magnetic',
    voltage: 48,
    standard: 'IEC60898-1',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'MCB'
  },
  {
    rating: 35,
    type: 'thermal-magnetic',
    voltage: 250,
    standard: 'IEC60947',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['automotive', 'marine', 'solar', 'battery'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'Industrial'
  },

  // IEC 60898-3 DC Miniature Circuit Breakers (>48V DC)
  {
    rating: 6,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'industrial'],
    interruptingCapacity: 10000,
    tripCurve: 'B',
    frameSize: 'DC-MCB'
  },
  {
    rating: 10,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'industrial'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 16,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 10000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 20,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 25,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 30,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['marine', 'solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 32,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 15000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 40,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 50,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 20000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  },
  {
    rating: 63,
    type: 'thermal-magnetic',
    voltage: 440,
    standard: 'IEC60898-3',
    continuousDuty: true,
    temperatureRating: 85,
    applications: ['solar', 'battery', 'industrial'],
    interruptingCapacity: 25000,
    tripCurve: 'C',
    frameSize: 'DC-MCB'
  }
];

/**
 * Get IEC breaker specifications for rating and application
 */
export function getIECBreakerSpecifications(
  rating: number,
  applicationType: DCApplicationType
): DCBreakerSpecification[] {
  return IEC_BREAKER_SPECIFICATIONS.filter(
    breaker => breaker.rating === rating && breaker.applications.includes(applicationType)
  );
}

/**
 * Get primary IEC breaker recommendation
 */
export function getPrimaryIECBreakerRecommendation(
  rating: number,
  applicationType: DCApplicationType
): DCBreakerSpecification | null {
  const specifications = getIECBreakerSpecifications(rating, applicationType);
  
  if (specifications.length === 0) return null;
  
  // Prioritize IEC62619 for battery, IEC60947 for industrial, IEC60898-3 for solar
  return specifications.sort((a, b) => {
    if (applicationType === 'battery' && a.standard === 'IEC62619' && b.standard !== 'IEC62619') return -1;
    if (applicationType === 'battery' && a.standard !== 'IEC62619' && b.standard === 'IEC62619') return 1;
    
    if (['solar', 'industrial'].includes(applicationType) && a.standard === 'IEC60947' && b.standard !== 'IEC60947') return -1;
    if (['solar', 'industrial'].includes(applicationType) && a.standard !== 'IEC60947' && b.standard === 'IEC60947') return 1;
    
    if (applicationType === 'solar' && a.standard === 'IEC60898-3' && b.standard !== 'IEC60898-3') return -1;
    if (applicationType === 'solar' && a.standard !== 'IEC60898-3' && b.standard === 'IEC60898-3') return 1;
    
    if (a.continuousDuty && !b.continuousDuty) return -1;
    if (!a.continuousDuty && b.continuousDuty) return 1;
    
    return 0;
  })[0];
}

/**
 * Get available IEC breaker ratings for application
 */
export function getAvailableIECBreakerRatings(applicationType: DCApplicationType): number[] {
  const applicableBreakers = IEC_BREAKER_SPECIFICATIONS.filter(
    breaker => breaker.applications.includes(applicationType)
  );
  
  return Array.from(new Set(applicableBreakers.map(breaker => breaker.rating))).sort((a, b) => a - b);
}