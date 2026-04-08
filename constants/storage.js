import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STATE:      'areafit_state',
  PROFILE:    'areafit_profile',
  WEIGHTS:    'areafit_weights',
  HISTORY:    'areafit_history',
  CHALLENGES: 'areafit_challenges',
};

export const DEFAULT_STATE = {
  onboarded:           false,
  currentWeek:         1,
  completedDays:       [],
  xp:                  0,
  weeklyXP:            0,
  level:               1,
  streak:              0,
  lastTrainDate:       null,
  testPassed:          false,
  trainingEnvironment: 'home', // 'home' | 'gym'
};

export const DEFAULT_PROFILE = {
  name:       '',
  photoUri:   null,
  height:     '',
  startWeight:'',
  goal:       '',
  benchPress: '', // kg en press banca (1RM aproximado)
  squat:      '', // kg en sentadilla (1RM aproximado)
};

export async function loadState() {
  try { const r = await AsyncStorage.getItem(KEYS.STATE); return r ? JSON.parse(r) : { ...DEFAULT_STATE }; }
  catch { return { ...DEFAULT_STATE }; }
}
export async function saveState(s) {
  try { await AsyncStorage.setItem(KEYS.STATE, JSON.stringify(s)); } catch {}
}
export async function loadProfile() {
  try { const r = await AsyncStorage.getItem(KEYS.PROFILE); return r ? JSON.parse(r) : { ...DEFAULT_PROFILE }; }
  catch { return { ...DEFAULT_PROFILE }; }
}
export async function saveProfile(p) {
  try { await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(p)); } catch {}
}
export async function loadWeights() {
  try { const r = await AsyncStorage.getItem(KEYS.WEIGHTS); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
export async function saveWeights(w) {
  try { await AsyncStorage.setItem(KEYS.WEIGHTS, JSON.stringify(w)); } catch {}
}

// ── Historial de entrenamientos ────────────────────────────────
export async function loadHistory() {
  try { const r = await AsyncStorage.getItem(KEYS.HISTORY); return r ? JSON.parse(r) : []; }
  catch { return []; }
}
export async function saveSession(session) {
  try {
    const history = await loadHistory();
    const updated = [session, ...history].slice(0, 200); // máx 200 sesiones
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch {}
}

// ── Progreso de retos ──────────────────────────────────────────
export async function loadChallengeProgress() {
  try { const r = await AsyncStorage.getItem(KEYS.CHALLENGES); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}
export async function saveChallengeProgress(data) {
  try { await AsyncStorage.setItem(KEYS.CHALLENGES, JSON.stringify(data)); } catch {}
}