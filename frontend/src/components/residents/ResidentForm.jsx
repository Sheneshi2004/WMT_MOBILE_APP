import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Modal, Portal, Button as PaperButton, Chip, TextInput } from 'react-native-paper';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';

export const ResidentForm = ({ visible, onClose, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    nic: initialData?.nic || '',
    course: initialData?.course || '',
    year: initialData?.year?.toString() || '1',
    bloodGroup: initialData?.bloodGroup || '',
    guardianName: initialData?.guardianName || '',
    guardianPhone: initialData?.guardianPhone || '',
    permanentAddress: initialData?.permanentAddress || '',
    pincode: initialData?.pincode || '',
  });


  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.nic || !formData.course || !formData.guardianName || !formData.guardianPhone) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit({ ...formData, year: parseInt(formData.year) });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <Text style={styles.title}>{initialData ? 'Edit Resident' : 'Add New Resident'}</Text>

            <TextInput label="Full Name *" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} mode="outlined" style={styles.input} textColor={COLORS.text} theme={{ colors: { primary: COLORS.primary, background: COLORS.surface } }} />
            <TextInput label="Email *" value={formData.email} onChangeText={(t) => setFormData({ ...formData, email: t })} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            <TextInput label="Phone Number *" value={formData.phone} onChangeText={(t) => setFormData({ ...formData, phone: t })} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="NIC Number *" value={formData.nic} onChangeText={(t) => setFormData({ ...formData, nic: t })} mode="outlined" style={styles.input} />
            <TextInput label="Course *" value={formData.course} onChangeText={(t) => setFormData({ ...formData, course: t })} mode="outlined" style={styles.input} />

            <Text style={styles.label}>Year *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {years.map((year) => (<Chip key={year} selected={formData.year === year} onPress={() => setFormData({ ...formData, year })} style={styles.chip}>Year {year}</Chip>))}
            </ScrollView>

            <Text style={styles.label}>Blood Group</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {bloodGroups.map((bg) => (<Chip key={bg} selected={formData.bloodGroup === bg} onPress={() => setFormData({ ...formData, bloodGroup: bg })} style={styles.chip}>{bg}</Chip>))}
            </ScrollView>

            <TextInput label="Guardian Name *" value={formData.guardianName} onChangeText={(t) => setFormData({ ...formData, guardianName: t })} mode="outlined" style={styles.input} />
            <TextInput label="Guardian Phone *" value={formData.guardianPhone} onChangeText={(t) => setFormData({ ...formData, guardianPhone: t })} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Permanent Address" value={formData.permanentAddress} onChangeText={(t) => setFormData({ ...formData, permanentAddress: t })} mode="outlined" multiline numberOfLines={2} style={styles.input} />
            <TextInput label="Pincode" value={formData.pincode} onChangeText={(t) => setFormData({ ...formData, pincode: t })} mode="outlined" style={styles.input} />

            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={onClose} variant="secondary" style={styles.cancelBtn} />
              <Button title={initialData ? 'Update' : 'Create'} onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: { backgroundColor: COLORS.surface, margin: 20, borderRadius: 12, maxHeight: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  chipScroll: { flexDirection: 'row', marginBottom: 16 },
  chip: { marginRight: 8, marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  submitBtn: { flex: 1 },
});