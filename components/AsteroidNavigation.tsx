"use client";

import React from "react";

interface AsteroidNavigationProps {
  currentIndex: number;
  totalAsteroids: number;
  totalAsteroidsInDatabase?: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function AsteroidNavigation({ 
  currentIndex, 
  totalAsteroids,
  totalAsteroidsInDatabase,
  onPrevious,
  onNext
}: AsteroidNavigationProps) {
  return (
    <div className="asteroid-navigation">
      <div className="hazardous-label">
        <span className="warning-icon">⚠️</span> 
        Potentially Hazardous Asteroid Navigator
      </div>
      
      <div className="navigation-controls">
        <button 
          className="nav-button prev-button"
          onClick={onPrevious}
          disabled={currentIndex <= 0}
        >
          &lt; Previous
        </button>
        
        <div className="asteroid-counter">
          Asteroid {currentIndex + 1} of {totalAsteroids}
          {totalAsteroidsInDatabase && totalAsteroidsInDatabase > totalAsteroids && (
            <span className="total-count"> (from {totalAsteroidsInDatabase} database total)</span>
          )}
        </div>
        
        <button 
          className="nav-button next-button"
          onClick={onNext}
          disabled={currentIndex >= totalAsteroids - 1}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}

export default AsteroidNavigation;