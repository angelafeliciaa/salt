"use client";

import React from "react";
import { useThree } from "@react-three/fiber";

interface CameraNavigationProps {
  onNavigateToEarth: () => void;
  onNavigateToAsteroid: () => void;
  asteroidSelected: boolean;
}

export function CameraNavigation({ 
  onNavigateToEarth, 
  onNavigateToAsteroid,
  asteroidSelected
}: CameraNavigationProps) {
  return (
    <div className="camera-navigation">
      <button 
        className="nav-button camera-button"
        onClick={onNavigateToEarth}
      >
        Earth
      </button>
      
      <button 
        className="nav-button camera-button"
        onClick={onNavigateToAsteroid}
        disabled={!asteroidSelected}
      >
        Asteroid
      </button>
    </div>
  );
}

export default CameraNavigation;