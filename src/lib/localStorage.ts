import type { UserProfile, FinancialGoal, Investment, InvestmentPreference } from './api';

const STORAGE_PREFIX = 'wealthscape_';

export interface LocalUserData {
  email: string;
  password: string;
  profile: UserProfile | null;
  goals: FinancialGoal[];
  investments: Investment[];
  preferences: InvestmentPreference[];
  onboardingCompleted: boolean;
  createdAt: string;
}

export const localStorageUtils = {
  // Get all users
  getAllUsers: (): LocalUserData[] => {
    const users: LocalUserData[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX + 'user_')) {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          users.push(userData);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
    return users;
  },

  // Get user by email
  getUser: (email: string): LocalUserData | null => {
    const key = STORAGE_PREFIX + 'user_' + email;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },

  // Save or update user
  saveUser: (userData: LocalUserData): void => {
    const key = STORAGE_PREFIX + 'user_' + userData.email;
    localStorage.setItem(key, JSON.stringify(userData));
  },

  // Create new user
  createUser: (email: string, password: string): LocalUserData => {
    const newUser: LocalUserData = {
      email,
      password,
      profile: null,
      goals: [],
      investments: [],
      preferences: [],
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
    localStorageUtils.saveUser(newUser);
    return newUser;
  },

  // Update user profile
  updateProfile: (email: string, profile: Partial<UserProfile>): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.profile = {
        ...user.profile,
        ...profile,
        user_id: email,
      } as UserProfile;
      localStorageUtils.saveUser(user);
    }
  },

  // Add financial goal
  addGoal: (email: string, goal: FinancialGoal): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.goals.push(goal);
      localStorageUtils.saveUser(user);
    }
  },

  // Update goals
  updateGoals: (email: string, goals: FinancialGoal[]): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.goals = goals;
      localStorageUtils.saveUser(user);
    }
  },

  // Add investment
  addInvestment: (email: string, investment: Investment): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.investments.push(investment);
      localStorageUtils.saveUser(user);
    }
  },

  // Update investments
  updateInvestments: (email: string, investments: Investment[]): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.investments = investments;
      localStorageUtils.saveUser(user);
    }
  },

  // Update preferences
  updatePreferences: (email: string, preferences: InvestmentPreference[]): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.preferences = preferences;
      localStorageUtils.saveUser(user);
    }
  },

  // Mark onboarding as completed
  completeOnboarding: (email: string): void => {
    const user = localStorageUtils.getUser(email);
    if (user) {
      user.onboardingCompleted = true;
      localStorageUtils.saveUser(user);
    }
  },

  // Check if user exists
  userExists: (email: string): boolean => {
    return localStorageUtils.getUser(email) !== null;
  },

  // Verify password
  verifyPassword: (email: string, password: string): boolean => {
    const user = localStorageUtils.getUser(email);
    return user !== null && user.password === password;
  },
};

