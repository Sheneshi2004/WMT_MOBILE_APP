import { Screen } from '@/components/common/Card.jsx';
import { RoomForm } from '@/components/rooms/RoomForm.jsx';
import { roomsService } from '@/services/resources.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert } from "react-native";
import { Text } from "react-native-paper";
export default function EditRoomScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const qc = useQueryClient();
    const roomQuery = useQuery({
        queryKey: ["room", id],
        queryFn: () => roomsService.get(id),
        enabled: Boolean(id),
    });
    const updateMutation = useMutation({
        mutationFn: async (values) => {
            const facilities = values.facilitiesText
                ? values.facilitiesText.split(",").map((item) => item.trim()).filter(Boolean)
                : [];
            return roomsService.update(id, {
                roomType: values.roomType,
                capacity: Number(values.capacity),
                pricePerMonth: Number(values.pricePerMonth),
                description: values.description,
                facilities,
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rooms"] });
            qc.invalidateQueries({ queryKey: ["room", id] });
            router.replace(`/(admin)/room/${id}`);
        },
        onError: (err) => Alert.alert("Update failed", err instanceof Error ? err.message : "Please try again"),
    });
    if (roomQuery.isLoading) {
        return (<Screen title="Edit Room">
        <ActivityIndicator />
      </Screen>);
    }
    const room = roomQuery.data?.data || roomQuery.data;
    if (!room) {
        return (<Screen title="Edit Room">
        <Text>Room not found.</Text>
      </Screen>);
    }
    return (<Screen title="Edit Room">
      <RoomForm submitLabel="Save Changes" initialValues={{
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            capacity: room.capacity,
            pricePerMonth: room.pricePerMonth,
            description: room.description || "",
            facilitiesText: room.facilities?.join(", ") || "",
            images: room.images || [],
        }} onSubmit={(values) => updateMutation.mutateAsync(values)}/>
    </Screen>);
}
