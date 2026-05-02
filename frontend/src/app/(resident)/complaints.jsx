import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { complaintService } from '../../services/complaintService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';

export default function ComplaintsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(params.new === 'true');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ 
    title: params.title || '', 
    description: '', 
    category: params.category || 'maintenance', 
    priority: 'medium' 
  });

  const categories = [
    { id: 'maintenance', name: 'Maintenance', icon: '🔧' },
    { id: 'electricity', name: 'Electricity', icon: '⚡' },
    { id: 'water', name: 'Water', icon: '💧' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'cleanliness', name: 'Cleanliness', icon: '🧹' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'other', name: 'Other', icon: '📌' },
  ];
  const priorities = [
    { id: 'low', name: 'Low', color: COLORS.success },
    { id: 'medium', name: 'Medium', color: COLORS.warning },
    { id: 'high', name: 'High', color: COLORS.error },
    { id: 'urgent', name: 'Urgent', color: COLORS.error },
  ];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      setResident(residentData);
      if (residentData) {
        const res = await complaintService.getComplaintsByResident(residentData._id);
        setComplaints(res.data.data || []);
      }
    } catch (error) { Alert.alert('Error', 'Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };
  const resetForm = () => { setFormData({ title: '', description: '', category: 'maintenance', priority: 'medium' }); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) { Alert.alert('Error', 'Fill all fields'); return; }
    setSubmitting(true);
    try { await complaintService.createComplaint({ residentId: resident._id, ...formData }); Alert.alert('Success', 'Complaint submitted'); setModalVisible(false); resetForm(); fetchData(); } 
    catch (error) { Alert.alert('Error', 'Submission failed'); } 
    finally { setSubmitting(false); }
  };

  const handleRate = async (id, rating) => {
    try { await complaintService.rateComplaint(id, rating, 'Thanks'); fetchData(); Alert.alert('Thank you', 'Rating submitted'); } 
    catch (error) { Alert.alert('Error', 'Rating failed'); }
  };

  const ComplaintCard = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}><Text style={styles.title}>{item.title}</Text><View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}><Text style={styles.statusText}>{item.status?.replace('_', ' ')}</Text></View></View>
      <Text style={styles.desc}>{item.description}</Text>
      <View style={styles.meta}><Text style={styles.metaText}>📁 {item.category}</Text><Text style={[styles.metaText, { color: item.priority === 'high' || item.priority === 'urgent' ? COLORS.error : COLORS.warning }]}>⚠️ {item.priority}</Text></View>
      <Text style={styles.date}>Submitted: {new Date(item.createdAt).toLocaleDateString()}</Text>
      {item.resolution && <Text style={styles.resolution}>✅ Resolution: {item.resolution}</Text>}
      {item.status === 'resolved' && !item.rating && (
        <View style={styles.ratingRow}>{[1,2,3,4,5].map(r => (<TouchableOpacity key={r} onPress={() => handleRate(item._id, r)} style={styles.star}><Text style={styles.starText}>★</Text></TouchableOpacity>))}<Text style={styles.rateLabel}>Rate resolution</Text></View>
      )}
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
            <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Complaints</Text>
        </View>
        <Button title="+ New" onPress={() => { resetForm(); setModalVisible(true); }} size="small" variant="secondary" style={{ backgroundColor: COLORS.white, borderWidth: 0 }} textStyle={{ color: COLORS.primary }} />
      </View>
      <FlatList data={complaints} renderItem={({ item }) => <ComplaintCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No complaints</Text></View>)} />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}><ScrollView>
            <Text style={styles.modalTitle}>Submit Complaint</Text>
            <TextInput label="Title *" value={formData.title} onChangeText={t => setFormData({ ...formData, title: t })} mode="outlined" style={styles.input} />
            <Text style={styles.label}>Category</Text><ScrollView horizontal>{categories.map(c => (<Chip key={c.id} selected={formData.category === c.id} onPress={() => setFormData({ ...formData, category: c.id })} style={styles.chip}>{c.icon} {c.name}</Chip>))}</ScrollView>
            <Text style={styles.label}>Priority</Text><ScrollView horizontal>{priorities.map(p => (<Chip key={p.id} selected={formData.priority === p.id} onPress={() => setFormData({ ...formData, priority: p.id })} style={[styles.chip, { backgroundColor: formData.priority === p.id ? p.color : COLORS.surface }]}><Text style={{ color: formData.priority === p.id ? COLORS.white : COLORS.text }}>{p.name}</Text></Chip>))}</ScrollView>
            <TextInput label="Description *" value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })} multiline numberOfLines={4} mode="outlined" style={[styles.input, styles.textArea]} />
            <View style={styles.modalButtons}><Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" /><Button title="Submit" onPress={handleSubmit} loading={submitting} /></View>
          </ScrollView></View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' }, list: { padding: 12 },
  card: { marginBottom: 12, padding: 16 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 }, statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' }, desc: { fontSize: 14, color: COLORS.textLight, marginBottom: 8 },
  meta: { flexDirection: 'row', gap: 12, marginBottom: 4 }, metaText: { fontSize: 12, color: COLORS.textDark },
  date: { fontSize: 12, color: COLORS.textDark, marginBottom: 8 }, resolution: { fontSize: 12, color: COLORS.success, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 }, star: { marginRight: 8 }, starText: { fontSize: 20, color: COLORS.warning },
  rateLabel: { fontSize: 12, color: COLORS.textLight, marginLeft: 8 }, empty: { alignItems: 'center', padding: 40 }, emptyText: { color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 12, width: '85%', maxHeight: '85%', padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: COLORS.primary }, input: { marginBottom: 12, backgroundColor: COLORS.card },
  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text }, textArea: { minHeight: 80 }, chip: { marginRight: 8, marginBottom: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
});