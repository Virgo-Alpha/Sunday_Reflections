import { createClient } from '@supabase/supabase-js';

// Fallback values for when environment variables are not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ojnubnassnudszkdaskz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qbnVibmFzc251ZHN6a2Rhc2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODkyMTMsImV4cCI6MjA2Njc2NTIxM30.ZMO4WSSKOAY2V914swLMJy6hEZ3I7RjyR_AdGittAGg';

// Debug logging for environment variables
console.log('🔧 Supabase Client Initialization Debug:');
console.log('Environment:', typeof window !== 'undefined' ? 'Browser' : 'Server');
console.log('NEXT_PUBLIC_SUPABASE_URL from env:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY from env:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('Resolved supabaseUrl:', supabaseUrl);
console.log('Resolved supabaseAnonKey length:', supabaseAnonKey.length);
console.log('Resolved supabaseAnonKey starts with:', supabaseAnonKey.substring(0, 20) + '...');

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  console.log('✅ Supabase URL is valid:', url.origin);
} catch (error) {
  console.error('❌ Invalid Supabase URL:', supabaseUrl, error);
}

// Validate anon key format (should be a JWT)
if (supabaseAnonKey.split('.').length === 3) {
  console.log('✅ Anon key appears to be a valid JWT format');
} else {
  console.error('❌ Anon key does not appear to be a valid JWT format');
}

console.log('🚀 Creating Supabase client...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client created successfully');

// Test the client immediately after creation
if (typeof window !== 'undefined') {
  console.log('🧪 Testing Supabase client connection...');
  
  // Test basic connectivity
  supabase.auth.getSession()
    .then((result) => {
      console.log('✅ Supabase getSession test successful:', {
        hasData: !!result.data,
        hasSession: !!result.data.session,
        hasError: !!result.error,
        error: result.error
      });
    })
    .catch((error) => {
      console.error('❌ Supabase getSession test failed:', {
        error,
        errorType: typeof error,
        errorConstructor: error.constructor.name,
        message: error.message,
        stack: error.stack
      });
    });
}

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