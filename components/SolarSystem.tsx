"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

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
  // Create refs for the planet and its orbit
  const planetRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Planetary spin and orbit animation
  useFrame(({ clock }) => {
    if (planetRef.current) {
      // Calculate orbital position
      const time = clock.getElapsedTime() * animationSpeed;
      const orbitalSpeed = (2 * Math.PI) / planet.orbitalPeriod;
      const angle = time * orbitalSpeed * 10; // Scale time for visual effect
      
      // Update position in orbit
      const distance = planet.distance * EARTH_DISTANCE;
      planetRef.current.position.x = Math.cos(angle) * distance;
      planetRef.current.position.z = Math.sin(angle) * distance;
      
      // Planet rotation around its axis
      const rotationSpeed = (2 * Math.PI) / planet.rotationPeriod;
      planetRef.current.rotation.y += rotationSpeed * 0.01;
    }
  });
  
  // Calculate planet size relative to Earth
  const size = planet.size * EARTH_SIZE;
  
  // Calculate orbit radius
  const orbitRadius = planet.distance * EARTH_DISTANCE;

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
      
      {/* Planet sphere */}
      {/* @ts-expect-error r3f intrinsic */}
      <group 
        ref={planetRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <Sphere args={[size, 32, 16]}>
          {/* @ts-expect-error r3f intrinsic */}
          <meshStandardMaterial
            color={planet.color}
            roughness={0.7}
            metalness={0.1}
            emissive={hovered ? planet.color : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </Sphere>
        
        {/* Planet label */}
        {(showLabel || hovered) && (
          <Billboard position={[0, size + 0.1, 0]}>
            <Text
              fontSize={0.12}
              color="#ffffff"
              anchorX="center"
              anchorY="bottom"
            >
              {planet.name}
            </Text>
          </Billboard>
        )}
      {/* @ts-expect-error r3f intrinsic */}
      </group>
    </>
  );
}

export function Sun() {
  const [hovered, setHovered] = useState(false);
  
  return (
    /* @ts-expect-error r3f intrinsic */
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* The Sun - brighter, larger, and emissive */}
      <Sphere 
        args={[0.4, 32, 32]} 
        position={[0, 0, 0]}
      >
        {/* @ts-expect-error r3f intrinsic */}
        <meshStandardMaterial
          color="#fde68a"
          emissive="#fcd34d"
          emissiveIntensity={hovered ? 4 : 2}
          toneMapped={false}
        />
      </Sphere>
      
      {/* Sun label */}
      {hovered && (
        <Billboard position={[0, 0.6, 0]}>
          <Text
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
          >
            Sun
          </Text>
        </Billboard>
      )}
      
      {/* Subtle glow effect */}
      {/* @ts-expect-error r3f intrinsic */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#fffbeb" />
    {/* @ts-expect-error r3f intrinsic */}
    </group>
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

export default function SolarSystem({
  animationSpeed = ANIMATION_SPEED,
  showLabels = true
}: {
  animationSpeed?: number;
  showLabels?: boolean;
}) {
  return (
    <>
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
    </>
  );
}