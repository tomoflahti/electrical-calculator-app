/**
 * Wire gauge conversion utilities between AWG and metric (mm²) systems
 */

// AWG to mm² conversion table (approximate values for common sizes)
const AWG_TO_MM2: Record<string, number> = {
  "14": 2.08,
  "12": 3.31,
  "10": 5.26,
  "8": 8.37,
  "6": 13.3,
  "4": 21.2,
  "2": 33.6,
  "1": 42.4,
  "1/0": 53.5,
  "2/0": 67.4,
  "3/0": 85.0,
  "4/0": 107.2,
  "250": 127,
  "300": 152,
  "350": 177,
  "400": 203,
  "500": 253,
  "600": 304,
  "700": 355,
  "750": 380,
  "800": 405,
  "900": 456,
  "1000": 507,
};

// Reverse mapping for mm² to closest AWG
const MM2_TO_AWG: Record<number, string> = {};
Object.entries(AWG_TO_MM2).forEach(([awg, mm2]) => {
  MM2_TO_AWG[mm2] = awg;
});

/**
 * Convert AWG to metric cross-sectional area (mm²)
 */
export function awgToMm2(awgSize: string): number {
  return AWG_TO_MM2[awgSize] || 0;
}

/**
 * Convert metric cross-sectional area (mm²) to closest AWG equivalent
 */
export function mm2ToAwg(mm2: number): string {
  // Find the closest AWG size
  let closestAwg = "14";
  let minDifference = Math.abs(AWG_TO_MM2["14"] - mm2);

  Object.entries(AWG_TO_MM2).forEach(([awg, awgMm2]) => {
    const difference = Math.abs(awgMm2 - mm2);
    if (difference < minDifference) {
      minDifference = difference;
      closestAwg = awg;
    }
  });

  return closestAwg;
}

/**
 * Get metric wire sizes for common DC applications
 */
export function getMetricWireSizes(): number[] {
  return [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400,
    500,
  ];
}

/**
 * Find the closest metric wire size that meets or exceeds the required cross-sectional area
 */
export function findMinimumMetricWireSize(requiredMm2: number): number {
  const metricSizes = getMetricWireSizes();
  return (
    metricSizes.find((size) => size >= requiredMm2) ||
    metricSizes[metricSizes.length - 1]
  );
}

/**
 * Convert AWG wire specification to metric equivalent
 */
export function convertAwgWireToMetric(awgWire: {
  gauge: string;
  [key: string]: unknown;
}): {
  gauge: string;
  crossSectionMm2: number;
  awgEquivalent: string;
  [key: string]: unknown;
} {
  const mm2 = awgToMm2(awgWire.gauge);
  const metricSize = findMinimumMetricWireSize(mm2);

  return {
    ...awgWire,
    gauge: metricSize.toString(),
    crossSectionMm2: metricSize,
    awgEquivalent: awgWire.gauge,
  };
}

/**
 * Format wire size for display based on standard
 */
export function formatWireSize(
  wireSize: string,
  standard: "NEC" | "IEC",
): string {
  return standard === "NEC" ? `${wireSize} AWG` : `${wireSize} mm²`;
}
