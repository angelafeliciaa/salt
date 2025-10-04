"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarsProps {
  count?: number;
  radius?: number;
  starSize?: number;
  starColor?: string;
  rotationSpeed?: number;
}

export function Stars({
  count = 3000,
  radius = 100,
  starSize = 0.5,
  starColor = "#ffffff",
  rotationSpeed = 0.0001
}: StarsProps) {
  const starsRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate random positions for stars in a sphere
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    const positions = [];
    
    for (let i = 0; i < count; i++) {
      // Randomize position in a sphere
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const distance = radius * Math.cbrt(Math.random()); // cbrt gives more stars toward center
      
      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);
      
      positions.push(x, y, z);
    }
    
    return positions;
  }, [count, radius]);
  
  // Set initial positions
  useEffect(() => {
    if (!starsRef.current) return;
    
    for (let i = 0; i < count; i++) {
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      
      // Randomize size slightly
      const scale = starSize * (0.8 + Math.random() * 0.4);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      
      starsRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    starsRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, starSize, dummy]);
  
  // Slow rotation animation
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += rotationSpeed;
    }
  });
  
  return (
    // @ts-expect-error r3f intrinsic
    <instancedMesh ref={starsRef} args={[null, null, count]} frustumCulled={false}>
      {/* @ts-expect-error r3f intrinsic */}
      <dodecahedronGeometry args={[1, 0]} />
      {/* @ts-expect-error r3f intrinsic */}
      <meshBasicMaterial color={starColor} />
    </instancedMesh>
  );
}

export default Stars;