import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from 'react-native';
import { ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { visitorService } from '../../services/visitorService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function VisitorRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', email: '', preferredRoomType: 'Any', preferredVisitDate: '', message: '' });

  const roomTypes = ['Single', 'Double', 'Triple', 'Shared', 'Any'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      setResident(residentData);
      const res = await visitorService.getAllRequests();
      const userRequests = res.data.data.filter(r => r.email === user?.email);
      setRequests(userRequests);
    } catch (error) { Alert.alert('Error', 'Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };
  const resetForm = () => { setFormData({ fullName: '', phoneNumber: '', email: '', preferredRoomType: 'Any', preferredVisitDate: '', message: '' }); };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, preferredVisitDate: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.preferredVisitDate) { Alert.alert('Error', 'Fill all fields'); return; }
    
    // Phone number validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      Alert.alert('Validation Error', 'Phone number must be exactly 10 digits');
      return;
    }

    setSubmitting(true);
    try { await visitorService.submitRequest(formData); Alert.alert('Success', 'Request submitted'); setModalVisible(false); resetForm(); fetchData(); }
    catch (error) { Alert.alert('Error', 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  const RequestCard = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.fullName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.detail}>📞 {item.phoneNumber}</Text>
      <Text style={styles.detail}>✉️ {item.email}</Text>
      <Text style={styles.detail}>🏠 {item.preferredRoomType}</Text>
      <Text style={styles.detail}>📅 {new Date(item.preferredVisitDate).toLocaleDateString()}</Text>
      {item.assignedRoomNumber && <Text style={styles.roomInfo}>🚪 Assigned: Room {item.assignedRoomNumber}</Text>}
      {item.gatePassNumber && <Text style={styles.gatePass}>🎫 Gate Pass: {item.gatePassNumber}</Text>}
      {item.status === 'approved' && <Text style={styles.schedule}>⏰ Scheduled: {item.scheduledTime}</Text>}
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
            <Text style={{ fontSize: 24, color: COLORS.primary, fontWeight: 'bold' }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitor Requests</Text>
        </View>
        <Button title="+ New Request" onPress={() => { resetForm(); setModalVisible(true); }} size="small" />
      </View>
      <FlatList data={requests} renderItem={({ item }) => <RequestCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No requests</Text></View>)} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}><ScrollView>
            <Text style={styles.modalTitle}>Submit Visitor Request</Text>
            <TextInput label="Full Name *" value={formData.fullName} onChangeText={t => setFormData({ ...formData, fullName: t })} mode="outlined" style={styles.input} />
            <TextInput label="Phone Number *" value={formData.phoneNumber} onChangeText={t => setFormData({ ...formData, phoneNumber: t })} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Email *" value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            <Text style={styles.label}>Preferred Room Type</Text>
            <ScrollView horizontal style={{ marginBottom: 12 }}>
              {roomTypes.map(t => (<Chip key={t} selected={formData.preferredRoomType === t} onPress={() => setFormData({ ...formData, preferredRoomType: t })} style={styles.chip}>{t}</Chip>))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <TextInput label="Preferred Visit Date *" value={formData.preferredVisitDate} mode="outlined" style={styles.input} editable={false} right={<TextInput.Icon icon="calendar" />} />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.preferredVisitDate ? new Date(formData.preferredVisitDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            <TextInput label="Message (Optional)" value={formData.message} onChangeText={t => setFormData({ ...formData, message: t })} multiline numberOfLines={3} mode="outlined" style={styles.input} />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" />
              <Button title="Submit" onPress={handleSubmit} loading={submitting} />
            </View>
          </ScrollView></View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  list: { padding: 12 },
  card: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  detail: { fontSize: 14, color: COLORS.textLight, marginBottom: 2 },
  roomInfo: { color: COLORS.primary, marginTop: 4 },
  gatePass: { color: COLORS.success, marginTop: 4, fontWeight: 'bold' },
  schedule: { color: COLORS.info, marginTop: 4 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 12, width: '85%', maxHeight: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  chip: { marginRight: 8, marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});