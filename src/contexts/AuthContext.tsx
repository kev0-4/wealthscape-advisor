import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { LoginRequest, SignupRequest } from '@/lib/api';
import { localStorageUtils } from '@/lib/localStorage';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: {
    email: string;
    token: string;
    userId?: string;
    isDemo?: boolean;
  } | null;
  loading: boolean;
  error: string | null;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { email: string; token: string; userId?: string; isDemo?: boolean } }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'SIGNUP_ERROR'; payload: string }
  | { type: 'DEMO_LOGIN' };

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
    
    case 'DEMO_LOGIN':
      return { 
        ...state, 
        loading: false, 
        error: null, 
        user: { 
          email: 'demo@wealthscape.com', 
          token: 'demo_token', 
          userId: 'demo_user_id',
          isDemo: true 
        } 
      };
    
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (credentials: SignupRequest) => Promise<void>;
  logout: () => void;
  demoLogin: () => void;
  isAuthenticated: boolean;
  needsOnboarding: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    const userId = localStorage.getItem('user_id');
    const isDemo = localStorage.getItem('is_demo') === 'true';
    
    if (token && email) {
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { email, token, userId: userId || undefined, isDemo } 
      });
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Check hardcoded user first
      if (credentials.email === 'kevin@gmail.com' && credentials.password === 'password123') {
        const access_token = 'hardcoded_token_' + Date.now();
        
        // Store in localStorage
        localStorage.setItem('auth_token', access_token);
        localStorage.setItem('user_email', credentials.email);
        localStorage.setItem('is_demo', 'false');
        
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            email: credentials.email, 
            token: access_token,
            isDemo: false
          } 
        });
        
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your account.",
          variant: "default",
        });
        return;
      }
      
      // Check localStorage users
      if (localStorageUtils.userExists(credentials.email)) {
        if (localStorageUtils.verifyPassword(credentials.email, credentials.password)) {
          const access_token = 'token_' + Date.now();
          
          // Store in localStorage
          localStorage.setItem('auth_token', access_token);
          localStorage.setItem('user_email', credentials.email);
          localStorage.setItem('is_demo', 'false');
          
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { 
              email: credentials.email, 
              token: access_token,
              isDemo: false
            } 
          });
          
          toast({
            title: "Welcome back!",
            description: "Successfully logged in to your account.",
            variant: "default",
          });
          return;
        }
      }
      
      throw new Error('Invalid email or password');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
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
      
      // Check if user already exists
      if (localStorageUtils.userExists(credentials.email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user in localStorage
      localStorageUtils.createUser(credentials.email, credentials.password);
      
      // Auto-login the new user
      const access_token = 'token_' + Date.now();
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_email', credentials.email);
      localStorage.setItem('is_demo', 'false');
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { 
          email: credentials.email, 
          token: access_token,
          isDemo: false
        } 
      });
      
      dispatch({ type: 'SIGNUP_SUCCESS' });
      
      toast({
        title: "Account Created!",
        description: "Welcome! Let's set up your profile.",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Signup failed';
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
    localStorage.removeItem('is_demo');
    dispatch({ type: 'LOGOUT' });
    
    toast({
      title: "Logged Out",
      description: "Successfully logged out of your account.",
      variant: "default",
    });
  };

  const demoLogin = () => {
    localStorage.setItem('auth_token', 'demo_token');
    localStorage.setItem('user_email', 'demo@wealthscape.com');
    localStorage.setItem('user_id', 'demo_user_id');
    localStorage.setItem('is_demo', 'true');
    dispatch({ type: 'DEMO_LOGIN' });
    
    toast({
      title: "Demo Mode Activated",
      description: "You're now viewing the platform with demo data.",
      variant: "default",
    });
  };

  const needsOnboarding = (): boolean => {
    if (!state.user || state.user.isDemo) return false;
    const userData = localStorageUtils.getUser(state.user.email);
    return userData ? !userData.onboardingCompleted : false;
  };

  const value: AuthContextType = {
    state,
    login,
    signup,
    logout,
    demoLogin,
    isAuthenticated: !!state.user,
    needsOnboarding,
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