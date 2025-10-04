"use client";

import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";
import Sun from "./Sun";
import EnhancedPlanet from "./EnhancedPlanet";
import Stars from "./Stars";
import Explosion from "./Explosion";
import Asteroid, { AsteroidData } from "./Asteroid";
import CameraController from "./CameraController";

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
    size: 5.745, // ~38% of Earth's size
    distance: 38.7, // 0.387 AU from Sun
    orbitalPeriod: 88, // 88 Earth days
    rotationPeriod: 1408, // ~59 Earth days
    axialTilt: 0.03,
  },
  {
    name: "Venus",
    color: "#fbbf24", // Dark yellow
    size: 14.25, // 95% of Earth's size
    distance: 72.3, // 0.723 AU from Sun
    orbitalPeriod: 225, // 225 Earth days
    rotationPeriod: -5832, // Retrograde rotation (~243 Earth days)
    axialTilt: 177.4, // Nearly upside down
  },
  {
    name: "Earth",
    color: "#60a5fa", // Blue
    size: 15, // Reference size
    distance: 100, // Reference distance (1 AU)
    orbitalPeriod: 365.25, // Earth days
    rotationPeriod: 24, // Hours
    axialTilt: 23.5,
  },
  {
    name: "Mars",
    color: "#dc2626", // Red
    size: 7.98, // ~53% of Earth's size
    distance: 152.4, // 1.524 AU from Sun
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

export const Planet = React.forwardRef(({
  planet,
  animationSpeed = ANIMATION_SPEED,
  showLabel = true,
}: {
  planet: PlanetData;
  animationSpeed?: number;
  showLabel?: boolean;
}, ref: React.ForwardedRef<THREE.Group>) => {
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
      {(() => {
        const thickness = orbitRadius * 0.005;
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
      
      {/* Planet with enhanced visuals */}
      <group ref={ref}>
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
      </group>
    </>
  );
});

Planet.displayName = 'Planet';

// Basic Sun component wrapper
export function SunNode() {
  return <Sun />;
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
  navigationTarget?: "none" | "earth" | "asteroid";
  onNavigationComplete?: () => void;
}

export default function SolarSystem({
  animationSpeed = ANIMATION_SPEED,
  showLabels = true,
  asteroids = [],
  asteroidPositions = [],
  selectedAsteroidId = "",
  onAsteroidClick = () => {},
  navigationTarget = "none",
  onNavigationComplete = () => {}
}: SolarSystemProps) {
  const [showExplosion, setShowExplosion] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState<[number, number, number]>([0, 0, 0]);
  
  // References for camera navigation
  const earthRef = useRef<THREE.Group>(null);
  const asteroidRef = useRef<THREE.Group>(null);

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
      {/* Background stars - scaled far away from the solar system */}
      <Stars count={2500} radius={1000} starSize={1.5} />
      
      {/* The Sun */}
      <SunNode />
      
      {/* Inner Planets */}
      {innerPlanets.map((planet) => {
        // Earth gets a special ref for camera navigation
        if (planet.name === "Earth") {
          return (
            <Planet 
              key={planet.name}
              planet={planet} 
              animationSpeed={animationSpeed}
              showLabel={showLabels}
              ref={earthRef}
            />
          );
        }
        
        // Other planets
        return (
          <Planet 
            key={planet.name} 
            planet={planet} 
            animationSpeed={animationSpeed}
            showLabel={showLabels}
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
              ref={asteroidRef}
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
      {/* @ts-ignore - r3f types */}
      </mesh>
      
      {/* Camera controller for Earth and Asteroid navigation */}
      <CameraController 
        earthRef={earthRef}
        asteroidRef={asteroidRef}
        navigationTarget={navigationTarget}
        onNavigationComplete={onNavigationComplete}
      />
    </>
  );
}