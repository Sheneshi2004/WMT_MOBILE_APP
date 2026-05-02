import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert, StatusBar, Dimensions, ScrollView } from 'react-native';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { attendanceService } from '../../services/attendanceService';
import { residentService } from '../../services/residentService';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AttendanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      setResident(residentData);
      if (residentData) {
        const res = await attendanceService.getAttendanceByResident(residentData._id);
        const data = res.data.data || [];
        setAttendance(data);
        setStats({
          total: data.length, 
          present: data.filter(a => a.status === 'present').length,
          absent: data.filter(a => a.status === 'absent').length, 
          late: data.filter(a => a.status === 'late').length,
        });
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleMarkAttendance = async () => {
    if (!resident) return;
    setMarking(true);
    try {
      const now = new Date();
      // Use a consistent format: HH:MM AM/PM
      const checkInTime = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      
      await attendanceService.markAttendance({
        residentId: resident._id,
        date: now.toISOString(),
        status: 'present',
        checkInTime: checkInTime
      });
      Alert.alert('Success', 'Check-in recorded at ' + checkInTime);
      fetchData();
    } catch (error) {
      console.error('Mark attendance error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Already marked or failed.');
    } finally { setMarking(false); }
  };

  const handleCheckOut = async (recordId) => {
    setMarking(true);
    try {
      const now = new Date();
      const checkOutTime = now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
      await attendanceService.updateAttendance(recordId, { checkOutTime });
      Alert.alert('Success', 'Check-out recorded at ' + checkOutTime);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Check-out failed.');
    } finally { setMarking(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const todayRecords = attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  // Active record is the one that hasn't checked out yet
  const activeRecord = todayRecords.find(a => !a.checkOutTime);
  const isCompleted = todayRecords.length > 0 && !activeRecord;

  const AttendanceItem = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)} style={styles.cardWrapper}>
       <Card style={styles.attendanceCard}>
          <View style={styles.cardHeader}>
             <View>
                <Text style={styles.cardDate}>{new Date(item.date).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                <Text style={styles.cardDay}>{new Date(item.date).toLocaleDateString('default', { weekday: 'long' })}</Text>
             </View>
             <View style={[styles.statusBadge, { backgroundColor: item.verified ? COLORS.success + '20' : COLORS.warning + '20' }]}>
                <Text style={[styles.statusText, { color: item.verified ? COLORS.success : COLORS.warning }]}>
                   {item.verified ? 'VERIFIED' : 'PENDING'}
                </Text>
             </View>
          </View>

          <View style={styles.timeGrid}>
             <View style={styles.timeCol}>
                <MaterialCommunityIcons name="login-variant" size={18} color={COLORS.primary} />
                <View>
                   <Text style={styles.timeLabel}>CHECK IN</Text>
                   <Text style={styles.timeValue}>{item.checkInTime || '--:--'}</Text>
                </View>
             </View>
             <View style={styles.timeDivider} />
             <View style={styles.timeCol}>
                <MaterialCommunityIcons name="logout-variant" size={18} color={COLORS.error} />
                <View>
                   <Text style={styles.timeLabel}>CHECK OUT</Text>
                   <Text style={styles.timeValue}>{item.checkOutTime || '--:--'}</Text>
                </View>
             </View>
          </View>
       </Card>
    </Animated.View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View entering={FadeInUp.duration(600)} style={styles.actionContainer}>
           <Card style={styles.actionCard}>
              <View style={styles.actionHeader}>
                 <View>
                    <Text style={styles.todayText}>TODAY'S STATUS</Text>
                    <Text style={styles.currentDate}>{new Date().toLocaleDateString('default', { day: 'numeric', month: 'long' })}</Text>
                 </View>
                 <MaterialCommunityIcons name="calendar-clock" size={32} color={COLORS.primary} />
              </View>

              <View style={styles.buttonRow}>
                 {!activeRecord ? (
                   <TouchableOpacity style={[styles.mainBtn, { backgroundColor: COLORS.primary }]} onPress={handleMarkAttendance} disabled={marking}>
                      <MaterialCommunityIcons name="login" size={24} color="#000" />
                      <Text style={styles.mainBtnText}>{todayRecords.length > 0 ? 'NEW CHECK IN' : 'CHECK IN'}</Text>
                   </TouchableOpacity>
                 ) : (
                   <TouchableOpacity style={[styles.mainBtn, { backgroundColor: COLORS.error }]} onPress={() => handleCheckOut(activeRecord._id)} disabled={marking}>
                      <MaterialCommunityIcons name="logout" size={24} color="#FFF" />
                      <Text style={[styles.mainBtnText, { color: '#FFF' }]}>CHECK OUT</Text>
                   </TouchableOpacity>
                 )}
              </View>
           </Card>
        </Animated.View>

        <View style={styles.content}>
           <Text style={styles.sectionTitle}>Recent Logs</Text>
           {attendance.length > 0 ? (
             attendance.map((item, index) => <AttendanceItem key={item._id} item={item} index={index} />)
           ) : (
             <View style={styles.empty}>
                <MaterialCommunityIcons name="calendar-blank" size={60} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No attendance records yet.</Text>
             </View>
           )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  backBtn: { padding: 4 },

  actionContainer: { padding: 20 },
  actionCard: { backgroundColor: COLORS.surface, borderRadius: 30, padding: 24, borderWidth: 1, borderColor: COLORS.border, elevation: 4 },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  todayText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textLight, letterSpacing: 1.5 },
  currentDate: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 4 },
  
  buttonRow: { marginTop: 10 },
  mainBtn: { height: 64, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, elevation: 2 },
  mainBtnText: { fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  completedBox: { height: 64, borderRadius: 20, backgroundColor: COLORS.success + '15', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.success + '30' },
  completedText: { color: COLORS.success, fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

  content: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  cardWrapper: { marginBottom: 15 },
  attendanceCard: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardDate: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  cardDay: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 9, fontWeight: 'bold' },

  timeGrid: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  timeCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  timeLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.textLight, letterSpacing: 0.5 },
  timeValue: { fontSize: 15, fontWeight: 'bold', color: COLORS.text, marginTop: 2 },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: COLORS.textLight, marginTop: 15 },
});