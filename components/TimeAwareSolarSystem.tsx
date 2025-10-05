"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import Sun from "./Sun";
import EnhancedPlanet from "./EnhancedPlanet";
import Stars from "./Stars";
import Explosion from "./Explosion";
import { AsteroidData } from "./Asteroid";
import AsteroidModel from "./AsteroidModel";
import CameraController from "./CameraController";
import { BODIES, helioXYZAt } from '../utils/ephemeris';
import { OrbitTrailsProvider, useOrbitTrails } from "./OrbitTrailsContext";
// Planet texture maps (diffuse/color)
import mercuryMap from "../app/images/mercurymap.jpg";
import venusMap from "../app/images/venusmap.jpg";
import earthDayMap from "../app/images/earth_daymap.jpg";
import marsMap from "../app/images/marsmap.jpg";
// Bump/height maps
import mercuryBump from "../app/images/mercurybump.jpg";
import venusBump from "../app/images/venusbump.jpg";
import marsBump from "../app/images/marsbump.jpg";

interface PlanetData {
  name: string;
  color: string;
  size: number; // Relative to Earth = 1
  distance: number; // AU from Sun (Earth = 1)
  orbitalPeriod: number; // Earth days for full orbit
  rotationPeriod: number; // Hours for full rotation
  axialTilt: number; // Degrees
}

// Planet data with realistic orbital parameters - matching SolarSystem.tsx scaling
const planets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#9ca3af",
    size: 5.745, // ~38% of Earth's size (matching SolarSystem.tsx)
    distance: 38.7, // 0.387 AU from Sun (matching SolarSystem.tsx)
    orbitalPeriod: 88,
    rotationPeriod: 1408,
    axialTilt: 0.03,
  },
  {
    name: "Venus",
    color: "#fbbf24",
    size: 14.25, // 95% of Earth's size (matching SolarSystem.tsx)
    distance: 72.3, // 0.723 AU from Sun (matching SolarSystem.tsx)
    orbitalPeriod: 225,
    rotationPeriod: -5832, // Retrograde
    axialTilt: 177.4,
  },
  {
    name: "Earth",
    color: "#60a5fa",
    size: 15, // Reference size (matching SolarSystem.tsx)
    distance: 100, // Reference distance (matching SolarSystem.tsx)
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    axialTilt: 23.5,
  },
  {
    name: "Mars",
    color: "#dc2626",
    size: 7.98, // ~53% of Earth's size (matching SolarSystem.tsx)
    distance: 152.4, // 1.524 AU from Sun (matching SolarSystem.tsx)
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    axialTilt: 25.2,
  },
];

// Scaling constants - matching SolarSystem.tsx
const EARTH_SIZE = 0.2; // Visual size in the scene (increased from 0.15)
const EARTH_DISTANCE = 2.5; // Distance from Sun in scene units
const SCALE_FACTOR = 1 / 50_000_000; // 1 unit = 50 million km (for real positions)

interface TimeAwareSolarSystemProps {
  animationSpeed?: number;
  showLabels?: boolean;
  asteroids?: AsteroidData[];
  asteroidPositions?: [number, number, number][];
  selectedAsteroidId?: string;
  onAsteroidClick?: (asteroid: AsteroidData) => void;
  currentTime?: Date;
  isPaused?: boolean;
  onTimeChange?: (time: Date) => void;
  navigationTarget?: "none" | "earth" | "asteroid";
  onNavigationComplete?: () => void;
}

