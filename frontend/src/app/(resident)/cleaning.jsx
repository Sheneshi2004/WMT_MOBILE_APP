import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform } from 'react-native';
import { ActivityIndicator, TextInput, Chip } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { cleaningService } from '../../services/cleaningService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';

export default function CleaningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    taskType: 'Daily Sweep',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    remarks: ''
  });

  const taskTypes = ['Daily Sweep', 'Mop', 'Bathroom', 'Deep Clean', 'Trash Removal'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      setResident(residentData);
      
      if (residentData?.roomId) {
        const myRoomId = (residentData.roomId?._id || residentData.roomId)?.toString();
        const res = await cleaningService.getTasksByRoom(myRoomId);
        
        // Final strict filtering for privacy - must have valid ID and match exactly
        const roomTasks = (res.data.data || []).filter(task => {
          const taskRoomId = (task.roomId?._id || task.roomId)?.toString();
          return myRoomId && taskRoomId === myRoomId;
        });
        
        setTasks(roomTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load cleaning schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const resetForm = () => {
    setFormData({
      taskType: 'Daily Sweep',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      remarks: ''
    });
    setEditingTask(null);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate.toISOString().split('T')[0] });
    }
  };

  const handleSubmit = async () => {
    if (!resident?.roomId) {
      Alert.alert('Error', 'You are not assigned to a room yet.');
      return;
    }
    setSubmitting(true);
    try {
      const roomId = resident.roomId._id || resident.roomId;
      if (editingTask) {
        await cleaningService.updateTask(editingTask._id, formData);
        Alert.alert('Success', 'Request updated');
      } else {
        await cleaningService.createTask({ roomId, cleanerName: 'TBD (Requested)', ...formData });
        Alert.alert('Success', 'Cleaning requested');
      }
      setModalVisible(false);
      resetForm();
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingTask(item);
    setFormData({ taskType: item.taskType, date: item.date.split('T')[0], time: item.time, remarks: item.remarks || '' });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm', 'Delete this request?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await cleaningService.deleteTask(id); fetchData(); }
        catch (error) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const CleaningCard = ({ item }) => {
    // Ultimate safety check: verify the task belongs to the resident's room
    const myRoomId = (resident?.roomId?._id || resident?.roomId)?.toString();
    const taskRoomId = (item.roomId?._id || item.roomId)?.toString();
    
    if (!myRoomId || !taskRoomId || taskRoomId !== myRoomId) return null;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.taskType}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || COLORS.textLight }]}>
            <Text style={styles.statusText}>{item.status?.replace('_', ' ')}</Text>
          </View>
        </View>
      <Text style={styles.detail}>🧹 Cleaner: {item.cleanerName}</Text>
      <Text style={styles.detail}>📅 Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.detail}>⏰ Time: {item.time}</Text>
      {item.remarks ? <Text style={styles.remarks}>📝 Note: {item.remarks}</Text> : null}
      {item.status?.toLowerCase() === 'pending' && item.cleanerName === 'TBD (Requested)' && (
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
            <Text style={[styles.actionBtnText, { color: COLORS.error }]}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
            <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Cleaning</Text>
        </View>
        <Button title="Confirm" onPress={() => { resetForm(); setModalVisible(true); }} size="small" variant="secondary" style={{ backgroundColor: COLORS.white, borderWidth: 0 }} textStyle={{ color: COLORS.primary }} />
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <CleaningCard item={item} />}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No cleaning scheduled</Text></View>)}
      />
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Confirm Cleaning Request</Text>
              <Text style={styles.label}>Task Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {taskTypes.map(t => (
                  <Chip key={t} selected={formData.taskType === t} onPress={() => setFormData({ ...formData, taskType: t })} style={styles.chip}>{t}</Chip>
                ))}
              </ScrollView>
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
              <TextInput label="Time (HH:MM) *" value={formData.time} onChangeText={t => setFormData({ ...formData, time: t })} mode="outlined" style={styles.input} />
              <TextInput label="Remarks (Optional)" value={formData.remarks} onChangeText={t => setFormData({ ...formData, remarks: t })} multiline numberOfLines={3} mode="outlined" style={[styles.input, styles.textArea]} />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => { setModalVisible(false); resetForm(); }} variant="secondary" />
                <Button title="Confirm" onPress={handleSubmit} loading={submitting} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  list: { padding: 12 },
  card: { marginBottom: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  detail: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  remarks: { fontSize: 13, color: COLORS.textDark, marginTop: 4, fontStyle: 'italic' },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 12, width: '85%', maxHeight: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  textArea: { minHeight: 80 },
  chipScroll: { marginBottom: 12 },
  chip: { marginRight: 8, marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border + '50', paddingTop: 10, gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary },
});