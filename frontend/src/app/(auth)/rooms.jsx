import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Image, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { roomService } from '../../services/roomService';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

export default function PublicRoomsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const roomTypes = ['all', 'Single', 'Double', 'Triple', 'Shared'];

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const res = await roomService.getPublicRooms();
      setRooms(res.data.data.rooms || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchRooms(); };

  const filtered = rooms.filter(r => 
    (typeFilter === 'all' || r.roomType === typeFilter) &&
    (!search || r.roomNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const RoomCard = ({ room }) => (
    <Card style={styles.card}>
      {room.images && room.images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {room.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>
      ) : (
        <Image source={{ uri: 'https://via.placeholder.com/400x200' }} style={styles.image} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: room.status === 'available' ? COLORS.success : COLORS.error }]}>
            <Text style={styles.statusText}>{room.status}</Text>
          </View>
        </View>
        <Text style={styles.roomType}>{room.roomType}</Text>
        <Text style={styles.price}>LKR {room.pricePerMonth}/month</Text>
        <Text style={styles.capacity}>Capacity: {room.capacity} persons</Text>
        
        {room.description ? <Text style={styles.description}>{room.description}</Text> : null}
        
        {room.facilities && room.facilities.length > 0 && (
          <View style={styles.facilitiesContainer}>
            {room.facilities.map((f, i) => (
              <View key={i} style={styles.facilityBadge}><Text style={styles.facilityText}>{f}</Text></View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.btn, styles.loginBtn]} 
            onPress={() => router.push('/(auth)/register')}
          >
             <Text style={styles.loginBtnText}>Register to Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rooms</Text>
      </View>
      <TextInput placeholder="Search by room number..." value={search} onChangeText={setSearch} style={styles.searchBar} placeholderTextColor={COLORS.textLight} />
      <View style={styles.filterScrollConfig}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={roomTypes}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip selected={typeFilter === item} onPress={() => setTypeFilter(item)} style={styles.filterChip}>{item === 'all' ? 'All' : item}</Chip>
          )}
        />
      </View>
      <FlatList data={filtered} renderItem={({ item }) => <RoomCard room={item} />} keyExtractor={item => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} contentContainerStyle={styles.list} ListEmptyComponent={() => (<View style={styles.empty}><Text style={styles.emptyText}>No rooms available</Text></View>)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  backButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  searchBar: { backgroundColor: COLORS.surface, margin: 12, padding: 12, borderRadius: 8, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  filterScrollConfig: { paddingHorizontal: 12, marginBottom: 8 },
  filterChip: { marginRight: 8, backgroundColor: COLORS.surface },
  list: { padding: 12 },
  card: { marginBottom: 12, overflow: 'hidden', padding: 0 },
  imageScroll: { height: 180 },
  image: { width: 300, height: 180, marginRight: 2 },
  cardContent: { padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  roomType: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  capacity: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  description: { fontSize: 14, color: COLORS.text, marginTop: 8, fontStyle: 'italic' },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 15 },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  visitBtn: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary },
  visitBtnText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
  loginBtn: { backgroundColor: COLORS.primary },
  loginBtnText: { color: COLORS.textDark, fontWeight: 'bold', fontSize: 13 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
});
