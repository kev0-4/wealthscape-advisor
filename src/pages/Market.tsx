import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dataAPI, type MarketData } from '@/lib/api';
import { getMockMarketData } from '@/lib/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, BarChart3, Building2, Users, Newspaper, TrendingUp, BookOpen, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Market() {
  const { state: authState } = useAuth();
  const [ticker, setTicker] = useState('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [eli5Explanation, setEli5Explanation] = useState<string | null>(null);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [eli5Open, setEli5Open] = useState(false);

  const handleGetMarketData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    try {
      setLoading(true);
      setEli5Explanation(null);
      setEli5Open(false);
      
      // Use mock data in demo mode
      if (authState.user?.isDemo) {
        const mockData = getMockMarketData(ticker.toUpperCase());
        if (mockData) {
          setTimeout(() => {
            setMarketData(mockData);
            setLoading(false);
            
            // Generate ELI5 for demo data
            setEli5Loading(true);
            const contentToExplain = `
Company: ${mockData.company_name} (${mockData.target_ticker})
Industry: ${mockData.industry}
Current Stock Price: ₹${mockData.stock_data[mockData.target_ticker]?.price.toFixed(2)}
Volume: ${(mockData.stock_data[mockData.target_ticker]?.volume / 1000000).toFixed(1)}M shares
Sector: ${mockData.stock_data[mockData.target_ticker]?.sector}
Competitors: ${mockData.competitors.join(', ')}
Suppliers: ${mockData.suppliers.join(', ')}

Key Terms:
- Stock Price: The current cost to buy one share of the company
- Volume: How many shares were traded in a day
- Sector: The industry category the company belongs to
- Competitors: Other companies that sell similar products or services
- Suppliers: Companies that provide materials or services to this company
- Ticker Symbol: The short code used to identify a stock (like AAPL for Apple)
- Market Data: Information about how the stock is performing
`;
            dataAPI.getELI5Explanation(
              contentToExplain,
              'Market data including stock price, volume, competitors, suppliers, and company information'
            ).then(response => {
              setEli5Explanation(response.data.explanation);
              setEli5Loading(false);
            }).catch(() => {
              setEli5Loading(false);
            });
            
            toast({
              title: "Market data retrieved!",
              description: `Demo analysis complete for ${mockData.company_name}`,
              variant: "default",
            });
          }, 800);
        } else {
          setTimeout(() => {
            setLoading(false);
            toast({
              title: "Demo data available",
              description: "Try AAPL, MSFT, or GOOGL for demo market data.",
              variant: "default",
            });
          }, 800);
        }
        return;
      }
      
      const response = await dataAPI.getMarketData(ticker.toUpperCase());
      
      setMarketData(response.data);
      
      // Generate ELI5 explanation
      setEli5Loading(true);
      try {
        const contentToExplain = `
Company: ${response.data.company_name} (${response.data.target_ticker})
Industry: ${response.data.industry}
Current Stock Price: ₹${response.data.stock_data[response.data.target_ticker]?.price.toFixed(2)}
Volume: ${(response.data.stock_data[response.data.target_ticker]?.volume / 1000000).toFixed(1)}M shares
Sector: ${response.data.stock_data[response.data.target_ticker]?.sector}
Competitors: ${response.data.competitors.join(', ')}
Suppliers: ${response.data.suppliers.join(', ')}

Key Terms:
- Stock Price: The current cost to buy one share of the company
- Volume: How many shares were traded in a day
- Sector: The industry category the company belongs to
- Competitors: Other companies that sell similar products or services
- Suppliers: Companies that provide materials or services to this company
- Ticker Symbol: The short code used to identify a stock (like AAPL for Apple)
- Market Data: Information about how the stock is performing
`;
        const eli5Response = await dataAPI.getELI5Explanation(
          contentToExplain,
          'Market data including stock price, volume, competitors, suppliers, and company information'
        );
        setEli5Explanation(eli5Response.data.explanation);
      } catch (error) {
        console.error('Failed to generate ELI5 explanation:', error);
      } finally {
        setEli5Loading(false);
      }
      
      toast({
        title: "Market data retrieved!",
        description: `Analysis complete for ${response.data.company_name}`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Failed to get market data:', error);
      toast({
        title: "Failed to retrieve market data",
        description: error.response?.data?.detail || "Please try again with a valid ticker.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Data</h1>
          <p className="text-muted-foreground">
            Comprehensive market intelligence including company analysis, competitor data, and recent news.
          </p>
        </div>
        {authState.user?.isDemo && (
          <Badge variant="secondary">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Input Form */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Market Analysis</span>
          </CardTitle>
          <CardDescription>
            Enter a stock ticker to get comprehensive market data and competitive intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetMarketData} className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="market-ticker">Stock Ticker</Label>
              <Input
                id="market-ticker"
                type="text"
                placeholder="e.g., AAPL, MSFT, GOOGL, TSM"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                className="btn-gradient" 
                disabled={loading || !ticker.trim()}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  <><BarChart3 className="mr-2 h-4 w-4" /> Get Market Data</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Market Data Results */}
      {marketData && (
        <div className="space-y-6">
          {/* Company Overview */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Overview</span>
              </CardTitle>
              <CardDescription>
                Basic information about {marketData.company_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-medium text-muted-foreground">Company</p>
                  <p className="text-lg font-bold">{marketData.company_name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Ticker</p>
                  <Badge variant="outline" className="text-base font-mono">
                    {marketData.target_ticker}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Industry</p>
                  <Badge variant="secondary">{marketData.industry}</Badge>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Current Price</p>
                  <p className="text-lg font-bold text-primary">
                    {marketData.stock_data[marketData.target_ticker]?.currency === 'USD' ? '$' : '₹'}
                    {marketData.stock_data[marketData.target_ticker]?.price.toFixed(2) || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Data */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Stock Performance</span>
              </CardTitle>
              <CardDescription>
                Current market data for {marketData.target_ticker} and related companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(marketData.stock_data).map(([ticker, data]) => (
                  <div 
                    key={ticker} 
                    className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg ${
                      ticker === marketData.target_ticker ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{ticker}</p>
                      {ticker === marketData.target_ticker && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-bold text-lg">
                        {data.currency === 'USD' ? '$' : '₹'}{data.price.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{(data.volume / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sector</p>
                      <Badge variant="outline">{data.sector}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Relationships */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Competitors & Suppliers */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Business Ecosystem</span>
                </CardTitle>
                <CardDescription>
                  Key relationships in {marketData.company_name}'s business network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Competitors</h4>
                  <div className="flex flex-wrap gap-2">
                    {marketData.competitors.map((competitor) => (
                      <Badge key={competitor} variant="destructive">
                        {competitor}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Key Suppliers</h4>
                  <div className="flex flex-wrap gap-2">
                    {marketData.suppliers.map((supplier) => (
                      <Badge key={supplier} variant="secondary">
                        {supplier}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {marketData.customers.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Major Customers</h4>
                      <div className="flex flex-wrap gap-2">
                        {marketData.customers.map((customer) => (
                          <Badge key={customer} variant="outline">
                            {customer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Investments & Investors */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Investment Activity</CardTitle>
                <CardDescription>
                  Investment flows and major stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {marketData.investments_made.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Investments</h4>
                    <div className="space-y-2">
                      {marketData.investments_made.map((investment, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span className="font-medium">{investment.company_name}</span>
                          <Badge variant="secondary">
                            ₹{(investment.amount / 1000000000).toFixed(1)}B
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Major Investors</h4>
                  <div className="flex flex-wrap gap-2">
                    {marketData.investors.map((investor) => (
                      <Badge key={investor} variant="secondary">
                        {investor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* News & Analysis */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Newspaper className="h-5 w-5" />
                <span>Recent News & Analysis</span>
              </CardTitle>
              <CardDescription>
                Latest news affecting {marketData.company_name} and its business relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Company News */}
              {Object.entries(marketData.news).map(([ticker, articles]) => (
                <div key={ticker}>
                  <h4 className="font-medium mb-3 flex items-center space-x-2">
                    <Badge variant="outline">{ticker}</Badge>
                    <span>Company News</span>
                  </h4>
                  <div className="space-y-3">
                    {articles.map((article, index) => (
                      <div key={index} className="border-l-4 border-primary/30 pl-4 py-2">
                        <h5 className="font-medium text-sm">{article.title}</h5>
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(article.published_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {article.content.length > 200 
                            ? `${article.content.substring(0, 200)}...` 
                            : article.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Relations News */}
              {Object.keys(marketData.relations_news).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3">Business Relationship News</h4>
                    <div className="space-y-3">
                      {Object.entries(marketData.relations_news).map(([relation, articles]) => 
                        articles.map((article, index) => (
                          <div key={`${relation}-${index}`} className="border-l-4 border-accent/30 pl-4 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="secondary">{relation}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(article.published_date).toLocaleDateString()}
                              </span>
                            </div>
                            <h5 className="font-medium text-sm">{article.title}</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {article.content.length > 150 
                                ? `${article.content.substring(0, 150)}...` 
                                : article.content}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ELI5 Section */}
          <Card className="card-elegant border-primary/20">
            <Collapsible open={eli5Open} onOpenChange={setEli5Open}>
              <CardHeader>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle>Explain Like I'm 5 (ELI5)</CardTitle>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${eli5Open ? 'transform rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CardDescription>
                  Simple explanations of market data and financial terms - no jargon, just plain English
                </CardDescription>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  {eli5Loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-muted-foreground">Generating simple explanation...</span>
                    </div>
                  ) : eli5Explanation ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{eli5Explanation}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to generate a simple explanation of the market data and financial terms shown above.
                    </p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!marketData && !loading && (
        <Card className="card-elegant">
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Comprehensive Market Intelligence</h3>
            <p className="text-muted-foreground mb-4">
              Enter a stock ticker above to access detailed market data, competitive analysis, and recent news.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center">
                <Building2 className="h-6 w-6 mb-1" />
                <span>Company Data</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-6 w-6 mb-1" />
                <span>Competitor Analysis</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="h-6 w-6 mb-1" />
                <span>Stock Performance</span>
              </div>
              <div className="flex flex-col items-center">
                <Newspaper className="h-6 w-6 mb-1" />
                <span>Market News</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}