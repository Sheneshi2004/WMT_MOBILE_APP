import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const FormTextField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  touched,
  required = false,
  multiline = false,
  numberOfLines = 1,
  icon,
}) => {
  const showError = touched && error;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputContainer, showError && styles.inputError]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  required: { color: COLORS.error },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, backgroundColor: COLORS.surface },
  input: { flex: 1, padding: 12, fontSize: 16, color: COLORS.text },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: COLORS.error },
  icon: { fontSize: 18, marginLeft: 12, color: COLORS.textLight },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
});