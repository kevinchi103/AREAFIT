import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../../constants/program';
import { loadState, loadProfile, saveState } from '../../constants/storage';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';
import { fetchMyAssignmentsToday } from '../../constants/customWorkouts';
import { getUnreadCount } from '../../constants/notifications';

function getWeekTrainedDays(completedDays) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toDateString();
    return (completedDays || []).some(key => key.endsWith(dateStr));
  });
}

export default function HomeScreen() {
  const router = useRouter();
  const { t, days, isDark } = useSettings();
  const theme = getTheme(isDark);
  const [state, setState] = useState(null);
  const [profile, setProfile] = useState(null);
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(useCallback(() => {
    loadState().then(setState);
    loadProfile().then(setProfile);
    fetchMyAssignmentsToday().then(setCustomWorkouts).catch(() => {});
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, []));

  if (!state) return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: theme.gray }}>{t('home.loading')}</Text>
    </View>
  );

  const weekData = WEEKS[Math.min(state.currentWeek - 1, WEEKS.length - 1)];
  const xpNeeded = state.level * 200;
  const xpPct = Math.min(state.xp / xpNeeded, 1);
  const phaseColor = PHASE_COLORS[weekData.phase] || theme.accent;
  const today = new Date().toDateString();
  const trainedDays = getWeekTrainedDays(state.completedDays);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.header, { }]}>
          <View>
            <Text style={[s.greeting, { color: theme.white }]}>
              {t('home.hello')}{profile?.name ? `, ${profile.name}` : ''} 👋
            </Text>
            <Text style={[s.sub, { color: theme.gray }]}>
              {t('home.week')} {state.currentWeek} · {weekData.phase}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[s.bellBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={[s.streakBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[s.streakNum, { color: theme.white }]}>{state.streak}</Text>
              <Text style={s.streakFire}>🔥</Text>
            </View>
          </View>
        </View>

        {/* Racha semanal */}
        <View style={[s.streakCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <View style={s.streakCardHeader}>
            <Text style={[s.streakCardTitle, { color: theme.white }]}>{t('home.weeklyStreak')}</Text>
            <Text style={[s.streakCardSub, { color: theme.accent }]}>
              {state.streak} {t('home.consecutiveDays')} 🔥
            </Text>
          </View>
          <View style={s.daysRow}>
            {days.map((day, i) => {
              const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
              const trained = trainedDays[i];
              return (
                <View key={i} style={s.dayItem}>
                  <View style={[
                    s.dayCircle, { backgroundColor: theme.bgLight, borderColor: theme.border },
                    trained && { backgroundColor: theme.accent, borderColor: theme.accent },
                    isToday && !trained && { borderColor: theme.accent, borderWidth: 2 },
                  ]}>
                    <Text style={[
                      s.dayCircleText, { color: theme.gray },
                      trained && { color: isDark ? '#000' : '#fff' },
                    ]}>
                      {trained ? '✓' : day}
                    </Text>
                  </View>
                  <Text style={[s.dayLabel, { color: theme.gray }, isToday && { color: theme.accent }]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* XP Bar */}
        <View style={s.xpWrap}>
          <View style={s.xpRow}>
            <Text style={[s.xpLvl, { color: theme.gray }]}>{t('home.level')} {state.level}</Text>
            <Text style={[s.xpCount, { color: theme.gray }]}>{state.xp} / {xpNeeded} XP</Text>
          </View>
          <View style={[s.xpTrack, { backgroundColor: theme.bgLight }]}>
            <View style={[s.xpFill, { width: `${Math.round(xpPct * 100)}%`, backgroundColor: phaseColor }]} />
          </View>
        </View>

        {/* Week hero */}
        <View style={[s.weekHero, { backgroundColor: theme.bgCard, borderColor: phaseColor }]}>
          <View style={[s.phasePill, { backgroundColor: phaseColor }]}>
            <Text style={[s.phaseText, { color: isDark ? '#000' : '#fff' }]}>{weekData.phase}</Text>
          </View>
          <Text style={[s.weekTitle, { color: theme.gray }]}>{t('home.week')} {state.currentWeek}</Text>
          <Text style={[s.weekName, { color: theme.white }]}>{weekData.name}</Text>
        </View>

        {/* Custom workouts from trainer */}
        {customWorkouts.length > 0 && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12, gap: 8 }}>
              <Text style={[s.sectionTitle, { color: theme.accent, marginBottom: 0, paddingHorizontal: 0 }]}>📋 PERSONALIZADO</Text>
              <View style={{ backgroundColor: theme.accent + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.accent }}>ENTRENADOR</Text>
              </View>
            </View>
            {customWorkouts.map(a => {
              const cw = a.custom_workouts;
              if (!cw) return null;
              const dayKey = `custom_${cw.id}_${today}`;
              const done = state.completedDays?.includes(dayKey);
              const exercises = cw.exercises || [];
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[s.workoutCard, { backgroundColor: theme.bgCard, borderColor: theme.accent + '40' }, done && { opacity: 0.5 }]}
                  onPress={() => !done && router.push({ pathname: '/workout', params: { customId: cw.id, customData: JSON.stringify(cw), assignmentNotes: a.notes || '' } })}
                  activeOpacity={done ? 1 : 0.7}
                >
                  <View style={[s.dayBadge, { backgroundColor: done ? theme.bgLight : theme.accent }]}>
                    <Text style={[s.dayNum, { color: done ? theme.gray : (isDark ? '#000' : '#fff') }]}>📋</Text>
                  </View>
                  <View style={s.workoutInfo}>
                    <Text style={[s.workoutName, { color: theme.white }, done && { color: theme.gray }]}>
                      {cw.name}
                    </Text>
                    <Text style={[s.workoutMeta, { color: theme.gray }]}>
                      {exercises.length} {t('home.exercises')}
                      {cw.xp_multiplier > 1 ? ` · ⚡ x${cw.xp_multiplier} XP` : ''}
                    </Text>
                    {a.notes ? <Text style={{ fontSize: 11, color: theme.accent, marginTop: 2 }}>💬 {a.notes}</Text> : null}
                  </View>
                  {done
                    ? <Text style={s.checkmark}>✅</Text>
                    : <Text style={[s.arrow, { color: theme.accent }]}>→</Text>
                  }
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 12 }} />
          </>
        )}

        {/* Program Workouts */}
        <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('home.workouts')}</Text>
        {weekData.workouts.map((w, i) => {
          const dayKey = `${w.id}_${today}`;
          const done = state.completedDays?.includes(dayKey);
          return (
            <TouchableOpacity
              key={w.id}
              style={[s.workoutCard, { backgroundColor: theme.bgCard, borderColor: theme.border }, done && { opacity: 0.5 }]}
              onPress={() => !done && router.push({ pathname: '/workout', params: { id: w.id, week: state.currentWeek - 1 } })}
              activeOpacity={done ? 1 : 0.7}
            >
              <View style={[s.dayBadge, { backgroundColor: done ? theme.bgLight : phaseColor }]}>
                <Text style={[s.dayNum, { color: done ? theme.gray : (isDark ? '#000' : '#fff') }]}>D{i + 1}</Text>
              </View>
              <View style={s.workoutInfo}>
                <Text style={[s.workoutName, { color: theme.white }, done && { color: theme.gray }]}>
                  {w.emoji} {w.name}
                </Text>
                <Text style={[s.workoutMeta, { color: theme.gray }]}>
                  {w.exercises.length} {t('home.exercises')}
                </Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '900' },
  sub: { fontSize: 13, marginTop: 2 },
  streakBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 4, borderWidth: 1 },
  streakNum: { fontSize: 20, fontWeight: '900' },
  streakFire: { fontSize: 18 },
  streakCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
  streakCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  streakCardTitle: { fontSize: 13, fontWeight: '700' },
  streakCardSub: { fontSize: 12, fontWeight: '700' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 4 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dayCircleText: { fontSize: 12, fontWeight: '700' },
  dayLabel: { fontSize: 10, fontWeight: '600' },
  xpWrap: { paddingHorizontal: 20, marginBottom: 20 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLvl: { fontSize: 12, fontWeight: '700' },
  xpCount: { fontSize: 12 },
  xpTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 99 },
  weekHero: { marginHorizontal: 20, borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1 },
  phasePill: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  phaseText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  weekTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  weekName: { fontSize: 26, fontWeight: '900' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 12 },
  workoutCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, borderWidth: 1 },
  dayBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 14, fontWeight: '900' },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  workoutMeta: { fontSize: 12 },
  checkmark: { fontSize: 20 },
  arrow: { fontSize: 20, fontWeight: '900' },
  bellBtn: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
