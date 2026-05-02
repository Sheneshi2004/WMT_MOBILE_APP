import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { visitorService } from '../../services/visitorService';
import { COLORS } from '../../constants/colors';

export default function VisitRequestScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    preferredRoomType: type || 'Any',
    preferredVisitDate: '',
    message: '',
  });

  const roomTypes = ['Single', 'Double', 'Triple', 'Shared', 'Any'];

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, preferredVisitDate: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.preferredVisitDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await visitorService.submitRequest(formData);
      Alert.alert(
        'Request Submitted!',
        'Your visit request has been submitted successfully. We will contact you within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.icon}>📅</Text>
          <Text style={styles.title}>Schedule a Visit</Text>
          <Text style={styles.subtitle}>Fill out the form and we'll contact you</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor={COLORS.textLight} value={formData.fullName} onChangeText={(text) => setFormData({ ...formData, fullName: text })} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput style={styles.input} placeholder="0712345678" placeholderTextColor={COLORS.textLight} value={formData.phoneNumber} onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })} keyboardType="phone-pad" maxLength={10} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor={COLORS.textLight} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Room Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {roomTypes.map((type) => (
                <TouchableOpacity key={type} style={[styles.typeChip, formData.preferredRoomType === type && styles.typeChipActive]} onPress={() => setFormData({ ...formData, preferredRoomType: type })}>
                  <Text style={[styles.typeChipText, formData.preferredRoomType === type && styles.typeChipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Visit Date *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <TextInput style={styles.input} placeholder="Select Preferred Visit Date" placeholderTextColor={COLORS.textLight} value={formData.preferredVisitDate} editable={false} />
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.preferredVisitDate ? new Date(formData.preferredVisitDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Any special requests or questions?" placeholderTextColor={COLORS.textLight} value={formData.message} onChangeText={(text) => setFormData({ ...formData, message: text })} multiline numberOfLines={4} />
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  form: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 14, fontSize: 16, color: COLORS.text },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeScroll: { flexDirection: 'row', marginTop: 4 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.border },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { color: COLORS.text },
  typeChipTextActive: { color: COLORS.white, fontWeight: 'bold' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  backButton: { alignItems: 'center', marginTop: 16 },
  backButtonText: { color: COLORS.textLight, fontSize: 14 },
});