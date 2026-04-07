import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';
import { fetchMyNotifications, markAsRead, markAllAsRead } from '../constants/notifications';

const TYPE_ICONS = {
  league:      '🏆',
  achievement: '🎖️',
  trainer:     '📋',
  reminder:    '⏰',
  info:        'ℹ️',
};

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  const weeks = Math.floor(days / 7);
  return `hace ${weeks}sem`;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useSettings();
  const theme = getTheme(isDark);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;
    setLoading(true);
    fetchMyNotifications().then(data => {
      if (!cancelled) {
        setNotifications(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []));

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  async function handleTap(item) {
    if (!item.read) {
      await markAsRead(item.id);
      setNotifications(prev =>
        prev.map(n => n.id === item.id ? { ...n, read: true } : n)
      );
    }
  }

  function renderItem({ item }) {
    const icon = TYPE_ICONS[item.type] || TYPE_ICONS.info;
    return (
      <TouchableOpacity
        style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
        onPress={() => handleTap(item)}
        activeOpacity={0.7}
      >
        <View style={s.iconWrap}>
          <Text style={s.icon}>{icon}</Text>
        </View>
        <View style={s.content}>
          <Text style={[s.title, { color: theme.white }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[s.body, { color: theme.gray }]} numberOfLines={2}>{item.body}</Text>
          <Text style={[s.time, { color: theme.gray }]}>{timeAgo(item.created_at)}</Text>
        </View>
        {!item.read && (
          <View style={[s.unreadDot, { backgroundColor: theme.accent }]} />
        )}
      </TouchableOpacity>
    );
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      {/* Header */}
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={[s.backText, { color: theme.white }]}>←</Text>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.white }]}>Notifications</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead} style={s.markAllBtn}>
            <Text style={[s.markAllText, { color: theme.accent }]}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.markAllBtn} />
        )}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={theme.accent} size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔔</Text>
          <Text style={[s.emptyTitle, { color: theme.white }]}>No notifications</Text>
          <Text style={[s.emptyBody, { color: theme.gray }]}>You're all caught up!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  backText: { fontSize: 24, fontWeight: '700' },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  markAllBtn: { width: 100, alignItems: 'flex-end' },
  markAllText: { fontSize: 12, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emptyBody: { fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  body: { fontSize: 12, lineHeight: 17, marginBottom: 3 },
  time: { fontSize: 11 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
