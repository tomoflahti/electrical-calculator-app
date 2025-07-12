/**
 * Conduit Fill Calculation Router
 * Routes to appropriate calculation engine based on selected standard
 * Following DC Breaker Router pattern for consistency
 */

import type { 
  ConduitFillCalculationInput, 
  ConduitFillCalculationResult,
  ConduitFillApplicationType,
  ConduitFillInstallationMethod
} from '../../types/standards';

import { calculateNECConduitFill } from './necConduitFill';
import { calculateIECConduitFill } from './iecConduitFill';
import { NEC_APPLICATION_REQUIREMENTS, NEC_INSTALLATION_METHOD_FACTORS } from '../../standards/nec';
import { IEC_APPLICATION_REQUIREMENTS, IEC_INSTALLATION_METHOD_FACTORS } from '../../standards/iec';

/**
 * Main conduit fill calculation function
 * Routes to appropriate engine based on wire standard
 */
export function calculateConduitFill(input: ConduitFillCalculationInput): ConduitFillCalculationResult {
  const wireStandard = input.wireStandard || 'IEC'; // Default to IEC (metric-first approach)
  
  // Validate input before routing
  const validationErrors = validateConduitFillInput(input);
  if (validationErrors.length > 0) {
    throw new Error(`Input validation failed: ${validationErrors.join(', ')}`);
  }
  
  // Route to appropriate calculation engine
  if (wireStandard === 'NEC') {
    return calculateNECConduitFill(input);
  } else if (wireStandard === 'IEC') {
    return calculateIECConduitFill(input);
  } else {
    throw new Error(`Unsupported wire standard: ${wireStandard}. Use 'NEC' or 'IEC'`);
  }
}

/**
 * Validate conduit fill calculation input (common validation)
 */
export function validateConduitFillInput(input: ConduitFillCalculationInput): string[] {
  const errors: string[] = [];

  // Basic required fields
  if (!input.wires || input.wires.length === 0) {
    errors.push('At least one wire must be specified');
  }

  if (!input.conduitType) {
    errors.push('Conduit type must be specified');
  }

  if (!input.applicationType) {
    errors.push('Application type must be specified');
  }

  if (!input.installationMethod) {
    errors.push('Installation method must be specified');
  }

  // Validate wire specifications
  if (input.wires) {
    input.wires.forEach((wire, index) => {
      if (!wire.gauge) {
        errors.push(`Wire ${index + 1}: Gauge must be specified`);
      }
      if (!wire.quantity || wire.quantity <= 0) {
        errors.push(`Wire ${index + 1}: Quantity must be greater than 0`);
      }
      if (wire.quantity > 1000) {
        errors.push(`Wire ${index + 1}: Quantity exceeds maximum (1000)`);
      }
      if (!wire.insulation) {
        errors.push(`Wire ${index + 1}: Insulation type must be specified`);
      }
    });
  }

  // Validate standard-specific constraints
  if (input.wireStandard === 'NEC') {
    errors.push(...validateNECSpecificConstraints(input));
  } else if (input.wireStandard === 'IEC') {
    errors.push(...validateIECSpecificConstraints(input));
  }

  // Validate environmental parameters
  if (input.ambientTemperature !== undefined) {
    if (input.ambientTemperature < -40 || input.ambientTemperature > 150) {
      errors.push('Ambient temperature must be between -40°C and 150°C');
    }
  }

  // Validate advanced options
  if (input.futureFillReserve !== undefined) {
    if (input.futureFillReserve < 0 || input.futureFillReserve > 50) {
      errors.push('Future fill reserve must be between 0% and 50%');
    }
  }

  // Validate application type
  const validApplications: ConduitFillApplicationType[] = [
    'residential', 'commercial', 'industrial', 'data_center', 'healthcare', 
    'educational', 'outdoor', 'hazardous', 'underground', 'marine'
  ];
  if (!validApplications.includes(input.applicationType)) {
    errors.push(`Invalid application type. Must be one of: ${validApplications.join(', ')}`);
  }

  // Validate installation method
  const validInstallationMethods: ConduitFillInstallationMethod[] = [
    'underground', 'overhead', 'indoor', 'outdoor', 'hazardous', 
    'wet_location', 'dry_location', 'concrete_slab', 'cable_tray', 'free_air'
  ];
  if (!validInstallationMethods.includes(input.installationMethod)) {
    errors.push(`Invalid installation method. Must be one of: ${validInstallationMethods.join(', ')}`);
  }

  return errors;
}

/**
 * Validate NEC-specific constraints
 */
