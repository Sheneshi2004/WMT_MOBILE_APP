import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Chip } from 'react-native-paper';
import { roomService } from '../../services/roomService';
import { Card } from '../../components/common/Card';
import { COLORS } from '../../constants/colors';

export default function BrowseRoomsScreen() {
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
    <TouchableOpacity onPress={() => router.push(`/(resident)/room/${room._id}`)}>
      <Card style={styles.card}>
        <Image source={{ uri: room.images?.[0] || 'https://via.placeholder.com/400x200' }} style={styles.image} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}><Text style={styles.roomNumber}>Room {room.roomNumber}</Text><View style={[styles.statusBadge, { backgroundColor: room.status === 'available' ? COLORS.success : COLORS.error }]}><Text style={styles.statusText}>{room.status}</Text></View></View>
          <Text style={styles.roomType}>{room.roomType}</Text>
          <Text style={styles.price}>LKR {room.pricePerMonth}/month</Text>
          <Text style={styles.capacity}>Capacity: {room.capacity} persons</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
          <Text style={{ fontSize: 24, color: COLORS.white, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Rooms</Text>
      </View>
      <TextInput placeholder="Search by room number..." value={search} onChangeText={setSearch} style={styles.searchBar} placeholderTextColor={COLORS.textLight} />
      <View style={styles.filterScrollConfig}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={roomTypes}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: type }) => (
            <Chip selected={typeFilter === type} onPress={() => setTypeFilter(type)} style={styles.filterChip}>{type === 'all' ? 'All' : type}</Chip>
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
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
  searchBar: { backgroundColor: COLORS.surface, margin: 12, padding: 12, borderRadius: 8, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  filterScrollConfig: { height: 50, marginBottom: 8 },
  filterContent: { paddingHorizontal: 12, alignItems: 'center' },
  filterChip: { marginRight: 8, backgroundColor: COLORS.surface, height: 36, justifyContent: 'center' },
  list: { padding: 12 },
  card: { marginBottom: 12, overflow: 'hidden', padding: 0 },
  image: { width: '100%', height: 180 },
  cardContent: { padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roomNumber: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  roomType: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  capacity: { fontSize: 12, color: COLORS.textLight, marginTop: 4 },
  empty: { alignItems: 'center', padding: 40 },
  emptyText: { color: COLORS.textLight },
});