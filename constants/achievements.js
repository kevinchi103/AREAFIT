// constants/achievements.js
// Motor de logros — definiciones locales + sync Supabase

import { supabase } from './supabase';
import { getLeagueForXP } from './leagues';

// ─── Definiciones de logros (local, no depende de DB) ───────────
export const ACHIEVEMENT_DEFS = [
  { id: 'first_spark',   icon: '🔥', category: 'general', xp: 50,   sort: 1,
    name: { es: 'Primera chispa',   ca: 'Primera espurna',   en: 'First spark' },
    desc: { es: 'Completa tu primer entrenamiento', ca: 'Completa el teu primer entrenament', en: 'Complete your first workout' }},
  { id: 'on_fire',       icon: '🔥', category: 'streak',  xp: 100,  sort: 2,
    name: { es: 'En llamas',        ca: 'En flames',         en: 'On fire' },
    desc: { es: 'Racha de 7 días',  ca: 'Ratxa de 7 dies',   en: '7-day streak' }},
  { id: 'unstoppable',   icon: '🔥', category: 'streak',  xp: 500,  sort: 3,
    name: { es: 'Imparable',        ca: 'Imparable',         en: 'Unstoppable' },
    desc: { es: 'Racha de 30 días', ca: 'Ratxa de 30 dies',  en: '30-day streak' }},
  { id: 'beginner_done', icon: '💪', category: 'phase',   xp: 200,  sort: 4,
    name: { es: 'Principiante',     ca: 'Principiant',       en: 'Beginner' },
    desc: { es: 'Completa la fase Principiante', ca: 'Completa la fase Principiant', en: 'Complete Beginner phase' }},
  { id: 'inter_done',    icon: '💪', category: 'phase',   xp: 300,  sort: 5,
    name: { es: 'Intermedio',       ca: 'Intermedi',         en: 'Intermediate' },
    desc: { es: 'Completa la fase Intermedia', ca: 'Completa la fase Intermèdia', en: 'Complete Intermediate phase' }},
  { id: 'advanced_done', icon: '💪', category: 'phase',   xp: 400,  sort: 6,
    name: { es: 'Avanzado',         ca: 'Avançat',           en: 'Advanced' },
    desc: { es: 'Completa la fase Avanzada', ca: 'Completa la fase Avançada', en: 'Complete Advanced phase' }},
  { id: 'elite_done',    icon: '💪', category: 'phase',   xp: 1000, sort: 7,
    name: { es: 'Élite',            ca: 'Èlit',              en: 'Elite' },
    desc: { es: 'Completa las 20 semanas', ca: 'Completa les 20 setmanes', en: 'Complete all 20 weeks' }},
  { id: 'silver_league', icon: '🏆', category: 'league',  xp: 150,  sort: 8,
    name: { es: 'Primera liga',     ca: 'Primera lliga',     en: 'First league' },
    desc: { es: 'Entra en liga Plata', ca: 'Entra a la lliga Plata', en: 'Enter Silver league' }},
  { id: 'diamond_league',icon: '🏆', category: 'league',  xp: 500,  sort: 9,
    name: { es: 'Campeón',          ca: 'Campió',            en: 'Champion' },
    desc: { es: 'Llega a liga Diamante', ca: 'Arriba a la lliga Diamant', en: 'Reach Diamond league' }},
  { id: 'xp_1000',       icon: '⚡', category: 'xp',      xp: 0,    sort: 10,
    name: { es: 'Mil puntos',       ca: 'Mil punts',         en: 'Thousand points' },
    desc: { es: 'Acumula 1.000 XP', ca: 'Acumula 1.000 XP', en: 'Accumulate 1,000 XP' }},
  { id: 'xp_10000',      icon: '⚡', category: 'xp',      xp: 0,    sort: 11,
    name: { es: 'Diez mil',         ca: 'Deu mil',           en: 'Ten thousand' },
    desc: { es: 'Acumula 10.000 XP', ca: 'Acumula 10.000 XP', en: 'Accumulate 10,000 XP' }},
  { id: 'early_bird',    icon: '📅', category: 'special', xp: 75,   sort: 12,
    name: { es: 'Madrugador',       ca: 'Matiner',           en: 'Early bird' },
    desc: { es: 'Entrena antes de las 7am', ca: 'Entrena abans de les 7am', en: 'Work out before 7am' }},
  { id: 'night_owl',     icon: '📅', category: 'special', xp: 75,   sort: 13,
    name: { es: 'Noctámbulo',       ca: 'Noctàmbul',         en: 'Night owl' },
    desc: { es: 'Entrena después de las 22h', ca: 'Entrena després de les 22h', en: 'Work out after 10pm' }},
  { id: 'consistent',    icon: '🗓️', category: 'special',  xp: 100,  sort: 14,
    name: { es: 'Constante',        ca: 'Constant',          en: 'Consistent' },
    desc: { es: 'Entrena 4+ días en una semana', ca: 'Entrena 4+ dies en una setmana', en: 'Train 4+ days in a week' }},
  { id: 'premium_user',  icon: '👑', category: 'special', xp: 0,    sort: 15,
    name: { es: 'Premium',          ca: 'Premium',           en: 'Premium' },
    desc: { es: 'Activa suscripción premium', ca: 'Activa subscripció premium', en: 'Activate premium subscription' }},
];

