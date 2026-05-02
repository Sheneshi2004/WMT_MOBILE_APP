import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResidentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { 
          backgroundColor: COLORS.surface, 
          borderTopWidth: 0,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 30 : 20,
          left: 20,
          right: 20,
          borderRadius: 25,
          height: 70,
          paddingBottom: Platform.OS === 'ios' ? 0 : 12,
          paddingTop: 10,
          // Premium Shadows
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          elevation: 12,
          // Glass-like border
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.05)',
        },
        tabBarLabelStyle: { 
          fontSize: 11, 
          fontWeight: '700', 
          marginBottom: 5,
          letterSpacing: 0.5
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <MaterialCommunityIcons name={focused ? "home-variant" : "home-variant-outline"} size={22} color={color} />
            </View>
          ) 
        }} 
      />
      <Tabs.Screen 
        name="room/index" 
        options={{ 
          title: 'My Room', 
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <MaterialCommunityIcons name={focused ? "door-open" : "door-closed"} size={22} color={color} />
            </View>
          ) 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : null}>
              <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={22} color={color} />
            </View>
          ) 
        }} 
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="payments" options={{ href: null }} />
      <Tabs.Screen name="complaints" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="cleaning" options={{ href: null }} />
      <Tabs.Screen name="food" options={{ href: null }} />
      <Tabs.Screen name="visitors" options={{ href: null }} />
      <Tabs.Screen name="rooms" options={{ href: null }} />
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="room/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconBg: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15', // Subtle amber glow when active
  }
});