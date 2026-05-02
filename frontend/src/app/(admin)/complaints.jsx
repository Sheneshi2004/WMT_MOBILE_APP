import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { ActivityIndicator, TextInput, Searchbar } from 'react-native-paper';
import { complaintService } from '../../services/complaintService';
import { residentService } from '../../services/residentService';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

export default function AdminComplaintsScreen() {
  const [complaints, setComplaints] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0 });

  const statusFilters = ['all', 'pending', 'in_progress', 'resolved', 'rejected'];

  useEffect(() => { fetchData(); fetchStats(); }, []);

  const fetchData = async () => {
    try {
      const [compRes, resRes] = await Promise.all([complaintService.getAllComplaints(), residentService.getAll()]);
      setComplaints(compRes.data.data || []);
      setResidents(resRes.data.data || []);
    } catch (error) { Alert.alert('Error', 'Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await complaintService.getStatistics();
      setStats(res.data.data || { total: 0, pending: 0, in_progress: 0, resolved: 0 });
    } catch (error) { console.error(error); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); fetchStats(); };

  const getResidentName = (id) => residents.find(r => r._id === id)?.name || 'Unknown Resident';

  const handleUpdateStatus = async (id, status) => {
    setSubmitting(true);
    try {
      await complaintService.updateStatus(id, status, 'Admin');
      Alert.alert('Updated', `Complaint moved to ${status.replace('_', ' ')}`);
      fetchData(); fetchStats();
    } catch (error) { Alert.alert('Error', 'Failed to update'); }
    finally { setSubmitting(false); }
  };

  const handleResolve = async () => {
    if (!resolution) { Alert.alert('Error', 'Please describe how you resolved this.'); return; }
    setSubmitting(true);
    try {
      await complaintService.resolveComplaint(selectedComplaint._id, resolution);
      Alert.alert('Resolved', 'Thank you! The resident will be notified.');
      setResolveModalVisible(false);
      setResolution('');
      setSelectedComplaint(null);
      fetchData(); fetchStats();
    } catch (error) { Alert.alert('Error', 'Failed to resolve'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Permanent Delete', 'Are you sure you want to remove this record?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await complaintService.deleteComplaint(id); fetchData(); fetchStats(); } }
    ]);
  };

  const ActionButton = ({ title, icon, color, onPress, loading }) => (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.actionBtn, { backgroundColor: color }]}
      disabled={loading}
    >
      {loading ? <ActivityIndicator size={12} color="#FFF" /> : <MaterialCommunityIcons name={icon} size={16} color="#FFF" />}
      <Text style={styles.actionBtnText}>{title}</Text>
    </TouchableOpacity>
  );

  const ComplaintCard = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)} style={styles.cardWrapper}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
           <View>
             <Text style={styles.compNum}>#{item.complaintNumber}</Text>
             <Text style={styles.compTitle}>{item.title}</Text>
           </View>
           <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status?.toUpperCase().replace('_', ' ')}</Text>
           </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.metaBox}>
           <View style={styles.metaItem}><MaterialCommunityIcons name="account" size={14} color={COLORS.textLight} /><Text style={styles.metaLabel}>{getResidentName(item.residentId)}</Text></View>
           <View style={styles.metaItem}><MaterialCommunityIcons name="tag-outline" size={14} color={COLORS.textLight} /><Text style={styles.metaLabel}>{item.category}</Text></View>
           <View style={styles.metaItem}><MaterialCommunityIcons name="alert-circle-outline" size={14} color={item.priority === 'high' ? COLORS.error : COLORS.warning} /><Text style={[styles.metaLabel, { color: item.priority === 'high' ? COLORS.error : COLORS.warning }]}>{item.priority.toUpperCase()}</Text></View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
           <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
           
           <View style={styles.actionsRow}>
              {item.status === 'pending' && (
                <>
                  <ActionButton title="START" icon="play" color={COLORS.info} onPress={() => handleUpdateStatus(item._id, 'in_progress')} loading={submitting} />
                  <ActionButton title="REJECT" icon="close-circle" color={COLORS.error} onPress={() => handleUpdateStatus(item._id, 'rejected')} loading={submitting} />
                </>
              )}
              {item.status === 'in_progress' && (
                <>
                  <ActionButton title="RESOLVE" icon="check-all" color={COLORS.success} onPress={() => { setSelectedComplaint(item); setResolveModalVisible(true); }} loading={submitting} />
                  <ActionButton title="REJECT" icon="close-circle" color={COLORS.error} onPress={() => handleUpdateStatus(item._id, 'rejected')} loading={submitting} />
                </>
              )}
              {(item.status === 'resolved' || item.status === 'rejected') && (
                <ActionButton title="DELETE" icon="trash-can" color={COLORS.textLight} onPress={() => handleDelete(item._id)} loading={submitting} />
              )}
           </View>
        </View>
      </Card>
    </Animated.View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = complaints.filter(c => {
    const resName = getResidentName(c.residentId).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !searchQuery || 
      c.title.toLowerCase().includes(query) || 
      c.complaintNumber?.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      resName.includes(query);
    
    return matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Complaints</Text>
          <Text style={styles.screenSubtitle}>Resolution Control</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
            {[
              { lab: 'Total', val: stats.total, col: COLORS.primary, icon: 'clipboard-list' },
              { lab: 'Pending', val: stats.pending, col: COLORS.warning, icon: 'clock-outline' },
              { lab: 'Progress', val: stats.in_progress, col: COLORS.info, icon: 'progress-wrench' },
              { lab: 'Resolved', val: stats.resolved, col: COLORS.success, icon: 'check-decagram' }
            ].map((s, i) => (
              <Animated.View key={s.lab} entering={ZoomIn.delay(i * 100)}>
                <View style={[styles.statBox, { borderLeftColor: s.col }]}>
                  <MaterialCommunityIcons name={s.icon} size={20} color={s.col} />
                  <View>
                    <Text style={styles.statVal}>{s.val}</Text>
                    <Text style={styles.statLab}>{s.lab.toUpperCase()}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
         </ScrollView>
      </View>

      <Searchbar 
        placeholder="Search title, number, name or category..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        style={styles.searchBar} 
        inputStyle={{ color: COLORS.text, fontSize: 14 }} 
        backgroundColor={COLORS.surface} 
      />
      
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {statusFilters.map(s => (
            <TouchableOpacity 
              key={s} 
              onPress={() => setStatusFilter(s)}
              style={[styles.filterChip, statusFilter === s && styles.activeFilter]}
            >
              <Text style={[styles.filterText, statusFilter === s && styles.activeFilterText]}>
                {s.toUpperCase().replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={filtered} 
        renderItem={({ item, index }) => <ComplaintCard item={item} index={index} />} 
        keyExtractor={item => item._id} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} 
        contentContainerStyle={styles.list} 
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No complaints found here.</Text>
          </View>
        )} 
      />

      {/* Resolve Modal */}
      <Modal visible={resolveModalVisible} transparent animationType="fade" onRequestClose={() => setResolveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Complaint</Text>
            <Text style={styles.modalSubtitle}>Describe how you solved this issue for #{selectedComplaint?.complaintNumber}</Text>
            <TextInput 
              label="Resolution Action *" 
              value={resolution} 
              onChangeText={setResolution} 
              mode="outlined" 
              multiline 
              numberOfLines={4} 
              style={styles.textArea} 
              textColor={COLORS.text} 
              theme={{ colors: { primary: COLORS.primary, outline: COLORS.border } }} 
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setResolveModalVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleResolve}>
                {submitting ? <ActivityIndicator size={16} color="#000" /> : <Text style={styles.confirmText}>RESOLVE NOW</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text },
  screenSubtitle: { fontSize: 10, color: COLORS.textLight, letterSpacing: 2, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 4 },
  refreshBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },

  statsContainer: { marginVertical: 15 },
  statsScroll: { paddingHorizontal: 24, gap: 12 },
  statBox: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 4, elevation: 2, minWidth: 120 },
  statVal: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statLab: { fontSize: 8, color: COLORS.textLight, fontWeight: 'bold' },

  searchBar: { marginHorizontal: 24, borderRadius: 15, elevation: 2, borderWidth: 1, borderColor: COLORS.border },
  
  filterSection: { marginVertical: 15 },
  filterContent: { paddingHorizontal: 24, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeFilter: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 10, fontWeight: 'bold', color: COLORS.text },
  activeFilterText: { color: '#000' },

  list: { paddingHorizontal: 24, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  compNum: { fontSize: 11, color: COLORS.primary, fontWeight: 'bold' },
  compTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 9, fontWeight: 'bold' },
  description: { fontSize: 14, color: COLORS.textLight, lineHeight: 20, marginBottom: 15 },
  
  metaBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaLabel: { fontSize: 12, color: COLORS.text, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 12, color: COLORS.textLight },
  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, elevation: 2 },
  actionBtnText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 15 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, borderRadius: 28, width: '90%', padding: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  textArea: { minHeight: 120, marginBottom: 20, backgroundColor: COLORS.surface },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelText: { color: COLORS.textLight, fontWeight: 'bold' },
  modalConfirm: { flex: 1, height: 54, backgroundColor: COLORS.primary, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  confirmText: { color: '#000', fontWeight: 'bold' },
});