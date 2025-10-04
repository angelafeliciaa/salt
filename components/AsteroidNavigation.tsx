"use client";

import React from "react";

interface AsteroidNavigationProps {
  currentIndex: number;
  totalAsteroids: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function AsteroidNavigation({ 
  currentIndex, 
  totalAsteroids,
  onPrevious,
  onNext
}: AsteroidNavigationProps) {
  return (
    <div className="asteroid-navigation">
      <button 
        className="nav-button prev-button"
        onClick={onPrevious}
        disabled={currentIndex <= 0}
      >
        &lt; Previous
      </button>
      
      <div className="asteroid-counter">
        {currentIndex + 1} / {totalAsteroids}
      </div>
      
      <button 
        className="nav-button next-button"
        onClick={onNext}
        disabled={currentIndex >= totalAsteroids - 1}
      >
        Next &gt;
      </button>
    </div>
  );
}

export default AsteroidNavigation;