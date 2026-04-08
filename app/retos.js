import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChallengesWithProgress } from '../constants/challenges';
import { loadState } from '../constants/storage';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

export default function RetosScreen() {
  const router = useRouter();
  const { isDark } = useSettings();
  const theme = getTheme(isDark);
  const [challenges, setChallenges] = useState([]);
  const [tab, setTab] = useState('weekly'); // 'weekly' | 'monthly'

  useFocusEffect(useCallback(() => {
    loadState().then(state => {
      getChallengesWithProgress(state).then(setChallenges);
    });
  }, []));

  const weekly  = challenges.filter(c => c.type === 'weekly');
  const monthly = challenges.filter(c => c.type === 'monthly');
  const list    = tab === 'weekly' ? weekly : monthly;

  const doneCount  = list.filter(c => c.done).length;
  const totalXPAvailable = list.reduce((s, c) => s + c.xp, 0);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[s.back, { color: theme.gray }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.white }]}>Retos</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {[
          { key: 'weekly',  label: '📅 Semanales' },
          { key: 'monthly', label: '🗓 Mensuales' },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[s.tabBtn, { borderBottomColor: tab === t.key ? theme.accent : 'transparent' }]}
          >
            <Text style={[s.tabBtnText, { color: tab === t.key ? theme.accent : theme.gray }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {/* Progress summary */}
        <View style={[s.summaryCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          <Text style={[s.summaryTitle, { color: theme.white }]}>
            {doneCount} / {list.length} completados
          </Text>
          <View style={[s.summaryBar, { backgroundColor: theme.bgLight }]}>
            <View style={[s.summaryFill, {
              width: list.length ? `${(doneCount / list.length) * 100}%` : '0%',
              backgroundColor: theme.accent,
            }]} />
          </View>
          <Text style={[s.summaryXP, { color: theme.accent }]}>
            Hasta {totalXPAvailable} XP disponibles
          </Text>
        </View>

        {/* Challenge cards */}
        {list.map(ch => (
          <View
            key={ch.id}
            style={[s.card, {
              backgroundColor: ch.done ? ch.color + '12' : theme.bgCard,
              borderColor: ch.done ? ch.color + '60' : theme.border,
            }]}
          >
            <View style={s.cardTop}>
              <View style={[s.cardIconWrap, { backgroundColor: ch.color + '20' }]}>
                <Text style={{ fontSize: 26 }}>{ch.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[s.cardTitle, { color: ch.done ? ch.color : theme.white }]}>
                  {ch.title}
                  {ch.done ? ' ✓' : ''}
                </Text>
                <Text style={[s.cardDesc, { color: theme.gray }]}>{ch.desc}</Text>
              </View>
              <View style={[s.xpBadge, { backgroundColor: ch.color + '20' }]}>
                <Text style={[s.xpBadgeText, { color: ch.color }]}>+{ch.xp} XP</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[s.progBar, { backgroundColor: theme.bgLight }]}>
              <View style={[s.progFill, {
                width: `${ch.progress * 100}%`,
                backgroundColor: ch.color,
              }]} />
            </View>

            <View style={s.cardBottom}>
              <Text style={[s.progText, { color: theme.gray }]}>
                {ch.current} / {ch.target}
                {ch.metric.includes('minutes') ? ' min' : ch.metric.includes('xp') ? ' XP' : ''}
              </Text>
              {ch.done && (
                <Text style={[s.doneText, { color: ch.color }]}>¡Completado!</Text>
              )}
            </View>
          </View>
        ))}

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
  tabBtnText: { fontSize: 14, fontWeight: '700' },

  summaryCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  summaryBar: { height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  summaryFill: { height: '100%', borderRadius: 99 },
  summaryXP: { fontSize: 12, fontWeight: '700' },

  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '900', marginBottom: 3 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  xpBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  xpBadgeText: { fontSize: 12, fontWeight: '900' },
  progBar: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  progFill: { height: '100%', borderRadius: 99 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progText: { fontSize: 12, fontWeight: '600' },
  doneText: { fontSize: 12, fontWeight: '800' },
});
