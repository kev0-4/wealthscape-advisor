import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  user_id: string;
  email: string;
  created_at: string;
  last_login: string | null;
}

// User data interfaces
export interface UserProfile {
  profile_id: string | null;
  user_id: string;
  full_name: string | null;
  age: number | null;
  income_level: string | null;
  risk_tolerance: string | null;
  financial_priorities: Record<string, number> | null;
  spending_habits: Record<string, number> | null;
}

export interface FinancialGoal {
  goal_id: string;
  user_id: string;
  goal_type: string;
  target_amount: number;
  target_date: string;
  current_progress: number;
}

export interface InvestmentPreference {
  pref_id: string;
  user_id: string;
  asset_types: string[];
  preferred_sectors: string[];
}

export interface Investment {
  investment_id: string;
  user_id: string;
  asset_class: string;
  asset_type: string;
  market: string;
  ticker_symbol: string;
  quantity: number;
  investment_amount: number;
  purchase_date: string;
  current_value: number;
  yield_rate: number;
  maturity_date: string | null;
  performance_metrics: Record<string, number>;
  asset_specific_details: Record<string, number>;
}

export interface MarketData {
  target_ticker: string;
  company_name: string;
  industry: string;
  competitors: string[];
  suppliers: string[];
  customers: string[];
  investments_made: Array<{
    company_name: string;
    ticker: string;
    amount: number;
  }>;
  investors: string[];
  news: Record<string, Array<{
    title: string;
    published_date: string;
    content: string;
  }>>;
  relations_news: Record<string, Array<{
    title: string;
    published_date: string;
    content: string;
  }>>;
  stock_data: Record<string, {
    price: number;
    volume: number;
    sector: string;
  }>;
}

export interface PortfolioRecommendation {
  user_profile: {
    income: string;
    investment_amount: number;
    goal: string;
    time_horizon_years: number;
    risk_appetite: string;
  };
  market_summary_used: Record<string, {
    last_price: number;
    volume: number;
    sector: string;
    weight: number;
    sentiment_score: number;
    market_position: number;
    notes: string;
  }>;
  portfolio_allocation: Array<{
    asset_class: string;
    percentage: number;
    amount_in_inr: number;
    notes: string;
  }>;
  expected_return_range: [number, number];
  rationale: string;
  market_intelligence: {
    sentiment_analysis: Record<string, number>;
    competitive_positioning: Record<string, number>;
    target_company: string;
    industry_focus: string;
  };
}

// API functions
export const authAPI = {
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),
  
  signup: (data: SignupRequest) => 
    api.post<SignupResponse>('/auth/signup', data),
};

export const userAPI = {
  getProfile: (email: string, token: string) => 
    api.get<UserProfile>(`/user/profile?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getGoals: (email: string, token: string) => 
    api.get<FinancialGoal[]>(`/user/goals?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getPreferences: (email: string, token: string) => 
    api.get<InvestmentPreference[]>(`/user/preferences?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  
  getInvestments: (email: string, token: string) => 
    api.get<Investment[]>(`/user/investments?email=${email}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};

export const dataAPI = {
  getMarketData: (ticker: string) => 
    api.get<MarketData>(`/agent/process/${ticker}`),
};

export interface PortfolioRecommendationRequest {
  email: string;
  income: string;
  investment_amount: string;
  goal: string;
  time_horizon_years: string;
  risk_appetite: string;
  tickers: string[];
}

export const advisorAPI = {
  getPortfolioRecommendation: (data: PortfolioRecommendationRequest, token: string) => 
    api.post<PortfolioRecommendation>('/advisor/portfolio', data, {
      headers: { Authorization: `Bearer ${token}` }
    }),
};