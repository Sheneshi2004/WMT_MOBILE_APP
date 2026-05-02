import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { Searchbar, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { roomService } from '../../services/roomService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';

export default function RoomsScreen() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ roomNumber: '', roomType: 'Single', capacity: '', pricePerMonth: '', description: '', facilities: [], status: 'available', images: [] });

  const roomTypes = ['Single', 'Double', 'Triple', 'Shared'];
  const statusFilters = ['all', 'available', 'occupied', 'maintenance', 'reserved'];
  const facilitiesList = ['AC', 'WiFi', 'Attached Bathroom', 'Balcony', 'Study Table', 'Water Heater'];

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      const sortedRooms = (response.data.data || []).sort((a, b) =>
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
      );
      setRooms(sortedRooms);
    }
    catch (error) { Alert.alert('Error', 'Failed to fetch rooms'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchRooms(); };
  const resetForm = () => { setFormData({ roomNumber: '', roomType: 'Single', capacity: '', pricePerMonth: '', description: '', facilities: [], status: 'available', images: [] }); setEditingRoom(null); };
  const toggleFacility = (f) => setFormData(prev => ({ ...prev, facilities: prev.facilities.includes(f) ? prev.facilities.filter(x => x !== f) : [...prev.facilities, f] }));

  const pickImage = async () => {
    const remaining = 5 - formData.images.length;
    if (remaining <= 0) {
      Alert.alert('Limit Reached', 'You can only add up to 5 photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets
        .filter(asset => asset.base64)
        .map(asset => `data:image/jpeg;base64,${asset.base64}`);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages].slice(0, 5) }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.roomNumber || !formData.capacity || !formData.pricePerMonth) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Clean up formData for submission
      const submissionData = { ...formData };

      // If editing, remove immutable/internal fields
      if (editingRoom) {
        delete submissionData._id;
        delete submissionData.__v;
        delete submissionData.createdAt;
        delete submissionData.updatedAt;
      }

      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, submissionData);
      } else {
        await roomService.createRoom(submissionData);
      }

      Alert.alert('Success', editingRoom ? 'Room updated' : 'Room created');
      setModalVisible(false);
      resetForm();
      fetchRooms();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this room?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await roomService.deleteRoom(id);
            Alert.alert('Success', 'Room deleted');
            fetchRooms();
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete room');
          }
        }
      }
    ]);
  };

  const handleStatus = async (id, status) => {
    try {
      await roomService.updateRoomStatus(id, status);
      fetchRooms();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const RoomCard = ({ room }) => (
    <Card style={styles.roomCard}>
      {room.images && room.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomImageScroll}>
          {room.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.roomImage} />
          ))}
        </ScrollView>
      )}
      <View style={styles.cardHeader}><Text style={styles.roomNumber}>Room {room.roomNumber}</Text><View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[room.status] }]}><Text style={styles.statusText}>{room.status}</Text></View></View>
      <Text style={styles.roomDetail}>Type: {room.roomType}</Text><Text style={styles.roomDetail}>Capacity: {room.capacity}</Text>
      <Text style={styles.roomPrice}>LKR {room.pricePerMonth}/month</Text>

      {room.description ? <Text style={styles.roomDescription}>{room.description}</Text> : null}

      {room.facilities && room.facilities.length > 0 && (
        <View style={styles.facilitiesContainer}>
          {room.facilities.map((facility, index) => (
            <View key={index} style={styles.facilityBadge}><Text style={styles.facilityText}>{facility}</Text></View>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <Button title="Edit" onPress={() => { setEditingRoom(room); setFormData({ ...room, capacity: room.capacity.toString(), pricePerMonth: room.pricePerMonth.toString(), status: room.status || 'available', images: room.images || [] }); setModalVisible(true); }} size="small" style={styles.editBtn} />
        <Button title="Delete" onPress={() => handleDelete(room._id)} variant="danger" size="small" style={styles.deleteBtn} />
      </View>
      <View style={styles.statusButtons}>
        <TouchableOpacity onPress={() => handleStatus(room._id, 'available')} style={[styles.sBtn, { backgroundColor: COLORS.success }]}><Text style={styles.sBtnText}>Available</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatus(room._id, 'occupied')} style={[styles.sBtn, { backgroundColor: COLORS.error }]}><Text style={styles.sBtnText}>Occupied</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatus(room._id, 'maintenance')} style={[styles.sBtn, { backgroundColor: COLORS.warning }]}><Text style={styles.sBtnText}>Maintenance</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => handleStatus(room._id, 'reserved')} style={[styles.sBtn, { backgroundColor: COLORS.primary }]}><Text style={styles.sBtnText}>Reserved</Text></TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = rooms.filter(r => (statusFilter === 'all' || r.status === statusFilter) && (!searchQuery || r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}><Text style={styles.headerTitle}>Room Management</Text><Button title="+ Add" onPress={() => { resetForm(); setModalVisible(true); }} size="small" /></View>
      <Searchbar placeholder="Search..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} inputStyle={{ color: COLORS.text }} />
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
      <FlatList data={filtered} renderItem={({ item }) => <RoomCard room={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}><ScrollView>
            <Text style={styles.modalTitle}>{editingRoom ? 'Edit Room' : 'Add Room'}</Text>
            <TextInput
              label="Room Number *"
              value={formData.roomNumber}
              onChangeText={t => setFormData({ ...formData, roomNumber: t.toUpperCase() })}
              mode="outlined"
              style={styles.input}
              textColor={COLORS.text}
              editable={true}
              theme={{ colors: { primary: COLORS.primary, background: COLORS.surface } }}
            />
            <Text style={styles.label}>Room Type</Text>
            <ScrollView horizontal>{roomTypes.map(t => (<Chip key={t} selected={formData.roomType === t} onPress={() => setFormData({ ...formData, roomType: t })} style={styles.chip}>{t}</Chip>))}</ScrollView>
            <TextInput label="Capacity *" value={formData.capacity} onChangeText={t => setFormData({ ...formData, capacity: t })} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Price *" value={formData.pricePerMonth} onChangeText={t => setFormData({ ...formData, pricePerMonth: t })} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Description" value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} multiline mode="outlined" style={[styles.input, styles.textArea]} />

            <Text style={styles.label}>Facilities</Text>
            <ScrollView horizontal>{facilitiesList.map(f => (<Chip key={f} selected={formData.facilities.includes(f)} onPress={() => toggleFacility(f)} style={styles.chip}>{f}</Chip>))}</ScrollView>

            <Text style={styles.label}>Status</Text>
            <ScrollView horizontal style={styles.chipContainer}>
              {['available', 'occupied', 'maintenance', 'reserved'].map(s => (
                <Chip key={s} selected={formData.status === s} onPress={() => setFormData({ ...formData, status: s })} style={styles.chip}>{s.charAt(0).toUpperCase() + s.slice(1)}</Chip>
              ))}
            </ScrollView>

            <View style={styles.imageHeader}>
              <Text style={styles.label}>Photos ({formData.images.length}/5)</Text>
              <Button title="+ Add Photo" onPress={pickImage} size="small" disabled={formData.images.length >= 5} />
            </View>
            <ScrollView horizontal style={styles.imageScroll}>
              {formData.images.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: img }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>X</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" /><Button title={editingRoom ? 'Update' : 'Create'} onPress={handleSubmit} loading={submitting} /></View>
          </ScrollView></View>
        </KeyboardAvoidingView>
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
  list: { padding: 12 },
  roomCard: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  roomDetail: { fontSize: 14, color: COLORS.textLight },
  roomPrice: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  actionButtons: { flexDirection: 'row', marginTop: 12, gap: 8 },
  editBtn: { flex: 1 },
  deleteBtn: { flex: 1 },
  statusButtons: { flexDirection: 'row', marginTop: 8, gap: 8 },
  sBtn: { flex: 1, padding: 6, borderRadius: 6, alignItems: 'center' },
  sBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  roomImageScroll: { marginBottom: 12 },
  roomImage: { width: 120, height: 80, borderRadius: 8, marginRight: 8, backgroundColor: COLORS.border },
  roomDescription: { fontSize: 14, color: COLORS.text, marginTop: 8, fontStyle: 'italic' },
  facilitiesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  facilityBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  facilityText: { fontSize: 12, color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
  modalContent: { backgroundColor: COLORS.surface, margin: 20, borderRadius: 12, maxHeight: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text, marginTop: 8 },
  textArea: { height: 80 },
  chip: { marginRight: 8, marginBottom: 8 },
  chipContainer: { marginBottom: 12 },
  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  imageScroll: { marginBottom: 16 },
  imagePreviewContainer: { position: 'relative', marginRight: 12 },
  imagePreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: COLORS.border },
  removeImageBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: COLORS.error, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  removeImageText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});