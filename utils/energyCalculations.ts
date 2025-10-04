import { AsteroidData } from "../components/Asteroid";

// Constants for calculations
const AVERAGE_ASTEROID_DENSITY = 3000; // kg/m³ (typical asteroid density)
const TNT_ENERGY_PER_KG = 4.184e6; // joules per kg of TNT

/**
 * Calculate the mass of an asteroid in kilograms
 * Mass = Volume * Density
 * Volume of a sphere = (4/3) * π * r³
 */
export function calculateAsteroidMass(asteroid: AsteroidData): number {
  // Use average diameter in km
  const radiusInKm = asteroid.diameter.avg / 2;
  const radiusInM = radiusInKm * 1000; // Convert km to meters
  
  // Calculate volume in cubic meters
  const volume = (4 / 3) * Math.PI * Math.pow(radiusInM, 3);
  
  // Calculate mass in kg
  const mass = volume * AVERAGE_ASTEROID_DENSITY;
  
  return mass;
}

/**
 * Calculate the kinetic energy of an asteroid in joules
 * KE = (1/2) * mass * velocity²
 */
export function calculateKineticEnergy(asteroid: AsteroidData): number {
  const mass = calculateAsteroidMass(asteroid);
  
  // Get velocity in m/s from km/s
  const approach = asteroid.closeApproachData[0];
  if (!approach) {
    return 0;
  }
  
  const velocityKmPerSecond = parseFloat(approach.velocity.kmPerSecond);
  const velocityMPerSecond = velocityKmPerSecond * 1000; // Convert km/s to m/s
  
  // Calculate kinetic energy in joules
  const kineticEnergy = 0.5 * mass * Math.pow(velocityMPerSecond, 2);
  
  return kineticEnergy;
}

/**
 * Convert joules to TNT equivalent in megatons
 * 1 megaton TNT = 4.184 × 10^15 joules
 */
export function joulestoTNT(joules: number): number {
  const kgTNT = joules / TNT_ENERGY_PER_KG;
  const megatonsTNT = kgTNT / 1e9; // Convert kg to megatons (1 megaton = 10^9 kg)
  
  return megatonsTNT;
}

/**
 * Format large numbers with appropriate prefixes and precision
 */
export function formatEnergy(joules: number): string {
  if (joules >= 1e18) {
    return `${(joules / 1e18).toFixed(2)} EJ`; // Exajoules
  } else if (joules >= 1e15) {
    return `${(joules / 1e15).toFixed(2)} PJ`; // Petajoules
  } else if (joules >= 1e12) {
    return `${(joules / 1e12).toFixed(2)} TJ`; // Terajoules
  } else if (joules >= 1e9) {
    return `${(joules / 1e9).toFixed(2)} GJ`; // Gigajoules
  } else if (joules >= 1e6) {
    return `${(joules / 1e6).toFixed(2)} MJ`; // Megajoules
  } else if (joules >= 1e3) {
    return `${(joules / 1e3).toFixed(2)} kJ`; // Kilojoules
  } else {
    return `${joules.toFixed(2)} J`; // Joules
  }
}

/**
 * Format TNT equivalent with appropriate units and precision
 */
export function formatTNT(megatons: number): string {
  if (megatons >= 1) {
    return `${megatons.toFixed(2)} Mt TNT`; // Megatons
  } else if (megatons >= 0.001) {
    return `${(megatons * 1000).toFixed(2)} kt TNT`; // Kilotons
  } else {
    return `${(megatons * 1000000).toFixed(2)} t TNT`; // Tons
  }
}

/**
 * Define known explosion references for comparison
 */
interface ExplosionReference {
  name: string;
  megatons: number;
  description: string;
}

