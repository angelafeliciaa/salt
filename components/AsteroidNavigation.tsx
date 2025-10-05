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
      <div className="navigation-controls">
        <button 
          className="nav-button prev-button"
          style={{ marginRight: '10px' }}
          onClick={onPrevious}
          disabled={currentIndex <= 0}
        >
          &lt; Previous
        </button>
        
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