/**
 * NEC Application Standards
 * Standards: NEC Articles 210, 215, 314, 300, 500-516
 */

import type { ConduitFillApplicationType, ConduitFillInstallationMethod } from '../../types/standards';

// NEC application requirements
export const NEC_APPLICATION_REQUIREMENTS: Record<ConduitFillApplicationType, {
  specialRequirements: string[];
  recommendedPractices: string[];
  temperatureRange: { min: number; max: number };
  environmentalFactors: string[];
  complianceStandards: string[];
}> = {
  residential: {
    specialRequirements: [
      'NEC 314.16 box fill',
      'NEC 210.19 minimum conductor ampacity',
      'NEC 210.20 overcurrent protection',
      'NEC 250.118 equipment grounding',
      'AFCI/GFCI protection where required'
    ],
    recommendedPractices: [
      'Use 20A circuits for kitchen and bathroom outlets',
      'Install dedicated circuits for high-load appliances',
      'Consider future electrical needs',
      'Use readily accessible junction boxes'
    ],
    temperatureRange: { min: 10, max: 40 }, // °C
    environmentalFactors: ['Indoor dry conditions', 'Minimal chemical exposure', 'Low vibration'],
    complianceStandards: ['NEC 210', 'NEC 250', 'NEC 314', 'NEC 300']
  },
  
  commercial: {
    specialRequirements: [
      'NEC 314.28 pull box sizing',
      'NEC 215.2 feeder conductor sizing',
      'NEC 408.36 panelboard overcurrent protection',
      'Emergency system requirements per NEC 700',
      'Fire alarm circuit protection per NEC 760'
    ],
    recommendedPractices: [
      'Use cable tray systems for large installations',
      'Implement proper cable management',
      'Install monitoring systems',
      'Plan for future expansion'
    ],
    temperatureRange: { min: 0, max: 50 }, // °C
    environmentalFactors: ['Controlled environment', 'Moderate activity', 'Regular maintenance'],
    complianceStandards: ['NEC 215', 'NEC 314', 'NEC 408', 'NEC 700', 'NEC 760']
  },
  
  industrial: {
    specialRequirements: [
      'NEC 430 motor circuit requirements',
      'NEC 501-506 hazardous location compliance',
      'NEMA 4X in corrosive environments',
      'Mechanical protection requirements',
      'Arc flash protection measures'
    ],
    recommendedPractices: [
      'Use rigid conduit for mechanical protection',
      'Install vibration isolation',
      'Implement predictive maintenance',
      'Use explosion-proof equipment where required'
    ],
    temperatureRange: { min: -20, max: 70 }, // °C
    environmentalFactors: ['Harsh conditions', 'Chemical exposure', 'High vibration', 'Dust'],
    complianceStandards: ['NEC 430', 'NEC 501-506', 'NEMA 250', 'IEEE 3007']
  },
  
  hazardous: {
    specialRequirements: [
      'NEC 500-516 hazardous locations',
      'NEC 501.10 explosion-proof equipment',
      'NEC 504.20 intrinsically safe circuits',
      'Certified equipment only',
      'Proper sealing and drainage'
    ],
    recommendedPractices: [
      'Use only certified explosion-proof equipment',
      'Install intrinsic safety barriers',
      'Implement hot work permit systems',
      'Regular inspection by qualified personnel'
    ],
    temperatureRange: { min: -40, max: 85 }, // °C
    environmentalFactors: ['Explosive atmospheres', 'Extreme temperatures', 'Corrosive gases'],
    complianceStandards: ['NEC 500-516', 'API RP 500', 'NFPA 497', 'IEC 60079']
  },

  data_center: {
    specialRequirements: [
      'NEC 645 information technology equipment',
      'Redundant power distribution',
      'UPS system integration',
      'Emergency power off systems'
    ],
    recommendedPractices: [
      'Use dedicated circuits for critical systems',
      'Implement monitoring systems',
      'Plan for high-density cable routing',
      'Consider future expansion needs'
    ],
    temperatureRange: { min: 18, max: 25 }, // °C
    environmentalFactors: ['Controlled environment', 'High heat generation', 'EMI considerations'],
    complianceStandards: ['NEC 645', 'TIA-942', 'ISO/IEC 24764']
  },

  healthcare: {
    specialRequirements: [
      'NEC 517 health care facilities',
      'Isolated power systems',
      'Ground fault protection',
      'Emergency system requirements'
    ],
    recommendedPractices: [
      'Use hospital-grade equipment',
      'Install redundant systems',
      'Regular testing protocols',
      'Maintain detailed documentation'
    ],
    temperatureRange: { min: 20, max: 26 }, // °C
    environmentalFactors: ['Patient safety critical', 'Cleaning chemicals', 'High reliability'],
    complianceStandards: ['NEC 517', 'NFPA 99', 'IEC 60601']
  },

  educational: {
    specialRequirements: [
      'NEC 210.71 dwelling unit receptacles',
      'GFCI protection in labs',
      'Emergency lighting systems',
      'Fire alarm integration'
    ],
    recommendedPractices: [
      'Design for flexible classroom layouts',
      'Consider technology infrastructure',
      'Plan for laboratory requirements',
      'Implement energy management'
    ],
    temperatureRange: { min: 18, max: 24 }, // °C
    environmentalFactors: ['Heavy usage patterns', 'Safety considerations', 'Energy efficiency'],
    complianceStandards: ['NEC 210', 'NEC 700', 'ASHRAE 90.1']
  },

  outdoor: {
    specialRequirements: [
      'NEC 110.11 deteriorating agents',
      'NEMA 3R minimum enclosures',
      'UV-resistant materials',
      'Thermal expansion provisions'
    ],
    recommendedPractices: [
      'Use weatherproof equipment',
      'Install proper drainage',
      'Consider lightning protection',
      'Plan for maintenance access'
    ],
    temperatureRange: { min: -30, max: 50 }, // °C
    environmentalFactors: ['Weather exposure', 'UV radiation', 'Temperature cycling'],
    complianceStandards: ['NEC 110.11', 'NEMA 250', 'UL 508A']
  },

  underground: {
    specialRequirements: [
      'NEC 300.5 underground installations',
      'Concrete encasement requirements',
      'Groundwater protection',
      'Mechanical protection'
    ],
    recommendedPractices: [
      'Use proper burial depths',
      'Install warning tape',
      'Document installation details',
      'Consider future access needs'
    ],
    temperatureRange: { min: 0, max: 30 }, // °C
    environmentalFactors: ['Soil conditions', 'Groundwater', 'Mechanical stress'],
    complianceStandards: ['NEC 300.5', 'IEEE 516', 'NECA 230']
  },

  marine: {
    specialRequirements: [
      'NEC 555 marinas and boatyards',
      'Corrosion-resistant equipment',
      'GFCI protection requirements',
      'Shore power connections'
    ],
    recommendedPractices: [
      'Use marine-rated equipment',
      'Install sacrificial anodes',
      'Regular salt spray testing',
      'Implement corrosion monitoring'
    ],
    temperatureRange: { min: -10, max: 40 }, // °C
    environmentalFactors: ['Salt spray', 'High humidity', 'Corrosive environment'],
    complianceStandards: ['NEC 555', 'ABYC E-11', 'UL 1059']
  }
};

