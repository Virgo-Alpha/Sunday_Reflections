import { createClient } from '@supabase/supabase-js';

// Fallback values for when environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ojnubnassnudszkdaskz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbnVibmFzc251ZHN6a2Rhc2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODkyMTMsImV4cCI6MjA2Njc2NTIxM30.ZMO4WSSKOAY2V914swLMJy6hEZ3I7RjyR_AdGittAGg';

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