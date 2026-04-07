// constants/leagues.js
// Sistema de ligas AREAFIT — lógica completa

import { supabase } from './supabase';
import { loadState, saveState } from './storage';

// ─── Definición de ligas ────────────────────────────────────────
export const LEAGUES = [
  { id: 'bronze',  name: 'Bronce',   icon: '🥉', color: '#CD7F32', minXP: 0,    maxXP: 999  },
  { id: 'silver',  name: 'Plata',    icon: '🥈', color: '#C0C0C0', minXP: 1000, maxXP: 2499 },
  { id: 'gold',    name: 'Oro',      icon: '🥇', color: '#FFD700', minXP: 2500, maxXP: 4999 },
  { id: 'diamond', name: 'Diamante', icon: '💎', color: '#00E5FF', minXP: 5000, maxXP: 99999},
];

// XP por acción
export const XP_REWARDS = {
  WORKOUT_COMPLETE: 100,
  STREAK_BONUS:     25,   // por cada día de racha (máx 5 días = 125 bonus)
  PERFECT_WEEK:     200,  // 3 entrenos en la semana
  LEVEL_UP:         50,
};

// ─── Helpers ────────────────────────────────────────────────────

/** Devuelve la liga correspondiente a un total de XP */
export function getLeagueForXP(totalXP) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (totalXP >= LEAGUES[i].minXP) return LEAGUES[i];
  }
  return LEAGUES[0];
}

/** Progreso dentro de la liga actual (0–1) */
export function getLeagueProgress(totalXP) {
  const league = getLeagueForXP(totalXP);
  if (league.id === 'diamond') return 1;
  const range = league.maxXP - league.minXP + 1;
  const current = totalXP - league.minXP;
  return Math.min(current / range, 1);
}

/** XP para subir a la siguiente liga */
export function xpToNextLeague(totalXP) {
  const league = getLeagueForXP(totalXP);
  if (league.id === 'diamond') return 0;
  return league.maxXP + 1 - totalXP;
}

/** Calcula el nivel (cada 500 XP = 1 nivel) */
export function calcLevel(totalXP) {
  return Math.floor(totalXP / 500) + 1;
}

/** Nombre abreviado para el ranking */
function abbreviateName(name) {
  if (!name) return 'Atleta';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

// ─── Supabase: sincronización ────────────────────────────────────

/**
 * Asegura que el usuario existe en la tabla users.
 * Llamar al iniciar sesión / onboarding.
 */
export async function ensureUserProfile(userId, displayName, email) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      display_name: displayName || email?.split('@')[0] || 'Atleta',
      email,
    }, { onConflict: 'id', ignoreDuplicates: false });

  if (error) console.warn('ensureUserProfile error:', error.message);
}

/**
 * Sincroniza el XP local → Supabase después de cada entreno.
 * Actualiza users.total_xp, users.weekly_xp, users.streak, users.level
 * y hace upsert en league_users para el ranking.
 */
export async function syncXPToSupabase(xpEarned) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;
    const state  = await loadState();

    const newTotalXP   = (state.xp || 0) + xpEarned;
    const newWeeklyXP  = (state.weeklyXP || 0) + xpEarned;
    const newLevel     = calcLevel(newTotalXP);
    const newLeague    = getLeagueForXP(newWeeklyXP); // liga basada en XP SEMANAL

    // 1. Actualizar tabla users
    await supabase.from('users').upsert({
      id:             userId,
      total_xp:       newTotalXP,
      weekly_xp:      newWeeklyXP,
      streak:         state.streak || 0,
      level:          newLevel,
      current_league: newLeague.id,
    }, { onConflict: 'id' });

    // 2. Upsert en league_users (ranking semanal)
    const weekStart = getWeekStart();
    await supabase.from('league_users').upsert({
      user_id:    userId,
      league_id:  newLeague.id,
      weekly_xp:  newWeeklyXP,
      week_start: weekStart,
    }, { onConflict: 'user_id,week_start' });

    // 3. Registrar en points_history
    await supabase.from('points_history').insert({
      user_id:  userId,
      xp_delta: xpEarned,
      reason:   'workout_complete',
    });

    // 4. Actualizar estado local
    await saveState({
      ...state,
      xp:       newTotalXP,
      weeklyXP: newWeeklyXP,
      level:    newLevel,
    });

    return { newTotalXP, newWeeklyXP, newLeague, newLevel };
  } catch (err) {
    console.warn('syncXPToSupabase error:', err.message);
    return null;
  }
}

/**
 * Guarda una sesión de entreno completada.
 */
export async function saveWorkoutSession(workoutId, xpEarned, weekNumber) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('workout_sessions').insert({
      user_id:      session.user.id,
      workout_id:   workoutId,
      xp_earned:    xpEarned,
      week_number:  weekNumber,
      completed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('saveWorkoutSession error:', err.message);
  }
}

// ─── Supabase: ranking ───────────────────────────────────────────

/**
 * Obtiene el ranking de una liga para la semana actual.
 * Devuelve array de { userId, displayName, weeklyXP, streak, level, rank }
 */
export async function fetchLeagueRanking(leagueId) {
  try {
    const weekStart = getWeekStart();

    const { data, error } = await supabase
      .from('league_users')
      .select(`
        user_id,
        weekly_xp,
        users (
          display_name,
          streak,
          level
        )
      `)
      .eq('league_id', leagueId)
      .eq('week_start', weekStart)
      .order('weekly_xp', { ascending: false })
      .limit(50);

    if (error) throw error;

    return (data || []).map((row, index) => ({
      userId:      row.user_id,
      displayName: abbreviateName(row.users?.display_name) || 'Atleta',
      weeklyXP:    row.weekly_xp || 0,
      streak:      row.users?.streak || 0,
      level:       row.users?.level || 1,
      rank:        index + 1,
    }));
  } catch (err) {
    console.warn('fetchLeagueRanking error:', err.message);
    return [];
  }
}

/**
 * Suscripción en tiempo real al ranking de una liga.
 * Devuelve la función de unsubscribe.
 */
export function subscribeToLeagueRanking(leagueId, onUpdate) {
  const weekStart = getWeekStart();

  const channel = supabase
    .channel(`ranking-${leagueId}-${weekStart}`)
    .on('postgres_changes', {
      event:  '*',
      schema: 'public',
      table:  'league_users',
      filter: `league_id=eq.${leagueId}`,
    }, () => {
      // Re-fetch al detectar cambio
      fetchLeagueRanking(leagueId).then(onUpdate);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// ─── Utils ──────────────────────────────────────────────────────

/** Lunes de la semana actual en formato YYYY-MM-DD */
function getWeekStart() {
  const now  = new Date();
  const day  = now.getDay(); // 0=dom, 1=lun...
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

/** Días restantes hasta el domingo (fin de semana de liga) */
export function daysUntilReset() {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}

/** Calcula XP ganado en un entreno según racha */
export function calcWorkoutXP(streak) {
  const base  = XP_REWARDS.WORKOUT_COMPLETE;
  const bonus = Math.min(streak, 5) * XP_REWARDS.STREAK_BONUS;
  return base + bonus;
}
