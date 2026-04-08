import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEKS, PHASE_COLORS } from '../../constants/program';
import { GYM_WEEKS, GYM_PHASE_COLORS } from '../../constants/gymProgram';
import { loadState, loadProfile, saveState } from '../../constants/storage';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';
import { fetchMyAssignmentsToday } from '../../constants/customWorkouts';
import { getUnreadCount } from '../../constants/notifications';
import { getWeekPlan, getTodayPlan, DAY_NAMES } from '../../constants/weeklyPlan';
import { getQuickWorkouts, QUICK_INTENSITY_COLORS } from '../../constants/quickWorkouts';

export default function HomeScreen() {
  const router = useRouter();
  const { t, isDark } = useSettings();
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
      <Text style={{ color: theme.gray }}>Cargando...</Text>
    </View>
  );

  const isGym = state.trainingEnvironment === 'gym';
  const programWeeks = isGym ? GYM_WEEKS : WEEKS;
  const phaseColors  = isGym ? GYM_PHASE_COLORS : PHASE_COLORS;
  const weekIndex    = Math.min(state.currentWeek - 1, programWeeks.length - 1);
  const weekData     = programWeeks[weekIndex];
  const phaseColor   = phaseColors[weekData.phase] || theme.accent;

  const xpNeeded = state.level * 200;
  const xpPct    = Math.min(state.xp / xpNeeded, 1);
  const today    = new Date().toDateString();

  // Plan semanal
  const weekPlan   = getWeekPlan(state, programWeeks);
  const todayPlan  = getTodayPlan(state, programWeeks);

  function goToWorkout(w) {
    if (!w) return;
    router.push({ pathname: '/workout', params: { id: w.id, week: weekIndex } });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={[s.greeting, { color: theme.white }]}>
              Hola{profile?.name ? `, ${profile.name}` : ''} 👋
            </Text>
            <Text style={[s.sub, { color: theme.gray }]}>
              Semana {state.currentWeek} · {weekData.phase} · {isGym ? '🏋️ Gym' : '🏠 Casa'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={[s.bellBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 18 }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text></View>
              )}
            </TouchableOpacity>
            <View style={[s.streakBox, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[s.streakNum, { color: theme.white }]}>{state.streak}</Text>
              <Text style={s.streakFire}>🔥</Text>
            </View>
          </View>
        </View>

        {/* ── XP Bar ── */}
        <View style={s.xpWrap}>
          <View style={s.xpRow}>
            <Text style={[s.xpLvl, { color: theme.gray }]}>Nivel {state.level}</Text>
            <Text style={[s.xpCount, { color: theme.gray }]}>{state.xp} / {xpNeeded} XP</Text>
          </View>
          <View style={[s.xpTrack, { backgroundColor: theme.bgLight }]}>
            <View style={[s.xpFill, { width: `${Math.round(xpPct * 100)}%`, backgroundColor: phaseColor }]} />
          </View>
        </View>

        {/* ── HOY ── */}
        <Text style={[s.sectionTitle, { color: theme.gray }]}>HOY</Text>
        {todayPlan.isTraining && todayPlan.workout ? (
          <TouchableOpacity
            style={[s.todayCard, { backgroundColor: theme.bgCard, borderColor: phaseColor }]}
            onPress={() => !todayPlan.done && goToWorkout(todayPlan.workout)}
            activeOpacity={todayPlan.done ? 1 : 0.75}
          >
            {/* Intensity pill */}
            <View style={[s.intPill, { backgroundColor: todayPlan.intensityMeta.color + '25', borderColor: todayPlan.intensityMeta.color + '60' }]}>
              <Text style={[s.intPillText, { color: todayPlan.intensityMeta.color }]}>
                {todayPlan.intensityMeta.label}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
              <View style={[s.todayIcon, { backgroundColor: todayPlan.done ? theme.bgLight : phaseColor }]}>
                <Text style={{ fontSize: 28 }}>{todayPlan.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.todayWorkoutName, { color: todayPlan.done ? theme.gray : theme.white }]}>
                  {todayPlan.workout.emoji} {todayPlan.workout.name}
                </Text>
                <Text style={[s.todayMeta, { color: theme.gray }]}>
                  {todayPlan.focus} · {todayPlan.est}
                </Text>
                <Text style={[s.todayExCount, { color: theme.gray }]}>
                  {todayPlan.workout.exercises.length} ejercicios
                </Text>
              </View>
              {todayPlan.done
                ? <Text style={{ fontSize: 28 }}>✅</Text>
                : <Text style={[s.todayArrow, { color: phaseColor }]}>→</Text>
              }
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[s.restCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={{ fontSize: 36 }}>{todayPlan.icon}</Text>
            <View style={{ marginLeft: 16 }}>
              <Text style={[s.todayWorkoutName, { color: theme.white }]}>Día de Descanso</Text>
              <Text style={[s.todayMeta, { color: theme.gray }]}>Recuperación activa · Movilidad</Text>
            </View>
          </View>
        )}

        {/* ── Plan Semanal ── */}
        <Text style={[s.sectionTitle, { color: theme.gray, marginTop: 24 }]}>PLAN SEMANAL</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekRow}>
          {weekPlan.map((day, i) => {
            const active = day.isToday;
            const borderCol = active ? phaseColor : (day.done ? '#00CC66' : theme.border);
            const bgCol     = active ? phaseColor + '15' : theme.bgCard;
            return (
              <TouchableOpacity
                key={i}
                style={[s.dayCard, { backgroundColor: bgCol, borderColor: borderCol }]}
                onPress={() => day.isTraining && day.workout && !day.done && goToWorkout(day.workout)}
                activeOpacity={day.isTraining && !day.done ? 0.7 : 1}
              >
                {/* Day name */}
                <Text style={[s.dayCardName, { color: active ? phaseColor : theme.gray }]}>
                  {DAY_NAMES[i]}
                </Text>

                {/* Icon */}
                <Text style={s.dayCardIcon}>{day.done ? '✅' : day.icon}</Text>

                {/* Focus */}
                <Text style={[s.dayCardFocus, { color: active ? theme.white : theme.gray }]} numberOfLines={2}>
                  {day.focus}
                </Text>

                {/* Intensity pill */}
                <View style={[s.dayIntPill, { backgroundColor: day.intensityMeta.color + '20' }]}>
                  <Text style={[s.dayIntText, { color: day.intensityMeta.color }]}>
                    {day.intensityMeta.label}
                  </Text>
                </View>

                {/* Duration */}
                <Text style={[s.dayEst, { color: theme.gray }]}>{day.est}</Text>

                {active && <View style={[s.todayDot, { backgroundColor: phaseColor }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Workouts de la semana ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          <Text style={[s.sectionTitle, { color: theme.gray, marginBottom: 0, paddingHorizontal: 0 }]}>
            SEMANA {state.currentWeek} · {weekData.name.toUpperCase()}
          </Text>
          <View style={[s.phasePill, { backgroundColor: phaseColor + '20' }]}>
            <Text style={[s.phaseText, { color: phaseColor }]}>{weekData.phase}</Text>
          </View>
        </View>

        {/* Custom workouts del entrenador */}
        {customWorkouts.length > 0 && (
          <>
            {customWorkouts.map(a => {
              const cw = a.custom_workouts;
              if (!cw) return null;
              const dayKey = `custom_${cw.id}_${today}`;
              const done   = state.completedDays?.includes(dayKey);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={[s.workoutCard, { backgroundColor: theme.bgCard, borderColor: theme.accent + '50' }, done && { opacity: 0.5 }]}
                  onPress={() => !done && router.push({ pathname: '/workout', params: { customId: cw.id, customData: JSON.stringify(cw), assignmentNotes: a.notes || '' } })}
                  activeOpacity={done ? 1 : 0.7}
                >
                  <View style={[s.wBadge, { backgroundColor: done ? theme.bgLight : theme.accent }]}>
                    <Text style={[s.wBadgeText, { color: done ? theme.gray : '#000' }]}>📋</Text>
                  </View>
                  <View style={s.wInfo}>
                    <Text style={[s.wName, { color: theme.white }, done && { color: theme.gray }]}>{cw.name}</Text>
                    <Text style={[s.wMeta, { color: theme.gray }]}>
                      {(cw.exercises || []).length} ejercicios
                      {cw.xp_multiplier > 1 ? ` · ⚡ x${cw.xp_multiplier} XP` : ''}
                    </Text>
                    {a.notes ? <Text style={{ fontSize: 11, color: theme.accent, marginTop: 2 }}>💬 {a.notes}</Text> : null}
                  </View>
                  {done ? <Text style={{ fontSize: 20 }}>✅</Text> : <Text style={[s.wArrow, { color: theme.accent }]}>→</Text>}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* Todos los workouts de la semana */}
        {weekData.workouts.map((w, i) => {
          const dayKey  = `${w.id}_${today}`;
          const done    = state.completedDays?.includes(dayKey);
          const slotLabels = ['D1 · Lun/Vie', 'D2 · Mar/Sáb', 'D3 · Jue'];
          return (
            <TouchableOpacity
              key={w.id}
              style={[s.workoutCard, { backgroundColor: theme.bgCard, borderColor: done ? '#00CC6640' : theme.border }, done && { opacity: 0.6 }]}
              onPress={() => !done && router.push({ pathname: '/workout', params: { id: w.id, week: weekIndex } })}
              activeOpacity={done ? 1 : 0.7}
            >
              <View style={[s.wBadge, { backgroundColor: done ? theme.bgLight : phaseColor }]}>
                <Text style={[s.wBadgeText, { color: done ? theme.gray : (isDark ? '#000' : '#fff') }]}>D{i + 1}</Text>
              </View>
              <View style={s.wInfo}>
                <Text style={[s.wName, { color: theme.white }, done && { color: theme.gray }]}>
                  {w.emoji} {w.name}
                </Text>
                <Text style={[s.wMeta, { color: theme.gray }]}>
                  {slotLabels[i]} · {w.exercises.length} ejercicios
                </Text>
              </View>
              {done
                ? <Text style={{ fontSize: 20 }}>✅</Text>
                : <Text style={[s.wArrow, { color: phaseColor }]}>→</Text>
              }
            </TouchableOpacity>
          );
        })}

        {/* ── Accesos rápidos ── */}
        <View style={s.quickLinks}>
          <TouchableOpacity
            style={[s.quickLink, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={() => router.push('/retos')}
          >
            <Text style={{ fontSize: 24 }}>🎯</Text>
            <Text style={[s.quickLinkText, { color: theme.white }]}>Retos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickLink, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={() => router.push('/historial')}
          >
            <Text style={{ fontSize: 24 }}>📊</Text>
            <Text style={[s.quickLinkText, { color: theme.white }]}>Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.quickLink, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={() => router.push('/chat')}
          >
            <Text style={{ fontSize: 24 }}>💬</Text>
            <Text style={[s.quickLinkText, { color: theme.white }]}>Entrenador</Text>
          </TouchableOpacity>
        </View>

        {/* ── Modo Rápido ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>
          <Text style={[s.sectionTitle, { color: theme.gray, marginBottom: 0, paddingHorizontal: 0 }]}>
            ⚡ MODO RÁPIDO
          </Text>
          <Text style={{ color: theme.gray, fontSize: 11 }}>15-20 min</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {getQuickWorkouts(isGym ? 'gym' : 'home').map(qw => (
            <TouchableOpacity
              key={qw.id}
              style={[s.quickCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => router.push({
                pathname: '/workout',
                params: {
                  customId: qw.id,
                  customData: JSON.stringify({ id: qw.id, name: qw.name, exercises: qw.exercises, xp_multiplier: 1 }),
                },
              })}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{qw.emoji}</Text>
              <Text style={[s.quickCardName, { color: theme.white }]}>{qw.name}</Text>
              <Text style={[s.quickCardMeta, { color: theme.gray }]}>{qw.exercises.length} ejercicios</Text>
              <View style={[s.quickIntPill, { backgroundColor: QUICK_INTENSITY_COLORS[qw.intensity] + '20' }]}>
                <Text style={[s.quickIntText, { color: QUICK_INTENSITY_COLORS[qw.intensity] }]}>
                  {qw.intensity} · {qw.duration}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '900' },
  sub: { fontSize: 13, marginTop: 2 },
  streakBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, gap: 4, borderWidth: 1 },
  streakNum: { fontSize: 20, fontWeight: '900' },
  streakFire: { fontSize: 18 },
  bellBtn: { position: 'relative', width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#FF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // XP
  xpWrap: { paddingHorizontal: 20, marginBottom: 24 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLvl: { fontSize: 12, fontWeight: '700' },
  xpCount: { fontSize: 12 },
  xpTrack: { height: 6, borderRadius: 99, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 99 },

  // Section title
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 12 },

  // Today card
  todayCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1.5, marginBottom: 8 },
  intPill: { alignSelf: 'flex-start', borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 3 },
  intPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  todayIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  todayWorkoutName: { fontSize: 17, fontWeight: '900', marginBottom: 3 },
  todayMeta: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  todayExCount: { fontSize: 11 },
  todayArrow: { fontSize: 26, fontWeight: '900' },
  restCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },

  // Week plan
  weekRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 4 },
  dayCard: { width: 88, borderRadius: 16, padding: 12, borderWidth: 1.5, alignItems: 'center', gap: 4, position: 'relative' },
  dayCardName: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  dayCardIcon: { fontSize: 22, marginVertical: 4 },
  dayCardFocus: { fontSize: 10, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  dayIntPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2 },
  dayIntText: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  dayEst: { fontSize: 9, fontWeight: '600', marginTop: 2 },
  todayDot: { position: 'absolute', bottom: 6, width: 6, height: 6, borderRadius: 3 },

  // Quick links
  quickLinks: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 24 },
  quickLink: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1 },
  quickLinkText: { fontSize: 11, fontWeight: '800' },

  // Quick workouts
  quickCard: { width: 140, borderRadius: 16, padding: 14, borderWidth: 1, gap: 4 },
  quickCardName: { fontSize: 14, fontWeight: '800' },
  quickCardMeta: { fontSize: 11 },
  quickIntPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  quickIntText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },

  // Workout cards
  phasePill: { borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },
  phaseText: { fontSize: 11, fontWeight: '800' },
  workoutCard: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, borderWidth: 1 },
  wBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wBadgeText: { fontSize: 15, fontWeight: '900' },
  wInfo: { flex: 1 },
  wName: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  wMeta: { fontSize: 12 },
  wArrow: { fontSize: 20, fontWeight: '900' },
});
