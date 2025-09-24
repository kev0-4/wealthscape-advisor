import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { advisorAPI, type PortfolioRecommendation } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Target, TrendingUp, PieChart, Lightbulb } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Portfolio() {
  const { state: authState } = useAuth();
  const [userProfile, setUserProfile] = useState({
    income: '',
    investment_amount: '',
    goal: '',
    time_horizon_years: '',
    risk_appetite: '',
    tickers: [] as string[]
  });
  const [recommendation, setRecommendation] = useState<PortfolioRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile.tickers.length || !authState.user?.email || !authState.user?.token) return;

    try {
      setLoading(true);
      // Use the first selected ticker for the API call
      const primaryTicker = userProfile.tickers[0];
      const response = await advisorAPI.getPortfolioRecommendation(
        authState.user.email,
        primaryTicker.toUpperCase(),
        authState.user.token
      );
      
      setRecommendation(response.data);
      toast({
        title: "Portfolio recommendation generated!",
        description: `Analysis complete for ${userProfile.tickers.join(', ')}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to get recommendation:', error);
      toast({
        title: "Failed to generate recommendation",
        description: error.response?.data?.detail || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Portfolio Advisor</h1>
        <p className="text-muted-foreground">
          Get personalized portfolio recommendations based on your profile and market analysis.
        </p>
      </div>

      {/* Input Form */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Get Portfolio Recommendation</span>
          </CardTitle>
          <CardDescription>
            Enter a stock ticker to get a personalized portfolio allocation recommendation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetRecommendation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="income">Annual Income (₹)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="e.g., 1200000"
                  value={userProfile.income}
                  onChange={(e) => setUserProfile({...userProfile, income: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="investment_amount">Investment Amount (₹)</Label>
                <Input
                  id="investment_amount"
                  type="number"
                  placeholder="e.g., 100000"
                  value={userProfile.investment_amount}
                  onChange={(e) => setUserProfile({...userProfile, investment_amount: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="goal">Financial Goal</Label>
                <Select value={userProfile.goal} onValueChange={(value) => setUserProfile({...userProfile, goal: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retirement">Retirement</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Home Purchase">Home Purchase</SelectItem>
                    <SelectItem value="Wealth Building">Wealth Building</SelectItem>
                    <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time_horizon_years">Time Horizon (Years)</Label>
                <Input
                  id="time_horizon_years"
                  type="number"
                  placeholder="e.g., 10"
                  value={userProfile.time_horizon_years}
                  onChange={(e) => setUserProfile({...userProfile, time_horizon_years: e.target.value})}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="risk_appetite">Risk Appetite</Label>
                <Select value={userProfile.risk_appetite} onValueChange={(value) => setUserProfile({...userProfile, risk_appetite: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tickers">Stock Symbols</Label>
                <Select value="" onValueChange={(value) => {
                  if (value && !userProfile.tickers.includes(value)) {
                    setUserProfile({...userProfile, tickers: [...userProfile.tickers, value]});
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select stock symbols" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AAPL">AAPL - Apple Inc.</SelectItem>
                    <SelectItem value="MSFT">MSFT - Microsoft Corporation</SelectItem>
                    <SelectItem value="GOOGL">GOOGL - Alphabet Inc.</SelectItem>
                    <SelectItem value="AMZN">AMZN - Amazon.com Inc.</SelectItem>
                    <SelectItem value="TSLA">TSLA - Tesla Inc.</SelectItem>
                    <SelectItem value="NVDA">NVDA - NVIDIA Corporation</SelectItem>
                    <SelectItem value="META">META - Meta Platforms Inc.</SelectItem>
                    <SelectItem value="NFLX">NFLX - Netflix Inc.</SelectItem>
                    <SelectItem value="ADBE">ADBE - Adobe Inc.</SelectItem>
                    <SelectItem value="CRM">CRM - Salesforce Inc.</SelectItem>
                    <SelectItem value="ORCL">ORCL - Oracle Corporation</SelectItem>
                    <SelectItem value="IBM">IBM - International Business Machines</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Selected tickers display */}
                {userProfile.tickers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userProfile.tickers.map((ticker) => (
                      <Badge key={ticker} variant="secondary" className="flex items-center gap-1">
                        {ticker}
                        <button
                          type="button"
                          onClick={() => setUserProfile({
                            ...userProfile, 
                            tickers: userProfile.tickers.filter(t => t !== ticker)
                          })}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="btn-gradient" 
                disabled={loading || !userProfile.tickers.length || !userProfile.income || !userProfile.investment_amount || !userProfile.goal || !userProfile.time_horizon_years || !userProfile.risk_appetite}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><Target className="mr-2 h-4 w-4" /> Get Recommendation</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recommendation Results */}
      {recommendation && (
        <div className="space-y-6">
          {/* User Profile Summary */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Your Investment Profile</span>
              </CardTitle>
              <CardDescription>
                Recommendation based on your risk profile and financial goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Income Level</p>
                  <Badge variant="secondary">{recommendation.user_profile.income}</Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Investment Amount</p>
                  <p className="font-medium">₹{recommendation.user_profile.investment_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Goal</p>
                  <Badge variant="outline">{recommendation.user_profile.goal}</Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Time Horizon</p>
                  <p className="font-medium">{recommendation.user_profile.time_horizon_years} years</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Risk Appetite</p>
                  <Badge 
                    variant={
                      recommendation.user_profile.risk_appetite === 'high' ? 'destructive' :
                      recommendation.user_profile.risk_appetite === 'medium' ? 'default' : 'secondary'
                    }
                  >
                    {recommendation.user_profile.risk_appetite}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Allocation */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Recommended Portfolio Allocation</span>
              </CardTitle>
              <CardDescription>
                Optimized allocation based on risk-return analysis and market intelligence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {recommendation.portfolio_allocation.map((allocation, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{allocation.asset_class}</Badge>
                        <span className="font-medium">{allocation.percentage.toFixed(1)}%</span>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{allocation.amount_in_inr.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={allocation.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">{allocation.notes}</p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Expected Returns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Expected Return Range</span>
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Minimum</p>
                      <p className={`font-bold ${recommendation.expected_return_range[0] >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {recommendation.expected_return_range[0] >= 0 ? '+' : ''}{recommendation.expected_return_range[0].toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Maximum</p>
                      <p className={`font-bold ${recommendation.expected_return_range[1] >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {recommendation.expected_return_range[1] >= 0 ? '+' : ''}{recommendation.expected_return_range[1].toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Market Intelligence</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Target Company:</span> {recommendation.market_intelligence.target_company}</p>
                    <p><span className="font-medium">Industry:</span> {recommendation.market_intelligence.industry_focus}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Rationale */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Investment Rationale</CardTitle>
              <CardDescription>AI-powered analysis and reasoning behind this recommendation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{recommendation.rationale}</p>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Market Analysis Summary</CardTitle>
              <CardDescription>Detailed market data used for portfolio optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(recommendation.market_summary_used).map(([ticker, data]) => (
                  <div key={ticker} className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{ticker}</p>
                      <Badge variant="outline">{data.sector}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">₹{data.last_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-medium">{data.weight.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sentiment</p>
                      <p className={`font-medium ${data.sentiment_score >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {data.sentiment_score >= 0 ? '+' : ''}{(data.sentiment_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Market Position</p>
                      <p className="font-medium">{(data.market_position * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{(data.volume / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!recommendation && !loading && (
        <Card className="card-elegant">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Get Your Personalized Portfolio</h3>
            <p className="text-muted-foreground mb-4">
              Enter a stock ticker above to receive AI-powered portfolio recommendations tailored to your investment profile.
            </p>
            <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
              <span>• Risk-adjusted allocation</span>
              <span>• Market sentiment analysis</span>
              <span>• Expected return forecasting</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}