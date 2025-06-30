import { supabase } from './supabase';
import { ReflectionCrypto } from './crypto';
import { startOfWeek, format, addDays, isBefore } from 'date-fns';

export interface ReflectionAnswers {
  question1: string; // What has worked well?
  question2: string; // What didn't work so well?
  question3: string; // How can I apply what I have learned?
  question4: string; // How much of my day was spent doing things I actively enjoyed?
  question5: string; // How'd that compare to the week before?
  question6: string; // What would you do if you knew you could not fail?
  question7: string; // When are you going to get out of your comfort zone?
}

export const REFLECTION_QUESTIONS = [
  {
    id: 'question1',
    text: 'What has worked well?',
    description: 'Reflect on recent successes or effective actions to identify what to continue or amplify.',
  },
  {
    id: 'question2',
    text: 'What didn\'t work so well?',
    description: 'Evaluate setbacks or challenges to understand what needs improvement or avoidance.',
  },
  {
    id: 'question3',
    text: 'How can I apply what I have learned (actions)?',
    description: 'Determine actionable steps based on insights from successes and failures to adjust future behavior or strategies.',
  },
  {
    id: 'question4',
    text: 'Looking back at last week, how much of my day was spent doing things I actively enjoyed?',
    description: 'Assess how time was spent to ensure alignment with personal fulfillment and joy.',
  },
  {
    id: 'question5',
    text: 'How\'d that compare to the week before?',
    description: 'Compare enjoyment levels week-to-week to track trends and make adjustments for a more fulfilling life.',
  },
  {
    id: 'question6',
    text: 'What would you do if you knew you could not fail?',
    description: 'A thought-provoking question to uncover bold aspirations and overcome fear-based limitations.',
  },
  {
    id: 'question7',
    text: 'When are you going to get out of your comfort zone?',
    description: 'Prompt to encourage taking risks or pursuing growth opportunities outside familiar routines.',
  },
];

export const getCurrentWeekStart = (timezone: string = 'UTC'): Date => {
  const now = new Date();
  return startOfWeek(now, { weekStartsOn: 0 }); // Sunday = 0
};

export const isReflectionLocked = (weekStartDate: Date, timezone: string = 'UTC'): boolean => {
  const mondayMidnight = addDays(weekStartDate, 1); // Monday after the week
  return isBefore(mondayMidnight, new Date());
};

export const saveReflection = async (
  userId: string,
  weekStartDate: Date,
  answers: ReflectionAnswers,
  passphrase: string,
  isCompleted: boolean = false,
  reflectionId?: string
) => {
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

    // If we have a reflection ID, include it for proper upsert behavior
    if (reflectionId) {
      (reflectionData as any).id = reflectionId;
    }

    const { data, error } = await supabase
      .from('reflections')
      .upsert(reflectionData, {
        onConflict: 'user_id,week_start_date'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving reflection:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in saveReflection:', error);
    throw error;
  }
};

export const getReflection = async (
  userId: string,
  weekStartDate: Date,
  passphrase: string
): Promise<{ answers: ReflectionAnswers; reflection: any } | null> => {
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
        // No reflection found - this is expected, return null silently
        return null;
      }
      console.error('Error fetching reflection:', error);
      throw error;
    }

    if (!data) return null;

    try {
      const answers = await ReflectionCrypto.decrypt(data.encrypted_content, passphrase);
      return { answers, reflection: data };
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      throw new Error('Invalid passphrase');
    }
  } catch (error) {
    console.error('Error in getReflection:', error);
    throw error;
  }
};

export const getUserReflections = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('week_start_date', { ascending: false });

    if (error) {
      console.error('Error fetching user reflections:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error in getUserReflections:', error);
    throw error;
  }
};

export const deleteReflection = async (reflectionId: string) => {
  const { error } = await supabase
    .from('reflections')
    .update({ is_deleted: true })
    .eq('id', reflectionId);

  if (error) throw error;
};

export const restoreReflection = async (reflectionId: string) => {
  const { error } = await supabase
    .from('reflections')
    .update({ is_deleted: false })
    .eq('id', reflectionId);

  if (error) throw error;
};