// NEC installation method factors
export const NEC_INSTALLATION_METHOD_FACTORS: Record<ConduitFillInstallationMethod, {
  temperatureFactor: number;
  environmentFactor: number;
  specialConsiderations: string[];
  applicableStandards: string[];
}> = {
  indoor: {
    temperatureFactor: 1.0,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Standard ambient temperature (30°C)',
      'Dry locations',
      'Controlled environment',
      'Accessible for maintenance'
    ],
    applicableStandards: ['NEC 300', 'NEC 314']
  },
  
  outdoor: {
    temperatureFactor: 1.1,
    environmentFactor: 1.15,
    specialConsiderations: [
      'Weatherproof enclosures',
      'UV-resistant materials',
      'Thermal expansion provisions',
      'Drainage requirements',
      'NEMA 3R minimum rating'
    ],
    applicableStandards: ['NEC 300', 'NEC 314', 'NEMA 250']
  },
  
  underground: {
    temperatureFactor: 1.0,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Concrete encasement per NEC 300.5',
      'Proper burial depth',
      'Corrosion protection',
      'Thermal considerations',
      'Warning tape installation'
    ],
    applicableStandards: ['NEC 300.5', 'NEC 314', 'NEMA 250']
  },
  
  hazardous: {
    temperatureFactor: 1.05,
    environmentFactor: 1.2,
    specialConsiderations: [
      'Explosion-proof construction',
      'Intrinsically safe circuits',
      'Proper sealing per NEC 501.15',
      'Certified equipment only',
      'Regular inspection requirements'
    ],
    applicableStandards: ['NEC 500-516', 'API RP 500', 'NFPA 497']
  },
  
  wet_location: {
    temperatureFactor: 1.0,
    environmentFactor: 1.1,
    specialConsiderations: [
      'NEMA 4X enclosures',
      'Proper drainage',
      'Corrosion-resistant materials',
      'Sealed connections',
      'GFCI protection'
    ],
    applicableStandards: ['NEC 300', 'NEC 314', 'NEMA 250']
  },
  
  concrete_slab: {
    temperatureFactor: 0.95,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Expansion joint provisions',
      'Proper concrete cover',
      'Corrosion protection',
      'Thermal mass effects',
      'Accessibility planning'
    ],
    applicableStandards: ['NEC 300.5', 'NEC 314', 'ACI 318']
  },

  overhead: {
    temperatureFactor: 1.1,
    environmentFactor: 1.2,
    specialConsiderations: [
      'Wind loading calculations',
      'Thermal expansion compensation',
      'Lightning protection',
      'Adequate clearances',
      'Support structure requirements'
    ],
    applicableStandards: ['NEC 225', 'NESC C2', 'IEEE 1222']
  },

  dry_location: {
    temperatureFactor: 1.0,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Standard indoor conditions',
      'Accessible installation',
      'Normal maintenance access',
      'Fire-rated construction'
    ],
    applicableStandards: ['NEC 300', 'NEC 314']
  },

  cable_tray: {
    temperatureFactor: 1.0,
    environmentFactor: 1.05,
    specialConsiderations: [
      'Cable support spacing',
      'Fill ratio requirements',
      'Ventilation provisions',
      'Accessibility for maintenance'
    ],
    applicableStandards: ['NEC 392', 'NEMA VE-1', 'IEEE 835']
  },

  free_air: {
    temperatureFactor: 1.15,
    environmentFactor: 1.3,
    specialConsiderations: [
      'Natural air circulation',
      'Weather protection',
      'UV degradation protection',
      'Support requirements'
    ],
    applicableStandards: ['NEC 310.15', 'NEC 225', 'NEMA 250']
  }
};

