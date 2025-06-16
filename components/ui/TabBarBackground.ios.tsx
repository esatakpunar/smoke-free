import { useTheme } from '@/contexts/ThemeContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  const { colorScheme } = useTheme();
  
  return (
    <BlurView
      // Use dark or light blur effect based on the theme
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
