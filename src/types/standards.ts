export type ElectricalStandardId = 'NEC' | 'IEC' | 'BS7671' | 'DC_AUTOMOTIVE' | 'DC_MARINE' | 'DC_SOLAR' | 'DC_TELECOM';
export type WireSystem = 'AWG' | 'mm2';
export type VoltageSystem = 'single' | 'three-phase' | 'dc';
export type DCVoltageSystem = '12V' | '24V' | '48V';
export type DCApplicationType = 'automotive' | 'marine' | 'solar' | 'telecom' | 'battery' | 'led' | 'industrial';
export type InstallationMethod = 'A1' | 'A2' | 'B1' | 'B2' | 'C' | 'D1' | 'D2' | 'E' | 'F' | 'G' | 'conduit' | 'cable_tray' | 'direct_burial' | 'free_air' | 'automotive' | 'marine' | 'solar_outdoor' | 'solar_indoor';

export interface ElectricalStandard {
  id: ElectricalStandardId;
  name: string;
  fullName: string;
  wireSystem: WireSystem;
  voltages: {
    singlePhase: number[];
    threePhase: number[];
    dc?: number[];
  };
  regions: string[];
  voltageDropLimits: {
    branch: number;
    feeder: number;
    total: number;
  };
  applicationType?: DCApplicationType;
}

export interface CableCrossSection {
  size: string;
  crossSectionMm2: number;
  currentCapacity60C?: number;
  currentCapacity70C?: number;
  currentCapacity75C?: number;
  currentCapacity90C?: number;
  resistance: number;
  reactance?: number;
  area?: number;
}

export interface InstallationMethodData {
  id: InstallationMethod;
  name: string;
  description: string;
  correctionFactor: number;
  applicableStandards: ElectricalStandardId[];
}

export interface CableCalculationInput {
  standard: ElectricalStandardId;
  loadCurrent: number;
  circuitLength: number;
  voltage: number;
  voltageSystem: VoltageSystem;
  installationMethod: InstallationMethod;
  conductorMaterial: 'copper' | 'aluminum';
  ambientTemperature?: number;
  numberOfConductors?: number;
  powerFactor?: number;
  groupingFactor?: number;
  thermalResistivity?: number;
}

export interface CableCalculationResult {
  recommendedCableSize: string;
  currentCapacity: number;
  voltageDropPercent: number;
  voltageDropVolts: number;
  correctionFactors: {
    temperature?: number;
    grouping?: number;
    installation?: number;
    thermal?: number;
  };
  compliance: {
    currentCompliant: boolean;
    voltageDropCompliant: boolean;
    standardCompliant: boolean;
  };
}

// Enhanced voltage drop analysis types
export interface VoltageDropResult {
  cableSize: string;
  crossSectionMm2: number;
  voltageDropPercent: number;
  voltageDropVolts: number;
  powerLossWatts: number;
  efficiencyPercent: number;
  isCompliant: boolean;
  currentCapacity: number;
  resistance: number;
  reactance: number;
}

export interface VoltageLimits {
  normal: number;
  sensitive: number;
}

export interface VoltageDropAnalysis {
  results: VoltageDropResult[];
  recommended?: VoltageDropResult;
  voltageLimits: VoltageLimits;
  analysisMetadata: {
    current: number;
    length: number;
    voltage: number;
    voltageSystem: string;
    conductorMaterial: string;
    powerFactor: number;
    ambientTemperature: number;
    installationMethod: string;
    loadType: string;
  };
}

export interface VoltageDropGraphPoint {
  distance: number;
  voltageDropPercent: number;
  voltageDropVolts: number;
  powerLossWatts: number;
  efficiencyPercent: number;
}

// Conduit fill types
export interface ConduitSpecification {
  size: string;
  internalDiameter: number;
  internalArea: number;
  type: 'PVC' | 'Steel' | 'EMT' | 'IMC' | 'RMC';
  standard: 'IEC' | 'NEC';
}

export interface WireSpecification {
  gauge: string;
  diameter: number;
  area: number;
  insulationType: string;
  insulationThickness: number;
  totalDiameter: number;
  totalArea: number;
}

export interface ConduitFillResult {
  conduitSize: string;
  fillPercent: number;
  maxWires: number;
  actualWires: number;
  isCompliant: boolean;
  availableArea: number;
  usedArea: number;
  wireBreakdown: WireBreakdown[];
}

export interface WireBreakdown {
  gauge: string;
  count: number;
  totalArea: number;
  percentage: number;
}

// DC-specific interfaces
export interface DCCalculationInput {
  current: number;
  length: number;
  voltage: number;
  voltageSystem: DCVoltageSystem;
  applicationType: DCApplicationType;
  conductorMaterial: 'copper' | 'aluminum';
  ambientTemperature?: number;
  installationMethod?: InstallationMethod;
  allowableVoltageDropPercent?: number;
  loadType?: 'continuous' | 'intermittent';
  wireStandard?: 'NEC' | 'IEC';
}

