import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
  gender?: string;
  address?: string;
  // Doctor-specific fields (at root level with new separate collections)
  specialization?: string;
  experience?: number;
  fee?: number;
  bio?: string;
  qualification?: string;
  clinicAddress?: string;
  available?: boolean;
  rating?: number;
  totalRatings?: number;
  isApproved?: string;
  schedule?: Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  // Backwards compatibility with old nested format
  doctorProfile?: {
    specialization: string;
    experience: number;
    fee: number;
    bio: string;
    qualification: string;
    clinicAddress: string;
    available: boolean;
    rating: number;
    totalRatings: number;
    isApproved: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
  };
  [key: string]: any; // Allow additional dynamic properties
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  googleLogin: () => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('mediai_token');
    const savedUser = localStorage.getItem('mediai_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('mediai_token');
        localStorage.removeItem('mediai_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await authAPI.login({ email, password });
      if (data.success) {
        const { user: userData, token: authToken } = data.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('mediai_token', authToken);
        localStorage.setItem('mediai_user', JSON.stringify(userData));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const googleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const { data } = await authAPI.googleLogin({
        idToken,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        picture: firebaseUser.photoURL || '',
        googleId: firebaseUser.uid,
      });

      if (data.success) {
        const { user: userData, token: authToken } = data.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('mediai_token', authToken);
        localStorage.setItem('mediai_user', JSON.stringify(userData));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Google login failed' };
    } catch (error: any) {
      console.error('Google login error:', error);
      // Handle Firebase popup errors
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Google sign-in was cancelled.' };
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Google login failed. Please try again.',
      };
    }
  };

  const register = async (formData: any) => {
    try {
      const { data } = await authAPI.register(formData);
      if (data.success) {
        const { user: userData, token: authToken } = data.data;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('mediai_token', authToken);
        localStorage.setItem('mediai_user', JSON.stringify(userData));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mediai_token');
    localStorage.removeItem('mediai_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('mediai_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isPatient: user?.role === 'patient',
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
