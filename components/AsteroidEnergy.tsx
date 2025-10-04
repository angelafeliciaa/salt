"use client";

import React from "react";
import { AsteroidData } from "./Asteroid";
import { 
  calculateKineticEnergy,
  calculateAsteroidMass,
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

  return (
    <div className="asteroid-energy-panel">
      <h3 className="energy-title">Impact Energy</h3>
      
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
      
      <div className="energy-details">
        <div className="detail-item">
          <span className="detail-label">Asteroid Mass</span>
          <span className="detail-value">
            {(calculateAsteroidMass(asteroid) / 1e9).toFixed(2)} kilotons
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Impact Velocity</span>
          <span className="detail-value">
            {parseFloat(asteroid.closeApproachData[0].velocity.kmPerSecond).toFixed(2)} km/s
          </span>
        </div>
      </div>
      
      <div className="energy-disclaimer">
        <small>*Calculations based on estimated diameter, average density (3000 kg/m³), and velocity</small>
      </div>
    </div>
  );
}

export default AsteroidEnergy;