// ─── Cargar logros desbloqueados del usuario ────────────────────

export async function fetchMyAchievements() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_id, unlocked_at')
    .eq('user_id', session.user.id);

  if (error) {
    console.warn('fetchMyAchievements:', error.message);
    return [];
  }
  return data || [];
}

// ─── Desbloquear un logro ───────────────────────────────────────

async function unlockAchievement(achievementId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  const { error } = await supabase.from('achievements').upsert({
    user_id: session.user.id,
    achievement_id: achievementId,
    unlocked_at: new Date().toISOString(),
  }, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true });

  if (error) {
    console.warn('unlockAchievement:', error.message);
    return false;
  }
  return true;
}

// ─── Comprobar y desbloquear logros después de un entreno ───────

export async function checkAndUnlockAchievements(state) {
  const unlocked = await fetchMyAchievements();
  const unlockedIds = new Set(unlocked.map(a => a.achievement_id));
  const newlyUnlocked = [];

  const totalWorkouts = (state.completedDays || []).length;
  const streak = state.streak || 0;
  const xp = state.xp || 0;
  const week = state.currentWeek || 1;
  const hour = new Date().getHours();
  const league = getLeagueForXP(state.weeklyXP || 0);

  // Count unique training days this week
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const weekDays = (state.completedDays || []).filter(key => {
    const parts = key.split('_');
    const dateStr = parts.slice(-4).join(' '); // toDateString format
    try {
      const d = new Date(dateStr);
      return d >= monday;
    } catch { return false; }
  });
  const uniqueWeekDays = new Set(weekDays.map(k => {
    const parts = k.split('_');
    return parts.slice(-4).join(' ');
  })).size;

  const checks = [
    { id: 'first_spark',   condition: totalWorkouts >= 1 },
    { id: 'on_fire',       condition: streak >= 7 },
    { id: 'unstoppable',   condition: streak >= 30 },
    { id: 'beginner_done', condition: week >= 5 },
    { id: 'inter_done',    condition: week >= 9 },
    { id: 'advanced_done', condition: week >= 13 },
    { id: 'elite_done',    condition: week >= 20 },
    { id: 'silver_league', condition: league.id === 'silver' || league.id === 'gold' || league.id === 'diamond' },
    { id: 'diamond_league',condition: league.id === 'diamond' },
    { id: 'xp_1000',       condition: xp >= 1000 },
    { id: 'xp_10000',      condition: xp >= 10000 },
    { id: 'early_bird',    condition: hour < 7 },
    { id: 'night_owl',     condition: hour >= 22 },
    { id: 'consistent',    condition: uniqueWeekDays >= 4 },
    { id: 'premium_user',  condition: state.is_premium === true },
  ];

  for (const { id, condition } of checks) {
    if (condition && !unlockedIds.has(id)) {
      const success = await unlockAchievement(id);
      if (success) {
        const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
        if (def) newlyUnlocked.push(def);
      }
    }
  }

  return newlyUnlocked;
}
