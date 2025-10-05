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
    <div
      className={`${className}`}
      style={{
        background: 'rgba(6, 10, 28, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#ffffff',
        backdropFilter: 'blur(8px)',
        marginBottom: 40,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <div style={{ fontSize: 12, opacity: 0.9 }}>Time</div>
          <div style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontWeight: 700,
            letterSpacing: 0.3,
            background: 'linear-gradient(90deg, #ffffff, #64b5f6)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {formatTime(localTime)}
          </div>
        </div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>{isPaused ? 'Paused' : 'Playing'}</div>
      </div>

      {/* Time Slider */}
      <div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="slider"
          style={{
            width: '100%',
            height: 8,
            borderRadius: 8,
            appearance: 'none',
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress * 100}%, #1f2937 ${progress * 100}%, #1f2937 100%)`,
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#a3a7b3', marginTop: 6 }}>
          <span>{formatTime(startTime)}</span>
          <span>{formatTime(endTime)}</span>
        </div>
      </div>

      {/* Quick Time Jump Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
        <button
          onClick={() => handleTimeJump(-24)}
          title="Go back 24 hours"
          style={{
            padding: '6px 10px',
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e8ecff',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          -24h
        </button>
        <button
          onClick={() => handleTimeJump(-1)}
          title="Go back 1 hour"
          style={{
            padding: '6px 10px',
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e8ecff',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          -1h
        </button>
        <button
          onClick={() => onTimeChange(new Date())}
          title="Go to current time"
          style={{
            padding: '6px 10px',
            background: '#2563eb',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#ffffff',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Now
        </button>
        <button
          onClick={() => handleTimeJump(1)}
          title="Go forward 1 hour"
          style={{
            padding: '6px 10px',
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e8ecff',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          +1h
        </button>
        <button
          onClick={() => handleTimeJump(24)}
          title="Go forward 24 hours"
          style={{
            padding: '6px 10px',
            background: 'rgba(30, 41, 59, 0.9)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e8ecff',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          +24h
        </button>
      </div>
    </div>
  );
}

export default TimeScrubber;