function validateNECSpecificConstraints(input: ConduitFillCalculationInput): string[] {
  const errors: string[] = [];

  // Validate NEC conduit types
  const necConduitTypes = ['EMT', 'PVC', 'Steel', 'IMC', 'RMC', 'FMC', 'LFMC'];
  if (!necConduitTypes.includes(input.conduitType)) {
    errors.push(`Invalid NEC conduit type. Must be one of: ${necConduitTypes.join(', ')}`);
  }

  // Validate AWG wire gauges
  const awgPattern = /^(14|12|10|8|6|4|3|2|1|1\/0|2\/0|3\/0|4\/0|250|300|350|400|500|600|700|750|800|900|1000)$/;
  input.wires.forEach((wire, index) => {
    if (!awgPattern.test(wire.gauge)) {
      errors.push(`Wire ${index + 1}: Invalid AWG gauge '${wire.gauge}'. Must be valid AWG size (14, 12, 10, 8, 6, 4, 3, 2, 1, 1/0, 2/0, 3/0, 4/0, 250-1000)`);
    }
  });

  // Validate NEC insulation types
  const necInsulationTypes = ['THWN', 'THHN', 'XHHW', 'USE', 'RHH', 'RHW', 'THWN-2', 'THHW'];
  input.wires.forEach((wire, index) => {
    if (!necInsulationTypes.includes(wire.insulation)) {
      errors.push(`Wire ${index + 1}: Invalid NEC insulation type '${wire.insulation}'. Must be one of: ${necInsulationTypes.join(', ')}`);
    }
  });

  return errors;
}

/**
 * Validate IEC-specific constraints
 */
function validateIECSpecificConstraints(input: ConduitFillCalculationInput): string[] {
  const errors: string[] = [];

  // Validate IEC conduit types
  const iecConduitTypes = ['PVC', 'Steel'];
  if (!iecConduitTypes.includes(input.conduitType)) {
    errors.push(`Invalid IEC conduit type. Must be one of: ${iecConduitTypes.join(', ')}`);
  }

  // Validate metric wire sizes
  const metricPattern = /^(0\.75|1\.0|1\.5|2\.5|4|6|10|16|25|35|50|70|95|120|150|185|240|300|400|500)$/;
  input.wires.forEach((wire, index) => {
    if (!metricPattern.test(wire.gauge)) {
      errors.push(`Wire ${index + 1}: Invalid metric gauge '${wire.gauge}'. Must be valid metric size (0.75, 1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500 mm²)`);
    }
  });

  // Validate IEC insulation types
  const iecInsulationTypes = ['PVC', 'XLPE', 'EPR', 'LSOH'];
  input.wires.forEach((wire, index) => {
    if (!iecInsulationTypes.includes(wire.insulation)) {
      errors.push(`Wire ${index + 1}: Invalid IEC insulation type '${wire.insulation}'. Must be one of: ${iecInsulationTypes.join(', ')}`);
    }
  });

  return errors;
}

/**
 * Get application-specific requirements based on wire standard
 */
export function getApplicationRequirements(
  applicationType: ConduitFillApplicationType, 
  wireStandard: 'NEC' | 'IEC' = 'IEC'
): {
  specialRequirements: string[];
  recommendedPractices: string[];
  temperatureRange: { min: number; max: number };
  environmentalFactors: string[];
  complianceStandards: string[];
} {
  // Use the appropriate standards based on wire standard
  const applicationStandards = wireStandard === 'NEC' 
    ? NEC_APPLICATION_REQUIREMENTS 
    : IEC_APPLICATION_REQUIREMENTS;

  const requirements = applicationStandards[applicationType];
  
  if (!requirements) {
    // Fallback for unknown application types
    return {
      specialRequirements: ['Standard electrical installation requirements'],
      recommendedPractices: ['Follow local electrical codes', 'Use appropriate safety factors'],
      temperatureRange: { min: 0, max: 40 },
      environmentalFactors: ['Standard indoor conditions'],
      complianceStandards: [wireStandard === 'NEC' ? 'NEC' : 'IEC 60364']
    };
  }

  return requirements;
}

/**
 * Get installation method specific factors based on wire standard
 */
export function getInstallationMethodFactors(
  installationMethod: ConduitFillInstallationMethod,
  wireStandard: 'NEC' | 'IEC' = 'IEC'
): {
  temperatureFactor: number;
  environmentFactor: number;
  specialConsiderations: string[];
  applicableStandards: string[];
} {
  // Use the appropriate standards based on wire standard
  const installationStandards = wireStandard === 'NEC' 
    ? NEC_INSTALLATION_METHOD_FACTORS 
    : IEC_INSTALLATION_METHOD_FACTORS;

  const factors = installationStandards[installationMethod];
  
  if (!factors) {
    // Fallback for unknown installation methods
    return {
      temperatureFactor: 1.0,
      environmentFactor: 1.0,
      specialConsiderations: ['Standard installation practices'],
      applicableStandards: [wireStandard === 'NEC' ? 'NEC 300' : 'IEC 60364-5-52']
    };
  }

  return factors;
}

