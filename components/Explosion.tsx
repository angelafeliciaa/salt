"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ExplosionProps {
  position: [number, number, number];
  color?: string;
  size?: number;
  duration?: number;
  onComplete?: () => void;
}

export function Explosion({
  position,
  color = "#ff7700",
  size = 1.0,
  duration = 2.0,
  onComplete
}: ExplosionProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef<number>(Date.now());
  
  // Create the explosion particles
  const { geometry, particleCount } = useMemo(() => {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    // Convert hex color to RGB
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within a small sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = Math.random() * 0.1 * size;
      
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * radius;
      
      // Random velocity outward
      const speed = Math.random() * size * 2 + size * 0.5;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
      
      // Random sizes
      sizes[i] = Math.random() * size * 0.2 + size * 0.05;
      
      // Slight color variation
      const colorVar = new THREE.Color(baseColor);
      colorVar.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3);
      colorVar.toArray(colors, i * 3);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return { geometry, particleCount };
  }, [color, size]);
  
  // Create the shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        duration: { value: duration }
      },
      vertexShader: `
        attribute vec3 velocity;
        attribute float size;
        attribute vec3 color;
        
        uniform float time;
        uniform float duration;
        
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          // Calculate position based on initial position, velocity and time
          vec3 pos = position + velocity * time;
          
          // Calculate alpha based on time
          vAlpha = 1.0 - (time / duration);
          vAlpha = max(0.0, vAlpha);
          
          // Pass color to fragment shader
          vColor = color;
          
          // Calculate size (particles get smaller over time)
          float particleSize = size * vAlpha;
          
          // Set position and size
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = particleSize * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          // Calculate distance from center of point
          float dist = length(gl_PointCoord - vec2(0.5));
          
          // Discard pixels outside of circle
          if (dist > 0.5) discard;
          
          // Create smooth edge
          float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
          
          // Output color with alpha
          gl_FragColor = vec4(vColor, vAlpha * alpha);
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });
  }, [duration]);
  
  // Animation loop
  useFrame(() => {
    if (!pointsRef.current) return;
    
    // Calculate elapsed time
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Update time uniform
    material.uniforms.time.value = elapsed;
    
    // Check if explosion is complete
    if (elapsed >= duration && onComplete) {
      onComplete();
    }
  });
  
  return (
    // @ts-expect-error r3f intrinsic
    <points ref={pointsRef} position={position} geometry={geometry} material={material} />
  );
}

export default Explosion;