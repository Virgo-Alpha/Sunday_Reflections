import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  timezone: string;
  email_reminders: boolean;
  push_notifications: boolean;
}

export const createProfile = async (userId: string, timezone: string = 'UTC') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      timezone,
      email_reminders: true,
      push_notifications: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
  return data;
};

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', userId);
        return await createProfile(userId);
      }
      console.error('Error fetching profile:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
};