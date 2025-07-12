import type { CableCalculationInput } from '../../types/standards';

export interface ElectricalTestScenario {
  name: string;
  description: string;
  input: CableCalculationInput;
  expectedResults: {
    recommendedCableSize?: string;
    voltageDropPercent?: number;
    isCompliant?: boolean;
    powerLossWatts?: number;
    efficiencyPercent?: number;
  };
  standard: 'NEC' | 'IEC';
  category: 'residential' | 'commercial' | 'industrial' | 'edge-case';
}

// NEC Test Scenarios
export const NEC_TEST_SCENARIOS: ElectricalTestScenario[] = [
  {
    name: 'Residential Kitchen Circuit',
    description: '20A kitchen circuit with GFCI protection',
    input: {
      standard: 'NEC',
      loadCurrent: 20,
      circuitLength: 75, // feet
      voltage: 120,
      voltageSystem: 'single',
      installationMethod: 'conduit',
      conductorMaterial: 'copper',
      ambientTemperature: 86, // °F
      numberOfConductors: 3,
      powerFactor: 1.0
    },
    expectedResults: {
      recommendedCableSize: '12',
      voltageDropPercent: 3.0,
      isCompliant: true
    },
    standard: 'NEC',
    category: 'residential'
  },
  {
    name: 'Commercial HVAC Unit',
    description: '3-phase 40A HVAC unit connection',
    input: {
      standard: 'NEC',
      loadCurrent: 40,
      circuitLength: 150, // feet
      voltage: 480,
      voltageSystem: 'three-phase',
      installationMethod: 'cable_tray',
      conductorMaterial: 'copper',
      ambientTemperature: 104, // °F
      numberOfConductors: 4,
      powerFactor: 0.85
    },
    expectedResults: {
      recommendedCableSize: '8',
      voltageDropPercent: 2.5,
      isCompliant: true
    },
    standard: 'NEC',
    category: 'commercial'
  },
  {
    name: 'Industrial Motor Feeder',
    description: '200A industrial motor feeder with long run',
    input: {
      standard: 'NEC',
      loadCurrent: 200,
      circuitLength: 500, // feet
      voltage: 480,
      voltageSystem: 'three-phase',
      installationMethod: 'conduit',
      conductorMaterial: 'aluminum',
      ambientTemperature: 113, // °F
      numberOfConductors: 4,
      powerFactor: 0.8
    },
    expectedResults: {
      recommendedCableSize: '4/0',
      voltageDropPercent: 4.8,
      isCompliant: true
    },
    standard: 'NEC',
    category: 'industrial'
  }
];

// IEC Test Scenarios
export const IEC_TEST_SCENARIOS: ElectricalTestScenario[] = [
  {
    name: 'European Residential Circuit',
    description: '16A residential circuit with RCD protection',
    input: {
      standard: 'IEC',
      loadCurrent: 16,
      circuitLength: 25, // meters
      voltage: 230,
      voltageSystem: 'single',
      installationMethod: 'B1',
      conductorMaterial: 'copper',
      ambientTemperature: 30, // °C
      numberOfConductors: 3,
      powerFactor: 1.0
    },
    expectedResults: {
      recommendedCableSize: '2.5',
      voltageDropPercent: 2.8,
      isCompliant: true
    },
    standard: 'IEC',
    category: 'residential'
  },
  {
    name: 'Industrial Motor 3-Phase',
    description: '32A three-phase motor in industrial environment',
    input: {
      standard: 'IEC',
      loadCurrent: 32,
      circuitLength: 50, // meters
      voltage: 400,
      voltageSystem: 'three-phase',
      installationMethod: 'B2',
      conductorMaterial: 'copper',
      ambientTemperature: 40, // °C
      numberOfConductors: 4,
      powerFactor: 0.8
    },
    expectedResults: {
      recommendedCableSize: '10',
      voltageDropPercent: 4.2,
      isCompliant: true
    },
    standard: 'IEC',
    category: 'industrial'
  },
  {
    name: 'Commercial Lighting Circuit',
    description: 'LED lighting circuit in office building',
    input: {
      standard: 'IEC',
      loadCurrent: 12,
      circuitLength: 80, // meters
      voltage: 230,
      voltageSystem: 'single',
      installationMethod: 'A1',
      conductorMaterial: 'copper',
      ambientTemperature: 25, // °C
      numberOfConductors: 3,
      powerFactor: 0.95
    },
    expectedResults: {
      recommendedCableSize: '4',
      voltageDropPercent: 2.1,
      isCompliant: true
    },
    standard: 'IEC',
    category: 'commercial'
  },
  {
    name: 'High Current Edge Case',
    description: 'Very high current with aluminum conductors',
    input: {
      standard: 'IEC',
      loadCurrent: 400,
      circuitLength: 100, // meters
      voltage: 400,
      voltageSystem: 'three-phase',
      installationMethod: 'C',
      conductorMaterial: 'aluminum',
      ambientTemperature: 50, // °C
      numberOfConductors: 4,
      powerFactor: 0.75
    },
    expectedResults: {
      recommendedCableSize: '240',
      voltageDropPercent: 4.9,
      isCompliant: true
    },
    standard: 'IEC',
    category: 'edge-case'
  }
];

