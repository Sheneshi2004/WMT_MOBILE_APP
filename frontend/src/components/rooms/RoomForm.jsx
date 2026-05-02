import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Modal, Portal, Chip, TextInput } from 'react-native-paper';
import { Button } from '../common/Button';
import { COLORS } from '../../constants/colors';

export const RoomForm = ({ visible, onClose, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    roomNumber: initialData?.roomNumber || '',
    roomType: initialData?.roomType || 'Single',
    capacity: initialData?.capacity?.toString() || '',
    pricePerMonth: initialData?.pricePerMonth?.toString() || '',
    description: initialData?.description || '',
    facilities: initialData?.facilities || [],
  });

  const roomTypes = ['Single', 'Double', 'Triple', 'Shared'];
  const facilitiesList = ['AC', 'WiFi', 'Attached Bathroom', 'Balcony', 'Study Table', 'Water Heater'];

  const toggleFacility = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility) ? prev.facilities.filter(f => f !== facility) : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = () => {
    if (!formData.roomNumber || !formData.capacity || !formData.pricePerMonth) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit({ ...formData, capacity: parseInt(formData.capacity), pricePerMonth: parseInt(formData.pricePerMonth) });
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modal}>
        <ScrollView>
          <Text style={styles.title}>{initialData ? 'Edit Room' : 'Add New Room'}</Text>

          <TextInput label="Room Number *" value={formData.roomNumber} onChangeText={(t) => setFormData({ ...formData, roomNumber: t.toUpperCase() })} mode="outlined" style={styles.input} textColor={COLORS.text} theme={{ colors: { primary: COLORS.primary, background: COLORS.surface } }} editable={!initialData} />

          <Text style={styles.label}>Room Type *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {roomTypes.map((type) => (<Chip key={type} selected={formData.roomType === type} onPress={() => setFormData({ ...formData, roomType: type })} style={styles.chip}>{type}</Chip>))}
          </ScrollView>

          <TextInput label="Capacity *" value={formData.capacity} onChangeText={(t) => setFormData({ ...formData, capacity: t })} keyboardType="numeric" mode="outlined" style={styles.input} />
          <TextInput label="Price per Month (LKR) *" value={formData.pricePerMonth} onChangeText={(t) => setFormData({ ...formData, pricePerMonth: t })} keyboardType="numeric" mode="outlined" style={styles.input} />
          <TextInput label="Description" value={formData.description} onChangeText={(t) => setFormData({ ...formData, description: t })} multiline numberOfLines={3} mode="outlined" style={styles.input} />

          <Text style={styles.label}>Facilities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {facilitiesList.map((facility) => (<Chip key={facility} selected={formData.facilities.includes(facility)} onPress={() => toggleFacility(facility)} style={styles.chip}>{facility}</Chip>))}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onClose} variant="secondary" style={styles.cancelBtn} />
            <Button title={initialData ? 'Update' : 'Create'} onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
          </View>
        </ScrollView>
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