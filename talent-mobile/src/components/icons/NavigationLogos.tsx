import React from 'react';
import Svg, { Rect, Path, Polygon, Circle } from 'react-native-svg';

interface LogoProps {
  className?: string;
  size?: number;
  isActive?: boolean;
  color?: string;
}

export const FlipsLogoIcon: React.FC<LogoProps> = ({
  className = '',
  size = 22,
  isActive = false,
  color = 'currentColor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Back card in dynamic 3D perspective rotation */}
      <Rect
        x="6.8"
        y="2.6"
        width="11.8"
        height="15.2"
        rx="3.2"
        transform="rotate(13 12.7 10.2)"
        stroke={color}
        strokeWidth="1.7"
        strokeOpacity={isActive ? 0.6 : 0.4}
        strokeLinecap="round"
      />
      {/* Front active card with glow & fill when active */}
      <Rect
        x="3.6"
        y="4.8"
        width="12.8"
        height="15.6"
        rx="3.2"
        stroke={color}
        strokeWidth="1.9"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
        strokeLinecap="round"
      />
      {/* Dynamic central play triangle */}
      <Path d="M8.8 9.8L13.2 12.6L8.8 15.4V9.8Z" fill={color} />
    </Svg>
  );
};

export const ShowsLogoIcon: React.FC<LogoProps> = ({
  className = '',
  size = 22,
  isActive = false,
  color = 'currentColor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Notched VIP Stage Concert Pass */}
      <Path
        d="M3.5 8C3.5 6.62 4.62 5.5 6 5.5H18C19.38 5.5 20.5 6.62 20.5 8V9.5C19.12 9.5 18 10.62 18 12C18 13.38 19.12 14.5 20.5 14.5V16C20.5 17.38 19.38 18.5 18 18.5H6C4.62 18.5 3.5 17.38 3.5 16V14.5C4.88 14.5 6 13.38 6 12C6 10.62 4.88 9.5 3.5 9.5V8Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.22 : 0}
      />
      {/* Perforated ticket stub line */}
      <Path
        d="M9.5 6V18"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="2 2"
        strokeLinecap="round"
      />
      {/* Live Stage Beacon / Star in center */}
      <Polygon
        points="14.8,9.2 15.6,10.9 17.4,11.2 16.1,12.5 16.4,14.2 14.8,13.3 13.2,14.2 13.5,12.5 12.2,11.2 14,10.9"
        fill={color}
      />
    </Svg>
  );
};

export const HomeLogoIcon: React.FC<LogoProps> = ({
  className = '',
  size = 22,
  isActive = false,
  color = 'currentColor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <Path
        d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
      <Path
        d="M9 21V12H15V21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
    </Svg>
  );
};

export const CreateLogoIcon: React.FC<LogoProps> = ({
  className = '',
  size = 22,
  isActive = false,
  color = 'currentColor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
      <Path
        d="M12 8V16M8 12H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const YouLogoIcon: React.FC<LogoProps> = ({
  className = '',
  size = 22,
  isActive = false,
  color = 'currentColor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <Circle
        cx="12"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
      <Path
        d="M4 21C4 17.134 7.58172 14 12 14C16.4183 14 20 17.134 20 21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isActive ? color : 'none'}
        fillOpacity={isActive ? 0.2 : 0}
      />
    </Svg>
  );
};
