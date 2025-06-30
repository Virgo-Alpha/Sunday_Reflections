'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting authentication initialization...');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 AuthProvider: Calling supabase.auth.getSession()...');
        
        // Add a timeout to detect hanging requests
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getSession timeout after 10 seconds')), 10000);
        });
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        console.log('✅ AuthProvider: getSession completed', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          hasError: !!error,
          error: error
        });
        
        if (error) {
          console.error('❌ AuthProvider: getSession error:', {
            error,
            errorType: typeof error,
            errorConstructor: error.constructor.name,
            message: error.message,
            code: error.code,
            status: error.status
          });
        }
        
        setUser(session?.user ?? null);
        setLoading(false);
        
        console.log('🎯 AuthProvider: Initial session setup complete');
      } catch (error: any) {
        console.error('💥 AuthProvider: getInitialSession failed:', {
          error,
          errorType: typeof error,
          errorConstructor: error.constructor.name,
          message: error.message,
          stack: error.stack
        });
        
        // Even if there's an error, we should stop loading
        setLoading(false);
        setUser(null);
      }
    };

    getInitialSession();

    console.log('👂 AuthProvider: Setting up auth state change listener...');
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthProvider: Auth state changed', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        });
        
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    console.log('✅ AuthProvider: Auth state change listener set up');

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 AuthProvider: Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AuthProvider: Sign out error:', error);
        throw error;
      }
      console.log('✅ AuthProvider: Sign out successful');
    } catch (error) {
      console.error('💥 AuthProvider: Sign out failed:', error);
      throw error;
    }
  };

  console.log('🎨 AuthProvider: Rendering with state', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    loading
  });

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};