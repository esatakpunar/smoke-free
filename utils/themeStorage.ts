import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_PREFERENCE_KEY = '@theme_preference';

export const themeStorage = {
  getThemePreference: async (): Promise<ThemePreference> => {
    try {
      const value = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      return (value as ThemePreference) || 'system';
    } catch (error) {
      console.error('Error getting theme preference:', error);
      return 'system';
    }
  },
  
  saveThemePreference: async (preference: ThemePreference): Promise<void> => {
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }
};
