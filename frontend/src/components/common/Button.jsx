import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Button = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false, 
  variant = 'primary', 
  size = 'medium', 
  style, 
  textStyle 
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.border;
    switch (variant) {
      case 'primary': return COLORS.primary;
      case 'secondary': return COLORS.surface;
      case 'danger': return COLORS.error;
      case 'success': return COLORS.success;
      case 'warning': return COLORS.warning;
      default: return COLORS.primary;
    }
  };

  const getTextColor = () => {
    if (variant === 'secondary') return COLORS.primary;
    if (variant === 'warning') return COLORS.white;
    return COLORS.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return 8;
      case 'large': return 16;
      default: return 12;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 18;
      default: return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(), 
          padding: getPadding(),
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? COLORS.primary : 'transparent'
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
});