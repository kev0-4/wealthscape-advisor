import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockUserProfile, mockGoals, mockInvestments, mockPreferences } from './mockData';
import { localStorageUtils } from './localStorage';

// Initialize Gemini API
// Note: In production, this should be stored in an environment variable
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBPuNhsRagYNUPhhtHp1zyleRoDtMiSzo4';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Stock Price API endpoint
const STOCK_PRICE_API_URL = 'http://127.0.0.1:5009/stock-prices';

// Stock price interfaces
export interface StockPriceData {
  currency: string;
  name: string;
  price: number;
}

export interface StockPricesResponse {
  [ticker: string]: StockPriceData;
}

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
    currency?: string;
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

// Helper function to fetch stock prices from API
async function fetchStockPrices(): Promise<StockPricesResponse | null> {
  try {
    const response = await fetch(STOCK_PRICE_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Stock price API returned ${response.status}`);
    }
    
    const data: StockPricesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch stock prices:', error);
    return null;
  }
}

// Helper function to get stock price for a specific ticker
async function getStockPrice(ticker: string): Promise<number | null> {
  const prices = await fetchStockPrices();
  if (prices && prices[ticker.toUpperCase()]) {
    return prices[ticker.toUpperCase()].price;
  }
  return null;
}

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string, sampleData: any): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const fullPrompt = `${prompt}

CRITICAL JSON SCHEMA REQUIREMENTS:
- You must respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Return ONLY the JSON object.
- ALL fields in the JSON response MUST have values (no null, no undefined, no empty arrays, no empty strings, no empty objects)
- Every required field must be populated with appropriate data
- Follow the exact structure and field names shown in the sample below
- All arrays must contain the minimum required number of items as specified
- All dates must be valid and in the correct format (YYYY-MM-DD)
- All numeric values must be positive numbers where applicable

Expected JSON structure (this is the schema you MUST follow):
${JSON.stringify(sampleData, null, 2)}

Return the JSON response now (ONLY the JSON, no other text):`;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to extract JSON from the response
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Try to find JSON in the text more carefully
        const startIdx = text.indexOf('{');
        const endIdx = text.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          try {
            return JSON.parse(text.substring(startIdx, endIdx + 1));
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
        }
      }
    }
    
    // If no JSON found, throw error instead of returning sample data
    throw new Error('Failed to parse JSON response from Gemini API');
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
  }
}

// API functions
export const authAPI = {
  login: async (data: LoginRequest) => {
    // Auth is handled in AuthContext, but keeping interface for compatibility
    return { data: { access_token: 'token', token_type: 'Bearer' } };
  },
  
  signup: async (data: SignupRequest) => {
    // Signup is handled in AuthContext, but keeping interface for compatibility
    return { 
      data: { 
        user_id: 'user_' + Date.now(),
        email: data.email,
        created_at: new Date().toISOString(),
        last_login: null
      } 
    };
  },
};

export const userAPI = {
  getProfile: async (email: string, token: string) => {
    // Check localStorage first
    const userData = localStorageUtils.getUser(email);
    if (userData && userData.profile) {
      return { data: userData.profile };
    }
    
    // Fallback to mock data
    return { data: { ...mockUserProfile, user_id: email } };
  },
  
  getGoals: async (email: string, token: string) => {
    // Check localStorage first
    const userData = localStorageUtils.getUser(email);
    if (userData && userData.goals.length > 0) {
      return { data: userData.goals };
    }
    
    // Fallback to mock data
    return { data: mockGoals };
  },
  
  getPreferences: async (email: string, token: string) => {
    // Check localStorage first
    const userData = localStorageUtils.getUser(email);
    if (userData && userData.preferences.length > 0) {
      return { data: userData.preferences };
    }
    
    // Fallback to mock data
    return { data: mockPreferences };
  },
  
  getInvestments: async (email: string, token: string) => {
    // Check localStorage first
    const userData = localStorageUtils.getUser(email);
    if (userData && userData.investments.length > 0) {
      return { data: userData.investments };
    }
    
    // Fallback to mock data
    return { data: mockInvestments };
  },
};

export const dataAPI = {
  getMarketData: async (ticker: string) => {
    // Fetch real stock price first
    const stockPrices = await fetchStockPrices();
    const tickerUpper = ticker.toUpperCase();
    const realPrice = stockPrices?.[tickerUpper]?.price;
    const companyName = stockPrices?.[tickerUpper]?.name;
    const currency = stockPrices?.[tickerUpper]?.currency || 'USD';
    
    // Always use Gemini API to generate market data
    const priceInfo = realPrice 
      ? `IMPORTANT: Use the EXACT stock price of $${realPrice.toFixed(2)} (${currency}) for ${tickerUpper}. This is the real current market price.`
      : `Provide a realistic stock price based on your knowledge of ${tickerUpper}.`;
    
    const prompt = `You are an expert financial market analyst. Generate comprehensive, realistic market data for the stock ticker ${tickerUpper}.

${priceInfo}

Based on your knowledge of ${tickerUpper}, provide detailed market intelligence including:

1. Company Information:
   - Full company name${companyName ? ` (use: ${companyName})` : ' (not just ticker)'}
   - Industry classification
   
2. Competitive Landscape:
   - 5-7 major competitors (use real company names if known)
   
3. Supply Chain:
   - 3-5 key suppliers (use real company names if known)
   - 2-4 major customer segments or client types
   
4. Investment Activity:
   - 3-5 recent investments made by the company (include company names, tickers if public, and realistic investment amounts in USD)
   
5. Ownership:
   - 5 major institutional investors (use real names like Vanguard, BlackRock, etc.)
   
6. Stock Data - IMPORTANT:
   - Current stock price${realPrice ? `: MUST be exactly $${realPrice.toFixed(2)} (${currency})` : ': use realistic price based on actual market knowledge'}
   - Trading volume (realistic numbers)
   - Sector classification
   - Include stock data for the target ticker ${tickerUpper}
   
7. News & Analysis - CRITICAL REQUIREMENTS:
   You must provide EXACTLY the following news articles:
   
   a) For ${tickerUpper} (the target ticker):
      - Provide EXACTLY 5 recent news articles about ${tickerUpper}
      - Each article must have:
        * title: Realistic, specific news title
        * published_date: Date within the last 6 months (format: YYYY-MM-DD)
        * content: Detailed content (at least 3-4 sentences with specific information)
   
   b) For Connected Companies (suppliers, customers, partners):
      - Provide EXACTLY 3 recent news articles about companies connected to ${tickerUpper}
      - These should be about suppliers, major customers, or business partners
      - Each article must have:
        * title: Realistic, specific news title
        * published_date: Date within the last 6 months (format: YYYY-MM-DD)
        * content: Detailed content (at least 3-4 sentences with specific information)
      - Store these in relations_news object with appropriate keys
   
   c) For Competitors:
      - Provide EXACTLY 3 recent news articles about competitors of ${tickerUpper}
      - Each article must have:
        * title: Realistic, specific news title
        * published_date: Date within the last 6 months (format: YYYY-MM-DD)
        * content: Detailed content (at least 3-4 sentences with specific information)
      - Store these in relations_news object with appropriate keys

