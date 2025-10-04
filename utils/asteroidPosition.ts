import { AsteroidData } from "../components/Asteroid";
import * as THREE from "three";

// Function to calculate asteroid position in the 3D space
export function calculateAsteroidPosition(asteroid: AsteroidData): [number, number, number] {
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
  
  // Use seed (asteroid ID) for deterministic angle - default to 0 if no seed
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
  
  // Generate deterministic values from seed
  const seedValue = hashCode(seed);
  const angle = seedValue * Math.PI * 2;
  const elevation = (seedValue * 2 - 1) * 3; // Elevation range -3 to 3
  
  // Calculate position using spherical coordinates
  const x = Math.cos(angle) * scaledPlanetDistance * 1.2;
  const z = Math.sin(angle) * scaledPlanetDistance * 1.2;
  
  // Use additional hash values for offsets to keep positions interesting but stable
  const offsetSeedX = hashCode(seed ? seed + "x" : "x");
  const offsetSeedZ = hashCode(seed ? seed + "z" : "z");
  
  const offsetX = (offsetSeedX * 2 - 1) * 3; // Offset range -3 to 3
  const offsetZ = (offsetSeedZ * 2 - 1) * 3;
  
  return [x + offsetX, elevation, z + offsetZ];
}