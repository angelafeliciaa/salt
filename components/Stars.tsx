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
  radius = 1000, // Increased radius to be much farther away from the solar system
  starSize = 1.2, // Balanced star size for visibility while remaining realistic
  starColor = "#ffffff",
  rotationSpeed = 0.00005 // Reduced rotation speed for stars at greater distance
}: StarsProps) {
  const starsRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate random positions for stars in a sphere
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const positions = useMemo(() => {
    const positions = [];
    
    // Minimum distance for stars (to keep them away from the solar system)
    const minDistance = radius * 0.6; 
    
    for (let i = 0; i < count; i++) {
      // Randomize position on a sphere surface (not throughout the volume)
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Use a distance distribution that favors distant stars but keeps a minimum distance
      // This ensures stars are appropriately far from the solar system
      const distanceRandom = Math.random(); 
      const distanceCurved = Math.pow(distanceRandom, 0.3); // Power less than 1 pushes distribution outward
      const distance = minDistance + (radius - minDistance) * distanceCurved;
      
      // Convert spherical to cartesian coordinates
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
      // Set position from our precomputed array
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      
      // Calculate distance from center
      const distance = Math.sqrt(
        Math.pow(positions[i * 3], 2) + 
        Math.pow(positions[i * 3 + 1], 2) + 
        Math.pow(positions[i * 3 + 2], 2)
      );
      
      // Calculate star size based on distance and random variation
      // Closer stars should appear larger (inverse relationship with distance)
      // Also apply a random distribution to simulate different star sizes
      
      // Generate a random brightness factor (some stars are brighter than others)
      // Using exponential distribution to create a few very bright stars
      // With a balanced brightness range to ensure visibility
      const brightnessFactor = Math.pow(Math.random(), 2.5) * 1.5 + 0.5;
      
      // Base scale inversely proportional to distance
      // Adjust the impact of distance on size
      const distanceFactor = 1 - (distance / radius) * 0.2;
      
      // Calculate final scale
      const scale = starSize * brightnessFactor * distanceFactor;
      
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      
      starsRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    starsRef.current.instanceMatrix.needsUpdate = true;
  }, [count, positions, starSize, dummy, radius]);
  
  // Slow rotation animation
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += rotationSpeed;
    }
  });
  
  return (
    <instancedMesh ref={starsRef} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[0.5, 6, 6]} /> {/* Base geometry with better visibility */}
      <meshBasicMaterial 
        color={starColor}
        transparent={true}
        opacity={1.0}
        toneMapped={false} // Prevent tone mapping to keep stars bright
      />
    </instancedMesh>
  );
}

export default Stars;