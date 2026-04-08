// constants/workoutGenerator.js
// Generador inteligente de entrenamientos HAB
// Estructura: Calentamiento → Activación Core → Bloque Principal
// Se adapta a: nivel, duración, entorno (casa/gym), objetivo

// ─── Ejercicios por categoría ────────────────────────────────────

const WARMUP = {
  home: [
    { name: 'Rotación de hombros', reps: '20', rest: 15, muscles: ['hombros'] },
    { name: 'Círculos de cadera', reps: '15 c/lado', rest: 15, muscles: ['cadera'] },
    { name: 'Marcha en sitio', reps: '1 min', rest: 15, muscles: ['cardio'] },
    { name: 'Jumping jacks suaves', reps: '20', rest: 15, muscles: ['cuerpo'] },
    { name: 'Sentadilla al aire', reps: '10', rest: 15, muscles: ['piernas'] },
    { name: 'Rotación de tronco', reps: '10 c/lado', rest: 15, muscles: ['core'] },
  ],
  gym: [
    { name: 'Cinta de correr (ritmo suave)', reps: '3 min', rest: 0, muscles: ['cardio'] },
    { name: 'Elíptica (ritmo suave)', reps: '3 min', rest: 0, muscles: ['cardio'] },
    { name: 'Bicicleta estática', reps: '3 min', rest: 0, muscles: ['cardio'] },
    { name: 'Rotación de hombros', reps: '20', rest: 15, muscles: ['hombros'] },
    { name: 'Círculos de cadera', reps: '15 c/lado', rest: 15, muscles: ['cadera'] },
  ],
};

const CORE_ACTIVATION = {
  low: [
    { name: 'Plancha isométrica', reps: '20 seg', rest: 30, muscles: ['core'] },
    { name: 'Plancha lateral (izq)', reps: '15 seg', rest: 20, muscles: ['oblicuos'] },
    { name: 'Plancha lateral (der)', reps: '15 seg', rest: 30, muscles: ['oblicuos'] },
  ],
  mid: [
    { name: 'Plancha isométrica', reps: '30 seg', rest: 30, muscles: ['core'] },
    { name: 'Plancha lateral (izq)', reps: '20 seg', rest: 20, muscles: ['oblicuos'] },
    { name: 'Plancha lateral (der)', reps: '20 seg', rest: 30, muscles: ['oblicuos'] },
    { name: 'Dead bug', reps: '10 c/lado', rest: 30, muscles: ['core'] },
  ],
  high: [
    { name: 'Plancha isométrica', reps: '45 seg', rest: 20, muscles: ['core'] },
    { name: 'Plancha lateral (izq)', reps: '30 seg', rest: 15, muscles: ['oblicuos'] },
    { name: 'Plancha lateral (der)', reps: '30 seg', rest: 20, muscles: ['oblicuos'] },
    { name: 'Dead bug', reps: '12 c/lado', rest: 20, muscles: ['core'] },
    { name: 'Hollow hold', reps: '20 seg', rest: 30, muscles: ['core'] },
  ],
};

// ─── Ejercicios principales por grupo muscular + entorno ────────

