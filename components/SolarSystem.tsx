"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import EnhancedSun from "./EnhancedSun";
import EnhancedPlanet from "./EnhancedPlanet";
import Stars from "./Stars";
import Explosion from "./Explosion";
import Asteroid, { AsteroidData } from "./Asteroid";

interface PlanetData {
  name: string;
  color: string;
  size: number; // Relative to Earth = 1
  distance: number; // AU from Sun (Earth = 1)
  orbitalPeriod: number; // Earth days for full orbit
  rotationPeriod: number; // Hours for full rotation
  axialTilt: number; // Degrees
}

// Inner planets data with semi-realistic values (distances, periods, etc.)
const innerPlanets: PlanetData[] = [
  {
    name: "Mercury",
    color: "#9ca3af", // Gray
    size: 0.383, // ~38% of Earth's size
    distance: 0.387, // 0.387 AU from Sun
    orbitalPeriod: 88, // 88 Earth days
    rotationPeriod: 1408, // ~59 Earth days
    axialTilt: 0.03,
  },
  {
    name: "Venus",
    color: "#fbbf24", // Dark yellow
    size: 0.95, // 95% of Earth's size
    distance: 0.723, // 0.723 AU from Sun
    orbitalPeriod: 225, // 225 Earth days
    rotationPeriod: -5832, // Retrograde rotation (~243 Earth days)
    axialTilt: 177.4, // Nearly upside down
  },
  {
    name: "Earth",
    color: "#60a5fa", // Blue
    size: 1, // Reference size
    distance: 1, // Reference distance (1 AU)
    orbitalPeriod: 365.25, // Earth days
    rotationPeriod: 24, // Hours
    axialTilt: 23.5,
  },
  {
    name: "Mars",
    color: "#dc2626", // Red
    size: 0.532, // ~53% of Earth's size
    distance: 1.524, // 1.524 AU from Sun
    orbitalPeriod: 687, // 687 Earth days
    rotationPeriod: 24.6, // Hours
    axialTilt: 25.2,
  },
];

// For the solar system, we scale Earth to be a certain size and distance,
// then use those as a reference for other planets
const EARTH_SIZE = 0.15; // Visual size in the scene
const EARTH_DISTANCE = 2.5; // Distance from Sun in scene units
const ANIMATION_SPEED = 0.5; // Higher values = faster orbits

export function Planet({
  planet,
  animationSpeed = ANIMATION_SPEED,
  showLabel = true,
}: {
  planet: PlanetData;
  animationSpeed?: number;
  showLabel?: boolean;
}) {
  // Calculate planet size relative to Earth
  const size = planet.size * EARTH_SIZE;
  
  // Calculate orbit radius
  const orbitRadius = planet.distance * EARTH_DISTANCE;
  
  // Planet position refs for orbital animation
  const [position, setPosition] = React.useState<[number, number, number]>([orbitRadius, 0, 0]);
  
  // Calculate orbital speed
  const orbitalSpeed = (2 * Math.PI) / (planet.orbitalPeriod / 10) * animationSpeed;
  
  // Calculate rotation speed
  const rotationSpeed = (2 * Math.PI) / (planet.rotationPeriod * 100);

  // Check if planet has atmosphere
  const hasAtmosphere = planet.name === "Earth" || planet.name === "Venus";
  
  // Choose appropriate atmosphere color
  const atmosphereColor = planet.name === "Earth" ? "#4299e1" : 
                         planet.name === "Venus" ? "#fbbf2480" : 
                         undefined;
                         
  // Orbital animation
  useFrame(({ clock }) => {
    // Calculate orbital position
    const time = clock.getElapsedTime() * animationSpeed;
    const angle = time * (2 * Math.PI) / (planet.orbitalPeriod / 10);
    
    // Update position in orbit
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    
    setPosition([x, 0, z]);
  });

  return (
    <>
      {/* Orbit path visualization */}
      {/* @ts-expect-error r3f intrinsic */}
      <mesh rotation-x={Math.PI / 2}>
        {/* @ts-expect-error r3f intrinsic */}
        <ringGeometry args={[orbitRadius - 0.01, orbitRadius + 0.01, 64]} />
        {/* @ts-expect-error r3f intrinsic */}
        <meshBasicMaterial color="#444444" opacity={0.3} transparent side={THREE.DoubleSide} />
      {/* @ts-expect-error r3f intrinsic */}
      </mesh>
      
      {/* Planet with enhanced visuals */}
      <EnhancedPlanet 
        name={planet.name}
        position={position}
        size={size}
        color={planet.color}
        rotationSpeed={rotationSpeed}
        hasAtmosphere={hasAtmosphere}
        atmosphereColor={atmosphereColor}
        showLabel={showLabel}
      />
    </>
  );
}

export function Sun() {
  // We'll use EnhancedSun instead of basic sun implementation
  return (
    <EnhancedSun 
      radius={0.4} 
      position={[0, 0, 0]} 
      intensity={3}
    />
  );
}

export function SolarSystemControls({
  animationSpeed = ANIMATION_SPEED,
  setAnimationSpeed,
  showLabels = true,
  setShowLabels,
}: {
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      padding: '10px',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: '5px',
      color: 'white',
      zIndex: 1000
    }}>
      <div>
        <label>
          Speed: 
          <input 
            type="range" 
            min="0.1" 
            max="2" 
            step="0.1" 
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))} 
            style={{marginLeft: '10px'}}
          />
        </label>
      </div>
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={showLabels} 
            onChange={(e) => setShowLabels(e.target.checked)} 
          />
          Show Labels
        </label>
      </div>
    </div>
  );
}

interface SolarSystemProps {
  animationSpeed?: number;
  showLabels?: boolean;
  asteroids?: AsteroidData[];
  asteroidPositions?: [number, number, number][];
  selectedAsteroidId?: string;
  onAsteroidClick?: (asteroid: AsteroidData) => void;
}

export default function SolarSystem({
  animationSpeed = ANIMATION_SPEED,
  showLabels = true,
  asteroids = [],
  asteroidPositions = [],
  selectedAsteroidId = "",
  onAsteroidClick = () => {}
}: SolarSystemProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<[number, number, number]>([0, 0, 0]);

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

  return (
    <>
      {/* Background stars - reduced count for less visual clutter */}
      <Stars count={800} radius={100} starSize={0.12} />
      
      {/* The Sun */}
      <Sun />
      
      {/* Inner Planets */}
      {innerPlanets.map((planet) => (
        <Planet 
          key={planet.name} 
          planet={planet} 
          animationSpeed={animationSpeed}
          showLabel={showLabels}
        />
      ))}
      
      {/* Asteroids */}
      {asteroids.map((asteroid, index) => (
        <Asteroid
          key={asteroid.id}
          asteroid={asteroid}
          position={asteroidPositions[index] || [0, 0, 0]}
          selected={asteroid.id === selectedAsteroidId}
          onClick={() => onAsteroidClick(asteroid)}
        />
      ))}
      
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
      {/* @ts-expect-error r3f intrinsic */}
      <mesh 
        position={[0, 0, 0]} 
        scale={100} 
        visible={false} 
        onDoubleClick={triggerRandomExplosion}
      >
        {/* @ts-expect-error r3f intrinsic */}
        <sphereGeometry args={[1, 8, 8]} />
        {/* @ts-expect-error r3f intrinsic */}
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}