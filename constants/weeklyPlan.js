// Plan semanal inteligente
// Distribución de 3 entrenamientos + descansos en 7 días

// Días de la semana (0=Lunes...6=Domingo, lunes primero)
export const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Plantilla semanal: indica qué "slot" va cada día
// slot: 'd1' | 'd2' | 'd3' | 'cardio' | 'rest'
// intensity: 'heavy' | 'medium' | 'light' | 'rest'
const WEEK_TEMPLATE = [
  { dayIndex: 0, slot: 'd1',    intensity: 'heavy',  focus: 'Tren Superior', icon: '💪', est: '50 min' }, // Lunes
  { dayIndex: 1, slot: 'd2',    intensity: 'heavy',  focus: 'Tren Inferior', icon: '🦵', est: '50 min' }, // Martes
  { dayIndex: 2, slot: 'rest',  intensity: 'light',  focus: 'Descanso',      icon: '😴', est: '20 min' }, // Miércoles
  { dayIndex: 3, slot: 'd3',    intensity: 'medium', focus: 'Core + Cardio', icon: '🔥', est: '40 min' }, // Jueves
  { dayIndex: 4, slot: 'd1',    intensity: 'medium', focus: 'Full Body',     icon: '⚡', est: '45 min' }, // Viernes
  { dayIndex: 5, slot: 'cardio',intensity: 'medium', focus: 'Cardio Activo', icon: '🏃', est: '30 min' }, // Sábado
  { dayIndex: 6, slot: 'rest',  intensity: 'rest',   focus: 'Descanso',      icon: '🧘', est: '—'      }, // Domingo
];

const INTENSITY_META = {
  heavy:  { label: 'FUERTE',   color: '#FF4444' },
  medium: { label: 'MEDIO',    color: '#FF9500' },
  light:  { label: 'LIGERO',   color: '#C8FF00' },
  rest:   { label: 'DESCANSO', color: '#555' },
};

// Convierte el day getDay() de JS (0=Dom...6=Sáb) a índice lunes-primero (0=Lun...6=Dom)
function jsToMondayFirst(jsDay) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

// Devuelve el plan de los 7 días de la semana actual con info de workout
export function getWeekPlan(state, programWeeks) {
  const weekIndex = Math.min((state?.currentWeek || 1) - 1, programWeeks.length - 1);
  const weekData  = programWeeks[weekIndex];
  const [d1, d2, d3] = weekData.workouts;

  const today = new Date();
  const todayIdx = jsToMondayFirst(today.getDay());
  const completedDays = state?.completedDays || [];
  const todayStr = today.toDateString();

  return WEEK_TEMPLATE.map(tpl => {
    let workout = null;
    if (tpl.slot === 'd1') workout = d1;
    if (tpl.slot === 'd2') workout = d2;
    if (tpl.slot === 'd3') workout = d3;
    // cardio → usar d3 como cardio rápido si existe
    if (tpl.slot === 'cardio') workout = d3;

    const dayKey  = workout ? `${workout.id}_${todayStr}` : null;
    const isToday = tpl.dayIndex === todayIdx;
    const done    = dayKey ? completedDays.includes(dayKey) : false;
    const isTraining = tpl.slot !== 'rest';

    return {
      ...tpl,
      workout,
      isToday,
      done,
      isTraining,
      intensityMeta: INTENSITY_META[tpl.intensity],
    };
  });
}

// Devuelve el plan de HOY
export function getTodayPlan(state, programWeeks) {
  const plan = getWeekPlan(state, programWeeks);
  return plan.find(p => p.isToday) || plan[0];
}

export { INTENSITY_META };
