/**
 * Wire Calculator Router
 * Universal routing system for wire size calculations
 * Routes to appropriate calculation engine based on selected standard
 * Following DC Breaker and Conduit Fill Router architecture pattern
 */

import type { 
  ElectricalStandardId,
  DCCalculationInput,
  VoltageSystem,
  InstallationMethod,
  DCApplicationType,
  DCVoltageSystem
} from '../../types/standards';

// Import separated calculation engines
import { calculateNECWireSize } from './necWireCalculations';
import { calculateIECWireSize } from './iecWireCalculations';
import { calculateBS7671WireSize } from './bs7671WireCalculations';
import { calculateDCWireSize } from './dc';

/**
 * Unified Wire Calculation Input Interface
 * Supports all wire standards (NEC, IEC, BS7671, DC)
 */
export interface WireCalculationInput {
  // Standard selection
  standard: ElectricalStandardId;
  
  // Core electrical parameters
  loadCurrent: number;           // Amperes
  circuitLength: number;         // Meters or feet (based on standard)
  voltage: number;               // Volts
  voltageSystem: VoltageSystem;  // 'single', 'three-phase', 'dc'
  
  // Installation parameters
  installationMethod: InstallationMethod;
  conductorMaterial: 'copper' | 'aluminum';
  
  // Environmental factors
  ambientTemperature?: number;   // Celsius
  numberOfConductors?: number;   // Number of current-carrying conductors
  powerFactor?: number;          // 0.0 to 1.0 (AC only)
  
  // Advanced parameters
  groupingFactor?: number;       // Manual grouping factor override
  thermalResistivity?: number;   // Thermal resistivity of soil (underground)
  temperatureRating?: 60 | 75 | 90;  // Conductor temperature rating
  
  // DC-specific parameters
  dcVoltageSystem?: DCVoltageSystem;     // '12V', '24V', '48V'
  dcApplicationType?: DCApplicationType; // 'automotive', 'marine', 'solar', etc.
  loadType?: 'continuous' | 'intermittent';
  allowableVoltageDropPercent?: number;  // Custom voltage drop limit
  
  // Validation options
  strictCompliance?: boolean;    // Enforce strict code compliance
  includeNECMultiplier?: boolean; // Apply NEC 1.25x continuous load multiplier
  calculateDerating?: boolean;   // Calculate all derating factors
}

/**
 * Unified Wire Calculation Result Interface
 * Standardized output for all calculation engines
 */
export interface WireCalculationResult {
  // Primary recommendation
  recommendedWireSize: string;           // Wire gauge/size (AWG or mm²)
  currentCapacity: number;               // Ampacity in amperes
  
  // Voltage drop analysis
  voltageDropPercent: number;            // Percentage voltage drop
  voltageDropVolts: number;              // Voltage drop in volts
  powerLossWatts?: number;               // Power loss in circuit
  efficiency?: number;                   // Circuit efficiency percentage
  
  // Correction factors applied
  correctionFactors: {
    temperature?: number;                // Temperature correction
    grouping?: number;                   // Grouping/bundling correction
    installation?: number;               // Installation method correction
    thermal?: number;                    // Thermal resistivity correction
    altitude?: number;                   // Altitude correction (if applicable)
  };
  
  // Compliance verification
  compliance: {
    currentCompliant: boolean;           // Meets current capacity requirements
    voltageDropCompliant: boolean;       // Meets voltage drop limits
    standardCompliant: boolean;          // Overall standard compliance
    temperatureCompliant: boolean;       // Temperature rating compliance
    installationCompliant: boolean;      // Installation method compliance
  };
  
  // Calculation metadata
  calculationMetadata: {
    standardUsed: ElectricalStandardId;  // Which standard was applied
    calculationMethod: string;           // Calculation methodology
    voltageDropLimit: number;            // Applied voltage drop limit
    safetyFactors: Record<string, number>; // Applied safety factors
    assumptionsMade: string[];           // Assumptions in calculation
    warningsGenerated: string[];         // Warnings or notes
  };
  
  // Alternative recommendations
  alternatives?: Array<{
    wireSize: string;
    currentCapacity: number;
    voltageDropPercent: number;
    isCompliant: boolean;
    costFactor?: number;                 // Relative cost factor
    availabilityFactor?: number;         // Availability factor
  }>;
  
  // DC-specific results
  dcSpecificResults?: {
    dcApplicationType: DCApplicationType;
    dcVoltageSystem: DCVoltageSystem;
    batteryVoltageAtLoad?: number;       // Battery terminal voltage
    startupCurrentHandling?: boolean;    // Handles startup current
    temperatureDerating?: number;        // DC temperature derating
  };
}

