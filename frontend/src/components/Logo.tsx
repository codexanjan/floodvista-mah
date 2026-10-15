import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="fvGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f2fe" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="fvGradGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
        </linearGradient>
        <filter id="fvGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal / Shield Outer Frame */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="#0b1329"
        stroke="url(#fvGradPrimary)"
        strokeWidth="1.8"
      />

      {/* Satellite Radar Beam Arc 1 */}
      <path
        d="M10 18 C18 10, 30 10, 38 18"
        stroke="#00f2fe"
        strokeWidth="1.5"
        strokeDasharray="2 3"
        opacity="0.6"
      />
      {/* Satellite Radar Beam Arc 2 */}
      <path
        d="M14 22 C20 16, 28 16, 34 22"
        stroke="#38bdf8"
        strokeWidth="1.8"
        opacity="0.85"
      />

      {/* Himalayan Mountain Ridge Outline */}
      <path
        d="M8 36 L18 24 L25 31 L32 21 L40 36 Z"
        fill="#071329"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inundation Water Wave Flow */}
      <path
        d="M8 35 C14 31, 20 38, 26 34 C32 30, 36 36, 40 33 L40 39 C34 42, 28 36, 22 40 C16 43, 11 38, 8 40 Z"
        fill="url(#fvGradPrimary)"
        opacity="0.9"
      />

      {/* Satellite Platform & Orbital Transmitter Node */}
      <circle cx="24" cy="11" r="3.2" fill="#00f2fe" filter="url(#fvGlow)" />
      <circle cx="24" cy="11" r="1.4" fill="#ffffff" />

      {/* Pulsing Signal Rays */}
      <line x1="24" y1="14" x2="24" y2="21" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="13" x2="16" y2="17" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="13" x2="32" y2="17" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};
