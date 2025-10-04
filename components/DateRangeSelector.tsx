"use client";

import React, { useState } from 'react';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  isLoading: boolean;
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onDateRangeChange,
  isLoading
}: DateRangeSelectorProps) {
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);
  
  // Calculate the maximum end date (7 days after start date)
  const getMaxEndDate = (startDate: string) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };
  
  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStart(newStart);
    
    // Check if end date is more than 7 days after start date
    const maxEnd = getMaxEndDate(newStart);
    if (end > maxEnd) {
      setEnd(maxEnd);
    }
  };
  
  // Handle applying the new date range
  const handleApply = () => {
    onDateRangeChange(start, end);
  };
  
  return (
    <div className="date-range-selector">
      <h3>Select Date Range</h3>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">Start Date:</label>
          <input
            type="date"
            id="start-date"
            value={start}
            onChange={handleStartDateChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="date-input-group">
          <label htmlFor="end-date">End Date:</label>
          <input
            type="date"
            id="end-date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            min={start}
            max={getMaxEndDate(start)}
            disabled={isLoading}
          />
        </div>
        
        <button 
          className="apply-button"
          onClick={handleApply}
          disabled={isLoading || !start || !end || start > end}
        >
          {isLoading ? 'Loading...' : 'Apply'}
        </button>
      </div>
      
      <div className="date-range-note">
        <small>Note: NASA API allows maximum 7 days per request</small>
      </div>
      
      <style jsx>{`
        .date-range-selector {
          position: absolute;
          top: 60px;
          right: 20px;
          padding: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          border-radius: 5px;
          color: white;
          z-index: 1000;
          width: 280px;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .date-inputs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        label {
          font-size: 14px;
        }
        
        input {
          padding: 6px;
          border-radius: 4px;
          border: none;
          background-color: #333;
          color: white;
        }
        
        .apply-button {
          margin-top: 10px;
          padding: 8px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .apply-button:hover {
          background-color: #0051cc;
        }
        
        .apply-button:disabled {
          background-color: #666;
          cursor: not-allowed;
        }
        
        .date-range-note {
          margin-top: 10px;
          font-size: 12px;
          color: #aaa;
        }
      `}</style>
    </div>
  );
}