const EXERCISES = {
  home: {
    pecho: {
      low:  [{ name: 'Flexión de rodillas', reps: '8', sets: 3, rest: 60 }, { name: 'Flexión inclinada (manos en silla)', reps: '10', sets: 3, rest: 60 }],
      mid:  [{ name: 'Flexión completa', reps: '12', sets: 4, rest: 60 }, { name: 'Flexión diamante', reps: '10', sets: 3, rest: 60 }, { name: 'Flexión ancha', reps: '12', sets: 3, rest: 60 }],
      high: [{ name: 'Flexión declinada', reps: '15', sets: 4, rest: 45 }, { name: 'Flexión archer', reps: '6 c/lado', sets: 3, rest: 60 }, { name: 'Flexión explosiva', reps: '10', sets: 4, rest: 45 }, { name: 'Fondos entre sillas', reps: '12', sets: 3, rest: 60 }],
    },
    espalda: {
      low:  [{ name: 'Superman', reps: '12', sets: 3, rest: 60 }, { name: 'Remo con mochila', reps: '10', sets: 3, rest: 60 }],
      mid:  [{ name: 'Remo invertido (mesa)', reps: '10', sets: 4, rest: 60 }, { name: 'Superman hold', reps: '20 seg', sets: 3, rest: 45 }, { name: 'Pull-up negativa (barra puerta)', reps: '5', sets: 3, rest: 90 }],
      high: [{ name: 'Pull-up', reps: '8', sets: 4, rest: 75 }, { name: 'Remo invertido', reps: '12', sets: 4, rest: 60 }, { name: 'Face pull con banda', reps: '15', sets: 3, rest: 45 }, { name: 'Pull-up agarre cerrado', reps: '6', sets: 3, rest: 75 }],
    },
    piernas: {
      low:  [{ name: 'Sentadilla al aire', reps: '12', sets: 3, rest: 60 }, { name: 'Puente de glúteo', reps: '12', sets: 3, rest: 45 }, { name: 'Zancada estática', reps: '10 c/lado', sets: 3, rest: 60 }],
      mid:  [{ name: 'Sentadilla', reps: '15', sets: 4, rest: 60 }, { name: 'Zancada caminando', reps: '12 c/lado', sets: 3, rest: 60 }, { name: 'Hip thrust', reps: '15', sets: 4, rest: 60 }, { name: 'Elevación de talones', reps: '20', sets: 3, rest: 30 }],
      high: [{ name: 'Sentadilla búlgara', reps: '10 c/lado', sets: 4, rest: 75 }, { name: 'Pistol squat asistido', reps: '6 c/lado', sets: 3, rest: 90 }, { name: 'Nordic curl asistido', reps: '6', sets: 3, rest: 90 }, { name: 'Sentadilla salto', reps: '10', sets: 4, rest: 60 }],
    },
    hombros: {
      low:  [{ name: 'Elevación lateral con botella', reps: '12', sets: 3, rest: 45 }, { name: 'Press militar con mochila', reps: '10', sets: 3, rest: 60 }],
      mid:  [{ name: 'Pike push-up', reps: '10', sets: 4, rest: 60 }, { name: 'Elevación lateral con banda', reps: '15', sets: 3, rest: 45 }, { name: 'Face pull con banda', reps: '15', sets: 3, rest: 45 }],
      high: [{ name: 'Handstand wall hold', reps: '20 seg', sets: 4, rest: 90 }, { name: 'Pike push-up elevado', reps: '10', sets: 4, rest: 60 }, { name: 'Elevación Y-T-W', reps: '8 c/posición', sets: 3, rest: 45 }],
    },
    core: {
      low:  [{ name: 'Crunch', reps: '15', sets: 3, rest: 45 }, { name: 'Mountain climber lento', reps: '10 c/lado', sets: 3, rest: 45 }],
      mid:  [{ name: 'Crunch bicicleta', reps: '20', sets: 4, rest: 45 }, { name: 'Mountain climber', reps: '20', sets: 3, rest: 45 }, { name: 'Leg raise', reps: '12', sets: 3, rest: 45 }],
      high: [{ name: 'Dragon flag asistido', reps: '5', sets: 3, rest: 90 }, { name: 'L-sit hold', reps: '15 seg', sets: 4, rest: 60 }, { name: 'Ab wheel rollout', reps: '10', sets: 3, rest: 60 }],
    },
    cardio: {
      low:  [{ name: 'Marcha rápida en sitio', reps: '2 min', sets: 2, rest: 30 }, { name: 'Step up (escalón)', reps: '10 c/lado', sets: 3, rest: 45 }],
      mid:  [{ name: 'Burpee modificado', reps: '10', sets: 3, rest: 45 }, { name: 'Jumping jack', reps: '30', sets: 3, rest: 30 }, { name: 'Salto de tijera', reps: '20', sets: 3, rest: 30 }],
      high: [{ name: 'Burpee completo', reps: '12', sets: 4, rest: 30 }, { name: 'Sprint en sitio', reps: '20 seg', sets: 6, rest: 20 }, { name: 'Box jump (silla baja)', reps: '10', sets: 4, rest: 45 }],
    },
  },
  gym: {
    pecho: {
      low:  [{ name: 'Press banca con barra (ligero)', reps: '10', sets: 3, rest: 60 }, { name: 'Aperturas con mancuernas', reps: '12', sets: 3, rest: 60 }],
      mid:  [{ name: 'Press banca con barra', reps: '10', sets: 4, rest: 90 }, { name: 'Press inclinado mancuernas', reps: '10', sets: 4, rest: 75 }, { name: 'Aperturas en polea', reps: '12', sets: 3, rest: 60 }],
      high: [{ name: 'Press banca pesado', reps: '6', sets: 5, rest: 120 }, { name: 'Press inclinado barra', reps: '8', sets: 4, rest: 90 }, { name: 'Fondos en paralelas (lastre)', reps: '8', sets: 4, rest: 90 }, { name: 'Crossover en polea', reps: '12', sets: 3, rest: 60 }],
    },
    espalda: {
      low:  [{ name: 'Jalón al pecho (polea)', reps: '12', sets: 3, rest: 60 }, { name: 'Remo en máquina', reps: '12', sets: 3, rest: 60 }],
      mid:  [{ name: 'Dominadas (asistidas o libres)', reps: '8', sets: 4, rest: 90 }, { name: 'Remo con barra', reps: '10', sets: 4, rest: 75 }, { name: 'Face pull en polea', reps: '15', sets: 3, rest: 45 }],
      high: [{ name: 'Dominadas lastradas', reps: '6', sets: 5, rest: 120 }, { name: 'Remo Pendlay', reps: '8', sets: 4, rest: 90 }, { name: 'Peso muerto rumano', reps: '8', sets: 4, rest: 90 }, { name: 'Pull-over en polea', reps: '12', sets: 3, rest: 60 }],
    },
    piernas: {
      low:  [{ name: 'Prensa de piernas', reps: '12', sets: 3, rest: 60 }, { name: 'Extensión de cuádriceps', reps: '12', sets: 3, rest: 45 }, { name: 'Curl de isquiotibiales', reps: '12', sets: 3, rest: 45 }],
      mid:  [{ name: 'Sentadilla con barra', reps: '10', sets: 4, rest: 90 }, { name: 'Prensa de piernas', reps: '12', sets: 4, rest: 75 }, { name: 'Peso muerto rumano', reps: '10', sets: 4, rest: 75 }, { name: 'Elevación de talones', reps: '15', sets: 4, rest: 45 }],
      high: [{ name: 'Sentadilla pesada', reps: '6', sets: 5, rest: 120 }, { name: 'Sentadilla frontal', reps: '8', sets: 4, rest: 90 }, { name: 'Peso muerto convencional', reps: '6', sets: 4, rest: 120 }, { name: 'Hip thrust con barra', reps: '10', sets: 4, rest: 75 }, { name: 'Prensa unilateral', reps: '10 c/lado', sets: 3, rest: 60 }],
    },
    hombros: {
      low:  [{ name: 'Press militar máquina', reps: '12', sets: 3, rest: 60 }, { name: 'Elevación lateral mancuernas', reps: '12', sets: 3, rest: 45 }],
      mid:  [{ name: 'Press militar con barra', reps: '10', sets: 4, rest: 75 }, { name: 'Elevación lateral', reps: '12', sets: 4, rest: 45 }, { name: 'Face pull', reps: '15', sets: 3, rest: 45 }],
      high: [{ name: 'Press militar pesado', reps: '6', sets: 5, rest: 120 }, { name: 'Elevación lateral en polea', reps: '12', sets: 4, rest: 45 }, { name: 'Pájaro en polea', reps: '15', sets: 3, rest: 45 }, { name: 'Press Arnold', reps: '10', sets: 3, rest: 75 }],
    },
    core: {
      low:  [{ name: 'Crunch en máquina', reps: '15', sets: 3, rest: 45 }, { name: 'Plancha isométrica', reps: '30 seg', sets: 3, rest: 30 }],
      mid:  [{ name: 'Cable crunch', reps: '15', sets: 4, rest: 45 }, { name: 'Leg raise colgado', reps: '10', sets: 3, rest: 60 }, { name: 'Pallof press', reps: '10 c/lado', sets: 3, rest: 45 }],
      high: [{ name: 'Leg raise colgado con peso', reps: '10', sets: 4, rest: 60 }, { name: 'Dragon flag', reps: '6', sets: 3, rest: 90 }, { name: 'Ab wheel', reps: '12', sets: 3, rest: 60 }],
    },
    cardio: {
      low:  [{ name: 'Cinta inclinada (caminata)', reps: '5 min', sets: 2, rest: 60 }],
      mid:  [{ name: 'Remo ergómetro', reps: '3 min', sets: 3, rest: 45 }, { name: 'Assault bike', reps: '2 min', sets: 3, rest: 45 }],
      high: [{ name: 'Sprint en cinta', reps: '20 seg', sets: 8, rest: 20 }, { name: 'Remo ergómetro HIIT', reps: '30 seg', sets: 6, rest: 30 }],
    },
  },
};

