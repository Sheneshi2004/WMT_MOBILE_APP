import { Screen } from '@/components/common/Card.jsx';
import { ResidentForm } from '@/components/residents/ResidentForm.jsx';
import { residentsService } from '@/services/resources.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert } from "react-native";
import { Text } from "react-native-paper";
export default function EditResidentScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const qc = useQueryClient();
    const residentQuery = useQuery({
        queryKey: ["resident", id],
        queryFn: () => residentsService.get(id),
        enabled: Boolean(id),
    });
    const updateMutation = useMutation({
        mutationFn: (payload) => residentsService.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["residents"] });
            qc.invalidateQueries({ queryKey: ["resident", id] });
            router.replace(`/(admin)/resident/${id}`);
        },
        onError: (err) => Alert.alert("Update failed", err instanceof Error ? err.message : "Please try again"),
    });
    if (residentQuery.isLoading) {
        return (<Screen title="Edit Resident">
        <ActivityIndicator />
      </Screen>);
    }
    const resident = residentQuery.data?.data || residentQuery.data;
    if (!resident) {
        return (<Screen title="Edit Resident">
        <Text>Resident not found.</Text>
      </Screen>);
    }
    return (<Screen title="Edit Resident">
      <ResidentForm submitLabel="Save Changes" initialValues={{
            name: resident.name,
            email: resident.email,
            phone: resident.phone,
            nic: resident.nic || "",
            status: resident.status || "active",
            roomId: resident.roomId?._id || resident.roomId || "",
        }} onSubmit={(values) => updateMutation.mutateAsync(values)}/>
    </Screen>);
}
