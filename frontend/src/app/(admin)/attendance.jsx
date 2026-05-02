import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Alert, TouchableOpacity, StatusBar, Dimensions, Modal, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Searchbar, ActivityIndicator, TextInput, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { attendanceService } from '../../services/attendanceService';
import { residentService } from '../../services/residentService';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AdminAttendanceScreen() {
  const router = useRouter();
  const [attendance, setAttendance] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, pending: 0, total: 0 });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editTimes, setEditTimes] = useState({ checkInTime: '', checkOutTime: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const [attRes, resRes] = await Promise.all([
        attendanceService.getAllAttendance(), // Get all to filter locally or use byDate
        residentService.getAll()
      ]);
      
      const allAttendance = attRes.data.data || [];
      const activeResidents = (resRes.data.data || []).filter(r => r.status === 'active');
      
      setAttendance(allAttendance);
      setResidents(activeResidents);

      // Calculate Stats for selected date
      const todayLogs = allAttendance.filter(a => new Date(a.date).toDateString() === selectedDate.toDateString());
      setStats({
        total: activeResidents.length,
        present: todayLogs.filter(a => a.status === 'present').length,
        absent: todayLogs.filter(a => a.status === 'absent').length,
        pending: activeResidents.length - todayLogs.filter(a => a.verified).length
      });

    } catch (error) { console.error('Failed to load data', error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleAttendanceAction = async (recordId, action) => {
    try {
      setSubmitting(true);
      if (action === 'delete') {
        await attendanceService.deleteAttendance(recordId);
        Alert.alert('Success', 'Attendance record deleted.');
      } else {
        const updateData = { 
          verified: true,
          status: action === 'verify' ? 'present' : 'absent'
        };
        await attendanceService.updateAttendance(recordId, updateData);
        Alert.alert('Success', `Attendance ${action === 'verify' ? 'verified' : 'rejected'}.`);
      }
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to perform action.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toLocaleDateString();

  const getTodayRecord = (residentId) => {
    return attendance.find(a => (a.residentId?._id === residentId || a.residentId === residentId) && new Date(a.date).toDateString() === selectedDate.toDateString());
  };

  const AttendanceRecordCard = ({ record, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <Card style={styles.residentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{record.residentId?.name?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{record.residentId?.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons 
                name="circle" 
                size={8} 
                color={!record.verified ? COLORS.warning : (record.status === 'present' ? COLORS.success : COLORS.error)} 
              />
              <Text style={styles.statusText}>
                {!record.verified ? 'PENDING' : (record.status === 'present' ? 'APPROVED' : 'REJECTED')}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleAttendanceAction(record._id, 'delete')} style={styles.deleteIconBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.logBody}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>CHECK IN</Text>
            <Text style={styles.timeVal}>{record.checkInTime || '--:--'}</Text>
          </View>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>CHECK OUT</Text>
            <Text style={styles.timeVal}>{record.checkOutTime || '--:--'}</Text>
          </View>
        </View>

        {!record.verified && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.smallRejectBtn} onPress={() => handleAttendanceAction(record._id, 'reject')}>
              <Text style={styles.smallRejectBtnText}>REJECT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallVerifyBtn} onPress={() => handleAttendanceAction(record._id, 'verify')}>
              <Text style={styles.smallVerifyBtnText}>VERIFY</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </Animated.View>
  );

  const AbsentResidentCard = ({ resident, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
       <Card style={styles.residentCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: COLORS.textLight + '15' }]}>
              <Text style={[styles.avatarText, { color: COLORS.textLight }]}>{resident.name?.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{resident.name}</Text>
              <Text style={styles.room}>Not marked today</Text>
            </View>
          </View>
          <View style={styles.notMarkedBox}>
             <MaterialCommunityIcons name="clock-alert-outline" size={18} color={COLORS.textLight} />
             <Text style={styles.notMarkedText}>NO ATTENDANCE LOGGED TODAY</Text>
          </View>
       </Card>
    </Animated.View>
  );

  const filteredAttendance = attendance.filter(a => {
    const matchesSearch = a.residentId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = new Date(a.date).toDateString() === selectedDate.toDateString();
    
    if (filter === 'all') return matchesSearch && matchesDate;
    if (filter === 'pending') return matchesSearch && matchesDate && !a.verified;
    if (filter === 'approved') return matchesSearch && matchesDate && a.verified && a.status === 'present';
    if (filter === 'rejected') return matchesSearch && matchesDate && a.verified && a.status === 'absent';
    
    return false;
  });

  const absentResidents = residents.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const hasRecord = attendance.some(a => (a.residentId?._id === r._id || a.residentId === r._id) && new Date(a.date).toDateString() === selectedDate.toDateString());
    return matchesSearch && !hasRecord;
  });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Advanced Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Attendance</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
            <MaterialCommunityIcons name="calendar-month" size={18} color={COLORS.primary} />
            <Text style={styles.dateText}>{selectedDate.toDateString() === new Date().toDateString() ? 'Today' : selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <MaterialCommunityIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats Dashboard */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {[
            { label: 'Total', value: stats.total, icon: 'account-group', color: COLORS.primary },
            { label: 'Approved', value: stats.present, icon: 'account-check', color: COLORS.success },
            { label: 'Rejected', value: stats.absent, icon: 'account-remove', color: COLORS.error },
            { label: 'To Verify', value: stats.pending, icon: 'shield-alert', color: COLORS.warning }
          ].map((s, i) => (
            <View key={s.label} style={[styles.statCard, { borderLeftColor: s.color }]}>
              <MaterialCommunityIcons name={s.icon} size={20} color={s.color} />
              <View>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <Searchbar 
        placeholder="Search resident..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        style={styles.searchBar} 
        inputStyle={{ color: COLORS.text, fontSize: 14 }} 
        backgroundColor={COLORS.surface} 
      />

      <View style={styles.tabBar}>
        {['pending', 'approved', 'rejected'].map(t => (
          <TouchableOpacity key={t} onPress={() => setFilter(t)} style={[styles.tab, filter === t && styles.activeTab]}>
            <Text style={[styles.tabText, filter === t && styles.activeTabText]}>
              {t === 'pending' ? 'TO VERIFY' : t === 'approved' ? 'APPROVED' : 'REJECTED'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList 
        data={filteredAttendance} 
        renderItem={({ item, index }) => <AttendanceRecordCard record={item} index={index} />} 
        keyExtractor={item => item._id} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} 
        contentContainerStyle={styles.list} 
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-search" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No records found for this date.</Text>
          </View>
        )} 
      />

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
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
  
  searchBar: { margin: 20, borderRadius: 15, borderWeight: 1, borderColor: COLORS.border, elevation: 2 },
  
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 15 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 10, fontWeight: 'bold', color: COLORS.text },
  activeTabText: { color: '#000' },

  list: { padding: 20, paddingBottom: 100 },
  cardWrapper: { marginBottom: 15 },
  logCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, elevation: 3 },
  header: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitle: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, letterSpacing: -0.5 },
  dateSelector: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateText: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  
  statsContainer: { backgroundColor: COLORS.surface, paddingBottom: 20 },
  statsScroll: { paddingHorizontal: 25, gap: 12 },
  statCard: { backgroundColor: COLORS.background, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 130, borderLeftWidth: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 9, color: COLORS.textLight, fontWeight: 'bold', letterSpacing: 1 },

  searchBar: { marginHorizontal: 25, marginTop: 10, borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: COLORS.border, height: 50 },
  
  tabBar: { flexDirection: 'row', marginHorizontal: 25, marginTop: 20, backgroundColor: COLORS.background, borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tabText: { fontSize: 11, fontWeight: 'bold', color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },

  list: { padding: 25, paddingBottom: 100 },
  residentCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', gap: 15, alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  name: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  room: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  
  logBody: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', gap: 20 },
  timeBlock: { flex: 1 },
  timeLabel: { fontSize: 9, color: COLORS.textLight, fontWeight: 'bold', letterSpacing: 0.5 },
  timeVal: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: 9, fontWeight: 'bold' },

  statusText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textLight },
  deleteIconBtn: { padding: 5 },
  
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 15 },
  smallVerifyBtn: { flex: 1, height: 40, backgroundColor: COLORS.success + '15', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.success + '30' },
  smallVerifyBtnText: { color: COLORS.success, fontWeight: 'bold', fontSize: 11 },
  smallRejectBtn: { flex: 1, height: 40, backgroundColor: COLORS.error + '15', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.error + '30' },
  smallRejectBtnText: { color: COLORS.error, fontWeight: 'bold', fontSize: 11 },

  autoVerifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.success + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  autoVerifiedText: { fontSize: 10, fontWeight: 'bold', color: COLORS.success, letterSpacing: 0.5 },

  notMarkedBox: { paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  notMarkedInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notMarkedText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textLight },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 15, fontSize: 14 },
});