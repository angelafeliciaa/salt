"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CameraControllerProps {
  earthRef: React.MutableRefObject<THREE.Object3D | null>;
  asteroidRef: React.MutableRefObject<THREE.Object3D | null>;
  navigationTarget: "none" | "earth" | "asteroid";
  onNavigationComplete: () => void;
}

export function CameraController({ 
  earthRef, 
  asteroidRef, 
  navigationTarget, 
  onNavigationComplete 
}: CameraControllerProps) {
  const { camera, controls } = useThree();
  const isAnimatingRef = useRef(false);

  // Handle navigation requests
  useEffect(() => {
    if (navigationTarget === "none" || isAnimatingRef.current) return;
    
    let targetPosition: THREE.Vector3 | null = null;
    let cameraPosition: THREE.Vector3 | null = null;
    
    // Calculate target positions based on navigationTarget
    if (navigationTarget === "earth" && earthRef.current) {
      // Get actual Earth world position
      const earthPosition = new THREE.Vector3();
      earthRef.current.getWorldPosition(earthPosition);
      
      // Debug position
      console.log("Earth position:", earthPosition);
      
      // Set target to actual Earth position
      targetPosition = earthPosition.clone();
      
      // For Earth, find a good viewing position based on scale
      const viewDistance = 0.5; // Distance from Earth
      
      // Get Earth's local position to determine its orbit position
      const orbitX = earthPosition.x;
      const orbitZ = earthPosition.z;
      
      // Calculate angle of Earth's current position relative to center
      const earthAngle = Math.atan2(orbitZ, orbitX);
      
      // Calculate an offset that's relative to Earth's orbital position
      // This ensures we always view from slightly outside the orbital path
      const offsetX = Math.cos(earthAngle + Math.PI/6) * viewDistance;
      const offsetZ = Math.sin(earthAngle + Math.PI/6) * viewDistance;
      
      // Position camera at this intelligent offset
      cameraPosition = new THREE.Vector3(
        earthPosition.x + offsetX,
        earthPosition.y + viewDistance * 0.3, // Slight elevation
        earthPosition.z + offsetZ
      );
    } 
    else if (navigationTarget === "asteroid" && asteroidRef.current) {
      // Get actual Asteroid world position
      const asteroidPosition = new THREE.Vector3();
      asteroidRef.current.getWorldPosition(asteroidPosition);
      
      // Debug position
      console.log("Asteroid position:", asteroidPosition);
      
      // Set target to a point between the asteroid and the center of the scene
      // This provides more solar system context in the view
      const centerOffset = 0.3; // How much to bias toward the center (0=asteroid only, 1=center only)
      targetPosition = new THREE.Vector3(
        asteroidPosition.x * (1 - centerOffset),
        asteroidPosition.y * (1 - centerOffset),
        asteroidPosition.z * (1 - centerOffset)
      );
      
      // Significantly increase the view distance to zoom way out
      const viewDistance = 32.0; // Extreme zoom out for a much wider perspective
      
      // Calculate distance from origin to asteroid
      const distanceFromOrigin = asteroidPosition.length();
      
      // Calculate direction from origin to asteroid
      const directionX = asteroidPosition.x;
      const directionZ = asteroidPosition.z;
      const length = Math.sqrt(directionX*directionX + directionZ*directionZ);
      
      // Normalized direction vector (avoiding division by zero)
      const normalizedX = length > 0.001 ? directionX / length : 1;
      const normalizedZ = length > 0.001 ? directionZ / length : 0;
      
      // Calculate viewing angle based on position in the solar system
      const viewingAngle = Math.atan2(directionZ, directionX) + Math.PI/4; // Add offset for better view
      
      // Position camera extremely far back for a much wider system view
      // Calculate a position that shows both the asteroid and more of its surroundings
      cameraPosition = new THREE.Vector3(
        asteroidPosition.x + Math.cos(viewingAngle) * viewDistance,
        asteroidPosition.y + viewDistance * 1.0, // Much higher elevation for panoramic view
        asteroidPosition.z + Math.sin(viewingAngle) * viewDistance
      );
    }
    
    // If we have valid positions, animate the camera
    if (targetPosition && cameraPosition && controls) {
      isAnimatingRef.current = true;
      
      // Set camera position and target
      // Longer duration for asteroid to make transition smoother
      const duration = navigationTarget === "asteroid" ? 1.5 : 1.0; // Animation duration in seconds
      const startTime = Date.now();
      const startPosition = camera.position.clone();
      const startTarget = (controls as any).target.clone();
      
      // Animation function
      const animateCamera = () => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Cubic ease-in-out function for more natural movement
        // t = progress value between 0 and 1
        const easeInOutCubic = (t: number) => 
          t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
        
        const smoothProgress = easeInOutCubic(progress);
        
        // Interpolate camera position and target
        camera.position.lerpVectors(startPosition, cameraPosition!, smoothProgress);
        (controls as any).target.lerpVectors(startTarget, targetPosition!, smoothProgress);
        (controls as any).update();
        
        // Continue animation until complete
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          // Animation complete - set position one more time to ensure precision
          camera.position.copy(cameraPosition!);
          (controls as any).target.copy(targetPosition!);
          (controls as any).update();
          
          // Mark animation as complete and call completion handler
          isAnimatingRef.current = false;
          onNavigationComplete();
        }
      };
      
      // Start the animation
      animateCamera();
    }
  }, [navigationTarget, earthRef, asteroidRef, camera, controls, onNavigationComplete]);
  
  return null;
}

export default CameraController;