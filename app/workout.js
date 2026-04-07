// ─────────────────────────────────────────────────────────────────
// INTEGRACIÓN EN app/workout.js
// Añadir esto cuando el usuario completa un entreno
// ─────────────────────────────────────────────────────────────────

// 1. IMPORTS — añadir al inicio de workout.js:
import { syncXPToSupabase, saveWorkoutSession, calcWorkoutXP } from '../constants/leagues';

// 2. FUNCIÓN — reemplazar o extender tu lógica actual de completar entreno:
async function handleWorkoutComplete(workout, currentState) {
  // Calcular XP según racha actual
  const xpEarned = calcWorkoutXP(currentState.streak);

  // Actualizar estado local (lo que ya tienes)
  const newCompletedDays = [...(currentState.completedDays || []), workout.id];
  const newStreak = currentState.streak + 1; // tu lógica de racha ya existente

  // Guardar sesión en Supabase (no-op si sin conexión)
  await saveWorkoutSession(workout.id, xpEarned, currentState.currentWeek);

  // Sincronizar XP a Supabase y obtener nuevo estado de liga
  const result = await syncXPToSupabase(xpEarned);

  // result es null si no hay conexión (el XP local ya se guardó en syncXPToSupabase)
  // result = { newTotalXP, newWeeklyXP, newLeague, newLevel } si fue exitoso

  if (result) {
    console.log(`XP ganado: +${xpEarned} | Total: ${result.newTotalXP} | Liga: ${result.newLeague.name}`);
  }

  // Continuar con tu lógica de navegación / celebración
  // router.back() o mostrar modal de celebración
}

// ─────────────────────────────────────────────────────────────────
// EJEMPLO: Si tu workout.js tiene algo así al terminar:
// ─────────────────────────────────────────────────────────────────

/*
// ANTES (solo local):
async function finishWorkout() {
  const newState = { ...state, xp: state.xp + 100, completedDays: [...state.completedDays, workoutId] };
  await saveState(newState);
  router.back();
}

// DESPUÉS (local + Supabase):
async function finishWorkout() {
  const xpEarned = calcWorkoutXP(state.streak); // 100 base + bonus racha

  // 1. Guardar estado local (mantén tu lógica actual)
  const newState = {
    ...state,
    xp:            (state.xp || 0) + xpEarned,
    weeklyXP:      (state.weeklyXP || 0) + xpEarned,
    completedDays: [...(state.completedDays || []), workoutId],
  };
  await saveState(newState);

  // 2. Sincronizar con Supabase (en paralelo, no bloquea UI)
  saveWorkoutSession(workoutId, xpEarned, state.currentWeek);  // fire & forget
  syncXPToSupabase(xpEarned);                                   // fire & forget

  // 3. Navegar
  router.back();
}
*/

// ─────────────────────────────────────────────────────────────────
// TAMBIÉN: añadir weeklyXP al DEFAULT_STATE en constants/storage.js
// ─────────────────────────────────────────────────────────────────

/*
export const DEFAULT_STATE = {
  onboarded:       false,
  currentWeek:     1,
  completedDays:   [],
  xp:              0,
  weeklyXP:        0,   // <-- AÑADIR ESTA LÍNEA
  level:           1,
  streak:          0,
  lastTrainDate:   null,
  testPassed:      false,
};
*/
