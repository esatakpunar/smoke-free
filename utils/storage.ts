import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  quitDate: number;
  cigarettesPerDay: number;
  cigarettesPerPack: number;
  packPrice: number;
  smokeTime: number;
  isFirstTime: boolean;
}

const STORAGE_KEY = '@user_data';

export const storage = {
  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsedData = JSON.parse(data);
        if (typeof parsedData.quitDate === 'string') {
          parsedData.quitDate = new Date(parsedData.quitDate).getTime();
        }
        console.log('Storage - Retrieved Data:', parsedData);
        return parsedData;
      }
      console.log('Storage - No data found.');
      return null;
    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  },

  async saveUserData(data: UserData): Promise<void> {
    try {
      console.log('Storage - Saving Data:', data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Storage - Data Saved Successfully.');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  async resetUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting user data:', error);
    }
  }
}; 