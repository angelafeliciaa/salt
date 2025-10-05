"use client";

import React from "react";
import { AsteroidData } from "./Asteroid";
import { 
  calculateKineticEnergy,
  calculateAsteroidMass,
  getAsteroidDensity,
  joulestoTNT, 
  formatEnergy, 
  formatTNT,
  getComparableExplosion,
  getMultipleComparisons
} from "../utils/energyCalculations";

interface AsteroidEnergyProps {
  asteroid: AsteroidData | null;
}

export function AsteroidEnergy({ asteroid }: AsteroidEnergyProps) {
  if (!asteroid || !asteroid.closeApproachData || !asteroid.closeApproachData[0]) {
    return null;
  }

  // Calculate the kinetic energy
  const kineticEnergy = calculateKineticEnergy(asteroid);
  
  // Calculate TNT equivalent in megatons
  const tntEquivalent = joulestoTNT(kineticEnergy);
  
  // Get a primary comparison
  const primaryComparison = getComparableExplosion(tntEquivalent);
  
  // Get multiple comparisons for better context
  const multipleComparisons = getMultipleComparisons(tntEquivalent);

  // Determine hazard level based on TNT equivalent
  const getHazardLevel = (megatons: number): string => {
    if (megatons >= 100000) return "extinction"; // Extinction-level event
    if (megatons >= 10000) return "global"; // Global catastrophe
    if (megatons >= 1000) return "continental"; // Continental devastation
    if (megatons >= 100) return "catastrophic"; // Regional catastrophe
    if (megatons >= 10) return "severe"; // Severe regional damage
    if (megatons >= 1) return "major"; // Major city destruction
    if (megatons >= 0.1) return "significant"; // Significant local damage
    if (megatons >= 0.01) return "moderate"; // Moderate damage
    if (megatons >= 0.001) return "minor"; // Minor damage
    return "negligible"; // Negligible damage
  };

  const hazardLevel = getHazardLevel(tntEquivalent);
  const isHazardous = asteroid.isPotentiallyHazardous;

  return (
    <div className={`asteroid-energy-panel hazard-${hazardLevel} hazardous`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <h3 className="energy-title">Impact Energy - {hazardLevel.charAt(0).toUpperCase() + hazardLevel.slice(1)} Impact</h3>
      </div>
      
      
      <div className="energy-stats">
        <div className="energy-stat">
          <span className="energy-stat-label">Kinetic Energy</span>
          <span className="energy-stat-value">{formatEnergy(kineticEnergy)}</span>
        </div>
        
        <div className="energy-stat">
          <span className="energy-stat-label">TNT Equivalent</span>
          <span className="energy-stat-value">{formatTNT(tntEquivalent)}</span>
        </div>
      </div>
      
      <div className="energy-comparisons">
        <h4 className="comparisons-title">Impact Comparisons</h4>
        <ul className="comparisons-list">
          {multipleComparisons.map((comparison, index) => (
            <li key={index} className="comparison-item">{comparison}</li>
          ))}
        </ul>
      </div>
      
      <div className="energy-disclaimer">
        <small>*Calculations based on estimated diameter, composition-based density, and velocity</small>
      </div>
    </div>
  );
}

export default AsteroidEnergy;