import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { localStorageUtils } from '@/lib/localStorage';
import type { UserProfile, FinancialGoal, Investment, InvestmentPreference } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Target, Briefcase, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type OnboardingStep = 'profile' | 'goals' | 'investments' | 'preferences' | 'complete';

export default function Onboarding() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [loading, setLoading] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    income_level: '',
    risk_tolerance: '',
  });

  // Goals state
  const [goals, setGoals] = useState<Array<{
    goal_type: string;
    target_amount: string;
    target_date: string;
    current_progress: string;
  }>>([{
    goal_type: '',
    target_amount: '',
    target_date: '',
    current_progress: '',
  }]);

  // Investments state
  const [investments, setInvestments] = useState<Array<{
    ticker_symbol: string;
    asset_class: string;
    asset_type: string;
    market: string;
    quantity: string;
    investment_amount: string;
    purchase_date: string;
  }>>([{
    ticker_symbol: '',
    asset_class: '',
    asset_type: '',
    market: '',
    quantity: '',
    investment_amount: '',
    purchase_date: '',
  }]);

  // Preferences state
  const [preferences, setPreferences] = useState({
    asset_types: [] as string[],
    preferred_sectors: [] as string[],
  });

  const steps: { key: OnboardingStep; title: string; icon: React.ReactNode }[] = [
    { key: 'profile', title: 'Profile', icon: <User className="h-4 w-4" /> },
    { key: 'goals', title: 'Financial Goals', icon: <Target className="h-4 w-4" /> },
    { key: 'investments', title: 'Investments', icon: <Briefcase className="h-4 w-4" /> },
    { key: 'preferences', title: 'Preferences', icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === 'profile') {
      if (!profile.full_name || !profile.age || !profile.income_level || !profile.risk_tolerance) {
        toast({
          title: "Please fill all fields",
          description: "All profile fields are required.",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep('goals');
    } else if (currentStep === 'goals') {
      setCurrentStep('investments');
    } else if (currentStep === 'investments') {
      setCurrentStep('preferences');
    } else if (currentStep === 'preferences') {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 'goals') {
      setCurrentStep('profile');
    } else if (currentStep === 'investments') {
      setCurrentStep('goals');
    } else if (currentStep === 'preferences') {
      setCurrentStep('investments');
    }
  };

  const handleComplete = async () => {
    if (!authState.user?.email) {
      toast({
        title: "Error",
        description: "Please log in first.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      setLoading(true);

      // Save profile
      const userProfile: UserProfile = {
        profile_id: `profile_${Date.now()}`,
        user_id: authState.user.email,
        full_name: profile.full_name,
        age: parseInt(profile.age),
        income_level: profile.income_level,
        risk_tolerance: profile.risk_tolerance,
        financial_priorities: {},
        spending_habits: {},
      };

      localStorageUtils.updateProfile(authState.user.email, userProfile);

      // Save goals
      const formattedGoals: FinancialGoal[] = goals
        .filter(g => g.goal_type && g.target_amount)
        .map((goal, index) => ({
          goal_id: `goal_${Date.now()}_${index}`,
          user_id: authState.user!.email,
          goal_type: goal.goal_type,
          target_amount: parseFloat(goal.target_amount) || 0,
          target_date: goal.target_date || new Date().toISOString().split('T')[0],
          current_progress: parseFloat(goal.current_progress) || 0,
        }));

      localStorageUtils.updateGoals(authState.user.email, formattedGoals);

      // Save investments
      const formattedInvestments: Investment[] = investments
        .filter(inv => inv.ticker_symbol && inv.investment_amount)
        .map((investment, index) => ({
          investment_id: `inv_${Date.now()}_${index}`,
          user_id: authState.user!.email,
          asset_class: investment.asset_class || 'Equity',
          asset_type: investment.asset_type || 'Stocks',
          market: investment.market || 'NASDAQ',
          ticker_symbol: investment.ticker_symbol.toUpperCase(),
          quantity: parseFloat(investment.quantity) || 0,
          investment_amount: parseFloat(investment.investment_amount) || 0,
          purchase_date: investment.purchase_date || new Date().toISOString().split('T')[0],
          current_value: parseFloat(investment.investment_amount) || 0,
          yield_rate: 0,
          maturity_date: null,
          performance_metrics: {},
          asset_specific_details: {},
        }));

      localStorageUtils.updateInvestments(authState.user.email, formattedInvestments);

      // Save preferences
      if (preferences.asset_types.length > 0 || preferences.preferred_sectors.length > 0) {
        const formattedPreferences: InvestmentPreference[] = [{
          pref_id: `pref_${Date.now()}`,
          user_id: authState.user.email,
          asset_types: preferences.asset_types,
          preferred_sectors: preferences.preferred_sectors,
        }];
        localStorageUtils.updatePreferences(authState.user.email, formattedPreferences);
      }

      // Mark onboarding as complete
      localStorageUtils.completeOnboarding(authState.user.email);

      setCurrentStep('complete');
      
      toast({
        title: "Onboarding Complete!",
        description: "Your profile has been set up successfully.",
        variant: "default",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    setGoals([...goals, {
      goal_type: '',
      target_amount: '',
      target_date: '',
      current_progress: '',
    }]);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: string, value: string) => {
    const updated = [...goals];
    updated[index] = { ...updated[index], [field]: value };
    setGoals(updated);
  };

  const addInvestment = () => {
    setInvestments([...investments, {
      ticker_symbol: '',
      asset_class: '',
      asset_type: '',
      market: '',
      quantity: '',
      investment_amount: '',
      purchase_date: '',
    }]);
  };

  const removeInvestment = (index: number) => {
    setInvestments(investments.filter((_, i) => i !== index));
  };

  const updateInvestment = (index: number, field: string, value: string) => {
    const updated = [...investments];
    updated[index] = { ...updated[index], [field]: value };
    setInvestments(updated);
  };

  const toggleAssetType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      asset_types: prev.asset_types.includes(type)
        ? prev.asset_types.filter(t => t !== type)
        : [...prev.asset_types, type],
    }));
  };

  const toggleSector = (sector: string) => {
    setPreferences(prev => ({
      ...prev,
      preferred_sectors: prev.preferred_sectors.includes(sector)
        ? prev.preferred_sectors.filter(s => s !== sector)
        : [...prev.preferred_sectors, sector],
    }));
  };

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">Onboarding Complete!</h2>
            <p className="text-muted-foreground">
              Your profile has been set up successfully. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-4">
                {steps.map((step, index) => (
                  <div
                    key={step.key}
                    className={`flex flex-col items-center space-y-1 ${
                      index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.icon}
                    <span className="text-xs">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 'profile' && 'Personal Information'}
              {currentStep === 'goals' && 'Financial Goals'}
              {currentStep === 'investments' && 'Your Investments'}
              {currentStep === 'preferences' && 'Investment Preferences'}
            </CardTitle>
            <CardDescription>
              {currentStep === 'profile' && 'Tell us about yourself to personalize your experience'}
              {currentStep === 'goals' && 'Set your financial goals and track your progress'}
              {currentStep === 'investments' && 'Add your current investments and holdings'}
              {currentStep === 'preferences' && 'Select your investment preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Step */}
            {currentStep === 'profile' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="30"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="income_level">Income Level</Label>
                  <Select
                    value={profile.income_level}
                    onValueChange={(value) => setProfile({ ...profile, income_level: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select income level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low (₹0 - ₹5,00,000)</SelectItem>
                      <SelectItem value="Medium">Medium (₹5,00,000 - ₹15,00,000)</SelectItem>
                      <SelectItem value="High">High (₹15,00,000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk_tolerance">Risk Tolerance</Label>
                  <Select
                    value={profile.risk_tolerance}
                    onValueChange={(value) => setProfile({ ...profile, risk_tolerance: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conservative</SelectItem>
                      <SelectItem value="medium">Medium - Balanced</SelectItem>
                      <SelectItem value="high">High - Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Goals Step */}
            {currentStep === 'goals' && (
              <div className="space-y-4">
                {goals.map((goal, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Goal {index + 1}</h4>
                        {goals.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGoal(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Goal Type</Label>
                          <Select
                            value={goal.goal_type}
                            onValueChange={(value) => updateGoal(index, 'goal_type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select goal type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Retirement Fund">Retirement Fund</SelectItem>
                              <SelectItem value="Education Fund">Education Fund</SelectItem>
                              <SelectItem value="Home Purchase">Home Purchase</SelectItem>
                              <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                              <SelectItem value="Wealth Building">Wealth Building</SelectItem>
                              <SelectItem value="Vacation">Vacation</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Target Amount (₹)</Label>
                          <Input
                            type="number"
                            value={goal.target_amount}
                            onChange={(e) => updateGoal(index, 'target_amount', e.target.value)}
                            placeholder="1000000"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Target Date</Label>
                          <Input
                            type="date"
                            value={goal.target_date}
                            onChange={(e) => updateGoal(index, 'target_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Current Progress (₹)</Label>
                          <Input
                            type="number"
                            value={goal.current_progress}
                            onChange={(e) => updateGoal(index, 'current_progress', e.target.value)}
                            placeholder="0"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addGoal} className="w-full">
                  + Add Another Goal
                </Button>
              </div>
            )}

            {/* Investments Step */}
            {currentStep === 'investments' && (
              <div className="space-y-4">
                {investments.map((investment, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Investment {index + 1}</h4>
                        {investments.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInvestment(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Ticker Symbol</Label>
                          <Input
                            value={investment.ticker_symbol}
                            onChange={(e) => updateInvestment(index, 'ticker_symbol', e.target.value.toUpperCase())}
                            placeholder="AAPL"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Asset Class</Label>
                          <Select
                            value={investment.asset_class}
                            onValueChange={(value) => updateInvestment(index, 'asset_class', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select asset class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Equity">Equity</SelectItem>
                              <SelectItem value="Debt">Debt</SelectItem>
                              <SelectItem value="ETF">ETF</SelectItem>
                              <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                              <SelectItem value="Bonds">Bonds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Asset Type</Label>
                          <Select
                            value={investment.asset_type}
                            onValueChange={(value) => updateInvestment(index, 'asset_type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Stocks">Stocks</SelectItem>
                              <SelectItem value="ETFs">ETFs</SelectItem>
                              <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                              <SelectItem value="Corporate Bonds">Corporate Bonds</SelectItem>
                              <SelectItem value="Government Bonds">Government Bonds</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Market</Label>
                          <Select
                            value={investment.market}
                            onValueChange={(value) => updateInvestment(index, 'market', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                              <SelectItem value="NYSE">NYSE</SelectItem>
                              <SelectItem value="NSE">NSE</SelectItem>
                              <SelectItem value="BSE">BSE</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={investment.quantity}
                            onChange={(e) => updateInvestment(index, 'quantity', e.target.value)}
                            placeholder="100"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Investment Amount (₹)</Label>
                          <Input
                            type="number"
                            value={investment.investment_amount}
                            onChange={(e) => updateInvestment(index, 'investment_amount', e.target.value)}
                            placeholder="100000"
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Purchase Date</Label>
                          <Input
                            type="date"
                            value={investment.purchase_date}
                            onChange={(e) => updateInvestment(index, 'purchase_date', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addInvestment} className="w-full">
                  + Add Another Investment
                </Button>
              </div>
            )}

            {/* Preferences Step */}
            {currentStep === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Preferred Asset Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Stocks', 'ETFs', 'Mutual Funds', 'Bonds', 'Real Estate', 'Commodities', 'Cryptocurrency'].map((type) => (
                      <Badge
                        key={type}
                        variant={preferences.asset_types.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => toggleAssetType(type)}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-base font-semibold mb-3 block">Preferred Sectors</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Energy', 'Real Estate', 'Manufacturing', 'Telecommunications', 'Utilities', 'Materials'].map((sector) => (
                      <Badge
                        key={sector}
                        variant={preferences.preferred_sectors.includes(sector) ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => toggleSector(sector)}
                      >
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'profile' || loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="btn-gradient"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === 'preferences' ? (
                  <>
                    Complete
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

