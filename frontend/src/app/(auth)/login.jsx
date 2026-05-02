import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await login(email, password);
      if (response.success) {
        const userRole = response.data.role;
        if (userRole === 'admin') {
          router.replace('/(admin)');
        } else {
          router.replace('/(resident)');
        }
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
             <MaterialCommunityIcons name="office-building" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>HostelHub</Text>
          <Text style={styles.subtitle}>Hostel Management System</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.instructionText}>Sign in to continue managing your stay</Text>

          <View style={styles.inputWrapper}>
             <MaterialCommunityIcons name="email-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
             <TextInput
               style={styles.input}
               placeholder="Email Address"
               placeholderTextColor={COLORS.textLight}
               value={email}
               onChangeText={setEmail}
               keyboardType="email-address"
               autoCapitalize="none"
             />
          </View>

          <View style={styles.inputWrapper}>
             <MaterialCommunityIcons name="lock-outline" size={20} color={COLORS.textLight} style={styles.inputIcon} />
             <TextInput
               style={[styles.input, { flex: 1 }]}
               placeholder="Password"
               placeholderTextColor={COLORS.textLight}
               value={password}
               onChangeText={setPassword}
               secureTextEntry={!showPassword}
             />
             <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
               <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textLight} />
             </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginButton}>
            {loading ? <ActivityIndicator color={COLORS.textDark} /> : <Text style={styles.loginButtonText}>SIGN IN</Text>}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
             <View style={styles.dividerLine} />
             <Text style={styles.dividerText}>OR</Text>
             <View style={styles.dividerLine} />
          </View>

          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.linkItem} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerText}>New resident? </Text>
              <Text style={styles.linkText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={() => router.push('/(auth)/visit')}>
              <Text style={styles.footerText}>Scheduling a visit? </Text>
              <Text style={styles.linkText}>Click here</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkItem} onPress={() => router.push('/(auth)/rooms')}>
              <Text style={styles.footerText}>Guest browsing? </Text>
              <Text style={styles.linkText}>View Rooms</Text>
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
  header: { 
    height: 320, 
    backgroundColor: COLORS.surface, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 40
  },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: COLORS.glass },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 6, letterSpacing: 2, textTransform: 'uppercase' },
  
  form: { paddingHorizontal: 30 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  instructionText: { fontSize: 14, color: COLORS.textLight, marginBottom: 35 },
  
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 60
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },
  eyeBtn: { padding: 4 },
  
  loginButton: { backgroundColor: COLORS.primary, borderRadius: 16, height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 15, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  loginButtonText: { color: COLORS.textDark, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 35 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 15, color: COLORS.textLight, fontSize: 12, fontWeight: 'bold' },
  
  footerLinks: { gap: 15 },
  linkItem: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: COLORS.textLight, fontSize: 14 },
  linkText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },
});