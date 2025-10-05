"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// Type for asteroid data from our API
export interface AsteroidData {
  id: string;
  name: string;
  diameter: {
    min: number;
    max: number;
    avg: number;
  };
  isPotentiallyHazardous: boolean;
  closeApproachData: {
    date: string;
    velocity: {
      kmPerSecond: string;
      kmPerHour: string;
    };
    missDistance: {
      astronomical: string;
      kilometers: string;
    };
    orbitingBody: string;
  }[];
  orbitData: {
    orbitId: string;
    orbitDeterminationDate: string;
    firstObservation: string;
    lastObservation: string;
    dataArcInDays: number;
    orbitClass: string;
  };
}

interface AsteroidProps {
  asteroid: AsteroidData;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}

export function Asteroid({ 
  asteroid, 
  position, 
  selected,
  onClick 
}: AsteroidProps) {
  const asteroidRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate size based on asteroid diameter, but keep it visible
  const size = Math.max(0.1, asteroid.diameter.avg * 0.1);
  
  // All asteroids are hazardous now, use a more threatening color
  const color = "#ff2200"; // Bright red for hazardous asteroids
  
  // Simple rotation animation for the asteroid, no position changes on hover
  useFrame(() => {
    if (asteroidRef.current) {
      // Rotate the asteroid
      asteroidRef.current.rotation.y += 0.005;
      asteroidRef.current.rotation.x += 0.002;
      
      // No position change on hover or selection - commented out deliberately
      // to prevent unwanted movement when hovering
    }
  });

  // Use ref for glow animation
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Animate the glow
  useFrame(({ clock }) => {
    if (glowRef.current) {
      // Pulsating glow effect
      const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.2 + 0.8;
      glowRef.current.scale.set(pulse, pulse, pulse);
      
      // Safely set opacity on the material
      if (glowRef.current.material instanceof THREE.Material) {
        (glowRef.current.material as THREE.Material & { opacity: number }).opacity = pulse * 0.3;
      }
    }
  });

  return (
    <group 
      ref={asteroidRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Hazardous glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial 
          color="#ff3300"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </mesh>
    
      {/* Asteroid body with irregular shape */}
      <mesh>
        {/* Use dodecahedron for irregular asteroid-like shape */}
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.7}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={selected ? 0.6 : hovered ? 0.4 : 0.2}
        />
      </mesh>

      {/* Selection indicator */}
      {selected && (
        <mesh>
          <ringGeometry args={[size * 1.8, size * 1.9, 32]} />
          <meshBasicMaterial 
            color="#ff5500"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Label that shows up when hovered or selected */}
      {(hovered || selected) && (
        <Billboard position={[0, size * 2, 0]}>
          <Text
            fontSize={0.1}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
          >
            {asteroid.name.replace("(", "").replace(")", "")}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

export default Asteroid;