export interface WireGauge {
  awg: string;
  ampacity60C: number;
  ampacity75C: number;
  ampacity90C: number;
  resistance: number;
  area: number;
}

export interface ConduitFill {
  conduitType: string;
  conduitSize: string;
  fillArea: number;
  maxFill40Percent: number;
}

export interface WireCalculationInput {
  loadCurrent: number;
  circuitLength: number;
  voltage: number;
  temperatureRating: 60 | 75 | 90;
  conductorMaterial: "copper" | "aluminum";
  conduitType?: string;
  ambientTemperature?: number;
  numberOfConductors?: number;
}

export interface WireCalculationResult {
  recommendedWireGauge: string;
  ampacity: number;
  voltageDropPercent: number;
  voltageDropVolts: number;
  conduitSize?: string;
  derating?: number;
  compliance: {
    ampacityCompliant: boolean;
    voltageDropCompliant: boolean;
    necCompliant: boolean;
  };
}

export interface VoltageDropInput {
  wireGauge: string;
  current: number;
  length: number;
  voltage: number;
  conductorMaterial: "copper" | "aluminum";
  wireType: "single" | "three-phase";
}

export interface VoltageDropResult {
  voltageDropPercent: number;
  voltageDropVolts: number;
  voltageAtLoad: number;
  compliance: boolean;
}

// NEC Conduit Fill Interfaces (Imperial/AWG System)
export interface NECConduitFillInput {
  wires: Array<{
    gauge: string; // AWG sizes: '14', '12', '10', '8', '6', '4', '2', '1/0', '2/0', etc.
    quantity: number;
    insulation: string; // 'THWN', 'THHN', 'XHHW', etc.
  }>;
  conduitType: string; // 'EMT', 'PVC', 'Steel', 'IMC', 'RMC'
}

export interface NECConduitFillResult {
  recommendedConduitSize: string; // Imperial sizes: '1/2', '3/4', '1', '1-1/4', etc.
  fillPercentage: number;
  compliance: boolean;
  totalWireArea: number; // Square inches
}

// IEC Conduit Fill Interfaces (Metric System)
export interface IECConduitFillInput {
  wires: Array<{
    gauge: string; // Metric sizes: '1.5', '2.5', '4', '6', '10', '16', '25', etc. (mm²)
    count: number;
    insulationType: "PVC" | "XLPE";
  }>;
  conduitType: "PVC" | "Steel";
}

export interface IECConduitFillResult {
  conduitSize: string; // Metric sizes: '16', '20', '25', '32', '40', '50', '63', etc. (mm)
  fillPercent: number;
  isCompliant: boolean;
  usedArea: number; // Square mm
  availableArea: number; // Square mm
  maxWires: number;
  actualWires: number;
  wireBreakdown: Array<{
    gauge: string;
    count: number;
    totalArea: number;
    percentage: number;
  }>;
}

// Legacy type aliases for backward compatibility (to be deprecated)
export type ConduitFillInput = NECConduitFillInput;
export type ConduitFillResult = NECConduitFillResult;

export interface Project {
  id: string;
  name: string;
  description: string;
  calculations: Array<{
    type: "wire" | "voltage-drop" | "conduit" | "dc-wire";
    input:
      | WireCalculationInput
      | VoltageDropInput
      | NECConduitFillInput
      | IECConduitFillInput;
    result:
      | WireCalculationResult
      | VoltageDropResult
      | NECConduitFillResult
      | IECConduitFillResult;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Re-export DC types from standards
export type {
  ElectricalStandardId,
  DCVoltageSystem,
  DCApplicationType,
  DCCalculationInput,
  DCCalculationResult,
  DCWireSpecification,
  DCApplicationStandard,
} from "./standards";
