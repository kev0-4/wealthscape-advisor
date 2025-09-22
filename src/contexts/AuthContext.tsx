import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, type LoginRequest, type SignupRequest } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: {
    email: string;
    token: string;
    userId?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { email: string; token: string; userId?: string } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'SIGNUP_ERROR'; payload: string };

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
    case 'SIGNUP_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        error: null, 
        user: action.payload 
      };
    
    case 'LOGIN_ERROR':
    case 'SIGNUP_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload, 
        user: null 
      };
    
    case 'SIGNUP_SUCCESS':
      return { ...state, loading: false, error: null };
    
    case 'LOGOUT':
      return { ...state, user: null, error: null };
    
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (credentials: SignupRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');
    
    if (token && email) {
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { email, token, userId: userId || undefined } 
      });
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.login(credentials);
      const { access_token } = response.data;
      
      // Store in localStorage
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_email', credentials.email);
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          email: credentials.email, 
          token: access_token 
        } 
      });
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to your account.",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const signup = async (credentials: SignupRequest) => {
    try {
      dispatch({ type: 'SIGNUP_START' });
      
      const response = await authAPI.signup(credentials);
      
      dispatch({ type: 'SIGNUP_SUCCESS' });
      
      toast({
        title: "Account Created!",
        description: "Please log in with your new credentials.",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      dispatch({ type: 'SIGNUP_ERROR', payload: errorMessage });
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    dispatch({ type: 'LOGOUT' });
    
    toast({
      title: "Logged Out",
      description: "Successfully logged out of your account.",
      variant: "default",
    });
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    isAuthenticated: !!state.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}