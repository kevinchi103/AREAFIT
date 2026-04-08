import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, ADMIN_EMAIL } from '../../constants/supabase';
import { LEAGUES, getLeagueForXP } from '../../constants/leagues';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';
import { toggleUserPremium } from '../../constants/premium';
import { createNotification, createNotificationForAll } from '../../constants/notifications';

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
  const [chatConvos, setChatConvos] = useState([]); // lista de usuarios con mensajes
  const [unreadChats, setUnreadChats] = useState(0);

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

      // Cargar últimos mensajes de cada usuario (agrupados)
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      // Agrupar por user_id — último mensaje de cada usuario
      const convoMap = {};
      (chatData || []).forEach(msg => {
        if (!convoMap[msg.user_id]) convoMap[msg.user_id] = msg;
      });
      const convos = Object.values(convoMap);
      setChatConvos(convos);
      setUnreadChats(convos.filter(c => !c.is_from_trainer && !c.read).length);

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

      {/* Botón entrenamientos personalizados */}
      <TouchableOpacity
        style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: theme.accent, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}
        onPress={() => router.push('/admin-workouts')}
      >
        <Text style={{ fontSize: 22 }}>📋</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#000' : '#fff' }}>Entrenamientos personalizados</Text>
          <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#00000088' : '#ffffff88' }}>Crear, asignar y gestionar</Text>
        </View>
        <Text style={{ fontSize: 18, color: isDark ? '#000' : '#fff' }}>→</Text>
      </TouchableOpacity>

      {/* Tabs — row 1 */}
      <View style={st.tabRow}>
        {[
          { key: 'overview',  label: 'General' },
          { key: 'users',     label: 'Usuarios' },
          { key: 'workouts',  label: 'Entrenos' },
          { key: 'chats',     label: `Chat${unreadChats > 0 ? ` (${unreadChats})` : ''}` },
          { key: 'notifs',    label: '🔔 Notifs' },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[st.tab, selectedTab === key && st.tabActive]}
            onPress={() => setSelectedTab(key)}
          >
            <Text style={[st.tabText, selectedTab === key && st.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
      >
        {selectedTab === 'overview' && <OverviewTab stats={stats} users={users} st={st} theme={theme} />}
        {selectedTab === 'users' && <UsersTab users={users} st={st} theme={theme} reload={loadAllData} />}
        {selectedTab === 'workouts' && <WorkoutsTab sessions={sessions} users={users} st={st} theme={theme} />}
        {selectedTab === 'chats' && <ChatsTab convos={chatConvos} users={users} st={st} theme={theme} reload={loadAllData} />}
        {selectedTab === 'notifs' && <NotifsTab users={users} st={st} theme={theme} />}
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
function UsersTab({ users, st, theme, reload }) {
  const handleTogglePremium = async (userId, newValue) => {
    try {
      await toggleUserPremium(userId, newValue);
      if (reload) await reload();
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar el estado premium: ' + err.message);
    }
  };

  return (
    <View style={st.tabContent}>
      <Text style={st.sectionCount}>{users.length} usuarios registrados</Text>
      {users.map((user, i) => {
        const league = getLeagueForXP(user.xp || 0);
        const isPremium = !!user.is_premium;
        return (
          <View key={user.id} style={st.userCard}>
            <View style={st.userCardHeader}>
              <View style={[st.userAvatar, { borderColor: league.color }]}>
                <Text style={st.userAvatarText}>
                  {(user.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={st.userCardInfo}>
                <Text style={st.userCardName}>
                  {isPremium ? '👑 ' : ''}{user.name || 'Sin nombre'}
                </Text>
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
            <TouchableOpacity
              style={[st.premiumToggle, isPremium && st.premiumToggleActive]}
              onPress={() => handleTogglePremium(user.id, !isPremium)}
            >
              <Text style={[st.premiumToggleText, isPremium && st.premiumToggleTextActive]}>
                {isPremium ? '👑 Premium activo' : 'Activar Premium'}
              </Text>
            </TouchableOpacity>
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

// ─── Chats Tab ───────────────────────────────────────────────────
function ChatsTab({ convos, users, st, theme, reload }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const userMap = {};
  users.forEach(u => { userMap[u.id] = u.name || u.email || 'Usuario'; });

  async function openConvo(userId) {
    setSelectedUser(userId);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    // Marcar como leídos
    await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('is_from_trainer', false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }

  async function sendReply() {
    if (!reply.trim() || !selectedUser || sending) return;
    setSending(true);
    await supabase.from('chat_messages').insert({
      user_id: selectedUser,
      content: reply.trim(),
      is_from_trainer: true,
      read: false,
    });
    setReply('');
    await openConvo(selectedUser);
    if (reload) reload();
    setSending(false);
  }

  if (selectedUser) {
    const userName = userMap[selectedUser] || 'Usuario';
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={120}
      >
        <View style={st.tabContent}>
          {/* Back */}
          <TouchableOpacity onPress={() => setSelectedUser(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingTop: 4 }}>
            <Text style={{ color: theme.accent, fontSize: 16 }}>←</Text>
            <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 14 }}>{userName}</Text>
          </TouchableOpacity>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ maxHeight: 420, marginBottom: 12 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((msg, i) => {
              const isTrainer = msg.is_from_trainer;
              return (
                <View key={msg.id || i} style={[{ marginBottom: 8, alignItems: isTrainer ? 'flex-end' : 'flex-start' }]}>
                  <View style={{
                    maxWidth: '75%', padding: 10, borderRadius: 14,
                    backgroundColor: isTrainer ? theme.accent : theme.bgCard,
                    borderBottomRightRadius: isTrainer ? 4 : 14,
                    borderBottomLeftRadius: isTrainer ? 14 : 4,
                  }}>
                    <Text style={{ color: isTrainer ? '#000' : theme.white, fontSize: 13 }}>{msg.content}</Text>
                    <Text style={{ color: isTrainer ? '#00000066' : theme.gray, fontSize: 9, marginTop: 3, textAlign: 'right' }}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Reply input */}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <TextInput
              style={[st.chatInput, { color: theme.white, backgroundColor: theme.bgLight, flex: 1 }]}
              placeholder="Responder..."
              placeholderTextColor={theme.gray}
              value={reply}
              onChangeText={setReply}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[st.chatSendBtn, { backgroundColor: reply.trim() ? theme.accent : theme.bgLight }]}
              onPress={sendReply}
              disabled={!reply.trim() || sending}
            >
              <Text style={{ fontSize: 18 }}>{sending ? '⏳' : '➤'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={st.tabContent}>
      <Text style={st.sectionCount}>{convos.length} conversaciones</Text>
      {convos.length === 0 && (
        <View style={st.emptyBox}>
          <Text style={st.emptyIcon}>💬</Text>
          <Text style={st.emptyTitle}>Sin mensajes</Text>
          <Text style={st.emptyText}>Los usuarios premium podrán escribirte aquí</Text>
        </View>
      )}
      {convos.map((c, i) => {
        const hasUnread = !c.is_from_trainer && !c.read;
        const userName = userMap[c.user_id] || 'Usuario';
        const time = c.created_at
          ? new Date(c.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : '';
        return (
          <TouchableOpacity
            key={c.user_id || i}
            style={[st.convoCard, hasUnread && { borderColor: theme.accent + '80', backgroundColor: theme.accent + '08' }]}
            onPress={() => openConvo(c.user_id)}
          >
            <View style={[st.convoAvatar, { backgroundColor: hasUnread ? theme.accent : theme.bgLight }]}>
              <Text style={{ fontWeight: '900', color: hasUnread ? '#000' : theme.gray, fontSize: 16 }}>
                {userName[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[st.convoName, hasUnread && { color: theme.white }]}>{userName}</Text>
                <Text style={{ color: theme.gray, fontSize: 11 }}>{time}</Text>
              </View>
              <Text style={[st.convoPreview, hasUnread && { color: theme.grayLight, fontWeight: '700' }]} numberOfLines={1}>
                {c.is_from_trainer ? '✓ Tú: ' : ''}{c.content}
              </Text>
            </View>
            {hasUnread && <View style={[st.unreadDot, { backgroundColor: theme.accent }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Notifications Tab ───────────────────────────────────────────
function NotifsTab({ users, st, theme }) {
  const [title, setTitle]           = useState('');
  const [body, setBody]             = useState('');
  const [type, setType]             = useState('info');
  const [targetUser, setTargetUser] = useState(null); // null = all
  const [sending, setSending]       = useState(false);
  const [sent, setSent]             = useState(false);

  const TYPES = [
    { id: 'info',        label: 'Info',     icon: 'ℹ️' },
    { id: 'achievement', label: 'Logro',    icon: '🎖️' },
    { id: 'trainer',     label: 'Trainer',  icon: '📋' },
    { id: 'reminder',    label: 'Recordat', icon: '⏰' },
  ];

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Campos requeridos', 'Escribe título y mensaje');
      return;
    }
    setSending(true);
    setSent(false);
    try {
      if (targetUser) {
        await createNotification({ userId: targetUser, type, title: title.trim(), body: body.trim() });
      } else {
        await createNotificationForAll({ type, title: title.trim(), body: body.trim() });
      }
      setSent(true);
      setTitle('');
      setBody('');
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  }

  return (
    <View style={st.tabContent}>
      {/* Tipo */}
      <Text style={[st.cardTitle, { marginBottom: 8, marginTop: 4 }]}>TIPO DE NOTIFICACIÓN</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TYPES.map(t => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setType(t.id)}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              borderWidth: 1,
              borderColor: type === t.id ? theme.accent : theme.border,
              backgroundColor: type === t.id ? theme.accent + '15' : theme.bgCard,
            }}
          >
            <Text style={{ fontSize: 14 }}>{t.icon}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: type === t.id ? theme.accent : theme.gray }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Destinatario */}
      <Text style={[st.cardTitle, { marginBottom: 8 }]}>DESTINATARIO</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setTargetUser(null)}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              borderWidth: 1,
              borderColor: !targetUser ? theme.accent : theme.border,
              backgroundColor: !targetUser ? theme.accent + '15' : theme.bgCard,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: !targetUser ? theme.accent : theme.gray }}>
              👥 Todos ({users.length})
            </Text>
          </TouchableOpacity>
          {users.map(u => (
            <TouchableOpacity
              key={u.id}
              onPress={() => setTargetUser(u.id)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                borderWidth: 1,
                borderColor: targetUser === u.id ? theme.accent : theme.border,
                backgroundColor: targetUser === u.id ? theme.accent + '15' : theme.bgCard,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: targetUser === u.id ? theme.accent : theme.gray }}>
                {u.name || u.email || 'Usuario'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Título */}
      <Text style={[st.cardTitle, { marginBottom: 8 }]}>TÍTULO</Text>
      <TextInput
        style={[st.notifInput, { color: theme.white, backgroundColor: theme.bgCard, borderColor: theme.border }]}
        placeholder="Título de la notificación"
        placeholderTextColor={theme.gray}
        value={title}
        onChangeText={setTitle}
        maxLength={80}
      />

      {/* Mensaje */}
      <Text style={[st.cardTitle, { marginBottom: 8, marginTop: 12 }]}>MENSAJE</Text>
      <TextInput
        style={[st.notifInput, st.notifInputMulti, { color: theme.white, backgroundColor: theme.bgCard, borderColor: theme.border }]}
        placeholder="Texto del mensaje..."
        placeholderTextColor={theme.gray}
        value={body}
        onChangeText={setBody}
        maxLength={300}
        multiline
        numberOfLines={4}
      />

      {/* Send button */}
      <TouchableOpacity
        onPress={handleSend}
        disabled={sending || !title.trim() || !body.trim()}
        style={{
          marginTop: 16,
          paddingVertical: 16,
          borderRadius: 14,
          backgroundColor: sent ? '#00CC66' : (sending || !title.trim() || !body.trim()) ? theme.bgLight : theme.accent,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '800', color: sent ? '#fff' : '#000' }}>
          {sent ? '✓ Enviado' : sending ? 'Enviando...' : `Enviar a ${targetUser ? '1 usuario' : `todos (${users.length})`}`}
        </Text>
      </TouchableOpacity>
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

  // Premium toggle
  premiumToggle: { marginTop: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: theme.bgLight, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  premiumToggleActive: { backgroundColor: '#FFD70020', borderColor: '#FFD70060' },
  premiumToggleText: { fontSize: 12, fontWeight: '700', color: theme.gray },
  premiumToggleTextActive: { color: '#FFD700' },

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

  // Chats
  convoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  convoAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  convoName: { fontSize: 14, fontWeight: '700', color: theme.gray, marginBottom: 2 },
  convoPreview: { fontSize: 12, color: theme.gray },
  unreadDot: { width: 10, height: 10, borderRadius: 5 },
  chatInput: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, maxHeight: 80 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Notifs tab
  notifInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, borderWidth: 1 },
  notifInputMulti: { height: 100, textAlignVertical: 'top' },
});
