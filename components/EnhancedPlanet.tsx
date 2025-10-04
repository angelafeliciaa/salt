"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Billboard, Text } from "@react-three/drei";
import * as THREE from "three";

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

type TextureInput = string | { src?: string } | null | undefined;

interface EnhancedPlanetProps {
  name: string;
  position: [number, number, number];
  size: number;
  color: string;
  rotationSpeed?: number;
  textureRotationSpeed?: number; // radians per second for map rotation
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  textureUrl?: TextureInput;
  normalMapUrl?: TextureInput;
  bumpMapUrl?: TextureInput;
  specularMapUrl?: TextureInput; // if provided, we will prefer Phong material
  emissiveMapUrl?: TextureInput; // e.g., Earth's night lights
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
  textureRotationSpeed = 0.0,
  hasAtmosphere = false,
  atmosphereColor,
  textureUrl,
  normalMapUrl,
  bumpMapUrl,
  specularMapUrl,
  emissiveMapUrl,
  showLabel = true,
  onPointerOver,
  onPointerOut
}: EnhancedPlanetProps) {
  const planetRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);
  
  // Load textures as needed
  const getUrl = (input?: TextureInput) => {
    if (!input) return undefined;
    if (typeof input === "string") return input;
    if (typeof input === "object" && input.src) return input.src;
    return undefined;
  };

  const colorMap = useMemo(() => {
    const url = getUrl(textureUrl);
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    // Ensure correct color space for albedo maps on modern three
    // @ts-ignore three versions may vary
    tex.colorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;
    tex.center.set(0.5, 0.5);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [textureUrl]);

  const normalMap = useMemo(() => {
    const url = getUrl(normalMapUrl);
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.center.set(0.5, 0.5);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [normalMapUrl]);

  const bumpMap = useMemo(() => {
    const url = getUrl(bumpMapUrl);
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.center.set(0.5, 0.5);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [bumpMapUrl]);

  const specularMap = useMemo(() => {
    const url = getUrl(specularMapUrl);
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.center.set(0.5, 0.5);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [specularMapUrl]);

  const emissiveMap = useMemo(() => {
    const url = getUrl(emissiveMapUrl);
    if (!url) return null;
    const tex = new THREE.TextureLoader().load(url);
    tex.center.set(0.5, 0.5);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, [emissiveMapUrl]);
  
  // Planet rotation animation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed;
    }
    if (textureRotationSpeed !== 0) {
      const scrollMap = (tex: THREE.Texture | null) => {
        if (!tex) return;
        // Longitude spin: move U coordinate
        tex.wrapS = THREE.RepeatWrapping;
        tex.offset.x = (tex.offset.x + textureRotationSpeed * delta) % 1;
        tex.needsUpdate = true;
      };
      scrollMap(colorMap);
      scrollMap(normalMap);
      scrollMap(bumpMap);
      scrollMap(specularMap);
      scrollMap(emissiveMap);
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
        {specularMap ? (
          // Use Phong material when a specular map is provided
          <meshPhongMaterial
            map={colorMap ?? undefined}
            color={colorMap ? undefined : (color as any)}
            specularMap={specularMap}
            specular={new THREE.Color('#222222') as any}
            shininess={12}
            normalMap={normalMap ?? undefined}
            bumpMap={bumpMap ?? undefined}
            emissiveMap={emissiveMap ?? undefined}
            emissive={hovered ? (new THREE.Color(color) as any) : (new THREE.Color('#000000') as any)}
            emissiveIntensity={hovered ? 0.35 : 0}
          />
        ) : (
          <meshStandardMaterial 
            map={colorMap ?? undefined}
            color={colorMap ? undefined : (color as any)}
            normalMap={normalMap ?? undefined}
            bumpMap={bumpMap ?? undefined}
            emissiveMap={emissiveMap ?? undefined}
            metalness={0.1}
            roughness={0.8}
            emissive={hovered ? (new THREE.Color(color) as any) : (new THREE.Color('#000000') as any)}
            emissiveIntensity={hovered ? 0.35 : 0}
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