import { AsteroidData } from "../components/Asteroid";
import * as THREE from "three";

// Function to calculate asteroid position in the 3D space
export function calculateAsteroidPosition(asteroid: AsteroidData): [number, number, number] {
  // Get data from closest approach
  const approach = asteroid.closeApproachData[0];
  if (!approach) {
    // If no approach data, place randomly but visible
    return [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 10
    ];
  }
  
  // Get astronomical distance (in AU)
  const auDistance = parseFloat(approach.missDistance.astronomical) || 0;
  
  // Clamp the distance between 4 and 12 units to keep it visible
  // (this is not to scale but for visualization purposes)
  const clampedDistance = Math.min(Math.max(auDistance * 5, 4), 12);
  
  // Get orbiting body
  const orbitingBody = approach.orbitingBody || 'Earth';
  
  // Different logic based on orbiting body
  switch(orbitingBody) {
    case 'Earth':
      // Place around Earth position (Earth is at updated distance)
      return calculatePositionAroundPlanet(1, clampedDistance);
      
    case 'Venus':
      // Place around Venus position (Venus is at updated distance)
      return calculatePositionAroundPlanet(0.723, clampedDistance);
      
    case 'Mercury':
      // Place around Mercury position (Mercury is at updated distance)
      return calculatePositionAroundPlanet(0.387, clampedDistance);
      
    case 'Mars':
      // Place around Mars position (Mars is at updated distance)
      return calculatePositionAroundPlanet(1.524, clampedDistance);
      
    default:
      // For other bodies, place it somewhere visible
      return [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 15
      ];
  }
}

// Helper function to calculate a position around a planet
function calculatePositionAroundPlanet(planetDistance: number, asteroidDistance: number): [number, number, number] {
  // Updated - In our solar system visualization, Earth is now at distance 100 from the sun
  const EARTH_DISTANCE = 100;
  
  // Scale the planet distance to our scene
  const scaledPlanetDistance = planetDistance * EARTH_DISTANCE;
  
  // Generate a random angle for position around the planet
  const angle = Math.random() * Math.PI * 2;
  
  // Generate a random elevation (y-position)
  const elevation = (Math.random() - 0.5) * 5;
  
  // Calculate position using spherical coordinates
  const x = Math.cos(angle) * scaledPlanetDistance * 1.2;
  const z = Math.sin(angle) * scaledPlanetDistance * 1.2;
  
  // Adjust the radius a bit for visual interest
  const offsetX = (Math.random() - 0.5) * 5;
  const offsetZ = (Math.random() - 0.5) * 5;
  
  return [x + offsetX, elevation, z + offsetZ];
}