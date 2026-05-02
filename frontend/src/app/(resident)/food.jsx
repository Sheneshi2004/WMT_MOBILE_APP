import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Chip, TextInput, Card as PaperCard, FAB } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { attendanceService } from '../../services/attendanceService';
import { residentService } from '../../services/residentService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FoodScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [preference, setPreference] = useState(null);
  const [todaysMenu, setTodaysMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ mealType: ['breakfast', 'lunch', 'dinner'], preference: 'veg', specialRequests: '', allergies: [], specificAllergies: '' });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks', 'other'];
  const preferenceTypes = ['veg', 'non-veg', 'vegan'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      setResident(residentData);
      if (residentData) {
        const prefRes = await attendanceService.getFoodPreference(residentData._id);
        if (prefRes.data.data?.length > 0) setPreference(prefRes.data.data[0]);
        const menuRes = await attendanceService.getTodaysMenu();
        setTodaysMenu(menuRes.data.data);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };
  const toggleMealType = (type) => {
    setFormData(prev => ({ ...prev, mealType: prev.mealType.includes(type) ? prev.mealType.filter(m => m !== type) : [...prev.mealType, type] }));
  };

  const toggleAllergy = (allergy) => {
    setFormData(prev => ({ ...prev, allergies: prev.allergies.includes(allergy) ? prev.allergies.filter(a => a !== allergy) : [...prev.allergies, allergy] }));
  };

  const handleSubmit = async () => {
    if (formData.mealType.length === 0) {
      Alert.alert('Error', 'Please select at least one meal type');
      return;
    }
    setSubmitting(true);
    try {
      if (editing && preference) {
        await attendanceService.updateFoodPreference(preference._id, formData);
      } else {
        await attendanceService.setFoodPreference({ residentId: resident._id, ...formData });
      }
      Alert.alert('Success', 'Food preference saved');
      setShowForm(false);
      setEditing(false); fetchData();
    } catch (error) { 
      const msg = error.response?.data?.message || 'Failed to save food preference';
      Alert.alert('Error', msg); 
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!preference) return;
    Alert.alert('Delete Preference', 'Are you sure you want to delete your food preference?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await attendanceService.deleteFoodPreference(preference._id);
          Alert.alert('Success', 'Food preference deleted');
          setPreference(null);
          fetchData();
        } catch (error) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  
  const openPrefForm = () => {
    if (preference) {
      setEditing(true);
      setFormData({ 
        mealType: preference.mealType || [], 
        preference: preference.preference, 
        specialRequests: preference.specialRequests || '', 
        allergies: preference.allergies || [], 
        specificAllergies: preference.specificAllergies || '' 
      });
    } else {
      setEditing(false);
      setFormData({ mealType: ['breakfast', 'lunch', 'dinner'], preference: 'veg', specialRequests: '', allergies: [], specificAllergies: '' });
    }
    setShowForm(!showForm);
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
          <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Management</Text>
      </View>

      {/* Today's Menu */}
      {todaysMenu && todaysMenu._id ? (
        <PaperCard style={styles.menuPaperCard} elevation={2}>
          <PaperCard.Title 
            title="Today's Menu" 
            subtitle={new Date().toLocaleDateString()} 
            left={(props) => <Text {...props} style={{ fontSize: 24 }}>🍱</Text>} 
            titleStyle={styles.menuTitle} 
          />
          <PaperCard.Content>
            <View style={styles.mealItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>🍳 Breakfast</Text>
                <Text style={styles.mealDetail}>{todaysMenu.breakfast?.item || 'Not set'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mealTime}>{todaysMenu.breakfast?.time}</Text>
                {todaysMenu.breakfast?.price > 0 && <Text style={styles.mealPrice}>LKR {todaysMenu.breakfast?.price}</Text>}
              </View>
            </View>
            <View style={styles.mealItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>🍲 Lunch</Text>
                <Text style={styles.mealDetail}>{todaysMenu.lunch?.item || 'Not set'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mealTime}>{todaysMenu.lunch?.time}</Text>
                {todaysMenu.lunch?.price > 0 && <Text style={styles.mealPrice}>LKR {todaysMenu.lunch?.price}</Text>}
              </View>
            </View>
            <View style={styles.mealItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mealName}>🍽️ Dinner</Text>
                <Text style={styles.mealDetail}>{todaysMenu.dinner?.item || 'Not set'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mealTime}>{todaysMenu.dinner?.time}</Text>
                {todaysMenu.dinner?.price > 0 && <Text style={styles.mealPrice}>LKR {todaysMenu.dinner?.price}</Text>}
              </View>
            </View>
            {todaysMenu.snacks?.item && (
              <View style={styles.mealItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>🍪 Snacks</Text>
                  <Text style={styles.mealDetail}>{todaysMenu.snacks.item}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.mealTime}>{todaysMenu.snacks.time}</Text>
                  {todaysMenu.snacks?.price > 0 && <Text style={styles.mealPrice}>LKR {todaysMenu.snacks?.price}</Text>}
                </View>
              </View>
            )}
            {todaysMenu.other?.item && (
              <View style={styles.mealItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>🍱 Other</Text>
                  <Text style={styles.mealDetail}>{todaysMenu.other.item}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.mealTime}>{todaysMenu.other.time}</Text>
                  {todaysMenu.other?.price > 0 && <Text style={styles.mealPrice}>LKR {todaysMenu.other?.price}</Text>}
                </View>
              </View>
            )}
            {todaysMenu.special && (
              <View style={styles.specialBadge}>
                <Text style={styles.specialText}>✨ Special: {todaysMenu.special}</Text>
              </View>
            )}
          </PaperCard.Content>
        </PaperCard>
      ) : (
        <Card style={styles.noMenuCard}>
          <Text style={styles.noMenuIcon}>🍽️</Text>
          <Text style={styles.noMenuText}>No menu set for today</Text>
          <Text style={styles.noMenuSubtext}>The hostel staff hasn't updated today's menu yet.</Text>
        </Card>
      )}

      {/* Preference Action Button */}
      <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
        <Button 
          title={showForm ? "Close Form" : (preference ? "Update Preference" : "Add Food Preference")} 
          onPress={openPrefForm} 
          icon={showForm ? "close" : (preference ? "pencil" : "plus")}
          style={{ backgroundColor: showForm ? COLORS.error : COLORS.primary }}
        />
      </View>

      {/* Food Preference Form (Expandable) */}
      {showForm && (
        <Card style={styles.preferenceCard}>
          <Text style={styles.modalTitle}>{editing ? 'Update Your Preference' : 'Set Your Food Preference'}</Text>
          
          <Text style={styles.label}>Select Daily Meals *</Text>
          <ScrollView horizontal style={{ marginBottom: 12 }}>{mealTypes.map(m => (<Chip key={m} selected={formData.mealType.includes(m)} onPress={() => toggleMealType(m)} style={styles.chip}>{m.toUpperCase()}</Chip>))}</ScrollView>
          
          <Text style={styles.label}>Food Preference (for {formData.mealType.join(', ')})</Text>
          <ScrollView horizontal style={{ marginBottom: 12 }}>{preferenceTypes.map(p => (<Chip key={p} selected={formData.preference === p} onPress={() => setFormData({ ...formData, preference: p })} style={styles.chip}>{p.toUpperCase()}</Chip>))}</ScrollView>
          
          <TextInput label="Special Allergies" value={formData.specificAllergies} onChangeText={t => setFormData({ ...formData, specificAllergies: t })} mode="outlined" style={styles.input} placeholder="e.g. Eggs, Shellfish, Peanuts..." />
          <TextInput label="Special Request" value={formData.specialRequests} onChangeText={t => setFormData({ ...formData, specialRequests: t })} mode="outlined" multiline style={styles.input} placeholder="Any other notes..." />
          
          <Text style={styles.label}>Common Allergies (Quick Toggle)</Text>
          <ScrollView horizontal style={{ marginBottom: 16 }}>{['Peanuts', 'Dairy', 'Gluten', 'Seafood', 'Eggs'].map(a => (<Chip key={a} selected={formData.allergies.includes(a)} onPress={() => toggleAllergy(a)} style={styles.chip}>{a}</Chip>))}</ScrollView>
          
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setShowForm(false)} variant="secondary" />
            <Button title="Save Preference" onPress={handleSubmit} loading={submitting} />
          </View>
        </Card>
      )}

      {/* Current Preference Summary */}
      {preference && !showForm && (
        <Card style={styles.preferenceCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Current Preference</Text>
            <Chip icon="check-circle" style={{ backgroundColor: COLORS.success + '15' }} textStyle={{ color: COLORS.success, fontSize: 10 }}>Active</Chip>
          </View>
          <View style={styles.prefSummaryRow}>
            <Text style={styles.prefLabel}>Meals:</Text>
            <Text style={styles.prefValue}>{preference.mealType?.join(', ') || 'None'}</Text>
          </View>
          <View style={styles.prefSummaryRow}>
            <Text style={styles.prefLabel}>Choice:</Text>
            <Text style={styles.prefValue}>{preference.preference?.toUpperCase()}</Text>
          </View>
          
          <View style={styles.actionButtonsRow}>
            <Button 
              title="Update Preference" 
              onPress={openPrefForm} 
              size="small" 
              icon="pencil"
              style={{ flex: 1 }}
            />
            <Button 
              title="Delete" 
              onPress={handleDelete} 
              size="small" 
              variant="secondary"
              icon="delete"
              style={{ flex: 0.4 }}
            />
          </View>
        </Card>
      )}
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' }, headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  menuPaperCard: { margin: 12, backgroundColor: COLORS.surface, borderRadius: 12 },
  menuTitle: { color: COLORS.primary, fontWeight: 'bold' },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border + '20' },
  mealName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  mealDetail: { fontSize: 15, color: COLORS.textLight },
  mealTime: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  mealPrice: { fontSize: 11, color: COLORS.success, fontWeight: '600', marginTop: 2 },
  specialBadge: { backgroundColor: COLORS.primary + '15', padding: 10, borderRadius: 8, marginTop: 12 },
  specialText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  noMenuCard: { margin: 12, alignItems: 'center', padding: 30, backgroundColor: COLORS.surface },
  noMenuIcon: { fontSize: 40, marginBottom: 12 },
  noMenuText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  noMenuSubtext: { fontSize: 12, color: COLORS.textLight, textAlign: 'center' },
  preferenceCard: { margin: 12, padding: 16 }, 
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  prefSummaryRow: { flexDirection: 'row', marginBottom: 8 },
  prefLabel: { width: 80, fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
  prefValue: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: 'bold' },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  
  noPrefContainer: { padding: 30, alignItems: 'center' },
  noPrefText: { color: COLORS.textLight, marginBottom: 16, textAlign: 'center' },
  setPrefBtn: { width: '80%' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },

  label: { fontWeight: 'bold', marginBottom: 8, color: COLORS.text }, chip: { marginRight: 8, marginBottom: 8 },
  input: { marginBottom: 16, backgroundColor: COLORS.card }, saveBtn: { marginTop: 8 }, editBtn: { marginTop: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: COLORS.primary, borderRadius: 28 },
});