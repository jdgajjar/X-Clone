import React from 'react';
import './liquidXLoader.css';

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen liquid-x-loader-body">
    <svg width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <clipPath id="x-clip">
          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                fontFamily="Arial, sans-serif" fontSize="150" fontWeight="bold">
            X
          </text>
        </clipPath>
      </defs>

      {/* Liquid inside X */}
      <g clipPath="url(#x-clip)">
        {/* Vertical wave motion */}
        <g className="liquid-x-wave-group">
          {/* Horizontal scrolling waves */}
          <g className="liquid-x-wave-move">
            {/* Wave 1: duplicated for seamless scroll */}
            <path fill="white" opacity="0.8"
                  d="M0 30 Q50 10, 100 30 T200 30 T300 30 T400 30 V200 H0 Z"/>
            <path fill="white" opacity="0.8"
                  d="M400 30 Q450 10, 500 30 T600 30 T700 30 T800 30 V200 H400 Z"/>
          </g>
        </g>
      </g>

      {/* Visible X outline */}
      <text x="50%" y="50%" className="liquid-x-outline" textAnchor="middle" dominantBaseline="middle">
        X
      </text>
    </svg>
  </div>
);

export default Loading;