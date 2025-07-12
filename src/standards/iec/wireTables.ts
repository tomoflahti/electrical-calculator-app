/**
 * IEC Wire Tables
 * Standards: IEC 60227, IEC 60245, IEC 60364-5-52
 */

import type { WireSpecification } from '../../types/standards';

// IEC wire specifications with insulation (based on IEC 60227 and IEC 60245)
export const IEC_WIRE_SPECIFICATIONS: WireSpecification[] = [
  // PVC insulated cables (H05V-K / H07V-K)
  { gauge: '0.75', diameter: 0.98, area: 0.75, insulationType: 'PVC', insulationThickness: 0.6, totalDiameter: 2.18, totalArea: 3.73 },
  { gauge: '1.0', diameter: 1.13, area: 1.0, insulationType: 'PVC', insulationThickness: 0.6, totalDiameter: 2.33, totalArea: 4.26 },
  { gauge: '1.5', diameter: 1.38, area: 1.5, insulationType: 'PVC', insulationThickness: 0.7, totalDiameter: 2.78, totalArea: 6.07 },
  { gauge: '2.5', diameter: 1.78, area: 2.5, insulationType: 'PVC', insulationThickness: 0.8, totalDiameter: 3.38, totalArea: 8.96 },
  { gauge: '4', diameter: 2.25, area: 4.0, insulationType: 'PVC', insulationThickness: 0.8, totalDiameter: 3.85, totalArea: 11.65 },
  { gauge: '6', diameter: 2.76, area: 6.0, insulationType: 'PVC', insulationThickness: 0.8, totalDiameter: 4.36, totalArea: 14.93 },
  { gauge: '10', diameter: 3.57, area: 10.0, insulationType: 'PVC', insulationThickness: 1.0, totalDiameter: 5.57, totalArea: 24.35 },
  { gauge: '16', diameter: 4.51, area: 16.0, insulationType: 'PVC', insulationThickness: 1.0, totalDiameter: 6.51, totalArea: 33.29 },
  { gauge: '25', diameter: 5.64, area: 25.0, insulationType: 'PVC', insulationThickness: 1.2, totalDiameter: 8.04, totalArea: 50.77 },
  { gauge: '35', diameter: 6.68, area: 35.0, insulationType: 'PVC', insulationThickness: 1.2, totalDiameter: 9.08, totalArea: 64.75 },
  { gauge: '50', diameter: 7.98, area: 50.0, insulationType: 'PVC', insulationThickness: 1.4, totalDiameter: 10.78, totalArea: 91.35 },
  { gauge: '70', diameter: 9.44, area: 70.0, insulationType: 'PVC', insulationThickness: 1.4, totalDiameter: 12.24, totalArea: 117.61 },
  { gauge: '95', diameter: 11.00, area: 95.0, insulationType: 'PVC', insulationThickness: 1.6, totalDiameter: 14.20, totalArea: 158.36 },
  { gauge: '120', diameter: 12.37, area: 120.0, insulationType: 'PVC', insulationThickness: 1.6, totalDiameter: 15.57, totalArea: 190.40 },
  { gauge: '150', diameter: 13.82, area: 150.0, insulationType: 'PVC', insulationThickness: 1.8, totalDiameter: 17.42, totalArea: 238.10 },
  { gauge: '185', diameter: 15.37, area: 185.0, insulationType: 'PVC', insulationThickness: 1.8, totalDiameter: 18.97, totalArea: 282.74 },
  { gauge: '240', diameter: 17.48, area: 240.0, insulationType: 'PVC', insulationThickness: 2.0, totalDiameter: 21.48, totalArea: 362.17 },
  { gauge: '300', diameter: 19.57, area: 300.0, insulationType: 'PVC', insulationThickness: 2.0, totalDiameter: 23.57, totalArea: 436.63 },
  { gauge: '400', diameter: 22.58, area: 400.0, insulationType: 'PVC', insulationThickness: 2.2, totalDiameter: 26.98, totalArea: 571.77 },
  { gauge: '500', diameter: 25.24, area: 500.0, insulationType: 'PVC', insulationThickness: 2.2, totalDiameter: 29.64, totalArea: 690.88 }
];

