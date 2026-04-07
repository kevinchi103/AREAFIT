import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, ADMIN_EMAIL } from '../../constants/supabase';
import { LEAGUES, getLeagueForXP } from '../../constants/leagues';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';

export default function AdminScreen() {
  const router = useRouter();
  const { isDark } = useSettings();
  const theme = getTheme(isDark);
  const st = makeStyles(theme);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeToday: 0, totalWorkouts: 0, totalXP: 0 });
  const [selectedTab, setSelectedTab] = useState('overview');

  useFocusEffect(useCallback(() => {
    checkAdminAndLoad();
  }, []));

  async function checkAdminAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.email !== ADMIN_EMAIL) {
      Alert.alert('Acceso denegado', 'No tienes permisos de administrador');
      router.back();
      return;
    }
    await loadAllData();
  }

  async function loadAllData() {
    setLoading(true);
    try {
      // Cargar todos los usuarios
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('xp', { ascending: false });

      // Cargar sesiones de entrenamiento recientes
      const { data: sessionsData } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(50);

      // Cargar historial de puntos
      const { data: pointsData } = await supabase
        .from('points_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const usersList = usersData || [];
      const sessionsList = sessionsData || [];

      // Calcular stats
      const today = new Date().toISOString().split('T')[0];
      const activeToday = sessionsList.filter(s =>
        s.completed_at && s.completed_at.startsWith(today)
      ).length;

      setUsers(usersList);
      setSessions(sessionsList);
      setStats({
        totalUsers: usersList.length,
        activeToday,
        totalWorkouts: sessionsList.length,
        totalXP: usersList.reduce((sum, u) => sum + (u.xp || 0), 0),
      });
    } catch (err) {
      console.warn('Admin load error:', err.message);
    }
    setLoading(false);
    setRefreshing(false);
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  if (loading) {
    return (
      <SafeAreaView style={st.safe}>
        <View style={st.center}>
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={st.loadingText}>Cargando datos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={st.safe}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.headerTitle}>ADMIN</Text>
        <View style={st.adminBadge}>
          <Text style={st.adminBadgeText}>PANEL DE CONTROL</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={st.tabRow}>
        {['overview', 'users', 'workouts'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[st.tab, selectedTab === tab && st.tabActive]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[st.tabText, selectedTab === tab && st.tabTextActive]}>
              {tab === 'overview' ? 'General' : tab === 'users' ? 'Usuarios' : 'Entrenos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {selectedTab === 'overview' && <OverviewTab stats={stats} users={users} st={st} theme={theme} />}
        {selectedTab === 'users' && <UsersTab users={users} st={st} theme={theme} />}
        {selectedTab === 'workouts' && <WorkoutsTab sessions={sessions} users={users} st={st} theme={theme} />}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────
function OverviewTab({ stats, users, st, theme }) {
  const leagueCounts = {};
  LEAGUES.forEach(l => { leagueCounts[l.id] = 0; });
  users.forEach(u => {
    const league = getLeagueForXP(u.xp || 0);
    if (leagueCounts[league.id] !== undefined) leagueCounts[league.id]++;
  });

  return (
    <View style={st.tabContent}>
      {/* Stats cards */}
      <View style={st.statsGrid}>
        <StatCard label="Usuarios totales" value={stats.totalUsers} icon="👥" color="#00E5FF" st={st} />
        <StatCard label="Activos hoy" value={stats.activeToday} icon="🟢" color="#00CC66" st={st} />
        <StatCard label="Entrenos totales" value={stats.totalWorkouts} icon="🏋️" color="#FF6B35" st={st} />
        <StatCard label="XP total generado" value={stats.totalXP.toLocaleString()} icon="⚡" color={theme.accent} st={st} />
      </View>

      {/* Liga distribution */}
      <View style={st.card}>
        <Text style={st.cardTitle}>DISTRIBUCION POR LIGAS</Text>
        {LEAGUES.map(league => {
          const count = leagueCounts[league.id] || 0;
          const pct = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
          return (
            <View key={league.id} style={st.leagueRow}>
              <Text style={st.leagueIcon}>{league.icon}</Text>
              <Text style={[st.leagueName, { color: league.color }]}>{league.name}</Text>
              <View style={st.leagueBarTrack}>
                <View style={[st.leagueBarFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: league.color }]} />
              </View>
              <Text style={st.leagueCount}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Top 5 users */}
      <View style={st.card}>
        <Text style={st.cardTitle}>TOP 5 USUARIOS POR XP</Text>
        {users.slice(0, 5).map((user, i) => (
          <View key={user.id} style={st.topUserRow}>
            <Text style={st.topUserRank}>#{i + 1}</Text>
            <View style={st.topUserInfo}>
              <Text style={st.topUserName}>{user.name || user.email || 'Sin nombre'}</Text>
              <Text style={st.topUserMeta}>
                Nv.{user.level || 1} · {user.streak || 0} racha · Liga {getLeagueForXP(user.xp || 0).name}
              </Text>
            </View>
            <View style={st.topUserXP}>
              <Text style={st.topUserXPVal}>{(user.xp || 0).toLocaleString()}</Text>
              <Text style={st.topUserXPLabel}>XP</Text>
            </View>
          </View>
        ))}
        {users.length === 0 && <Text style={st.emptyText}>No hay usuarios registrados</Text>}
      </View>
    </View>
  );
}

function StatCard({ label, value, icon, color, st }) {
  return (
    <View style={st.statCard}>
      <Text style={st.statIcon}>{icon}</Text>
      <Text style={[st.statValue, { color }]}>{value}</Text>
      <Text style={st.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Users Tab ───────────────────────────────────────────────────
function UsersTab({ users, st, theme }) {
  return (
    <View style={st.tabContent}>
      <Text style={st.sectionCount}>{users.length} usuarios registrados</Text>
      {users.map((user, i) => {
        const league = getLeagueForXP(user.xp || 0);
        return (
          <View key={user.id} style={st.userCard}>
            <View style={st.userCardHeader}>
              <View style={[st.userAvatar, { borderColor: league.color }]}>
                <Text style={st.userAvatarText}>
                  {(user.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={st.userCardInfo}>
                <Text style={st.userCardName}>{user.name || 'Sin nombre'}</Text>
                <Text style={st.userCardEmail}>{user.email || '—'}</Text>
              </View>
              <View style={[st.leaguePill, { backgroundColor: league.color + '20', borderColor: league.color + '60' }]}>
                <Text style={[st.leaguePillText, { color: league.color }]}>{league.icon} {league.name}</Text>
              </View>
            </View>
            <View style={st.userCardStats}>
              <UserStat label="XP Total" value={(user.xp || 0).toLocaleString()} st={st} />
              <UserStat label="Nivel" value={user.level || 1} st={st} />
              <UserStat label="Racha" value={`${user.streak || 0} dias`} st={st} />
              <UserStat label="Liga" value={getLeagueForXP(user.xp || 0).name} st={st} />
            </View>
          </View>
        );
      })}
      {users.length === 0 && (
        <View style={st.emptyBox}>
          <Text style={st.emptyIcon}>👥</Text>
          <Text style={st.emptyTitle}>No hay usuarios</Text>
          <Text style={st.emptyText}>Los usuarios apareceran aqui al registrarse</Text>
        </View>
      )}
    </View>
  );
}

function UserStat({ label, value, st }) {
  return (
    <View style={st.userStatBox}>
      <Text style={st.userStatVal}>{value}</Text>
      <Text style={st.userStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Workouts Tab ────────────────────────────────────────────────
function WorkoutsTab({ sessions, users, st, theme }) {
  const userMap = {};
  users.forEach(u => { userMap[u.id] = u.name || u.email || 'Desconocido'; });

  return (
    <View style={st.tabContent}>
      <Text style={st.sectionCount}>{sessions.length} sesiones registradas</Text>
      {sessions.map((session, i) => {
        const userName = userMap[session.user_id] || 'Usuario desconocido';
        const date = session.completed_at
          ? new Date(session.completed_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          : '—';

        return (
          <View key={session.id || i} style={st.sessionCard}>
            <View style={st.sessionLeft}>
              <Text style={st.sessionUser}>{userName}</Text>
              <Text style={st.sessionDate}>{date}</Text>
            </View>
            <View style={st.sessionRight}>
              <Text style={st.sessionWorkout}>{session.workout_id || '—'}</Text>
              <Text style={st.sessionXP}>Completado</Text>
            </View>
          </View>
        );
      })}
      {sessions.length === 0 && (
        <View style={st.emptyBox}>
          <Text style={st.emptyIcon}>🏋️</Text>
          <Text style={st.emptyTitle}>No hay entrenamientos</Text>
          <Text style={st.emptyText}>Los entrenos completados apareceran aqui</Text>
        </View>
      )}
    </View>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────
const makeStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: theme.gray, marginTop: 12, fontSize: 14 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: theme.white, letterSpacing: 2 },
  adminBadge: { backgroundColor: '#A855F720', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#A855F740' },
  adminBadgeText: { fontSize: 10, fontWeight: '800', color: '#A855F7', letterSpacing: 1 },

  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: theme.bgCard, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  tabActive: { backgroundColor: theme.accent + '15', borderColor: theme.accent },
  tabText: { fontSize: 13, fontWeight: '700', color: theme.gray },
  tabTextActive: { color: theme.accent },

  tabContent: { paddingHorizontal: 16 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: theme.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, color: theme.gray, fontWeight: '600', marginTop: 4 },

  // Card
  card: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  cardTitle: { fontSize: 11, fontWeight: '800', color: theme.gray, letterSpacing: 1.5, marginBottom: 14 },

  // League distribution
  leagueRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  leagueIcon: { fontSize: 18, width: 28 },
  leagueName: { fontSize: 13, fontWeight: '700', width: 70 },
  leagueBarTrack: { flex: 1, height: 8, backgroundColor: theme.bgLight, borderRadius: 4, overflow: 'hidden' },
  leagueBarFill: { height: '100%', borderRadius: 4 },
  leagueCount: { fontSize: 14, fontWeight: '800', color: theme.white, width: 30, textAlign: 'right' },

  // Top users
  topUserRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.border, gap: 10 },
  topUserRank: { fontSize: 16, fontWeight: '900', color: theme.accent, width: 32 },
  topUserInfo: { flex: 1 },
  topUserName: { fontSize: 14, fontWeight: '700', color: theme.white },
  topUserMeta: { fontSize: 11, color: theme.gray, marginTop: 2 },
  topUserXP: { alignItems: 'flex-end' },
  topUserXPVal: { fontSize: 16, fontWeight: '800', color: theme.accent },
  topUserXPLabel: { fontSize: 10, color: theme.gray },

  // Users tab
  sectionCount: { fontSize: 13, color: theme.gray, fontWeight: '600', marginBottom: 12 },
  userCard: { backgroundColor: theme.bgCard, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.bgLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  userAvatarText: { fontSize: 16, fontWeight: '800', color: theme.white },
  userCardInfo: { flex: 1 },
  userCardName: { fontSize: 15, fontWeight: '800', color: theme.white },
  userCardEmail: { fontSize: 11, color: theme.gray, marginTop: 1 },
  leaguePill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  leaguePillText: { fontSize: 11, fontWeight: '700' },
  userCardStats: { flexDirection: 'row', gap: 8 },
  userStatBox: { flex: 1, backgroundColor: theme.bgLight, borderRadius: 10, padding: 8, alignItems: 'center' },
  userStatVal: { fontSize: 14, fontWeight: '800', color: theme.white },
  userStatLabel: { fontSize: 9, color: theme.gray, fontWeight: '600', marginTop: 2 },

  // Workouts tab
  sessionCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  sessionLeft: { flex: 1 },
  sessionUser: { fontSize: 14, fontWeight: '700', color: theme.white },
  sessionDate: { fontSize: 11, color: theme.gray, marginTop: 2 },
  sessionRight: { alignItems: 'flex-end' },
  sessionWorkout: { fontSize: 12, fontWeight: '700', color: theme.grayLight },
  sessionXP: { fontSize: 14, fontWeight: '800', color: theme.accent, marginTop: 2 },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.white },
  emptyText: { fontSize: 13, color: theme.gray, textAlign: 'center' },
});
