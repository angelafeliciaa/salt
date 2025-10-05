"use client";

import React, { useState, useEffect } from 'react';

interface TimeScrubberProps {
  currentTime: Date;
  onTimeChange: (time: Date) => void;
  isPaused: boolean;
  onPauseToggle: () => void;
  className?: string;
}

export function TimeScrubber({
  currentTime,
  onTimeChange,
  isPaused,
  onPauseToggle,
  className = ""
}: TimeScrubberProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localTime, setLocalTime] = useState(currentTime);

  // Update local time when currentTime prop changes
  useEffect(() => {
    setLocalTime(currentTime);
  }, [currentTime]);

  // Time range: 1 year ago to 1 year from now
  const startTime = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const endTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  
  const totalDuration = endTime.getTime() - startTime.getTime();
  const currentDuration = localTime.getTime() - startTime.getTime();
  const progress = totalDuration > 0 ? currentDuration / totalDuration : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = new Date(startTime.getTime() + newProgress * totalDuration);
    setLocalTime(newTime);
    onTimeChange(newTime);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTimeJump = (hours: number) => {
    const newTime = new Date(localTime.getTime() + hours * 60 * 60 * 1000);
    setLocalTime(newTime);
    onTimeChange(newTime);
  };

  return (
    <div className={`bg-black bg-opacity-70 p-4 rounded-lg text-white ${className}`}>
      {/* Header with Play/Pause */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          
          { /*<button
            onClick={onPauseToggle}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            title={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button> */ }
          <div className="text-sm">
            <span className="text-gray-300">Time: </span>
            <span className="font-mono">{formatTime(localTime)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          {isPaused ? 'Paused' : 'Playing'}
        </div>
      </div>

      {/* Time Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress * 100}%, #374151 ${progress * 100}%, #374151 100%)`
          }}
        />
        
        {/* Time Labels */}
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(startTime)}</span>
          <span>{formatTime(endTime)}</span>
        </div>
      </div>

      {/* Quick Time Jump Buttons */}
      <div className="flex justify-center space-x-2 mt-3">
        <button
          onClick={() => handleTimeJump(-24)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          title="Go back 24 hours"
        >
          -24h
        </button>
        <button
          onClick={() => handleTimeJump(-1)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          title="Go back 1 hour"
        >
          -1h
        </button>
        <button
          onClick={() => onTimeChange(new Date())}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
          title="Go to current time"
        >
          Now
        </button>
        <button
          onClick={() => handleTimeJump(1)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          title="Go forward 1 hour"
        >
          +1h
        </button>
        <button
          onClick={() => handleTimeJump(24)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
          title="Go forward 24 hours"
        >
          +24h
        </button>
      </div>
    </div>
  );
}

export default TimeScrubber;
