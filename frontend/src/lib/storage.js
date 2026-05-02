import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Save data
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  // Get data
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  // Remove data
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Clear all data (logout)
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // Save token specifically
  setToken: (token) => storage.setItem('token', token),
  
  // Get token
  getToken: () => storage.getItem('token'),
  
  // Save user
  setUser: (user) => storage.setItem('user', user),
  
  // Get user
  getUser: () => storage.getItem('user'),
};