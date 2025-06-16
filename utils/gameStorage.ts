import AsyncStorage from '@react-native-async-storage/async-storage';

const HIGHSCORE_KEY = '@game_highscore';

export const gameStorage = {
  async getHighScore(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(HIGHSCORE_KEY);
      if (value !== null) {
        return parseInt(value);
      }
      return 0;
    } catch (error) {
      console.error('Error reading high score:', error);
      return 0;
    }
  },

  async saveHighScore(score: number): Promise<void> {
    try {
      await AsyncStorage.setItem(HIGHSCORE_KEY, score.toString());
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  }
};
