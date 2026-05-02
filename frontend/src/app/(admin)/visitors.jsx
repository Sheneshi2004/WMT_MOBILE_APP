import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, RefreshControl, Alert, TouchableOpacity, Modal, StyleSheet, Linking } from 'react-native';
import { ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { visitorService } from '../../services/visitorService';
import { roomService } from '../../services/roomService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';

export default function VisitorsScreen() {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusFilters = ['pending', 'approved', 'completed', 'rejected'];

  useEffect(() => { fetchData(); fetchRooms(); }, []);

  const fetchData = async () => {
    try { const res = await visitorService.getAllRequests(); setRequests(res.data.data || []); } 
    catch (error) { Alert.alert('Error', 'Failed to load'); } 
    finally { setLoading(false); setRefreshing(false); }
  };
  const fetchRooms = async () => { try { const res = await roomService.getAllRooms(); setRooms(res.data.data); } catch (error) {} };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleApprove = async () => {
    if (!selectedRoom) { Alert.alert('Error', 'Select a room'); return; }
    setSubmitting(true);
    try { await visitorService.approveRequest(selected._id, { assignedRoomId: selectedRoom }); Alert.alert('Success', 'Approved'); setModalVisible(false); setSelected(null); setSelectedRoom(''); fetchData(); }
    catch (error) { Alert.alert('Error', 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleReject = async (id) => {
    Alert.alert('Confirm', 'Reject this request?', [
      { text: 'Cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => { 
          try {
            await visitorService.rejectRequest(id, {}); 
            fetchData(); 
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
          }
        } 
      }
    ]);
  };

  const handleCompleted = async (id) => {
    Alert.alert('Confirm', 'Mark this visit as Completed?', [
      { text: 'Cancel' },
      { text: 'Completed', onPress: async () => { 
          try {
            await visitorService.checkIn(id, { securityGuardName: 'Admin' }); 
            fetchData(); 
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to complete request');
          }
        } 
      }
    ]);
  };

  const handleContact = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCheckOut = async (id) => {
    Alert.alert('Confirm', 'Check-out visitor?', [
      { text: 'Cancel' },
      { text: 'Check-out', onPress: async () => { 
          try {
            await visitorService.checkOut(id); 
            fetchData(); 
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check out visitor');
          }
        } 
      }
    ]);
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this record permanently?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { 
          try {
            await visitorService.deleteRequest(id); 
            fetchData(); 
          } catch (error) {
            Alert.alert('Error', 'Failed to delete record');
          }
        } 
      }
    ]);
  };

  const VisitorCard = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.fullName}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.primary }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.detail}>📞 {item.phoneNumber}</Text>
      <Text style={styles.detail}>✉️ {item.email}</Text>
      <Text style={styles.detail}>🏠 {item.preferredRoomType}</Text>
      <Text style={styles.detail}>📅 {new Date(item.preferredVisitDate).toLocaleDateString()}</Text>
      {item.assignedRoomNumber && <Text style={styles.roomInfo}>🚪 Assigned: Room {item.assignedRoomNumber}</Text>}
      {item.gatePassNumber && <Text style={styles.gatePass}>🎫 Gate Pass: {item.gatePassNumber}</Text>}
      
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.info }]} onPress={() => handleContact(item.phoneNumber)}>
           <Text style={styles.actionBtnText}>📞 Contact</Text>
        </TouchableOpacity>

        {item.status === 'pending' && (
          <>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success }]} onPress={() => { setSelected(item); setModalVisible(true); }}>
               <Text style={styles.actionBtnText}>✓ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error }]} onPress={() => handleReject(item._id)}>
               <Text style={styles.actionBtnText}>✕ Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {item.status === 'approved' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={() => handleCompleted(item._id)}>
             <Text style={styles.actionBtnText}>✅ Completed</Text>
          </TouchableOpacity>
        )}

        {item.status === 'completed' && !item.checkOutTime && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.textLight }]} onPress={() => handleCheckOut(item._id)}>
             <Text style={styles.actionBtnText}>🚪 Check Out</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error, minWidth: '100%' }]} onPress={() => handleDelete(item._id)}>
           <Text style={styles.actionBtnText}>🗑 Delete Record</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = requests.filter(r => statusFilter === 'all' || r.status === statusFilter);

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}><Text style={styles.headerTitle}>Visitor Requests</Text></View>
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
      <FlatList data={filtered} renderItem={({ item }) => <VisitorCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={styles.list} />

      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Approve Visit</Text>
          <Text style={styles.label}>Select Room:</Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {rooms.filter(r => r.status === 'available').map(r => (<Chip key={r._id} selected={selectedRoom === r._id} onPress={() => setSelectedRoom(r._id)} style={styles.roomChip}>Room {r.roomNumber} ({r.roomType}) - LKR {r.pricePerMonth}</Chip>))}
          </ScrollView>
          <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" /><Button title="Approve" onPress={handleApprove} loading={submitting} /></View>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  filterScrollConfig: { height: 50, marginVertical: 8 },
  filterContent: { paddingHorizontal: 12, alignItems: 'center' },
  filterChip: { marginRight: 8, backgroundColor: COLORS.surface, height: 36, justifyContent: 'center' },
  list: { padding: 12 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  detail: { fontSize: 14, color: COLORS.textLight, marginBottom: 2 },
  roomInfo: { color: COLORS.primary, marginTop: 4 },
  gatePass: { color: COLORS.success, marginTop: 4, fontWeight: 'bold' },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexGrow: 1, minWidth: '45%', elevation: 1 },
  actionBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 12, width: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  roomChip: { marginBottom: 8, padding: 4 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});