// Entrenamientos rápidos: 15-20 min para días sin tiempo
// Sin estructura de sesión (sin calentamiento extra), directo al grano

export const QUICK_WORKOUTS_HOME = [
  {
    id: 'quick_home_1',
    name: 'HIIT Express',
    emoji: '⚡',
    duration: '15 min',
    intensity: 'ALTO',
    exercises: [
      { name: 'Jumping jack', reps: '45 seg', rest: 15, phase: 'Principal' },
      { name: 'Burpee modificado', reps: '45 seg', rest: 15, phase: 'Principal' },
      { name: 'Montañero', reps: '45 seg', rest: 15, phase: 'Principal' },
      { name: 'Sentadilla salto', reps: '45 seg', rest: 15, phase: 'Principal' },
      { name: 'Flexión', reps: '45 seg', rest: 15, phase: 'Principal' },
      { name: 'Plancha', reps: '45 seg', rest: 15, phase: 'Core' },
    ],
  },
  {
    id: 'quick_home_2',
    name: 'Core en 15',
    emoji: '🎯',
    duration: '15 min',
    intensity: 'MEDIO',
    exercises: [
      { name: 'Crunch', reps: '20', rest: 30, phase: 'Core' },
      { name: 'Plancha', reps: '40 seg', rest: 20, phase: 'Core' },
      { name: 'Plancha lateral', reps: '30 seg c/lado', rest: 20, phase: 'Core' },
      { name: 'Crunch bici', reps: '20', rest: 30, phase: 'Core' },
      { name: 'Superman', reps: '15', rest: 30, phase: 'Core' },
      { name: 'Dead bug', reps: '10 c/lado', rest: 30, phase: 'Core' },
    ],
  },
  {
    id: 'quick_home_3',
    name: 'Full Body Rápido',
    emoji: '💥',
    duration: '20 min',
    intensity: 'MEDIO',
    exercises: [
      { name: 'Sentadilla', reps: '15', rest: 30, phase: 'Principal' },
      { name: 'Flexión', reps: '10', rest: 30, phase: 'Principal' },
      { name: 'Zancada', reps: '10 c/lado', rest: 30, phase: 'Principal' },
      { name: 'Pike push-up', reps: '8', rest: 30, phase: 'Principal' },
      { name: 'Puente glúteo', reps: '20', rest: 20, phase: 'Principal' },
      { name: 'Plancha', reps: '30 seg', rest: 20, phase: 'Core' },
    ],
  },
];

export const QUICK_WORKOUTS_GYM = [
  {
    id: 'quick_gym_1',
    name: 'Push Express',
    emoji: '💪',
    duration: '20 min',
    intensity: 'ALTO',
    exercises: [
      { name: 'Press banca barra', reps: '4x8', rest: 45, phase: 'Principal' },
      { name: 'Press hombros mancuernas', reps: '3x10', rest: 40, phase: 'Principal' },
      { name: 'Extensión tríceps polea', reps: '3x12', rest: 30, phase: 'Principal' },
      { name: 'Fondos en paralelas', reps: '3x10', rest: 40, phase: 'Principal' },
    ],
  },
  {
    id: 'quick_gym_2',
    name: 'Piernas Flash',
    emoji: '🦵',
    duration: '20 min',
    intensity: 'ALTO',
    exercises: [
      { name: 'Leg press', reps: '4x12', rest: 45, phase: 'Principal' },
      { name: 'Extensión cuádriceps máquina', reps: '3x15', rest: 30, phase: 'Principal' },
      { name: 'Curl femoral máquina', reps: '3x15', rest: 30, phase: 'Principal' },
      { name: 'Elevación de talones máquina', reps: '4x20', rest: 20, phase: 'Principal' },
    ],
  },
  {
    id: 'quick_gym_3',
    name: 'Cardio + Core',
    emoji: '🔥',
    duration: '15 min',
    intensity: 'MEDIO',
    exercises: [
      { name: 'Remo máquina', reps: '5 min', rest: 0, phase: 'Calentamiento' },
      { name: 'Crunch en polea', reps: '3x15', rest: 30, phase: 'Core' },
      { name: 'Plancha', reps: '3x40 seg', rest: 20, phase: 'Core' },
      { name: 'Elevación de piernas paralelas', reps: '3x12', rest: 30, phase: 'Core' },
    ],
  },
];

export function getQuickWorkouts(environment) {
  return environment === 'gym' ? QUICK_WORKOUTS_GYM : QUICK_WORKOUTS_HOME;
}

export const QUICK_INTENSITY_COLORS = {
  ALTO:  '#FF4444',
  MEDIO: '#FF9500',
  BAJO:  '#C8FF00',
};
