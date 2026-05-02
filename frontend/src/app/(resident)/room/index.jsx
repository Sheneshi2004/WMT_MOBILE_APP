import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { residentService } from '../../../services/residentService';
import { roomService } from '../../../services/roomService';
import { Card } from '../../../components/common/Card';
import { COLORS } from '../../../constants/colors';

export default function MyRoomScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [room, setRoom] = useState(null);
  const [roommates, setRoommates] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user])
  );

  const fetchData = async () => {
    try {
      const residentsRes = await residentService.getAll();
      const residentData = residentsRes.data.data.find(r => r.email === user?.email);
      if (residentData?.roomId) {
        const roomId = residentData.roomId._id || residentData.roomId;
        const roomRes = await roomService.getRoomById(roomId);
        setRoom(roomRes.data.data);
        const residentsInRoom = await roomService.getResidentsInRoom(roomId);
        setRoommates(residentsInRoom.data.data.residents || []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!room) return <View style={styles.center}><Text style={styles.noRoomText}>No room assigned yet</Text></View>;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
          <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Room</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
        {(room.images?.length > 0 ? room.images : ['https://via.placeholder.com/400x300']).map((img, idx) => (<Image key={idx} source={{ uri: img }} style={styles.roomImage} />))}
      </ScrollView>
      <Card style={styles.card}>
        <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Room Type:</Text><Text style={styles.detailValue}>{room.roomType}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Capacity:</Text><Text style={styles.detailValue}>{room.capacity} persons</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Current Occupancy:</Text><Text style={styles.detailValue}>{room.currentOccupancy} / {room.capacity}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Monthly Rent:</Text><Text style={[styles.detailValue, styles.price]}>LKR {room.pricePerMonth}</Text></View>
        {room.description && <Text style={styles.description}>{room.description}</Text>}
        {room.facilities?.length > 0 && (
          <View style={styles.facilities}><Text style={styles.facilitiesTitle}>Facilities:</Text><View style={styles.facilitiesList}>{room.facilities.map((f, i) => (<View key={i} style={styles.facilityBadge}><Text style={styles.facilityText}>{f}</Text></View>))}</View></View>
        )}
      </Card>
      {roommates.length > 1 && (
        <Card style={styles.roommatesCard}>
          <Text style={styles.roommatesTitle}>Roommates</Text>
          {roommates.map((mate, idx) => (
            <View key={idx} style={styles.roommateItem}>
              <View style={styles.roommateAvatar}><Text style={styles.roommateAvatarText}>👤</Text></View>
              <View><Text style={styles.roommateName}>{mate.name}</Text><Text style={styles.roommateEmail}>{mate.email}</Text></View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  imageScroll: { padding: 12 },
  roomImage: { width: 300, height: 180, borderRadius: 12, marginRight: 12 },
  card: { margin: 12, padding: 16 },
  roomNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 14, color: COLORS.textLight },
  detailValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  price: { color: COLORS.success, fontWeight: 'bold' },
  description: { fontSize: 14, color: COLORS.textLight, marginTop: 12, marginBottom: 12 },
  facilities: { marginTop: 8 },
  facilitiesTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  facilitiesList: { flexDirection: 'row', flexWrap: 'wrap' },
  facilityBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  facilityText: { fontSize: 12, color: COLORS.text },
  roommatesCard: { margin: 12, padding: 16 },
  roommatesTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  roommateItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  roommateAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  roommateAvatarText: { fontSize: 24, color: COLORS.white },
  roommateName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  roommateEmail: { fontSize: 12, color: COLORS.textLight },
  noRoomText: { color: COLORS.textLight, fontSize: 16 },
});