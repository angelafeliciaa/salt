"use client";

import { useState, useRef } from "react";
import CartesianScene from "../components/CartesianScene";
import SolarSystem, { SolarSystemControls } from "../components/SolarSystem";
import TimeAwareSolarSystem from "../components/TimeAwareSolarSystem";
import TimeScrubber from "../components/TimeScrubber";
import useAsteroidManager from "../components/useAsteroidManager";
import AsteroidInfo from "../components/AsteroidInfo";
import AsteroidEnergy from "../components/AsteroidEnergy";
import AsteroidNavigation from "../components/AsteroidNavigation";
import Solutions from "components/Solutions";
import CameraNavigation from "../components/CameraNavigation";

export default function HomePage() {
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  const [navigationTarget, setNavigationTarget] = useState<"none" | "earth" | "asteroid">("none");
  const [useTimeAware, setUseTimeAware] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(false);
  
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
    totalAsteroids,
    totalAsteroidsInDatabase,
    hazardousAsteroidCount,
    refreshAsteroids
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
        gridSize={300} 
        gridDivisions={30} 
        cameraPosition={[180, 120, 180]}
        // No center sphere since the Sun will be at the origin
        originNode={null}
      >
        {useTimeAware ? (
          <TimeAwareSolarSystem 
            animationSpeed={animationSpeed}
            showLabels={showLabels}
            asteroids={asteroids}
            asteroidPositions={asteroidPositions}
            selectedAsteroidId={selectedAsteroid?.id}
            onAsteroidClick={handleAsteroidClick}
            currentTime={currentTime}
            isPaused={isPaused}
            onTimeChange={setCurrentTime}
          />
        ) : (
          <SolarSystem 
            animationSpeed={animationSpeed}
            showLabels={showLabels}
            asteroids={asteroids}
            asteroidPositions={asteroidPositions}
            selectedAsteroidId={selectedAsteroid?.id}
            onAsteroidClick={handleAsteroidClick}
            navigationTarget={navigationTarget}
            onNavigationComplete={() => setNavigationTarget("none")}
          />
        )}
      </CartesianScene>
      
      {/* Controls overlay */}
      <SolarSystemControls
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />

      {/* Time Scrubber - only show when time-aware mode is enabled */}
      {useTimeAware && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '600px',
          maxWidth: '90vw'
        }}>
          <TimeScrubber
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused(!isPaused)}
          />
        </div>
      )}

      {/* Mode Toggle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '12px',
          borderRadius: '8px',
          color: 'white',
          minWidth: '200px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              checked={useTimeAware}
              onChange={(e) => setUseTimeAware(e.target.checked)}
              style={{ margin: 0, transform: 'scale(1.2)' }}
            />
            <span style={{ fontWeight: '600' }}>Time-Aware Mode</span>
          </label>
          {useTimeAware && (
            <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.4' }}>
              <div>• Drag the time slider to see planets at different times</div>
              <div>• Use play/pause to control time flow</div>
              <div>• Click "Now" to return to current time</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Asteroid Energy Panel (visible when asteroid is selected) */}
      {selectedAsteroid && !loading && (
        <AsteroidEnergy asteroid={selectedAsteroid} />
      )}
      
      {/* Asteroid Info Panel (visible when asteroid is selected) */}
      {selectedAsteroid && !loading && (
        <AsteroidInfo asteroid={selectedAsteroid} />
      )}
      
      {/* Solutions Panel (visible when asteroid is selected) */}
      {selectedAsteroid && !loading && (
        <Solutions asteroid={selectedAsteroid} />
      )}

      {/* Navigation buttons (visible when there are asteroids) */}
      {asteroids.length > 0 && !loading && (
        <AsteroidNavigation
          currentIndex={currentIndex}
          totalAsteroids={asteroids.length}
          totalAsteroidsInDatabase={totalAsteroidsInDatabase}
          onPrevious={previousAsteroid}
          onNext={nextAsteroid}
        />
      )}
      
      {/* Camera Navigation buttons */}
      <CameraNavigation
        onNavigateToEarth={() => setNavigationTarget("earth")}
        onNavigateToAsteroid={() => setNavigationTarget("asteroid")}
        asteroidSelected={!!selectedAsteroid}
      />
    </main>
  );
}

