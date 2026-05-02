import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Alert, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, TextInput, Searchbar } from 'react-native-paper';
import { attendanceService } from '../../services/attendanceService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

export default function FoodManagementScreen() {
  const [preferences, setPreferences] = useState([]);
  const [residents, setResidents] = useState([]);
  const [todaysMenu, setTodaysMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // NEW: track edit mode
  const [menuData, setMenuData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    breakfast: { item: '', time: '07:30 AM', price: '0' }, 
    lunch: { item: '', time: '12:30 PM', price: '0' }, 
    dinner: { item: '', time: '07:00 PM', price: '0' },
    snacks: { item: '', time: '04:00 PM', price: '0' },
    other: { item: '', time: '10:00 PM', price: '0' },
    special: '' 
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [prefRes, resRes, menuRes] = await Promise.all([
        attendanceService.getFoodPreferences(),
        residentService.getAll(),
        attendanceService.getTodaysMenu()
      ]);
      setPreferences(prefRes.data.data || []);
      setResidents(resRes.data.data || []);
      setTodaysMenu(menuRes.data.data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const getResidentName = (resident) => {
    if (typeof resident === 'object' && resident?.name) return resident.name;
    const found = residents.find(r => r._id === resident);
    return found ? found.name : 'Unknown';
  };

  // NEW: Open modal in Edit mode - pre-fill with existing menu data
  const handleEditMenu = () => {
    if (todaysMenu) {
      setMenuData({
        date: todaysMenu.date || new Date().toISOString().split('T')[0],
        breakfast: {
          item: todaysMenu.breakfast?.item || '',
          time: todaysMenu.breakfast?.time || '07:30 AM',
          price: todaysMenu.breakfast?.price?.toString() || '0',
        },
        lunch: {
          item: todaysMenu.lunch?.item || '',
          time: todaysMenu.lunch?.time || '12:30 PM',
          price: todaysMenu.lunch?.price?.toString() || '0',
        },
        dinner: {
          item: todaysMenu.dinner?.item || '',
          time: todaysMenu.dinner?.time || '07:00 PM',
          price: todaysMenu.dinner?.price?.toString() || '0',
        },
        snacks: {
          item: todaysMenu.snacks?.item || '',
          time: todaysMenu.snacks?.time || '04:00 PM',
          price: todaysMenu.snacks?.price?.toString() || '0',
        },
        other: {
          item: todaysMenu.other?.item || '',
          time: todaysMenu.other?.time || '10:00 PM',
          price: todaysMenu.other?.price?.toString() || '0',
        },
        special: todaysMenu.special || '',
      });
      setIsEditing(true);
      setModalVisible(true);
    }
  };

  // NEW: Open modal in Create mode
  const handleOpenCreateModal = () => {
    setMenuData({
      date: new Date().toISOString().split('T')[0],
      breakfast: { item: '', time: '07:30 AM', price: '0' },
      lunch: { item: '', time: '12:30 PM', price: '0' },
      dinner: { item: '', time: '07:00 PM', price: '0' },
      snacks: { item: '', time: '04:00 PM', price: '0' },
      other: { item: '', time: '10:00 PM', price: '0' },
      special: '',
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleSetMenu = async () => {
    // 1. Mandatory Items Validation (Only for Breakfast, Lunch, Dinner)
    if (!menuData.breakfast.item || !menuData.lunch.item || !menuData.dinner.item) {
      Alert.alert('Error', 'Please fill all mandatory meal items (Breakfast, Lunch, Dinner)');
      return;
    }

    // 2. Mandatory Prices Validation (Only for Breakfast, Lunch, Dinner)
    const bPrice = parseFloat(menuData.breakfast.price);
    const lPrice = parseFloat(menuData.lunch.price);
    const dPrice = parseFloat(menuData.dinner.price);

    // Ensure prices are valid positive numbers (no negative numbers allowed)
    if (isNaN(bPrice) || bPrice <= 0 || isNaN(lPrice) || lPrice <= 0 || isNaN(dPrice) || dPrice <= 0) {
      Alert.alert('Error', 'Please enter valid positive prices for Breakfast, Lunch, and Dinner');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && todaysMenu?._id) {
        // UPDATE existing menu
        await attendanceService.updateMealMenu(todaysMenu._id, menuData);
        Alert.alert('Success', 'Menu updated successfully!');
      } else {
        // CREATE new menu
        await attendanceService.createMealMenu(menuData);
        Alert.alert('Success', 'Menu set for today!');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert('Error', isEditing ? 'Failed to update menu' : 'Failed to set menu');
    } finally { setSubmitting(false); }
  };

  // NEW: Delete today's menu
  const handleDeleteMenu = () => {
    Alert.alert(
      'Delete Menu',
      'Are you sure you want to delete today\'s menu?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await attendanceService.deleteMealMenu(todaysMenu._id);
              Alert.alert('Success', 'Menu deleted successfully!');
              setTodaysMenu(null);
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete menu');
            }
          },
        },
      ]
    );
  };

  const PreferenceCard = ({ item }) => {
    const residentName = getResidentName(item.residentId);
    return (
      <Card style={styles.card}>
        <View style={styles.cardHeaderSmall}>
          <Text style={styles.residentName}>{residentName}</Text>
          <View style={[styles.choiceBadge, { backgroundColor: item.preference === 'non-veg' ? COLORS.error + '15' : COLORS.success + '15' }]}>
            <Text style={[styles.choiceText, { color: item.preference === 'non-veg' ? COLORS.error : COLORS.success }]}>{item.preference?.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceLabel}>Meals:</Text>
          <Text style={styles.preferenceValue}>{Array.isArray(item.mealType) ? item.mealType.join(', ') : item.mealType}</Text>
        </View>

        {item.specificAllergies && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🚫</Text>
            <Text style={styles.infoText}>Allergies: {item.specificAllergies}</Text>
          </View>
        )}
        
        {item.specialRequests && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <Text style={styles.infoText}>Request: {item.specialRequests}</Text>
          </View>
        )}
        
        {item.allergies?.length > 0 && (
          <View style={styles.chipRow}>
            {item.allergies.map(a => <View key={a} style={styles.smallChip}><Text style={styles.smallChipText}>{a}</Text></View>)}
          </View>
        )}
      </Card>
    );
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const filtered = preferences.filter(p => getResidentName(p.residentId).toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Food Management</Text>
        {/* Show "Set Today's Menu" only if no menu exists */}
        {!todaysMenu?._id && (
          <Button title="Set Today's Menu" onPress={handleOpenCreateModal} size="small" />
        )}
      </View>

      {/* Today's Menu Card */}
      {todaysMenu && todaysMenu._id ? (
        <Card style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>📅 Today's Menu</Text>
            {/* NEW: Edit & Delete buttons */}
            <View style={styles.menuActions}>
              <TouchableOpacity style={styles.editBtn} onPress={handleEditMenu}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteMenu}>
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mealRow}><Text style={styles.mealLabel}>Breakfast:</Text><Text style={styles.mealValue}>{todaysMenu.breakfast?.item} ({todaysMenu.breakfast?.time})</Text></View>
          <View style={styles.mealRow}><Text style={styles.mealLabel}>Lunch:</Text><Text style={styles.mealValue}>{todaysMenu.lunch?.item} ({todaysMenu.lunch?.time})</Text></View>
          <View style={styles.mealRow}><Text style={styles.mealLabel}>Dinner:</Text><Text style={styles.mealValue}>{todaysMenu.dinner?.item} ({todaysMenu.dinner?.time})</Text></View>
          {todaysMenu.snacks?.item && <View style={styles.mealRow}><Text style={styles.mealLabel}>Snacks:</Text><Text style={styles.mealValue}>{todaysMenu.snacks.item} ({todaysMenu.snacks.time})</Text></View>}
          {todaysMenu.other?.item && <View style={styles.mealRow}><Text style={styles.mealLabel}>Other:</Text><Text style={styles.mealValue}>{todaysMenu.other.item} ({todaysMenu.other.time})</Text></View>}
          {todaysMenu.special && <Text style={styles.specialMenu}>⭐ Special: {todaysMenu.special}</Text>}
        </Card>
      ) : (
        <Card style={styles.noMenuCard}><Text style={styles.noMenuText}>No menu set for today. Click "Set Today's Menu" to add.</Text></Card>
      )}

      <Searchbar placeholder="Search residents..." value={searchQuery} onChangeText={setSearchQuery} style={styles.searchBar} inputStyle={{ color: COLORS.text }} placeholderTextColor={COLORS.textLight} />

      <Text style={styles.sectionTitle}>Resident Food Preferences</Text>
      <FlatList data={filtered} renderItem={({ item }) => <PreferenceCard item={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No food preferences set</Text></View>)} />

      {/* Set / Edit Menu Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.modalContent}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* NEW: Modal title changes based on mode */}
            <Text style={styles.modalTitle}>{isEditing ? '✏️ Edit Today\'s Menu' : 'Set Today\'s Menu'}</Text>
            <Text style={styles.modalDate}>{new Date().toLocaleDateString()}</Text>

            <Text style={styles.mealSectionTitle}>Breakfast</Text>
            <TextInput label="Item *" value={menuData.breakfast.item} onChangeText={t => setMenuData({ ...menuData, breakfast: { ...menuData.breakfast, item: t } })} mode="outlined" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Time" value={menuData.breakfast.time} onChangeText={t => setMenuData({ ...menuData, breakfast: { ...menuData.breakfast, time: t } })} mode="outlined" style={[styles.input, { flex: 1 }]} />
              <TextInput label="Price (LKR) *" value={menuData.breakfast.price} onChangeText={t => setMenuData({ ...menuData, breakfast: { ...menuData.breakfast, price: t } })} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
            </View>

            <Text style={styles.mealSectionTitle}>Lunch</Text>
            <TextInput label="Item *" value={menuData.lunch.item} onChangeText={t => setMenuData({ ...menuData, lunch: { ...menuData.lunch, item: t } })} mode="outlined" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Time" value={menuData.lunch.time} onChangeText={t => setMenuData({ ...menuData, lunch: { ...menuData.lunch, time: t } })} mode="outlined" style={[styles.input, { flex: 1 }]} />
              <TextInput label="Price (LKR) *" value={menuData.lunch.price} onChangeText={t => setMenuData({ ...menuData, lunch: { ...menuData.lunch, price: t } })} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
            </View>

            <Text style={styles.mealSectionTitle}>Dinner</Text>
            <TextInput label="Item *" value={menuData.dinner.item} onChangeText={t => setMenuData({ ...menuData, dinner: { ...menuData.dinner, item: t } })} mode="outlined" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Time" value={menuData.dinner.time} onChangeText={t => setMenuData({ ...menuData, dinner: { ...menuData.dinner, time: t } })} mode="outlined" style={[styles.input, { flex: 1 }]} />
              <TextInput label="Price (LKR) *" value={menuData.dinner.price} onChangeText={t => setMenuData({ ...menuData, dinner: { ...menuData.dinner, price: t } })} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
            </View>

            <Text style={styles.mealSectionTitle}>Snacks (Optional)</Text>
            <TextInput label="Item" value={menuData.snacks.item} onChangeText={t => setMenuData({ ...menuData, snacks: { ...menuData.snacks, item: t } })} mode="outlined" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Time" value={menuData.snacks.time} onChangeText={t => setMenuData({ ...menuData, snacks: { ...menuData.snacks, time: t } })} mode="outlined" style={[styles.input, { flex: 1 }]} />
              <TextInput label="Price (LKR)" value={menuData.snacks.price} onChangeText={t => setMenuData({ ...menuData, snacks: { ...menuData.snacks, price: t } })} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
            </View>

            <Text style={styles.mealSectionTitle}>Other (Optional)</Text>
            <TextInput label="Item" value={menuData.other.item} onChangeText={t => setMenuData({ ...menuData, other: { ...menuData.other, item: t } })} mode="outlined" style={styles.input} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput label="Time" value={menuData.other.time} onChangeText={t => setMenuData({ ...menuData, other: { ...menuData.other, time: t } })} mode="outlined" style={[styles.input, { flex: 1 }]} />
              <TextInput label="Price (LKR)" value={menuData.other.price} onChangeText={t => setMenuData({ ...menuData, other: { ...menuData.other, price: t } })} keyboardType="numeric" mode="outlined" style={[styles.input, { flex: 1 }]} />
            </View>

            <TextInput label="Special (Optional)" value={menuData.special} onChangeText={t => setMenuData({ ...menuData, special: t })} mode="outlined" style={styles.input} />

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" />
              {/* NEW: Button label changes based on mode */}
              <Button title={isEditing ? 'Update Menu' : 'Save Menu'} onPress={handleSetMenu} loading={submitting} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  menuCard: { margin: 12, padding: 16 },
  // NEW styles for menu header with actions
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  menuActions: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary },
  editBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#FF000015', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FF0000' },
  deleteBtnText: { color: '#FF0000', fontSize: 12, fontWeight: 'bold' },
  mealRow: { flexDirection: 'row', marginBottom: 8 },
  mealLabel: { width: 80, fontWeight: 'bold', color: COLORS.text },
  mealValue: { flex: 1, color: COLORS.textLight },
  specialMenu: { fontSize: 12, color: COLORS.warning, marginTop: 8 },
  noMenuCard: { margin: 12, alignItems: 'center', padding: 24 },
  noMenuText: { color: COLORS.textLight, textAlign: 'center' },
  searchBar: { margin: 12, backgroundColor: COLORS.surface },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginHorizontal: 12, marginBottom: 8 },
  list: { padding: 12 },
  card: { marginBottom: 12, padding: 16 },
  cardHeaderSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  residentName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  choiceBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  choiceText: { fontSize: 10, fontWeight: 'bold' },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  preferenceLabel: { fontSize: 13, color: COLORS.textLight, width: 50 },
  preferenceValue: { fontSize: 13, color: COLORS.primary, fontWeight: 'bold', flex: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoIcon: { fontSize: 14, marginRight: 8 },
  infoText: { fontSize: 13, color: COLORS.text, flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  smallChip: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 6, marginBottom: 4, borderWidth: 1, borderColor: COLORS.border },
  smallChipText: { fontSize: 10, color: COLORS.textLight },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center' },
  modalContent: { backgroundColor: COLORS.surface, margin: 20, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.border, maxHeight: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: COLORS.primary },
  modalDate: { textAlign: 'center', color: COLORS.textLight, marginBottom: 16 },
  mealSectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  input: { marginBottom: 12, backgroundColor: COLORS.card },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
});