// Conduit Fill Test Scenarios
export interface ConduitFillTestScenario {
  name: string;
  description: string;
  wires: Array<{
    gauge: string;
    count: number;
    insulationType: 'PVC' | 'XLPE';
  }>;
  conduitType: 'PVC' | 'Steel';
  expectedResults: {
    minimumConduitSize: string;
    fillPercent: number;
    isCompliant: boolean;
  };
}

export const CONDUIT_FILL_SCENARIOS: ConduitFillTestScenario[] = [
  {
    name: 'Residential Panel Feeder',
    description: 'Main panel feeder with multiple circuits',
    wires: [
      { gauge: '6', count: 3, insulationType: 'PVC' },
      { gauge: '16', count: 1, insulationType: 'PVC' }
    ],
    conduitType: 'PVC',
    expectedResults: {
      minimumConduitSize: '25',
      fillPercent: 29,
      isCompliant: true
    }
  },
  {
    name: 'Commercial Mixed Circuits',
    description: 'Multiple circuits in commercial installation',
    wires: [
      { gauge: '4', count: 4, insulationType: 'XLPE' },
      { gauge: '2.5', count: 6, insulationType: 'XLPE' },
      { gauge: '1.5', count: 3, insulationType: 'PVC' }
    ],
    conduitType: 'Steel',
    expectedResults: {
      minimumConduitSize: '32',
      fillPercent: 22.5,
      isCompliant: true
    }
  }
];

// Validation Test Cases
export interface ValidationTestCase {
  name: string;
  description: string;
  testFunction: () => boolean;
  expectedResult: boolean;
  category: 'boundary' | 'calculation' | 'compliance' | 'error-handling';
}

export const VALIDATION_TEST_CASES: ValidationTestCase[] = [
  {
    name: 'Zero Current Input',
    description: 'Test handling of zero current input',
    testFunction: () => {
      // This would test the actual calculation with zero current
      return true; // Placeholder
    },
    expectedResult: false,
    category: 'error-handling'
  },
  {
    name: 'Negative Voltage Drop',
    description: 'Ensure voltage drop is never negative',
    testFunction: () => {
      // This would test voltage drop calculation bounds
      return true; // Placeholder
    },
    expectedResult: true,
    category: 'boundary'
  },
  {
    name: 'Maximum Cable Size Lookup',
    description: 'Test largest available cable size',
    testFunction: () => {
      // This would test the largest cable in tables
      return true; // Placeholder
    },
    expectedResult: true,
    category: 'boundary'
  }
];

// Temperature test ranges
export const TEMPERATURE_TEST_RANGES = {
  NEC: {
    min: -40, // °F
    max: 194, // °F
    normal: [68, 86, 104, 122], // Common ambient temperatures
    extreme: [-40, -4, 158, 194] // Extreme conditions
  },
  IEC: {
    min: -40, // °C
    max: 90, // °C
    normal: [20, 30, 40, 50], // Common ambient temperatures
    extreme: [-40, -20, 70, 90] // Extreme conditions
  }
};

// Power factor test values
export const POWER_FACTOR_TEST_VALUES = [
  0.1,  // Very poor power factor
  0.5,  // Poor power factor
  0.7,  // Acceptable power factor
  0.8,  // Good power factor (typical motor)
  0.9,  // Very good power factor
  0.95, // Excellent power factor (LED lighting)
  1.0   // Unity power factor (resistive loads)
];

// Generate random test scenario
export function generateRandomTestScenario(standard: 'NEC' | 'IEC'): ElectricalTestScenario {
  const scenarios = standard === 'NEC' ? NEC_TEST_SCENARIOS : IEC_TEST_SCENARIOS;
  const baseScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  // Add some randomization to create variations
  return {
    ...baseScenario,
    name: `${baseScenario.name} (Random Variant)`,
    input: {
      ...baseScenario.input,
      loadCurrent: baseScenario.input.loadCurrent * (0.8 + Math.random() * 0.4),
      circuitLength: baseScenario.input.circuitLength * (0.5 + Math.random() * 1.0),
      powerFactor: POWER_FACTOR_TEST_VALUES[Math.floor(Math.random() * POWER_FACTOR_TEST_VALUES.length)]
    }
  };
}

// Performance test data generator
export function generateLargeDataset(count: number): ElectricalTestScenario[] {
  const scenarios: ElectricalTestScenario[] = [];
  
  for (let i = 0; i < count; i++) {
    const standard = Math.random() > 0.5 ? 'NEC' : 'IEC';
    scenarios.push(generateRandomTestScenario(standard));
  }
  
  return scenarios;
}