const explosionReferences: ExplosionReference[] = [
  { name: "Tsar Bomba", megatons: 50, description: "Largest nuclear weapon ever tested (USSR, 1961)" },
  { name: "Castle Bravo", megatons: 15, description: "Largest US thermonuclear test (1954)" },
  { name: "Krakatoa Eruption", megatons: 200, description: "Volcanic eruption (Indonesia, 1883)" },
  { name: "Mt. St. Helens", megatons: 24, description: "Volcanic eruption (USA, 1980)" },
  { name: "Tunguska Event", megatons: 10, description: "Likely asteroid impact (Siberia, 1908)" },
  { name: "Chelyabinsk Meteor", megatons: 0.4, description: "Meteor impact (Russia, 2013)" },
  { name: "Hiroshima Bomb", megatons: 0.015, description: "First nuclear weapon used in war (1945)" },
  { name: "Beirut Explosion", megatons: 0.0011, description: "Ammonium nitrate disaster (2020)" },
  { name: "Oklahoma City Bombing", megatons: 0.002, description: "Terrorist attack (1995)" },
  { name: "MOAB (Mother of All Bombs)", megatons: 0.011, description: "Largest non-nuclear US bomb" }
];

/**
 * Get a comparable historic explosion for scale reference
 */
export function getComparableExplosion(megatons: number): string {
  // Special case for extremely large impacts
  if (megatons >= 100000) {
    return `${(megatons / 100000).toFixed(1)}× the Chicxulub impact (dinosaur extinction event)`;
  }
  
  // Special case for extremely large impacts
  if (megatons >= 1000) {
    const tsarBombaCount = Math.round(megatons / 50);
    return `Equivalent to ${tsarBombaCount.toLocaleString()} Tsar Bombas (largest nuclear weapon ever tested)`;
  }
  
  // Find closest reference by energy
  let closestRef = explosionReferences[0];
  let smallestDiff = Math.abs(Math.log10(megatons) - Math.log10(closestRef.megatons));
  
  for (const ref of explosionReferences) {
    const diff = Math.abs(Math.log10(megatons) - Math.log10(ref.megatons));
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestRef = ref;
    }
  }
  
  // Calculate how many times larger or smaller
  const ratio = megatons / closestRef.megatons;
  
  if (ratio > 0.9 && ratio < 1.1) {
    return `Similar to the ${closestRef.name} (${closestRef.megatons} Mt)`;
  } else if (ratio >= 1.1) {
    const times = ratio.toFixed(1);
    return `${times}× more powerful than the ${closestRef.name} (${closestRef.megatons} Mt)`;
  } else {
    const times = (1 / ratio).toFixed(1);
    return `${times}× less powerful than the ${closestRef.name} (${closestRef.megatons} Mt)`;
  }
}

/**
 * Get multiple comparisons for better understanding of the scale
 */
export function getMultipleComparisons(megatons: number): string[] {
  const comparisons: string[] = [];
  
  // Tsar Bomba comparison (if applicable)
  if (megatons > 10) {
    const tsarBombaRatio = megatons / 50;
    comparisons.push(`${tsarBombaRatio.toFixed(1)}× the Tsar Bomba (largest nuclear weapon ever tested)`);
  }
  
  // Hiroshima bomb comparison
  const hiroshimaBombs = megatons / 0.015;
  if (hiroshimaBombs >= 1) {
    comparisons.push(`${Math.round(hiroshimaBombs).toLocaleString()} Hiroshima atomic bombs`);
  }
  
  // Natural disaster comparison
  if (megatons > 5) {
    if (megatons < 30) {
      comparisons.push(`Similar energy to the Mt. St. Helens eruption (24 Mt)`);
    } else if (megatons < 250) {
      comparisons.push(`Similar energy to the Krakatoa volcanic eruption (200 Mt)`);
    } else if (megatons < 100000) {
      comparisons.push(`${(megatons / 200).toFixed(1)}× the Krakatoa volcanic eruption`);
    } else {
      comparisons.push(`${(megatons / 100000).toFixed(1)}× the Chicxulub impact (dinosaur extinction event)`);
    }
  }
  
  // Energy consumption comparison
  const worldEnergyYear = 157000; // World annual energy consumption in Mt TNT equivalent
  if (megatons > 100) {
    const worldEnergyRatio = megatons / worldEnergyYear;
    if (worldEnergyRatio < 1) {
      comparisons.push(`${(worldEnergyRatio * 100).toFixed(1)}% of worldwide annual energy consumption`);
    } else {
      comparisons.push(`${worldEnergyRatio.toFixed(1)}× worldwide annual energy consumption`);
    }
  }
  
  // Ensure we have at least one comparison
  if (comparisons.length === 0) {
    comparisons.push(getComparableExplosion(megatons));
  }
  
  return comparisons;
}