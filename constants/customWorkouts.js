// constants/customWorkouts.js
// API para entrenamientos personalizados del entrenador

import { supabase } from './supabase';

// ─── ADMIN: Crear entrenamiento ─────────────────────────────────

export async function createCustomWorkout({ name, description, exercises, xpMultiplier, difficulty, isTemplate }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'No session' };

  const { data, error } = await supabase.from('custom_workouts').insert({
    created_by: session.user.id,
    name,
    description: description || '',
    exercises: exercises || [],
    xp_multiplier: xpMultiplier || 1.0,
    difficulty: difficulty || 'medium',
    is_template: isTemplate || false,
  }).select().single();

  return { data, error: error?.message };
}

// ─── ADMIN: Listar entrenamientos ───────────────────────────────

export async function fetchAllCustomWorkouts() {
  const { data, error } = await supabase
    .from('custom_workouts')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data || [], error: error?.message };
}

// ─── ADMIN: Actualizar entrenamiento ────────────────────────────

export async function updateCustomWorkout(id, updates) {
  const { data, error } = await supabase
    .from('custom_workouts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error: error?.message };
}

// ─── ADMIN: Eliminar entrenamiento ──────────────────────────────

export async function deleteCustomWorkout(id) {
  const { error } = await supabase
    .from('custom_workouts')
    .delete()
    .eq('id', id);

  return { error: error?.message };
}

// ─── ADMIN: Asignar entrenamiento a usuario ─────────────────────

export async function assignWorkout({ userId, workoutId, dayOfWeek, weekNumber, startDate, endDate, notes }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'No session' };

  const { data, error } = await supabase.from('workout_assignments').insert({
    user_id: userId,
    workout_id: workoutId,
    assigned_by: session.user.id,
    day_of_week: dayOfWeek ?? null,
    week_number: weekNumber ?? null,
    start_date: startDate || null,
    end_date: endDate || null,
    is_active: true,
    notes: notes || '',
  }).select().single();

  return { data, error: error?.message };
}

// ─── ADMIN: Ver asignaciones ────────────────────────────────────

export async function fetchAllAssignments() {
  const { data, error } = await supabase
    .from('workout_assignments')
    .select(`
      *,
      custom_workouts ( id, name, xp_multiplier, difficulty ),
      users!workout_assignments_user_id_fkey ( id, name, email )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return { data: data || [], error: error?.message };
}

// ─── ADMIN: Desactivar asignación ───────────────────────────────

export async function deactivateAssignment(id) {
  const { error } = await supabase
    .from('workout_assignments')
    .update({ is_active: false })
    .eq('id', id);

  return { error: error?.message };
}

// ─── ADMIN: Ver feedback ────────────────────────────────────────

export async function fetchAllFeedback() {
  const { data, error } = await supabase
    .from('workout_feedback')
    .select(`
      *,
      custom_workouts ( name ),
      users!workout_feedback_user_id_fkey ( name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return { data: data || [], error: error?.message };
}

// ─── ADMIN: Listar usuarios ────────────────────────────────────

export async function fetchAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, xp, level, streak, is_premium')
    .order('name', { ascending: true });

  return { data: data || [], error: error?.message };
}

// ─── USER: Obtener mis entrenamientos asignados para hoy ────────

export async function fetchMyAssignmentsToday() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  // 0=lunes ... 6=domingo
  const todayStr = today.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('workout_assignments')
    .select(`
      *,
      custom_workouts ( * )
    `)
    .eq('user_id', session.user.id)
    .eq('is_active', true);

  if (error) {
    console.warn('fetchMyAssignmentsToday:', error.message);
    return [];
  }

  // Filtrar: día de semana coincide O es cualquier día, y fecha en rango
  return (data || []).filter(a => {
    const dayMatch = a.day_of_week === null || a.day_of_week === dayOfWeek;
    const startOk = !a.start_date || a.start_date <= todayStr;
    const endOk = !a.end_date || a.end_date >= todayStr;
    return dayMatch && startOk && endOk && a.custom_workouts;
  });
}

// ─── USER: Enviar feedback ──────────────────────────────────────

export async function submitWorkoutFeedback({ workoutId, difficultyRating, energyLevel, notes }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'No session' };

  const { data, error } = await supabase.from('workout_feedback').insert({
    user_id: session.user.id,
    workout_id: workoutId,
    difficulty_rating: difficultyRating,
    energy_level: energyLevel,
    notes: notes || '',
  });

  return { error: error?.message };
}

// ─── Días de la semana ──────────────────────────────────────────

export const DAY_NAMES = {
  es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  ca: ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: { es: 'Fácil', ca: 'Fàcil', en: 'Easy' }, color: '#00CC66' },
  { value: 'medium', label: { es: 'Media', ca: 'Mitjana', en: 'Medium' }, color: '#FF9500' },
  { value: 'hard', label: { es: 'Difícil', ca: 'Difícil', en: 'Hard' }, color: '#FF4444' },
  { value: 'elite', label: { es: 'Élite', ca: 'Èlit', en: 'Elite' }, color: '#A855F7' },
];
