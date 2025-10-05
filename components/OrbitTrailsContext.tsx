"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// Context for managing orbit trails
type OrbitTrailsContextType = {
  addTrailPoint: (key: string, position: THREE.Vector3) => void;
  clearTrail: (key: string) => void;
};

const OrbitTrailsContext = createContext<OrbitTrailsContextType | undefined>(undefined);

// Custom hook to use orbit trails
export const useOrbitTrails = () => {
  const context = useContext(OrbitTrailsContext);
  if (!context) {
    throw new Error('useOrbitTrails must be used within an OrbitTrailsProvider');
  }
  return context;
};

// Props for the OrbitTrailsProvider
type OrbitTrailsProviderProps = {
  children: ReactNode;
  maxPoints?: number;
  trailColor?: string;
  trailOpacity?: number;
};

// Type for the trail points
type TrailsMap = Record<string, THREE.Vector3[]>;

export function OrbitTrailsProvider({
  children,
  maxPoints = 300,
  trailColor = '#ffffff',
  trailOpacity = 0.3,
}: OrbitTrailsProviderProps) {
  // State to store all orbit trails
  const [trails, setTrails] = useState<TrailsMap>({});

  // Add a point to a trail
  const addTrailPoint = useCallback((key: string, position: THREE.Vector3) => {
    // Skip trail points for asteroid objects
    if (key.startsWith('asteroid-')) {
      return; // Don't create trails for asteroids
    }
    
    setTrails((prevTrails) => {
      const trail = prevTrails[key] || [];
      // Remove oldest point if trail is at max length
      const newTrail = trail.length >= maxPoints ? trail.slice(1) : trail;
      
      // Get the last point to check if we need to add a new one
      const lastPoint = newTrail[newTrail.length - 1];
      
      // Only add point if it's significantly different from the last one
      // This prevents excessive points when movement is small
      if (!lastPoint || position.distanceToSquared(lastPoint) > 0.01) {
        return { ...prevTrails, [key]: [...newTrail, position.clone()] };
      }
      
      return prevTrails;
    });
  }, [maxPoints]);

  // Clear a specific trail
  const clearTrail = useCallback((key: string) => {
    setTrails((prevTrails) => {
      const { [key]: _, ...rest } = prevTrails;
      return rest;
    });
  }, []);
  
  // Clear any existing asteroid trails when component mounts
  useEffect(() => {
    setTrails((prevTrails) => {
      // Filter out any keys that start with "asteroid-"
      const filteredTrails: TrailsMap = {};
      Object.entries(prevTrails).forEach(([key, value]) => {
        if (!key.startsWith('asteroid-')) {
          filteredTrails[key] = value;
        }
      });
      return filteredTrails;
    });
  }, []);

  return (
    <OrbitTrailsContext.Provider value={{ addTrailPoint, clearTrail }}>
      {children}
      
      {/* Render all trails */}
      {Object.entries(trails).map(([key, positions]) => (
        <Line 
          key={key} 
          points={positions} 
          color={trailColor}
          opacity={trailOpacity}
          transparent={true}
          lineWidth={1.5}
        />
      ))}
    </OrbitTrailsContext.Provider>
  );
}