/**
 * Main wire calculation function
 * Routes to appropriate engine based on selected standard
 */
export function calculateWireSize(input: WireCalculationInput): WireCalculationResult {
  const standard = input.standard;
  
  // Validate input before routing
  const validationErrors = validateWireCalculationInput(input);
  if (validationErrors.length > 0) {
    throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
  }
  
  // Route to appropriate calculation engine
  if (standard === 'NEC') {
    return calculateNECWireSize(input);
  } else if (standard === 'IEC') {
    return calculateIECWireSize(input);
  } else if (standard === 'BS7671') {
    return calculateBS7671WireSize(input);
  } else if (isDCStandard(standard)) {
    // Convert to DC calculation input format
    const dcInput: DCCalculationInput = {
      current: input.loadCurrent,
      length: input.circuitLength,
      voltage: input.voltage,
      voltageSystem: input.dcVoltageSystem || '12V',
      applicationType: input.dcApplicationType || 'automotive',
      conductorMaterial: input.conductorMaterial,
      ambientTemperature: input.ambientTemperature,
      installationMethod: input.installationMethod,
      allowableVoltageDropPercent: input.allowableVoltageDropPercent,
      loadType: input.loadType || 'continuous',
      wireStandard: 'NEC' // Default for DC calculations
    };
    
    const dcResult = calculateDCWireSize(dcInput);
    
    // Convert DC result to unified format
    return {
      recommendedWireSize: dcResult.recommendedWireGauge,
      currentCapacity: dcResult.ampacity,
      voltageDropPercent: dcResult.voltageDropPercent,
      voltageDropVolts: dcResult.voltageDropVolts,
      powerLossWatts: dcResult.powerLossWatts,
      efficiency: dcResult.efficiency,
      correctionFactors: {
        temperature: dcResult.correctionFactors.temperature,
        grouping: dcResult.correctionFactors.bundling || 1.0,
        installation: 1.0,
        thermal: 1.0
      },
      compliance: {
        currentCompliant: dcResult.compliance.ampacityCompliant,
        voltageDropCompliant: dcResult.compliance.voltageDropCompliant,
        standardCompliant: dcResult.compliance.applicationCompliant,
        temperatureCompliant: dcResult.compliance.temperatureCompliant,
        installationCompliant: true
      },
      calculationMetadata: {
        standardUsed: standard,
        calculationMethod: 'DC Wire Calculation Engine',
        voltageDropLimit: input.allowableVoltageDropPercent || 2,
        safetyFactors: {
          temperatureCorrection: dcResult.correctionFactors.temperature
        },
        assumptionsMade: ['Using DC calculation engine'],
        warningsGenerated: []
      },
      dcSpecificResults: {
        dcApplicationType: input.dcApplicationType || 'automotive',
        dcVoltageSystem: input.dcVoltageSystem || '12V',
        batteryVoltageAtLoad: input.voltage - dcResult.voltageDropVolts,
        temperatureDerating: dcResult.correctionFactors.temperature
      }
    };
  } else {
    throw new Error(`Unsupported electrical standard: ${standard}. Use 'NEC', 'IEC', 'BS7671', or DC standards.`);
  }
}

/**
 * Validate wire calculation input (common validation for all standards)
 */
