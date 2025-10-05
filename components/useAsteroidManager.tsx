"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AsteroidData } from "./Asteroid";
import { calculateAsteroidPosition } from "../utils/asteroidPosition";

// Hook for managing asteroid data and state
export function useAsteroidManager() {
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidData | null>(null);
  const [totalAsteroidCount, setTotalAsteroidCount] = useState<number>(0);
  const [hazardousAsteroidCount, setHazardousAsteroidCount] = useState<number>(0);
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Fetch asteroid data from our API
  const fetchAsteroids = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only hazardous asteroids using API's filtering
      const response = await fetch(`/api/neo?hazardous_only=true`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch asteroid data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if we have the new response format with metadata
      if (data.asteroids && Array.isArray(data.asteroids)) {
        if (data.asteroids.length > 0) {
          setAsteroids(data.asteroids);
          setSelectedAsteroid(data.asteroids[0]);
          setCurrentIndex(0);
          
          // Set the metadata counts if available
          if (data.metadata) {
            setTotalAsteroidCount(data.metadata.totalCount || data.asteroids.length);
            setHazardousAsteroidCount(data.metadata.hazardousCount || data.asteroids.length);
          }
        } else {
          throw new Error('No potentially hazardous asteroids found');
        }
      } else if (Array.isArray(data) && data.length > 0) {
        // Handle legacy response format
        setAsteroids(data);
        setSelectedAsteroid(data[0]);
        setCurrentIndex(0);
        setHazardousAsteroidCount(data.length);
        setTotalAsteroidCount(data.length); // We don't know total in legacy format
      } else {
        throw new Error('No asteroid data available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching asteroid data:', err);
      setAsteroids([]);
      setSelectedAsteroid(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial data fetch
  useEffect(() => {
    fetchAsteroids();
  }, [fetchAsteroids]);
  
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
  
  // Manual refresh function
  const refreshAsteroids = () => {
    fetchAsteroids();
  };
  
  // Calculate positions for each asteroid (memoized to prevent recalculation)
  const asteroidPositions = React.useMemo(() => {
    return asteroids.map(asteroid => {
      // Use utility function to determine position with the asteroid ID as seed
      return calculateAsteroidPosition(asteroid);
    });
  }, [asteroids]); // Only recalculate when asteroids array changes
  
  // Search for asteroids by name
  const searchAsteroids = useCallback(async (name: string) => {
    try {
      setIsSearching(true);
      setSearchError(null);
      setSearchQuery(name);
      
      // Make API call with name parameter
      const response = await fetch(`/api/neo?name=${encodeURIComponent(name)}&hazardous_only=true`);
      
      if (!response.ok) {
        throw new Error('Failed to search asteroids');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Process search results
      if (data.asteroids && Array.isArray(data.asteroids)) {
        if (data.asteroids.length > 0) {
          setAsteroids(data.asteroids);
          setSelectedAsteroid(data.asteroids[0]);
          setCurrentIndex(0);
          setIsSearchMode(true);
        } else {
          throw new Error(`No asteroids found matching "${name}"`);
        }
      } else {
        throw new Error('Invalid response format from search');
      }
      
    } catch (err) {
      console.error('Error searching asteroids:', err);
      setSearchError(err instanceof Error ? err.message : 'Failed to search asteroids');
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Clear search and return to default asteroid list
  const clearSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery(null);
    setSearchError(null);
    
    // If we already have the original list, just restore it
    if (asteroids.length > 0 && !isSearchMode) {
      return;
    }
    
    // Otherwise, fetch the original list again
    fetchAsteroids();
  }, [fetchAsteroids, asteroids.length, isSearchMode]);
  
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
    refreshAsteroids,
    totalAsteroids: hazardousAsteroidCount,
    totalAsteroidsInDatabase: totalAsteroidCount,
    hazardousAsteroidCount,
    // Search related
    searchAsteroids,
    clearSearch,
    isSearching,
    searchError,
    searchQuery,
    isSearchMode
  };
}

export default useAsteroidManager;