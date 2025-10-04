"use client";

import React, { useState, useEffect } from "react";
import { AsteroidData } from "./Asteroid";
import { calculateAsteroidPosition } from "../utils/asteroidPosition";

// Hook for managing asteroid data and state
export function useAsteroidManager() {
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidData | null>(null);
  
  // Fetch asteroid data from our API
  useEffect(() => {
    async function fetchAsteroids() {
      try {
        setLoading(true);
        setError(null);
        
        const startDate = `2025-01-01`;
        
        const response = await fetch(`/api/neo?start_date=${startDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch asteroid data');
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setAsteroids(data);
          setSelectedAsteroid(data[0]);
        } else {
          throw new Error('No asteroid data available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching asteroid data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAsteroids();
  }, []);
  
  // Navigate to previous asteroid
  const previousAsteroid = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedAsteroid(asteroids[newIndex]);
    }
  };
  
  // Navigate to next asteroid
  const nextAsteroid = () => {
    if (currentIndex < asteroids.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedAsteroid(asteroids[newIndex]);
    }
  };
  
  // Handle clicking on an asteroid
  const handleAsteroidClick = (asteroid: AsteroidData) => {
    const index = asteroids.findIndex(a => a.id === asteroid.id);
    if (index !== -1) {
      setCurrentIndex(index);
      setSelectedAsteroid(asteroid);
    }
  };
  
  // Calculate positions for each asteroid
  const asteroidPositions = asteroids.map(asteroid => {
    // Use utility function to determine position
    return calculateAsteroidPosition(asteroid);
  });
  
  return {
    asteroids,
    loading,
    error,
    currentIndex,
    selectedAsteroid,
    asteroidPositions,
    previousAsteroid,
    nextAsteroid,
    handleAsteroidClick,
    totalAsteroids: asteroids.length
  };
}

export default useAsteroidManager;