CRITICAL JSON SCHEMA REQUIREMENTS:
- ALL fields in the JSON response MUST have values (no null, no empty arrays, no empty strings)
- The news object must contain EXACTLY 5 articles for ${tickerUpper}
- The relations_news object must contain EXACTLY 3 articles for connected companies and EXACTLY 3 articles for competitors
- All dates must be valid and in YYYY-MM-DD format
- All prices must be positive numbers
- All arrays must have at least the minimum required items
- stock_data must include the target ticker with price, volume, and sector

Use realistic data based on the actual company if you know it, or generate plausible data that matches the ticker's industry. All amounts should be in appropriate currency units (USD for US stocks, INR for Indian stocks, etc.).`;
    
    const sampleMarketData = {
      target_ticker: tickerUpper,
      company_name: companyName || `${tickerUpper} Corporation`,
      industry: 'Technology',
      competitors: ['Competitor 1', 'Competitor 2', 'Competitor 3', 'Competitor 4', 'Competitor 5'],
      suppliers: ['Supplier 1', 'Supplier 2', 'Supplier 3'],
      customers: ['Enterprise Customers', 'Individual Consumers'],
      investments_made: [
        { company_name: 'Startup A', ticker: 'PRIVATE', amount: 100000000 },
        { company_name: 'Startup B', ticker: 'PRIVATE', amount: 50000000 }
      ],
      investors: ['Vanguard Group Inc.', 'BlackRock Inc.', 'Fidelity Management & Research Company', 'State Street Corporation', 'JPMorgan Chase & Co.'],
      news: {
        [ticker.toUpperCase()]: [
          {
            title: 'Company Reports Strong Quarterly Earnings',
            published_date: new Date().toISOString().split('T')[0],
            content: 'The company reported strong quarterly earnings, exceeding analyst expectations with robust revenue growth and improved profit margins. The results demonstrate the company\'s ability to navigate market challenges while maintaining operational excellence.'
          },
          {
            title: 'New Product Launch Drives Market Interest',
            published_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'The company announced the launch of its latest product line, generating significant interest from investors and customers. Early market response has been positive, with pre-orders exceeding initial projections.'
          },
          {
            title: 'Strategic Partnership Announced',
            published_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'The company entered into a strategic partnership with a major industry player, expanding its market reach and technological capabilities. This collaboration is expected to drive growth in key market segments.'
          },
          {
            title: 'Leadership Changes Signal Growth Focus',
            published_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'The company announced key leadership appointments, bringing in experienced executives from top-tier firms. These changes are part of a broader strategy to accelerate growth and innovation.'
          },
          {
            title: 'Market Expansion Plans Revealed',
            published_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'The company unveiled ambitious expansion plans targeting emerging markets. The strategy includes significant investment in infrastructure and local partnerships to capture growth opportunities.'
          }
        ]
      },
      relations_news: {
        'Connected Companies': [
          {
            title: 'Key Supplier Announces Expansion',
            published_date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'A major supplier to the company announced plans for significant capacity expansion. This development is expected to improve supply chain reliability and potentially reduce costs for downstream partners.'
          },
          {
            title: 'Strategic Customer Partnership Deepens',
            published_date: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'The company strengthened its relationship with a key enterprise customer through an expanded multi-year agreement. The partnership includes joint innovation initiatives and expanded service offerings.'
          },
          {
            title: 'Business Partner Reports Strong Performance',
            published_date: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'A strategic business partner reported exceptional quarterly results, driven by strong demand in shared market segments. The positive performance bodes well for collaborative ventures.'
          }
        ],
        'Competitors': [
          {
            title: 'Competitor Launches New Market Initiative',
            published_date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'A major competitor announced a significant new market initiative targeting the same customer segments. The move intensifies competition and may impact market dynamics in the coming quarters.'
          },
          {
            title: 'Competitor Reports Mixed Quarterly Results',
            published_date: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'A key competitor reported mixed quarterly results, with strong performance in some segments offset by challenges in others. Analysts remain cautious about near-term prospects.'
          },
          {
            title: 'Competitor Announces Strategic Acquisition',
            published_date: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            content: 'A competitor completed a strategic acquisition to strengthen its market position. The deal enhances their capabilities in key technology areas and expands their customer base.'
          }
        ]
      },
      stock_data: {
        [tickerUpper]: {
          price: realPrice || 100.00,
          volume: 10000000,
          sector: 'Technology',
          currency: currency
        }
      }
    };
    
    const marketData = await callGeminiAPI(prompt, sampleMarketData);
    
    // Ensure the real stock price is used if available
    if (realPrice && marketData.stock_data && marketData.stock_data[tickerUpper]) {
      marketData.stock_data[tickerUpper].price = realPrice;
      marketData.stock_data[tickerUpper].currency = currency;
    }
    
    // Ensure the real company name is used if available
    if (companyName) {
      marketData.company_name = companyName;
    }
    
    return { data: marketData };
  },

  getELI5Explanation: async (content: string, context: string) => {
    // Generate ELI5 explanation using Gemini
    const prompt = `You are a friendly financial educator. Explain the following financial information in simple, easy-to-understand language (ELI5 - Explain Like I'm 5 style, but appropriate for adults).

Context: ${context}

Content to explain:
${content}

Provide a clear, simple explanation that:
- Uses everyday language and simple analogies
- Avoids complex financial jargon
- Explains what each term means in plain English
- Helps someone with no financial background understand the concepts
- Is friendly and encouraging
- Is 2-3 paragraphs long

Return ONLY the explanation text, no markdown, no code blocks, just plain text.`;
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return { data: { explanation: text } };
    } catch (error: any) {
      console.error('ELI5 API error:', error);
      // Return a simple fallback explanation
      return { 
        data: { 
          explanation: 'This section explains financial terms in simple language. Think of it like breaking down complex ideas into easy-to-understand concepts that anyone can grasp, even without a finance background.' 
        } 
      };
    }
  },
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
  getPortfolioRecommendation: async (data: PortfolioRecommendationRequest, token: string) => {
    // Fetch real stock prices for all tickers
    const stockPrices = await fetchStockPrices();
    
    // Build price information for the prompt
    const priceInfo: string[] = [];
    data.tickers.forEach(ticker => {
      const tickerUpper = ticker.toUpperCase();
      const price = stockPrices?.[tickerUpper]?.price;
      if (price) {
        priceInfo.push(`${tickerUpper}: $${price.toFixed(2)}`);
      }
    });
    
    const priceInfoText = priceInfo.length > 0
      ? `\nIMPORTANT - REAL STOCK PRICES TO USE:\n${priceInfo.join('\n')}\n\nUse these EXACT prices in your analysis.`
      : '\nUse realistic stock prices based on your knowledge.';
    
    // Use Gemini API to generate portfolio recommendation
    const investmentAmount = parseFloat(data.investment_amount);
    const timeHorizon = parseInt(data.time_horizon_years);
    
    const prompt = `You are an expert financial advisor AI. Generate a comprehensive, personalized portfolio recommendation based on the following user profile:${priceInfoText}

USER PROFILE:
- Annual Income: ₹${data.income}
- Investment Amount: ₹${data.investment_amount}
- Financial Goal: ${data.goal}
- Time Horizon: ${data.time_horizon_years} years
- Risk Appetite: ${data.risk_appetite}
- Interested Stock Tickers: ${data.tickers.join(', ')}

ANALYSIS REQUIREMENTS:

1. For each ticker (${data.tickers.join(', ')}), provide market analysis with:
   - last_price: Realistic current stock price
   - volume: Realistic trading volume
   - sector: Industry sector classification
   - weight: Recommended allocation percentage (must sum to 100% across all tickers)
   - sentiment_score: Market sentiment score between -1 (very negative) and 1 (very positive)
   - market_position: Competitive market position score between 0 (weak) and 1 (dominant)
   - notes: Brief analysis note (2-3 sentences) about the stock's prospects

2. Portfolio Allocation Strategy:
   Create a diversified allocation across asset classes based on:
   - Risk appetite: ${data.risk_appetite} (low = conservative, medium = balanced, high = aggressive)
   - Time horizon: ${timeHorizon} years (longer = more equity exposure)
   - Financial goal: ${data.goal}
   
   For each asset class allocation, include:
   - asset_class: Name of asset class (e.g., "Large-Cap Tech Stocks", "Growth Stocks", "Technology ETFs", "Corporate Bonds")
   - percentage: Allocation percentage (must sum to 100%)
   - amount_in_inr: Calculated amount (investment_amount × percentage / 100)
   - notes: Explanation of why this allocation fits the user's profile

3. Expected Returns:
   - expected_return_range: [minimum_annual_return%, maximum_annual_return%]
   - Base on risk profile: Low risk = 4-7%, Medium = 6-10%, High = 8-15%

4. Investment Rationale:
   - Provide a detailed 3-4 paragraph explanation covering:
     * Why this allocation matches the user's risk profile
     * How it aligns with their financial goal
     * Market outlook for the selected tickers
     * Risk considerations and diversification benefits

5. Market Intelligence:
   - sentiment_analysis: Object with sentiment scores (0 to 1) for each ticker
   - competitive_positioning: Object with market position scores (0 to 1) for each ticker
   - target_company: Primary focus company (usually the largest allocation)
   - industry_focus: Main industry theme of the portfolio

IMPORTANT GUIDELINES:
- All percentages must sum to exactly 100%
- Use realistic stock prices and market data
- Tailor allocation to risk appetite (${data.risk_appetite})
- Consider time horizon (${timeHorizon} years) for asset mix
- Provide professional, well-reasoned analysis`;
    
    const sampleRecommendation = {
      user_profile: {
        income: `₹${data.income}`,
        investment_amount: investmentAmount,
        goal: data.goal,
        time_horizon_years: timeHorizon,
        risk_appetite: data.risk_appetite
      },
      market_summary_used: data.tickers.reduce((acc, ticker) => {
        const tickerUpper = ticker.toUpperCase();
        const realPrice = stockPrices?.[tickerUpper]?.price;
        acc[ticker] = {
          last_price: realPrice || 100.00,
          volume: 10000000,
          sector: 'Technology',
          weight: 100 / data.tickers.length,
          sentiment_score: 0.7,
          market_position: 0.8,
          notes: `Strong market position and positive sentiment for ${ticker}.`
        };
        return acc;
      }, {} as Record<string, any>),
      portfolio_allocation: [
        {
          asset_class: 'Equity - Large Cap',
          percentage: 60.0,
          amount_in_inr: investmentAmount * 0.6,
          notes: 'Diversified equity allocation for growth potential'
        },
        {
          asset_class: 'Bonds - Corporate',
          percentage: 40.0,
          amount_in_inr: investmentAmount * 0.4,
          notes: 'Conservative bond allocation for stability'
        }
      ],
      expected_return_range: [6.0, 10.0],
      rationale: `This portfolio allocation is designed to balance growth potential with stability, tailored to your ${data.risk_appetite} risk appetite and ${data.goal} goal. The ${timeHorizon}-year time horizon allows for appropriate equity exposure while maintaining downside protection through fixed income allocations.`,
      market_intelligence: {
        sentiment_analysis: data.tickers.reduce((acc, ticker) => {
          acc[ticker] = 0.7;
          return acc;
        }, {} as Record<string, number>),
        competitive_positioning: data.tickers.reduce((acc, ticker) => {
          acc[ticker] = 0.8;
          return acc;
        }, {} as Record<string, number>),
        target_company: data.tickers[0] || 'N/A',
        industry_focus: 'Technology'
      }
    };
    
    const recommendation = await callGeminiAPI(prompt, sampleRecommendation);
    
    // Ensure real stock prices are used if available
    if (stockPrices && recommendation.market_summary_used) {
      Object.keys(recommendation.market_summary_used).forEach(ticker => {
        const tickerUpper = ticker.toUpperCase();
        const realPrice = stockPrices[tickerUpper]?.price;
        if (realPrice && recommendation.market_summary_used[ticker]) {
          recommendation.market_summary_used[ticker].last_price = realPrice;
        }
      });
    }
    
    return { data: recommendation };
  },

  getELI5Explanation: async (content: string, context: string) => {
    // Generate ELI5 explanation using Gemini
    const prompt = `You are a friendly financial educator. Explain the following financial information in simple, easy-to-understand language (ELI5 - Explain Like I'm 5 style, but appropriate for adults).

Context: ${context}

Content to explain:
${content}

Provide a clear, simple explanation that:
- Uses everyday language and simple analogies
- Avoids complex financial jargon
- Explains what each term means in plain English
- Helps someone with no financial background understand the concepts
- Is friendly and encouraging
- Is 2-3 paragraphs long

Return ONLY the explanation text, no markdown, no code blocks, just plain text.`;
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return { data: { explanation: text } };
    } catch (error: any) {
      console.error('ELI5 API error:', error);
      // Return a simple fallback explanation
      return { 
        data: { 
          explanation: 'This section explains financial terms in simple language. Think of it like breaking down complex ideas into easy-to-understand concepts that anyone can grasp, even without a finance background.' 
        } 
      };
    }
  },
};
