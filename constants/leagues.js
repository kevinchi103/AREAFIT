// constants/leagues.js
// Sistema de ligas AREAFIT — adaptado al schema real de Supabase
//
// Schema real:
//   users: id, name, email, xp, level, streak, is_premium, trust_score, current_week, avatar_url, created_at
//   league_users: id, user_id, league_id, points, rank
//   workout_sessions: id, user_id, workout_id, completed_at
//   points_history: id, user_id, reason, points, created_at
//   leagues: id, name, tier, created_at

import { supabase } from './supabase';
import { loadState, saveState, loadProfile } from './storage';

// ─── Definición de ligas ────────────────────────────────────────
export const LEAGUES = [
  { id: 'bronze',  name: 'Bronce',   icon: '🥉', color: '#CD7F32', minXP: 0,    maxXP: 999  },
  { id: 'silver',  name: 'Plata',    icon: '🥈', color: '#C0C0C0', minXP: 1000, maxXP: 2499 },
  { id: 'gold',    name: 'Oro',      icon: '🥇', color: '#FFD700', minXP: 2500, maxXP: 4999 },
  { id: 'diamond', name: 'Diamante', icon: '💎', color: '#00E5FF', minXP: 5000, maxXP: 99999},
];

export const XP_REWARDS = {
  WORKOUT_COMPLETE: 100,
  STREAK_BONUS:     25,
  PERFECT_WEEK:     200,
  LEVEL_UP:         50,
};

// ─── Helpers ────────────────────────────────────────────────────

export function getLeagueForXP(totalXP) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (totalXP >= LEAGUES[i].minXP) return LEAGUES[i];
  }
  return LEAGUES[0];
}

export function getLeagueProgress(totalXP) {
  const league = getLeagueForXP(totalXP);
  if (league.id === 'diamond') return 1;
  const range = league.maxXP - league.minXP + 1;
  const current = totalXP - league.minXP;
  return Math.min(current / range, 1);
}

export function xpToNextLeague(totalXP) {
  const league = getLeagueForXP(totalXP);
  if (league.id === 'diamond') return 0;
  return league.maxXP + 1 - totalXP;
}

export function calcLevel(totalXP) {
  return Math.floor(totalXP / 500) + 1;
}

function abbreviateName(name) {
  if (!name) return 'Atleta';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

export function daysUntilReset() {
  const now = new Date();
  const day = now.getDay();
  return day === 0 ? 0 : 7 - day;
}

export function calcWorkoutXP(streak) {
  const base  = XP_REWARDS.WORKOUT_COMPLETE;
  const bonus = Math.min(streak, 5) * XP_REWARDS.STREAK_BONUS;
  return base + bonus;
}

// ─── Supabase: perfil ───────────────────────────────────────────

export async function ensureUserProfile(userId, displayName, email) {
  try {
    // Columnas reales: id, name, email, xp, level, streak
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name: displayName || email?.split('@')[0] || 'Atleta',
        email,
        xp: 0,
        level: 1,
        streak: 0,
      }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) console.warn('ensureUserProfile:', error.message);
  } catch (err) {
    console.warn('ensureUserProfile catch:', err.message);
  }
}

// ─── Supabase: sync XP ─────────────────────────────────────────

export async function syncXPToSupabase(xpEarned) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const userId = session.user.id;
    const state = await loadState();
    const profile = await loadProfile();
    const totalXP  = state.xp || 0;
    const weeklyXP = state.weeklyXP || 0;
    const streak   = state.streak || 0;
    const level    = calcLevel(totalXP);
    const league   = getLeagueForXP(weeklyXP);

    // 1. Actualizar users (columnas reales: xp, level, streak)
    const { error: ue } = await supabase.from('users').upsert({
      id:     userId,
      name:   profile?.name || session.user.email?.split('@')[0] || 'Atleta',
      email:  session.user.email,
      xp:     totalXP,
      level:  level,
      streak: streak,
    }, { onConflict: 'id' });
    if (ue) console.warn('sync users:', ue.message);

    // 2. Registrar en points_history (columnas reales: user_id, points, reason)
    const { error: pe } = await supabase.from('points_history').insert({
      user_id: userId,
      points:  xpEarned,
      reason:  'workout_complete',
    });
    if (pe) console.warn('sync points_history:', pe.message);

    return { newTotalXP: totalXP, newWeeklyXP: weeklyXP, newLeague: league, newLevel: level };
  } catch (err) {
    console.warn('syncXPToSupabase error:', err.message);
    return null;
  }
}

// ─── Supabase: workout session ──────────────────────────────────

export async function saveWorkoutSession(workoutId, xpEarned, weekNumber) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Columnas reales: user_id, workout_id, completed_at
    const { error } = await supabase.from('workout_sessions').insert({
      user_id:      session.user.id,
      workout_id:   workoutId,
      completed_at: new Date().toISOString(),
    });
    if (error) console.warn('saveWorkoutSession:', error.message);
  } catch (err) {
    console.warn('saveWorkoutSession catch:', err.message);
  }
}

// ─── Supabase: ranking ──────────────────────────────────────────

/**
 * Obtiene el ranking de una liga.
 * Incluye al usuario actual desde datos locales como fallback.
 */
export async function fetchLeagueRanking(leagueId) {
  let ranking = [];
  const league = LEAGUES.find(l => l.id === leagueId);
  if (!league) return ranking;

  try {
    // Consultar directamente la tabla users por rango de XP de la liga
    const { data, error } = await supabase
      .from('users')
      .select('id, name, xp, streak, level')
      .gte('xp', league.minXP)
      .lte('xp', league.maxXP)
      .order('xp', { ascending: false })
      .limit(50);

    if (error) throw error;

    ranking = (data || []).map((row, index) => ({
      userId:      row.id,
      displayName: abbreviateName(row.name) || 'Atleta',
      weeklyXP:    row.xp || 0,
      streak:      row.streak || 0,
      level:       row.level || 1,
      rank:        index + 1,
    }));
  } catch (err) {
    console.warn('fetchLeagueRanking:', err.message);
  }

  // Fallback: si el ranking esta vacio o el usuario actual no aparece,
  // añadir al usuario actual desde datos locales
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const state = await loadState();
    const profile = await loadProfile();
    const weeklyXP = state?.weeklyXP || 0;
    const myLeague = getLeagueForXP(weeklyXP);

    if (myLeague.id === leagueId && weeklyXP > 0) {
      const userId = session?.user?.id || 'local';
      const alreadyInRanking = ranking.some(r => r.userId === userId);

      if (!alreadyInRanking) {
        ranking.push({
          userId:      userId,
          displayName: abbreviateName(profile?.name) || session?.user?.email?.split('@')[0] || 'Yo',
          weeklyXP:    weeklyXP,
          streak:      state?.streak || 0,
          level:       state?.level || 1,
          rank:        0,
        });
        // Reordenar por XP
        ranking.sort((a, b) => b.weeklyXP - a.weeklyXP);
        ranking.forEach((r, i) => { r.rank = i + 1; });
      }
    }
  } catch (err) {
    // Silencioso - al menos devolvemos lo que tengamos de Supabase
  }

  return ranking;
}

export function subscribeToLeagueRanking(leagueId, onUpdate) {
  const channel = supabase
    .channel(`ranking-${leagueId}`)
    .on('postgres_changes', {
      event:  '*',
      schema: 'public',
      table:  'users',
    }, () => {
      fetchLeagueRanking(leagueId).then(onUpdate);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
