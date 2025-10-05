"use client";

import React from "react";

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
        onClick={onNavigateToAsteroid}
        disabled={!asteroidSelected}
      >
        Find Asteroid
      </button>
    </div>
  );
}

export default CameraNavigation;