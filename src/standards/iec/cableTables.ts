import type { CableCrossSection } from '../../types/standards';

export const IEC_CABLE_CROSS_SECTIONS: CableCrossSection[] = [
  { size: '1.5', crossSectionMm2: 1.5, currentCapacity70C: 17.5, currentCapacity90C: 22, resistance: 12.1, reactance: 0.07 },
  { size: '2.5', crossSectionMm2: 2.5, currentCapacity70C: 24, currentCapacity90C: 30, resistance: 7.41, reactance: 0.07 },
  { size: '4', crossSectionMm2: 4, currentCapacity70C: 32, currentCapacity90C: 40, resistance: 4.61, reactance: 0.07 },
  { size: '6', crossSectionMm2: 6, currentCapacity70C: 41, currentCapacity90C: 51, resistance: 3.08, reactance: 0.08 },
  { size: '10', crossSectionMm2: 10, currentCapacity70C: 57, currentCapacity90C: 70, resistance: 1.83, reactance: 0.08 },
  { size: '16', crossSectionMm2: 16, currentCapacity70C: 76, currentCapacity90C: 94, resistance: 1.15, reactance: 0.09 },
  { size: '25', crossSectionMm2: 25, currentCapacity70C: 101, currentCapacity90C: 125, resistance: 0.727, reactance: 0.09 },
  { size: '35', crossSectionMm2: 35, currentCapacity70C: 125, currentCapacity90C: 154, resistance: 0.524, reactance: 0.09 },
  { size: '50', crossSectionMm2: 50, currentCapacity70C: 151, currentCapacity90C: 186, resistance: 0.387, reactance: 0.10 },
  { size: '70', crossSectionMm2: 70, currentCapacity70C: 192, currentCapacity90C: 237, resistance: 0.268, reactance: 0.10 },
  { size: '95', crossSectionMm2: 95, currentCapacity70C: 232, currentCapacity90C: 286, resistance: 0.193, reactance: 0.11 },
  { size: '120', crossSectionMm2: 120, currentCapacity70C: 269, currentCapacity90C: 331, resistance: 0.153, reactance: 0.11 },
  { size: '150', crossSectionMm2: 150, currentCapacity70C: 309, currentCapacity90C: 382, resistance: 0.124, reactance: 0.12 },
  { size: '185', crossSectionMm2: 185, currentCapacity70C: 353, currentCapacity90C: 435, resistance: 0.099, reactance: 0.12 },
  { size: '240', crossSectionMm2: 240, currentCapacity70C: 415, currentCapacity90C: 511, resistance: 0.0754, reactance: 0.13 },
  { size: '300', crossSectionMm2: 300, currentCapacity70C: 477, currentCapacity90C: 588, resistance: 0.0601, reactance: 0.13 },
  { size: '400', crossSectionMm2: 400, currentCapacity70C: 546, currentCapacity90C: 673, resistance: 0.047, reactance: 0.14 },
  { size: '500', crossSectionMm2: 500, currentCapacity70C: 621, currentCapacity90C: 766, resistance: 0.0366, reactance: 0.14 }
];

export const IEC_ALUMINUM_CABLE_CROSS_SECTIONS: CableCrossSection[] = [
  { size: '16', crossSectionMm2: 16, currentCapacity70C: 59, currentCapacity90C: 73, resistance: 1.91, reactance: 0.09 },
  { size: '25', crossSectionMm2: 25, currentCapacity70C: 78, currentCapacity90C: 96, resistance: 1.20, reactance: 0.09 },
  { size: '35', crossSectionMm2: 35, currentCapacity70C: 96, currentCapacity90C: 119, resistance: 0.868, reactance: 0.09 },
  { size: '50', crossSectionMm2: 50, currentCapacity70C: 117, currentCapacity90C: 144, resistance: 0.641, reactance: 0.10 },
  { size: '70', crossSectionMm2: 70, currentCapacity70C: 147, currentCapacity90C: 182, resistance: 0.443, reactance: 0.10 },
  { size: '95', crossSectionMm2: 95, currentCapacity70C: 179, currentCapacity90C: 220, resistance: 0.320, reactance: 0.11 },
  { size: '120', crossSectionMm2: 120, currentCapacity70C: 207, currentCapacity90C: 255, resistance: 0.253, reactance: 0.11 },
  { size: '150', crossSectionMm2: 150, currentCapacity70C: 238, currentCapacity90C: 293, resistance: 0.206, reactance: 0.12 },
  { size: '185', crossSectionMm2: 185, currentCapacity70C: 272, currentCapacity90C: 335, resistance: 0.164, reactance: 0.12 },
  { size: '240', crossSectionMm2: 240, currentCapacity70C: 318, currentCapacity90C: 392, resistance: 0.125, reactance: 0.13 },
  { size: '300', crossSectionMm2: 300, currentCapacity70C: 366, currentCapacity90C: 450, resistance: 0.100, reactance: 0.13 },
  { size: '400', crossSectionMm2: 400, currentCapacity70C: 419, currentCapacity90C: 516, resistance: 0.0778, reactance: 0.14 },
  { size: '500', crossSectionMm2: 500, currentCapacity70C: 477, currentCapacity90C: 588, resistance: 0.0605, reactance: 0.14 }
];

export const IEC_TEMPERATURE_CORRECTION_FACTORS = {
  70: {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50, 65: 0.35, 70: 0.00
  },
  90: {
    10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 85: 0.29, 90: 0.00
  }
};

export const IEC_GROUPING_FACTORS = {
  1: 1.00,
  2: 0.80,
  3: 0.70,
  4: 0.65,
  5: 0.60,
  6: 0.57,
  7: 0.54,
  8: 0.52,
  9: 0.50,
  10: 0.48,
  12: 0.45,
  14: 0.43,
  16: 0.41,
  18: 0.39,
  20: 0.38
};

export const IEC_INSTALLATION_METHODS = {
  A1: { name: 'Single cable clipped direct', factor: 1.00 },
  A2: { name: 'Multi-core cable clipped direct', factor: 0.95 },
  B1: { name: 'Single cable in conduit on wall', factor: 0.95 },
  B2: { name: 'Multi-core cable in conduit on wall', factor: 0.90 },
  C: { name: 'Cables in conduit buried in ground', factor: 0.80 },
  D1: { name: 'Single cable direct buried', factor: 1.00 },
  D2: { name: 'Multi-core cable direct buried', factor: 0.95 },
  E: { name: 'Cables in free air', factor: 1.20 },
  F: { name: 'Single cable on perforated tray', factor: 1.00 },
  G: { name: 'Multi-core cable on tray', factor: 0.95 }
};