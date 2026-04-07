import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../constants/supabase';
import { loadState } from '../constants/storage';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const state = await loadState();

      if (session) {
        // Ya logueado -> ir a tabs directamente
        router.replace('/(tabs)');
      } else if (state.onboarded) {
        // Ya hizo onboarding pero no tiene sesion -> login
        router.replace('/login');
      } else {
        // Primera vez -> login
        router.replace('/login');
      }
      setChecking(false);
    })();
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#C8FF00" size="large" />
      </View>
    );
  }

  return null;
}
