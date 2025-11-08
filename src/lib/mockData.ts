import type { UserProfile, FinancialGoal, Investment, InvestmentPreference, PortfolioRecommendation, MarketData } from './api';

// Mock user profile with fabricated data
export const mockUserProfile: UserProfile = {
  profile_id: 'demo_profile_001',
  user_id: 'demo_user_id',
  full_name: 'Alex Johnson',
  age: 35,
  income_level: 'High',
  risk_tolerance: 'medium',
  financial_priorities: {
    retirement_saving: 0.35,
    education_fund: 0.25,
    emergency_fund: 0.20,
    wealth_building: 0.15,
    lifestyle_expenses: 0.05,
  },
  spending_habits: {
    essentials: 0.50,
    investments: 0.25,
    entertainment: 0.10,
    dining: 0.10,
    miscellaneous: 0.05,
  },
};

// Mock financial goals
export const mockGoals: FinancialGoal[] = [
  {
    goal_id: 'goal_retirement_001',
    user_id: 'demo_user_id',
    goal_type: 'Retirement Fund',
    target_amount: 10000000,
    target_date: '2045-01-01',
    current_progress: 3250000,
  },
  {
    goal_id: 'goal_education_001',
    user_id: 'demo_user_id',
    goal_type: 'Education Fund',
    target_amount: 2000000,
    target_date: '2030-01-01',
    current_progress: 850000,
  },
  {
    goal_id: 'goal_emergency_001',
    user_id: 'demo_user_id',
    goal_type: 'Emergency Fund',
    target_amount: 500000,
    target_date: '2025-01-01',
    current_progress: 375000,
  },
  {
    goal_id: 'goal_home_001',
    user_id: 'demo_user_id',
    goal_type: 'Home Purchase',
    target_amount: 5000000,
    target_date: '2028-01-01',
    current_progress: 1500000,
  },
];

// Mock investment preferences
export const mockPreferences: InvestmentPreference[] = [
  {
    pref_id: 'pref_001',
    user_id: 'demo_user_id',
    asset_types: ['Stocks', 'ETFs', 'Mutual Funds', 'Bonds'],
    preferred_sectors: ['Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Energy'],
  },
];

