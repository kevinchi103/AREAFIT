import { loadHistory, loadChallengeProgress, saveChallengeProgress } from './storage';

// Retos semanales y mensuales
export const CHALLENGES = [
  // Semanales
  {
    id: 'week_3days',
    type: 'weekly',
    title: 'Constancia semanal',
    desc: 'Completa 3 entrenamientos esta semana',
    icon: '📅',
    xp: 150,
    target: 3,
    metric: 'workoutsThisWeek',
    color: '#C8FF00',
  },
  {
    id: 'week_streak5',
    type: 'weekly',
    title: 'Racha de fuego',
    desc: 'Entrena 5 días seguidos',
    icon: '🔥',
    xp: 200,
    target: 5,
    metric: 'currentStreak',
    color: '#FF9500',
  },
  {
    id: 'week_30min',
    type: 'weekly',
    title: 'Hora en el gimnasio',
    desc: 'Acumula 3 horas de entreno esta semana',
    icon: '⏱',
    xp: 175,
    target: 180, // minutos
    metric: 'minutesThisWeek',
    color: '#00E5FF',
  },

  // Mensuales
  {
    id: 'month_20workouts',
    type: 'monthly',
    title: 'Máquina de entrenamiento',
    desc: 'Completa 20 entrenamientos este mes',
    icon: '🏆',
    xp: 500,
    target: 20,
    metric: 'workoutsThisMonth',
    color: '#FFD700',
  },
  {
    id: 'month_gym10',
    type: 'monthly',
    title: 'Habitué del gym',
    desc: 'Ve al gimnasio 10 veces este mes',
    icon: '🏋️',
    xp: 300,
    target: 10,
    metric: 'gymWorkoutsThisMonth',
    color: '#A855F7',
  },
  {
    id: 'month_500xp',
    type: 'monthly',
    title: 'Acumulador de XP',
    desc: 'Gana 500 XP este mes',
    icon: '⚡',
    xp: 250,
    target: 500,
    metric: 'xpThisMonth',
    color: '#C8FF00',
  },
  {
    id: 'month_noskip',
    type: 'monthly',
    title: 'Sin excusas',
    desc: 'Completa todos los días del plan semanal durante 2 semanas',
    icon: '💎',
    xp: 400,
    target: 6, // 3 days x 2 weeks
    metric: 'workoutsThisMonth',
    color: '#00E5FF',
  },
];

// ── Calcular progreso de cada reto ──────────────────────────────

function getMonday(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getFirstOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getChallengesWithProgress(state) {
  const history = await loadHistory();
  const now     = new Date();
  const monday  = getMonday(now);
  const month1  = getFirstOfMonth(now);

  const thisWeek  = history.filter(h => new Date(h.dateStr) >= monday);
  const thisMonth = history.filter(h => new Date(h.dateStr) >= month1);

  const metrics = {
    workoutsThisWeek:   thisWeek.length,
    minutesThisWeek:    Math.round(thisWeek.reduce((s, h) => s + (h.duration || 0), 0) / 60),
    currentStreak:      state?.streak || 0,
    workoutsThisMonth:  thisMonth.length,
    gymWorkoutsThisMonth: thisMonth.filter(h => h.environment === 'gym').length,
    xpThisMonth:        thisMonth.reduce((s, h) => s + (h.xpEarned || 0), 0),
  };

  return CHALLENGES.map(ch => {
    const current  = metrics[ch.metric] || 0;
    const progress = Math.min(current / ch.target, 1);
    const done     = progress >= 1;
    return { ...ch, current, progress, done };
  });
}
