import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);
      if (response.success) {
        Alert.alert('Success', 'Registration successful!');
        router.replace('/(resident)');
      } else {
        Alert.alert('Registration Failed', response.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏨</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register as a resident</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textLight}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textLight}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              placeholderTextColor={COLORS.textLight}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor={COLORS.textLight}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textLight}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.registerButton}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.registerButtonText}>Register</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  logo: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  form: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1 },
  eyeButton: { position: 'absolute', right: 14, top: 14 },
  eyeText: { fontSize: 18, color: COLORS.textLight },
  registerButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  registerButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 20 },
  footerText: { color: COLORS.textLight },
  linkText: { color: COLORS.primary, fontWeight: 'bold' },
});