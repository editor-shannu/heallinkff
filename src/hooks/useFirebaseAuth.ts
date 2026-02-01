import { useState, useEffect } from 'react';
import { 
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      return {
        user: result.user,
        credential,
        success: true
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return {
        user: null,
        credential: null,
        success: false,
        error: errorMessage
      };
    }
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Import signInWithEmailAndPassword dynamically to avoid unused import
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        user: result.user,
        success: true
      };
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return {
        user: null,
        success: false,
        error: errorMessage
      };
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Import createUserWithEmailAndPassword dynamically
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      return {
        user: result.user,
        success: true
      };
    } catch (error: any) {
      console.error('Email sign-up error:', error);
      
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      return {
        user: null,
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to sign out'
      }));
      
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle,
    signInWithEmailPassword,
    signUpWithEmailPassword,
    logout,
    clearError,
    isAuthenticated: !!authState.user
  };
};