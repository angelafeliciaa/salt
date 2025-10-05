"use client";

import React, { useRef, useState, forwardRef, ForwardedRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import AsteroidModel from "./AsteroidModel";
import { AsteroidData } from "./Asteroid";

interface AnimatedAsteroidProps {
  asteroid: AsteroidData;
  basePosition: [number, number, number];
  selected: boolean;
  onClick: () => void;
  animationSpeed?: number;
}

export const AnimatedAsteroid = forwardRef(({ 
  asteroid, 
  basePosition, 
  selected,
  onClick,
  animationSpeed = 0.5
}: AnimatedAsteroidProps, ref: ForwardedRef<THREE.Group>) => {
  // Refs for the asteroid group and position tracking
  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef<[number, number, number]>(basePosition);
  // We no longer need to import or use orbit trails for asteroids
  // const { addTrailPoint } = useOrbitTrails();
  
  // Get asteroid orbit parameters from base position
  const distanceFromSun = Math.sqrt(
    basePosition[0] * basePosition[0] + 
    basePosition[2] * basePosition[2]
  );
  
  // Calculate the original angle from the base position
  const originalAngle = Math.atan2(basePosition[2], basePosition[0]);

  // Generate orbital parameters based on asteroid ID
  const generateParameter = (seed: string, min: number, max: number) => {
    // Simple hash function for the seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Normalize to 0-1 range then scale to desired range
    const value = Math.abs((hash % 1000) / 1000);
    return min + value * (max - min);
  };
  
  // Get orbital parameters based on asteroid ID
  const eccentricity = generateParameter(asteroid.id + "-ecc", 0.02, 0.2);
  const inclination = generateParameter(asteroid.id + "-inc", -0.15, 0.15);
  const periodFactor = generateParameter(asteroid.id + "-period", 0.9, 1.1);
  const orbitingBody = asteroid.closeApproachData[0]?.orbitingBody || 'Earth';
  
  // Calculate orbit period based on semi-major axis and orbiting body
  let orbitalPeriod: number;
  
  if (orbitingBody === 'Mercury') {
    // Mercury-orbit asteroids move faster
    orbitalPeriod = 88 * Math.pow(distanceFromSun / 40, 1.5);
  } else if (orbitingBody === 'Venus') {
    // Venus-orbit asteroids
    orbitalPeriod = 225 * Math.pow(distanceFromSun / 70, 1.5);
  } else if (orbitingBody === 'Earth') {
    // Earth-orbit asteroids
    orbitalPeriod = 365.25 * Math.pow(distanceFromSun / 100, 1.5);
  } else if (orbitingBody === 'Mars') {
    // Mars-orbit asteroids
    orbitalPeriod = 687 * Math.pow(distanceFromSun / 150, 1.5);
  } else {
    // Default calculation for other bodies
    orbitalPeriod = 1000 * Math.pow(distanceFromSun / 100, 1.5);
  }
  
  // Apply variation to period
  orbitalPeriod *= periodFactor;
  
  // Starting phase offset for variety
  const phaseOffset = generateParameter(asteroid.id + "-phase", 0, Math.PI * 2);
  
  // Orbital animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    // Calculate orbital position based on time
    const time = clock.getElapsedTime() * animationSpeed;
    const angle = phaseOffset + time * (2 * Math.PI) / (orbitalPeriod / 10);
    
    // Calculate radius with eccentricity (Kepler's first law)
    const semiMajorAxis = distanceFromSun; 
    const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / 
                  (1 + eccentricity * Math.cos(angle));
    
    // Calculate new position
    const x = Math.cos(angle) * radius;
    const y = basePosition[1] + Math.sin(angle) * inclination * radius; // Add slight orbital tilt
    const z = Math.sin(angle) * radius;
    
    const newPosition: [number, number, number] = [x, y, z];
    
    // Special behavior for hazardous asteroids
    if (asteroid.isPotentiallyHazardous) {
      // Add slight oscillations for more dynamic movement
      const oscillation = Math.sin(time * 0.5 + parseFloat(asteroid.id)) * radius * 0.05;
      newPosition[0] += oscillation;
      newPosition[2] += oscillation;
    }
    
    // Update asteroid position
    groupRef.current.position.set(newPosition[0], newPosition[1], newPosition[2]);
    positionRef.current = newPosition;
    
    // We no longer add orbital trail points for asteroids
    // Trail visualization has been disabled as requested
  });

  // Handle ref forwarding
  const handleRef = (node: THREE.Group | null) => {
    // Handle both refs - our internal ref and the forwarded ref
    groupRef.current = node;
    
    // Handle the forwarded ref properly
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <group ref={handleRef} position={basePosition}>
      <AsteroidModel
        asteroid={asteroid}
        position={[0, 0, 0]} // Position relative to the group
        selected={selected}
        onClick={onClick}
        modelPath="/shaders/asteroidPack.glb"
      />
    </group>
  );
});

AnimatedAsteroid.displayName = 'AnimatedAsteroid';

export default AnimatedAsteroid;