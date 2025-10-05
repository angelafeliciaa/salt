import { AsteroidData } from "../components/Asteroid";
import * as THREE from "three";

// Function to calculate asteroid position in the 3D space
// Added timeMode parameter to determine if this is for time-aware positioning
export function calculateAsteroidPosition(
  asteroid: AsteroidData, 
  timeMode: boolean = false
): [number, number, number] {
  // Get data from closest approach
  const approach = asteroid.closeApproachData[0];
  if (!approach) {
    // Use asteroid ID as seed for deterministic "random" position
    const seed = asteroid.id;
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs((hash % 1000) / 1000); // 0-1 range
    };
    
    const xSeed = hashCode(seed + "x");
    const ySeed = hashCode(seed + "y");
    const zSeed = hashCode(seed + "z");
    
    return [
      (xSeed * 2 - 1) * 10,
      (ySeed * 2 - 1) * 3,
      (zSeed * 2 - 1) * 10
    ];
  }
  
  // Get astronomical distance (in AU)
  const auDistance = parseFloat(approach.missDistance.astronomical) || 0;
  
  // Clamp the distance between 4 and 12 units to keep it visible
  // (this is not to scale but for visualization purposes)
  const clampedDistance = Math.min(Math.max(auDistance * 5, 4), 12);
  
  // Get orbiting body
  const orbitingBody = approach.orbitingBody || 'Earth';
  
  // Different logic based on orbiting body - pass asteroid ID as seed
  switch(orbitingBody) {
    case 'Earth':
      // Place around Earth position (Earth is at updated distance)
      return calculatePositionAroundPlanet(1, clampedDistance, asteroid.id);
      
    case 'Venus':
      // Place around Venus position (Venus is at updated distance)
      return calculatePositionAroundPlanet(0.723, clampedDistance, asteroid.id);
      
    case 'Mercury':
      // Place around Mercury position (Mercury is at updated distance)
      return calculatePositionAroundPlanet(0.387, clampedDistance, asteroid.id);
      
    case 'Mars':
      // Place around Mars position (Mars is at updated distance)
      return calculatePositionAroundPlanet(1.524, clampedDistance, asteroid.id);
      
    default:
      // For other bodies, use deterministic position based on asteroid ID
      const seed = asteroid.id;
      const hashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(i);
          hash = hash & hash;
        }
        return Math.abs((hash % 1000) / 1000);
      };
      
      const xSeed = hashCode(seed + "x");
      const ySeed = hashCode(seed + "y");
      const zSeed = hashCode(seed + "z");
      
      return [
        (xSeed * 2 - 1) * 15,
        (ySeed * 2 - 1) * 5,
        (zSeed * 2 - 1) * 15
      ];
  }
}

// Helper function to calculate a position around a planet
function calculatePositionAroundPlanet(planetDistance: number, asteroidDistance: number, seed?: string): [number, number, number] {
  // Updated - In our solar system visualization, Earth is now at distance 100 from the sun
  const EARTH_DISTANCE = 100;
  
  // Scale the planet distance to our scene
  const scaledPlanetDistance = planetDistance * EARTH_DISTANCE;
  
  // Use seed (asteroid ID) for deterministic values - default to 0.5 if no seed
  // Convert the seed string to a consistent number between 0 and 1
  const hashCode = (str?: string): number => {
    if (!str) return 0.5;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Normalize to 0-1 range
    return Math.abs((hash % 1000) / 1000);
  };
  
  // Generate deterministic values from seed for different aspects of position
  const seedBase = hashCode(seed);
  const seedAngle = hashCode(seed ? seed + "angle" : "angle");
  const seedRadius = hashCode(seed ? seed + "radius" : "radius");
  const seedElevation = hashCode(seed ? seed + "elevation" : "elevation");
  
  // Create a more varied distribution:
  // 1. Variable angle around the orbital plane
  const angle = seedAngle * Math.PI * 2;
  
  // 2. Variable distance from exact orbital distance (scattered cloud effect)
  // Use a variable distance factor (0.7-1.7) times the base distance
  const distanceFactor = 0.7 + seedRadius;
  const baseDistance = scaledPlanetDistance * distanceFactor;
  
  // 3. More dramatic elevation variation
  const elevation = (seedElevation * 2 - 1) * 6; // Elevation range -6 to 6
  
  // 4. Add perturbation to orbital path - no longer a perfect circle
  const eccentricity = seedBase * 0.2; // 0-0.2 eccentricity
  const semiMajorAxis = baseDistance;
  const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
  
  // Calculate position using modified spherical coordinates
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  // Add additional randomized offsets for even more variation
  const offsetSeedX = hashCode(seed ? seed + "offsetx" : "offsetx");
  const offsetSeedZ = hashCode(seed ? seed + "offsetz" : "offsetz");
  
  // Larger offsets for more scattered appearance
  const offsetX = (offsetSeedX * 2 - 1) * 8; // Offset range -8 to 8
  const offsetZ = (offsetSeedZ * 2 - 1) * 8; // Offset range -8 to 8
  
  return [x + offsetX, elevation, z + offsetZ];
}