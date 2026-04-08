import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEST_EXERCISES } from '../constants/program';
import { loadState, saveState } from '../constants/storage';

export default function TestScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const canGoBack = router.canGoBack?.() ?? true;
  const [results, setResults] = useState({});
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState(false);
  const [assignedWeek, setAssignedWeek] = useState(1);

  const ex = TEST_EXERCISES[step];

  function submitResult() {
    const val = parseInt(current) || 0;
    const newResults = { ...results, [ex.id]: val };
    setResults(newResults);
    setCurrent('');
    if (step < TEST_EXERCISES.length - 1) {
      setStep(step + 1);
    } else {
      calculateLevel(newResults);
    }
  }

  async function calculateLevel(r) {
    let week = 1;
    const t = TEST_EXERCISES;
    if (r['t5'] >= t[4].pass) week = t[4].skipTo;
    else if (r['t4'] >= t[3].pass) week = t[3].skipTo;
    else if (r['t1'] >= t[0].pass && r['t2'] >= t[1].pass && r['t3'] >= t[2].pass) week = t[0].skipTo;
    setAssignedWeek(week);
    const state = await loadState();
    state.currentWeek = week;
    state.testPassed = true;
    await saveState(state);
    setDone(true);
  }

  if (done) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.bigEmoji}>🎯</Text>
          <Text style={s.resultTitle}>¡Test completado!</Text>
          <Text style={s.resultSub}>Basándonos en tus resultados, empezarás en:</Text>
          <View style={s.weekBadge}>
            <Text style={s.weekNum}>Semana {assignedWeek}</Text>
          </View>
          <Text style={s.resultNote}>
            {assignedWeek === 1 ? 'Empezamos desde los fundamentos. ¡Es la base de todo!'
              : assignedWeek <= 8 ? '¡Buen nivel! Ya tienes una base sólida.'
              : assignedWeek <= 12 ? '¡Nivel avanzado! Vas a trabajar duro.'
              : '¡Nivel élite! Eres un atleta.'}
          </Text>
          <TouchableOpacity style={s.btnAccent} onPress={() => router.replace('/(tabs)')}>
            <Text style={s.btnAccentText}>Empezar programa →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe}>
        {canGoBack && (
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        )}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.progressRow}>
            {TEST_EXERCISES.map((_, i) => (
              <View key={i} style={[s.dot, i <= step && s.dotActive]} />
            ))}
          </View>
          <Text style={s.testLabel}>Ejercicio {step + 1} de {TEST_EXERCISES.length}</Text>
          <Text style={s.exEmoji}>{ex.emoji}</Text>
          <Text style={s.exName}>{ex.name}</Text>
          <Text style={s.exDesc}>{ex.desc}</Text>
          <View style={s.inputBox}>
            <Text style={s.inputLabel}>¿Cuántas {ex.unit} hiciste?</Text>
            <TextInput
              style={s.input}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#888888"
              value={current}
              onChangeText={setCurrent}
              autoFocus
            />
            <Text style={s.honest}>Sé honesto/a contigo mismo/a 🤝</Text>
          </View>
          <TouchableOpacity style={s.btnAccent} onPress={submitResult}>
            <Text style={s.btnAccentText}>
              {step < TEST_EXERCISES.length - 1 ? 'Siguiente →' : 'Ver mi nivel →'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setCurrent('0'); submitResult(); }} style={s.btnSkip}>
            <Text style={s.btnSkipText}>No pude hacer ninguna</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backBtnText: { color: '#C8FF00', fontSize: 14, fontWeight: '700' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, alignItems: 'center' },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 32, justifyContent: 'center' },
  dot: { width: 32, height: 6, borderRadius: 3, backgroundColor: '#242424' },
  dotActive: { backgroundColor: '#C8FF00' },
  testLabel: { fontSize: 12, color: '#888888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 20 },
  exEmoji: { fontSize: 72, textAlign: 'center', marginBottom: 12 },
  exName: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  exDesc: { fontSize: 15, color: '#BBBBBB', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  inputBox: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2A2A2A', width: '100%' },
  inputLabel: { fontSize: 13, color: '#888888', marginBottom: 8 },
  input: { fontSize: 40, fontWeight: '900', color: '#C8FF00', textAlign: 'center', padding: 8 },
  honest: { fontSize: 12, color: '#888888', textAlign: 'center', marginTop: 8 },
  btnAccent: { backgroundColor: '#C8FF00', borderRadius: 14, padding: 18, alignItems: 'center', width: '100%' },
  btnAccentText: { color: '#000', fontSize: 17, fontWeight: '800' },
  btnSkip: { padding: 16, alignItems: 'center' },
  btnSkipText: { color: '#888888', fontSize: 14 },
  bigEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginBottom: 8 },
  resultSub: { fontSize: 15, color: '#888888', textAlign: 'center', marginBottom: 24 },
  weekBadge: { backgroundColor: '#C8FF00', borderRadius: 20, paddingHorizontal: 32, paddingVertical: 16, marginBottom: 16 },
  weekNum: { fontSize: 28, fontWeight: '900', color: '#000' },
  resultNote: { fontSize: 14, color: '#BBBBBB', textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 16 },
});