export interface DCCalculationResult {
  recommendedWireGauge: string;
  ampacity: number;
  voltageDropPercent: number;
  voltageDropVolts: number;
  powerLossWatts: number;
  efficiency: number;
  compliance: {
    ampacityCompliant: boolean;
    voltageDropCompliant: boolean;
    temperatureCompliant: boolean;
    applicationCompliant: boolean;
  };
  correctionFactors: {
    temperature: number;
    bundling?: number;
    ambient?: number;
  };
}

export interface DCWireSpecification {
  gauge: string;
  awgSize?: number;
  crossSectionMm2: number;
  diameter: number;
  resistance: number; // ohms per 1000 feet or meter
  ampacity: {
    continuous: number;
    intermittent?: number;
  };
  temperatureRating: number; // Celsius
  insulationType: string;
  applications: DCApplicationType[];
  standards: string[]; // ISO 6722, ABYC, UL, etc.
}

export interface DCApplicationStandard {
  type: DCApplicationType;
  name: string;
  description: string;
  voltageRange: number[];
  voltageDropLimits: {
    normal: number;
    critical: number;
  };
  temperatureRange: {
    min: number;
    max: number;
  };
  installationMethods: InstallationMethod[];
  wireStandards: string[];
  safetyFactors: {
    ampacity: number;
    voltageDropSafetyMargin: number;
  };
}

// DC Breaker types and interfaces
export type DCBreakerType = 'thermal-magnetic' | 'hydraulic-magnetic' | 'electronic' | 'thermal' | 'magnetic' | 'micro2' | 'micro3' | 'mini' | 'regular' | 'maxi' | 'mcase' | 'jcase';
export type DCDutyCycle = 'continuous' | 'intermittent';
export type DCBreakerStandard = 'UL489' | 'IEC60947' | 'IEC60898-1' | 'IEC60898-3' | 'IEC62619' | 'ABYC' | 'SAE' | 'UL1077' | 'ISO8820-3' | 'SAE J1284';

// Automotive fuse types
export type AutomotiveFuseType = 'micro2' | 'micro3' | 'mini' | 'regular' | 'maxi' | 'mcase' | 'jcase';
export type AutomotiveVoltage = 12 | 24 | 32 | 48;

export interface DCBreakerSpecification {
  rating: number; // Amperes
  type: DCBreakerType;
  voltage: number; // DC voltage rating
  standard: DCBreakerStandard;
  continuousDuty: boolean;
  temperatureRating: number; // Celsius
  applications: DCApplicationType[];
  interruptingCapacity?: number; // AIC rating
  tripCurve?: 'B' | 'C' | 'D' | 'K' | 'Z'; // Trip characteristic
  frameSize?: string;
  thermalRunawayProtection?: boolean; // IEC 62619:2022 thermal runaway protection
  color?: string; // Color coding for automotive fuses
  physicalSize?: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
  };
}

// Automotive fuse specification interface
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

export interface DCBreakerCalculationInput {
  // Input method selection
  inputMethod: 'current' | 'power';
  
  // Current-based inputs
  loadCurrent?: number; // Amperes (when inputMethod = 'current')
  
  // Power-based inputs
  loadPower?: number; // Watts (when inputMethod = 'power')
  systemVoltage?: number; // Volts DC (when inputMethod = 'power')
  
  // Common inputs
  applicationType: DCApplicationType;
  dutyCycle: DCDutyCycle;
  ambientTemperature?: number;
  
  // Solar-specific inputs
  shortCircuitCurrent?: number; // For solar applications
  numberOfPanels?: number; // For solar applications
  panelIsc?: number; // Panel short circuit current
  panelPower?: number; // Individual panel power rating
  
  // Advanced options
  continuousOperation?: boolean;
  wireGauge?: string; // For coordination verification
  wireStandard?: 'NEC' | 'IEC';
  environment?: 'indoor' | 'outdoor' | 'marine' | 'automotive';
  efficiencyFactor?: number; // Custom efficiency override
  powerFactor?: number; // For motor/reactive loads (default 1.0)
}

export interface DCBreakerCalculationResult {
  recommendedBreakerRating: number;
  breakerType: DCBreakerType;
  standard: DCBreakerStandard;
  calculationMethod: string;
  safetyFactor: number;
  adjustedCurrent: number;
  temperatureDerating?: number;
  
  // Power analysis (when input method is power-based)
  powerAnalysis?: {
    inputPower: number; // Original power input (watts)
    calculatedCurrent: number; // I = P/V (amperes)
    systemVoltage: number; // System voltage used
    efficiencyFactor: number; // Applied efficiency factor
    effectivePower: number; // Power after efficiency considerations
    powerLossWatts: number; // Power loss in watts
    powerFactor: number; // Power factor used
  };
  
