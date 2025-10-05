"use client";

import React, { useState } from "react";
import VideoModal from "./VideoModal";
import { AsteroidData } from "./Asteroid";

interface AsteroidInfoProps {
  asteroid: AsteroidData | null;
}

export function AsteroidInfo({ asteroid }: AsteroidInfoProps) {
  if (!asteroid) return null;

      // Get the most recent close approach data
  const latestApproach = asteroid.closeApproachData && asteroid.closeApproachData.length > 0 
    ? asteroid.closeApproachData[0] 
    : null;
  
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoSrc = "/videos/file.mp4";

  return (
    <div className="asteroid-info-panel">
      <h2 className="asteroid-name">{asteroid.name}</h2>
      
      <div className="hazard-indicator">
        {asteroid.isPotentiallyHazardous ? (
          <span className="hazard-badge hazardous">
            <span className="warning-icon">⚠️</span> Potentially Hazardous
          </span>
        ) : (
          <span className="hazard-badge safe">
            <span className="safe-icon">✓</span> Non-Hazardous
          </span>
        )}
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <button
          className="nav-button"
          onClick={() => setIsVideoOpen(true)}
          title="Play related video"
        >
          Watch video
        </button>
      </div>
      
      <div className={`danger-stats ${asteroid.isPotentiallyHazardous ? 'hazardous' : 'safe'}`}>
        <div className="danger-stat">
          <span className="danger-stat-label">Diameter</span>
          <span className="danger-stat-value">{asteroid.diameter.avg.toFixed(2)} km</span>
        </div>
        <div className="danger-stat">
          <span className="danger-stat-label">Velocity</span>
          <span className="danger-stat-value">{parseFloat(latestApproach?.velocity.kmPerSecond || '0').toFixed(1)} km/s</span>
        </div>
        <div className="danger-stat">
          <span className="danger-stat-label">Miss Distance</span>
          <span className="danger-stat-value">{parseFloat(latestApproach?.missDistance.astronomical || '0').toFixed(3)} AU</span>
        </div>
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
        <p>Period: {latestApproach?.orbitalPeriod?.days || 'Unknown'} days</p>
        <p>Velocity: {parseFloat(latestApproach?.velocity.kmPerSecond || '0').toFixed(2)} km/s</p>
        <p>Miss Distance: {parseFloat(latestApproach?.missDistance.astronomical || '0').toFixed(6)} AU</p>
        <p>({parseFloat(latestApproach?.missDistance.kilometers || '0').toLocaleString()} km)</p>
        <p>Orbiting Body: {latestApproach?.orbitingBody || 'Unknown'}</p>
      </div>

      <p className="asteroid-id">NASA JPL ID: {asteroid.id}</p>

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        src={videoSrc}
        title={`About ${asteroid.name}`}
      />
    </div>
  );
}

export default AsteroidInfo;