/**
 * Calculate environmental compliance factors based on application and installation method
 */
export function calculateEnvironmentalCompliance(
  applicationType: ConduitFillApplicationType,
  installationMethod: ConduitFillInstallationMethod,
  ambientTemperature: number = 30,
  environment: string = 'dry',
  wireStandard: 'NEC' | 'IEC' = 'IEC'
): {
  overallCompliance: boolean;
  temperatureCompliance: boolean;
  environmentCompliance: boolean;
  applicationCompliance: boolean;
  complianceFactors: {
    temperatureFactor: number;
    environmentFactor: number;
    applicationFactor: number;
  };
  recommendations: string[];
  warnings: string[];
} {
  const applicationReq = getApplicationRequirements(applicationType, wireStandard);
  const installationFactors = getInstallationMethodFactors(installationMethod, wireStandard);
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Temperature compliance check
  const tempRange = applicationReq.temperatureRange;
  const temperatureCompliance = ambientTemperature >= tempRange.min && ambientTemperature <= tempRange.max;
  
  if (!temperatureCompliance) {
    warnings.push(`Ambient temperature ${ambientTemperature}°C is outside the recommended range ${tempRange.min}°C to ${tempRange.max}°C for ${applicationType} applications`);
    recommendations.push('Consider temperature derating factors or alternative installation methods');
  }
  
  // Environment compliance check  
  const environmentCompliance = applicationReq.environmentalFactors.some(factor => 
    factor.toLowerCase().includes(environment.toLowerCase())
  ) || environment === 'dry'; // Default to compliant for dry conditions
  
  if (!environmentCompliance) {
    warnings.push(`Environment '${environment}' may not be suitable for ${applicationType} applications`);
    recommendations.push('Verify environmental compatibility with application requirements');
  }
  
  // Application compliance (always true, but can add specific logic)
  const applicationCompliance = true;
  
  // Calculate compliance factors
  const temperatureFactor = installationFactors.temperatureFactor;
  const environmentFactor = installationFactors.environmentFactor;
  const applicationFactor = temperatureCompliance ? 1.0 : 0.8; // Reduce factor if temperature is out of range
  
  // Add standard-specific recommendations
  if (wireStandard === 'NEC') {
    recommendations.push(...applicationReq.complianceStandards.map(std => `Follow ${std} requirements`));
  } else {
    recommendations.push(...applicationReq.complianceStandards.map(std => `Comply with ${std} standards`));
  }
  
  const overallCompliance = temperatureCompliance && environmentCompliance && applicationCompliance;
  
  return {
    overallCompliance,
    temperatureCompliance,
    environmentCompliance,
    applicationCompliance,
    complianceFactors: {
      temperatureFactor,
      environmentFactor,
      applicationFactor
    },
    recommendations,
    warnings
  };
}

/**
 * Calculate conduit fill recommendations for multiple current levels
 * Similar to DC breaker recommendations pattern
 */
export function getConduitFillRecommendations(
  wireConfigurations: Array<{
    gauge: string;
    quantity: number;
    insulation: string;
  }>,
  conduitType: string,
  applicationType: ConduitFillApplicationType,
  installationMethod: ConduitFillInstallationMethod = 'indoor',
  wireStandard: 'NEC' | 'IEC' = 'IEC'
): ConduitFillCalculationResult[] {
  return wireConfigurations.map(config => {
    const input: ConduitFillCalculationInput = {
      wires: [config],
      conduitType,
      wireStandard,
      applicationType,
      installationMethod
    };
    return calculateConduitFill(input);
  });
}

/**
 * Find optimal conduit size for mixed wire configurations
 */
export function findOptimalConduitSize(
  wireConfigurations: Array<{
    gauge: string;
    quantity: number;
    insulation: string;
  }>,
  conduitType: string,
  applicationType: ConduitFillApplicationType,
  wireStandard: 'NEC' | 'IEC' = 'IEC'
): ConduitFillCalculationResult {
  const input: ConduitFillCalculationInput = {
    wires: wireConfigurations,
    conduitType,
    wireStandard,
    applicationType,
    installationMethod: 'indoor' // Default
  };
  
  return calculateConduitFill(input);
}