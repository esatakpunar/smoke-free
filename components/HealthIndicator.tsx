import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface HealthIndicatorProps {
  percentage: number;
  width?: number;
  height?: number;
}

export default function HealthIndicator({ percentage, width = 100, height = 200 }: HealthIndicatorProps) {
  // Calculate the fill height based on percentage
  const fillHeight = (height * percentage) / 100;
  const yPosition = height - fillHeight;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF69B4" stopOpacity="1" />
            <Stop offset="1" stopColor="#FF1493" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        {/* Background path */}
        <Path
          d={`M0 0 H${width} V${height} H0 Z`}
          fill="#F8F9FA"
          stroke="#E9ECEF"
          strokeWidth="2"
        />
        {/* Fill path */}
        <Path
          d={`M0 ${yPosition} H${width} V${height} H0 Z`}
          fill="url(#grad)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 