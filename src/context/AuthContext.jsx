import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Synchronizes user profile row in public.profiles table.
   * Checks if profile exists for authUser.id; if not, inserts a new profile row.
   */
  const syncUserProfile = async (authUser, signupFullName = null) => {
    if (!authUser) {
      setUserProfile(null);
      return null;
    }

    try {
      // 1. Check if profile already exists in public.profiles
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[Profile Fetch Error]', fetchError);
      }

      if (existingProfile) {
        setUserProfile(existingProfile);
        return existingProfile;
      }

      // 2. Profile does not exist -> Insert new profile row
      const fallbackName = authUser.email ? authUser.email.split('@')[0] : 'Pet Caretaker';
      const fullNameToSave = signupFullName || authUser.user_metadata?.full_name || fallbackName;
      const avatarUrlToSave = authUser.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

      const newProfileRow = {
        id: authUser.id,
        email: authUser.email,
        full_name: fullNameToSave,
        avatar_url: avatarUrlToSave,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfileRow])
        .select()
        .maybeSingle();

      if (insertError) {
        console.error('[Profile Insert Error]', insertError);
        // Fallback local profile if database RLS or table sync has minor delay
        setUserProfile(newProfileRow);
        return newProfileRow;
      }

      const activeProfile = insertedProfile || newProfileRow;
      setUserProfile(activeProfile);
      return activeProfile;
    } catch (err) {
      console.error('[Profile Synchronization Exception]', err);
      return null;
    }
  };

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.warn('[Supabase Auth GetSession Warning]', error);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncUserProfile(session.user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Email Signup
   */
  const signUp = async ({ email, password, fullName }) => {
    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        await syncUserProfile(data.user, fullName);
      }

      setLoading(false);
      return { user: data?.user, session: data?.session };
    } catch (err) {
      console.error('[Supabase Signup Error]', err);
      setAuthError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Email Login
   */
  const signIn = async ({ email, password }) => {
    setAuthError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      setSession(data.session);
      setUser(data.user);
      if (data?.user) {
        await syncUserProfile(data.user);
      }
      setLoading(false);
      return data;
    } catch (err) {
      console.error('[Supabase Login Error]', err);
      setAuthError(err.message || 'Login failed. Invalid email or password.');
      setLoading(false);
      throw err;
    }
  };

  /**
   * Logout
   */
  const signOut = async () => {
    setAuthError(null);
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('[Supabase Logout Error]', err);
    }
  };

  /**
   * Password Reset
   */
  const resetPassword = async (email) => {
    setAuthError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) throw error;

      setLoading(false);
      return true;
    } catch (err) {
      console.error('[Supabase Password Reset Error]', err);
      setAuthError(err.message || 'Password reset request failed.');
      setLoading(false);
      throw err;
    }
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      loading,
      authError,
      signUp,
      signIn,
      signOut,
      resetPassword,
      syncUserProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
