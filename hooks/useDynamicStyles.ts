import { useColorScheme } from './useColorScheme';

export function useDynamicStyles<T>(
  lightStyles: T, 
  darkStyles: T
): T {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkStyles : lightStyles;
}
