import { supabase } from './supabase';

/**
 * Features gated behind premium subscription.
 * true = premium-only, false = free for everyone.
 */
export const PREMIUM_FEATURES = {
  customWorkouts: true,
  trainerNotes: true,
  xpMultipliers: true,
  advancedStats: true,
  noAds: true,
  premiumBadge: true,
};

/**
 * Check whether the current logged-in user has premium status.
 * Returns a boolean (false if not logged in or on error).
 */
export async function checkPremiumStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', session.user.id)
      .single();

    if (error || !data) return false;
    return !!data.is_premium;
  } catch {
    return false;
  }
}

/**
 * Returns true if the given feature is accessible.
 * Free features (not in PREMIUM_FEATURES or marked false) are always accessible.
 * Premium features require isPremium === true.
 */
export function canAccessFeature(featureName, isPremium) {
  const isPremiumFeature = PREMIUM_FEATURES[featureName];
  if (!isPremiumFeature) return true; // feature is free or unknown → allow
  return !!isPremium;
}

/**
 * Admin function — set or unset the is_premium flag on a user.
 * Also upserts a row in the subscriptions table to keep them in sync.
 */
export async function toggleUserPremium(userId, isPremium) {
  // Update the users table
  const { error: userError } = await supabase
    .from('users')
    .update({ is_premium: isPremium })
    .eq('id', userId);

  if (userError) throw userError;

  // Upsert a subscription record so the subscriptions table stays consistent
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        plan: isPremium ? 'premium' : 'free',
        status: isPremium ? 'active' : 'canceled',
      },
      { onConflict: 'user_id' }
    );

  if (subError) {
    // Non-critical — log but don't throw so the user toggle still succeeds
    console.warn('Subscription upsert warning:', subError.message);
  }

  return true;
}
