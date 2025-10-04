"use client";

import { useState } from "react";
import CartesianScene from "../components/CartesianScene";
import SolarSystem, { SolarSystemControls } from "../components/SolarSystem";
import useAsteroidManager from "../components/useAsteroidManager";
import AsteroidInfo from "../components/AsteroidInfo";
import AsteroidNavigation from "../components/AsteroidNavigation";

export default function HomePage() {
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  
  // Use the asteroid manager hook to handle asteroid data and logic
  const {
    asteroids,
    loading,
    error,
    currentIndex,
    selectedAsteroid,
    asteroidPositions,
    previousAsteroid,
    nextAsteroid,
    handleAsteroidClick,
    totalAsteroids
  } = useAsteroidManager();
  
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          Loading asteroid data...
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {/* 3D Scene */}
      <CartesianScene 
        gridSize={10} 
        gridDivisions={10} 
        cameraPosition={[8, 5, 8]}
        // No center sphere since the Sun will be at the origin
        originNode={null}
      >
        <SolarSystem 
          animationSpeed={animationSpeed}
          showLabels={showLabels}
          asteroids={asteroids}
          asteroidPositions={asteroidPositions}
          selectedAsteroidId={selectedAsteroid?.id}
          onAsteroidClick={handleAsteroidClick}
        />
      </CartesianScene>
      
      {/* Controls overlay */}
      <SolarSystemControls
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />
      
      {/* Asteroid Info Panel (visible when asteroid is selected) */}
      {selectedAsteroid && !loading && (
        <AsteroidInfo asteroid={selectedAsteroid} />
      )}
      
      {/* Navigation buttons (visible when there are asteroids) */}
      {asteroids.length > 0 && !loading && (
        <AsteroidNavigation
          currentIndex={currentIndex}
          totalAsteroids={totalAsteroids}
          onPrevious={previousAsteroid}
          onNext={nextAsteroid}
        />
      )}
    </main>
  );
}


