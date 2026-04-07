import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../constants/theme';
import { loadState, saveState, saveProfile } from '../constants/storage';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  async function startFromZero() {
    const state = await loadState();
    state.onboarded = true;
    state.currentWeek = 1;
    await saveState(state);
    if (name) await saveProfile({ name, photoUri: null, height: '', startWeight: '', goal: '' });
    router.replace('/(tabs)');
  }

  async function goToTest() {
    const state = await loadState();
    state.onboarded = true;
    await saveState(state);
    if (name) await saveProfile({ name, photoUri: null, height: '', startWeight: '', goal: '' });
    router.replace('/test');
  }

  if (step === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.logo}>AREAFIT</Text>
          <Text style={s.tagline}>Tu transformación en 20 semanas</Text>
          <View style={s.divider} />
          <Text style={s.sub}>El programa que se adapta a ti.{'\n'}Sin gimnasio. Sin excusas.</Text>
          <TouchableOpacity style={s.btnAccent} onPress={() => setStep(1)}>
            <Text style={s.btnAccentText}>Comenzar →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={s.safe}>
          <View style={s.center}>
            <Text style={s.question}>¿Cómo te llamas?</Text>
            <TextInput
              style={s.input}
              placeholder="Tu nombre..."
              placeholderTextColor={C.gray}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={[s.btnAccent, { marginTop: 24 }]} onPress={() => setStep(2)}>
              <Text style={s.btnAccentText}>{name ? `Hola ${name} →` : 'Continuar →'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <Text style={s.question}>
          {name ? `${name}, ¿tienes` : '¿Tienes'}{'\n'}experiencia entrenando?
        </Text>
        <Text style={s.hint}>Sé sincero/a. El programa se adaptará a tu nivel.</Text>
        <TouchableOpacity style={s.optionCard} onPress={startFromZero}>
          <Text style={s.optionEmoji}>🌱</Text>
          <View style={s.optionInfo}>
            <Text style={s.optionTitle}>Empezar desde cero</Text>
            <Text style={s.optionDesc}>Nunca he entrenado o llevo mucho tiempo parado</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[s.optionCard, s.optionCardAccent]} onPress={goToTest}>
          <Text style={s.optionEmoji}>⚡</Text>
          <View style={s.optionInfo}>
            <Text style={[s.optionTitle, { color: C.accent }]}>Hacer el test de nivel</Text>
            <Text style={s.optionDesc}>Tengo experiencia y quiero saltar semanas</Text>
          </View>
        </TouchableOpacity>
        <Text style={s.note}>El test consiste en hacer los ejercicios reales{'\n'}y decir cuántos pudiste hacer. ¡Sé honesto/a!</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 48, fontWeight: '900', color: '#C8FF00', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#BBBBBB', textAlign: 'center', marginBottom: 24 },
  divider: { height: 1, backgroundColor: '#2A2A2A', marginBottom: 24 },
  sub: { fontSize: 15, color: '#888888', textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  btnAccent: { backgroundColor: '#C8FF00', borderRadius: 14, padding: 18, alignItems: 'center' },
  btnAccentText: { color: '#000', fontSize: 17, fontWeight: '800' },
  question: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 24, lineHeight: 36 },
  hint: { fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, fontSize: 18, color: '#FFFFFF', borderWidth: 1, borderColor: '#2A2A2A' },
  optionCard: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A2A' },
  optionCardAccent: { borderColor: '#C8FF00' },
  optionEmoji: { fontSize: 32 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  optionDesc: { fontSize: 13, color: '#888888', lineHeight: 18 },
  note: { fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 24, lineHeight: 18 },
});