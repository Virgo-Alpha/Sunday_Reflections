import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          timezone: string;
          email_reminders: boolean;
          push_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timezone?: string;
          email_reminders?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timezone?: string;
          email_reminders?: boolean;
          push_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          encrypted_content: string;
          is_completed: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
          locked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          encrypted_content: string;
          is_completed?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
          locked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          encrypted_content?: string;
          is_completed?: boolean;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
          locked_at?: string | null;
        };
      };
    };
  };
};