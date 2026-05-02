import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Searchbar, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { residentService } from '../../services/residentService';
import { roomService } from '../../services/roomService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';

export default function ResidentsScreen() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', nic: '', course: '', year: '1', guardianName: '', guardianPhone: '', permanentAddress: '', pincode: '', bloodGroup: '' });

  const statusFilters = ['all', 'active', 'inactive', 'blocked', 'left'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const years = ['1', '2', '3', '4', '5'];

  useEffect(() => { fetchResidents(); fetchRooms(); }, []);

  const fetchResidents = async () => {
    try { const res = await residentService.getAll(); setResidents(res.data.data); } catch (error) { Alert.alert('Error', 'Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  };
  const fetchRooms = async () => { 
    try { 
      const res = await roomService.getAllRooms(); 
      const sortedRooms = (res.data.data || []).sort((a, b) => 
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
      );
      setRooms(sortedRooms); 
    } catch (error) { } 
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResidents();
    fetchRooms();
  };

  const resetForm = () => { setFormData({ name: '', email: '', phone: '', nic: '', course: '', year: '1', guardianName: '', guardianPhone: '', permanentAddress: '', pincode: '', bloodGroup: '' }); setSelected(null); };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.nic || !formData.course || !formData.guardianName || !formData.guardianPhone) {
      Alert.alert('Error', 'Fill all required fields'); return;
    }

    // Phone number validation (exactly 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      Alert.alert('Validation Error', 'Resident phone number must be exactly 10 digits');
      return;
    }
    if (!phoneRegex.test(formData.guardianPhone)) {
      Alert.alert('Validation Error', 'Guardian phone number must be exactly 10 digits');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...formData, year: parseInt(formData.year) };
      if (!payload.bloodGroup) delete payload.bloodGroup;
      if (!payload.permanentAddress) delete payload.permanentAddress;
      if (!payload.pincode) delete payload.pincode;

      if (selected) {
        await residentService.update(selected._id, payload);
        Alert.alert('Success', 'Updated');
      }
      setModalVisible(false); resetForm(); fetchResidents();
    } catch (error) { Alert.alert('Error', error.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleAssign = async () => {
    if (!selectedRoom) { Alert.alert('Error', 'Select a room'); return; }
    setSubmitting(true);
    try { 
      await residentService.assignRoom(selected._id, selectedRoom); 
      Alert.alert('Success', 'Room assigned'); 
      setAssignModal(false); 
      setSelectedRoom(null); 
      setSelected(null); 
      fetchResidents(); 
      fetchRooms();
    }
    catch (error) { 
      console.error(error.response?.data || error);
      Alert.alert('Error', error.response?.data?.message || 'Assignment failed. This room might have just become full.'); 
    }
    finally { setSubmitting(false); }
  };

  const handleStatus = async () => {
    if (!selectedStatus) return;
    setSubmitting(true);
    try { await residentService.updateStatus(selected._id, selectedStatus); Alert.alert('Success', `Status: ${selectedStatus}`); setStatusModal(false); setSelectedStatus(''); setSelected(null); fetchResidents(); }
    catch (error) { Alert.alert('Error', 'Status update failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (id) => { Alert.alert('Confirm', 'Delete?', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await residentService.delete(id); fetchResidents(); } }]); };

  const ResidentCard = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}><Text style={styles.name}>{item.name}</Text><View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}><Text style={styles.badgeText}>{item.status}</Text></View></View>
      <Text style={styles.detail}>📧 {item.email}</Text><Text style={styles.detail}>📞 {item.phone}</Text><Text style={styles.detail}>🪪 {item.nic}</Text><Text style={styles.detail}>📚 {item.course} - Year {item.year}</Text>
      {item.roomId ? <Text style={styles.roomInfo}>🚪 Room: {item.roomId.roomNumber || item.roomId}</Text> : <Text style={styles.noRoom}>🚪 No room</Text>}
      <View style={styles.actions}>
        <Button title="Edit" onPress={() => { setSelected(item); setFormData({ ...item, year: item.year?.toString() || '1' }); setModalVisible(true); }} size="small" />
        <Button title="Assign" onPress={() => { setSelected(item); setAssignModal(true); }} size="small" variant="secondary" />
        <Button title="Status" onPress={() => { setSelected(item); setStatusModal(true); }} size="small" variant="secondary" />
        <Button title="Delete" onPress={() => handleDelete(item._id)} variant="danger" size="small" />
      </View>
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filteredResidents = residents.filter(r => 
    (statusFilter === 'all' || r.status === statusFilter) &&
    (!searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.roomId?.roomNumber && r.roomId.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}><Text style={styles.headerTitle}>Resident Management</Text></View>
      <Searchbar placeholder="Search name, email, NIC or room..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} />
      <View style={styles.filterScrollConfig}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: s }) => (
            <Chip selected={statusFilter === s} onPress={() => setStatusFilter(s)} style={styles.filterChip}>{s.toUpperCase()}</Chip>
          )}
        />
      </View>
      <FlatList data={filteredResidents} renderItem={({ item }) => <ResidentCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.list} />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}><ScrollView>
            <Text style={styles.modalTitle}>Edit Resident</Text>
            <TextInput label="Name *" value={formData.name} onChangeText={t => setFormData({ ...formData, name: t })} mode="outlined" style={styles.input} />
            <TextInput label="Email *" value={formData.email} onChangeText={t => setFormData({ ...formData, email: t })} mode="outlined" keyboardType="email-address" style={styles.input} />
            <TextInput label="Phone *" value={formData.phone} onChangeText={t => setFormData({ ...formData, phone: t })} mode="outlined" keyboardType="phone-pad" style={styles.input} />
            <TextInput label="NIC *" value={formData.nic} onChangeText={t => setFormData({ ...formData, nic: t })} mode="outlined" style={styles.input} />
            <TextInput label="Course *" value={formData.course} onChangeText={t => setFormData({ ...formData, course: t })} mode="outlined" style={styles.input} />
            <Text style={styles.label}>Year</Text><ScrollView horizontal>{years.map(y => (<Chip key={y} selected={formData.year === y} onPress={() => setFormData({ ...formData, year: y })} style={styles.chip}>Year {y}</Chip>))}</ScrollView>
            <TextInput label="Guardian Name *" value={formData.guardianName} onChangeText={t => setFormData({ ...formData, guardianName: t })} mode="outlined" style={styles.input} />
            <TextInput label="Guardian Phone *" value={formData.guardianPhone} onChangeText={t => setFormData({ ...formData, guardianPhone: t })} mode="outlined" style={styles.input} />
            <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" /><Button title="Update" onPress={handleSubmit} loading={submitting} /></View>
          </ScrollView></View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Assign Room Modal */}
      <Modal visible={assignModal} transparent onRequestClose={() => setAssignModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalSmall}>
          <Text style={styles.modalTitle}>Select Room</Text>
          <ScrollView>
            {rooms.map(r => {
              const isFull = (r.currentOccupancy || 0) >= r.capacity;
              return (
                <Chip 
                  key={r._id} 
                  selected={selectedRoom === r._id} 
                  onPress={() => !isFull && setSelectedRoom(r._id)} 
                  disabled={isFull && selectedRoom !== r._id}
                  style={[
                    styles.roomChip, 
                    selectedRoom === r._id && { backgroundColor: COLORS.primary + '30' },
                    isFull && { opacity: 0.6 }
                  ]}
                  selectedColor={COLORS.primary}
                >
                  Room {r.roomNumber} ({r.roomType}) - {r.currentOccupancy}/{r.capacity} {isFull ? '(FULL)' : 'Occupied'}
                </Chip>
              );
            })}
          </ScrollView>
          <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setAssignModal(false)} variant="secondary" /><Button title="Assign" onPress={handleAssign} loading={submitting} /></View>
        </View></View>
      </Modal>

      {/* Status Modal */}
      <Modal visible={statusModal} transparent onRequestClose={() => setStatusModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalSmall}>
          <Text style={styles.modalTitle}>Update Status</Text>
          {['active', 'inactive', 'blocked', 'left'].map(s => (<Chip key={s} selected={selectedStatus === s} onPress={() => setSelectedStatus(s)} style={styles.statusChip}>{s.toUpperCase()}</Chip>))}
          <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setStatusModal(false)} variant="secondary" /><Button title="Update" onPress={handleStatus} loading={submitting} /></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  searchBar: { margin: 12, backgroundColor: COLORS.surface },
  filterScrollConfig: { height: 50, marginBottom: 8 },
  filterContent: { paddingHorizontal: 12, alignItems: 'center' },
  filterChip: { marginRight: 8, backgroundColor: COLORS.surface, height: 36, justifyContent: 'center' },
  chip: { marginRight: 8, marginBottom: 8, backgroundColor: COLORS.surface },
  list: { padding: 12 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  detail: { fontSize: 14, color: COLORS.textLight, marginBottom: 2 },
  roomInfo: { color: COLORS.primary, marginTop: 8 },
  noRoom: { color: COLORS.warning, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 12, maxHeight: '85%', width: '90%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalSmall: { backgroundColor: COLORS.surface, borderRadius: 12, width: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  roomChip: { marginBottom: 8, padding: 4 },
  statusChip: { marginBottom: 8, padding: 4 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});