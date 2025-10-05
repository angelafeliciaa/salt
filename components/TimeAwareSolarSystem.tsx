"use client";

import React, { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import Sun from "./Sun";
import EnhancedPlanet from "./EnhancedPlanet";
import Stars from "./Stars";
import Explosion from "./Explosion";
import Asteroid, { AsteroidData } from "./Asteroid";
import { BODIES, helioXYZAt } from '../utils/ephemeris';

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
const EARTH_SIZE = 0.15; // Visual size in the scene
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
  onTimeChange
}: TimeAwareSolarSystemProps) {
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

  // Planet component
  const Planet = ({ planet, position }: { planet: PlanetData; position: [number, number, number] }) => {
    const planetRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

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

    // Calculate orbit radius for ring visualization - matching SolarSystem.tsx
    const orbitRadius = planet.distance * EARTH_DISTANCE;

    return (
      <group
        ref={planetRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Orbit path visualization - positioned at origin */}
        {(() => {
          const thickness = orbitRadius * 0.0005;
          const inner = Math.max(0.001, orbitRadius - thickness / 2);
          const outer = orbitRadius + thickness / 2;
          return (
            <mesh rotation-x={Math.PI / 2}>
              <ringGeometry args={[inner, outer, 128]} />
              <meshBasicMaterial 
                color="#ffffff" 
                opacity={1} 
                transparent 
                side={THREE.DoubleSide}
                depthWrite={false}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </mesh>

            
          );
        })()}
        
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
            showLabel={showLabels || hovered}
          />
        </group>
      </group>
    );
  };

  return (
    <>
      {/* Background stars - reduced count for less visual clutter */}
      <Stars count={800} radius={100} starSize={0.12} />
      
      {/* The Sun */}
      <Sun />
      
      {/* Planets */}
      {planets.map((planet) => {
        const position = calculatePlanetPosition(planet, currentTime);
        return (
          <Planet 
            key={planet.name} 
            planet={planet} 
            position={position} 
          />
        );
      })}
      
      {/* Render only the selected asteroid */}
      {(() => {
        const selectedIndex = asteroids.findIndex(a => a.id === selectedAsteroidId);
        if (selectedIndex >= 0) {
          const selectedAsteroid = asteroids[selectedIndex];
          return (
            <Asteroid
              key={selectedAsteroid.id}
              asteroid={selectedAsteroid}
              position={asteroidPositions[selectedIndex] || [0, 0, 0]}
              selected={true}
              onClick={() => onAsteroidClick(selectedAsteroid)}
            />
          );
        }
        return null;
      })()}
      
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
    </>
  );
}

export default TimeAwareSolarSystem;