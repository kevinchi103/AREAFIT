import { useEffect, useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Text, View, ActivityIndicator } from 'react-native';
import { supabase, ADMIN_EMAIL } from '../../constants/supabase';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';

export default function TabsLayout() {
  const router = useRouter();
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setIsAdmin(session.user.email === ADMIN_EMAIL);
      }
      setChecking(false);
    });
  }, []);

  if (checking) return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.accent} size="large" />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgCard,
          borderTopColor: theme.border,
          borderTopWidth: 0.5,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.gray,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="ligas"
        options={{
          title: t('tabs.leagues'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺️</Text>,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: t('tabs.admin'),
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📊</Text>,
          href: isAdmin ? '/admin' : null,
        }}
      />
    </Tabs>
  );
}
