"use client";

import React from 'react';

interface PageSelectorProps {
  totalHazardous: number;
  totalAsteroids: number;
  isLoading: boolean;
}

export default function PageSelector({
  totalHazardous,
  totalAsteroids,
  isLoading
}: PageSelectorProps) {
  return (
    <div className="page-selector">
      <h3>Asteroid Database</h3>
      <div className="asteroid-stats">
        <div className="stat-item">
          <div className="stat-value">{totalHazardous}</div>
          <div className="stat-label">Hazardous</div>
        </div>
        <div className="stat-item total">
          <div className="stat-value">{totalAsteroids}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>
      
      <div className="refresh-note">
        <p>Showing one hazardous asteroid at a time. Use the navigation controls at the bottom to browse through all {totalHazardous} hazardous asteroids.</p>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">Loading...</div>
      )}
      
      <style jsx>{`
        .page-selector {
          position: absolute;
          top: 60px;
          right: 20px;
          padding: 15px;
          background-color: rgba(6, 10, 28, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          z-index: 1000;
          width: 280px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
          text-align: center;
        }
        
        .asteroid-stats {
          display: flex;
          justify-content: space-around;
          margin: 15px 0;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 20px;
          background-color: rgba(255, 69, 0, 0.2);
          border: 1px solid rgba(255, 69, 0, 0.4);
          border-radius: 8px;
          min-width: 100px;
          box-shadow: 0 0 10px rgba(255, 69, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .stat-item.total {
          background-color: rgba(0, 112, 243, 0.2);
          border: 1px solid rgba(0, 112, 243, 0.4);
          box-shadow: 0 0 10px rgba(0, 112, 243, 0.2);
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 5px;
        }
        
        .refresh-note {
          margin-top: 15px;
          font-size: 13px;
          line-height: 1.4;
          text-align: center;
          color: #ddd;
        }
        
        .refresh-note p {
          margin: 0;
        }
        
        .loading-indicator {
          margin-top: 10px;
          padding: 8px;
          background-color: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          text-align: center;
          font-size: 14px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}