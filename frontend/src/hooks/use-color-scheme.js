import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Returns the user's current color scheme preference (light or dark).
 * This hook uses React Native's built-in useColorScheme.
 */
export function useColorScheme() {
  return useRNColorScheme();
}