import { Screen } from '@/components/common/Card.jsx';
import { residentsService } from '@/services/resources.js';
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Button, Card, Text } from "react-native-paper";
export default function ResidentDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { data, isLoading, error } = useQuery({
        queryKey: ["resident", id],
        queryFn: () => residentsService.get(id),
        enabled: Boolean(id),
    });
    const resident = data?.data || data;
    if (isLoading) {
        return (<Screen title="Resident Details">
        <ActivityIndicator />
      </Screen>);
    }
    if (error || !resident) {
        return (<Screen title="Resident Details">
        <Text>Unable to load resident details.</Text>
      </Screen>);
    }
    return (<Screen title={resident.name}>
      <Card>
        <Card.Content>
          <Text>Email: {resident.email}</Text>
          <Text>Phone: {resident.phone}</Text>
          <Text>Status: {resident.status || "active"}</Text>
          <Text>NIC: {resident.nic || "N/A"}</Text>
          <Text>Room: {resident.roomId?._id || resident.roomId || "Not assigned"}</Text>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => router.push(`/(admin)/resident/edit?id=${id}`)}>
        Edit Resident
      </Button>
    </Screen>);
}
