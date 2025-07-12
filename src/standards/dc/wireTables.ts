import type { DCWireSpecification } from '../../types/standards';

/**
 * Comprehensive DC Wire Tables
 * Based on ISO 6722 (Automotive), ABYC (Marine), UL 4703 (Solar), and industry standards
 */

// Automotive Wire Table (ISO 6722, SAE J1128)
export const AUTOMOTIVE_WIRE_TABLE: DCWireSpecification[] = [
  {
    gauge: '20',
    awgSize: 20,
    crossSectionMm2: 0.52,
    diameter: 0.032,
    resistance: 10.15, // ohms per 1000 feet
    ampacity: { continuous: 11, intermittent: 14 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'led'],
    standards: ['ISO 6722', 'SAE J1128']
  },
  {
    gauge: '18',
    awgSize: 18,
    crossSectionMm2: 0.82,
    diameter: 0.040,
    resistance: 6.385,
    ampacity: { continuous: 16, intermittent: 20 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'led'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11']
  },
  {
    gauge: '16',
    awgSize: 16,
    crossSectionMm2: 1.31,
    diameter: 0.051,
    resistance: 4.016,
    ampacity: { continuous: 22, intermittent: 27 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'led'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11']
  },
  {
    gauge: '14',
    awgSize: 14,
    crossSectionMm2: 2.08,
    diameter: 0.064,
    resistance: 2.525,
    ampacity: { continuous: 32, intermittent: 40 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '12',
    awgSize: 12,
    crossSectionMm2: 3.31,
    diameter: 0.081,
    resistance: 1.588,
    ampacity: { continuous: 45, intermittent: 55 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery', 'telecom'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '10',
    awgSize: 10,
    crossSectionMm2: 5.26,
    diameter: 0.102,
    resistance: 0.999,
    ampacity: { continuous: 60, intermittent: 75 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery', 'telecom'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '8',
    awgSize: 8,
    crossSectionMm2: 8.37,
    diameter: 0.128,
    resistance: 0.628,
    ampacity: { continuous: 80, intermittent: 100 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '6',
    awgSize: 6,
    crossSectionMm2: 13.3,
    diameter: 0.162,
    resistance: 0.395,
    ampacity: { continuous: 105, intermittent: 130 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '4',
    awgSize: 4,
    crossSectionMm2: 21.2,
    diameter: 0.204,
    resistance: 0.249,
    ampacity: { continuous: 140, intermittent: 175 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '2',
    awgSize: 2,
    crossSectionMm2: 33.6,
    diameter: 0.257,
    resistance: 0.156,
    ampacity: { continuous: 190, intermittent: 240 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '1',
    awgSize: 1,
    crossSectionMm2: 42.4,
    diameter: 0.289,
    resistance: 0.124,
    ampacity: { continuous: 220, intermittent: 275 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '1/0',
    awgSize: 0,
    crossSectionMm2: 53.5,
    diameter: 0.325,
    resistance: 0.098,
    ampacity: { continuous: 260, intermittent: 325 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['automotive', 'marine', 'solar', 'battery'],
    standards: ['ISO 6722', 'SAE J1128', 'ABYC E-11', 'UL 4703']
  },
  {
    gauge: '2/0',
    awgSize: -1,
    crossSectionMm2: 67.4,
    diameter: 0.365,
    resistance: 0.078,
    ampacity: { continuous: 300, intermittent: 375 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['marine', 'solar', 'battery'],
    standards: ['ABYC E-11', 'UL 4703']
  },
  {
    gauge: '4/0',
    awgSize: -3,
    crossSectionMm2: 107,
    diameter: 0.460,
    resistance: 0.049,
    ampacity: { continuous: 380, intermittent: 475 },
    temperatureRating: 105,
    insulationType: 'TXL',
    applications: ['marine', 'solar', 'battery'],
    standards: ['ABYC E-11', 'UL 4703']
  }
];

// Marine Wire Table (ABYC E-11 standards)
export const MARINE_WIRE_TABLE: DCWireSpecification[] = [
  ...AUTOMOTIVE_WIRE_TABLE.filter(wire => wire.applications.includes('marine')).map(wire => ({
    ...wire,
    // Marine environment requires tinned copper and higher insulation ratings
    insulationType: 'Tinned Marine',
    temperatureRating: 105,
    // Reduced ampacity due to marine environment factors
    ampacity: {
      continuous: Math.round(wire.ampacity.continuous * 0.9),
      intermittent: wire.ampacity.intermittent ? Math.round(wire.ampacity.intermittent * 0.9) : undefined
    },
    standards: ['ABYC E-11', 'UL 1426', 'ISO 13297']
  }))
];

// Solar/Renewable Energy Wire Table (UL 4703, USE-2)
export const SOLAR_WIRE_TABLE: DCWireSpecification[] = [
  ...AUTOMOTIVE_WIRE_TABLE.filter(wire => wire.applications.includes('solar')).map(wire => ({
    ...wire,
    // Solar applications use UV-resistant insulation
    insulationType: 'USE-2 (UV Resistant)',
    temperatureRating: 90, // Standard solar wire rating
    // Higher ampacity for outdoor free-air installation
    ampacity: {
      continuous: Math.round(wire.ampacity.continuous * 1.1),
      intermittent: wire.ampacity.intermittent ? Math.round(wire.ampacity.intermittent * 1.1) : undefined
    },
    standards: ['UL 4703', 'USE-2', 'THWN-2']
  }))
];

// Telecommunications Wire Table (24V/48V systems)
export const TELECOM_WIRE_TABLE: DCWireSpecification[] = [
  {
    gauge: '24',
    awgSize: 24,
    crossSectionMm2: 0.20,
    diameter: 0.020,
    resistance: 25.67,
    ampacity: { continuous: 3.5, intermittent: 4.5 },
    temperatureRating: 75,
    insulationType: 'PVC',
    applications: ['telecom'],
    standards: ['TIA-569', 'UL 444']
  },
  {
    gauge: '22',
    awgSize: 22,
    crossSectionMm2: 0.33,
    diameter: 0.025,
    resistance: 16.14,
    ampacity: { continuous: 7, intermittent: 9 },
    temperatureRating: 75,
    insulationType: 'PVC',
    applications: ['telecom'],
    standards: ['TIA-569', 'UL 444']
  },
  ...AUTOMOTIVE_WIRE_TABLE.filter(wire => 
    wire.applications.includes('telecom') && wire.awgSize && wire.awgSize <= 12
  ).map(wire => ({
    ...wire,
    // Telecom applications use lower temperature rating but controlled environment
    temperatureRating: 75,
    insulationType: 'PVC/Plenum',
    standards: ['TIA-569', 'IEEE 802.3bt', 'ANSI/TIA-942']
  }))
];

// Battery System Wire Table (High current applications)
export const BATTERY_WIRE_TABLE: DCWireSpecification[] = [
  ...AUTOMOTIVE_WIRE_TABLE.filter(wire => wire.applications.includes('battery')).map(wire => ({
    ...wire,
    // Battery applications prioritize high current capacity
    insulationType: 'Battery Cable',
    temperatureRating: 105,
    // Enhanced ampacity for battery charging applications
    ampacity: {
      continuous: Math.round(wire.ampacity.continuous * 1.2),
      intermittent: wire.ampacity.intermittent ? Math.round(wire.ampacity.intermittent * 1.2) : undefined
    },
    standards: ['UL 1426', 'SAE J1127', 'Battery Council International']
  }))
];

// LED Lighting Wire Table (Low voltage, lower current)
export const LED_WIRE_TABLE: DCWireSpecification[] = [
  ...AUTOMOTIVE_WIRE_TABLE.filter(wire => 
    wire.applications.includes('led') && wire.awgSize && wire.awgSize >= 14
  ).map(wire => ({
    ...wire,
    // LED applications can use standard insulation
    insulationType: 'CL2/CL3',
    temperatureRating: 75,
    standards: ['UL 1569', 'UL 2089', 'CL2']
  }))
];

/**
 * Get wire table based on application type
 */
export function getWireTableByApplication(applicationType: string): DCWireSpecification[] {
  switch (applicationType) {
    case 'automotive':
      return AUTOMOTIVE_WIRE_TABLE;
    case 'marine':
      return MARINE_WIRE_TABLE;
    case 'solar':
      return SOLAR_WIRE_TABLE;
    case 'telecom':
      return TELECOM_WIRE_TABLE;
    case 'battery':
      return BATTERY_WIRE_TABLE;
    case 'led':
      return LED_WIRE_TABLE;
    default:
      return AUTOMOTIVE_WIRE_TABLE; // Default fallback
  }
}

/**
 * Get wire by gauge from specific application table
 */
export function getWireByGauge(gauge: string, applicationType: string): DCWireSpecification | undefined {
  const table = getWireTableByApplication(applicationType);
  return table.find(wire => wire.gauge === gauge);
}

/**
 * Get suitable wires for given current and application
 */
export function getSuitableWires(
  current: number, 
  applicationType: string, 
  loadType: 'continuous' | 'intermittent' = 'continuous'
): DCWireSpecification[] {
  const table = getWireTableByApplication(applicationType);
  
  return table.filter(wire => {
    const requiredAmpacity = loadType === 'continuous' ? 
      wire.ampacity.continuous : 
      (wire.ampacity.intermittent || wire.ampacity.continuous);
    
    return requiredAmpacity >= current;
  }).sort((a, b) => {
    // Sort by ampacity (smallest suitable wire first)
    const aAmpacity = loadType === 'continuous' ? a.ampacity.continuous : (a.ampacity.intermittent || a.ampacity.continuous);
    const bAmpacity = loadType === 'continuous' ? b.ampacity.continuous : (b.ampacity.intermittent || b.ampacity.continuous);
    return aAmpacity - bAmpacity;
  });
}

/**
 * Temperature correction factors for different applications
 */
export const TEMPERATURE_CORRECTION_FACTORS: Record<string, Record<number, number>> = {
  automotive: {
    '-40': 1.15, '-20': 1.10, '0': 1.05, '25': 1.00, '40': 0.95, 
    '60': 0.87, '80': 0.76, '100': 0.62, '125': 0.40
  },
  marine: {
    '-20': 1.10, '0': 1.05, '25': 1.00, '40': 0.95, '60': 0.87, '80': 0.76
  },
  solar: {
    '-40': 1.15, '-20': 1.10, '0': 1.05, '25': 1.00, '40': 0.95, 
    '60': 0.87, '70': 0.82, '80': 0.76, '90': 0.67
  },
  telecom: {
    '0': 1.05, '10': 1.02, '25': 1.00, '40': 0.95, '50': 0.87
  },
  battery: {
    '-20': 1.10, '0': 1.05, '25': 1.00, '40': 0.95, '60': 0.87
  },
  led: {
    '-10': 1.05, '0': 1.02, '25': 1.00, '40': 0.95, '60': 0.87, '70': 0.82
  }
};

/**
 * Get temperature correction factor for specific application and temperature
 */
export function getTemperatureCorrectionFactor(
  applicationType: string, 
  temperature: number
): number {
  const factors = TEMPERATURE_CORRECTION_FACTORS[applicationType];
  if (!factors) return 1.0;
  
  // Find closest temperature values
  const temps = Object.keys(factors).map(Number).sort((a, b) => a - b);
  
  if (temperature <= temps[0]) return factors[temps[0]];
  if (temperature >= temps[temps.length - 1]) return factors[temps[temps.length - 1]];
  
  // Linear interpolation between two closest values
  for (let i = 0; i < temps.length - 1; i++) {
    if (temperature >= temps[i] && temperature <= temps[i + 1]) {
      const t1 = temps[i];
      const t2 = temps[i + 1];
      const f1 = factors[t1];
      const f2 = factors[t2];
      
      // Linear interpolation
      const factor = f1 + ((f2 - f1) * (temperature - t1)) / (t2 - t1);
      return factor;
    }
  }
  
  return 1.0; // Fallback
}