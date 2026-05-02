import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { roomService } from '../../services/roomService';
import { residentService } from '../../services/residentService';
import { paymentService } from '../../services/paymentService';
import { visitorService } from '../../services/visitorService';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

export default function OperationsScreen() {
  const [stats, setStats] = useState({ totalRooms: 0, availableRooms: 0, occupiedRooms: 0, totalResidents: 0, pendingVisitors: 0, monthlyRevenue: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [roomsRes, residentsRes, visitorsRes, paymentsRes] = await Promise.all([
        roomService.getStatistics(), residentService.getAll(), visitorService.getStatistics(), paymentService.getStatistics()
      ]);
      setStats({
        totalRooms: roomsRes.data.data?.totalRooms || 0,
        availableRooms: roomsRes.data.data?.availableRooms || 0,
        occupiedRooms: roomsRes.data.data?.occupiedRooms || 0,
        totalResidents: residentsRes.data?.count || 0,
        pendingVisitors: visitorsRes.data.data?.pending || 0,
        monthlyRevenue: paymentsRes.data.data?.totalCollected || 0,
      });
    } catch (error) { console.error(error); }
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  const StatCard = ({ title, value, icon, color }) => (
    <Card style={styles.statCard}><Text style={styles.statIcon}>{icon}</Text><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statTitle}>{title}</Text></Card>
  );

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      <View style={styles.header}><Text style={styles.headerTitle}>Admin Dashboard</Text></View>
      <View style={styles.statsGrid}>
        <StatCard title="Total Rooms" value={stats.totalRooms} icon="🏠" color={COLORS.primary} />
        <StatCard title="Available" value={stats.availableRooms} icon="✅" color={COLORS.success} />
        <StatCard title="Occupied" value={stats.occupiedRooms} icon="👥" color={COLORS.error} />
        <StatCard title="Residents" value={stats.totalResidents} icon="👤" color={COLORS.info} />
        <StatCard title="Pending Visitors" value={stats.pendingVisitors} icon="🚪" color={COLORS.warning} />
        <StatCard title="Revenue" value={`LKR ${stats.monthlyRevenue}`} icon="💰" color={COLORS.success} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, padding: 24, paddingTop: 60, marginBottom: 16 },
  headerTitle: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, justifyContent: 'space-between' },
  statCard: { width: '48%', alignItems: 'center', padding: 12 },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statTitle: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 4 },
});