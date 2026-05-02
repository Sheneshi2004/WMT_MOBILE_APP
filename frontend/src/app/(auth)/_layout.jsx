import { Stack } from 'expo-router';
import { COLORS } from '../../constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="visit" options={{ title: 'Schedule a Visit' }} />
      <Stack.Screen name="rooms" options={{ title: 'Available Rooms' }} />
    </Stack>
  );
}