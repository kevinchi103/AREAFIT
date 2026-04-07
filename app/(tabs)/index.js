import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../../constants/program';
import { loadState, loadProfile, saveState } from '../../constants/storage';

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getWeekTrainedDays(completedDays) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toDateString();
    return (completedDays || []).some(key => key.endsWith(dateStr));
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const [state, setState] = useState(null);
  const [profile, setProfile] = useState(null);

  useFocusEffect(useCallback(() => {
    loadState().then(setState);
    loadProfile().then(setProfile);
  }, []));

  if (!state) return <View style={s.loading}><Text style={{ color: '#888888' }}>Cargando...</Text></View>;

  const weekData = WEEKS[Math.min(state.currentWeek - 1, WEEKS.length - 1)];
  const xpNeeded = state.level * 200;
  const xpPct = Math.min(state.xp / xpNeeded, 1);
  const phaseColor = PHASE_COLORS[weekData.phase] || '#C8FF00';
  const today = new Date().toDateString();
  const trainedDays = getWeekTrainedDays(state.completedDays);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hola{profile?.name ? `, ${profile.name}` : ''} 👋</Text>
            <Text style={s.sub}>Semana {state.currentWeek} · {weekData.phase}</Text>
          </View>
          <View style={s.streakBox}>
            <Text style={s.streakNum}>{state.streak}</Text>
            <Text style={s.streakFire}>🔥</Text>
          </View>
        </View>

        {/* Racha semanal */}
        <View style={s.streakCard}>
          <View style={s.streakCardHeader}>
            <Text style={s.streakCardTitle}>Racha semanal</Text>
            <Text style={s.streakCardSub}>{state.streak} días consecutivos 🔥</Text>
          </View>
          <View style={s.daysRow}>
            {DAYS.map((day, i) => {
              const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
              const trained = trainedDays[i];
              return (
                <View key={i} style={s.dayItem}>
                  <View style={[
                    s.dayCircle,
                    trained && s.dayCircleDone,
                    isToday && !trained && s.dayCircleToday,
                  ]}>
                    <Text style={[s.dayCircleText, trained && s.dayCircleTextDone]}>
                      {trained ? '✓' : day}
                    </Text>
                  </View>
                  <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* XP Bar */}
        <View style={s.xpWrap}>
          <View style={s.xpRow}>
            <Text style={s.xpLvl}>Nivel {state.level}</Text>
            <Text style={s.xpCount}>{state.xp} / {xpNeeded} XP</Text>
          </View>
          <View style={s.xpTrack}>
            <View style={[s.xpFill, { width: `${Math.round(xpPct * 100)}%`, backgroundColor: phaseColor }]} />
          </View>
        </View>

        {/* Week hero */}
        <View style={[s.weekHero, { borderColor: phaseColor }]}>
          <View style={[s.phasePill, { backgroundColor: phaseColor }]}>
            <Text style={s.phaseText}>{weekData.phase}</Text>
          </View>
          <Text style={s.weekTitle}>Semana {state.currentWeek}</Text>
          <Text style={s.weekName}>{weekData.name}</Text>
        </View>

        {/* Workouts */}
        <Text style={s.sectionTitle}>ENTRENAMIENTOS</Text>
        {weekData.workouts.map((w, i) => {
          const dayKey = `${w.id}_${today}`;
          const done = state.completedDays?.includes(dayKey);
          return (
            <TouchableOpacity
              key={w.id}
              style={[s.workoutCard, done && s.workoutDone]}
              onPress={() => !done && router.push({ pathname: '/workout', params: { id: w.id, week: state.currentWeek - 1 } })}
              activeOpacity={done ? 1 : 0.7}
            >
              <View style={[s.dayBadge, { backgroundColor: done ? '#242424' : phaseColor }]}>
                <Text style={[s.dayNum, { color: done ? '#888888' : '#000' }]}>D{i + 1}</Text>
              </View>
              <View style={s.workoutInfo}>
                <Text style={[s.workoutName, done && s.textDone]}>{w.emoji} {w.name}</Text>
                <Text style={s.workoutMeta}>{w.exercises.length} ejercicios</Text>
              </View>
              {done
                ? <Text style={s.checkmark}>✅</Text>
                : <Text style={[s.arrow, { color: phaseColor }]}>→</Text>
              }
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F0F' },
  loading: { flex: 1, backgroundColor: '#0F0F0F', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  sub: { fontSize: 13, color: '#888888', marginTop: 2 },
  streakBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 4, borderWidth: 1, borderColor: '#2A2A2A' },
  streakNum: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  streakFire: { fontSize: 18 },
  streakCard: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A' },
  streakCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  streakCardTitle: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  streakCardSub: { fontSize: 12, color: '#C8FF00', fontWeight: '700' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 4 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#242424', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  dayCircleDone: { backgroundColor: '#C8FF00', borderColor: '#C8FF00' },
  dayCircleToday: { borderColor: '#C8FF00', borderWidth: 2 },
  dayCircleText: { fontSize: 12, fontWeight: '700', color: '#888888' },
  dayCircleTextDone: { color: '#000000' },
  dayLabel: { fontSize: 10, color: '#888888', fontWeight: '600' },
  dayLabelToday: { color: '#C8FF00' },
  xpWrap: { paddingHorizontal: 20, marginBottom: 20 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLvl: { fontSize: 12, fontWeight: '700', color: '#888888' },
  xpCount: { fontSize: 12, color: '#888888' },
  xpTrack: { height: 6, backgroundColor: '#242424', borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 99 },
  weekHero: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1 },
  phasePill: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  phaseText: { fontSize: 11, fontWeight: '800', color: '#000', letterSpacing: 0.5 },
  weekTitle: { fontSize: 13, color: '#888888', fontWeight: '600', marginBottom: 4 },
  weekName: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#888888', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 12 },
  workoutCard: { marginHorizontal: 20, backgroundColor: '#1A1A1A', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  workoutDone: { opacity: 0.5 },
  dayBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 14, fontWeight: '900' },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  textDone: { color: '#888888' },
  workoutMeta: { fontSize: 12, color: '#888888' },
  checkmark: { fontSize: 20 },
  arrow: { fontSize: 20, fontWeight: '900' },
});