// NEC voltage drop limits (NEC 210.19(A) and 215.2(A))
export const NEC_VOLTAGE_DROP_LIMITS = {
  BRANCH_CIRCUIT: 3.0,  // Maximum 3% voltage drop
  FEEDER: 2.5,          // Maximum 2.5% voltage drop
  TOTAL: 5.0,           // Maximum 5% total voltage drop
  RECOMMENDED: 2.0      // Recommended maximum for efficiency
};

// NEC safety factors and multipliers
export const NEC_SAFETY_FACTORS = {
  CONTINUOUS_LOAD: 1.25,      // 125% for continuous loads
  MOTOR_STARTING: 1.25,       // 125% for motor starting
  FUTURE_EXPANSION: 1.25,     // 125% for future expansion
  ALUMINUM_MULTIPLIER: 1.64,  // Aluminum resistance multiplier
  CONDUIT_NIPPLE_FILL: 0.60   // 60% fill for conduit nipples
};

// NEC box fill requirements (NEC 314.16)
export const NEC_BOX_FILL_REQUIREMENTS = {
  CONDUCTOR_VOLUMES: {
    14: 2.0,   // Cubic inches per 14 AWG conductor
    12: 2.25,  // Cubic inches per 12 AWG conductor
    10: 2.5,   // Cubic inches per 10 AWG conductor
    8: 3.0,    // Cubic inches per 8 AWG conductor
    6: 5.0     // Cubic inches per 6 AWG conductor
  },
  
  DEVICE_VOLUMES: {
    'single_pole_switch': 2.0,
    'three_way_switch': 2.0,
    'duplex_receptacle': 2.0,
    'GFCI_receptacle': 2.0,
    'wire_connector': 0.0  // No additional volume
  },
  
  EQUIPMENT_GROUND: {
    'one_per_box': true,    // One equipment grounding conductor per box
    'largest_conductor': true // Based on largest conductor in box
  }
};