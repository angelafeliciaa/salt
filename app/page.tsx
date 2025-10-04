"use client";

import { useState } from "react";
import CartesianScene from "../components/CartesianScene";
import SolarSystem, { SolarSystemControls } from "../components/SolarSystem";

export default function HomePage() {
  const [animationSpeed, setAnimationSpeed] = useState(0.5);
  const [showLabels, setShowLabels] = useState(true);
  
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative" }}>
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
        />
      </CartesianScene>
      
      {/* Controls overlay */}
      <SolarSystemControls
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />
    </main>
  );
}


