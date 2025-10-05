"use client";

import React, { useRef, useState, forwardRef, ForwardedRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Reuse the AsteroidData interface from the original component
import { AsteroidData } from "./Asteroid";

interface AsteroidModelProps {
  asteroid: AsteroidData;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
  modelPath?: string; // Path to the GLB model
}

// Use forwardRef to properly handle ref passing
export const AsteroidModel = forwardRef(({ 
  asteroid, 
  position, 
  selected,
  onClick,
  modelPath = "/shaders/asteroidPack.glb" // Path to the model you've provided
}: AsteroidModelProps, ref: ForwardedRef<THREE.Group>) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [modelStats, setModelStats] = useState<{total: number, selected: number}>({ total: 0, selected: 0 });
  
  // Load the GLTF model
  const { scene } = useGLTF(modelPath);
  
  // Create a reference for the model instance
  const modelRef = useRef<THREE.Group | null>(null);
  
  // Calculate size based on asteroid diameter, but keep it visible
  const size = Math.max(0.1, asteroid.diameter.avg * 0.1);
  
  // Handle model setup after loading
  useEffect(() => {
    if (scene && groupRef.current) {
      // Clean up any previous model
      if (modelRef.current) {
        groupRef.current.remove(modelRef.current);
      }

      // Clone the model to use multiple instances
      const model = scene.clone();
      
      // Function to generate a deterministic random number from a string seed
      const seededRandom = (seed: string) => {
        // Simple hash function for the seed string
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
          hash = ((hash << 5) - hash) + seed.charCodeAt(i);
          hash = hash & hash; // Convert to 32bit integer
        }
        
        // Use the hash as a seed for a basic LCG random number generator
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        let rand = hash;
        
        // Get next random value
        rand = (a * rand + c) % m;
        
        // Return normalized value between 0 and 1
        return Math.abs(rand / m);
      };
      
      // Find all asteroid meshes/objects in the model
      const asteroidMeshes: THREE.Object3D[] = [];
      model.traverse((child: THREE.Object3D) => {
        // Check if this is one of the asteroid models (usually they are meshes or groups directly under the scene)
        if (child.parent === model && child.type !== "Scene") {
          asteroidMeshes.push(child);
        }
      });
      
      // If we found multiple asteroid models, choose one randomly and hide others
      if (asteroidMeshes.length > 0) {
        // Use asteroid ID as seed for consistent selection
        const randomValue = seededRandom(asteroid.id);
        
        // Select an asteroid model based on the seeded random value
        const index = Math.floor(randomValue * asteroidMeshes.length);
        
        // Hide all asteroid models except the selected one
        let selectedMesh: THREE.Object3D | null = null;
        asteroidMeshes.forEach((mesh, i) => {
          if (i === index) {
            mesh.visible = true;
            selectedMesh = mesh;
          } else {
            mesh.visible = false;
          }
        });
        
        // Center the selected asteroid model properly
        if (selectedMesh) {
          // Calculate the bounding box of the selected model
          const box = new THREE.Box3().setFromObject(selectedMesh);
          const center = new THREE.Vector3();
          box.getCenter(center);
          
          // Move the model so its center is at origin
          if ('position' in selectedMesh) {
            (selectedMesh as THREE.Object3D & { position: THREE.Vector3 }).position.sub(center);
          }
          
          // Store model dimensions for indicator positioning
          const dimensions = new THREE.Vector3();
          box.getSize(dimensions);
          
          // Store the model's height for positioning indicators
          (model as any).asteroidHeight = dimensions.y;
          console.log(`Asteroid ${asteroid.name} - Model height: ${dimensions.y}, Center: ${center.x}, ${center.y}, ${center.z}`);
        }
        
        // Update stats for debugging
        setModelStats({ 
          total: asteroidMeshes.length, 
          selected: index 
        });
      }
      
      // Scale the model based on the asteroid size
      model.scale.set(size, size, size);
      
      // Apply a fixed rotation based on asteroid ID for consistent orientation
      // Using the seeded random to get a consistent orientation for each asteroid
      const randVal = seededRandom(asteroid.id + "-rotation");
      model.rotation.y = randVal * Math.PI * 2; // Consistent rotation around y-axis only
      
      // For potentially hazardous asteroids, we could add a reddish tint to the materials
      if (asteroid.isPotentiallyHazardous) {
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Create a clone of the material to avoid affecting other instances
            child.material = child.material.clone();
            
            // Add reddish emission for hazardous asteroids
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive = new THREE.Color("#ff2200");
              child.material.emissiveIntensity = 0.2;
            }
          }
        });
      }
      
      // Store the model reference and add it to the group
      modelRef.current = model;
      groupRef.current.add(model);
    }
    
    // Cleanup function
    return () => {
      if (groupRef.current && modelRef.current) {
        groupRef.current.remove(modelRef.current);
      }
    };
  }, [scene, asteroid.isPotentiallyHazardous, asteroid.id, size]);

  // No rotation animation - asteroid stays still
  // Comment out rotation animation to keep asteroid orientation fixed

  // Simple ref for hazard indicator without animation
  const glowRef = useRef<THREE.Group>(null);

  return (
    <group 
      ref={(node: THREE.Group | null) => {
        // Handle both refs - our internal ref and the forwarded ref
        groupRef.current = node;
        
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
    >
      {/* Hazardous indicator - using a subtle marker instead of a full sphere */}
      {asteroid.isPotentiallyHazardous && (
        <group ref={glowRef}>
          <mesh position={[0, size * 0.6, 0]} rotation={[Math.PI/2, 0, 0]}>
            <ringGeometry args={[size * 0.3, size * 0.4, 32]} />
            <meshBasicMaterial 
              color="#ff3300"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    
      {/* The model will be added to the group via useEffect */}
      
      {/* Selection indicator - now an arrow above the asteroid */}
      {selected && (
        <group position={[0, size * 0.8, 0]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[size * 0.3, size * 0.6, 8]} />
            <meshBasicMaterial 
              color="#ff5500"
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
      
      {/* Label that shows up when hovered or selected */}
      {(hovered || selected) && (
        <Billboard position={[0, size * 1.2, 0]}>
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
      
      {/* Debug info - display which model was selected */}
      {hovered && modelStats.total > 0 && (
        <Billboard position={[0, size * 1.4, 0]}>
          <Text
            fontSize={0.05}
            color="#cccccc"
            anchorX="center"
            anchorY="bottom"
          >
            {`Model ${modelStats.selected + 1}/${modelStats.total}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
});

// Add display name for better debugging
AsteroidModel.displayName = 'AsteroidModel';

// Pre-load the asteroid model
useGLTF.preload('/shaders/asteroidPack.glb');

export default AsteroidModel;