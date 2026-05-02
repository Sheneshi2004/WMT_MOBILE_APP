import { useColorScheme } from './use-color-scheme';
import { COLORS } from '../constants/colors';

/**
 * Hook to get theme-aware colors.
 * Returns colors based on current theme (light/dark mode).
 */
export function useThemeColor() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    // Background Colors
    background: isDark ? COLORS.background : COLORS.white,
    surface: isDark ? COLORS.surface : COLORS.surface,
    card: isDark ? COLORS.card : COLORS.white,
    
    // Text Colors
    text: isDark ? COLORS.text : COLORS.text,
    textLight: isDark ? COLORS.textLight : COLORS.textLight,
    textDark: isDark ? COLORS.textDark : COLORS.textDark,
    
    // Brand Colors (same for both themes)
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    
    // Status Colors
    success: COLORS.success,
    error: COLORS.error,
    warning: COLORS.warning,
    info: COLORS.info,
    
    // UI Colors
    border: isDark ? COLORS.border : '#E5E5E5',
    white: COLORS.white,
    black: COLORS.black,
    
    // Helper function to get specific color
    getColor: (colorName) => {
      const colorMap = {
        background: isDark ? COLORS.background : COLORS.white,
        surface: isDark ? COLORS.surface : COLORS.surface,
        text: isDark ? COLORS.text : COLORS.text,
        textLight: isDark ? COLORS.textLight : COLORS.textLight,
        primary: COLORS.primary,
        success: COLORS.success,
        error: COLORS.error,
        warning: COLORS.warning,
        border: isDark ? COLORS.border : '#E5E5E5',
      };
      return colorMap[colorName] || COLORS.primary;
    },
  };
}