export function validateWireCalculationInput(input: WireCalculationInput): string[] {
  const errors: string[] = [];

  // Basic electrical parameters
  if (!input.loadCurrent || input.loadCurrent <= 0) {
    errors.push('Load current must be greater than 0');
  }
  if (input.loadCurrent > 10000) {
    errors.push('Load current exceeds maximum supported value (10000A)');
  }

  if (!input.circuitLength || input.circuitLength <= 0) {
    errors.push('Circuit length must be greater than 0');
  }
  if (input.circuitLength > 10000) {
    errors.push('Circuit length exceeds maximum supported value (10000m/ft)');
  }

  if (!input.voltage || input.voltage <= 0) {
    errors.push('Voltage must be greater than 0');
  }
  if (input.voltage > 50000) {
    errors.push('Voltage exceeds maximum supported value (50kV)');
  }

  if (!input.voltageSystem) {
    errors.push('Voltage system must be specified');
  }

  if (!input.installationMethod) {
    errors.push('Installation method must be specified');
  }

  if (!input.conductorMaterial) {
    errors.push('Conductor material must be specified');
  }

  // Environmental parameters
  if (input.ambientTemperature !== undefined) {
    if (input.ambientTemperature < -50 || input.ambientTemperature > 200) {
      errors.push('Ambient temperature must be between -50°C and 200°C');
    }
  }

  if (input.numberOfConductors !== undefined) {
    if (input.numberOfConductors < 1 || input.numberOfConductors > 100) {
      errors.push('Number of conductors must be between 1 and 100');
    }
  }

  if (input.powerFactor !== undefined) {
    if (input.powerFactor <= 0 || input.powerFactor > 1.0) {
      errors.push('Power factor must be between 0 and 1.0');
    }
  }

  // Standard-specific validation
  if (input.standard === 'NEC') {
    errors.push(...validateNECSpecificConstraints(input));
  } else if (input.standard === 'IEC') {
    errors.push(...validateIECSpecificConstraints(input));
  } else if (input.standard === 'BS7671') {
    errors.push(...validateBS7671SpecificConstraints(input));
  } else if (isDCStandard(input.standard)) {
    errors.push(...validateDCSpecificConstraints(input));
  }

  return errors;
}

/**
 * Validate NEC-specific constraints
 */
function validateNECSpecificConstraints(input: WireCalculationInput): string[] {
  const errors: string[] = [];

  // NEC voltage systems
  if (input.voltageSystem === 'dc' && input.standard === 'NEC') {
    errors.push('Use DC-specific standards for DC calculations (DC_AUTOMOTIVE, DC_MARINE, DC_SOLAR, DC_TELECOM)');
  }

  // NEC installation methods
  const necInstallationMethods = ['conduit', 'cable_tray', 'direct_burial', 'free_air'];
  if (!necInstallationMethods.includes(input.installationMethod)) {
    errors.push(`Invalid NEC installation method. Must be one of: ${necInstallationMethods.join(', ')}`);
  }

  // NEC temperature ratings
  if (input.temperatureRating && ![60, 75, 90].includes(input.temperatureRating)) {
    errors.push('NEC temperature rating must be 60°C, 75°C, or 90°C');
  }

  return errors;
}

/**
 * Validate IEC-specific constraints
 */
function validateIECSpecificConstraints(input: WireCalculationInput): string[] {
  const errors: string[] = [];

  // IEC installation methods
  const iecInstallationMethods = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2', 'E', 'F', 'G'];
  if (!iecInstallationMethods.includes(input.installationMethod)) {
    errors.push(`Invalid IEC installation method. Must be one of: ${iecInstallationMethods.join(', ')}`);
  }

  // IEC voltage systems
  if (input.voltageSystem === 'dc' && input.standard === 'IEC') {
    errors.push('Use DC-specific standards for DC calculations');
  }

  return errors;
}

/**
 * Validate BS7671-specific constraints
 */
function validateBS7671SpecificConstraints(input: WireCalculationInput): string[] {
  const errors: string[] = [];

  // BS7671 installation methods (similar to IEC)
  const bs7671InstallationMethods = ['A1', 'A2', 'B1', 'B2', 'C', 'D1', 'D2', 'E', 'F', 'G'];
  if (!bs7671InstallationMethods.includes(input.installationMethod)) {
    errors.push(`Invalid BS7671 installation method. Must be one of: ${bs7671InstallationMethods.join(', ')}`);
  }

  return errors;
}

/**
 * Validate DC-specific constraints
 */
function validateDCSpecificConstraints(input: WireCalculationInput): string[] {
  const errors: string[] = [];

  // DC voltage system is required
  if (!input.dcVoltageSystem) {
    errors.push('DC voltage system must be specified for DC calculations');
  }

  // DC application type is required
  if (!input.dcApplicationType) {
    errors.push('DC application type must be specified for DC calculations');
  }

  // DC voltage system validation
  if (input.dcVoltageSystem && !['12V', '24V', '48V'].includes(input.dcVoltageSystem)) {
    errors.push('DC voltage system must be 12V, 24V, or 48V');
  }

  // DC application type validation
  const dcApplicationTypes = ['automotive', 'marine', 'solar', 'telecom', 'battery', 'led', 'industrial'];
  if (input.dcApplicationType && !dcApplicationTypes.includes(input.dcApplicationType)) {
    errors.push(`Invalid DC application type. Must be one of: ${dcApplicationTypes.join(', ')}`);
  }

  // DC installation methods
  const dcInstallationMethods = ['automotive', 'marine', 'solar_outdoor', 'solar_indoor', 'free_air'];
  if (!dcInstallationMethods.includes(input.installationMethod)) {
    errors.push(`Invalid DC installation method. Must be one of: ${dcInstallationMethods.join(', ')}`);
  }

  return errors;
}

