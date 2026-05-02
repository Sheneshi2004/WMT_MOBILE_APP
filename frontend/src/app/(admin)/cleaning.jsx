import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Alert, Modal, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Searchbar, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { cleaningService } from '../../services/cleaningService';
import { roomService } from '../../services/roomService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, STATUS_COLORS } from '../../constants/colors';

export default function CleaningScreen() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    roomId: '',
    cleanerName: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    taskType: 'Daily Sweep',
    remarks: ''
  });

  const statuses = ['pending', 'in_progress', 'completed'];
  const taskTypes = ['Daily Sweep', 'Mop', 'Bathroom', 'Deep Clean', 'Trash Removal'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, roomsRes] = await Promise.all([
        cleaningService.getAllTasks(),
        roomService.getAllRooms()
      ]);
      setTasks(tasksRes.data.data || []);
      
      const sortedRooms = (roomsRes.data.data || []).sort((a, b) => 
        a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
      );
      setRooms(sortedRooms);
    } catch (error) { console.error('Error loading data', error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleCreateOrUpdateTask = async () => {
    if (!formData.roomId || !formData.cleanerName || !formData.date || !formData.time) {
      Alert.alert('Error', 'Please fill all required fields (Room, Cleaner, Date, and Time)');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTask) {
        await cleaningService.updateTask(editingTask._id, formData);
        Alert.alert('Success', 'Cleaning task updated');
      } else {
        await cleaningService.createTask(formData);
        Alert.alert('Success', 'Cleaning task created');
      }
      setModalVisible(false);
      setEditingTask(null);
      setFormData({ roomId: '', cleanerName: '', date: new Date().toISOString().split('T')[0], time: '10:00 AM', taskType: 'Daily Sweep', remarks: '' });
      fetchData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await cleaningService.updateTaskStatus(id, status);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleEdit = (item) => {
    setEditingTask(item);
    setFormData({
      roomId: item.roomId?._id || item.roomId,
      cleanerName: item.cleanerName,
      date: item.date.split('T')[0],
      time: item.time,
      taskType: item.taskType,
      remarks: item.remarks || ''
    });
    setModalVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this task?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await cleaningService.deleteTask(id);
          fetchData();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete task');
        }
      }}
    ]);
  };

  const CleaningCard = ({ item }) => {
    const itemRoomId = (item.roomId?._id || item.roomId)?.toString();
    const room = rooms.find(r => r._id.toString() === itemRoomId);
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomText}>Room {room?.roomNumber || 'Unknown'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.warning }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.taskType}>🧼 {item.taskType} - {new Date(item.date).toLocaleDateString()} at {item.time}</Text>
        <Text style={styles.cleaner}>Cleaner: {item.cleanerName}</Text>
        {item.remarks ? <Text style={styles.remarks}>Notes: {item.remarks}</Text> : null}
        <View style={styles.actionButtons}>
          <View style={styles.statusButtonGroup}>
            <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'pending')} style={[styles.statusBtn, item.status === 'pending' && styles.statusBtnActive, { borderColor: STATUS_COLORS.pending || COLORS.warning }]}>
              <Text style={[styles.statusBtnText, item.status === 'pending' && styles.statusBtnTextActive]}>PENDING</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'in_progress')} style={[styles.statusBtn, item.status === 'in_progress' && styles.statusBtnActive, { borderColor: COLORS.info || '#2196F3' }]}>
              <Text style={[styles.statusBtnText, item.status === 'in_progress' && styles.statusBtnTextActive]}>IN PROCESS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleUpdateStatus(item._id, 'completed')} style={[styles.statusBtn, item.status === 'completed' && styles.statusBtnActive, { borderColor: COLORS.success }]}>
              <Text style={[styles.statusBtnText, item.status === 'completed' && styles.statusBtnTextActive]}>COMPLETE</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginLeft: 12 }}>
            {item.cleanerName !== 'TBD (Requested)' ? (
              <>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtnSmall}>
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.trashBtn}>
                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedText}>🔒 Resident Request</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = tasks.filter(t => {
    const cleanerName = t.cleanerName || '';
    return (statusFilter === 'all' || t.status === statusFilter) &&
           (!searchQuery || cleanerName.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Cleaning Tasks</Text>
        <Button title="+ Add Task" onPress={() => setModalVisible(true)} size="small" />
      </View>
      <Searchbar placeholder="Search by cleaner..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} inputStyle={{ color: COLORS.text }} backgroundColor={COLORS.surface} />
      <View style={styles.mainFilterRow}>
        <TouchableOpacity onPress={() => setStatusFilter('all')} style={[styles.mainFilterBtn, statusFilter === 'all' && styles.mainFilterBtnActive]}>
          <Text style={[styles.mainFilterText, statusFilter === 'all' && styles.mainFilterTextActive]}>ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter('pending')} style={[styles.mainFilterBtn, statusFilter === 'pending' && styles.mainFilterBtnActive, { borderColor: STATUS_COLORS.pending || COLORS.warning }]}>
          <Text style={[styles.mainFilterText, statusFilter === 'pending' && styles.mainFilterTextActive]}>PENDING</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter('in_progress')} style={[styles.mainFilterBtn, statusFilter === 'in_progress' && styles.mainFilterBtnActive, { borderColor: COLORS.info || '#2196F3' }]}>
          <Text style={[styles.mainFilterText, statusFilter === 'in_progress' && styles.mainFilterTextActive]}>IN PROCESS</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStatusFilter('completed')} style={[styles.mainFilterBtn, statusFilter === 'completed' && styles.mainFilterBtnActive, { borderColor: COLORS.success }]}>
          <Text style={[styles.mainFilterText, statusFilter === 'completed' && styles.mainFilterTextActive]}>COMPLETE</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} renderItem={({ item }) => <CleaningCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No cleaning tasks</Text></View>)} />
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Assign Cleaning Task</Text>
              <Text style={styles.label}>Select Room</Text>
              <ScrollView horizontal style={styles.horizontalScroll}>
                {rooms.map(r => (
                  <Chip 
                    key={r._id} 
                    selected={formData.roomId === r._id} 
                    onPress={() => setFormData({...formData, roomId: r._id})} 
                    style={styles.chipItem}
                  >
                    Room {r.roomNumber}
                  </Chip>
                ))}
              </ScrollView>
              <Text style={styles.label}>Task Type</Text>
              <ScrollView horizontal style={styles.horizontalScroll}>
                {taskTypes.map(t => (
                  <Chip key={t} selected={formData.taskType === t} onPress={() => setFormData({...formData, taskType: t})} style={styles.chipItem}>{t}</Chip>
                ))}
              </ScrollView>
              <TextInput label="Cleaner Name *" value={formData.cleanerName} onChangeText={t => setFormData({...formData, cleanerName: t})} mode="outlined" style={styles.input} />
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput label="Date *" value={formData.date} editable={false} mode="outlined" style={styles.input} right={<TextInput.Icon icon="calendar" />} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(formData.date)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={onDateChange}
                />
              )}
              <TextInput label="Time (e.g. 10:00 AM)" value={formData.time} onChangeText={t => setFormData({...formData, time: t})} mode="outlined" style={styles.input} />
              <TextInput label="Remarks (Optional)" value={formData.remarks} onChangeText={t => setFormData({...formData, remarks: t})} mode="outlined" multiline style={styles.input} />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setModalVisible(false); setEditingTask(null); }} variant="secondary" />
                <Button title={editingTask ? "Update Task" : "Assign Task"} onPress={handleCreateOrUpdateTask} loading={submitting} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold' },
  searchBar: { margin: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 },
  mainFilterRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 6, marginBottom: 16 },
  mainFilterBtn: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, elevation: 2 },
  mainFilterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  mainFilterText: { fontSize: 9, fontWeight: 'bold', color: COLORS.textLight },
  mainFilterTextActive: { color: COLORS.white },
  chip: { marginRight: 8, backgroundColor: COLORS.surface },
  list: { padding: 12 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomText: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  taskType: { fontSize: 15, color: COLORS.text, marginBottom: 4 },
  cleaner: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },
  remarks: { fontSize: 12, color: COLORS.textLight, marginTop: 6, fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  statusButtonGroup: { flex: 1, flexDirection: 'row', gap: 4 },
  statusBtn: { flex: 1, height: 32, borderWidth: 1, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  statusBtnActive: { backgroundColor: COLORS.primary },
  statusBtnText: { fontSize: 9, fontWeight: 'bold', color: COLORS.textLight },
  statusBtnTextActive: { color: COLORS.white },
  editBtnSmall: { padding: 6, backgroundColor: COLORS.info + '10', borderRadius: 6 },
  trashBtn: { padding: 6, backgroundColor: COLORS.error + '10', borderRadius: 6 },
  lockedBadge: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lockedText: { fontSize: 10, color: COLORS.textLight, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 16, maxHeight: '85%', width: '90%', padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text, marginTop: 8 },
  horizontalScroll: { marginBottom: 12 },
  chipItem: { marginRight: 8, marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
});