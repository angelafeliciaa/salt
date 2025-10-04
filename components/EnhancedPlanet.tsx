"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

// Create a simple atmosphere effect for Earth
const PlanetAtmosphere = ({ radius, color = "#4299e199" }: { radius: number; color?: string }) => {
  return (
    <Sphere args={[radius * 1.05, 32, 16]} position={[0, 0, 0]}>
      {/* @ts-expect-error r3f intrinsic */}
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={0.2} 
        side={THREE.BackSide} 
      />
    </Sphere>
  );
};

interface EnhancedPlanetProps {
  name: string;
  position: [number, number, number];
  size: number;
  color: string;
  rotationSpeed?: number;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  textureUrl?: string;
  showLabel?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

export function EnhancedPlanet({
  name,
  position,
  size,
  color,
  rotationSpeed = 0.005,
  hasAtmosphere = false,
  atmosphereColor,
  textureUrl,
  showLabel = true,
  onPointerOver,
  onPointerOut
}: EnhancedPlanetProps) {
  const planetRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);
  
  // Create texture if provided
  const texture = useMemo(() => {
    if (textureUrl) {
      return new THREE.TextureLoader().load(textureUrl);
    }
    return null;
  }, [textureUrl]);
  
  // Planet rotation animation
  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
  });
  
  const handlePointerOver = () => {
    setHovered(true);
    if (onPointerOver) onPointerOver();
  };
  
  const handlePointerOut = () => {
    setHovered(false);
    if (onPointerOut) onPointerOut();
  };

  return (
    // @ts-expect-error r3f intrinsic
    <group 
      position={position}
      ref={planetRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <Sphere 
        args={[size, 32, 24]} 
        castShadow 
        receiveShadow
      >
        {texture ? (
          // @ts-expect-error r3f intrinsic
          <meshStandardMaterial 
            map={texture} 
            metalness={0.1} 
            roughness={0.8}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        ) : (
          // @ts-expect-error r3f intrinsic
          <meshStandardMaterial 
            color={color} 
            metalness={0.1} 
            roughness={0.8}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        )}
      </Sphere>
      
      {/* Atmosphere (only for planets that have one) */}
      {hasAtmosphere && <PlanetAtmosphere radius={size} color={atmosphereColor || color} />}
      
      {/* Planet label */}
      {(showLabel || hovered) && (
        <Billboard position={[0, size * 1.3, 0]}>
          <Text
            fontSize={size * 0.8}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={size * 0.05}
            outlineColor="#00000077"
          >
            {name}
          </Text>
        </Billboard>
      )}
      {/* @ts-expect-error r3f intrinsic */}
    </group>
  );
}

export default EnhancedPlanet;