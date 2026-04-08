import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadHistory, loadState, loadWeights } from '../constants/storage';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

function formatDuration(secs) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function getWeekNumber(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

export default function HistorialScreen() {
  const router = useRouter();
  const { isDark } = useSettings();
  const theme = getTheme(isDark);
  const [history, setHistory] = useState([]);
  const [state, setState] = useState(null);
  const [weights, setWeights] = useState([]);
  const [tab, setTab] = useState('sessions'); // 'sessions' | 'stats' | 'strength'

  useFocusEffect(useCallback(() => {
    loadHistory().then(setHistory);
    loadState().then(setState);
    loadWeights().then(setWeights);
  }, []));

  // ── Estadísticas calculadas ──
  const totalWorkouts  = history.length;
  const totalXP        = history.reduce((s, h) => s + (h.xpEarned || 0), 0);
  const totalMinutes   = Math.round(history.reduce((s, h) => s + (h.duration || 0), 0) / 60);
  const avgRating      = history.length ? (history.reduce((s, h) => s + (h.rating || 3), 0) / history.length).toFixed(1) : '—';
  const gymCount       = history.filter(h => h.environment === 'gym').length;
  const homeCount      = history.filter(h => h.environment === 'home').length;

  // Entrenamientos por semana (últimas 8 semanas)
  const weekMap = {};
  history.forEach(h => {
    const wk = getWeekNumber(h.dateStr || h.date);
    weekMap[wk] = (weekMap[wk] || 0) + 1;
  });
  const weekKeys = Object.keys(weekMap).sort((a, b) => b - a).slice(0, 8).reverse();
  const maxPerWeek = Math.max(...weekKeys.map(k => weekMap[k]), 1);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.gray }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.white }]}>Historial</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: 'sessions', label: 'Sesiones' },
          { key: 'stats',    label: 'Estadísticas' },
          { key: 'strength', label: 'Peso' },
        ].map(tab_ => (
          <TouchableOpacity
            key={tab_.key}
            onPress={() => setTab(tab_.key)}
            style={[s.tabBtn, { borderBottomColor: tab === tab_.key ? theme.accent : 'transparent' }]}
          >
            <Text style={[s.tabBtnText, { color: tab === tab_.key ? theme.accent : theme.gray }]}>
              {tab_.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── TAB: Sesiones ── */}
        {tab === 'sessions' && (
          <View style={{ padding: 20 }}>
            {history.length === 0 && (
              <View style={[s.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🏋️</Text>
                <Text style={[s.emptyText, { color: theme.gray }]}>Aún no tienes entrenamientos guardados.</Text>
                <Text style={[s.emptyText, { color: theme.gray, marginTop: 4 }]}>¡Completa tu primer entreno!</Text>
              </View>
            )}
            {history.map((h, i) => (
              <View key={h.id || i} style={[s.sessionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <View style={[s.sessionIcon, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={{ fontSize: 22 }}>{h.workoutEmoji || '💪'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.sessionName, { color: theme.white }]}>{h.workoutName}</Text>
                  <Text style={[s.sessionDate, { color: theme.gray }]}>{h.date}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <Text style={[s.sessionStat, { color: theme.gray }]}>⏱ {formatDuration(h.duration)}</Text>
                    <Text style={[s.sessionStat, { color: theme.gray }]}>💪 {h.exercisesDone} ej.</Text>
                    <Text style={[s.sessionStat, { color: theme.accent }]}>+{h.xpEarned} XP</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ color: theme.gray, fontSize: 12 }}>{'⭐'.repeat(h.rating || 3)}</Text>
                  <Text style={{ fontSize: 10, color: h.environment === 'gym' ? '#00E5FF' : '#C8FF00', fontWeight: '700' }}>
                    {h.environment === 'gym' ? '🏋️ GYM' : '🏠 CASA'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── TAB: Estadísticas ── */}
        {tab === 'stats' && (
          <View style={{ padding: 20 }}>
            {/* Resumen global */}
            <Text style={[s.sectionTitle, { color: theme.gray }]}>RESUMEN GLOBAL</Text>
            <View style={s.statsGrid}>
              {[
                { icon: '🏋️', val: totalWorkouts, lbl: 'Entrenamientos' },
                { icon: '⏱',  val: `${totalMinutes}m`, lbl: 'Tiempo total' },
                { icon: '⚡',  val: totalXP, lbl: 'XP total' },
                { icon: '⭐',  val: avgRating, lbl: 'Val. media' },
                { icon: '🏠',  val: homeCount, lbl: 'En casa' },
                { icon: '🏋️', val: gymCount, lbl: 'En gym' },
              ].map((item, i) => (
                <View key={i} style={[s.statCell, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  <Text style={[s.statVal, { color: theme.white }]}>{item.val}</Text>
                  <Text style={[s.statLbl, { color: theme.gray }]}>{item.lbl}</Text>
                </View>
              ))}
            </View>

            {/* Gráfico semanal */}
            {weekKeys.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { color: theme.gray, marginTop: 24 }]}>ENTRENAMIENTOS POR SEMANA</Text>
                <View style={[s.chartCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                  <View style={s.barChart}>
                    {weekKeys.map(wk => {
                      const count = weekMap[wk] || 0;
                      const pct   = count / maxPerWeek;
                      return (
                        <View key={wk} style={s.barWrap}>
                          <Text style={[s.barCount, { color: theme.accent }]}>{count}</Text>
                          <View style={[s.barFill, { backgroundColor: theme.accent, height: Math.max(pct * 80, 4) }]} />
                          <Text style={[s.barLabel, { color: theme.gray }]}>S{wk}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Racha actual */}
            <Text style={[s.sectionTitle, { color: theme.gray, marginTop: 24 }]}>RACHA</Text>
            <View style={[s.streakBanner, { backgroundColor: '#FF950015', borderColor: '#FF950040' }]}>
              <Text style={{ fontSize: 36 }}>🔥</Text>
              <View style={{ marginLeft: 16 }}>
                <Text style={[s.statVal, { color: '#FF9500', fontSize: 28 }]}>{state?.streak || 0} días</Text>
                <Text style={[s.statLbl, { color: theme.gray }]}>Racha actual</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB: Peso corporal ── */}
        {tab === 'strength' && (
          <View style={{ padding: 20 }}>
            <Text style={[s.sectionTitle, { color: theme.gray }]}>EVOLUCIÓN DE PESO</Text>
            {weights.length === 0 ? (
              <View style={[s.emptyCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>⚖️</Text>
                <Text style={[s.emptyText, { color: theme.gray }]}>Registra tu peso desde Perfil</Text>
              </View>
            ) : (
              <>
                {/* Mini graph */}
                <View style={[s.chartCard, { backgroundColor: theme.bgCard, borderColor: theme.border, marginBottom: 16 }]}>
                  <View style={s.weightChart}>
                    {weights.slice(0, 12).reverse().map((w, i) => {
                      const all    = weights.slice(0, 12).map(x => x.value);
                      const minW   = Math.min(...all);
                      const maxW   = Math.max(...all);
                      const range  = maxW - minW || 1;
                      const pct    = 1 - (w.value - minW) / range;
                      return (
                        <View key={i} style={s.weightBarWrap}>
                          <View style={[s.weightBar, { backgroundColor: theme.accent, height: Math.max(pct * 80 + 10, 10) }]} />
                          <Text style={[s.barLabel, { color: theme.gray }]}>{w.value}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Table */}
                {weights.map((w, i) => (
                  <View key={i} style={[s.weightRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
                    <Text style={[s.sessionDate, { color: theme.gray }]}>{w.date}</Text>
                    <Text style={[s.sessionName, { color: theme.white }]}>{w.value} kg</Text>
                    {i > 0 && (() => {
                      const diff = (w.value - weights[i - 1].value).toFixed(1);
                      return <Text style={{ color: diff > 0 ? '#FF4444' : '#00CC66', fontWeight: '700', fontSize: 12 }}>
                        {diff > 0 ? `+${diff}` : diff} kg
                      </Text>;
                    })()}
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  back: { fontSize: 26, width: 32 },
  title: { flex: 1, fontSize: 20, fontWeight: '900', textAlign: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#2A2A2A' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2 },
  tabBtnText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },

  emptyCard: { borderRadius: 16, padding: 32, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },

  sessionCard: { borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionName: { fontSize: 14, fontWeight: '800' },
  sessionDate: { fontSize: 12, marginTop: 1 },
  sessionStat: { fontSize: 11, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCell: { flex: 1, minWidth: '28%', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, gap: 4 },
  statVal: { fontSize: 20, fontWeight: '900' },
  statLbl: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 110 },
  barWrap: { alignItems: 'center', gap: 4 },
  barFill: { width: 20, borderRadius: 4 },
  barCount: { fontSize: 10, fontWeight: '800' },
  barLabel: { fontSize: 9, fontWeight: '600' },

  streakBanner: { borderRadius: 16, padding: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },

  weightChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100 },
  weightBarWrap: { alignItems: 'center', gap: 4 },
  weightBar: { width: 18, borderRadius: 4 },
  weightRow: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