// Mock investments with fabricated data
export const mockInvestments: Investment[] = [
  {
    investment_id: 'inv_001',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'NASDAQ',
    ticker_symbol: 'AAPL',
    quantity: 150,
    investment_amount: 225000,
    purchase_date: '2023-01-15',
    current_value: 285000,
    yield_rate: 26.67,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.2667,
      three_year_return: 0.7821,
      volatility: 0.28,
      sharpe_ratio: 1.45,
    },
    asset_specific_details: {
      price_per_share: 1900,
      book_value: 1620,
      market_cap: 3000000000,
    },
  },
  {
    investment_id: 'inv_002',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'NASDAQ',
    ticker_symbol: 'MSFT',
    quantity: 100,
    investment_amount: 350000,
    purchase_date: '2022-06-10',
    current_value: 420000,
    yield_rate: 20.00,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.20,
      three_year_return: 0.65,
      volatility: 0.25,
      sharpe_ratio: 1.52,
    },
    asset_specific_details: {
      price_per_share: 4200,
      book_value: 3580,
      market_cap: 3100000000,
    },
  },
  {
    investment_id: 'inv_003',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'NASDAQ',
    ticker_symbol: 'GOOGL',
    quantity: 80,
    investment_amount: 800000,
    purchase_date: '2021-11-20',
    current_value: 960000,
    yield_rate: 20.00,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.20,
      three_year_return: 0.58,
      volatility: 0.30,
      sharpe_ratio: 1.32,
    },
    asset_specific_details: {
      price_per_share: 12000,
      book_value: 9800,
      market_cap: 1500000000,
    },
  },
  {
    investment_id: 'inv_004',
    user_id: 'demo_user_id',
    asset_class: 'ETF',
    asset_type: 'Index Fund',
    market: 'NSE',
    ticker_symbol: 'NIFTYBEES',
    quantity: 500,
    investment_amount: 750000,
    purchase_date: '2023-03-05',
    current_value: 825000,
    yield_rate: 10.00,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.10,
      three_year_return: 0.42,
      volatility: 0.18,
      sharpe_ratio: 1.68,
    },
    asset_specific_details: {
      net_asset_value: 1650,
      expense_ratio: 0.05,
      total_assets: 800000000,
    },
  },
  {
    investment_id: 'inv_005',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'NYSE',
    ticker_symbol: 'TSLA',
    quantity: 200,
    investment_amount: 400000,
    purchase_date: '2023-09-12',
    current_value: 450000,
    yield_rate: 12.50,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.125,
      volatility: 0.45,
      sharpe_ratio: 0.85,
    },
    asset_specific_details: {
      price_per_share: 2250,
      book_value: 1950,
      market_cap: 750000000,
    },
  },
  {
    investment_id: 'inv_006',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'NASDAQ',
    ticker_symbol: 'NVDA',
    quantity: 150,
    investment_amount: 450000,
    purchase_date: '2023-02-28',
    current_value: 630000,
    yield_rate: 40.00,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.40,
      three_year_return: 1.25,
      volatility: 0.42,
      sharpe_ratio: 1.95,
    },
    asset_specific_details: {
      price_per_share: 4200,
      book_value: 3200,
      market_cap: 1050000000,
    },
  },
  {
    investment_id: 'inv_007',
    user_id: 'demo_user_id',
    asset_class: 'Debt',
    asset_type: 'Corporate Bonds',
    market: 'BSE',
    ticker_symbol: 'CORP2025',
    quantity: 1000,
    investment_amount: 500000,
    purchase_date: '2022-12-10',
    current_value: 520000,
    yield_rate: 4.00,
    maturity_date: '2025-12-31',
    performance_metrics: {
      yield_to_maturity: 0.04,
      credit_rating: 4.5,
      duration: 2.5,
    },
    asset_specific_details: {
      coupon_rate: 0.04,
      face_value: 500,
      credit_rating: 'AA',
    },
  },
  {
    investment_id: 'inv_008',
    user_id: 'demo_user_id',
    asset_class: 'Equity',
    asset_type: 'Stocks',
    market: 'BSE',
    ticker_symbol: 'RELIANCE',
    quantity: 50,
    investment_amount: 125000,
    purchase_date: '2023-05-22',
    current_value: 142000,
    yield_rate: 13.60,
    maturity_date: null,
    performance_metrics: {
      one_year_return: 0.136,
      three_year_return: 0.48,
      volatility: 0.22,
      sharpe_ratio: 1.58,
    },
    asset_specific_details: {
      price_per_share: 2840,
      book_value: 2580,
      market_cap: 1900000000,
    },
  },
];

