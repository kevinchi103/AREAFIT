import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STATE:      'hab_state',
  PROFILE:    'hab_profile',
  WEIGHTS:    'hab_weights',
  HISTORY:    'hab_history',
  CHALLENGES: 'hab_challenges',
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
  trainingEnvironment: 'home',    // 'home' | 'gym'
  fitnessLevel:        'mid',     // 'low' | 'mid' | 'high'
  workoutDuration:     60,        // 30 | 60 | 90 minutos
  daysPerWeek:         4,         // 3-5 días de entrenamiento
};

export const DEFAULT_PROFILE = {
  name:       '',
  photoUri:   null,
  height:     '',
  startWeight:'',
  goal:       '',         // 'lose_weight' | 'gain_muscle' | 'get_fit' | 'maintain'
  benchPress: '',
  squat:      '',
  availableTime: '60',    // minutos disponibles por sesión
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