// ─── Splits semanales ───────────────────────────────────────────

const WEEKLY_SPLITS = {
  3: [
    { day: 'A', muscles: ['pecho', 'hombros'], name: 'Empuje', emoji: '💪' },
    { day: 'B', muscles: ['espalda'],           name: 'Tirón', emoji: '🏋️' },
    { day: 'C', muscles: ['piernas', 'core'],   name: 'Piernas + Core', emoji: '🦵' },
  ],
  4: [
    { day: 'A', muscles: ['pecho', 'hombros'], name: 'Empuje', emoji: '💪' },
    { day: 'B', muscles: ['espalda'],           name: 'Tirón', emoji: '🏋️' },
    { day: 'C', muscles: ['piernas'],           name: 'Piernas', emoji: '🦵' },
    { day: 'D', muscles: ['core', 'cardio'],    name: 'Core + Cardio', emoji: '🔥' },
  ],
  5: [
    { day: 'A', muscles: ['pecho'],              name: 'Pecho', emoji: '💪' },
    { day: 'B', muscles: ['espalda'],            name: 'Espalda', emoji: '🏋️' },
    { day: 'C', muscles: ['piernas'],            name: 'Piernas', emoji: '🦵' },
    { day: 'D', muscles: ['hombros', 'core'],    name: 'Hombros + Core', emoji: '💥' },
    { day: 'E', muscles: ['cardio', 'core'],     name: 'HIIT + Core', emoji: '🔥' },
  ],
};

