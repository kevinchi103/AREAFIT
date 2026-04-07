import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, Animated, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../constants/supabase';
import { ensureUserProfile } from '../constants/leagues';
import { loadState, saveState, saveProfile } from '../constants/storage';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);

  // Mode: 'welcome' | 'login' | 'register' | 'register2'
  const [mode, setMode] = useState('welcome');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  function animateTransition(nextMode) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setMode(nextMode);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  // ── Styles (theme-aware) ──
  const s = makeStyles(theme);

  // ── Login ──
  async function handleLogin() {
    if (!email || !password) { Alert.alert(t('auth.error'), t('auth.errFillFields')); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session?.user) {
        await ensureUserProfile(data.session.user.id, email.split('@')[0], email);
        const state = await loadState();
        if (state.weeklyXP === undefined) await saveState({ ...state, weeklyXP: 0 });
      }
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert(t('auth.error'), e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Register step 1 -> step 2 ──
  function handleRegisterNext() {
    if (!name.trim()) { Alert.alert(t('auth.error'), t('auth.errName')); return; }
    if (!email.trim()) { Alert.alert(t('auth.error'), t('auth.errEmail')); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { Alert.alert(t('auth.error'), t('auth.errEmailInvalid')); return; }
    animateTransition('register2');
  }

  // ── Register final ──
  async function handleRegister() {
    if (!password) { Alert.alert(t('auth.error'), t('auth.errPassword')); return; }
    if (password.length < 6) { Alert.alert(t('auth.error'), t('auth.errPasswordShort')); return; }
    if (password !== confirmPassword) { Alert.alert(t('auth.error'), t('auth.passwordsNoMatch')); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const displayName = name.trim() || email.split('@')[0];
        await ensureUserProfile(data.user.id, displayName, email);

        // Save profile and local state
        await saveProfile({ name: displayName, photoUri: null, height: '', startWeight: '', goal: goal || '' });
        const state = await loadState();
        await saveState({ ...state, weeklyXP: 0 });

        router.replace('/onboarding');
      }
    } catch (e) {
      Alert.alert(t('auth.error'), e.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── WELCOME SCREEN ───
  if (mode === 'welcome') {
    return (
      <SafeAreaView style={s.safe}>
        <Animated.View style={[s.center, { opacity: fadeAnim }]}>
          <View style={s.welcomeTop}>
            <Text style={s.logo}>{t('auth.appName')}</Text>
            <Text style={s.tagline}>{t('auth.tagline')}</Text>
            <View style={s.divider} />
            <View style={s.featureList}>
              <Feature icon="⚡" text={t('auth.feat1')} theme={theme} />
              <Feature icon="🏆" text={t('auth.feat2')} theme={theme} />
              <Feature icon="📈" text={t('auth.feat3')} theme={theme} />
              <Feature icon="🔥" text={t('auth.feat4')} theme={theme} />
            </View>
          </View>

          <View style={s.welcomeBottom}>
            <TouchableOpacity style={s.btnAccent} onPress={() => animateTransition('register')}>
              <Text style={s.btnAccentText}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnOutline} onPress={() => animateTransition('login')}>
              <Text style={s.btnOutlineText}>{t('auth.haveAccount')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // ─── LOGIN SCREEN ───
  if (mode === 'login') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={s.safe}>
          <Animated.View style={[s.center, { opacity: fadeAnim }]}>
            <TouchableOpacity style={s.backRow} onPress={() => animateTransition('welcome')}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>

            <Text style={s.title}>{t('auth.welcomeBack')}</Text>
            <Text style={s.subtitle}>{t('auth.loginSubtitle')}</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('auth.email')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={theme.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('auth.password')}</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={theme.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={s.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.btnAccent, { marginTop: 24 }, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={s.btnAccentText}>{loading ? t('auth.entering') : t('auth.enter')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.switchBtn} onPress={() => animateTransition('register')}>
              <Text style={s.switchText}>{t('auth.noAccount')} <Text style={s.switchLink}>{t('auth.register')}</Text></Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ─── REGISTER STEP 1: nombre + email ───
  if (mode === 'register') {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={s.safe}>
          <Animated.View style={[s.center, { opacity: fadeAnim }]}>
            <TouchableOpacity style={s.backRow} onPress={() => animateTransition('welcome')}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>

            {/* Step indicator */}
            <View style={s.stepRow}>
              <View style={[s.stepDot, s.stepActive]} />
              <View style={s.stepLine} />
              <View style={s.stepDot} />
            </View>
            <Text style={s.stepLabel}>{t('auth.step1of2')}</Text>

            <Text style={s.title}>{t('auth.createYourAccount')}</Text>
            <Text style={s.subtitle}>{t('auth.tellUsAboutYou')}</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('auth.name')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('auth.namePlaceholder')}
                placeholderTextColor={theme.gray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('auth.email')}</Text>
              <TextInput
                style={s.input}
                placeholder={t('auth.emailPlaceholder')}
                placeholderTextColor={theme.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('auth.goalOptional')}</Text>
              <TouchableOpacity
                style={[s.goalOption, goal === t('auth.loseWeight') && s.goalSelected]}
                onPress={() => setGoal(t('auth.loseWeight'))}
              >
                <Text style={s.goalIcon}>🔥</Text>
                <Text style={[s.goalText, goal === t('auth.loseWeight') && s.goalTextSelected]}>{t('auth.loseWeight')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.goalOption, goal === t('auth.gainMuscle') && s.goalSelected]}
                onPress={() => setGoal(t('auth.gainMuscle'))}
              >
                <Text style={s.goalIcon}>💪</Text>
                <Text style={[s.goalText, goal === t('auth.gainMuscle') && s.goalTextSelected]}>{t('auth.gainMuscle')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.goalOption, goal === t('auth.getInShape') && s.goalSelected]}
                onPress={() => setGoal(t('auth.getInShape'))}
              >
                <Text style={s.goalIcon}>⚡</Text>
                <Text style={[s.goalText, goal === t('auth.getInShape') && s.goalTextSelected]}>{t('auth.getInShape')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.btnAccent, { marginTop: 16 }]} onPress={handleRegisterNext}>
              <Text style={s.btnAccentText}>{t('auth.next')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.switchBtn} onPress={() => animateTransition('login')}>
              <Text style={s.switchText}>{t('auth.hasAccount')} <Text style={s.switchLink}>{t('auth.login')}</Text></Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ─── REGISTER STEP 2: password ───
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={s.safe}>
        <Animated.View style={[s.center, { opacity: fadeAnim }]}>
          <TouchableOpacity style={s.backRow} onPress={() => animateTransition('register')}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Step indicator */}
          <View style={s.stepRow}>
            <View style={[s.stepDot, s.stepDone]} />
            <View style={[s.stepLine, s.stepLineDone]} />
            <View style={[s.stepDot, s.stepActive]} />
          </View>
          <Text style={s.stepLabel}>{t('auth.step2of2')}</Text>

          <Text style={s.title}>{t('auth.choosePassword')}</Text>
          <Text style={s.subtitle}>{t('auth.min6chars')}</Text>

          <View style={s.userPreview}>
            <View style={s.userPreviewAvatar}>
              <Text style={s.userPreviewInitial}>{(name || 'A')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={s.userPreviewName}>{name}</Text>
              <Text style={s.userPreviewEmail}>{email}</Text>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>{t('auth.password')}</Text>
            <View style={s.passwordRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder={t('auth.min6chars')}
                placeholderTextColor={theme.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoFocus
              />
              <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={s.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>{t('auth.repeatPassword')}</Text>
            <TextInput
              style={s.input}
              placeholder={t('auth.repeatPlaceholder')}
              placeholderTextColor={theme.gray}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          {/* Password strength */}
          {password.length > 0 && (
            <View style={s.strengthRow}>
              <View style={[s.strengthBar, password.length >= 2 && s.strengthWeak]} />
              <View style={[s.strengthBar, password.length >= 4 && s.strengthMedium]} />
              <View style={[s.strengthBar, password.length >= 6 && s.strengthStrong]} />
              <View style={[s.strengthBar, password.length >= 8 && s.strengthVeryStrong]} />
              <Text style={s.strengthText}>
                {password.length < 4 ? t('auth.weak') : password.length < 6 ? t('auth.medium') : password.length < 8 ? t('auth.good') : t('auth.strong')}
              </Text>
            </View>
          )}

          {password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword && (
            <Text style={s.errorText}>{t('auth.passwordsNoMatch')}</Text>
          )}

          <TouchableOpacity
            style={[s.btnAccent, { marginTop: 20 }, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={s.btnAccentText}>{loading ? t('auth.creating') : t('auth.createAccount')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Feature bullet ──────────────────────────────────────────────
function Feature({ icon, text, theme }) {
  return (
    <View style={featureStyles.featureRow}>
      <Text style={featureStyles.featureIcon}>{icon}</Text>
      <Text style={[featureStyles.featureText, { color: theme.grayLight }]}>{text}</Text>
    </View>
  );
}

// Static styles for Feature (layout only, color applied inline)
const featureStyles = StyleSheet.create({
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureText: { fontSize: 15, fontWeight: '600' },
});

// ─── Theme-aware styles ─────────────────────────────────────────
function makeStyles(theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.bg },
    center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },

    // Welcome
    welcomeTop: { flex: 1, justifyContent: 'center' },
    welcomeBottom: { paddingBottom: 24, gap: 12 },
    logo: { fontSize: 52, fontWeight: '900', color: theme.accent, letterSpacing: 5, textAlign: 'center', marginBottom: 8 },
    tagline: { fontSize: 16, color: theme.grayLight, textAlign: 'center', marginBottom: 28 },
    divider: { height: 1, backgroundColor: theme.border, marginBottom: 28 },

    featureList: { gap: 14 },

    // Buttons
    btnAccent: { backgroundColor: theme.accent, borderRadius: 14, padding: 18, alignItems: 'center' },
    btnAccentText: { color: '#000', fontSize: 17, fontWeight: '800' },
    btnOutline: { borderWidth: 2, borderColor: theme.border, borderRadius: 14, padding: 18, alignItems: 'center' },
    btnOutlineText: { color: theme.white, fontSize: 17, fontWeight: '800' },

    // Back
    backRow: { marginBottom: 20 },
    backArrow: { fontSize: 28, color: theme.gray, fontWeight: '300' },

    // Steps
    stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 0 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.border },
    stepActive: { backgroundColor: theme.accent, width: 12, height: 12, borderRadius: 6 },
    stepDone: { backgroundColor: theme.success },
    stepLine: { width: 40, height: 2, backgroundColor: theme.border, marginHorizontal: 6 },
    stepLineDone: { backgroundColor: theme.success },
    stepLabel: { fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1.5, textAlign: 'center', marginBottom: 20 },

    // Titles
    title: { fontSize: 28, fontWeight: '900', color: theme.white, marginBottom: 6 },
    subtitle: { fontSize: 14, color: theme.gray, marginBottom: 28 },

    // Inputs
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 10, fontWeight: '800', color: theme.gray, letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: theme.bgCard, borderRadius: 12, padding: 16, fontSize: 16, color: theme.white, borderWidth: 1, borderColor: theme.border },
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    eyeBtn: { padding: 12, backgroundColor: theme.bgCard, borderRadius: 12, borderWidth: 1, borderColor: theme.border },
    eyeText: { fontSize: 18 },

    // Goals
    goalOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.bgCard, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
    goalSelected: { borderColor: theme.accent, backgroundColor: theme.accent + '10' },
    goalIcon: { fontSize: 20 },
    goalText: { fontSize: 15, color: theme.gray, fontWeight: '700' },
    goalTextSelected: { color: theme.accent },

    // User preview
    userPreview: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.bgCard, borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: theme.border },
    userPreviewAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
    userPreviewInitial: { fontSize: 20, fontWeight: '900', color: '#000' },
    userPreviewName: { fontSize: 15, fontWeight: '800', color: theme.white },
    userPreviewEmail: { fontSize: 12, color: theme.gray, marginTop: 1 },

    // Password strength
    strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.border },
    strengthWeak: { backgroundColor: theme.danger },
    strengthMedium: { backgroundColor: '#FF9500' },
    strengthStrong: { backgroundColor: theme.accent },
    strengthVeryStrong: { backgroundColor: theme.success },
    strengthText: { fontSize: 11, color: theme.gray, fontWeight: '700', marginLeft: 4 },

    // Error
    errorText: { color: theme.danger, fontSize: 12, fontWeight: '600', marginTop: 6 },

    // Switch
    switchBtn: { padding: 16, alignItems: 'center' },
    switchText: { color: theme.gray, fontSize: 14 },
    switchLink: { color: theme.accent, fontWeight: '700' },
  });
}
