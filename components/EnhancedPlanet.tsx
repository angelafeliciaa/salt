"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import type { StaticImageData } from "next/image";

const PlanetAtmosphere = ({ radius, color = "#4299e199" }: { radius: number; color?: string }) => {
  return (
    <Sphere args={[radius * 1.05, 32, 16]} position={[0, 0, 0]}>
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
  textureUrl?: string | StaticImageData;
  bumpTextureUrl?: string | StaticImageData;
  bumpScale?: number;
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
  bumpTextureUrl,
  bumpScale = 0.03,
  showLabel = true,
  onPointerOver,
  onPointerOut
}: EnhancedPlanetProps) {
  const planetRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);
  
  // Create texture if provided
  const texture = useMemo(() => {
    if (!textureUrl) return null;

    const src = typeof textureUrl === "string" ? textureUrl : textureUrl.src;
    const loader = new THREE.TextureLoader();
    const loaded = loader.load(
      src,
      () => {
        // eslint-disable-next-line no-console
        console.debug(`[EnhancedPlanet] Loaded texture for ${name}:`, src);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error(`[EnhancedPlanet] Failed to load texture for ${name}:`, src, err);
      }
    );
    // Ensure correct color space for albedo/diffuse textures
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = 8;
    return loaded;
  }, [textureUrl, name]);

  const bumpTexture = useMemo(() => {
    if (!bumpTextureUrl) return null;
    const src = typeof bumpTextureUrl === "string" ? bumpTextureUrl : bumpTextureUrl.src;
    const loader = new THREE.TextureLoader();
    const loaded = loader.load(
      src,
      () => {
        // eslint-disable-next-line no-console
        console.debug(`[EnhancedPlanet] Loaded bump map for ${name}:`, src);
      },
      undefined,
      (err) => {
        // eslint-disable-next-line no-console
        console.error(`[EnhancedPlanet] Failed to load bump map for ${name}:`, src, err);
      }
    );
    loaded.colorSpace = THREE.NoColorSpace; // height data, not color
    loaded.anisotropy = 8;
    return loaded;
  }, [bumpTextureUrl, name]);
  
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
          <meshStandardMaterial 
            map={texture} 
            bumpMap={bumpTexture ?? undefined}
            bumpScale={bumpTexture ? bumpScale : 0}
            metalness={0.1} 
            roughness={0.8}
            emissive={hovered ? color : "#000000"}
            emissiveIntensity={hovered ? 0.4 : 0}
          />
        ) : (
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
    </group>
  );
}

export default EnhancedPlanet;