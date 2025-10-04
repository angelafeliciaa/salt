"use client";

import { useThree } from "@react-three/fiber";
import { useRef, useCallback } from "react";
import * as THREE from "three";
import { AsteroidData } from "./Asteroid";

export function useCameraController() {
  const { camera, controls } = useThree();
  const controlsRef = useRef(controls);

  // Store the latest controls in a ref
  if (controls && controls !== controlsRef.current) {
    controlsRef.current = controls;
  }

  // Function to navigate camera to Earth
  const navigateToEarth = useCallback(() => {
    if (!controlsRef.current) return;

    // Earth is at distance 100 from origin
    const earthPosition = new THREE.Vector3(100, 0, 0);
    
    // Set camera position near Earth
    const cameraPosition = new THREE.Vector3(105, 15, 15);
    
    // Animate camera movement
    animateCamera(cameraPosition, earthPosition);
  }, []);

  // Function to navigate camera to selected asteroid
  const navigateToAsteroid = useCallback((asteroidPosition: [number, number, number]) => {
    if (!controlsRef.current) return;
    
    const targetPosition = new THREE.Vector3(...asteroidPosition);
    
    // Calculate camera position - slightly offset from the asteroid
    const offset = new THREE.Vector3(10, 5, 10);
    const cameraPosition = new THREE.Vector3().addVectors(targetPosition, offset);
    
    // Animate camera movement
    animateCamera(cameraPosition, targetPosition);
  }, []);

  // Helper function to animate the camera movement
  const animateCamera = useCallback((cameraPosition: THREE.Vector3, targetPosition: THREE.Vector3) => {
    if (!controlsRef.current) return;
    
    const controls = controlsRef.current as any;
    
    // If OrbitControls has moveTo and setTarget methods (from camera-controls)
    if (controls.moveTo && controls.setTarget) {
      controls.moveTo(
        cameraPosition.x, 
        cameraPosition.y, 
        cameraPosition.z, 
        true
      );
      controls.setTarget(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
        true
      );
    } 
    // Standard OrbitControls fallback
    else {
      // For standard OrbitControls, we need to animate manually
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      controls.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
      controls.update();
    }
  }, [camera]);

  return { navigateToEarth, navigateToAsteroid };
}

export default useCameraController;