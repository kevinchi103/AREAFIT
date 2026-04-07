import { supabase } from './supabase';

/**
 * Fetch current user's notifications, ordered by newest first, limit 50.
 */
export async function fetchMyNotifications() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('fetchMyNotifications error:', error.message);
      return [];
    }
    return data || [];
  } catch (e) {
    console.warn('fetchMyNotifications exception:', e);
    return [];
  }
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) console.warn('markAsRead error:', error.message);
  } catch (e) {
    console.warn('markAsRead exception:', e);
  }
}

/**
 * Mark all of the current user's notifications as read.
 */
export async function markAllAsRead() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) console.warn('markAllAsRead error:', error.message);
  } catch (e) {
    console.warn('markAllAsRead exception:', e);
  }
}

/**
 * Get the count of unread notifications for the current user.
 */
export async function getUnreadCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.warn('getUnreadCount error:', error.message);
      return 0;
    }
    return count || 0;
  } catch (e) {
    console.warn('getUnreadCount exception:', e);
    return 0;
  }
}

/**
 * Admin: create a notification for a specific user.
 */
export async function createNotification({ userId, type, title, body, data }) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: type || 'info',
        title,
        body,
        data: data || {},
        read: false,
      });

    if (error) console.warn('createNotification error:', error.message);
  } catch (e) {
    console.warn('createNotification exception:', e);
  }
}

/**
 * Admin: create a notification for ALL users.
 * Fetches all user IDs from auth via profiles or the notifications pattern,
 * then batch-inserts one notification per user.
 */
export async function createNotificationForAll({ type, title, body, data }) {
  try {
    // Fetch all user profiles to get user IDs
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) {
      console.warn('createNotificationForAll profiles error:', profilesError.message);
      return;
    }

    if (!profiles || profiles.length === 0) return;

    const rows = profiles.map(p => ({
      user_id: p.id,
      type: type || 'info',
      title,
      body,
      data: data || {},
      read: false,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(rows);

    if (error) console.warn('createNotificationForAll insert error:', error.message);
  } catch (e) {
    console.warn('createNotificationForAll exception:', e);
  }
}