  compliance: {
    standardCompliant: boolean;
    wireCompatible: boolean;
    applicationCompliant: boolean;
    temperatureCompliant: boolean;
  };
  availableBreakerSizes: number[];
  minimumBreakerSize: number;
  nextStandardSize: number;
  breakerRecommendations: {
    primary: DCBreakerSpecification;
    alternatives: DCBreakerSpecification[];
  };
}

// Conduit Fill Unified Types (Following DC Breaker Pattern)
export type ConduitFillApplicationType = 
  | 'residential'      // Single-family homes, apartments
  | 'commercial'       // Office buildings, retail
  | 'industrial'       // Manufacturing, heavy electrical
  | 'data_center'      // Server rooms, telecom
  | 'healthcare'       // Hospitals, medical facilities
  | 'educational'      // Schools, universities
  | 'outdoor'          // Exterior installations
  | 'hazardous'        // Explosive/hazardous locations
  | 'underground'      // Subway, tunnels
  | 'marine';          // Ports, offshore

export type ConduitFillInstallationMethod = 
  | 'underground'      // Direct burial, duct bank
  | 'overhead'         // Messenger supported, aerial
  | 'indoor'           // Building wiring, equipment rooms
  | 'outdoor'          // Weatherproof, UV resistant
  | 'hazardous'        // Explosion-proof, vapor-tight
  | 'wet_location'     // Pools, outdoor wet areas
  | 'dry_location'     // Interior dry areas
  | 'concrete_slab'    // Embedded in concrete
  | 'cable_tray'       // Open cable tray systems
  | 'free_air';        // Open air installations

export interface ConduitFillCalculationInput {
  // Wire specification
  wires: Array<{
    gauge: string;           // AWG ('14', '12', '10') or metric ('1.5', '2.5', '4')
    quantity: number;        // Number of wires
    insulation: string;      // 'THWN', 'THHN', 'PVC', 'XLPE', etc.
    wireType?: 'solid' | 'stranded';
    voltage?: number;        // Wire voltage rating
  }>;
  
  // Conduit specification
  conduitType: string;       // 'EMT', 'PVC', 'Steel', 'IMC', 'RMC' (NEC) or 'PVC', 'Steel' (IEC)
  conduitSize?: string;      // Specific size if known
  
  // Standards and application
  wireStandard: 'NEC' | 'IEC';
  applicationType: ConduitFillApplicationType;
  installationMethod: ConduitFillInstallationMethod;
  
  // Environmental factors
  ambientTemperature?: number;  // °C
  environment?: 'indoor' | 'outdoor' | 'wet' | 'dry' | 'corrosive';
  
  // Advanced options
  derating?: boolean;           // Apply derating factors
  futureFillReserve?: number;   // Percentage reserve for future wires
  cableManagement?: boolean;    // Consider cable management space
  
  // Validation options
  strictCompliance?: boolean;   // Enforce strict code compliance
  allowOversizing?: boolean;    // Allow oversized conduits
}

export interface ConduitFillCalculationResult {
  // Primary recommendation
  recommendedConduitSize: string;
  conduitType: string;
  wireStandard: 'NEC' | 'IEC';
  
  // Fill analysis
  fillAnalysis: {
    totalWireArea: number;           // Total wire area (sq in or sq mm)
    conduitInternalArea: number;     // Internal conduit area
    fillPercentage: number;          // Actual fill percentage
    maxAllowedFillPercentage: number; // Code maximum
    availableArea: number;           // Remaining area
    fillRule: '53% (1 wire)' | '31% (2 wires)' | '40% (3+ wires)';
  };
  
  // Compliance
  compliance: {
    codeCompliant: boolean;
    fillCompliant: boolean;
    temperatureCompliant: boolean;
    applicationCompliant: boolean;
    installationCompliant: boolean;
  };
  
  // Wire breakdown
  wireBreakdown: Array<{
    gauge: string;
    quantity: number;
    insulation: string;
    individualArea: number;
    totalArea: number;
    percentage: number;
  }>;
  
  // Alternative recommendations
  alternatives: Array<{
    conduitSize: string;
    conduitType: string;
    fillPercentage: number;
    isCompliant: boolean;
    costFactor?: number;
  }>;
  
  // Application-specific data
  applicationData: {
    applicationType: ConduitFillApplicationType;
    installationMethod: ConduitFillInstallationMethod;
    specialRequirements?: string[];
    recommendedPractices?: string[];
  };
  
  // Calculation metadata
  calculationMetadata: {
    calculationMethod: string;
    standardsUsed: string[];
    temperature: number;
    environment: string;
    safetyFactors: Record<string, number>;
    timestamp: Date;
  };
}