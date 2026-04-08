import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState, saveProfile } from '../constants/storage';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

export default function Onboarding() {
  const router = useRouter();
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState(null);
  const [fitnessLevel, setFitnessLevel] = useState(null);
  const [duration, setDuration] = useState(null);
  const [goal, setGoal] = useState(null);

  const totalSteps = 5;

  async function finishOnboarding(skipToWeek = 1) {
    const state = await loadState();
    state.onboarded = true;
    state.currentWeek = skipToWeek;
    state.trainingEnvironment = environment || 'home';
    state.fitnessLevel = fitnessLevel || 'mid';
    state.workoutDuration = duration || 60;
    state.daysPerWeek = 4;
    await saveState(state);
    await saveProfile({
      name: name || '', photoUri: null, height: '', startWeight: '',
      goal: goal || '', benchPress: '', squat: '', availableTime: String(duration || 60),
    });
    router.replace('/(tabs)');
  }

  async function goToTest() {
    const state = await loadState();
    state.onboarded = true;
    state.trainingEnvironment = environment || 'home';
    state.fitnessLevel = fitnessLevel || 'mid';
    state.workoutDuration = duration || 60;
    await saveState(state);
    await saveProfile({
      name: name || '', photoUri: null, height: '', startWeight: '',
      goal: goal || '', benchPress: '', squat: '', availableTime: String(duration || 60),
    });
    router.replace('/test');
  }

  // ── Step indicator ──
  function StepBar() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View key={i} style={{
            width: i <= step ? 28 : 12, height: 4, borderRadius: 2,
            backgroundColor: i < step ? theme.success : i === step ? theme.accent : theme.border,
          }} />
        ))}
      </View>
    );
  }

  // ── Step 0: Welcome ──
  if (step === 0) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.center}>
          <Text style={[s.logo, { color: theme.accent }]}>HAB</Text>
          <Text style={[s.tagline, { color: theme.grayLight }]}>Construye tu hábito fitness</Text>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <View style={{ gap: 14, marginBottom: 48 }}>
            <Feature icon="🎯" text="Plan personalizado a tu nivel" theme={theme} />
            <Feature icon="📈" text="Progresión inteligente automática" theme={theme} />
            <Feature icon="🏆" text="Compite en ligas semanales" theme={theme} />
            <Feature icon="🔥" text="Construye tu racha de hábito" theme={theme} />
          </View>
          <TouchableOpacity style={[s.btnAccent, { backgroundColor: theme.accent }]} onPress={() => setStep(1)}>
            <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>Empezar →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 1: Nombre ──
  if (step === 1) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
          <View style={s.center}>
            <StepBar />
            <Text style={[s.question, { color: theme.white }]}>¿Cómo te llamas?</Text>
            <TextInput
              style={[s.input, { backgroundColor: theme.bgCard, color: theme.white, borderColor: theme.border }]}
              placeholder="Tu nombre..."
              placeholderTextColor={theme.gray}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity
              style={[s.btnAccent, { backgroundColor: name ? theme.accent : theme.border, marginTop: 24 }]}
              onPress={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
            >
              <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>
                {name ? `Hola ${name} →` : 'Escribe tu nombre'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Step 2: Entorno ──
  if (step === 2) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.center}>
          <StepBar />
          <Text style={[s.question, { color: theme.white }]}>¿Dónde entrenas?</Text>
          <Text style={[s.hint, { color: theme.gray }]}>Adaptaremos los ejercicios a tu entorno</Text>

          <Option emoji="🏠" title="En casa" desc="Peso corporal, mancuernas y bandas"
            selected={environment === 'home'} onPress={() => setEnvironment('home')} theme={theme} />
          <Option emoji="🏋️" title="Gimnasio" desc="Máquinas, barras, poleas y cardio"
            selected={environment === 'gym'} onPress={() => setEnvironment('gym')} theme={theme} />

          <TouchableOpacity
            style={[s.btnAccent, { backgroundColor: environment ? theme.accent : theme.border, marginTop: 16 }]}
            onPress={() => environment && setStep(3)}
            disabled={!environment}
          >
            <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 3: Nivel ──
  if (step === 3) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <ScrollView contentContainerStyle={s.center}>
          <StepBar />
          <Text style={[s.question, { color: theme.white }]}>¿Cuál es tu nivel?</Text>
          <Text style={[s.hint, { color: theme.gray }]}>Sé sincero/a — el plan se adapta a ti</Text>

          <Option emoji="🌱" title="Principiante" desc="Nunca he entrenado o llevo tiempo parado"
            selected={fitnessLevel === 'low'} onPress={() => setFitnessLevel('low')} theme={theme} />
          <Option emoji="💪" title="Intermedio" desc="Entreno de vez en cuando, conozco los ejercicios"
            selected={fitnessLevel === 'mid'} onPress={() => setFitnessLevel('mid')} theme={theme} />
          <Option emoji="🔥" title="Avanzado" desc="Entreno regularmente, busco más intensidad"
            selected={fitnessLevel === 'high'} onPress={() => setFitnessLevel('high')} theme={theme} />

          <TouchableOpacity
            style={[s.btnAccent, { backgroundColor: fitnessLevel ? theme.accent : theme.border, marginTop: 16 }]}
            onPress={() => fitnessLevel && setStep(4)}
            disabled={!fitnessLevel}
          >
            <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>Continuar →</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Step 4: Duración + Objetivo → Finalizar ──
  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={s.center}>
        <StepBar />
        <Text style={[s.question, { color: theme.white }]}>¿Cuánto tiempo tienes?</Text>
        <Text style={[s.hint, { color: theme.gray }]}>El entrenamiento se adapta a tu disponibilidad</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[{ min: 30, label: '30 min', desc: 'Rápido' }, { min: 60, label: '1 hora', desc: 'Estándar' }, { min: 90, label: '1h 30', desc: 'Avanzado' }].map(opt => (
            <TouchableOpacity
              key={opt.min}
              style={[s.durationCard, {
                backgroundColor: duration === opt.min ? theme.accent + '15' : theme.bgCard,
                borderColor: duration === opt.min ? theme.accent : theme.border,
              }]}
              onPress={() => setDuration(opt.min)}
            >
              <Text style={{ fontSize: 24, fontWeight: '900', color: duration === opt.min ? theme.accent : theme.white }}>
                {opt.label}
              </Text>
              <Text style={{ fontSize: 11, color: theme.gray, marginTop: 4 }}>{opt.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.question, { color: theme.white, fontSize: 22, marginBottom: 12 }]}>¿Cuál es tu objetivo?</Text>

        <View style={{ gap: 10, marginBottom: 24 }}>
          {[
            { key: 'lose_weight', emoji: '🔥', title: 'Perder peso' },
            { key: 'gain_muscle', emoji: '💪', title: 'Ganar músculo' },
            { key: 'get_fit',     emoji: '⚡', title: 'Ponerme en forma' },
            { key: 'maintain',    emoji: '🏋️', title: 'Mantenerme' },
          ].map(g => (
            <TouchableOpacity
              key={g.key}
              style={[s.goalPill, {
                backgroundColor: goal === g.key ? theme.accent + '15' : theme.bgCard,
                borderColor: goal === g.key ? theme.accent : theme.border,
              }]}
              onPress={() => setGoal(g.key)}
            >
              <Text style={{ fontSize: 20 }}>{g.emoji}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: goal === g.key ? theme.accent : theme.white }}>{g.title}</Text>
              {goal === g.key && <Text style={{ color: theme.accent, fontSize: 16, marginLeft: 'auto' }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[s.btnAccent, { backgroundColor: (duration && goal) ? theme.accent : theme.border }]}
          onPress={() => (duration && goal) && finishOnboarding(fitnessLevel === 'high' ? 5 : 1)}
          disabled={!duration || !goal}
        >
          <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>Crear mi plan →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ padding: 16, alignItems: 'center' }} onPress={goToTest}>
          <Text style={{ fontSize: 13, color: theme.accent, fontWeight: '700' }}>🎯 Quiero hacer el test de nivel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ icon, text, theme }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Text style={{ fontSize: 22, width: 32, textAlign: 'center' }}>{icon}</Text>
      <Text style={{ fontSize: 15, color: theme.grayLight, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

function Option({ emoji, title, desc, selected, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[s.optionCard, { backgroundColor: theme.bgCard, borderColor: selected ? theme.accent : theme.border }]}
      onPress={onPress}
    >
      <Text style={s.optionEmoji}>{emoji}</Text>
      <View style={s.optionInfo}>
        <Text style={[s.optionTitle, { color: selected ? theme.accent : theme.white }]}>{title}</Text>
        <Text style={[s.optionDesc, { color: theme.gray }]}>{desc}</Text>
      </View>
      {selected && <Text style={{ color: theme.accent, fontSize: 20 }}>✓</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 56, fontWeight: '900', letterSpacing: 6, textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: 'center', marginBottom: 28 },
  divider: { height: 1, marginBottom: 28 },
  btnAccent: { borderRadius: 14, padding: 18, alignItems: 'center' },
  btnAccentText: { fontSize: 17, fontWeight: '800' },
  question: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 16, lineHeight: 36 },
  hint: { fontSize: 13, textAlign: 'center', marginBottom: 24 },
  input: { borderRadius: 12, padding: 16, fontSize: 18, borderWidth: 1 },
  optionCard: { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12, borderWidth: 1.5 },
  optionEmoji: { fontSize: 32 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  optionDesc: { fontSize: 13, lineHeight: 18 },
  durationCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5 },
  goalPill: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 16, borderWidth: 1.5 },
});
