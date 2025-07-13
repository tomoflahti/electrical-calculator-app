/**
 * NEC/Imperial DC Circuit Breaker Specifications
 * US Standards: UL489, ABYC, SAE, UL1077
 */

import type {
  DCBreakerSpecification,
  DCApplicationType,
} from "../../../types/standards";

// NEC/Imperial DC Circuit Breaker Specifications
export const NEC_BREAKER_SPECIFICATIONS: DCBreakerSpecification[] = [
  // UL489 Standard Circuit Breakers (5A-800A)
  {
    rating: 1,
    type: "thermal-magnetic",
    voltage: 80,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "led"],
    interruptingCapacity: 10000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 5,
    type: "thermal-magnetic",
    voltage: 80,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "led"],
    interruptingCapacity: 10000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 10,
    type: "thermal-magnetic",
    voltage: 80,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "telecom", "led"],
    interruptingCapacity: 10000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 15,
    type: "thermal-magnetic",
    voltage: 80,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "telecom"],
    interruptingCapacity: 10000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 20,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "telecom"],
    interruptingCapacity: 15000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 25,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery"],
    interruptingCapacity: 15000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 30,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery"],
    interruptingCapacity: 15000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 32,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 20000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 40,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["marine", "solar", "battery", "industrial"],
    interruptingCapacity: 20000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 50,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["marine", "solar", "battery", "industrial"],
    interruptingCapacity: 20000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 60,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 25000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 80,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 25000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 100,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 25000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 125,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 35000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 150,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["solar", "battery", "industrial"],
    interruptingCapacity: 35000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 200,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "solar", "battery", "industrial"],
    interruptingCapacity: 42000,
    tripCurve: "C",
    frameSize: "Large",
  },
  {
    rating: 225,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "solar", "battery", "industrial"],
    interruptingCapacity: 42000,
    tripCurve: "C",
    frameSize: "Large",
  },
  {
    rating: 35,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery"],
    interruptingCapacity: 20000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 45,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery"],
    interruptingCapacity: 20000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 125,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery", "industrial"],
    interruptingCapacity: 35000,
    tripCurve: "C",
    frameSize: "Standard",
  },
  {
    rating: 150,
    type: "thermal-magnetic",
    voltage: 125,
    standard: "UL489",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["automotive", "marine", "solar", "battery", "industrial"],
    interruptingCapacity: 35000,
    tripCurve: "C",
    frameSize: "Standard",
  },

  // ABYC Marine-Specific Breakers
  {
    rating: 15,
    type: "thermal-magnetic",
    voltage: 50,
    standard: "ABYC",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["marine"],
    interruptingCapacity: 5000,
    tripCurve: "C",
    frameSize: "Marine",
  },
  {
    rating: 20,
    type: "thermal-magnetic",
    voltage: 50,
    standard: "ABYC",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["marine"],
    interruptingCapacity: 5000,
    tripCurve: "C",
    frameSize: "Marine",
  },
  {
    rating: 30,
    type: "thermal-magnetic",
    voltage: 50,
    standard: "ABYC",
    continuousDuty: true,
    temperatureRating: 80,
    applications: ["marine"],
    interruptingCapacity: 10000,
    tripCurve: "C",
    frameSize: "Marine",
  },

  // SAE Automotive Breakers
  {
    rating: 7.5,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: false,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 1000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
  {
    rating: 10,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: false,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 1000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
  {
    rating: 15,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: false,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 1000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
  {
    rating: 20,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: true,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 2000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
  {
    rating: 25,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: true,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 2000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
  {
    rating: 30,
    type: "thermal-magnetic",
    voltage: 32,
    standard: "SAE",
    continuousDuty: true,
    temperatureRating: 125,
    applications: ["automotive"],
    interruptingCapacity: 2000,
    tripCurve: "C",
    frameSize: "Automotive",
  },
];

/**
 * Get NEC breaker specifications for rating and application
 */
export function getNECBreakerSpecifications(
  rating: number,
  applicationType: DCApplicationType,
): DCBreakerSpecification[] {
  return NEC_BREAKER_SPECIFICATIONS.filter(
    (breaker) =>
      breaker.rating === rating &&
      breaker.applications.includes(applicationType),
  );
}

/**
 * Get primary NEC breaker recommendation
 */
export function getPrimaryNECBreakerRecommendation(
  rating: number,
  applicationType: DCApplicationType,
): DCBreakerSpecification | null {
  const specifications = getNECBreakerSpecifications(rating, applicationType);

  if (specifications.length === 0) return null;

  // Prioritize UL489 for general applications, ABYC for marine, SAE for automotive
  return specifications.sort((a, b) => {
    if (
      applicationType === "marine" &&
      a.standard === "ABYC" &&
      b.standard !== "ABYC"
    )
      return -1;
    if (
      applicationType === "marine" &&
      a.standard !== "ABYC" &&
      b.standard === "ABYC"
    )
      return 1;

    if (
      applicationType === "automotive" &&
      a.standard === "SAE" &&
      b.standard !== "SAE"
    )
      return -1;
    if (
      applicationType === "automotive" &&
      a.standard !== "SAE" &&
      b.standard === "SAE"
    )
      return 1;

    if (a.standard === "UL489" && b.standard !== "UL489") return -1;
    if (a.standard !== "UL489" && b.standard === "UL489") return 1;

    if (a.continuousDuty && !b.continuousDuty) return -1;
    if (!a.continuousDuty && b.continuousDuty) return 1;

    return 0;
  })[0];
}

/**
 * Get available NEC breaker ratings for application
 */
export function getAvailableNECBreakerRatings(
  applicationType: DCApplicationType,
): number[] {
  const applicableBreakers = NEC_BREAKER_SPECIFICATIONS.filter((breaker) =>
    breaker.applications.includes(applicationType),
  );

  return Array.from(
    new Set(applicableBreakers.map((breaker) => breaker.rating)),
  ).sort((a, b) => a - b);
}
