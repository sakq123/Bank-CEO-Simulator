export type Strategy = 'BALANCED' | 'AGGRESSIVE_LENDING' | 'BRAND_BUILDING' | 'TECH_INVESTMENT';

export type MarketingCampaignType = 'SOCIAL_MEDIA_BLITZ' | 'REFERRAL_BONUS' | 'TV_COMMERCIALS' | 'BILLBOARD_ADVERTISING';

export type TechUpgradeCategory = 'UI/UX' | 'Performance' | 'Features' | 'Security';

export type TechUpgradeType =
  // UI/UX
  | 'THEME_UPDATE'
  | 'NAVIGATION_REDESIGN'
  | 'ACCESSIBILITY_IMPROVEMENTS'
  // Performance
  | 'SERVER_OPTIMIZATION'
  | 'CDN_INTEGRATION'
  // Features
  | 'MOBILE_CHECK_DEPOSIT'
  | 'BUDGET_TOOLS'
  // Security
  | 'MFA_IMPLEMENTATION'
  | 'ADVANCED_ENCRYPTION';


export interface MarketingCampaign {
    id: MarketingCampaignType;
    name: string;
    description: string;
    // Effects are now multipliers to be scaled by the weekly budget
    effectMultipliers: {
        depositGrowth: number;
        reputation: number;
        loanGrowth?: number;
        customerGrowth?: number;
    };
}

export interface ActiveCampaignState {
    type: MarketingCampaignType;
    budget: number;
    duration: number; // in weeks
    weeksRemaining: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'DEPOSIT' | 'LOAN' | 'PENALTY' | 'MARKETING_CAMPAIGN' | 'LOAN_REPAYMENT' | 'LOAN_DEFAULT';

export type LogoName = 'Vault' | 'MoneyBag' | 'Card' | 'Handshake' | 'Dollar' | 'Building';

export type ThemeColorName = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gold' | 'black' | 'white';

export type ThemeStyle = 'dark' | 'light';

export type BankType = 'RETAIL' | 'DIGITAL' | 'INVESTMENT';

export type Difficulty = 'NORMAL' | 'HARDCORE' | 'SANDBOX';

export interface Transaction {
    id: number;
    turn: number;
    week: number;
    month: number;
    year: number;
    description: string;
    type: TransactionType;
    amount: number;
}

export type FeedbackSentiment = 'positive' | 'negative' | 'neutral';
export type ChannelName = 'Web Portal' | 'Mobile App' | 'ATM Network' | 'In-Branch';

export interface CustomerFeedback {
    id: number;
    turn: number;
    sentiment: FeedbackSentiment;
    text: string;
}

export interface ActiveTechUpgrade {
    type: TechUpgradeType;
    weeksRemaining: number;
}

export interface CompletedTechUpgrade {
    type: TechUpgradeType;
    completedTurn: number;
}

export interface GameSettings {
    themeStyle: ThemeStyle;
    simulationSpeed: 'NORMAL' | 'FAST' | 'REALTIME';
    reportStyle: 'BRIEF' | 'DETAILED';
    notifications: {
        systemAlerts: boolean;
        playerAlerts: boolean;
    };
    branding: {
        bankName: string;
        bankLogo: LogoName;
        themeColor: ThemeColorName;
    }
}

export interface GameState {
    cash: number;
    loans: number;
    deposits: number;
    reputation: number;
    customerSatisfaction: number;
    riskFactor: number;
    totalCustomers: number;
    loanInterestRate: number;
    depositInterestRate: number;
    year: number;
    month: number;
    week: number;
    turn: number;
    isGameOver: boolean;
    gameOverMessage: string;
    currentStrategy: Strategy;
    transactions: Transaction[];
    activeMarketingCampaign: ActiveCampaignState | null;
    customerFeedback: CustomerFeedback[];
    channelUsage: { [key in ChannelName]: number };
    appRating: number;
    appVersion: string;
    websiteVersion: string;
    serverStatus: 'Optimal' | 'Stable' | 'Overloaded';
    activeTechUpgrades: ActiveTechUpgrade[];
    completedTechUpgrades: CompletedTechUpgrade[];
    monthlyMaintenanceCost: number;
    digitalChannelBoost: number;
    bankType: BankType;
    difficulty: Difficulty;
    settings: GameSettings;
}

export interface HistoryEntry {
    turn: number;
    year: number;
    month: number;
    week: number;
    cash: number;
    loans: number;
    deposits: number;
    reputation: number;
    customerSatisfaction: number;
    riskFactor: number;
    totalCustomers: number;
    loanInterestRate: number;
    depositInterestRate: number;
    netOutcome: number;
    loanDefaults: number;
}

export interface GameNews {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'info' | 'danger';
}

export interface TutorialStep {
    icon: React.FC<any>;
    title: string;
    content: string;
}