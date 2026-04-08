import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../../constants/program';
import { GYM_WEEKS, GYM_PHASE_COLORS } from '../../constants/gymProgram';
import { loadState, saveState } from '../../constants/storage';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';

export default function MapaScreen() {
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);
  const router = useRouter();
  const [state, setState] = useState(null);

  const PHASES_KEYS = [
    { key: 'Principiante', label: t('map.beginner') },
    { key: 'Intermedio',   label: t('map.intermediate') },
    { key: 'Avanzado',     label: t('map.advanced') },
    { key: 'Élite',        label: t('map.elite') },
  ];

  useFocusEffect(useCallback(() => {
    loadState().then(setState);
  }, []));

  async function unlockNextWeek() {
    Alert.alert(
      t('map.nextWeek') + '?',
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'),
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
          },
        },
      ]
    );
  }

  if (!state) return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.gray }}>{t('common.loading')}</Text>
    </View>
  );

  const isGym      = state.trainingEnvironment === 'gym';
  const weeks      = isGym ? GYM_WEEKS : WEEKS;
  const phaseColors = isGym ? GYM_PHASE_COLORS : PHASE_COLORS;

  const currentWeekData = weeks[state.currentWeek - 1] || weeks[0];
  const phaseColor = phaseColors[currentWeekData?.phase] || theme.accent;

  const translatePhase = (phase) => {
    const found = PHASES_KEYS.find(p => p.key === phase);
    return found ? found.label : phase;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20 }}>
          <View>
            <Text style={[s.title, { color: theme.white }]}>{t('map.title')}</Text>
            <Text style={[s.sub, { color: theme.gray }]}>
              20 {t('map.week').toLowerCase()}s · 4 fases · {isGym ? '🏋️ Gym' : '🏠 Casa'}
            </Text>
          </View>
          {/* Test de nivel */}
          <TouchableOpacity
            onPress={() => router.push('/test')}
            style={[s.testBtn, { backgroundColor: theme.bgCard, borderColor: phaseColor }]}
          >
            <Text style={{ fontSize: 14 }}>🎯</Text>
            <Text style={[s.testBtnText, { color: phaseColor }]}>Test{'\n'}nivel</Text>
          </TouchableOpacity>
        </View>

        {/* Advance button */}
        {state.currentWeek < 20 && (
          <TouchableOpacity
            style={[s.advanceBtn, { backgroundColor: theme.bgCard, borderColor: phaseColor }]}
            onPress={unlockNextWeek}
          >
            <Text style={s.advanceBtnEmoji}>🚀</Text>
            <View style={s.advanceBtnInfo}>
              <Text style={[s.advanceBtnTitle, { color: phaseColor }]}>{t('map.nextWeek')} {state.currentWeek + 1}</Text>
              <Text style={[s.advanceBtnSub, { color: theme.gray }]}>+100 XP</Text>
            </View>
            <Text style={[s.advanceBtnArrow, { color: phaseColor }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* Legend */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.legend}>
          {PHASES_KEYS.map(p => (
            <View key={p.key} style={[s.legendPill, { borderColor: phaseColors[p.key] || theme.border }]}>
              <View style={[s.legendDot, { backgroundColor: phaseColors[p.key] || theme.gray }]} />
              <Text style={[s.legendText, { color: phaseColors[p.key] || theme.gray }]}>{p.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Map */}
        <View style={s.mapWrap}>
          {weeks.map((w, i) => {
            const isCurrent = state.currentWeek === w.week;
            const isDone    = state.currentWeek > w.week;
            const isLocked  = state.currentWeek < w.week;
            const color     = phaseColors[w.phase] || theme.accent;
            const side      = i % 2 === 0 ? 'left' : 'right';
            return (
              <View key={w.week} style={[s.nodeRow, side === 'right' && s.nodeRowRight]}>
                {i < weeks.length - 1 && (
                  <View style={[
                    s.connector,
                    side === 'left' ? s.connLeft : s.connRight,
                    { backgroundColor: isDone ? color : theme.bgLight },
                  ]} />
                )}
                <View style={[
                  s.node, { backgroundColor: theme.bgCard, borderColor: theme.border },
                  isCurrent && { borderColor: color, borderWidth: 3 },
                  isDone    && { backgroundColor: color, borderWidth: 0 },
                  isLocked  && { opacity: 0.4 },
                ]}>
                  {isDone
                    ? <Text style={{ fontSize: 22, color: isDark ? '#000' : '#fff' }}>✓</Text>
                    : <Text style={[s.nodeNum, { color: theme.white }, isLocked && { color: theme.gray }, isCurrent && { color }]}>{w.week}</Text>
                  }
                </View>
                <View style={[
                  s.infoCard,
                  { backgroundColor: theme.bgCard, borderColor: theme.border },
                  isCurrent && { borderColor: color },
                ]}>
                  <Text style={[s.infoWeek, { color: isDone ? color : isLocked ? theme.gray : color }]}>
                    {isDone ? '✅ ' : isCurrent ? '▶ ' : '🔒 '}{t('map.week')} {w.week}
                  </Text>
                  <Text style={[s.infoName, { color: theme.white }, isLocked && { color: theme.gray }]}>{w.name}</Text>
                  <View style={[s.infoPhase, { backgroundColor: isLocked ? theme.bgLight : color + '22' }]}>
                    <Text style={[s.infoPhaseText, { color: isLocked ? theme.gray : color }]}>{translatePhase(w.phase)}</Text>
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
  title: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  testBtn: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, alignItems: 'center', gap: 4 },
  testBtnText: { fontSize: 10, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  advanceBtn: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, borderWidth: 1.5 },
  advanceBtnEmoji: { fontSize: 28 },
  advanceBtnInfo: { flex: 1 },
  advanceBtnTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  advanceBtnSub: { fontSize: 12 },
  advanceBtnArrow: { fontSize: 22, fontWeight: '900' },
  legend: { paddingLeft: 20, marginBottom: 24 },
  legendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '700' },
  mapWrap: { paddingHorizontal: 20, paddingBottom: 20 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16, position: 'relative' },
  nodeRowRight: { flexDirection: 'row-reverse' },
  connector: { position: 'absolute', width: 3, height: 60, left: 28, top: 50, borderRadius: 2 },
  connLeft: {},
  connRight: { left: undefined, right: 28 },
  node: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nodeNum: { fontSize: 18, fontWeight: '900' },
  infoCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1 },
  infoWeek: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  infoName: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  infoPhase: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  infoPhaseText: { fontSize: 11, fontWeight: '700' },
});