// Mock Portfolio Recommendation
export const mockPortfolioRecommendation: PortfolioRecommendation = {
  user_profile: {
    income: 'High (₹15,00,000+)',
    investment_amount: 500000,
    goal: 'Wealth Building',
    time_horizon_years: 10,
    risk_appetite: 'medium',
  },
  market_summary_used: {
    AAPL: {
      last_price: 1900,
      volume: 45000000,
      sector: 'Technology',
      weight: 35.0,
      sentiment_score: 0.75,
      market_position: 0.85,
      notes: 'Strong market position with innovative product pipeline',
    },
    MSFT: {
      last_price: 4200,
      volume: 28000000,
      sector: 'Technology',
      weight: 30.0,
      sentiment_score: 0.70,
      market_position: 0.90,
      notes: 'Leading cloud services provider with steady growth',
    },
    GOOGL: {
      last_price: 14000,
      volume: 22000000,
      sector: 'Technology',
      weight: 25.0,
      sentiment_score: 0.68,
      market_position: 0.88,
      notes: 'Dominant search engine with expanding AI capabilities',
    },
    NVDA: {
      last_price: 4800,
      volume: 35000000,
      sector: 'Technology',
      weight: 10.0,
      sentiment_score: 0.82,
      market_position: 0.92,
      notes: 'AI chip leader with exceptional growth trajectory',
    },
  },
  portfolio_allocation: [
    {
      asset_class: 'Large-Cap Tech Stocks',
      percentage: 60.0,
      amount_in_inr: 300000,
      notes: 'Diversified across AAPL, MSFT, GOOGL for stable growth',
    },
    {
      asset_class: 'Growth Tech Stocks',
      percentage: 15.0,
      amount_in_inr: 75000,
      notes: 'NVDA for high-growth potential in AI sector',
    },
    {
      asset_class: 'Technology ETFs',
      percentage: 15.0,
      amount_in_inr: 75000,
      notes: 'Diversify risk while maintaining tech exposure',
    },
    {
      asset_class: 'Corporate Bonds',
      percentage: 10.0,
      amount_in_inr: 50000,
      notes: 'Conservative component for portfolio stability',
    },
  ],
  expected_return_range: [8.5, 12.5],
  rationale: 'This portfolio allocation balances growth potential with stability, targeting technology companies that are well-positioned for the AI and cloud computing era. With a 10-year horizon and medium risk appetite, 60% allocation to established tech giants (AAPL, MSFT, GOOGL) provides steady returns, while 15% in NVDA offers exposure to cutting-edge AI infrastructure. The remaining 25% split between tech ETFs and bonds provides diversification and downside protection. Expected annual returns range from 8.5% to 12.5% based on historical performance and forward-looking market sentiment analysis.',
  market_intelligence: {
    sentiment_analysis: {
      AAPL: 0.75,
      MSFT: 0.70,
      GOOGL: 0.68,
      NVDA: 0.82,
    },
    competitive_positioning: {
      AAPL: 0.85,
      MSFT: 0.90,
      GOOGL: 0.88,
      NVDA: 0.92,
    },
    target_company: 'Apple Inc.',
    industry_focus: 'Technology & Artificial Intelligence',
  },
};

// Mock Market Data for AAPL
export const mockAAPLMarketData: MarketData = {
  target_ticker: 'AAPL',
  company_name: 'Apple Inc.',
  industry: 'Consumer Electronics & Software Services',
  competitors: [
    'Samsung Electronics',
    'Google (Alphabet)',
    'Microsoft Corporation',
    'Amazon.com Inc.',
    'Meta Platforms Inc.',
  ],
  suppliers: [
    'Taiwan Semiconductor Manufacturing (TSM)',
    'Foxconn Technology Group',
    'Quanta Computer Inc.',
    'Pegatron Corporation',
    'Catcher Technology',
  ],
  customers: [
    'Individual Consumers',
    'Business Enterprises',
    'Educational Institutions',
    'Government Agencies',
  ],
  investments_made: [
    {
      company_name: 'Uber Technologies Inc.',
      ticker: 'UBER',
      amount: 1000000000,
    },
    {
      company_name: 'DiDi Global Inc.',
      ticker: 'DIDI',
      amount: 400000000,
    },
    {
      company_name: 'Augmented Reality Startups',
      ticker: 'PRIVATE',
      amount: 1500000000,
    },
  ],
  investors: [
    'Vanguard Group Inc.',
    'BlackRock Inc.',
    'Berkshire Hathaway Inc.',
    'State Street Corporation',
    'Fidelity Management & Research Company',
  ],
  news: {
    AAPL: [
      {
        title: 'Apple Reports Record Q4 Earnings, Driven by iPhone 15 Demand',
        published_date: '2024-01-25',
        content: 'Apple Inc. announced exceptional quarterly earnings, with iPhone 15 models driving record sales. The company reported revenue growth of 8% year-over-year, exceeding analyst expectations. CEO Tim Cook highlighted strong performance in China and emerging markets. Service revenue also saw significant growth, reaching an all-time high.',
      },
      {
        title: 'Apple Unveils Revolutionary AI Features in iOS 18',
        published_date: '2024-01-20',
        content: 'At its recent developer conference, Apple introduced groundbreaking AI capabilities integrated into iOS 18. The new features leverage on-device machine learning to enhance user privacy while delivering intelligent assistance. Analysts predict these innovations could drive next-generation upgrade cycle.',
      },
      {
        title: 'Apple Enters Strategic Partnership for Advanced Chip Manufacturing',
        published_date: '2024-01-15',
        content: 'Apple has entered into a strategic partnership with Taiwan Semiconductor Manufacturing Company to develop next-generation 3nm chips for future devices. This partnership aims to ensure supply chain resilience and technological leadership in processor design and manufacturing.',
      },
    ],
  },
  relations_news: {
    'Taiwan Semiconductor (TSM)': [
      {
        title: 'TSMC Expands Production Capacity for Apple Chips',
        published_date: '2024-01-18',
        content: 'TSMC announces new fabrication facility dedicated to Apple\'s A-series and M-series processors. The expansion represents a $10 billion investment in advanced semiconductor manufacturing technology.',
      },
    ],
    'Tim Cook': [
      {
        title: 'Apple CEO Tim Cook Comments on Global Strategy',
        published_date: '2024-01-22',
        content: 'In an exclusive interview, CEO Tim Cook discussed Apple\'s expansion into emerging markets and commitment to sustainable manufacturing practices. He emphasized the company\'s long-term vision for innovation and environmental responsibility.',
      },
    ],
  },
  stock_data: {
    AAPL: {
      price: 1900.00,
      volume: 45000000,
      sector: 'Technology - Consumer Electronics',
    },
  },
};

