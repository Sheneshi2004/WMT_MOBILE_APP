import { Stack } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard', headerShown: false }} />
      <Stack.Screen name="rooms" options={{ title: 'Room Management' }} />
      <Stack.Screen name="residents" options={{ title: 'Resident Management' }} />
      <Stack.Screen name="payments" options={{ title: 'Payments' }} />
      <Stack.Screen name="complaints" options={{ title: 'Complaints' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Stack.Screen name="food" options={{ title: 'Food Management' }} />
      <Stack.Screen name="cleaning" options={{ title: 'Cleaning Tasks' }} />
      <Stack.Screen name="visitors" options={{ title: 'Visitors' }} />
      <Stack.Screen name="profile" options={{ title: 'Settings' }} />
    </Stack>
  );
}
