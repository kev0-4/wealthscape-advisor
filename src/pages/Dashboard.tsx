import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, type UserProfile, type FinancialGoal, type Investment, type InvestmentPreference } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Target, Briefcase, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { state: authState } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [preferences, setPreferences] = useState<InvestmentPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!authState.user?.email || !authState.user?.token) return;

      try {
        setLoading(true);
        const [profileRes, goalsRes, investmentsRes, preferencesRes] = await Promise.all([
          userAPI.getProfile(authState.user.email, authState.user.token),
          userAPI.getGoals(authState.user.email, authState.user.token),
          userAPI.getInvestments(authState.user.email, authState.user.token),
          userAPI.getPreferences(authState.user.email, authState.user.token),
        ]);

        setProfile(profileRes.data);
        setGoals(goalsRes.data);
        setInvestments(investmentsRes.data);
        setPreferences(preferencesRes.data);
      } catch (error: any) {
        console.error('Failed to fetch user data:', error);
        toast({
          title: "Failed to load data",
          description: error.response?.data?.detail || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [authState.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.investment_amount, 0);
  const totalGain = totalInvestmentValue - totalInvested;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          Here's your investment portfolio overview and recent activity.
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInvestmentValue.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {gainPercent >= 0 ? (
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span className={gainPercent >= 0 ? 'text-success' : 'text-destructive'}>
                {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {investments.length} investments</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{Math.abs(totalGain).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalGain >= 0 ? 'Profit' : 'Loss'} from investments
            </p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-xs text-muted-foreground">Financial goals in progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Your investment profile and risk preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.full_name ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Age</p>
                    <p className="text-foreground">{profile.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Income Level</p>
                    <Badge variant="secondary">{profile.income_level || 'Not specified'}</Badge>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Risk Tolerance</p>
                    <Badge 
                      variant={
                        profile.risk_tolerance === 'high' ? 'destructive' :
                        profile.risk_tolerance === 'medium' ? 'default' : 'secondary'
                      }
                    >
                      {profile.risk_tolerance || 'Not specified'}
                    </Badge>
                  </div>
                </div>
                
                {profile.financial_priorities && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Financial Priorities</p>
                    <div className="space-y-2">
                      {Object.entries(profile.financial_priorities).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="capitalize text-sm">{key}</span>
                          <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No profile information available</p>
                <p className="text-sm">Complete your profile to get personalized recommendations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Financial Goals</span>
            </CardTitle>
            <CardDescription>Track your progress towards financial milestones</CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = (goal.current_progress / goal.target_amount) * 100;
                  return (
                    <div key={goal.goal_id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{goal.goal_type}</h4>
                        <Badge variant="outline">
                          {new Date(goal.target_date).getFullYear()}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>₹{goal.current_progress.toLocaleString()}</span>
                          <span>₹{goal.target_amount.toLocaleString()}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {progress.toFixed(1)}% complete
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No financial goals set</p>
                <p className="text-sm">Set goals to track your investment progress</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Investments */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Recent Investments</span>
          </CardTitle>
          <CardDescription>Your current investment portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length > 0 ? (
            <div className="space-y-4">
              {investments.slice(0, 5).map((investment) => {
                const gain = investment.current_value - investment.investment_amount;
                const gainPercent = (gain / investment.investment_amount) * 100;
                
                return (
                  <div key={investment.investment_id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{investment.ticker_symbol}</h4>
                        <Badge variant="outline">{investment.asset_class}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {investment.quantity} shares • {investment.market}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">₹{investment.current_value.toLocaleString()}</p>
                      <div className={`text-sm flex items-center space-x-1 ${
                        gain >= 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {gain >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{gain >= 0 ? '+' : ''}₹{Math.abs(gain).toLocaleString()}</span>
                        <span>({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No investments found</p>
              <p className="text-sm">Start investing to see your portfolio here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}