// ─── Día de recuperación ────────────────────────────────────────

const RECOVERY_OPTIONS = [
  { name: 'Sesión de estiramientos', emoji: '🧘', exercises: [
    { name: 'Estiramiento de cuádriceps', reps: '30 seg c/lado', rest: 10 },
    { name: 'Estiramiento de isquiotibiales', reps: '30 seg c/lado', rest: 10 },
    { name: 'Estiramiento de pecho', reps: '30 seg', rest: 10 },
    { name: 'Estiramiento de hombros', reps: '30 seg c/lado', rest: 10 },
    { name: 'Cat-cow', reps: '15', rest: 10 },
    { name: 'Child pose', reps: '45 seg', rest: 10 },
    { name: 'Pigeon pose', reps: '30 seg c/lado', rest: 10 },
    { name: 'Foam rolling piernas', reps: '2 min', rest: 0 },
  ]},
  { name: 'Caminata ligera', emoji: '🚶', exercises: [
    { name: 'Caminata al aire libre', reps: '20-30 min', rest: 0 },
    { name: 'Respiración profunda', reps: '3 min', rest: 0 },
    { name: 'Movilidad de tobillos', reps: '10 c/lado', rest: 10 },
  ]},
];

// ─── Generador principal ────────────────────────────────────────

/**
 * Genera un entrenamiento completo adaptado al perfil del usuario.
 * @param {object} params
 * @param {string} params.environment - 'home' | 'gym'
 * @param {string} params.level - 'low' | 'mid' | 'high'
 * @param {number} params.duration - 30 | 60 | 90 (minutos)
 * @param {string[]} params.muscles - grupos musculares objetivo
 * @param {string} params.name - nombre del entrenamiento
 * @param {string} params.emoji - emoji
 * @returns {object} workout con estructura { name, emoji, exercises: [{name, reps, rest, section}] }
 */