// Mock Market Data for MSFT
export const mockMSFTMarketData: MarketData = {
  target_ticker: 'MSFT',
  company_name: 'Microsoft Corporation',
  industry: 'Software, Cloud Services & Enterprise Technology',
  competitors: [
    'Amazon.com Inc.',
    'Google (Alphabet)',
    'Oracle Corporation',
    'Salesforce Inc.',
    'IBM Corporation',
  ],
  suppliers: [
    'Various cloud infrastructure providers',
    'Hardware OEM partners',
    'Software licensing partners',
  ],
  customers: [
    'Corporate Enterprises',
    'Government Organizations',
    'Educational Institutions',
    'Small and Medium Businesses',
    'Individual Consumers',
  ],
  investments_made: [
    {
      company_name: 'OpenAI Inc.',
      ticker: 'PRIVATE',
      amount: 13000000000,
    },
    {
      company_name: 'Activision Blizzard Inc.',
      ticker: 'ATVI',
      amount: 68700000000,
    },
    {
      company_name: 'LinkedIn Corporation',
      ticker: 'LNKD',
      amount: 26200000000,
    },
  ],
  investors: [
    'Vanguard Group Inc.',
    'BlackRock Inc.',
    'State Street Corporation',
    'Berkshire Hathaway Inc.',
    'T. Rowe Price Associates',
  ],
  news: {
    MSFT: [
      {
        title: 'Microsoft Azure Surpasses 1 Trillion in Annual Run Rate',
        published_date: '2024-01-28',
        content: 'Microsoft announced that Azure cloud services have achieved an annual run rate exceeding $1 trillion, demonstrating exceptional growth in enterprise cloud adoption. The company has been aggressively expanding its data center infrastructure globally to meet surging demand.',
      },
      {
        title: 'Microsoft 365 Copilot Becomes Fastest-Adopted Enterprise Tool',
        published_date: '2024-01-23',
        content: 'Microsoft 365 Copilot, the AI-powered productivity assistant, has been adopted by over 1.5 million organizations in its first six months. The tool has shown measurable productivity improvements, with users reporting 30% faster task completion on average.',
      },
      {
        title: 'Microsoft Invests Additional $10B in OpenAI Partnership',
        published_date: '2024-01-16',
        content: 'Microsoft announced an additional $10 billion investment in OpenAI, deepening the strategic partnership. The investment strengthens integration of GPT and other AI models into Microsoft products and ensures priority access to cutting-edge AI capabilities.',
      },
    ],
  },
  relations_news: {
    'OpenAI': [
      {
        title: 'OpenAI and Microsoft Deepen AI Collaboration',
        published_date: '2024-01-17',
        content: 'OpenAI and Microsoft announce expanded collaboration to develop next-generation AI models. The partnership combines OpenAI\'s research capabilities with Microsoft\'s Azure infrastructure and enterprise reach.',
      },
    ],
    'Satya Nadella': [
      {
        title: 'Microsoft CEO Satya Nadella on AI Transformation',
        published_date: '2024-01-24',
        content: 'In a keynote address, CEO Satya Nadella outlined Microsoft\'s vision for AI-powered transformation across industries. He emphasized ethical AI development and the company\'s commitment to democratizing AI tools for businesses of all sizes.',
      },
    ],
  },
  stock_data: {
    MSFT: {
      price: 4200.00,
      volume: 28000000,
      sector: 'Technology - Software & Cloud Services',
    },
  },
};

