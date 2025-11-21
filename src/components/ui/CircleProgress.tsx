// src/components/ui/CircleProgress.tsx
import React from "react";

interface CircleProgressProps {
  percentage: number; // 0–100
  size?: number; // logical viewBox size, default 64
  strokeWidth?: number; // default 8
  className?: string; // for Tailwind sizing
}

const CircleProgress: React.FC<CircleProgressProps> = ({
  percentage,
  size = 64,
  strokeWidth = 8,
  className = "",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  const center = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`Progress: ${percentage}%`}
    >
      {/* 1) Gray background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* 2) Colored progress circle, rotated to start at top */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="#10B981"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />

      {/* 3) Percentage text, not rotated */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={`${size * 0.25}`} /* 25% of viewBox */
        fill="currentColor"
        className="text-neutral-700"
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default CircleProgress;
