import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../constants/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !password) { Alert.alert('Error', 'Rellena email y contraseña'); return; }
    setLoading(true);
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            email,
            name: name || email.split('@')[0],
            level: 1,
            xp: 0,
            streak: 0,
            current_week: 1,
            is_premium: false,
            trust_score: 100,
          });
          Alert.alert('¡Cuenta creada!', 'Revisa tu email para confirmar tu cuenta.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.logo}>AREAFIT</Text>
          <Text style={s.tagline}>{isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}</Text>

          {isRegister && (
            <TextInput
              style={s.input}
              placeholder="Tu nombre"
              placeholderTextColor="#888888"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={s.input}
            placeholder="Contraseña"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[s.btnMain, loading && { opacity: 0.6 }]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={s.btnMainText}>
              {loading ? 'Cargando...' : isRegister ? 'Crear cuenta' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.switchBtn} onPress={() => setIsRegister(!isRegister)}>
            <Text style={s.switchText}>
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 48, fontWeight: '900', color: '#C8FF00', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#888888', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, fontSize: 16, color: '#FFFFFF', borderWidth: 1, borderColor: '#2A2A2A', marginBottom: 14 },
  btnMain: { backgroundColor: '#C8FF00', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 8 },
  btnMainText: { color: '#000', fontSize: 17, fontWeight: '800' },
  switchBtn: { padding: 16, alignItems: 'center' },
  switchText: { color: '#888888', fontSize: 14 },
});