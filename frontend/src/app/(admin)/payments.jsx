import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { paymentService } from '../../services/paymentService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState(null);

  const statusFilters = ['all', 'pending', 'paid', 'overdue'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [payRes, resRes, statsRes] = await Promise.all([
        paymentService.getAll(),
        residentService.getAll(),
        paymentService.getStatistics()
      ]);
      setPayments(payRes.data.data || []);
      setResidents(resRes.data.data || []);
      setStats(statsRes.data.data || null);
    } catch (error) { Alert.alert('Error', 'Failed to load'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const markAsPaid = async (id) => {
    Alert.alert('Confirm Payment', 'Mark this bill as paid in cash?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Paid', onPress: async () => {
          setSubmitting(true);
          try { await paymentService.markAsPaid(id, { paymentMethod: 'cash' }); fetchData(); } 
          catch (error) { Alert.alert('Error', 'Update failed'); }
          finally { setSubmitting(false); }
        }
      }
    ]);
  };

  const deletePayment = (id) => {
    Alert.alert(
      'Delete Bill?',
      'Are you sure you want to remove this payment record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              await paymentService.delete(id);
              Alert.alert('Success', 'Bill deleted successfully');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const getResidentName = (resident) => resident?.name || 'Unknown Resident';
  const getRoomNum = (room) => room?.roomNumber || 'N/A';

  const StatsHeader = () => {
    if (!stats) return null;
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statVal}>{(stats.totalCollected || 0).toLocaleString()}</Text>
            <Text style={styles.statLab}>COLLECTED (LKR)</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
            <Text style={styles.statVal}>{(stats.pendingAmount || 0).toLocaleString()}</Text>
            <Text style={styles.statLab}>PENDING (LKR)</Text>
          </View>
        </View>
      </View>
    );
  };

  const PaymentCard = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.residentName}>{getResidentName(item.residentId)}</Text>
          <Text style={styles.roomSub}>Room {getRoomNum(item.roomId)} • {new Date(item.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
        </View>
        <TouchableOpacity onPress={() => deletePayment(item._id)} style={styles.deleteIcon}>
           <MaterialCommunityIcons name="trash-can-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.amountBox}>
         <View>
           <Text style={styles.netAmountLabel}>NET AMOUNT DUE</Text>
           <Text style={styles.netAmountVal}>LKR {item.netAmount.toLocaleString()}</Text>
         </View>
         <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status.toUpperCase()}</Text>
         </View>
      </View>

      <View style={styles.divider} />
      
      <View style={styles.infoGrid}>
         <View style={styles.infoCol}><Text style={styles.infoLabel}>Base</Text><Text style={styles.infoValue}>LKR {item.amount}</Text></View>
         <View style={styles.infoCol}><Text style={styles.infoLabel}>Food</Text><Text style={styles.infoValue}>LKR {item.foodAmount || 0}</Text></View>
         {item.lateFee > 0 && <View style={styles.infoCol}><Text style={styles.infoLabel}>Late Fee</Text><Text style={[styles.infoValue, { color: COLORS.error }]}>LKR {item.lateFee}</Text></View>}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
        {item.status !== 'paid' && (
          <TouchableOpacity style={styles.payBtn} onPress={() => markAsPaid(item._id)}>
            <Text style={styles.payBtnText}>MARK PAID</Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = payments.filter(p => statusFilter === 'all' || p.status === statusFilter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>Payments</Text>
          <Text style={styles.screenSubtitle}>Financial Management</Text>
        </View>
        <TouchableOpacity 
          style={styles.genBtn} 
          onPress={() => {
            Alert.alert(
              'Confirm Batch Generation',
              'This will generate monthly bills for ALL active residents. Duplicate checks apply but please use only once per month.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'GENERATE NOW', 
                  onPress: async () => {
                    setSubmitting(true);
                    try {
                      const res = await paymentService.createBatch({ 
                        month: new Date().toISOString(), 
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
                      });
                      Alert.alert('Success', `Task complete. ${res.data.data.created} new bills generated.`);
                      fetchData();
                    } catch (e) { 
                      Alert.alert('Generation Error', e.response?.data?.message || 'Failed to generate bills'); 
                    } finally { setSubmitting(false); }
                  }
                }
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="plus-box" size={20} color={COLORS.white} />
          <Text style={styles.genBtnText}>GENERATE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: s }) => (
            <TouchableOpacity 
              onPress={() => setStatusFilter(s)}
              style={[styles.filterChip, statusFilter === s && styles.activeChip]}
            >
              <Text style={[styles.filterText, statusFilter === s && styles.activeText]}>{s.toUpperCase()}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={({ item }) => <PaymentCard item={item} />}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<StatsHeader />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash-remove" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No records found for this period.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  screenSubtitle: { fontSize: 10, color: COLORS.textLight, letterSpacing: 1, fontWeight: 'bold', textTransform: 'uppercase' },
  genBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  genBtnText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  filterBar: { marginVertical: 15 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: 'bold', color: COLORS.text },
  activeText: { color: COLORS.white },

  list: { padding: 20, paddingBottom: 100 },
  statsContainer: { marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: COLORS.surface, padding: 20, borderRadius: 20, borderLeftWidth: 5, elevation: 2 },
  statVal: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statLab: { fontSize: 9, color: COLORS.textLight, marginTop: 4, fontWeight: 'bold' },

  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  residentName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  roomSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  deleteIcon: { padding: 4 },

  amountBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  netAmountLabel: { fontSize: 9, fontWeight: 'bold', color: COLORS.textLight },
  netAmountVal: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 10, color: COLORS.textLight },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginTop: 2 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  dateText: { fontSize: 12, color: COLORS.textLight },
  payBtn: { backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  payBtnText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: COLORS.textLight, marginTop: 15 },
});