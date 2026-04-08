import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { loadProfile, saveProfile, loadWeights, saveWeights, loadState, saveState } from '../../constants/storage';
import { useSettings } from '../../constants/SettingsContext';
import { getTheme } from '../../constants/theme';
import { supabase } from '../../constants/supabase';
import { ACHIEVEMENT_DEFS, fetchMyAchievements } from '../../constants/achievements';
import { SUBSCRIPTION_TIERS } from '../../constants/premium';
import { loadNotifPrefs, saveNotifPrefs, applyNotificationPrefs, requestNotificationPermission } from '../../constants/pushNotifications';

export default function PerfilScreen() {
  const { settings, updateSettings, t, isDark } = useSettings();
  const theme = getTheme(isDark);
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [weights, setWeights] = useState([]);
  const [state, setState] = useState(null);
  const [myAchievements, setMyAchievements] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [form, setForm] = useState({});
  const [appState, setAppState] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState(null);

  useFocusEffect(useCallback(() => {
    loadProfile().then(p => { setProfile(p); setForm(p); });
    loadWeights().then(setWeights);
    loadState().then(s => { setState(s); setAppState(s); });
    fetchMyAchievements().then(setMyAchievements).catch(() => {});
    loadNotifPrefs().then(setNotifPrefs);
  }, []));

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('profile.permissions'), t('profile.galleryAccess')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) {
      const updated = { ...form, photoUri: result.assets[0].uri };
      setForm(updated);
      await saveProfile(updated);
      setProfile(updated);
    }
  }

  async function saveForm() {
    await saveProfile(form);
    setProfile(form);
    setEditing(false);
  }

  async function addWeight() {
    const val = parseFloat(newWeight.replace(',', '.'));
    if (!val || val < 20 || val > 300) { Alert.alert(t('common.error'), t('profile.invalidWeight')); return; }
    const entry = { date: new Date().toLocaleDateString('es-ES'), value: val };
    const updated = [entry, ...weights].slice(0, 30);
    setWeights(updated);
    await saveWeights(updated);
    setNewWeight('');
  }

  async function updateNotifPrefs(patch) {
    const updated = { ...notifPrefs, ...patch };
    setNotifPrefs(updated);
    await saveNotifPrefs(updated);
    const granted = await requestNotificationPermission();
    if (granted) {
      await applyNotificationPrefs(updated, appState?.streak || 0);
    }
  }

  async function changeEnvironment(env) {
    const s = { ...appState, trainingEnvironment: env };
    setAppState(s);
    await saveState(s);
  }

  function handleLogout() {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          },
        },
      ]
    );
  }

  function handleDeleteAccount() {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteMsg'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.deleteAccount'),
          style: 'destructive',
          onPress: () => Alert.alert(t('profile.comingSoon'), t('profile.comingSoonMsg')),
        },
      ]
    );
  }

  function handleSubscription() {
    Alert.alert(t('profile.comingSoon'), t('profile.comingSoonMsg'));
  }

  if (!profile) return <View style={[s.loading, { backgroundColor: theme.bg }]}><Text style={{ color: theme.gray }}>{t('common.loading')}</Text></View>;

  const initials = (profile.name || 'AF').substring(0, 2).toUpperCase();
  const currentWeight = weights[0]?.value;
  const startWeight = parseFloat(profile.startWeight);
  const diff = currentWeight && startWeight ? (currentWeight - startWeight).toFixed(1) : null;

  const LANGS = [
    { code: 'ca', label: 'Catala' },
    { code: 'es', label: 'Castellano' },
    { code: 'en', label: 'English' },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ── Header ── */}
          <View style={s.header}>
            <TouchableOpacity onPress={pickPhoto}>
              {profile.photoUri
                ? <Image source={{ uri: profile.photoUri }} style={s.avatar} />
                : <View style={[s.avatarPlaceholder, { backgroundColor: theme.accent }]}><Text style={[s.avatarText, { color: '#000' }]}>{initials}</Text></View>
              }
              <View style={[s.cameraIcon, { backgroundColor: theme.bgCard, borderColor: theme.border }]}><Text style={{ fontSize: 14 }}>📷</Text></View>
            </TouchableOpacity>
            <View style={s.headerInfo}>
              <Text style={[s.name, { color: theme.white }]}>{profile.name || t('profile.yourName')}</Text>
              <Text style={[s.levelBadge, { color: theme.gray }]}>{t('profile.level')} {state?.level || 1} · {t('profile.week')} {state?.currentWeek || 1}</Text>
            </View>
            <TouchableOpacity onPress={() => editing ? saveForm() : setEditing(true)} style={[s.editBtn, { backgroundColor: theme.bgLight, borderColor: theme.border }]}>
              <Text style={[s.editBtnText, { color: theme.accent }]}>{editing ? t('profile.save') : t('profile.edit')}</Text>
            </TouchableOpacity>
          </View>

          {/* ── Stats ── */}
          <View style={s.statsRow}>
            <View style={[s.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[s.statVal, { color: theme.white }]}>{state?.streak || 0}🔥</Text>
              <Text style={[s.statLbl, { color: theme.gray }]}>{t('profile.streak')}</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[s.statVal, { color: theme.white }]}>{state?.xp || 0}</Text>
              <Text style={[s.statLbl, { color: theme.gray }]}>{t('profile.totalXP')}</Text>
            </View>
            <View style={[s.statCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
              <Text style={[s.statVal, { color: theme.white }]}>{state?.completedDays?.length || 0}</Text>
              <Text style={[s.statLbl, { color: theme.gray }]}>{t('profile.days')}</Text>
            </View>
          </View>

          {/* ── Personal Data ── */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('profile.personalData')}</Text>
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            {[
              { label: t('profile.name'), field: 'name' },
              { label: t('profile.height'), field: 'height', keyboardType: 'numeric' },
              { label: t('profile.startWeight'), field: 'startWeight', keyboardType: 'numeric' },
              { label: t('profile.goal'), field: 'goal' },
              { label: '🏋️ Press banca (kg)', field: 'benchPress', keyboardType: 'numeric' },
              { label: '🦵 Sentadilla (kg)', field: 'squat', keyboardType: 'numeric', last: true },
            ].map(({ label, field, keyboardType, last }) => (
              <View key={field} style={[s.row, { borderBottomColor: theme.border }, last && { borderBottomWidth: 0 }]}>
                <Text style={[s.rowLabel, { color: theme.gray }]}>{label}</Text>
                {editing
                  ? <TextInput style={[s.rowInput, { color: theme.accent }]} value={form[field] || ''} onChangeText={v => setForm({ ...form, [field]: v })} keyboardType={keyboardType || 'default'} placeholderTextColor={theme.gray} placeholder="—" />
                  : <Text style={[s.rowValue, { color: theme.white }]}>{profile[field] || '—'}</Text>
                }
              </View>
            ))}
          </View>

          {/* ── Weight Tracking ── */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('profile.weightControl')}</Text>
          {diff !== null && (
            <View style={[s.diffBanner, { backgroundColor: parseFloat(diff) <= 0 ? theme.success + '22' : theme.danger + '22' }]}>
              <Text style={[s.diffText, { color: parseFloat(diff) <= 0 ? theme.success : theme.danger }]}>
                {parseFloat(diff) <= 0 ? '↓' : '↑'} {Math.abs(diff)} kg {t('profile.fromStart')}
              </Text>
            </View>
          )}
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={[s.weightInput, { borderBottomColor: theme.border }]}>
              <TextInput style={[s.weightField, { color: theme.white }]} placeholder={t('profile.currentWeight')} placeholderTextColor={theme.gray} keyboardType="decimal-pad" value={newWeight} onChangeText={setNewWeight} />
              <TouchableOpacity style={[s.weightBtn, { backgroundColor: theme.accent }]} onPress={addWeight}>
                <Text style={s.weightBtnText}>{t('profile.addWeight')}</Text>
              </TouchableOpacity>
            </View>
            {weights.slice(0, 8).map((w, i) => (
              <View key={i} style={[s.weightRow, { borderBottomColor: theme.border }, i === weights.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[s.weightDate, { color: theme.gray }]}>{w.date}</Text>
                <Text style={[s.weightVal, { color: theme.white }]}>{w.value} kg</Text>
                {i === 0 && <View style={[s.latestPill, { backgroundColor: theme.accent + '33' }]}><Text style={[s.latestText, { color: theme.accent }]}>{t('profile.current')}</Text></View>}
              </View>
            ))}
            {weights.length === 0 && <Text style={[s.emptyText, { color: theme.gray }]}>{t('profile.firstWeight')} 👆</Text>}
          </View>

          {/* ── Achievements ── */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>LOGROS</Text>
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ACHIEVEMENT_DEFS.map(def => {
                const unlocked = myAchievements.some(a => a.achievement_id === def.id);
                const lang = settings.lang || 'es';
                return (
                  <TouchableOpacity
                    key={def.id}
                    style={{
                      width: '30%', alignItems: 'center', padding: 10, borderRadius: 12,
                      backgroundColor: unlocked ? theme.accent + '12' : theme.bgLight,
                      borderWidth: 1, borderColor: unlocked ? theme.accent + '40' : 'transparent',
                      opacity: unlocked ? 1 : 0.4,
                    }}
                    onPress={() => Alert.alert(
                      `${def.icon} ${def.name[lang]}`,
                      `${def.desc[lang]}${def.xp > 0 ? `\n\n+${def.xp} XP` : ''}${unlocked ? '\n\n✅ Desbloqueado' : ''}`,
                    )}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 28, marginBottom: 4 }}>{def.icon}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: unlocked ? theme.accent : theme.gray, textAlign: 'center' }} numberOfLines={1}>
                      {def.name[lang]}
                    </Text>
                    {unlocked && <Text style={{ fontSize: 8, color: theme.success, marginTop: 2 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{ fontSize: 11, color: theme.gray, textAlign: 'center', marginTop: 12 }}>
              {myAchievements.length} / {ACHIEVEMENT_DEFS.length}
            </Text>
          </View>

          {/* ══════════════════════════════════════════════════════════
              SETTINGS SECTION
             ══════════════════════════════════════════════════════════ */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('profile.settings')}</Text>

          {/* ── Training Environment ── */}
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[s.settingLabel, { color: theme.white }]}>Entorno de entrenamiento</Text>
            <View style={[s.pillRow, { marginBottom: 14 }]}>
              <TouchableOpacity
                onPress={() => changeEnvironment('home')}
                style={[s.pill, s.pillHalf, { borderColor: appState?.trainingEnvironment !== 'gym' ? theme.accent : theme.border, backgroundColor: appState?.trainingEnvironment !== 'gym' ? theme.accent + '22' : 'transparent' }]}
              >
                <Text style={[s.pillText, { color: appState?.trainingEnvironment !== 'gym' ? theme.accent : theme.gray }]}>🏠 Casa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => changeEnvironment('gym')}
                style={[s.pill, s.pillHalf, { borderColor: appState?.trainingEnvironment === 'gym' ? theme.accent : theme.border, backgroundColor: appState?.trainingEnvironment === 'gym' ? theme.accent + '22' : 'transparent' }]}
              >
                <Text style={[s.pillText, { color: appState?.trainingEnvironment === 'gym' ? theme.accent : theme.gray }]}>🏋️ Gimnasio</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Language ── */}
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[s.settingLabel, { color: theme.white }]}>{t('profile.language')}</Text>
            <View style={s.pillRow}>
              {LANGS.map(({ code, label }) => {
                const active = settings.lang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => updateSettings({ lang: code })}
                    style={[
                      s.pill,
                      { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.accent + '22' : 'transparent' },
                    ]}
                  >
                    <Text style={[s.pillText, { color: active ? theme.accent : theme.gray }]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Theme ── */}
          <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
            <Text style={[s.settingLabel, { color: theme.white }]}>{t('profile.theme')}</Text>
            <View style={s.pillRow}>
              <TouchableOpacity
                onPress={() => updateSettings({ theme: 'dark' })}
                style={[
                  s.pill, s.pillHalf,
                  { borderColor: isDark ? theme.accent : theme.border, backgroundColor: isDark ? theme.accent + '22' : 'transparent' },
                ]}
              >
                <Text style={[s.pillText, { color: isDark ? theme.accent : theme.gray }]}>🌙 {t('profile.darkMode')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateSettings({ theme: 'light' })}
                style={[
                  s.pill, s.pillHalf,
                  { borderColor: !isDark ? theme.accent : theme.border, backgroundColor: !isDark ? theme.accent + '22' : 'transparent' },
                ]}
              >
                <Text style={[s.pillText, { color: !isDark ? theme.accent : theme.gray }]}>☀️ {t('profile.lightMode')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Notifications ── */}
          {notifPrefs && (
            <View style={[s.card, { backgroundColor: theme.bgCard, borderColor: theme.border, paddingVertical: 4 }]}>
              {/* Daily reminder toggle */}
              <View style={[s.switchRow, { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.settingLabel, { color: theme.white, marginBottom: 0 }]}>⏰ Recordatorio diario</Text>
                  <Text style={{ fontSize: 11, color: theme.gray, marginTop: 2 }}>Recibe un aviso para entrenar cada día</Text>
                </View>
                <Switch
                  value={notifPrefs.dailyReminderEnabled}
                  onValueChange={v => updateNotifPrefs({ dailyReminderEnabled: v })}
                  trackColor={{ false: theme.border, true: theme.accent + '66' }}
                  thumbColor={notifPrefs.dailyReminderEnabled ? theme.accent : theme.gray}
                />
              </View>

              {/* Reminder time */}
              {notifPrefs.dailyReminderEnabled && (
                <View style={[s.switchRow, { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
                  <Text style={[s.settingLabel, { color: theme.white, marginBottom: 0 }]}>Hora del aviso</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[7, 12, 17, 18, 20, 22].map(h => (
                      <TouchableOpacity
                        key={h}
                        onPress={() => updateNotifPrefs({ dailyReminderHour: h, dailyReminderMinute: 0 })}
                        style={{
                          paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                          backgroundColor: notifPrefs.dailyReminderHour === h ? theme.accent + '22' : theme.bgLight,
                          borderWidth: 1,
                          borderColor: notifPrefs.dailyReminderHour === h ? theme.accent : 'transparent',
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: notifPrefs.dailyReminderHour === h ? theme.accent : theme.gray }}>
                          {h}h
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Streak warning toggle */}
              <View style={[s.switchRow, { paddingVertical: 14 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.settingLabel, { color: theme.white, marginBottom: 0 }]}>🔥 Aviso de racha</Text>
                  <Text style={{ fontSize: 11, color: theme.gray, marginTop: 2 }}>Alerta a las 21h si no has entrenado</Text>
                </View>
                <Switch
                  value={notifPrefs.streakWarningEnabled}
                  onValueChange={v => updateNotifPrefs({ streakWarningEnabled: v })}
                  trackColor={{ false: theme.border, true: theme.accent + '66' }}
                  thumbColor={notifPrefs.streakWarningEnabled ? theme.accent : theme.gray}
                />
              </View>
            </View>
          )}

          {/* ── Accesos rápidos ── */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>HERRAMIENTAS</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginBottom: 14 }}>
            <TouchableOpacity
              style={[s.toolBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => router.push('/historial')}
            >
              <Text style={{ fontSize: 24 }}>📊</Text>
              <Text style={[s.toolBtnText, { color: theme.white }]}>Historial</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toolBtn, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
              onPress={() => router.push('/retos')}
            >
              <Text style={{ fontSize: 24 }}>🎯</Text>
              <Text style={[s.toolBtnText, { color: theme.white }]}>Retos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toolBtn, { backgroundColor: theme.bgCard, borderColor: theme.accent + '60' }]}
              onPress={() => router.push('/chat')}
            >
              <Text style={{ fontSize: 24 }}>💬</Text>
              <Text style={[s.toolBtnText, { color: theme.accent }]}>Entrenador</Text>
            </TouchableOpacity>
          </View>

          {/* ── Subscription Tiers ── */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('profile.subscription')}</Text>
          {SUBSCRIPTION_TIERS.map(tier => {
            const lang = settings.lang || 'es';
            const isCurrentTier = settings.subscription === tier.id || (!settings.subscription && tier.id === 'free');
            return (
              <TouchableOpacity
                key={tier.id}
                style={[s.card, {
                  backgroundColor: theme.bgCard, borderColor: isCurrentTier ? tier.color : theme.border,
                  borderWidth: isCurrentTier ? 2 : 1, marginBottom: 10,
                }]}
                onPress={() => tier.id !== 'free' && handleSubscription()}
                activeOpacity={tier.id === 'free' ? 1 : 0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 22 }}>{tier.icon}</Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: tier.color }}>{tier.name[lang]}</Text>
                  </View>
                  {isCurrentTier && (
                    <View style={{ backgroundColor: tier.color + '22', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: tier.color }}>ACTUAL</Text>
                    </View>
                  )}
                </View>
                {tier.price > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <Text style={{ fontSize: 24, fontWeight: '900', color: theme.white }}>{tier.price}€</Text>
                    <Text style={{ fontSize: 12, color: theme.gray }}>/mes</Text>
                    <Text style={{ fontSize: 12, color: theme.gray }}>·</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: theme.accent }}>{tier.priceYear}€/año</Text>
                  </View>
                )}
                {(tier.features[lang] || tier.features.es).map((feat, i) => (
                  <Text key={i} style={{ fontSize: 12, color: theme.grayLight, marginBottom: 3 }}>✓ {feat}</Text>
                ))}
              </TouchableOpacity>
            );
          })}

          {/* ══════════════════════════════════════════════════════════
              ACCOUNT SECTION
             ══════════════════════════════════════════════════════════ */}
          <Text style={[s.sectionTitle, { color: theme.gray }]}>{t('profile.account')}</Text>

          {/* Log out */}
          <TouchableOpacity
            style={[s.card, s.accountRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[s.accountRowText, { color: theme.danger }]}>{t('profile.logout')}</Text>
          </TouchableOpacity>

          {/* Privacy policy */}
          <TouchableOpacity
            style={[s.card, s.accountRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={() => Alert.alert(t('profile.privacyPolicy'), t('profile.comingSoonMsg'))}
            activeOpacity={0.7}
          >
            <Text style={[s.accountRowText, { color: theme.white }]}>{t('profile.privacyPolicy')}</Text>
            <Text style={{ color: theme.gray, fontSize: 16 }}>›</Text>
          </TouchableOpacity>

          {/* Terms of service */}
          <TouchableOpacity
            style={[s.card, s.accountRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={() => Alert.alert(t('profile.termsOfService'), t('profile.comingSoonMsg'))}
            activeOpacity={0.7}
          >
            <Text style={[s.accountRowText, { color: theme.white }]}>{t('profile.termsOfService')}</Text>
            <Text style={{ color: theme.gray, fontSize: 16 }}>›</Text>
          </TouchableOpacity>

          {/* Delete account */}
          <TouchableOpacity
            style={[s.card, s.accountRow, { backgroundColor: theme.bgCard, borderColor: theme.border }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={[s.accountRowText, { color: theme.danger }]}>{t('profile.deleteAccount')}</Text>
          </TouchableOpacity>

          {/* App version */}
          <Text style={[s.versionText, { color: theme.gray }]}>HAB v1.0.0</Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, borderRadius: 10, padding: 2, borderWidth: 1 },
  headerInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '900' },
  levelBadge: { fontSize: 12, marginTop: 2 },
  editBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  statVal: { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLbl: { fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, paddingHorizontal: 20, marginBottom: 10 },
  card: { marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, marginBottom: 14, borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: '700' },
  rowInput: { fontSize: 14, fontWeight: '700', textAlign: 'right', minWidth: 100 },
  diffBanner: { marginHorizontal: 20, borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  diffText: { fontSize: 15, fontWeight: '800' },
  weightInput: { flexDirection: 'row', gap: 10, paddingVertical: 12, borderBottomWidth: 0.5 },
  weightField: { flex: 1, fontSize: 16, fontWeight: '700' },
  weightBtn: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  weightBtnText: { color: '#000', fontWeight: '800', fontSize: 13 },
  weightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5 },
  weightDate: { flex: 1, fontSize: 13 },
  weightVal: { fontSize: 15, fontWeight: '800', marginRight: 8 },
  latestPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 },
  latestText: { fontSize: 10, fontWeight: '700' },
  emptyText: { textAlign: 'center', paddingVertical: 20, fontSize: 14 },

  /* ── Settings styles ── */
  settingLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 14 },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pill: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 8 },
  pillHalf: { flex: 1, alignItems: 'center' },
  pillText: { fontSize: 13, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  switchRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  switchLabel: { fontSize: 12, fontWeight: '600' },

  /* ── Subscription styles ── */
  currentPlanRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  planBadge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  planBadgeText: { fontSize: 12, fontWeight: '800' },
  subsCards: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  subsCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center' },
  subsCardTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  subsCardPrice: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  subsCardPeriod: { fontSize: 12, fontWeight: '600' },
  savingsBadge: { position: 'absolute', top: -10, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  savingsText: { color: '#000', fontSize: 10, fontWeight: '800' },
  subsRecommended: { fontSize: 10, fontWeight: '700', marginTop: 6 },

  /* ── Account styles ── */
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  accountRowText: { fontSize: 15, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  toolBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1 },
  toolBtnText: { fontSize: 11, fontWeight: '800' },
});
