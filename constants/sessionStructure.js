// ── Estructura profesional de sesión ────────────────────────────
// Calentamiento (cardio 5-8 min)
// → Activación (plancha + lateral + bird dog, máx 5 min, sin descanso)
// → Principal (trabajo de fuerza / tono / HIIT)
// → Cierre (estiramientos siempre; + cardio si es día de pérdida de peso)

export const PHASE_META = {
  'Calentamiento': { icon: '🔥', color: '#FF9500', desc: '5-8 min · Cardio suave' },
  'Activación':    { icon: '⚡', color: '#FFD700', desc: '~5 min · Core + Movilidad' },
  'Principal':     { icon: '💪', color: null,      desc: 'Trabajo principal' },
  'Cierre':        { icon: '🧘', color: '#00E5FF', desc: 'Estiramientos / Cardio final' },
};

// ── Calentamiento: SOLO cardio ────────────────────────────────────
const CARDIO_WARMUP_GYM = [
  { name: 'Cinta de correr suave', reps: '8 min', rest: 0, phase: 'Calentamiento' },
];

const CARDIO_WARMUP_HOME = [
  { name: 'Marcha en sitio', reps: '3 min', rest: 0, phase: 'Calentamiento' },
  { name: 'Saltos de tijera suaves', reps: '2 min', rest: 0, phase: 'Calentamiento' },
];

// Para días de cardio/HIIT: calentamiento más corto y ligero
const CARDIO_WARMUP_GYM_SHORT = [
  { name: 'Cinta de correr suave', reps: '5 min', rest: 0, phase: 'Calentamiento' },
];
const CARDIO_WARMUP_HOME_SHORT = [
  { name: 'Marcha en sitio', reps: '3 min', rest: 0, phase: 'Calentamiento' },
  { name: 'Trote suave en sitio', reps: '2 min', rest: 0, phase: 'Calentamiento' },
];

// ── Activación: plancha + lateral + bird dog ──────────────────────
// Sin descanso entre ejercicios, máx 5 min en total
const ACTIVATION = [
  { name: 'Plancha isométrica', reps: '30 seg', rest: 0, phase: 'Activación' },
  { name: 'Plancha lateral izquierda', reps: '20 seg', rest: 0, phase: 'Activación' },
  { name: 'Plancha lateral derecha', reps: '20 seg', rest: 0, phase: 'Activación' },
  { name: 'Bird dog', reps: '8 c/lado', rest: 0, phase: 'Activación' },
];

// ── Cierre: estiramientos base (siempre) ─────────────────────────
const STRETCH_BASE = [
  { name: 'Estiramiento cuádriceps', reps: '30 seg c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento isquiotibiales', reps: '40 seg c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento pectoral', reps: '30 seg', rest: 0, phase: 'Cierre' },
];

// Cierre fuerza/tono: solo estiramientos
const COOLDOWN_STRENGTH = STRETCH_BASE;

