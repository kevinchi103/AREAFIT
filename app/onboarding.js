import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadState, saveState, saveProfile } from '../constants/storage';
import { useSettings } from '../constants/SettingsContext';
import { getTheme } from '../constants/theme';

export default function Onboarding() {
  const router = useRouter();
  const { t, isDark } = useSettings();
  const theme = getTheme(isDark);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  async function startFromZero() {
    const state = await loadState();
    state.onboarded = true;
    state.currentWeek = 1;
    await saveState(state);
    if (name) await saveProfile({ name, photoUri: null, height: '', startWeight: '', goal: '' });
    router.replace('/(tabs)');
  }

  async function goToTest() {
    const state = await loadState();
    state.onboarded = true;
    await saveState(state);
    if (name) await saveProfile({ name, photoUri: null, height: '', startWeight: '', goal: '' });
    router.replace('/test');
  }

  if (step === 0) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
        <View style={s.center}>
          <Text style={[s.logo, { color: theme.accent }]}>{t('auth.appName')}</Text>
          <Text style={[s.tagline, { color: theme.grayLight }]}>{t('onboarding.tagline')}</Text>
          <View style={[s.divider, { backgroundColor: theme.border }]} />
          <Text style={[s.sub, { color: theme.gray }]}>{t('onboarding.subtitle')}</Text>
          <TouchableOpacity style={[s.btnAccent, { backgroundColor: theme.accent }]} onPress={() => setStep(1)}>
            <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>{t('onboarding.start')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 1) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
          <View style={s.center}>
            <Text style={[s.question, { color: theme.white }]}>{t('onboarding.whatName')}</Text>
            <TextInput
              style={[s.input, { backgroundColor: theme.bgCard, color: theme.white, borderColor: theme.border }]}
              placeholder={t('onboarding.yourName')}
              placeholderTextColor={theme.gray}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={[s.btnAccent, { backgroundColor: theme.accent, marginTop: 24 }]} onPress={() => setStep(2)}>
              <Text style={[s.btnAccentText, { color: isDark ? '#000' : '#fff' }]}>
                {name ? `${t('onboarding.hello')} ${name} →` : `${t('onboarding.continue')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.bg }]}>
      <View style={s.center}>
        <Text style={[s.question, { color: theme.white }]}>
          {name ? `${name}, ¿` : '¿'}{t('onboarding.experience')}
        </Text>
        <Text style={[s.hint, { color: theme.gray }]}>{t('onboarding.beHonest')}</Text>
        <TouchableOpacity style={[s.optionCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]} onPress={startFromZero}>
          <Text style={s.optionEmoji}>🌱</Text>
          <View style={s.optionInfo}>
            <Text style={[s.optionTitle, { color: theme.white }]}>{t('onboarding.fromZero')}</Text>
            <Text style={[s.optionDesc, { color: theme.gray }]}>{t('onboarding.fromZeroDesc')}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[s.optionCard, { backgroundColor: theme.bgCard, borderColor: theme.accent }]} onPress={goToTest}>
          <Text style={s.optionEmoji}>⚡</Text>
          <View style={s.optionInfo}>
            <Text style={[s.optionTitle, { color: theme.accent }]}>{t('onboarding.doTest')}</Text>
            <Text style={[s.optionDesc, { color: theme.gray }]}>{t('onboarding.doTestDesc')}</Text>
          </View>
        </TouchableOpacity>
        <Text style={[s.note, { color: theme.gray }]}>{t('onboarding.testNote')}</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 48, fontWeight: '900', letterSpacing: 4, textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  divider: { height: 1, marginBottom: 24 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 48 },
  btnAccent: { borderRadius: 14, padding: 18, alignItems: 'center' },
  btnAccentText: { fontSize: 17, fontWeight: '800' },
  question: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 24, lineHeight: 36 },
  hint: { fontSize: 13, textAlign: 'center', marginBottom: 32 },
  input: { borderRadius: 12, padding: 16, fontSize: 18, borderWidth: 1 },
  optionCard: { borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14, borderWidth: 1 },
  optionEmoji: { fontSize: 32 },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  optionDesc: { fontSize: 13, lineHeight: 18 },
  note: { fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