// XLPE insulated cables (H05VV-F / H07VV-F)
export const IEC_XLPE_WIRE_SPECIFICATIONS: WireSpecification[] = [
  { gauge: '1.5', diameter: 1.38, area: 1.5, insulationType: 'XLPE', insulationThickness: 0.7, totalDiameter: 2.78, totalArea: 6.07 },
  { gauge: '2.5', diameter: 1.78, area: 2.5, insulationType: 'XLPE', insulationThickness: 0.7, totalDiameter: 3.18, totalArea: 7.94 },
  { gauge: '4', diameter: 2.25, area: 4.0, insulationType: 'XLPE', insulationThickness: 0.7, totalDiameter: 3.65, totalArea: 10.46 },
  { gauge: '6', diameter: 2.76, area: 6.0, insulationType: 'XLPE', insulationThickness: 0.7, totalDiameter: 4.16, totalArea: 13.59 },
  { gauge: '10', diameter: 3.57, area: 10.0, insulationType: 'XLPE', insulationThickness: 0.9, totalDiameter: 5.37, totalArea: 22.65 },
  { gauge: '16', diameter: 4.51, area: 16.0, insulationType: 'XLPE', insulationThickness: 0.9, totalDiameter: 6.31, totalArea: 31.28 },
  { gauge: '25', diameter: 5.64, area: 25.0, insulationType: 'XLPE', insulationThickness: 1.1, totalDiameter: 7.84, totalArea: 48.25 },
  { gauge: '35', diameter: 6.68, area: 35.0, insulationType: 'XLPE', insulationThickness: 1.1, totalDiameter: 8.88, totalArea: 61.93 },
  { gauge: '50', diameter: 7.98, area: 50.0, insulationType: 'XLPE', insulationThickness: 1.2, totalDiameter: 10.38, totalArea: 84.67 },
  { gauge: '70', diameter: 9.44, area: 70.0, insulationType: 'XLPE', insulationThickness: 1.4, totalDiameter: 12.24, totalArea: 117.61 },
  { gauge: '95', diameter: 11.00, area: 95.0, insulationType: 'XLPE', insulationThickness: 1.6, totalDiameter: 14.20, totalArea: 158.36 },
  { gauge: '120', diameter: 12.37, area: 120.0, insulationType: 'XLPE', insulationThickness: 1.6, totalDiameter: 15.57, totalArea: 190.40 },
  { gauge: '150', diameter: 13.82, area: 150.0, insulationType: 'XLPE', insulationThickness: 1.8, totalDiameter: 17.42, totalArea: 238.10 },
  { gauge: '185', diameter: 15.37, area: 185.0, insulationType: 'XLPE', insulationThickness: 1.8, totalDiameter: 18.97, totalArea: 282.74 },
  { gauge: '240', diameter: 17.48, area: 240.0, insulationType: 'XLPE', insulationThickness: 2.0, totalDiameter: 21.48, totalArea: 362.17 },
  { gauge: '300', diameter: 19.57, area: 300.0, insulationType: 'XLPE', insulationThickness: 2.2, totalDiameter: 23.97, totalArea: 451.33 },
  { gauge: '400', diameter: 22.58, area: 400.0, insulationType: 'XLPE', insulationThickness: 2.4, totalDiameter: 27.38, totalArea: 588.68 },
  { gauge: '500', diameter: 25.24, area: 500.0, insulationType: 'XLPE', insulationThickness: 2.6, totalDiameter: 30.44, totalArea: 728.11 }
];

// Derating factors for bundled cables in conduits
export const IEC_BUNDLING_FACTORS = {
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