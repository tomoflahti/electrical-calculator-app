/**
 * IEC Application Standards
 * Standards: IEC 60364 Series, EN 50110, IEC 60079
 */

import type { ConduitFillApplicationType, ConduitFillInstallationMethod } from '../../types/standards';

// IEC application requirements
export const IEC_APPLICATION_REQUIREMENTS: Record<ConduitFillApplicationType, {
  specialRequirements: string[];
  recommendedPractices: string[];
  temperatureRange: { min: number; max: number };
  environmentalFactors: string[];
  complianceStandards: string[];
}> = {
  residential: {
    specialRequirements: [
      'IEC 60364-5-51 equipment selection',
      'IEC 60364-4-41 protection against electric shock',
      'IEC 60364-4-43 overcurrent protection',
      'Fire resistant conduit materials in escape routes'
    ],
    recommendedPractices: [
      'Use smaller conduit sizes for easier installation',
      'Consider future expansion in main distribution boards',
      'Apply IP65 rating for outdoor installations',
      'Use halogen-free, low-smoke cables'
    ],
    temperatureRange: { min: -5, max: 35 },
    environmentalFactors: ['Indoor dry conditions', 'Minimal chemical exposure', 'Low vibration'],
    complianceStandards: ['IEC 60364-5-52', 'EN 50110-1', 'IEC 60529']
  },
  
  commercial: {
    specialRequirements: [
      'IEC 60364-5-52 wiring systems',
      'IEC 60364-4-442 thermal effects protection',
      'Emergency lighting circuit segregation',
      'Fire alarm circuit protection',
      'Accessibility compliance for maintenance'
    ],
    recommendedPractices: [
      'Use cable tray systems for large installations',
      'Implement cable management systems',
      'Color coding for different circuits',
      'Document all installations per IEC 60364-5-53'
    ],
    temperatureRange: { min: -10, max: 40 },
    environmentalFactors: ['Controlled environment', 'Moderate chemical exposure', 'Regular maintenance'],
    complianceStandards: ['IEC 60364-5-52', 'EN 50110-1', 'IEC 60947-1']
  },
  
  industrial: {
    specialRequirements: [
      'IEC 60364-4-482 fire protection',
      'IEC 60529 IP protection ratings',
      'Mechanical protection against impact',
      'Chemical resistance requirements',
      'Vibration and shock resistance'
    ],
    recommendedPractices: [
      'Use steel conduits for mechanical protection',
      'Install cable protection systems',
      'Regular thermal imaging inspections',
      'Implement predictive maintenance programs'
    ],
    temperatureRange: { min: -20, max: 60 },
    environmentalFactors: ['Harsh environments', 'Chemical exposure', 'High vibration', 'Dust and moisture'],
    complianceStandards: ['IEC 60364-5-52', 'IEC 60529', 'IEC 60947-1', 'EN 50110-1']
  },
  
  hazardous: {
    specialRequirements: [
      'IEC 60079 explosive atmosphere protection',
      'IEC 60364-4-482 fire protection measures',
      'Intrinsically safe circuit design',
      'Certified explosion-proof equipment',
      'Static electricity prevention'
    ],
    recommendedPractices: [
      'Use certified Ex equipment only',
      'Implement intrinsic safety barriers',
      'Regular inspection by certified personnel',
      'Maintain detailed documentation'
    ],
    temperatureRange: { min: -40, max: 85 },
    environmentalFactors: ['Explosive atmospheres', 'Extreme temperatures', 'Corrosive environments'],
    complianceStandards: ['IEC 60079-0', 'IEC 60079-14', 'IEC 60364-4-482', 'EN 50110-1']
  },

  data_center: {
    specialRequirements: [
      'IEC 62040 UPS systems',
      'IEC 61000 EMC requirements',
      'Redundant power distribution',
      'Emergency power off systems'
    ],
    recommendedPractices: [
      'Use dedicated circuits for critical systems',
      'Implement monitoring systems',
      'Plan for high-density cable routing',
      'Consider future expansion needs'
    ],
    temperatureRange: { min: 18, max: 25 },
    environmentalFactors: ['Controlled environment', 'High heat generation', 'EMI considerations'],
    complianceStandards: ['IEC 62040', 'IEC 61000', 'ISO/IEC 24764']
  },

  healthcare: {
    specialRequirements: [
      'IEC 60601 medical electrical equipment',
      'IEC 60364-7-710 medical locations',
      'Isolated power systems',
      'Emergency system requirements'
    ],
    recommendedPractices: [
      'Use medical-grade equipment',
      'Install redundant systems',
      'Regular testing protocols',
      'Maintain detailed documentation'
    ],
    temperatureRange: { min: 20, max: 26 },
    environmentalFactors: ['Patient safety critical', 'Cleaning chemicals', 'High reliability'],
    complianceStandards: ['IEC 60601', 'IEC 60364-7-710', 'EN 50110-1']
  },

  educational: {
    specialRequirements: [
      'IEC 60364-5-51 equipment selection',
      'Emergency lighting systems',
      'Fire alarm integration',
      'Safety systems for laboratories'
    ],
    recommendedPractices: [
      'Design for flexible classroom layouts',
      'Consider technology infrastructure',
      'Plan for laboratory requirements',
      'Implement energy management'
    ],
    temperatureRange: { min: 18, max: 24 },
    environmentalFactors: ['Heavy usage patterns', 'Safety considerations', 'Energy efficiency'],
    complianceStandards: ['IEC 60364-5-51', 'IEC 60364-5-56', 'EN 50110-1']
  },

  outdoor: {
    specialRequirements: [
      'IEC 60721 environmental conditions',
      'IP65 minimum protection rating',
      'UV-resistant materials',
      'Thermal expansion provisions'
    ],
    recommendedPractices: [
      'Use weatherproof equipment',
      'Install proper drainage',
      'Consider lightning protection',
      'Plan for maintenance access'
    ],
    temperatureRange: { min: -30, max: 50 },
    environmentalFactors: ['Weather exposure', 'UV radiation', 'Temperature cycling'],
    complianceStandards: ['IEC 60721', 'IEC 60529', 'EN 50110-1']
  },

  underground: {
    specialRequirements: [
      'IEC 60364-5-52 underground installations',
      'Concrete encasement requirements',
      'Groundwater protection',
      'Mechanical protection'
    ],
    recommendedPractices: [
      'Use proper burial depths',
      'Install warning systems',
      'Document installation details',
      'Consider future access needs'
    ],
    temperatureRange: { min: 0, max: 30 },
    environmentalFactors: ['Soil conditions', 'Groundwater', 'Mechanical stress'],
    complianceStandards: ['IEC 60364-5-52', 'IEC 60287', 'EN 50110-1']
  },

  marine: {
    specialRequirements: [
      'IEC 60092 electrical installations in ships',
      'Corrosion-resistant equipment',
      'Watertight enclosures',
      'Emergency power systems'
    ],
    recommendedPractices: [
      'Use marine-rated equipment',
      'Install sacrificial anodes',
      'Regular salt spray testing',
      'Implement corrosion monitoring'
    ],
    temperatureRange: { min: -10, max: 40 },
    environmentalFactors: ['Salt spray', 'High humidity', 'Corrosive environment'],
    complianceStandards: ['IEC 60092', 'IEC 60529', 'EN 50110-1']
  }
};

