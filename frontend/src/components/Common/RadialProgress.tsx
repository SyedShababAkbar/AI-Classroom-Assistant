import React from 'react';

interface RadialProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
}

export const RadialProgress: React.FC<RadialProgressProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#0061f2',
  backgroundColor = '#e5e7eb',
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getColor = (percentage: number) => {
    if (percentage >= 80) return '#22c55e'; // Green
    if (percentage >= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const finalColor = color === '#0061f2' ? getColor(progress) : color;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
        {label && (
          <span className="text-sm text-gray-600 text-center mt-1">{label}</span>
        )}
      </div>
    </div>
  );
};