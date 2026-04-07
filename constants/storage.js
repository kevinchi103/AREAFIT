import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STATE:   'areafit_state',
  PROFILE: 'areafit_profile',
  WEIGHTS: 'areafit_weights',
};

export const DEFAULT_STATE = {
  onboarded:       false,
  currentWeek:     1,
  completedDays:   [],
  xp:              0,
  level:           1,
  streak:          0,
  lastTrainDate:   null,
  testPassed:      false,
};

export const DEFAULT_PROFILE = {
  name:       '',
  photoUri:   null,
  height:     '',
  startWeight:'',
  goal:       '',
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