import { supabase } from './supabase';
import { ReflectionCrypto } from './crypto';
import { startOfWeek, addDays, isAfter, format } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export interface ReflectionAnswers {
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  question6: string;
  question7: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  week_start_date: string;
  answers: ReflectionAnswers;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  locked_at: string | null;
}

export const REFLECTION_QUESTIONS = [
  {
    id: 'question1',
    text: 'What has worked well?',
    description: 'Reflect on recent successes to identify what to continue'
  },
  {
    id: 'question2',
    text: "What didn't work so well?",
    description: 'Evaluate setbacks to understand what needs improvement'
  },
  {
    id: 'question3',
    text: 'How can I apply what I have learned (actions)?',
    description: 'Determine actionable steps for the future'
  },
  {
    id: 'question4',
    text: 'Looking back at last week, how much of my day was spent doing things I actively enjoyed?',
    description: 'Assess time alignment with fulfillment'
  },
  {
    id: 'question5',
    text: "How'd that compare to the week before?",
    description: 'Track enjoyment trends week-to-week'
  },
  {
    id: 'question6',
    text: 'What would you do if you knew you could not fail?',
    description: 'Uncover bold aspirations'
  },
  {
    id: 'question7',
    text: 'When are you going to get out of your comfort zone?',
    description: 'Encourage growth opportunities'
  }
];

export const getCurrentWeekStart = (timezone: string = 'UTC'): Date => {
  const now = new Date();
  const zonedNow = utcToZonedTime(now, timezone);
  return startOfWeek(zonedNow, { weekStartsOn: 0 }); // Sunday = 0
};

export const isReflectionLocked = (weekStartDate: Date, timezone: string = 'UTC'): boolean => {
  const now = new Date();
  const zonedNow = utcToZonedTime(now, timezone);
  
  // Calculate the Monday after the week start (which is Sunday)
  const mondayAfterWeek = addDays(weekStartDate, 1);
  
  // Set to midnight of that Monday in the user's timezone
  const lockTime = new Date(mondayAfterWeek);
  lockTime.setHours(0, 0, 0, 0);
  
  // Convert lock time to the user's timezone
  const zonedLockTime = utcToZonedTime(lockTime, timezone);
  
  return isAfter(zonedNow, zonedLockTime);
};

export const saveReflection = async (
  userId: string,
  weekStartDate: Date,
  answers: ReflectionAnswers,
  passphrase: string,
  isCompleted: boolean = false,
  reflectionId?: string
): Promise<any> => {
  try {
    const encryptedContent = await ReflectionCrypto.encrypt(answers, passphrase);
    const weekStartString = format(weekStartDate, 'yyyy-MM-dd');

    const reflectionData = {
      user_id: userId,
      week_start_date: weekStartString,
      encrypted_content: encryptedContent,
      is_completed: isCompleted,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (reflectionId) {
      // Update existing reflection
      const { data, error } = await supabase
        .from('reflections')
        .update(reflectionData)
        .eq('id', reflectionId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new reflection
      const { data, error } = await supabase
        .from('reflections')
        .upsert(reflectionData, {
          onConflict: 'user_id,week_start_date'
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return result;
  } catch (error: any) {
    console.error('Save reflection error:', error);
    throw new Error(`Failed to save reflection: ${error.message}`);
  }
};

export const getReflection = async (
  userId: string,
  weekStartDate: Date,
  passphrase: string
): Promise<{ reflection: any; answers: ReflectionAnswers } | null> => {
  try {
    const weekStartString = format(weekStartDate, 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStartString)
      .eq('is_deleted', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - reflection doesn't exist
        return null;
      }
      console.error('Supabase error:', error);
      throw new Error(`Failed to get reflection: ${error.message}`);
    }

    if (!data) return null;

    try {
      const answers = await ReflectionCrypto.decrypt(data.encrypted_content, passphrase);

      return {
        reflection: data,
        answers
      };
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      throw new Error('Failed to decrypt reflection. Please check your passphrase.');
    }
  } catch (error: any) {
    console.error('Get reflection error:', error);
    throw error;
  }
};

export const getUserReflections = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .select('id, user_id, week_start_date, is_completed, created_at, updated_at, locked_at')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('week_start_date', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to get reflections: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Get user reflections error:', error);
    throw error;
  }
};

export const deleteReflection = async (reflectionId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('reflections')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', reflectionId);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to delete reflection: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Delete reflection error:', error);
    throw error;
  }
};