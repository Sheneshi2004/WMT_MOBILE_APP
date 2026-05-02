import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  numberOfLines = 1,
  required = false,
  editable = true,
  style,
  inputStyle,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;
  const inputSecureTextEntry = isPassword && !showPassword;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, error && styles.inputError, !editable && styles.disabled]}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            !editable && styles.disabledText,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={inputSecureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  disabled: {
    backgroundColor: COLORS.border,
    opacity: 0.7,
  },
  disabledText: {
    color: COLORS.textLight,
  },
  eyeButton: {
    padding: 12,
  },
  eyeText: {
    fontSize: 18,
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});