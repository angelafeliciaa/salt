"use client";

import React, { useRef, useState, forwardRef, ForwardedRef } from "react";
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
    orbitalPeriod?: {
      days: string;
      years: string;
    };
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

// Use forwardRef to properly handle ref passing
export const Asteroid = forwardRef(({ 
  asteroid, 
  position, 
  selected,
  onClick 
}: AsteroidProps, ref: ForwardedRef<THREE.Group>) => {
  const asteroidRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate size based on asteroid diameter, but keep it visible
  // Increased scaling factor from 0.1 to 0.25 to make asteroids larger
  const size = Math.max(0.15, asteroid.diameter.avg * 0.25);
  
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
  const tempVec = useRef(new THREE.Vector3());
  
  // Animate the glow
  useFrame((state) => {
    if (!glowRef.current || !asteroidRef.current) return;

    // Compute camera distance to asteroid (world space)
    const worldPos = tempVec.current;
    asteroidRef.current.getWorldPosition(worldPos);
    const cameraPos = state.camera.position;
    const distance = worldPos.distanceTo(cameraPos);

    // Desired on-screen size as a fraction of viewport height
    // Larger when selected to make it easier to spot
    const fractionOfView = selected ? 0.065 : 0.045;

    // Convert desired screen fraction to world-space diameter at this distance
    const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 50;
    const worldHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov * 0.5));
    const desiredWorldDiameter = worldHeight * fractionOfView;

    // Our glow sphere base radius
    const baseRadius = size * 1.5;

    // Target uniform scale so that diameter ~= desiredWorldDiameter
    const targetScale = desiredWorldDiameter / (2 * baseRadius);

    // Gentle pulse
    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 2) * 0.12 + 0.88; // 0.76..1.0

    // Clamp to avoid extreme sizes
    const clamped = THREE.MathUtils.clamp(targetScale, 0.6, 120);
    const finalScale = clamped * pulse;
    glowRef.current.scale.set(finalScale, finalScale, finalScale);

    // Opacity scales slightly with zoom-out, but remains subtle
    const mat = glowRef.current.material as THREE.Material & { opacity?: number };
    if ('opacity' in mat) {
      const baseOpacity = selected ? 0.35 : 0.25;
      const zoomBoost = THREE.MathUtils.clamp(targetScale * 0.015, 0, 0.25);
      mat.opacity = THREE.MathUtils.clamp(baseOpacity + zoomBoost, 0.15, 0.5);
      (mat as any).transparent = true;
      (mat as any).depthWrite = false;
    }
  });

  return (
    <group 
      ref={(node: THREE.Group | null) => {
        // Handle both refs - our internal ref and the forwarded ref
        asteroidRef.current = node;
        
        // Handle the forwarded ref properly
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
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
});

// Add display name for better debugging
Asteroid.displayName = 'Asteroid';

export default Asteroid;