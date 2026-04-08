import { supabase } from './supabase';

// ─── Tiers de suscripción por ligas ─────────────────────────────

export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: { es: 'Gratis', ca: 'Gratuït', en: 'Free' },
    price: 0,
    priceYear: 0,
    color: '#888888',
    icon: '🆓',
    features: {
      es: ['Entrenamientos básicos', 'Sistema de XP y rachas', 'Ligas Bronce'],
      ca: ['Entrenaments bàsics', 'Sistema de XP i ratxes', 'Lligues Bronze'],
      en: ['Basic workouts', 'XP and streaks system', 'Bronze leagues'],
    },
  },
  {
    id: 'basic',
    name: { es: 'Básico', ca: 'Bàsic', en: 'Basic' },
    price: 4.99,
    priceYear: 49.99,
    color: '#C0C0C0',
    icon: '🥈',
    features: {
      es: ['Todo lo gratis', 'Ligas Plata', 'Estadísticas avanzadas', 'Sin anuncios'],
      ca: ['Tot el gratuït', 'Lligues Plata', 'Estadístiques avançades', 'Sense anuncis'],
      en: ['Everything free', 'Silver leagues', 'Advanced stats', 'No ads'],
    },
  },
  {
    id: 'pro',
    name: { es: 'Pro', ca: 'Pro', en: 'Pro' },
    price: 9.99,
    priceYear: 99.99,
    color: '#FFD700',
    icon: '🥇',
    features: {
      es: ['Todo lo básico', 'Ligas Oro', 'IA completa', 'Personalización avanzada', 'Multiplicadores XP'],
      ca: ['Tot el bàsic', 'Lligues Or', 'IA completa', 'Personalització avançada', 'Multiplicadors XP'],
      en: ['Everything basic', 'Gold leagues', 'Full AI', 'Advanced customization', 'XP multipliers'],
    },
  },
  {
    id: 'elite',
    name: { es: 'Élite', ca: 'Èlit', en: 'Elite' },
    price: 14.99,
    priceYear: 149.99,
    color: '#A855F7',
    icon: '👑',
    features: {
      es: ['Todo lo Pro', 'Ligas Diamante', 'Entrenador personal', 'Entrenos personalizados', 'Prioridad soporte'],
      ca: ['Tot el Pro', 'Lligues Diamant', 'Entrenador personal', 'Entrenos personalitzats', 'Prioritat suport'],
      en: ['Everything Pro', 'Diamond leagues', 'Personal trainer', 'Custom workouts', 'Priority support'],
    },
  },
];

// ─── Features por tier ──────────────────────────────────────────

const TIER_ACCESS = {
  free:  { customWorkouts: false, trainerNotes: false, xpMultipliers: false, advancedStats: false, noAds: false, premiumBadge: false, aiComplete: false, personalTrainer: false },
  basic: { customWorkouts: false, trainerNotes: false, xpMultipliers: false, advancedStats: true,  noAds: true,  premiumBadge: true,  aiComplete: false, personalTrainer: false },
  pro:   { customWorkouts: true,  trainerNotes: false, xpMultipliers: true,  advancedStats: true,  noAds: true,  premiumBadge: true,  aiComplete: true,  personalTrainer: false },
  elite: { customWorkouts: true,  trainerNotes: true,  xpMultipliers: true,  advancedStats: true,  noAds: true,  premiumBadge: true,  aiComplete: true,  personalTrainer: true  },
};

export function canAccessFeature(featureName, userTier = 'free') {
  const tier = TIER_ACCESS[userTier] || TIER_ACCESS.free;
  return !!tier[featureName];
}

export function getTierForUser(isPremium, plan) {
  if (!isPremium) return 'free';
  if (plan === 'elite' || plan === 'premium') return 'elite';
  if (plan === 'pro') return 'pro';
  if (plan === 'basic') return 'basic';
  return 'free';
}

// ─── Supabase ───────────────────────────────────────────────────

export async function checkPremiumStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { isPremium: false, tier: 'free' };

    const { data, error } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', session.user.id)
      .single();

    if (error || !data) return { isPremium: false, tier: 'free' };

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    const tier = getTierForUser(data.is_premium, sub?.plan);
    return { isPremium: !!data.is_premium, tier };
  } catch {
    return { isPremium: false, tier: 'free' };
  }
}

export async function toggleUserPremium(userId, isPremium, plan = 'elite') {
  const { error: userError } = await supabase
    .from('users')
    .update({ is_premium: isPremium })
    .eq('id', userId);

  if (userError) throw userError;

  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: isPremium ? plan : 'free',
      status: isPremium ? 'active' : 'canceled',
    }, { onConflict: 'user_id' });

  if (subError) console.warn('Subscription upsert:', subError.message);
  return true;
}
