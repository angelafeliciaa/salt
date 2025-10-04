import { AsteroidData } from "../components/Asteroid";
import * as THREE from "three";

// Function to calculate asteroid position in the 3D space
export function calculateAsteroidPosition(asteroid: AsteroidData): [number, number, number] {
  // Get data from closest approach
  const approach = asteroid.closeApproachData[0];
  if (!approach) {
    // If no approach data, place randomly but visible
    return [
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 5
    ];
  }
  
  // Get astronomical distance (in AU)
  const auDistance = parseFloat(approach.missDistance.astronomical) || 0;
  
  // Clamp the distance between 3 and 8 units to keep it visible
  // (this is not to scale but for visualization purposes)
  const clampedDistance = Math.min(Math.max(auDistance * 3, 3), 8);
  
  // Get orbiting body
  const orbitingBody = approach.orbitingBody || 'Earth';
  
  // Different logic based on orbiting body
  switch(orbitingBody) {
    case 'Earth':
      // Place around Earth position (Earth is at distance 1)
      return calculatePositionAroundPlanet(1, clampedDistance);
      
    case 'Venus':
      // Place around Venus position (Venus is at distance ~0.7)
      return calculatePositionAroundPlanet(0.7, clampedDistance);
      
    case 'Mercury':
      // Place around Mercury position (Mercury is at distance ~0.4)
      return calculatePositionAroundPlanet(0.4, clampedDistance);
      
    case 'Mars':
      // Place around Mars position (Mars is at distance ~1.5)
      return calculatePositionAroundPlanet(1.5, clampedDistance);
      
    default:
      // For other bodies, place it somewhere visible
      return [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 8
      ];
  }
}

// Helper function to calculate a position around a planet
function calculatePositionAroundPlanet(planetDistance: number, asteroidDistance: number): [number, number, number] {
  // In our solar system, Earth is at distance 2.5 from the sun
  const EARTH_DISTANCE = 2.5;
  
  // Scale the planet distance to our scene
  const scaledPlanetDistance = planetDistance * EARTH_DISTANCE;
  
  // Generate a random angle for position around the planet
  const angle = Math.random() * Math.PI * 2;
  
  // Generate a random elevation (y-position)
  const elevation = (Math.random() - 0.5) * 2;
  
  // Calculate position using spherical coordinates
  const x = Math.cos(angle) * scaledPlanetDistance * 1.2;
  const z = Math.sin(angle) * scaledPlanetDistance * 1.2;
  
  // Adjust the radius a bit for visual interest
  const offsetX = (Math.random() - 0.5) * 2;
  const offsetZ = (Math.random() - 0.5) * 2;
  
  return [x + offsetX, elevation, z + offsetZ];
}