export function TimeAwareSolarSystem({
  animationSpeed = 0.5,
  showLabels = true,
  asteroids = [],
  asteroidPositions = [],
  selectedAsteroidId = "",
  onAsteroidClick = () => {},
  currentTime = new Date(),
  isPaused = false,
  onTimeChange,
  navigationTarget = "none",
  onNavigationComplete = () => {}
}: TimeAwareSolarSystemProps) {
  // Refs for planets and asteroids
  const earthRef = useRef<THREE.Group>(null);
  const asteroidRef = useRef<THREE.Group>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [useRealPositions, setUseRealPositions] = useState(false);

  // Calculate real planetary positions using astronomy-engine
  const realPositions = useMemo(() => {
    if (!useRealPositions) return null;
    try {
      return helioXYZAt(currentTime, BODIES);
    } catch (error) {
      console.error('Error calculating real positions:', error);
      return null;
    }
  }, [currentTime, useRealPositions]);

  // Random explosion effect for fun
  const triggerRandomExplosion = () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 2 + Math.random() * 3;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    
    setExplosionPosition([x, 0, z]);
    setShowExplosion(true);
    
    // Reset explosion after it completes
    setTimeout(() => setShowExplosion(false), 2000);
  };

  // Calculate planet position based on time
  const calculatePlanetPosition = (planet: PlanetData, time: Date): [number, number, number] => {
    if (useRealPositions && realPositions) {
      // Use real astronomical positions
      const realPos = realPositions.find(p => p.name === planet.name);
      if (realPos) {
        // Convert from km to scene units (1 AU ≈ 150 million km)
        const auToKm = 149_597_870.7; // 1 AU in km
        const scaleToScene = EARTH_DISTANCE / auToKm; // Convert AU to scene units
        
        return [
          realPos.x * scaleToScene,
          realPos.y * scaleToScene,
          realPos.z * scaleToScene
        ];
      }
    }

    // Fallback to calculated orbital mechanics
    const j2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (time.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
    
    const meanAnomaly = (360 * daysSinceJ2000 / planet.orbitalPeriod) % 360;
    const meanAnomalyRad = (meanAnomaly * Math.PI) / 180;
    
    const orbitRadius = planet.distance * EARTH_DISTANCE;
    const x = Math.cos(meanAnomalyRad) * orbitRadius;
    const z = Math.sin(meanAnomalyRad) * orbitRadius;
    const y = 0;
    
    return [x, y, z];
  };

  // Planet component with ref forwarding
  const Planet = React.forwardRef(({ 
    planet, 
    position 
  }: { 
    planet: PlanetData; 
    position: [number, number, number] 
  }, ref: React.ForwardedRef<THREE.Group>) => {
    const planetRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const { addTrailPoint } = useOrbitTrails();
    
    // Handle both refs - internal ref and forwarded ref
    const handleRef = (node: THREE.Group | null) => {
      // Set internal ref
      planetRef.current = node;
      
      // Handle the forwarded ref
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };
    
    // Generate a unique ID for this planet
    const planetId = useRef(`planet-${planet.name}-${Math.random().toString(36).substr(2, 9)}`);
    
    // Add trail point when position changes
    const prevPosition = useRef<THREE.Vector3>(new THREE.Vector3(...position));
    
    useEffect(() => {
      // Only add point when position changes significantly
      const newPos = new THREE.Vector3(...position);
      if (newPos.distanceToSquared(prevPosition.current) > 0.01) {
        addTrailPoint(planetId.current, newPos);
        prevPosition.current.copy(newPos);
      }
    }, [position, addTrailPoint]);

    // Planet rotation animation - only when not paused
    useFrame(() => {
      if (planetRef.current && !isPaused) {
        planetRef.current.rotation.y += 0.005;
      }
    });

    const size = planet.size * EARTH_SIZE;
    const hasAtmosphere = planet.name === "Earth" || planet.name === "Venus";
    const atmosphereColor = planet.name === "Earth" ? "#4299e1" : 
                           planet.name === "Venus" ? "#fbbf2480" : 
                           undefined;
                           
    return (
      <group
        ref={handleRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Planet positioned on the orbit */}
        <group position={position}>
          <EnhancedPlanet
            name={planet.name}
            position={[0, 0, 0]}
            size={size}
            color={planet.color}
            rotationSpeed={0.005}
            hasAtmosphere={hasAtmosphere}
            atmosphereColor={atmosphereColor}
            textureUrl={
              planet.name === "Mercury" ? mercuryMap :
              planet.name === "Venus" ? venusMap :
              planet.name === "Earth" ? earthDayMap :
              planet.name === "Mars" ? marsMap :
              undefined
            }
            bumpTextureUrl={
              planet.name === "Mercury" ? mercuryBump :
              planet.name === "Venus" ? venusBump :
              planet.name === "Mars" ? marsBump :
              undefined
            }
            bumpScale={planet.name === "Mars" ? 0.05 : 0.03}
            showLabel={showLabels || hovered}
          />
        </group>
      </group>
    );
  });
  
  // Add display name for better debugging
  Planet.displayName = "Planet";

  return (
    <OrbitTrailsProvider maxPoints={300} trailColor="#ffffff" trailOpacity={0.15}>
      {/* Background stars - scaled far away from the solar system */}
      <Stars count={2500} radius={1000} starSize={1.5} />
      
      {/* The Sun */}
      <Sun />
      
      {/* Planets */}
      {planets.map((planet) => {
        const position = calculatePlanetPosition(planet, currentTime);
        // Assign earthRef to Earth planet
        const ref = planet.name === "Earth" ? earthRef : undefined;
        
        return (
          <Planet 
            key={planet.name} 
            planet={planet} 
            position={position}
            ref={ref}
          />
        );
      })}
      
      {/* Render all asteroids - with time-based positions */}
      {asteroids.map((asteroid, index) => {
        const isSelected = asteroid.id === selectedAsteroidId;
        
        // Only render if we have position data
        if (asteroidPositions[index]) {
          // Get the base position first
          const basePosition = asteroidPositions[index];
          const orbitingBody = asteroid.closeApproachData[0]?.orbitingBody || 'Earth';
          
          // Calculate time-aware position for the asteroid based on time
          let timeBasedPosition: [number, number, number] = [...basePosition];
          
          // Get asteroid orbit parameters from base position
          const distanceFromSun = Math.sqrt(
            basePosition[0] * basePosition[0] + 
            basePosition[2] * basePosition[2]
          );
          
          // Calculate the original angle from the base position
          const originalAngle = Math.atan2(basePosition[2], basePosition[0]);
          
          // Use asteroid ID to generate consistent orbital parameters
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
          
          // Calculate orbit period based on orbiting body and distance
          let orbitalPeriod: number;
          
          if (orbitingBody === 'Mercury') {
            orbitalPeriod = 88 * Math.pow(distanceFromSun / 40, 1.5);
          } else if (orbitingBody === 'Venus') {
            orbitalPeriod = 225 * Math.pow(distanceFromSun / 70, 1.5);
          } else if (orbitingBody === 'Earth') {
            orbitalPeriod = 365.25 * Math.pow(distanceFromSun / 100, 1.5);
          } else if (orbitingBody === 'Mars') {
            orbitalPeriod = 687 * Math.pow(distanceFromSun / 150, 1.5);
          } else {
            orbitalPeriod = 1000 * Math.pow(distanceFromSun / 100, 1.5);
          }
          
          // Add variation based on asteroid ID
          const periodVariation = generateParameter(asteroid.id + "-period", 0.9, 1.1);
          orbitalPeriod *= periodVariation;
          
          // Get the j2000 date for reference - same as for planets
          const j2000 = new Date('2000-01-01T12:00:00Z');
          const daysSinceJ2000 = (currentTime.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
          
          // Calculate mean anomaly based on time - static for the current time
          const meanAnomaly = (360 * daysSinceJ2000 / orbitalPeriod) % 360;
          const meanAnomalyRad = (meanAnomaly * Math.PI) / 180;
          
          // Calculate position based on orbital parameters and time
          const newAngle = originalAngle + meanAnomalyRad;
          
          // Calculate radius with eccentricity (Kepler's first law)
          const semiMajorAxis = distanceFromSun; 
          const radius = semiMajorAxis * (1 - eccentricity * eccentricity) / 
                        (1 + eccentricity * Math.cos(newAngle));
          
          // Calculate the new position based on the angle and distance
          timeBasedPosition = [
            Math.cos(newAngle) * radius,
            basePosition[1] + Math.sin(newAngle) * inclination * radius,
            Math.sin(newAngle) * radius
          ];
          
          // Special behavior for hazardous asteroids
          if (asteroid.isPotentiallyHazardous) {
            // Add slight position variation for hazardous asteroids
            const variation = Math.sin(parseFloat(asteroid.id) + daysSinceJ2000 / 100) * radius * 0.05;
            timeBasedPosition[0] += variation;
            timeBasedPosition[2] += variation;
          }
          
          // Use the AsteroidModel with time-based position (but no animation)
          return (
            <AsteroidModel
              key={asteroid.id}
              asteroid={asteroid}
              position={timeBasedPosition}  // Use time-based position that updates with currentTime
              selected={isSelected}
              onClick={() => onAsteroidClick(asteroid)}
              ref={isSelected ? asteroidRef : undefined}
            />
          );
        }
        return null;
      })}
      
      {/* Explosion effects */}
      {showExplosion && (
        <Explosion 
          position={explosionPosition}
          size={0.8}
          duration={2}
          onComplete={() => setShowExplosion(false)}
        />
      )}
      
      {/* Easter egg: Double-click anywhere to trigger an explosion */}
      <mesh 
        position={[0, 0, 0]} 
        scale={100} 
        visible={false} 
        onDoubleClick={triggerRandomExplosion}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Camera controller for Earth and Asteroid navigation */}
      <CameraController 
        earthRef={earthRef}
        asteroidRef={asteroidRef}
        navigationTarget={navigationTarget}
        onNavigationComplete={onNavigationComplete}
      />
    </OrbitTrailsProvider>
  );
}

export default TimeAwareSolarSystem;