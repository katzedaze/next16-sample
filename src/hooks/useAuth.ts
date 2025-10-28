'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      await signIn.email({
        email,
        password,
      });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Note: name parameter should be handled separately via user profile update
      // signIn.email only accepts email and password
      await signIn.email({
        email,
        password,
      });
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  return {
    user: session?.user,
    session,
    isLoading: isPending,
    isAuthenticated: !!session,
    error,
    login,
    logout,
    signup,
  };
}
