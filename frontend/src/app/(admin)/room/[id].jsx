import { Screen } from '@/components/common/Card.jsx';
import { roomsService } from '@/services/resources.js';
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
export default function RoomDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data, isLoading, error } = useQuery({
        queryKey: ["room", id],
        queryFn: () => roomsService.get(id),
        enabled: Boolean(id),
    });
    const room = data?.data || data;
    if (isLoading) {
        return (<Screen title="Room Details">
        <ActivityIndicator />
      </Screen>);
    }
    if (error || !room) {
        return (<Screen title="Room Details">
        <Text>Unable to load room details.</Text>
      </Screen>);
    }
    return (<Screen title={`Room ${room.roomNumber}`}>
      <ScrollView>
        <Card>
          <Card.Content>
            <Text variant="titleMedium">Type: {room.roomType}</Text>
            <Text>Status: {room.status}</Text>
            <Text>Capacity: {room.currentOccupancy}/{room.capacity}</Text>
            <Text>Price: LKR {room.pricePerMonth}</Text>
            <Text>Description: {room.description || "N/A"}</Text>
            <Text>Facilities: {room.facilities?.join(", ") || "N/A"}</Text>
          </Card.Content>
        </Card>
        <View style={{ marginTop: 12 }}>
          <Button mode="contained" onPress={() => router.push(`/(admin)/room/edit?id=${id}`)}>
            Edit Room
          </Button>
        </View>
      </ScrollView>
    </Screen>);
}
