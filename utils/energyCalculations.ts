import { AsteroidData } from "../components/Asteroid";

// Constants for calculations
const TNT_ENERGY_PER_KG = 4.184e6; // joules per kg of TNT

// Asteroid density by type
const ASTEROID_DENSITIES = {
  // Density ranges in kg/m³
  stony: 3500,       // Stony/rocky asteroids (S-type)
  carbonaceous: 1600, // Carbon-rich (C-type)
  metallic: 8000,     // Metallic asteroids (M-type)
  // Default value if type unknown
  default: 2600       // Average density across all known asteroids
};

/**
 * Estimate the asteroid type based on its properties
 * This is a simplified approximation
 */
function estimateAsteroidType(asteroid: AsteroidData): keyof typeof ASTEROID_DENSITIES {
  // Advanced implementation could use spectral data or orbital parameters
  // For now, let's use simple heuristics based on the name and ID
  
  const name = asteroid.name.toLowerCase();
  const id = asteroid.id;
  
  // Check for known metallic asteroid indicators
  if (
    name.includes("psyche") || 
    name.includes("metal") || 
    name.includes("iron") ||
    // Certain id patterns tend to correlate with specific compositions
    (parseInt(id) > 100000 && parseInt(id) < 120000)
  ) {
    return "metallic";
  }
  
  // Check for carbon-rich asteroid indicators
  if (
    name.includes("carbon") || 
    name.includes("dark") || 
    name.includes("noir") ||
    name.includes("bennu") ||
    name.includes("ryugu") ||
    // Certain id patterns tend to correlate with specific compositions
    (parseInt(id) > 20000 && parseInt(id) < 40000)
  ) {
    return "carbonaceous";
  }
  
  // Otherwise assume stony (most common type)
  return "stony";
}

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
  
  // Estimate type and get appropriate density
  const asteroidType = estimateAsteroidType(asteroid);
  const density = ASTEROID_DENSITIES[asteroidType];
  
  // Calculate mass in kg
  const mass = volume * density;
  
  return mass;
}

/**
 * Get the estimated density of the asteroid in kg/m³
 */
export function getAsteroidDensity(asteroid: AsteroidData): number {
  const asteroidType = estimateAsteroidType(asteroid);
  return ASTEROID_DENSITIES[asteroidType];
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
 * Estimate impact crater diameter in kilometers using a simplified formula
 * based on energy and standard impact conditions
 * 
 * @param megatons TNT equivalent in megatons
 * @returns Estimated crater diameter in kilometers
 */
export function estimateCraterDiameter(megatons: number): number {
  // Simplified formula based on scaling laws from nuclear tests and impact studies
  // Dcr ≈ k × E^0.33 where k is a constant that depends on ground conditions
  // Here we use a simplified approximation with k = 0.04 for typical earth surface
  
  const energyInJoules = megatons * 4.184e15; // Convert MT to joules
  return 0.04 * Math.pow(energyInJoules, 0.33) / 1000; // Convert to km
}

/**
 * Estimate affected area (complete destruction) in square kilometers
 * 
 * @param megatons TNT equivalent in megatons
 * @returns Area in square kilometers
 */
export function estimateDestructionArea(megatons: number): number {
  // Using an approximation for air burst effect radius
  // Severe damage radius ≈ 2.5 * (yield in MT)^(1/3) in kilometers
  const severeRadius = 2.5 * Math.pow(megatons, 1/3);
  
  // Area = πr²
  return Math.PI * Math.pow(severeRadius, 2);
}

/**
 * Get human impact description based on the energy scale
 * 
 * @param megatons TNT equivalent in megatons
 * @returns Human impact description
 */
export function getHumanImpact(megatons: number): string {
  if (megatons >= 100000) {
    return "Global extinction event - end of human civilization";
  }
  if (megatons >= 10000) {
    return "Mass extinction event - collapse of global ecosystem";
  }
  if (megatons >= 1000) {
    return "Continental-scale devastation - billions of casualties";
  }
  if (megatons >= 100) {
    return "Regional catastrophe - millions of casualties";
  }
  if (megatons >= 10) {
    return "Major metropolitan area destroyed - hundreds of thousands of casualties";
  }
  if (megatons >= 1) {
    return "City-level destruction - tens of thousands of casualties";
  }
  if (megatons >= 0.1) {
    return "Neighborhood-level destruction - thousands of casualties";
  }
  if (megatons >= 0.01) {
    return "Local destruction - hundreds of casualties";
  }
  if (megatons >= 0.001) {
    return "Building-level damage - potential casualties";
  }
  return "Minimal damage - likely no casualties";
}

/**
 * Get multiple comparisons for better understanding of the scale
 */
export function getMultipleComparisons(megatons: number): string[] {
  const comparisons: string[] = [];
  
  // Add crater size estimation (for larger impacts)
  if (megatons >= 1) {
    const craterDiameter = estimateCraterDiameter(megatons);
    comparisons.push(`Estimated crater diameter: ${craterDiameter.toFixed(1)} km`);
  }
  
  // Add destruction area (for all impacts)
  const destructionArea = estimateDestructionArea(megatons);
  if (destructionArea >= 10000) {
    comparisons.push(`Devastation area: ${(destructionArea / 10000).toFixed(1)} million km²`);
  } else if (destructionArea >= 10) {
    comparisons.push(`Devastation area: ${destructionArea.toFixed(1)} km²`);
  } else {
    comparisons.push(`Devastation area: ${(destructionArea * 100).toFixed(1)} hectares`);
  }
  
  // Add human impact description
  comparisons.push(getHumanImpact(megatons));
  
  // Tsar Bomba comparison (if applicable)
  if (megatons > 1) {
    const tsarBombaRatio = megatons / 50;
    if (tsarBombaRatio >= 10) {
      comparisons.push(`${tsarBombaRatio.toFixed(1)}× the Tsar Bomba (largest nuclear weapon ever tested)`);
    } else if (tsarBombaRatio >= 0.1) {
      comparisons.push(`${(tsarBombaRatio * 100).toFixed(0)}% of the Tsar Bomba's yield`);
    }
  }
  
  // Hiroshima bomb comparison
  const hiroshimaBombs = megatons / 0.015;
  if (hiroshimaBombs >= 10) {
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
  
  return comparisons;
}