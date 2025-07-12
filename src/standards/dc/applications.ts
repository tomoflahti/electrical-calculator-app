import type { DCApplicationStandard } from '../../types/standards';

/**
 * DC Application Standards
 * Defines voltage drop limits, temperature ranges, and safety factors
 * for different DC applications
 */

export const DC_APPLICATION_STANDARDS: Record<string, DCApplicationStandard> = {
  automotive: {
    type: 'automotive',
    name: 'Automotive Systems',
    description: 'ISO 6722 automotive wire and systems (12V/24V)',
    voltageRange: [12, 24],
    voltageDropLimits: {
      normal: 2.0,    // 2% for normal automotive loads
      critical: 1.0   // 1% for critical systems (ECU, safety)
    },
    temperatureRange: {
      min: -40,       // Extreme cold climate
      max: 125        // Engine compartment rating
    },
    installationMethods: ['automotive'],
    wireStandards: ['ISO 6722', 'SAE J1128', 'DIN 72551'],
    safetyFactors: {
      ampacity: 1.25,           // 25% derating for safety
      voltageDropSafetyMargin: 0.5  // Additional 0.5% margin
    }
  },

  marine: {
    type: 'marine',
    name: 'Marine Systems', 
    description: 'ABYC marine electrical systems (12V/24V/48V)',
    voltageRange: [12, 24, 48],
    voltageDropLimits: {
      normal: 3.0,    // ABYC standard 3%
      critical: 2.0   // Critical navigation/safety equipment
    },
    temperatureRange: {
      min: -20,       // Cold marine environments
      max: 80         // Hot engine rooms
    },
    installationMethods: ['marine'],
    wireStandards: ['ABYC E-11', 'UL 1426', 'ISO 13297'],
    safetyFactors: {
      ampacity: 1.2,            // 20% derating for marine environment
      voltageDropSafetyMargin: 0.5
    }
  },

  solar: {
    type: 'solar',
    name: 'Solar/Renewable Energy',
    description: 'Solar panel, battery, and renewable energy systems',
    voltageRange: [12, 24, 48],
    voltageDropLimits: {
      normal: 2.0,    // Efficiency critical - minimize losses
      critical: 1.0   // Battery charging circuits
    },
    temperatureRange: {
      min: -40,       // Cold climates
      max: 90         // Hot solar panel environments
    },
    installationMethods: ['solar_outdoor', 'solar_indoor'],
    wireStandards: ['UL 4703', 'USE-2', 'THWN-2'],
    safetyFactors: {
      ampacity: 1.25,           // NEC 690.8(A) requirement
      voltageDropSafetyMargin: 0.5
    }
  },

  telecom: {
    type: 'telecom',
    name: 'Telecommunications',
    description: '24V/48V telecommunications and data center power',
    voltageRange: [24, 48],
    voltageDropLimits: {
      normal: 1.0,    // Very strict for telecom reliability
      critical: 0.5   // Mission-critical equipment
    },
    temperatureRange: {
      min: 0,         // Controlled environments
      max: 50         // Data center temperatures
    },
    installationMethods: ['conduit', 'cable_tray'],
    wireStandards: ['TIA-569', 'IEEE 802.3bt', 'ANSI/TIA-942'],
    safetyFactors: {
      ampacity: 1.15,           // Minimal derating - controlled environment
      voltageDropSafetyMargin: 0.25
    }
  },

  battery: {
    type: 'battery',
    name: 'Battery Systems',
    description: 'Battery charging and energy storage systems',
    voltageRange: [12, 24, 48],
    voltageDropLimits: {
      normal: 1.5,    // Efficiency critical for battery charging
      critical: 1.0   // High current charging circuits
    },
    temperatureRange: {
      min: -20,       // Cold storage
      max: 60         // Battery room temperatures
    },
    installationMethods: ['conduit', 'cable_tray', 'direct_burial'],
    wireStandards: ['UL 1426', 'THWN-2', 'USE-2'],
    safetyFactors: {
      ampacity: 1.3,            // High current applications
      voltageDropSafetyMargin: 0.5
    }
  },

  led: {
    type: 'led',
    name: 'LED Lighting',
    description: 'Low voltage LED lighting systems',
    voltageRange: [12, 24],
    voltageDropLimits: {
      normal: 3.0,    // Acceptable for most LED applications
      critical: 2.0   // Color-critical or dimming applications
    },
    temperatureRange: {
      min: -10,       // Indoor/outdoor applications
      max: 70         // LED driver temperatures
    },
    installationMethods: ['conduit', 'free_air'],
    wireStandards: ['UL 1569', 'THWN', 'CL2'],
    safetyFactors: {
      ampacity: 1.15,           // Lower currents, minimal derating
      voltageDropSafetyMargin: 0.5
    }
  }
};

/**
 * Get application standard by type
 */
export const getApplicationStandard = (applicationType: string): DCApplicationStandard => {
  const standard = DC_APPLICATION_STANDARDS[applicationType];
  if (!standard) {
    throw new Error(`Unknown DC application type: ${applicationType}`);
  }
  return standard;
};

/**
 * Get all DC application types
 */
export const getAllApplicationTypes = (): string[] => {
  return Object.keys(DC_APPLICATION_STANDARDS);
};

/**
 * Get voltage drop limit for specific application and criticality
 */
export const getVoltageDropLimit = (
  applicationType: string, 
  isCritical: boolean = false
): number => {
  const standard = getApplicationStandard(applicationType);
  return isCritical ? standard.voltageDropLimits.critical : standard.voltageDropLimits.normal;
};

/**
 * Get temperature correction factor for application
 */
export const getTemperatureCorrectionFactor = (
  applicationType: string,
  ambientTemp: number
): number => {
  // Get standard for future use with detailed correction factors
  getApplicationStandard(applicationType);
  
  // Basic temperature correction (simplified)
  // More detailed correction factors would be in wire tables
  if (ambientTemp <= 30) return 1.0;
  if (ambientTemp <= 40) return 0.91;
  if (ambientTemp <= 50) return 0.82;
  if (ambientTemp <= 60) return 0.71;
  if (ambientTemp <= 70) return 0.58;
  if (ambientTemp <= 80) return 0.41;
  
  // Above standard rating
  return 0.25;
};