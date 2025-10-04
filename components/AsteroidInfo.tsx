"use client";

import React from "react";
import { AsteroidData } from "./Asteroid";

interface AsteroidInfoProps {
  asteroid: AsteroidData | null;
}

export function AsteroidInfo({ asteroid }: AsteroidInfoProps) {
  if (!asteroid) return null;

  // Get the most recent close approach data
  const latestApproach = asteroid.closeApproachData[0];

  return (
    <div className="asteroid-info-panel">
      <h2 className="asteroid-name">{asteroid.name}</h2>
      
      <div className="hazard-indicator">
        <span 
          className={`hazard-badge ${asteroid.isPotentiallyHazardous ? 'hazardous' : 'safe'}`}
        >
          {asteroid.isPotentiallyHazardous ? 'Potentially Hazardous' : 'Not Hazardous'}
        </span>
      </div>

      <div className="info-section">
        <h3>Physical Characteristics</h3>
        <p>Estimated Diameter: {asteroid.diameter.min.toFixed(2)} - {asteroid.diameter.max.toFixed(2)} km</p>
      </div>

      <div className="info-section">
        <h3>Orbit Information</h3>
        <p>Orbit Class: {asteroid.orbitData.orbitClass || 'Unknown'}</p>
        <p>First Observed: {asteroid.orbitData.firstObservation || 'Unknown'}</p>
        <p>Observation Arc: {asteroid.orbitData.dataArcInDays || '?'} days</p>
      </div>

      <div className="info-section">
        <h3>Close Approach Data</h3>
        <p>Date: {latestApproach?.date || 'Unknown'}</p>
        <p>Velocity: {parseFloat(latestApproach?.velocity.kmPerSecond || '0').toFixed(2)} km/s</p>
        <p>Miss Distance: {parseFloat(latestApproach?.missDistance.astronomical || '0').toFixed(6)} AU</p>
        <p>({parseFloat(latestApproach?.missDistance.kilometers || '0').toLocaleString()} km)</p>
        <p>Orbiting Body: {latestApproach?.orbitingBody || 'Unknown'}</p>
      </div>

      <p className="asteroid-id">NASA JPL ID: {asteroid.id}</p>
    </div>
  );
}

export default AsteroidInfo;