export function generateWorkout({ environment = 'home', level = 'mid', duration = 60, muscles, name, emoji }) {
  const env = environment === 'gym' ? 'gym' : 'home';
  const lvl = ['low', 'mid', 'high'].includes(level) ? level : 'mid';
  const exercises = [];

  // 1. CALENTAMIENTO (5 min)
  const warmupPool = WARMUP[env];
  const warmupCount = duration <= 30 ? 2 : 3;
  const warmup = pickRandom(warmupPool, warmupCount);
  warmup.forEach(ex => exercises.push({ ...ex, section: 'warmup' }));

  // 2. ACTIVACIÓN CORE (5 min) — obligatorio en fuerza
  const coreActivation = CORE_ACTIVATION[lvl];
  coreActivation.forEach(ex => exercises.push({ ...ex, section: 'activation' }));

  // 3. BLOQUE PRINCIPAL
  const mainMinutes = duration - 10; // quitar warmup+activation
  const targetExercises = getTargetExerciseCount(lvl, mainMinutes);
  const mainExercises = [];

  for (const muscle of muscles) {
    const pool = EXERCISES[env]?.[muscle]?.[lvl] || [];
    mainExercises.push(...pool);
  }

  // Ajustar series/reps según duración
  const selected = pickRandom(mainExercises, targetExercises);
  const adjusted = adjustForDuration(selected, lvl, mainMinutes);
  adjusted.forEach(ex => exercises.push({ ...ex, section: 'main' }));

  return {
    id: `gen_${Date.now()}`,
    name: name || 'Entrenamiento',
    emoji: emoji || '💪',
    exercises,
    level: lvl,
    duration,
    environment: env,
  };
}

/**
 * Genera el plan semanal completo para un usuario.
 */
export function generateWeeklyPlan({ environment, level, duration, daysPerWeek = 4 }) {
  const split = WEEKLY_SPLITS[Math.min(Math.max(daysPerWeek, 3), 5)];
  const plan = [];

  for (let day = 0; day < 7; day++) {
    const splitDay = split[day % split.length];
    const isTrainingDay = day < daysPerWeek;

    if (isTrainingDay) {
      const workout = generateWorkout({
        environment,
        level,
        duration,
        muscles: splitDay.muscles,
        name: splitDay.name,
        emoji: splitDay.emoji,
      });
      plan.push({ day, isTraining: true, workout, isRecovery: false });
    } else if (day === daysPerWeek) {
      // Primer día libre: recuperación opcional
      const recovery = RECOVERY_OPTIONS[Math.floor(Math.random() * RECOVERY_OPTIONS.length)];
      plan.push({
        day,
        isTraining: false,
        isRecovery: true,
        workout: { id: `recovery_${day}`, name: recovery.name, emoji: recovery.emoji, exercises: recovery.exercises },
      });
    } else {
      plan.push({ day, isTraining: false, isRecovery: false });
    }
  }

  return plan;
}

// ─── Helpers ────────────────────────────────────────────────────

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getTargetExerciseCount(level, minutes) {
  if (level === 'high') return Math.min(Math.floor(minutes / 5), 10);
  if (level === 'mid') return Math.min(Math.floor(minutes / 6), 8);
  return Math.min(Math.floor(minutes / 7), 6);
}

function adjustForDuration(exercises, level, minutes) {
  const restMultiplier = level === 'high' ? 0.8 : level === 'low' ? 1.2 : 1.0;

  return exercises.map(ex => ({
    name: ex.name,
    reps: ex.reps || '10',
    rest: Math.round((ex.rest || 60) * restMultiplier),
    sets: ex.sets || 3,
    muscles: ex.muscles || [],
    section: 'main',
  }));
}

// ─── Exports para el plan de recuperación ───────────────────────

export { RECOVERY_OPTIONS };
