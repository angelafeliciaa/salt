"use client";

import { useState } from "react";
import CartesianScene from "../../components/CartesianScene";
import SolarSystem from "../../components/SolarSystem";
import TimeAwareSolarSystem from "../../components/TimeAwareSolarSystem";
import TimeScrubber from "../../components/TimeScrubber";
import useAsteroidManager from "../../components/useAsteroidManager";
import AsteroidInfo from "../../components/AsteroidInfo";
import AsteroidEnergy from "../../components/AsteroidEnergy";
import AsteroidNavigation from "../../components/AsteroidNavigation";
import Solutions from "components/Solutions";
import CameraNavigation from "../../components/CameraNavigation";
import ChatBar from "../../components/ChatBar";

export default function SandboxPage() {
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  const [navigationTarget, setNavigationTarget] = useState<"none" | "earth" | "asteroid">("none");
  const [useTimeAware, setUseTimeAware] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPaused, setIsPaused] = useState(true);

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
    refreshAsteroids,
  } = useAsteroidManager();

  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {loading && <div className="loading-indicator">Loading asteroid data...</div>}
      {error && <div className="error-message">Error: {error}</div>}

      <CartesianScene
        gridSize={300}
        gridDivisions={30}
        cameraPosition={[180, 120, 180]}
        background="#030303"
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

      {useTimeAware && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "600px",
            maxWidth: "90vw",
          }}
        >
          <TimeScrubber
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            isPaused={isPaused}
            onPauseToggle={() => setIsPaused(!isPaused)}
          />
        </div>
      )}

      {selectedAsteroid && !loading && <AsteroidEnergy asteroid={selectedAsteroid} />}
      {selectedAsteroid && !loading && <AsteroidInfo asteroid={selectedAsteroid} />}        
      {selectedAsteroid && !loading && <Solutions asteroid={selectedAsteroid} />}

      {asteroids.length > 0 && !loading && (
        <AsteroidNavigation
          currentIndex={currentIndex}
          totalAsteroids={asteroids.length}
          totalAsteroidsInDatabase={totalAsteroidsInDatabase}
          onPrevious={previousAsteroid}
          onNext={nextAsteroid}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: "65%",
          right: "0px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            padding: "12px",
            borderRadius: "8px",
            color: "white",
            minWidth: "200px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <input
              type="checkbox"
              checked={useTimeAware}
              onChange={(e) => setUseTimeAware(e.target.checked)}
              style={{ margin: 0, transform: "scale(1.2)" }}
            />
            <span style={{ fontWeight: "600" }}>Time-Aware Mode</span>
          </label>
        </div>
      </div>

      <div>
        <CameraNavigation
          onNavigateToEarth={() => setNavigationTarget("earth")}
          onNavigateToAsteroid={() => setNavigationTarget("asteroid")}
          asteroidSelected={!!selectedAsteroid}
        />
      </div>
      <ChatBar selectedAsteroid={selectedAsteroid} />
    </main>
  );
}