/**
 * Check if standard is DC-based
 */
export function isDCStandard(standard: ElectricalStandardId): boolean {
  return ['DC_AUTOMOTIVE', 'DC_MARINE', 'DC_SOLAR', 'DC_TELECOM'].includes(standard);
}

/**
 * Get standard-specific defaults for form initialization
 */
export function getStandardDefaults(standard: ElectricalStandardId): Partial<WireCalculationInput> {
  const baseDefaults: Partial<WireCalculationInput> = {
    loadCurrent: 20,
    circuitLength: 100,
    conductorMaterial: 'copper',
    ambientTemperature: 30,
    numberOfConductors: 3,
    powerFactor: 0.8,
    strictCompliance: true,
    calculateDerating: true
  };

  switch (standard) {
    case 'NEC':
      return {
        ...baseDefaults,
        voltage: 120,
        voltageSystem: 'single',
        installationMethod: 'conduit',
        temperatureRating: 75,
        includeNECMultiplier: true
      };
    
    case 'IEC':
      return {
        ...baseDefaults,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'A1',
        circuitLength: 100 // meters
      };
    
    case 'BS7671':
      return {
        ...baseDefaults,
        voltage: 230,
        voltageSystem: 'single',
        installationMethod: 'A1',
        circuitLength: 100 // meters
      };
    
    case 'DC_AUTOMOTIVE':
      return {
        ...baseDefaults,
        voltage: 12,
        voltageSystem: 'dc',
        dcVoltageSystem: '12V',
        dcApplicationType: 'automotive',
        installationMethod: 'automotive',
        loadCurrent: 10,
        circuitLength: 20, // feet
        allowableVoltageDropPercent: 2
      };
    
    case 'DC_MARINE':
      return {
        ...baseDefaults,
        voltage: 12,
        voltageSystem: 'dc',
        dcVoltageSystem: '12V',
        dcApplicationType: 'marine',
        installationMethod: 'marine',
        loadCurrent: 15,
        circuitLength: 30, // feet
        allowableVoltageDropPercent: 3
      };
    
    case 'DC_SOLAR':
      return {
        ...baseDefaults,
        voltage: 24,
        voltageSystem: 'dc',
        dcVoltageSystem: '24V',
        dcApplicationType: 'solar',
        installationMethod: 'solar_outdoor',
        loadCurrent: 25,
        circuitLength: 50, // feet
        allowableVoltageDropPercent: 2
      };
    
    case 'DC_TELECOM':
      return {
        ...baseDefaults,
        voltage: 48,
        voltageSystem: 'dc',
        dcVoltageSystem: '48V',
        dcApplicationType: 'telecom',
        installationMethod: 'free_air',
        loadCurrent: 30,
        circuitLength: 100, // feet
        allowableVoltageDropPercent: 1
      };
    
    default:
      return baseDefaults;
  }
}

/**
 * Get voltage drop limits for each standard
 */
export function getVoltageDropLimits(standard: ElectricalStandardId, _applicationType?: string): {
  normal: number;
  sensitive: number;
  critical: number;
} {
  switch (standard) {
    case 'NEC':
      return { normal: 3, sensitive: 2, critical: 1 };
    
    case 'IEC':
      return { normal: 4, sensitive: 3, critical: 2 };
    
    case 'BS7671':
      return { normal: 4, sensitive: 3, critical: 2 };
    
    case 'DC_AUTOMOTIVE':
      return { normal: 2, sensitive: 1, critical: 0.5 };
    
    case 'DC_MARINE':
      return { normal: 3, sensitive: 2, critical: 1 };
    
    case 'DC_SOLAR':
      return { normal: 2, sensitive: 1.5, critical: 1 };
    
    case 'DC_TELECOM':
      return { normal: 1, sensitive: 0.5, critical: 0.25 };
    
    default:
      return { normal: 3, sensitive: 2, critical: 1 };
  }
}

/**
 * Convert between different wire size formats
 */
export function convertWireSize(size: string, fromStandard: 'NEC' | 'IEC', toStandard: 'NEC' | 'IEC'): string {
  // This would contain conversion logic between AWG and mm²
  // Implementation would depend on existing conversion utilities
  if (fromStandard === toStandard) {
    return size;
  }
  
  // Placeholder - actual implementation would use conversion tables
  return size;
}