// Mock Market Data for GOOGL
export const mockGOOGLMarketData: MarketData = {
  target_ticker: 'GOOGL',
  company_name: 'Alphabet Inc.',
  industry: 'Internet Services, Cloud Computing & AI',
  competitors: [
    'Microsoft Corporation',
    'Amazon.com Inc.',
    'Meta Platforms Inc.',
    'Apple Inc.',
    'Alibaba Group Holding',
  ],
  suppliers: [
    'Various content creators and publishers',
    'Cloud infrastructure suppliers',
    'Advertising technology partners',
  ],
  customers: [
    'Advertisers and Businesses',
    'Individual Internet Users',
    'Developers and Enterprises',
    'Government Agencies',
  ],
  investments_made: [
    {
      company_name: 'YouTube Music',
      ticker: 'SUBSIDIARY',
      amount: 16500000000,
    },
    {
      company_name: 'Waymo LLC',
      ticker: 'SUBSIDIARY',
      amount: 2500000000,
    },
    {
      company_name: 'Google Cloud Infrastructure',
      ticker: 'INTERNAL',
      amount: 50000000000,
    },
  ],
  investors: [
    'Vanguard Group Inc.',
    'BlackRock Inc.',
    'Fidelity Management & Research Company',
    'State Street Corporation',
    'T. Rowe Price Associates',
  ],
  news: {
    GOOGL: [
      {
        title: 'Google Cloud Revenue Grows 28% Year-Over-Year',
        published_date: '2024-01-27',
        content: 'Alphabet reported strong quarterly results, with Google Cloud revenue growing 28% compared to the same period last year. The company has been aggressively competing with AWS and Azure, focusing on AI and machine learning services.',
      },
      {
        title: 'Google Launches Gemini Pro: Advanced Multimodal AI Model',
        published_date: '2024-01-19',
        content: 'Google unveiled Gemini Pro, its most advanced AI model capable of understanding text, images, video, and audio simultaneously. The model demonstrates superior performance across multiple benchmarks and is now powering Google Search and other services.',
      },
      {
        title: 'YouTube Advertising Revenue Hits Record $8.1B',
        published_date: '2024-01-21',
        content: 'YouTube advertising revenue reached a new record of $8.1 billion, driven by increased creator monetization and premium subscription growth. Shorts platform has attracted over 100 billion daily views, creating new advertising opportunities.',
      },
    ],
  },
  relations_news: {
    'Sundar Pichai': [
      {
        title: 'Google CEO Sundar Pichai on Next-Gen AI Development',
        published_date: '2024-01-26',
        content: 'CEO Sundar Pichai discussed Google\'s ambitious AI roadmap, including upcoming developments in search, productivity tools, and autonomous systems. He emphasized responsible AI development and the company\'s commitment to user privacy.',
      },
    ],
    'YouTube': [
      {
        title: 'YouTube Reaches 3 Billion Monthly Users',
        published_date: '2024-01-14',
        content: 'YouTube announced reaching 3 billion monthly active users, making it the second most visited website globally. The platform continues to expand creator monetization tools and premium content offerings.',
      },
    ],
  },
  stock_data: {
    GOOGL: {
      price: 14000.00,
      volume: 22000000,
      sector: 'Technology - Internet Services & Cloud',
    },
  },
};

// Function to get mock market data by ticker
export function getMockMarketData(ticker: string): MarketData | null {
  const tickerUpper = ticker.toUpperCase();
  
  switch (tickerUpper) {
    case 'AAPL':
      return mockAAPLMarketData;
    case 'MSFT':
      return mockMSFTMarketData;
    case 'GOOGL':
      return mockGOOGLMarketData;
    default:
      return null;
  }
}

