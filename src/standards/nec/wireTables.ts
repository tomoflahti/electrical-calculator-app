/**
 * NEC Wire Tables
 * Standards: NEC Chapter 9, NEMA WC 70, UL 83
 */

import type { WireGauge } from '../../types';

// NEC wire gauge specifications (NEC Chapter 9, Table 8)
export const NEC_WIRE_GAUGES: WireGauge[] = [
  { awg: '14', ampacity60C: 15, ampacity75C: 20, ampacity90C: 25, resistance: 3.07, area: 0.0097 },
  { awg: '12', ampacity60C: 20, ampacity75C: 25, ampacity90C: 30, resistance: 1.93, area: 0.0133 },
  { awg: '10', ampacity60C: 30, ampacity75C: 35, ampacity90C: 40, resistance: 1.21, area: 0.0211 },
  { awg: '8', ampacity60C: 40, ampacity75C: 50, ampacity90C: 55, resistance: 0.764, area: 0.0366 },
  { awg: '6', ampacity60C: 55, ampacity75C: 65, ampacity90C: 75, resistance: 0.491, area: 0.0507 },
  { awg: '4', ampacity60C: 70, ampacity75C: 85, ampacity90C: 95, resistance: 0.308, area: 0.0824 },
  { awg: '3', ampacity60C: 85, ampacity75C: 100, ampacity90C: 110, resistance: 0.245, area: 0.1039 },
  { awg: '2', ampacity60C: 95, ampacity75C: 115, ampacity90C: 130, resistance: 0.194, area: 0.1313 },
  { awg: '1', ampacity60C: 110, ampacity75C: 130, ampacity90C: 145, resistance: 0.154, area: 0.1562 },
  { awg: '1/0', ampacity60C: 125, ampacity75C: 150, ampacity90C: 170, resistance: 0.122, area: 0.1963 },
  { awg: '2/0', ampacity60C: 145, ampacity75C: 175, ampacity90C: 195, resistance: 0.0967, area: 0.2463 },
  { awg: '3/0', ampacity60C: 165, ampacity75C: 200, ampacity90C: 225, resistance: 0.0766, area: 0.3117 },
  { awg: '4/0', ampacity60C: 195, ampacity75C: 230, ampacity90C: 260, resistance: 0.0608, area: 0.3904 },
  { awg: '250', ampacity60C: 215, ampacity75C: 255, ampacity90C: 290, resistance: 0.0515, area: 0.4596 },
  { awg: '300', ampacity60C: 240, ampacity75C: 285, ampacity90C: 320, resistance: 0.0429, area: 0.5281 },
  { awg: '350', ampacity60C: 260, ampacity75C: 310, ampacity90C: 350, resistance: 0.0367, area: 0.5958 },
  { awg: '400', ampacity60C: 280, ampacity75C: 335, ampacity90C: 380, resistance: 0.0321, area: 0.6619 },
  { awg: '500', ampacity60C: 320, ampacity75C: 380, ampacity90C: 430, resistance: 0.0258, area: 0.7901 }
];

// NEC temperature correction factors (NEC Chapter 9, Table 310.15(B)(2)(a))
export const NEC_TEMPERATURE_CORRECTION_FACTORS = {
  60: {
    30: 1.00, 35: 0.94, 40: 0.82, 45: 0.71, 50: 0.58, 55: 0.41, 60: 0.00
  },
  75: {
    30: 1.00, 35: 0.94, 40: 0.88, 45: 0.82, 50: 0.75, 55: 0.67, 60: 0.58,
    65: 0.47, 70: 0.33, 75: 0.00
  },
  90: {
    30: 1.00, 35: 0.96, 40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71,
    65: 0.65, 70: 0.58, 75: 0.50, 80: 0.41, 85: 0.29, 90: 0.00
  }
};

// NEC conductor adjustment factors (NEC Chapter 9, Table 310.15(B)(3)(a))
export const NEC_CONDUCTOR_ADJUSTMENT_FACTORS = {
  4: 0.8,   5: 0.8,   6: 0.8,   7: 0.7,   8: 0.7,   9: 0.7,   10: 0.7,
  11: 0.65, 12: 0.65, 13: 0.65, 14: 0.65, 15: 0.65, 16: 0.65, 17: 0.65,
  18: 0.65, 19: 0.65, 20: 0.65, 21: 0.6,  30: 0.6,  31: 0.55, 40: 0.55,
  41: 0.5,  60: 0.5,  61: 0.45, 80: 0.45, 81: 0.4,  100: 0.4, 101: 0.35
};

// NEC conductor material properties
export const NEC_CONDUCTOR_MATERIALS = {
  copper: {
    resistivity: 10.371, // Circular mil-ohms per foot at 75°C
    temperatureCoefficient: 0.00393, // Per °C
    multiplier: 1.0
  },
  aluminum: {
    resistivity: 17.002, // Circular mil-ohms per foot at 75°C  
    temperatureCoefficient: 0.00403, // Per °C
    multiplier: 1.64
  }
};

// NEC insulation types and their properties
export const NEC_INSULATION_TYPES = {
  THWN: {
    name: 'Thermoplastic Heat and Water-resistant Nylon-coated',
    temperatureRating: 75,
    applications: ['Dry and wet locations', 'Conduit and cable trays'],
    standard: 'UL 83'
  },
  THHN: {
    name: 'Thermoplastic High Heat-resistant Nylon-coated',
    temperatureRating: 90,
    applications: ['Dry locations', 'Conduit and cable trays'],
    standard: 'UL 83'
  },
  XHHW: {
    name: 'Cross-linked Polyethylene High Heat-resistant Water-resistant',
    temperatureRating: 90,
    applications: ['Dry and wet locations', 'Direct burial'],
    standard: 'UL 44'
  },
  USE: {
    name: 'Underground Service Entrance',
    temperatureRating: 75,
    applications: ['Wet locations', 'Direct burial', 'Service entrance'],
    standard: 'UL 854'
  },
  RHW: {
    name: 'Rubber Heat-resistant Water-resistant',
    temperatureRating: 75,
    applications: ['Dry and wet locations', 'Underground'],
    standard: 'UL 44'
  }
};