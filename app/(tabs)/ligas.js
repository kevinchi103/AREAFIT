// app/(tabs)/ligas.js
// Pantalla de ligas AREAFIT — ranking en tiempo real

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, ActivityIndicator,
  RefreshControl, Dimensions,
} from 'react-native';
import { supabase } from '../../constants/supabase';
import { loadState } from '../../constants/storage';
import {
  LEAGUES,
  getLeagueForXP,
  getLeagueProgress,
  xpToNextLeague,
  daysUntilReset,
  fetchLeagueRanking,
  subscribeToLeagueRanking,
} from '../../constants/leagues';
import { getTheme } from '../../constants/theme';
import { useSettings } from '../../constants/SettingsContext';

const { width } = Dimensions.get('window');

// ─── Constantes visuales ─────────────────────────────────────────
const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const PODIUM_SIZES  = [64, 56, 50];

export default function LigasScreen() {
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);

  const [userId,       setUserId]       = useState(null);
  const [state,        setState]        = useState(null);
  const [selectedLeague, setSelected]   = useState('bronze');
  const [ranking,      setRanking]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [liveCount,    setLiveCount]    = useState(0);

  // Animaciones
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(30)).current;
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const unsubRef    = useRef(null);

  // ── Carga inicial ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUserId(session.user.id);

      const s = await loadState();
      setState(s);

      // Liga del usuario según su XP semanal
      const myLeague = getLeagueForXP(s.weeklyXP || 0);
      setSelected(myLeague.id);
    })();
  }, []);

  // ── Cargar ranking cuando cambia la liga seleccionada ──────────
  useEffect(() => {
    if (!selectedLeague) return;

    // Cancelar suscripción anterior
    if (unsubRef.current) unsubRef.current();

    setLoading(true);
    loadRanking(selectedLeague);

    // Suscripción realtime
    unsubRef.current = subscribeToLeagueRanking(selectedLeague, (newRanking) => {
      setRanking(newRanking);
      setLiveCount(c => c + 1);
      triggerPulse();
    });

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [selectedLeague]);

  // ── Animación de entrada ───────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const loadRanking = async (leagueId) => {
    const data = await fetchLeagueRanking(leagueId);
    setRanking(data);
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRanking(selectedLeague);
  }, [selectedLeague]);

  // ─── Cálculos del usuario ──────────────────────────────────────
  const totalXP   = state?.xp      || 0;
  const weeklyXP  = state?.weeklyXP || 0;
  const streak    = state?.streak   || 0;
  const level     = state?.level    || 1;
  const myLeague  = getLeagueForXP(weeklyXP);
  const progress  = getLeagueProgress(weeklyXP);
  const toNext    = xpToNextLeague(weeklyXP);
  const daysLeft  = daysUntilReset();

  // Posición del usuario en el ranking actual
  const myRank = ranking.findIndex(r => r.userId === userId) + 1;

  // Zonas de ascenso/descenso (top 3 suben, últimos 3 bajan)
  const getZone = (rank, total) => {
    if (rank <= 3)              return 'up';
    if (rank > total - 3 && total > 6) return 'down';
    return 'safe';
  };

  // ─── Render ───────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.white }]}>{t('leagues.title')}</Text>
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>{t('leagues.live')}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >

        {/* ── MI LIGA CARD ── */}
        <View style={[styles.myLeagueCard, { backgroundColor: theme.bgCard, borderColor: myLeague.color + '40' }]}>
          <View style={styles.myLeagueTop}>
            <View>
              <Text style={[styles.myLeagueLabel, { color: theme.gray }]}>{t('leagues.myLeague')}</Text>
              <View style={styles.myLeagueRow}>
                <Text style={styles.myLeagueIcon}>{myLeague.icon}</Text>
                <Text style={[styles.myLeagueName, { color: myLeague.color }]}>{myLeague.name}</Text>
              </View>
              {myRank > 0 && (
                <Text style={[styles.myRankText, { color: theme.gray }]}>
                  {t('leagues.position')} #{myRank} {t('leagues.thisWeek')}
                </Text>
              )}
            </View>
            <View style={styles.statsCol}>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: theme.accent }]}>{weeklyXP.toLocaleString()}</Text>
                <Text style={[styles.statLbl, { color: theme.gray }]}>{t('leagues.xpWeek')}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNum, { color: theme.white }]}>{daysLeft}</Text>
                <Text style={[styles.statLbl, { color: theme.gray }]}>{t('leagues.daysReset')}</Text>
              </View>
            </View>
          </View>

          {/* Barra de progreso de liga */}
          {myLeague.id !== 'diamond' && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: theme.gray }]}>{myLeague.name}</Text>
                <Text style={[styles.progressXP, { color: theme.grayLight }]}>
                  {toNext.toLocaleString()} {t('leagues.xpToRise')}
                </Text>
                <Text style={[styles.progressLabel, { color: theme.gray }]}>
                  {LEAGUES[LEAGUES.findIndex(l => l.id === myLeague.id) + 1]?.name}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.bgLight }]}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: myLeague.color }]} />
              </View>
            </View>
          )}
          {myLeague.id === 'diamond' && (
            <Text style={[styles.diamondText, { color: myLeague.color }]}>
              💎 {t('leagues.maxLeague')}
            </Text>
          )}
        </View>

        {/* ── SELECTOR DE LIGAS ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueSelector} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {LEAGUES.map(league => {
            const isActive = selectedLeague === league.id;
            const isMyLeague = myLeague.id === league.id;
            return (
              <TouchableOpacity
                key={league.id}
                style={[
                  styles.leagueTab,
                  isActive && { borderColor: league.color, backgroundColor: league.color + '15' },
                  !isActive && { borderColor: theme.border },
                ]}
                onPress={() => {
                  fadeAnim.setValue(0);
                  slideAnim.setValue(20);
                  setSelected(league.id);
                }}
              >
                <Text style={styles.leagueTabIcon}>{league.icon}</Text>
                <Text style={[styles.leagueTabName, { color: isActive ? league.color : theme.gray }]}>
                  {league.name}
                </Text>
                {isMyLeague && <View style={[styles.myDot, { backgroundColor: league.color }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── RANKING ── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={theme.accent} size="large" />
            <Text style={[styles.loadingText, { color: theme.gray }]}>{t('leagues.loadingRank')}</Text>
          </View>
        ) : ranking.length === 0 ? (
          <EmptyLeague leagueId={selectedLeague} myLeagueId={myLeague.id} theme={theme} t={t} />
        ) : (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Podio top 3 */}
            {ranking.length >= 3 && (
              <PodiumView ranking={ranking} userId={userId} theme={theme} t={t} />
            )}

            {/* Lista completa */}
            <View style={styles.rankingList}>
              {ranking.map((item, index) => {
                const isMe   = item.userId === userId;
                const zone   = getZone(item.rank, ranking.length);
                const league = LEAGUES.find(l => l.id === selectedLeague);

                return (
                  <RankingRow
                    key={item.userId || index}
                    item={item}
                    isMe={isMe}
                    zone={zone}
                    leagueColor={league?.color || theme.accent}
                    theme={theme}
                    t={t}
                  />
                );
              })}
            </View>

            {/* Leyenda zonas */}
            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#00CC66' }]} />
                <Text style={[styles.legendText, { color: theme.gray }]}>{t('leagues.top3up')}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#FF4444' }]} />
                <Text style={[styles.legendText, { color: theme.gray }]}>{t('leagues.last3down')}</Text>
              </View>
            </View>

          </Animated.View>
        )}

        {/* ── REGLAS ── */}
        <RulesCard theme={theme} t={t} />

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ─── Podio ────────────────────────────────────────────────────────
function PodiumView({ ranking, userId, theme, t }) {
  // Orden visual: 2º - 1º - 3º
  const order = [ranking[1], ranking[0], ranking[2]];
  const heights = [80, 110, 65];

  return (
    <View style={styles.podiumContainer}>
      {order.map((item, i) => {
        if (!item) return null;
        const isMe = item.userId === userId;
        const color = PODIUM_COLORS[item.rank - 1] || theme.gray;
        const size  = PODIUM_SIZES[item.rank - 1] || 44;

        return (
          <View key={item.userId} style={styles.podiumSlot}>
            {/* Avatar */}
            <View style={[styles.podiumAvatar, { width: size, height: size, borderColor: color, backgroundColor: color + '20' }]}>
              <Text style={{ fontSize: size * 0.42 }}>
                {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
              </Text>
            </View>
            <Text style={[styles.podiumName, { color: isMe ? theme.accent : theme.grayLight }]} numberOfLines={1}>
              {isMe ? t('leagues.you') : item.displayName}
            </Text>
            <Text style={[styles.podiumXP, { color }]}>{item.weeklyXP.toLocaleString()} XP</Text>
            {/* Pedestal */}
            <View style={[styles.pedestal, { height: heights[i], backgroundColor: color + '25', borderColor: color + '60' }]}>
              <Text style={[styles.pedestalNum, { color }]}>#{item.rank}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Fila de ranking ──────────────────────────────────────────────
function RankingRow({ item, isMe, zone, leagueColor, theme, t }) {
  const zoneColor = zone === 'up' ? '#00CC66' : zone === 'down' ? '#FF4444' : 'transparent';
  const zoneIcon  = zone === 'up' ? '↑' : zone === 'down' ? '↓' : '';

  return (
    <View style={[
      styles.rankRow,
      { backgroundColor: theme.bgCard },
      isMe && { backgroundColor: leagueColor + '12', borderColor: leagueColor + '40' },
    ]}>
      {/* Indicador de zona */}
      <View style={[styles.zoneBar, { backgroundColor: zoneColor }]} />

      {/* Posición */}
      <Text style={[styles.rankNum, { color: theme.gray }, item.rank <= 3 && { color: PODIUM_COLORS[item.rank - 1] }]}>
        {item.rank <= 3 ? ['🥇','🥈','🥉'][item.rank - 1] : `#${item.rank}`}
      </Text>

      {/* Info */}
      <View style={styles.rankInfo}>
        <Text style={[styles.rankName, { color: isMe ? theme.accent : theme.white }]} numberOfLines={1}>
          {isMe ? `${item.displayName} (${t('leagues.you').toLowerCase()})` : item.displayName}
        </Text>
        <Text style={[styles.rankMeta, { color: theme.gray }]}>
          Nv.{item.level} · {item.streak > 0 ? `🔥${item.streak}` : t('leagues.noStreak')}
        </Text>
      </View>

      {/* XP + zona */}
      <View style={styles.rankRight}>
        <Text style={[styles.rankXP, { color: isMe ? theme.accent : theme.white }]}>
          {item.weeklyXP.toLocaleString()}
        </Text>
        <Text style={[styles.rankXPLabel, { color: theme.gray }]}>XP</Text>
        {zoneIcon ? <Text style={[styles.zoneIcon, { color: zoneColor }]}>{zoneIcon}</Text> : null}
      </View>
    </View>
  );
}

// ─── Liga vacía ───────────────────────────────────────────────────
function EmptyLeague({ leagueId, myLeagueId, theme, t }) {
  const league    = LEAGUES.find(l => l.id === leagueId);
  const isMyLeague = leagueId === myLeagueId;

  return (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyIcon}>{league?.icon || '🏆'}</Text>
      <Text style={[styles.emptyTitle, { color: theme.white }]}>
        {isMyLeague ? t('leagues.beFirst') : `${league?.name} — ${t('leagues.leagueEmpty')}`}
      </Text>
      <Text style={[styles.emptyText, { color: theme.gray }]}>
        {isMyLeague
          ? t('leagues.completeOne')
          : t('leagues.nobodyYet')}
      </Text>
    </View>
  );
}

// ─── Reglas ───────────────────────────────────────────────────────
function RulesCard({ theme, t }) {
  const rules = [
    { icon: '📅', text: t('leagues.rule1') },
    { icon: '⬆️', text: t('leagues.rule2') },
    { icon: '⬇️', text: t('leagues.rule3') },
    { icon: '⚡', text: t('leagues.rule4') },
    { icon: '🔥', text: t('leagues.rule5') },
  ];

  return (
    <View style={[styles.rulesCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
      <Text style={[styles.rulesTitle, { color: theme.gray }]}>{t('leagues.howItWorks')}</Text>
      {rules.map((r, i) => (
        <View key={i} style={styles.ruleRow}>
          <Text style={styles.ruleIcon}>{r.icon}</Text>
          <Text style={[styles.ruleText, { color: theme.grayLight }]}>{r.text}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1 },

  // Header
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:      { fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  liveBadge:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF444420', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#FF444440' },
  liveDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF4444', marginRight: 5 },
  liveText:         { fontSize: 10, fontWeight: '800', color: '#FF4444', letterSpacing: 1 },

  // Mi liga card
  myLeagueCard:     { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  myLeagueTop:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  myLeagueLabel:    { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  myLeagueRow:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  myLeagueIcon:     { fontSize: 28 },
  myLeagueName:     { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  myRankText:       { fontSize: 12, marginTop: 4 },
  statsCol:         { gap: 8 },
  statBox:          { alignItems: 'flex-end' },
  statNum:          { fontSize: 20, fontWeight: '800' },
  statLbl:          { fontSize: 10, fontWeight: '600' },

  // Progreso de liga
  progressSection:  { gap: 6 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:    { fontSize: 11, fontWeight: '600' },
  progressXP:       { fontSize: 11, fontWeight: '600' },
  progressBar:      { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill:     { height: '100%', borderRadius: 3 },
  diamondText:      { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 4 },

  // Selector
  leagueSelector:   { marginBottom: 16 },
  leagueTab:        { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 10, minWidth: 80, position: 'relative' },
  leagueTabIcon:    { fontSize: 20, marginBottom: 2 },
  leagueTabName:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  myDot:            { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3 },

  // Loading / empty
  loadingBox:       { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText:      { fontSize: 14 },
  emptyBox:         { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 32, gap: 8 },
  emptyIcon:        { fontSize: 48, marginBottom: 4 },
  emptyTitle:       { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyText:        { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Podio
  podiumContainer:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20, marginBottom: 24, gap: 8 },
  podiumSlot:       { flex: 1, alignItems: 'center', gap: 4 },
  podiumAvatar:     { borderRadius: 100, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  podiumName:       { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  podiumXP:         { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  pedestal:         { width: '100%', borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  pedestalNum:      { fontSize: 18, fontWeight: '900' },

  // Ranking list
  rankingList:      { paddingHorizontal: 16, gap: 6 },
  rankRow:          { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingVertical: 10, paddingRight: 14, borderWidth: 1, borderColor: 'transparent', overflow: 'hidden' },
  zoneBar:          { width: 3, alignSelf: 'stretch', marginRight: 10, borderRadius: 2 },
  rankNum:          { width: 40, textAlign: 'center', fontSize: 14, fontWeight: '800' },
  rankInfo:         { flex: 1, gap: 2 },
  rankName:         { fontSize: 14, fontWeight: '700' },
  rankMeta:         { fontSize: 11 },
  rankRight:        { alignItems: 'flex-end', gap: 1 },
  rankXP:           { fontSize: 16, fontWeight: '800' },
  rankXPLabel:      { fontSize: 10, fontWeight: '600' },
  zoneIcon:         { fontSize: 12, fontWeight: '800' },

  // Leyenda
  legend:           { flexDirection: 'row', gap: 20, paddingHorizontal: 16, paddingVertical: 16 },
  legendRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:        { width: 8, height: 8, borderRadius: 4 },
  legendText:       { fontSize: 11 },

  // Reglas
  rulesCard:        { marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16, borderWidth: 1 },
  rulesTitle:       { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  ruleRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  ruleIcon:         { fontSize: 16 },
  ruleText:         { fontSize: 13, flex: 1, lineHeight: 18 },
});
