import React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function ShowStageIcon({ color, size = 23 }: { color: ColorValue; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m4 9-1-4 15-3 1 5M4 9h17v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V9Z" />
      <Path d="M16 10v1m0 2v1m0 2v1" />
    </Svg>
  );
}
