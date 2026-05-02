import { Screen } from '@/components/common/Card.jsx';
import { useAuth } from '@/providers/AuthProvider.jsx';
import { attendanceService, complaintsService, paymentsService, visitorsService, } from '@/services/resources.js';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { useState } from "react";
export default function ResidentServices() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [complaintTitle, setComplaintTitle] = useState("");
    const complaints = useQuery({
        queryKey: ["residentComplaints", user?._id],
        queryFn: () => complaintsService.byResident(user._id),
        enabled: Boolean(user?._id),
    });
    const payments = useQuery({
        queryKey: ["residentPayments", user?._id],
        queryFn: () => paymentsService.byResident(user._id),
        enabled: Boolean(user?._id),
    });
    const attendance = useQuery({
        queryKey: ["residentAttendance", user?._id],
        queryFn: () => attendanceService.byResident(user._id),
        enabled: Boolean(user?._id),
    });
    const menu = useQuery({ queryKey: ["residentMenu"], queryFn: attendanceService.getFoodMenu });
    const newComplaint = useMutation({
        mutationFn: () => complaintsService.create({
            residentId: user?._id,
            category: "maintenance",
            title: complaintTitle || "General Issue",
            description: "Raised from resident mobile app",
            priority: "medium",
        }),
        onSuccess: () => {
            setComplaintTitle("");
            qc.invalidateQueries({ queryKey: ["residentComplaints", user?._id] });
        },
    });
    const createVisitor = useMutation({
        mutationFn: () => visitorsService.request({
            fullName: "Guest Visitor",
            phoneNumber: "0770000000",
            preferredVisitDate: new Date().toISOString(),
        }),
    });
    return (<Screen title="Resident Services">
      <Button mode="contained-tonal" onPress={() => router.push("/(resident)/visitors")}>
        Visitors Module
      </Button>
      <Button mode="contained-tonal" onPress={() => router.push("/(resident)/payments")}>
        Payments Module
      </Button>
      <Button mode="contained-tonal" onPress={() => router.push("/(resident)/complaints")}>
        Complaints Module
      </Button>
      <Button mode="contained-tonal" onPress={() => router.push("/(resident)/attendance")}>
        Attendance Module
      </Button>
      <Button mode="contained-tonal" onPress={() => router.push("/(resident)/food")}>
        Food Module
      </Button>
      <Card><Card.Content><Text variant="titleMedium">Complaints</Text><Text>Total: {complaints.data?.data?.length || 0}</Text></Card.Content></Card>
      <TextInput mode="outlined" label="Complaint title" value={complaintTitle} onChangeText={setComplaintTitle}/>
      <Button mode="contained" onPress={() => newComplaint.mutate()}>Submit Complaint</Button>
      <Card><Card.Content><Text variant="titleMedium">Payments</Text><Text>{JSON.stringify(payments.data || {}, null, 2)}</Text></Card.Content></Card>
      <Card><Card.Content><Text variant="titleMedium">Attendance</Text><Text>{JSON.stringify(attendance.data || {}, null, 2)}</Text></Card.Content></Card>
      <Card><Card.Content><Text variant="titleMedium">Food Menu</Text><Text>{JSON.stringify(menu.data || {}, null, 2)}</Text></Card.Content></Card>
      <Button mode="outlined" onPress={() => createVisitor.mutate()}>Create Visitor Request</Button>
    </Screen>);
}
