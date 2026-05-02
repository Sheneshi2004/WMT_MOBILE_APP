import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Card = ({ children, onPress, style }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});