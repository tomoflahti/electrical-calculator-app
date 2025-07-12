/**
 * Standard DC Circuit Breaker Ratings
 * Common amperage ratings used across both NEC and IEC standards
 */

// Standard DC breaker ratings (Amperes) - International common sizes
export const STANDARD_BREAKER_RATINGS = [
  1, 2, 3, 5, 6, 7, 10, 15, 16, 20, 25, 30, 32, 35, 40, 45, 50, 60, 63, 70, 80, 90, 100,
  110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800
];

// Common fractional ratings for specialized applications
export const FRACTIONAL_BREAKER_RATINGS = [
  0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10
];

/**
 * Get the next standard breaker size for a calculated current
 */
export function getNextStandardBreakerSize(calculatedSize: number): number {
  if (calculatedSize <= 0) return STANDARD_BREAKER_RATINGS[0];
  
  const nextSize = STANDARD_BREAKER_RATINGS.find(rating => rating >= calculatedSize);
  return nextSize || STANDARD_BREAKER_RATINGS[STANDARD_BREAKER_RATINGS.length - 1];
}

/**
 * Check if a breaker rating is a standard size
 */
export function isStandardBreakerSize(rating: number): boolean {
  return STANDARD_BREAKER_RATINGS.includes(rating);
}