// IEC installation method factors
export const IEC_INSTALLATION_METHOD_FACTORS: Record<ConduitFillInstallationMethod, {
  temperatureFactor: number;
  environmentFactor: number;
  specialConsiderations: string[];
  applicableStandards: string[];
}> = {
  indoor: {
    temperatureFactor: 1.0,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Standard ambient temperature (20°C)',
      'Dry conditions',
      'Limited UV exposure',
      'Controlled environment'
    ],
    applicableStandards: ['IEC 60364-5-52', 'IEC 60529']
  },
  
  outdoor: {
    temperatureFactor: 1.1,
    environmentFactor: 1.15,
    specialConsiderations: [
      'Weatherproofing',
      'UV protection',
      'Temperature variations',
      'Moisture protection',
      'Wind loading considerations'
    ],
    applicableStandards: ['IEC 60364-5-52', 'IEC 60529', 'IEC 60721']
  },
  
  underground: {
    temperatureFactor: 1.0,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Concrete encasement',
      'Soil corrosion protection',
      'Groundwater protection',
      'Thermal stability',
      'Mechanical protection'
    ],
    applicableStandards: ['IEC 60364-5-52', 'IEC 60287', 'IEC 60529']
  },
  
  hazardous: {
    temperatureFactor: 1.05,
    environmentFactor: 1.2,
    specialConsiderations: [
      'Explosion-proof',
      'Intrinsically safe',
      'Chemical resistance',
      'Static electricity prevention',
      'Emergency shutdown systems'
    ],
    applicableStandards: ['IEC 60079-0', 'IEC 60079-14', 'IEC 60364-4-482']
  },
  
  wet_location: {
    temperatureFactor: 1.0,
    environmentFactor: 1.1,
    specialConsiderations: [
      'IP67 minimum protection',
      'Corrosion resistance',
      'Drainage provisions',
      'Sealed connections'
    ],
    applicableStandards: ['IEC 60364-5-52', 'IEC 60529']
  },
  
  concrete_slab: {
    temperatureFactor: 0.95,
    environmentFactor: 1.0,
    specialConsiderations: [
      'Thermal mass effects',
      'Expansion joints',
      'Vibration isolation',
      'Moisture barriers'
    ],
    applicableStandards: ['IEC 60364-5-52', 'IEC 60287']
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
    applicableStandards: ['IEC 60364-5-52', 'IEC 60826', 'EN 50341']
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
    applicableStandards: ['IEC 60364-5-52', 'IEC 60529']
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
    applicableStandards: ['IEC 61537', 'IEC 60364-5-52', 'EN 50085']
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
    applicableStandards: ['IEC 60364-5-52', 'IEC 60721', 'IEC 60529']
  }
};

// IEC temperature correction factors
export const IEC_TEMPERATURE_CORRECTION_FACTORS = {
  // Ambient temperature correction factors for different conductor ratings
  '70C': {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50, 65: 0.35, 70: 0.00
  },
  '90C': {
    10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 85: 0.29, 90: 0.00
  }
};

// IEC conductor material factors
export const IEC_CONDUCTOR_MATERIAL_FACTORS = {
  copper: {
    resistivity: 17.241, // nΩ·m at 20°C
    temperatureCoefficient: 0.00393, // /°C
    densityFactor: 8.96, // g/cm³
    thermalExpansion: 16.5e-6 // /°C
  },
  aluminum: {
    resistivity: 28.264, // nΩ·m at 20°C
    temperatureCoefficient: 0.00403, // /°C
    densityFactor: 2.70, // g/cm³
    thermalExpansion: 23.1e-6 // /°C
  }
};