import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../../../context/AuthContext';
import { roomService } from '../../../services/roomService';
import { residentService } from '../../../services/residentService';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { COLORS } from '../../../constants/colors';

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchRoom();
    }, [])
  );

  const fetchRoom = async () => {
    try {
      const res = await roomService.getRoomById(id);
      setRoom(res.data.data);

      //  Use getMyProfile instead of loading all residents
      const profileRes = await residentService.getMyProfile();
      setResident(profileRes.data.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookRoom = async () => {
    if (!resident) {
      Alert.alert(
        'Profile Incomplete',
        'You must complete your resident profile before booking a room.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Profile', onPress: () => router.push('/(resident)/profile') }
        ]
      );
      return;
    }

    if (resident.roomId) {
      Alert.alert('Error', 'You already have a room assigned. Please contact admin to change rooms.');
      return;
    }

    if (room.currentOccupancy >= room.capacity) {
      Alert.alert('Error', 'This room is currently full.');
      return;
    }

    Alert.alert('Confirm Booking', `Are you sure you want to book Room ${room.roomNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Book Room', onPress: async () => {
          setBooking(true);
          try {
            //  bookRoom() — resident self-service endpoint
            await residentService.bookRoom(id);
            Alert.alert('Success', 'Room booked successfully!');
            router.push('/(resident)');
          } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to book room. Please try again.';
            Alert.alert('Error', msg);
          } finally {
            setBooking(false);
          }
        }
      }
    ]);
  };

  const onRefresh = () => { setRefreshing(true); fetchRoom(); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!room) return <View style={styles.center}><Text style={styles.noRoom}>Room not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
          <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>Room Details</Text>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {(room.images?.length > 0 ? room.images : ['https://via.placeholder.com/400x300']).map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.roomImage} />
          ))}
        </ScrollView>

        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: room.status === 'available' ? COLORS.success : room.status === 'occupied' ? COLORS.error : COLORS.warning }]}>
              <Text style={styles.statusText}>{room.status}</Text>
            </View>
          </View>

          <View style={styles.detailRow}><Text style={styles.detailLabel}>Room Type:</Text><Text style={styles.detailValue}>{room.roomType}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Capacity:</Text><Text style={styles.detailValue}>{room.capacity} persons</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Current Occupancy:</Text><Text style={styles.detailValue}>{room.currentOccupancy} / {room.capacity}</Text></View>
          <View style={styles.detailRow}><Text style={styles.detailLabel}>Monthly Rent:</Text><Text style={[styles.detailValue, styles.price]}>LKR {room.pricePerMonth}</Text></View>
          {room.description && <Text style={styles.description}>{room.description}</Text>}
          {room.facilities?.length > 0 && (
            <View style={styles.facilities}>
              <Text style={styles.facilitiesTitle}>Facilities:</Text>
              <View style={styles.facilitiesList}>
                {room.facilities.map((f, i) => (
                  <View key={i} style={styles.facilityBadge}>
                    <Text style={styles.facilityText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!resident?.roomId && room.currentOccupancy < room.capacity && room.status !== 'maintenance' ? (
            <Button title="Book this Room" onPress={handleBookRoom} loading={booking} style={styles.bookBtn} />
          ) : (resident?.roomId?._id || resident?.roomId) === room._id ? (
            <Button title="This is your assigned room" variant="success" disabled style={styles.bookBtn} />
          ) : resident?.roomId ? (
            <Button title="Go to My Room" variant="secondary" onPress={() => router.push('/(resident)/room')} style={styles.bookBtn} />
          ) : (
            <Button title={room.currentOccupancy >= room.capacity ? "Room Full" : "Unavailable"} variant="secondary" disabled style={styles.bookBtn} />
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topHeader: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  topHeaderTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noRoom: { color: COLORS.textLight, fontSize: 16 },
  imageScroll: { padding: 12 },
  roomImage: { width: 350, height: 200, borderRadius: 12, marginRight: 12 },
  card: { margin: 12, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  roomNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
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
  bookBtn: { marginTop: 16 },
});