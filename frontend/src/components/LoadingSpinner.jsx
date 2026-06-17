import React from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const LoadingSpinner = ({ size = 18, color = 'currentColor', label = 'Chargement' }) => {
  const { theme } = useTheme();
  const computedColor = theme === 'dark' ? '#000000' : color;

  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <g>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke={computedColor}
            strokeWidth="4"
            fill="none"
            strokeOpacity="0.25"
          />

          <path
            fill={computedColor}
            fillOpacity="0.75"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />

          {/* SVG-native rotation animation (works even if Tailwind isn't available) */}
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    </span>
  );
};

export default LoadingSpinner;
