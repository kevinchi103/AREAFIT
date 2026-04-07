import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../../constants/program';
import { loadState, saveState } from '../../constants/storage';

const PHASES = ['Principiante', 'Intermedio', 'Avanzado', 'Élite'];

export default function MapaScreen() {
  const [state, setState] = useState(null);

  useFocusEffect(useCallback(() => {
    loadState().then(setState);
  }, []));

  async function unlockNextWeek() {
    Alert.alert(
      '¿Pasar a la siguiente semana?',
      '¿Has completado todos los entrenamientos de esta semana?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '¡Sí, adelante!',
          onPress: async () => {
            const s = await loadState();
            if (s.currentWeek < 20) {
              s.currentWeek++;
              s.xp += 100;
              const xpNeeded = s.level * 200;
              if (s.xp >= xpNeeded) { s.xp -= xpNeeded; s.level++; }
              await saveState(s);
              loadState().then(setState);
            }
          }
        }
      ]
    );
  }

  if (!state) return <View style={s.loading}><Text style={{ color: '#888888' }}>Cargando...</Text></View>;

  const currentWeekData = WEEKS[state.currentWeek - 1];
  const phaseColor = PHASE_COLORS[currentWeekData?.phase] || '#C8FF00';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.title}>MAPA DE PROGRESO</Text>
        <Text style={s.sub}>20 semanas · 4 fases</Text>

        {/* Botón avanzar semana */}
        {state.currentWeek < 20 && (
          <TouchableOpacity style={[s.advanceBtn, { borderColor: phaseColor }]} onPress={unlockNextWeek}>
            <Text style={s.advanceBtnEmoji}>🚀</Text>
            <View style={s.advanceBtnInfo}>
              <Text style={[s.advanceBtnTitle, { color: phaseColor }]}>Pasar a semana {state.currentWeek + 1}</Text>
              <Text style={s.advanceBtnSub}>+100 XP al avanzar</Text>
            </View>
            <Text style={[s.advanceBtnArrow, { color: phaseColor }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* Leyenda de fases */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.legend}>
          {PHASES.map(p => (
            <View key={p} style={[s.legendPill, { borderColor: PHASE_COLORS[p] }]}>
              <View style={[s.legendDot, { backgroundColor: PHASE_COLORS[p] }]} />
              <Text style={[s.legendText, { color: PHASE_COLORS[p] }]}>{p}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Mapa de semanas */}
        <View style={s.mapWrap}>
          {WEEKS.map((w, i) => {
            const isCurrent = state.currentWeek === w.week;
            const isDone = state.currentWeek > w.week;
            const isLocked = state.currentWeek < w.week;
            const color = PHASE_COLORS[w.phase];
            const side = i % 2 === 0 ? 'left' : 'right';
            return (
              <View key={w.week} style={[s.nodeRow, side === 'right' && s.nodeRowRight]}>
                {i < WEEKS.length - 1 && (
                  <View style={[
                    s.connector,
                    side === 'left' ? s.connLeft : s.connRight,
                    { backgroundColor: isDone ? color : '#242424' }
                  ]} />
                )}
                <View style={[
                  s.node,
                  isCurrent && { borderColor: color, borderWidth: 3 },
                  isDone && { backgroundColor: color, borderWidth: 0 },
                  isLocked && s.nodeLocked,
                ]}>
                  {isDone
                    ? <Text style={s.nodeCheck}>✓</Text>
                    : <Text style={[s.nodeNum, isLocked && s.nodeNumLocked, isCurrent && { color }]}>{w.week}</Text>
                  }
                </View>
                <View style={[s.infoCard, isCurrent && { borderColor: color }]}>
                  <Text style={[s.infoWeek, { color: isDone ? color : isLocked ? '#888888' : color }]}>
                    {isDone ? '✅ ' : isCurrent ? '▶ ' : '🔒 '}Sem {w.week}
                  </Text>
                  <Text style={[s.infoName, isLocked && { color: '#888888' }]}>{w.name}</Text>
                  <View style={[s.infoPhase, { backgroundColor: isLocked ? '#242424' : color + '22' }]}>
                    <Text style={[s.infoPhaseText, { color: isLocked ? '#888888' : color }]}>{w.phase}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  loading: { flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', paddingHorizontal: 20, paddingTop: 20, letterSpacing: 2 },
  sub: { fontSize: 13, color: '#888888', paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  advanceBtn: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1.5 },
  advanceBtnEmoji: { fontSize: 28 },
  advanceBtnInfo: { flex: 1 },
  advanceBtnTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  advanceBtnSub: { fontSize: 12, color: '#888888' },
  advanceBtnArrow: { fontSize: 22, fontWeight: '900' },
  legend: { paddingLeft: 20, marginBottom: 24 },
  legendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '700' },
  mapWrap: { paddingHorizontal: 20, paddingBottom: 20 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16, position: 'relative' },
  nodeRowRight: { flexDirection: 'row-reverse' },
  connector: { position: 'absolute', width: 3, height: 60, left: 28, top: 50, borderRadius: 2 },
  connRight: { left: undefined, right: 28 },
  node: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1A', borderWidth: 2, borderColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nodeLocked: { opacity: 0.4 },
  nodeNum: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  nodeNumLocked: { color: '#888888' },
  nodeCheck: { fontSize: 22, color: '#000' },
  infoCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2A2A' },
  infoWeek: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  infoName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  infoPhase: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  infoPhaseText: { fontSize: 11, fontWeight: '700' },
});