// Cierre pérdida de peso / HIIT: cardio final + estiramientos
const COOLDOWN_FAT_GYM = [
  { name: 'Elíptica ritmo moderado', reps: '12 min', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento isquiotibiales', reps: '40 seg c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento cuádriceps', reps: '30 seg c/lado', rest: 0, phase: 'Cierre' },
];
const COOLDOWN_FAT_HOME = [
  { name: 'Trote en sitio', reps: '10 min', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento isquiotibiales', reps: '40 seg c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento cuádriceps', reps: '30 seg c/lado', rest: 0, phase: 'Cierre' },
];

// Cierre core: cat-cow + lumbar
const COOLDOWN_CORE = [
  { name: 'Cat-cow', reps: '10 reps', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento lumbar', reps: '40 seg', rest: 0, phase: 'Cierre' },
  { name: 'Pigeon pose', reps: '40 seg c/lado', rest: 0, phase: 'Cierre' },
];

// Cierre recuperación: estiramientos pasivos amplios
const COOLDOWN_RECOVERY = [
  { name: 'Estiramiento isquiotibiales', reps: '1 min c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento de cadera', reps: '1 min c/lado', rest: 0, phase: 'Cierre' },
  { name: 'Estiramiento pectoral y hombros', reps: '1 min', rest: 0, phase: 'Cierre' },
  { name: 'Respiración profunda', reps: '2 min', rest: 0, phase: 'Cierre' },
];

// ── Detección del tipo de entrenamiento ──────────────────────────
function detectWorkoutType(workout) {
  const name = (workout?.name || '').toLowerCase();

  if (
    name.includes('hiit') || name.includes('tabata') || name.includes('emom') ||
    name.includes('amrap') || name.includes('interval') || name.includes('circuito cardio')
  ) return 'hiit';

  if (
    name.includes('cardio') || name.includes('trote') || name.includes('carrera') ||
    name.includes('test cardio')
  ) return 'cardio';

  if (
    name.includes('recuper') || name.includes('movilidad') || name.includes('descanso activo') ||
    name.includes('flexib') || name.includes('yoga') || name.includes('foam')
  ) return 'recovery';

  if (
    name.includes('core') || name.includes('abdomen') || name.includes('core atlético')
  ) return 'core';

  if (
    name.includes('tono') || name.includes('tonif') || name.includes('quema') ||
    name.includes('fat') || name.includes('pérdida') || name.includes('full body')
  ) return 'toning';

  return 'strength';
}

// ── Función principal ─────────────────────────────────────────────
/**
 * Estructura:
 *   Calentamiento (cardio) → Activación (plancha + lateral) → Principal → Cierre
 *
 * Cierre lleva cardio extra SOLO en días de pérdida de peso / HIIT.
 * Días de recuperación: no se añade activación, solo estiramientos amplios.
 */
export function buildStructuredSession(workout, environment = 'home') {
  const isGym = environment === 'gym';
  const type  = detectWorkoutType(workout);

  // Calentamiento
  let warmup;
  if (type === 'hiit' || type === 'cardio') {
    warmup = isGym ? CARDIO_WARMUP_GYM_SHORT : CARDIO_WARMUP_HOME_SHORT;
  } else {
    warmup = isGym ? CARDIO_WARMUP_GYM : CARDIO_WARMUP_HOME;
  }

  // Activación (no en recuperación ni cardio puro)
  const activation = (type === 'recovery' || type === 'cardio') ? [] : ACTIVATION;

  // Principal
  const mainExercises = workout.exercises.map(ex => ({
    ...ex,
    phase: ex.phase || 'Principal',
  }));

  // Cierre
  let cooldown;
  if (type === 'recovery') {
    cooldown = COOLDOWN_RECOVERY;
  } else if (type === 'core') {
    cooldown = COOLDOWN_CORE;
  } else if (type === 'hiit' || type === 'toning') {
    cooldown = isGym ? COOLDOWN_FAT_GYM : COOLDOWN_FAT_HOME;
  } else {
    // strength, cardio, default
    cooldown = COOLDOWN_STRENGTH;
  }

  return {
    ...workout,
    exercises: [...warmup, ...activation, ...mainExercises, ...cooldown],
    isStructured: true,
  };
}

// ── Recomendación de peso (sin cambios) ──────────────────────────

export function getWeightHint(exerciseName, repsStr, strengthData) {
  if (!strengthData) return null;
  const { benchPress, squat } = strengthData;

  const name = (exerciseName || '').toLowerCase();
  const reps = (repsStr || '').toLowerCase();

  const isPush     = name.includes('press banca') || name.includes('press inclinado') || name.includes('press pecho');
  const isSquat    = name.includes('sentadilla') || name.includes('leg press') || name.includes('prensa');
  const isDeadlift = name.includes('peso muerto');
  const isRow      = name.includes('remo') && (name.includes('barra') || name.includes('mancuerna'));
  const isShoulder = name.includes('press hombros') || name.includes('press militar');

  let baseRM = null;
  if (isPush && benchPress)     baseRM = parseFloat(benchPress);
  if (isSquat && squat)         baseRM = parseFloat(squat);
  if (isDeadlift && squat)      baseRM = parseFloat(squat) * 1.2;
  if (isRow && benchPress)      baseRM = parseFloat(benchPress) * 0.75;
  if (isShoulder && benchPress) baseRM = parseFloat(benchPress) * 0.6;

  if (!baseRM || isNaN(baseRM)) return null;

  let pct = 0.70;
  if (reps.includes('1') && (reps.includes('rm') || reps.includes('máx'))) pct = 0.95;
  else if (/[34]x[34]|5x[345]|6x[34]/.test(reps)) pct = 0.85;
  else if (/[34]x[56]|5x[56]/.test(reps))          pct = 0.80;
  else if (/[34]x[78]|4x8|5x[67]/.test(reps))      pct = 0.75;
  else if (/[34]x(10|9)|4x10/.test(reps))           pct = 0.70;
  else if (/[34]x1[25]|3x15/.test(reps))            pct = 0.60;
  else if (/[34]x(20|18)|4x20/.test(reps))          pct = 0.50;
  else if (reps.includes('amrap'))                   pct = 0.65;

  const suggested = Math.round((baseRM * pct) / 2.5) * 2.5;
  return suggested > 0 ? `~${suggested} kg` : null;
}
