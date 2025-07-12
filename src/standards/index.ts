import type { ElectricalStandard } from '../types/standards';

export const ELECTRICAL_STANDARDS: Record<string, ElectricalStandard> = {
  NEC: {
    id: 'NEC',
    name: 'NEC',
    fullName: 'National Electrical Code (US)',
    wireSystem: 'AWG',
    voltages: {
      singlePhase: [120, 240],
      threePhase: [208, 240, 277, 480]
    },
    regions: ['United States', 'Canada (modified)'],
    voltageDropLimits: {
      branch: 3.0,
      feeder: 2.5,
      total: 5.0
    }
  },
  IEC: {
    id: 'IEC',
    name: 'IEC 60364',
    fullName: 'International Electrotechnical Commission',
    wireSystem: 'mm2',
    voltages: {
      singlePhase: [230],
      threePhase: [400, 690]
    },
    regions: ['International', 'Most of Europe', 'Asia', 'Africa'],
    voltageDropLimits: {
      branch: 3.0,
      feeder: 2.0,
      total: 5.0
    }
  },
  BS7671: {
    id: 'BS7671',
    name: 'BS 7671',
    fullName: 'British Standard (18th Edition)',
    wireSystem: 'mm2',
    voltages: {
      singlePhase: [230],
      threePhase: [400]
    },
    regions: ['United Kingdom', 'Ireland'],
    voltageDropLimits: {
      branch: 3.0,
      feeder: 2.5,
      total: 5.0
    }
  },
  DC_AUTOMOTIVE: {
    id: 'DC_AUTOMOTIVE',
    name: 'DC Automotive',
    fullName: 'DC Automotive Systems (ISO 6722)',
    wireSystem: 'AWG',
    voltages: {
      singlePhase: [],
      threePhase: [],
      dc: [12, 24]
    },
    regions: ['Global - Automotive'],
    voltageDropLimits: {
      branch: 2.0,  // Stricter limits for automotive
      feeder: 1.5,
      total: 3.0
    },
    applicationType: 'automotive'
  },
  DC_MARINE: {
    id: 'DC_MARINE',
    name: 'DC Marine',
    fullName: 'DC Marine Systems (ABYC Standards)',
    wireSystem: 'AWG',
    voltages: {
      singlePhase: [],
      threePhase: [],
      dc: [12, 24, 48]
    },
    regions: ['Global - Marine'],
    voltageDropLimits: {
      branch: 3.0,  // ABYC recommended limits
      feeder: 2.0,
      total: 5.0
    },
    applicationType: 'marine'
  },
  DC_SOLAR: {
    id: 'DC_SOLAR',
    name: 'DC Solar',
    fullName: 'DC Solar/Renewable Energy Systems',
    wireSystem: 'AWG',
    voltages: {
      singlePhase: [],
      threePhase: [],
      dc: [12, 24, 48]
    },
    regions: ['Global - Solar/Renewable'],
    voltageDropLimits: {
      branch: 2.0,  // Efficiency critical
      feeder: 1.5,
      total: 3.0
    },
    applicationType: 'solar'
  },
  DC_TELECOM: {
    id: 'DC_TELECOM',
    name: 'DC Telecom',
    fullName: 'DC Telecommunications Systems',
    wireSystem: 'AWG',
    voltages: {
      singlePhase: [],
      threePhase: [],
      dc: [24, 48]
    },
    regions: ['Global - Telecommunications'],
    voltageDropLimits: {
      branch: 1.0,  // Very strict for telecom reliability
      feeder: 0.5,
      total: 2.0
    },
    applicationType: 'telecom'
  }
};

export const getStandard = (standardId: string): ElectricalStandard => {
  const standard = ELECTRICAL_STANDARDS[standardId];
  if (!standard) {
    throw new Error(`Unknown electrical standard: ${standardId}`);
  }
  return standard;
};

export const getAllStandards = (): ElectricalStandard[] => {
  return Object.values(ELECTRICAL_STANDARDS);
};

// DC-specific helper functions
export const getDCStandards = (): ElectricalStandard[] => {
  return Object.values(ELECTRICAL_STANDARDS).filter(standard => 
    standard.applicationType !== undefined
  );
};

export const getACStandards = (): ElectricalStandard[] => {
  return Object.values(ELECTRICAL_STANDARDS).filter(standard => 
    standard.applicationType === undefined
  );
};

export const getStandardsByApplication = (applicationType: string): ElectricalStandard[] => {
  return Object.values(ELECTRICAL_STANDARDS).filter(standard => 
    standard.applicationType === applicationType
  );
};

export const isDCStandard = (standardId: string): boolean => {
  const standard = ELECTRICAL_STANDARDS[standardId];
  return standard ? standard.applicationType !== undefined : false;
};

export const getDCVoltages = (standardId: string): number[] => {
  const standard = ELECTRICAL_STANDARDS[standardId];
  return standard?.voltages.dc || [];
};