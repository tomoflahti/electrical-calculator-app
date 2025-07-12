/**
 * IEC Conduit Fill Tables
 * Standards: EN 61386-1, IEC 60364-5-52
 */

import type { ConduitSpecification } from '../../types/standards';

// IEC conduit specifications (EN 61386 series)
export const IEC_CONDUIT_SPECIFICATIONS: ConduitSpecification[] = [
  // PVC Conduits (EN 61386-23)
  { size: '16', internalDiameter: 10.5, internalArea: 86.6, type: 'PVC', standard: 'IEC' },
  { size: '20', internalDiameter: 13.5, internalArea: 143.1, type: 'PVC', standard: 'IEC' },
  { size: '25', internalDiameter: 18.5, internalArea: 268.8, type: 'PVC', standard: 'IEC' },
  { size: '32', internalDiameter: 25.0, internalArea: 490.9, type: 'PVC', standard: 'IEC' },
  { size: '40', internalDiameter: 32.0, internalArea: 804.2, type: 'PVC', standard: 'IEC' },
  { size: '50', internalDiameter: 40.0, internalArea: 1256.6, type: 'PVC', standard: 'IEC' },
  { size: '63', internalDiameter: 50.0, internalArea: 1963.5, type: 'PVC', standard: 'IEC' },
  { size: '75', internalDiameter: 63.0, internalArea: 3117.2, type: 'PVC', standard: 'IEC' },
  { size: '90', internalDiameter: 76.0, internalArea: 4536.5, type: 'PVC', standard: 'IEC' },
  { size: '110', internalDiameter: 94.0, internalArea: 6939.8, type: 'PVC', standard: 'IEC' },
  { size: '125', internalDiameter: 108.0, internalArea: 9160.9, type: 'PVC', standard: 'IEC' },
  { size: '160', internalDiameter: 140.0, internalArea: 15393.8, type: 'PVC', standard: 'IEC' },

  // Steel Conduits (EN 61386-21)
  { size: '16', internalDiameter: 10.2, internalArea: 81.7, type: 'Steel', standard: 'IEC' },
  { size: '20', internalDiameter: 13.2, internalArea: 136.8, type: 'Steel', standard: 'IEC' },
  { size: '25', internalDiameter: 18.2, internalArea: 260.2, type: 'Steel', standard: 'IEC' },
  { size: '32', internalDiameter: 24.7, internalArea: 479.1, type: 'Steel', standard: 'IEC' },
  { size: '40', internalDiameter: 31.7, internalArea: 789.4, type: 'Steel', standard: 'IEC' },
  { size: '50', internalDiameter: 39.7, internalArea: 1238.9, type: 'Steel', standard: 'IEC' },
  { size: '63', internalDiameter: 49.7, internalArea: 1940.8, type: 'Steel', standard: 'IEC' },
  { size: '75', internalDiameter: 62.7, internalArea: 3088.8, type: 'Steel', standard: 'IEC' },
  { size: '90', internalDiameter: 75.7, internalArea: 4499.7, type: 'Steel', standard: 'IEC' },
  { size: '110', internalDiameter: 93.7, internalArea: 6900.4, type: 'Steel', standard: 'IEC' },
  { size: '125', internalDiameter: 107.7, internalArea: 9122.3, type: 'Steel', standard: 'IEC' },
  { size: '160', internalDiameter: 139.7, internalArea: 15348.5, type: 'Steel', standard: 'IEC' }
];

// IEC conduit fill percentages (EN 61386 / IEC 60364-5-52)
export const IEC_CONDUIT_FILL_PERCENTAGES = {
  // Maximum fill percentages for different numbers of cables
  1: 53,   // Single cable
  2: 31,   // Two cables
  3: 40,   // Three or more cables
  multiple: 40  // Default for multiple cables
};

// Installation method correction factors for IEC
export const IEC_CONDUIT_INSTALLATION_FACTORS = {
  'embedded_wall': 0.77,      // Method A1 - Single cable clipped direct
  'surface_wall': 0.68,       // Method A2 - Multi-core cable clipped direct  
  'conduit_wall': 0.68,       // Method B1 - Single cable in conduit on wall
  'conduit_embedded': 0.57,   // Method B2 - Multi-core cable in conduit in wall
  'underground': 0.57,        // Method C - Cables in conduit buried in ground
  'direct_buried': 1.00,      // Method D1 - Single cable direct buried
  'free_air': 1.29,          // Method E - Cables in free air
  'cable_tray': 1.00         // Method F/G - Cables on tray
};