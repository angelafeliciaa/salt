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
  
  // Different colors based on hazard status and selection status
  const color = asteroid.isPotentiallyHazardous 
    ? "#ff4500" 
    : "#9b7653"; // Orange-red if hazardous, brown if not
  
  // Small wobbling animation for the asteroid
  useFrame(({ clock }) => {
    if (asteroidRef.current) {
      // Rotate the asteroid
      asteroidRef.current.rotation.y += 0.005;
      asteroidRef.current.rotation.x += 0.002;
      
      // Add a little wobble if it's selected or hovered
      if (selected || hovered) {
        const wobble = Math.sin(clock.getElapsedTime() * 2) * 0.05;
        asteroidRef.current.position.y = wobble;
      }
    }
  });

  return (
    // @ts-expect-error r3f intrinsic
    <group 
      ref={asteroidRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Asteroid body with irregular shape */}
      {/* @ts-expect-error r3f intrinsic */}
      <mesh>
        {/* Use dodecahedron for irregular asteroid-like shape */}
        {/* @ts-expect-error r3f intrinsic */}
        <dodecahedronGeometry args={[size, 0]} />
        {/* @ts-expect-error r3f intrinsic */}
        <meshStandardMaterial 
          color={color}
          roughness={0.9}
          metalness={0.1}
          emissive={selected || hovered ? color : "#000"}
          emissiveIntensity={selected ? 0.5 : hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Selection indicator */}
      {selected && (
        // @ts-expect-error r3f intrinsic
        <mesh>
          {/* @ts-expect-error r3f intrinsic */}
          <ringGeometry args={[size * 1.5, size * 1.6, 16]} />
          {/* @ts-expect-error r3f intrinsic */}
          <meshBasicMaterial 
            color="#ffffff"
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
            backgroundColor={asteroid.isPotentiallyHazardous ? "#ff450088" : "#00000088"}
            padding={0.05}
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