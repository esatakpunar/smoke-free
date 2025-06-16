import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { ThemePreference, themeStorage } from '../utils/themeStorage';

type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  themePreference: 'system',
  setThemePreference: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme() as ColorScheme;
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme || 'light');

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      const savedPreference = await themeStorage.getThemePreference();
      setThemePreference(savedPreference);
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    // Apply theme based on preference
    if (themePreference === 'system') {
      setColorScheme(systemColorScheme || 'light');
    } else {
      setColorScheme(themePreference as ColorScheme);
    }
  }, [themePreference, systemColorScheme]);

  const handleSetThemePreference = async (preference: ThemePreference) => {
    await themeStorage.saveThemePreference(preference);
    setThemePreference(preference);
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        themePreference,
        setThemePreference: handleSetThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
