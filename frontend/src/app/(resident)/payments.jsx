import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { residentService } from '../../services/residentService';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS, STATUS_COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

// ==================== CARD VALIDATION HELPERS ====================
const luhnCheck = (num) => {
  const digits = num.replace(/\s+/g, '');
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

const validateExpiry = (expiry) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return 'Use MM/YY format';
  const [m, y] = expiry.split('/');
  const exp = new Date(2000 + parseInt(y), parseInt(m), 0);
  if (exp < new Date()) return 'Card has expired';
  return null;
};

const formatCardNumber = (text) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (text) => {
  const cleaned = text.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  return cleaned;
};

// ==================== MAIN COMPONENT ====================
export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [gatewayResult, setGatewayResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const statusFilters = ['all', 'pending', 'paid', 'overdue'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      if (residentData) {
        const res = await paymentService.getPaymentsByResident(residentData._id);
        setPayments(res.data.data || []);
      }
    } catch (error) { Alert.alert('Error', 'Failed to load payments'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handlePay = (item) => {
    setSelectedPayment(item);
    setCardData({ number: '', expiry: '', cvv: '', name: '' });
    setCardErrors({});
    setGatewayResult(null);
    setProcessing(false);
    setPayModalVisible(true);
  };

  const validateField = (field, value) => {
    const errors = { ...cardErrors };
    switch (field) {
      case 'number': {
        const clean = value.replace(/\s+/g, '');
        if (clean.length === 0) errors.number = 'Card number is required';
        else if (clean.length < 16) errors.number = 'Must be 16 digits';
        else if (!luhnCheck(clean)) errors.number = 'Invalid card number';
        else delete errors.number;
        break;
      }
      case 'expiry': {
        if (!value) errors.expiry = 'Expiry is required';
        else {
          const err = validateExpiry(value);
          if (err) errors.expiry = err;
          else delete errors.expiry;
        }
        break;
      }
      case 'cvv': {
        if (!value) errors.cvv = 'CVV is required';
        else if (!/^\d{3,4}$/.test(value)) errors.cvv = '3 or 4 digits required';
        else delete errors.cvv;
        break;
      }
      case 'name': {
        if (!value || value.trim().length < 3) errors.name = 'Min 3 characters';
        else delete errors.name;
        break;
      }
    }
    setCardErrors(errors);
  };

  const updateCard = (field, value) => {
    let formatted = value;
    if (field === 'number') formatted = formatCardNumber(value);
    if (field === 'expiry') formatted = formatExpiry(value);
    if (field === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, [field]: formatted }));
    validateField(field, formatted);
  };

  const processPayment = async () => {
    const clean = cardData.number.replace(/\s+/g, '');
    const errors = {};
    if (!clean || clean.length !== 16) errors.number = 'Must be 16 digits';
    else if (!luhnCheck(clean)) errors.number = 'Invalid card number';
    const expiryErr = validateExpiry(cardData.expiry);
    if (expiryErr) errors.expiry = expiryErr;
    if (!cardData.cvv || !/^\d{3,4}$/.test(cardData.cvv)) errors.cvv = '3 or 4 digits required';
    if (!cardData.name || cardData.name.trim().length < 3) errors.name = 'Min 3 characters';

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentService.processCard(selectedPayment._id, {
        cardNumber: cardData.number.replace(/\s+/g, ''),
        expiry: cardData.expiry,
        cvv: cardData.cvv,
        cardholderName: cardData.name
      });

      setGatewayResult(response.data.gatewayResponse);

      setTimeout(() => {
        setPayModalVisible(false);
        setCardData({ number: '', expiry: '', cvv: '', name: '' });
        setGatewayResult(null);
        Alert.alert(
          '✅ Payment Successful',
          `Transaction ID: ${response.data.gatewayResponse.transactionId}\nAmount: LKR ${response.data.gatewayResponse.amount}`
        );
        fetchData();
      }, 2000);
    } catch (error) {
      Alert.alert('Payment Failed', error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const showReceipt = (item) => {
    setSelectedPayment(item);
    setReceiptModalVisible(true);
  };

  const PaymentCard = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)} layout={Layout.springify()}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.month}>{new Date(item.month).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</Text>
            <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>LKR</Text>
          <Text style={styles.amount}>{item.netAmount.toLocaleString()}</Text>
        </View>
        
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Base Rent</Text>
            <Text style={styles.detailValue}>LKR {item.amount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Food & Services</Text>
            <Text style={styles.detailValue}>+ LKR {item.foodAmount || 0}</Text>
          </View>
          {item.lateFee > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Late Penalty</Text>
              <Text style={[styles.detailValue, { color: COLORS.error }]}>+ LKR {item.lateFee}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {item.status !== 'paid' ? (
            <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(item)}>
              <MaterialCommunityIcons name="credit-card-outline" size={20} color={'#000'} />
              <Text style={styles.payBtnText}>PAY NOW</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => showReceipt(item)} style={styles.receiptBtn}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={COLORS.primary} />
              <Text style={styles.receiptBtnText}>View Receipt</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </Animated.View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = payments.filter(p => statusFilter === 'all' || p.status === statusFilter);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Payments</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: s }) => (
            <TouchableOpacity 
              onPress={() => setStatusFilter(s)}
              style={[styles.filterChip, statusFilter === s && styles.activeFilterChip]}
            >
              <Text style={[styles.filterText, statusFilter === s && styles.activeFilterText]}>
                {s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList 
        data={filtered} 
        renderItem={({ item, index }) => <PaymentCard item={item} index={index} />} 
        keyExtractor={item => item._id} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} 
        contentContainerStyle={styles.list} 
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cash-off" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No payments found</Text>
          </View>
        )} 
      />

      {/* ==================== CARD PAYMENT MODAL ==================== */}
      <Modal visible={payModalVisible} animationType="slide" transparent onRequestClose={() => !processing && setPayModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <ScrollView showsVerticalScrollIndicator={false}>
               {gatewayResult ? (
                 <View style={styles.gatewaySuccess}>
                   <MaterialCommunityIcons name="check-circle" size={80} color={COLORS.success} />
                   <Text style={styles.successTitle}>Payment Approved!</Text>
                   <Text style={styles.successDetail}>TXN ID: {gatewayResult.transactionId}</Text>
                   <Text style={styles.successDetail}>Amount: LKR {gatewayResult.amount}</Text>
                 </View>
               ) : processing ? (
                 <View style={styles.processingOverlay}>
                   <ActivityIndicator size="large" color={COLORS.primary} />
                   <Text style={styles.processingText}>Processing secure payment...</Text>
                 </View>
               ) : (
                 <>
                   <View style={styles.modalHeader}>
                     <Text style={styles.modalTitle}>Secure Checkout</Text>
                     <Text style={styles.payAmount}>LKR {selectedPayment?.netAmount.toLocaleString()}</Text>
                   </View>

                   <TextInput
                     label="Card Number"
                     value={cardData.number}
                     onChangeText={t => updateCard('number', t)}
                     keyboardType="numeric"
                     mode="outlined"
                     style={styles.input}
                     placeholder="0000 0000 0000 0000"
                     maxLength={19}
                     textColor={COLORS.text}
                     theme={{ colors: { primary: COLORS.primary, outline: COLORS.border } }}
                   />
                   
                   <View style={styles.rowFields}>
                     <TextInput
                       label="Expiry"
                       value={cardData.expiry}
                       onChangeText={t => updateCard('expiry', t)}
                       keyboardType="numeric"
                       mode="outlined"
                       style={[styles.input, { flex: 1 }]}
                       placeholder="MM/YY"
                       maxLength={5}
                       theme={{ colors: { primary: COLORS.primary, outline: COLORS.border } }}
                     />
                     <View style={{ width: 15 }} />
                     <TextInput
                       label="CVV"
                       value={cardData.cvv}
                       onChangeText={t => updateCard('cvv', t)}
                       keyboardType="numeric"
                       mode="outlined"
                       style={[styles.input, { flex: 1 }]}
                       placeholder="000"
                       maxLength={3}
                       secureTextEntry
                       theme={{ colors: { primary: COLORS.primary, outline: COLORS.border } }}
                     />
                   </View>

                   <TextInput
                     label="Cardholder Name"
                     value={cardData.name}
                     onChangeText={t => updateCard('name', t)}
                     mode="outlined"
                     style={styles.input}
                     placeholder="FULL NAME"
                     autoCapitalize="characters"
                     theme={{ colors: { primary: COLORS.primary, outline: COLORS.border } }}
                   />

                   <View style={styles.modalButtons}>
                     <TouchableOpacity style={styles.cancelBtn} onPress={() => setPayModalVisible(false)}>
                       <Text style={styles.cancelBtnText}>CANCEL</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={styles.confirmBtn} onPress={processPayment}>
                       <Text style={styles.confirmBtnText}>PAY NOW</Text>
                     </TouchableOpacity>
                   </View>
                 </>
               )}
             </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ==================== RECEIPT MODAL ==================== */}
      <Modal visible={receiptModalVisible} animationType="fade" transparent onRequestClose={() => setReceiptModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModal}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptBrand}>HOSTELHUB</Text>
              <Text style={styles.receiptStatus}>OFFICIAL RECEIPT</Text>
            </View>
            <View style={styles.receiptBody}>
               <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Transaction ID</Text><Text style={styles.receiptValue}>{selectedPayment?.transactionId || 'N/A'}</Text></View>
               <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date</Text><Text style={styles.receiptValue}>{selectedPayment?.paidDate ? new Date(selectedPayment.paidDate).toLocaleDateString() : 'N/A'}</Text></View>
               <View style={styles.receiptDivider} />
               <View style={styles.receiptTotalRow}><Text style={styles.receiptTotalLabel}>TOTAL PAID</Text><Text style={styles.receiptTotalValue}>LKR {selectedPayment?.netAmount.toLocaleString()}</Text></View>
            </View>
            <TouchableOpacity style={styles.closeReceiptBtn} onPress={() => setReceiptModalVisible(false)}>
              <Text style={styles.closeReceiptText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  
  filterSection: { marginBottom: 15 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  activeFilterChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  activeFilterText: { color: '#000000' },

  list: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  month: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  dueDate: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: 'bold' },

  amountContainer: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  currency: { fontSize: 16, color: COLORS.primary, fontWeight: 'bold', marginRight: 4 },
  amount: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },

  detailsList: { gap: 8, marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: COLORS.textLight },
  detailValue: { fontSize: 14, color: COLORS.text, fontWeight: '600' },

  cardActions: { flexDirection: 'row' },
  payBtn: { flex: 1, backgroundColor: COLORS.primary, height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  payBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  receiptBtn: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, height: 48, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: COLORS.primary + '10' },
  receiptBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 14 },

  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textLight, marginTop: 16, fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.surface, width: '90%', borderRadius: 28, padding: 24 },
  modalHeader: { alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, color: COLORS.textLight, fontWeight: '600' },
  payAmount: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginTop: 8 },
  input: { marginBottom: 16, backgroundColor: COLORS.surface },
  rowFields: { flexDirection: 'row', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.textLight, fontWeight: 'bold' },
  confirmBtn: { flex: 1, height: 52, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#000', fontWeight: 'bold' },

  gatewaySuccess: { alignItems: 'center', paddingVertical: 40 },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  successDetail: { color: COLORS.textLight, fontSize: 14 },
  processingOverlay: { paddingVertical: 60, alignItems: 'center' },
  processingText: { color: COLORS.text, marginTop: 20, fontWeight: '600' },

  receiptModal: { backgroundColor: COLORS.surface, width: '85%', borderRadius: 24, overflow: 'hidden' },
  receiptHeader: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center' },
  receiptBrand: { color: '#000', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  receiptStatus: { color: '#000', opacity: 0.7, fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  receiptBody: { padding: 24 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  receiptLabel: { color: COLORS.textLight, fontSize: 13 },
  receiptValue: { color: COLORS.text, fontSize: 13, fontWeight: 'bold' },
  receiptDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  receiptTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptTotalLabel: { color: COLORS.text, fontWeight: 'bold' },
  receiptTotalValue: { color: COLORS.primary, fontSize: 22, fontWeight: 'bold' },
  closeReceiptBtn: { backgroundColor: COLORS.background, padding: 20, alignItems: 'center' },
  closeReceiptText: { color: COLORS.text, fontWeight: 'bold' },
});