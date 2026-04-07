// app/(tabs)/_layout.js — con pestaña de Ligas
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#141414',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   '#C8FF00',
        tabBarInactiveTintColor: '#888888',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOY',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="ligas"
        options={{
          title: 'LIGAS',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'MAPA',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'PERFIL',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
