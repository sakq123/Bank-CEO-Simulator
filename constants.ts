

import { GameState, Strategy, TutorialStep, ThemeColorName, LogoName, MarketingCampaign, MarketingCampaignType, CustomerFeedback, ChannelName, TechUpgradeType, ActiveTechUpgrade, CompletedTechUpgrade, TechUpgradeCategory, BankType, Difficulty } from './types';
import { 
    BalancedIcon, LoanIcon, ReputationIcon, TechIcon, CashIcon, RiskIcon, RateIcon, UsersIcon, StrategyIcon,
    VaultIcon, MoneyBagIcon, CardIcon, HandshakeIcon, DollarIcon, BuildingIcon, ServerIcon, PaintBrushIcon, CodeIcon, ShieldIcon, ClipboardListIcon,
    StarFullIcon, StarHalfIcon,
} from './components/Icons';

export const TURNS_PER_YEAR = 48; // 4 weeks per month * 12 months

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

// Helper function to calculate initial channel usage
const calculateInitialChannelUsage = (totalCustomers: number, customerSatisfaction: number, strategy: Strategy): { [key in ChannelName]: number } => {
    const basePreferences = {
        'Mobile App': 0.68,
        'Web Portal': 0.55,
        'ATM Network': 0.42,
        'In-Branch': 0.15,
    };

    const satisfactionFactor = 0.5 + (customerSatisfaction / 100);
    const techStratModifierDigital = strategy === 'TECH_INVESTMENT' ? 1.15 : 1.0;
    const techStratModifierBranch = strategy === 'TECH_INVESTMENT' ? 0.85 : 1.0;

    const modifiedPreferences = {
        'Mobile App': Math.max(0, basePreferences['Mobile App'] * satisfactionFactor * techStratModifierDigital),
        'Web Portal': Math.max(0, basePreferences['Web Portal'] * satisfactionFactor * techStratModifierDigital),
        'ATM Network': Math.max(0, basePreferences['ATM Network']),
        'In-Branch': Math.max(0, basePreferences['In-Branch'] * techStratModifierBranch),
    };

    const totalPreference = Object.values(modifiedPreferences).reduce((sum, p) => sum + p, 0);
    const finalUsage: { [key in ChannelName]: number } = {
        'Mobile App': 0,
        'Web Portal': 0,
        'ATM Network': 0,
        'In-Branch': 0,
    };

    if (totalPreference > 0 && totalCustomers > 0) {
        const channelNames: ChannelName[] = ['Mobile App', 'Web Portal', 'ATM Network', 'In-Branch'];

        const channelData = channelNames.map(name => {
            const proportion = modifiedPreferences[name] / totalPreference;
            const exactCount = totalCustomers * proportion;
            return {
                name,
                floor: Math.floor(exactCount),
                remainder: exactCount - Math.floor(exactCount)
            };
        });

        let assignedCustomers = 0;
        channelData.forEach(data => {
            finalUsage[data.name] = data.floor;
            assignedCustomers += data.floor;
        });

        let remainderToDistribute = totalCustomers - assignedCustomers;
        channelData.sort((a, b) => b.remainder - a.remainder);

        for (let i = 0; i < remainderToDistribute; i++) {
            finalUsage[channelData[i].name]++;
        }
    } else if (totalCustomers > 0) {
        finalUsage['In-Branch'] = totalCustomers;
    }

    return finalUsage;
};


// --- Financial Model Constants ---
export const RESERVE_REQUIREMENT = 0.10; // 10%
export const WEEKLY_LOAN_REPAYMENT_RATE = 0.02; // 2% of total loans are repaid each week
export const BASE_WEEKLY_DEFAULT_RATE = 0.001; // 0.1% base weekly default rate

// --- Customer Model Constants ---
export const AVG_DEPOSIT_PER_CUSTOMER = 1000;
export const AVG_LOAN_PER_CUSTOMER = 5000;
const INITIAL_DEPOSIT_CUSTOMERS = 450000 / AVG_DEPOSIT_PER_CUSTOMER;
const INITIAL_LOAN_CUSTOMERS = 400000 / AVG_LOAN_PER_CUSTOMER;
const INITIAL_UNIQUE_LOAN_CUSTOMERS = INITIAL_LOAN_CUSTOMERS * 0.3; // Assume 70% of loan holders also have deposits
const INITIAL_TOTAL_CUSTOMERS = Math.round(INITIAL_DEPOSIT_CUSTOMERS + INITIAL_UNIQUE_LOAN_CUSTOMERS);
const INITIAL_SATISFACTION = 50;
const INITIAL_STRATEGY: Strategy = 'BALANCED';

export const INITIAL_GAME_STATE: GameState = {
    cash: 100000, // $100k
    loans: 400000, // $400k
    deposits: 450000, // $450k
    reputation: 40, // out of 100
    customerSatisfaction: INITIAL_SATISFACTION, // out of 100
    riskFactor: 40, // out of 100
    totalCustomers: INITIAL_TOTAL_CUSTOMERS,
    loanInterestRate: 5.5, // percentage
    depositInterestRate: 2.5, // percentage
    year: 2024,
    month: 1,
    week: 1,
    turn: 0,
    isGameOver: false,
    gameOverMessage: '',
    currentStrategy: INITIAL_STRATEGY,
    transactions: [],
    activeMarketingCampaign: null,
    customerFeedback: [],
    channelUsage: calculateInitialChannelUsage(INITIAL_TOTAL_CUSTOMERS, INITIAL_SATISFACTION, INITIAL_STRATEGY),
    appRating: 4.2,
    appVersion: '1.0.0',
    websiteVersion: '1.0.0',
    serverStatus: 'Stable',
    activeTechUpgrades: [],
    completedTechUpgrades: [],
    monthlyMaintenanceCost: 0,
    digitalChannelBoost: 0,
    bankType: 'RETAIL',
    difficulty: 'NORMAL',
    settings: {
        themeStyle: 'dark',
        simulationSpeed: 'NORMAL',
        reportStyle: 'BRIEF',
        notifications: {
            systemAlerts: true,
            playerAlerts: true,
        },
        branding: {
            bankName: 'Pioneer Financial',
            bankLogo: 'Vault',
            themeColor: 'blue',
        }
    }
};

export const DIFFICULTY_MODIFIERS: { [key in Difficulty]: { cashModifier: number; riskModifier: number; satisfactionModifier: number; } } = {
    NORMAL:   { cashModifier: 1,    riskModifier: 1,    satisfactionModifier: 1 },
    HARDCORE: { cashModifier: 0.5,  riskModifier: 1.25, satisfactionModifier: 0.8 },
    SANDBOX:  { cashModifier: 5,    riskModifier: 0.5,  satisfactionModifier: 1.2 },
};

export const BANK_TYPE_MODIFIERS: { [key in BankType]: { channelUsage?: { [key in ChannelName]?: number }; operationalCostModifier?: number; riskModifier?: number; loanDemandModifier?: number; depositGrowthModifier?: number; } } = {
    RETAIL:     { channelUsage: { 'In-Branch': 1.2, 'Mobile App': 0.9 }, operationalCostModifier: 1.1 },
    DIGITAL:    { channelUsage: { 'In-Branch': 0.5, 'Mobile App': 1.25, 'Web Portal': 1.15 }, operationalCostModifier: 0.8 },
    INVESTMENT: { riskModifier: 1.15, loanDemandModifier: 1.2, depositGrowthModifier: 0.9 },
};


// --- Customer Demographics ---
export const AGE_DISTRIBUTION: { [key: string]: number } = {
    'ALL': 1.0,
    '18-25': 0.20,
    '26-40': 0.35,
    '41-65': 0.30,
    '65+': 0.15
};

export const REGION_DISTRIBUTION: { [key: string]: number } = {
    'ALL': 1.0,
    'North': 0.25,
    'South': 0.25,
    'East': 0.25,
    'West': 0.25
};

export const MARKETING_CAMPAIGNS: { [key in MarketingCampaignType]: MarketingCampaign } = {
    SOCIAL_MEDIA_BLITZ: {
        id: 'SOCIAL_MEDIA_BLITZ',
        name: 'Social Media Blitz',
        description: 'Boosts new customers and deposits, especially from young customers.',
        effectMultipliers: {
            depositGrowth: 0.00001,
            reputation: 0.00002,
            customerGrowth: 0.015,
        },
    },
    REFERRAL_BONUS: {
        id: 'REFERRAL_BONUS',
        name: 'Referral Bonus Program',
        description: 'Encourages existing customers to invite new users, steadily increasing both deposits and loans.',
        effectMultipliers: {
            depositGrowth: 0.00002,
            loanGrowth: 0.00001,
            reputation: 0,
            customerGrowth: 0.02,
        },
    },
    TV_COMMERCIALS: {
        id: 'TV_COMMERCIALS',
        name: 'TV Commercials',
        description: 'Strong brand awareness campaign to increase customer trust and deposits over time.',
        effectMultipliers: {
            depositGrowth: 0.00005,
            reputation: 0.0001,
            customerGrowth: 0.005,
        },
    },
    BILLBOARD_ADVERTISING: {
        id: 'BILLBOARD_ADVERTISING',
        name: 'Billboard Advertising',
        description: 'Minor but steady customer growth boost at a low cost.',
        effectMultipliers: {
            depositGrowth: 0,
            reputation: 0.00001,
            customerGrowth: 0.008,
        },
    },
};

interface TechUpgrade {
    name: string;
    description: string;
    category: TechUpgradeCategory;
    cost: number;
    icon: React.FC<any>;
    effects: {
        satisfaction?: number;
        reputation?: number;
        risk?: number;
        serverStatus?: 'Optimal' | 'Stable';
        digitalUsageBoost?: number;
        appRating?: number;
    };
    duration: number; // weeks
    maintenanceCost: number; // monthly
    feedbackEffect: string;
}

export const TECH_UPGRADES: { [key in TechUpgradeType]: TechUpgrade } = {
    // UI/UX
    THEME_UPDATE: {
        name: 'UI Theme Update',
        description: 'Refresh the app and website with a modern color palette and new icons.',
        category: 'UI/UX',
        cost: 7500,
        icon: PaintBrushIcon,
        effects: { satisfaction: 2, appRating: 0.2 },
        duration: 2,
        maintenanceCost: 150,
        feedbackEffect: "The new app theme looks so much cleaner! A nice refresh."
    },
    NAVIGATION_REDESIGN: {
        name: 'Navigation Redesign',
        description: 'Streamline menus and workflows to make the app easier to use.',
        category: 'UI/UX',
        cost: 15000,
        icon: PaintBrushIcon,
        effects: { satisfaction: 4, appRating: 0.3 },
        duration: 4,
        maintenanceCost: 300,
        feedbackEffect: "It's so much easier to find what I need in the app now. Great update!"
    },
    ACCESSIBILITY_IMPROVEMENTS: {
        name: 'Accessibility Improvements',
        description: 'Improve support for screen readers and add high-contrast modes.',
        category: 'UI/UX',
        cost: 12000,
        icon: PaintBrushIcon,
        effects: { reputation: 3, satisfaction: 1, appRating: 0.1 },
        duration: 3,
        maintenanceCost: 100,
        feedbackEffect: "I appreciate the bank making the app accessible for everyone."
    },
    // Performance
    SERVER_OPTIMIZATION: {
        name: 'Server Optimization',
        description: 'Upgrade server hardware to improve speed, reliability, and capacity.',
        category: 'Performance',
        cost: 25000,
        icon: ServerIcon,
        effects: { satisfaction: 3, serverStatus: 'Optimal', appRating: 0.1 },
        duration: 4,
        maintenanceCost: 500,
        feedbackEffect: "The app feels much faster and more responsive lately."
    },
    CDN_INTEGRATION: {
        name: 'CDN Integration',
        description: 'Use a Content Delivery Network to speed up load times for users far from our servers.',
        category: 'Performance',
        cost: 18000,
        icon: ServerIcon,
        effects: { satisfaction: 2 },
        duration: 3,
        maintenanceCost: 400,
        feedbackEffect: "Website loading times have improved noticeably. Good job."
    },
    // Features
    MOBILE_CHECK_DEPOSIT: {
        name: 'Mobile Check Deposit',
        description: 'Allow users to deposit checks by taking a photo with their phone.',
        category: 'Features',
        cost: 40000,
        icon: CodeIcon,
        effects: { satisfaction: 5, digitalUsageBoost: 0.10, appRating: 0.4 },
        duration: 5,
        maintenanceCost: 750,
        feedbackEffect: "Mobile check deposit is a game-changer! Saves me so much time."
    },
    BUDGET_TOOLS: {
        name: 'Budgeting Tools',
        description: 'Add tools for users to track their spending and set savings goals.',
        category: 'Features',
        cost: 35000,
        icon: CodeIcon,
        effects: { satisfaction: 4, digitalUsageBoost: 0.05, appRating: 0.3 },
        duration: 4,
        maintenanceCost: 600,
        feedbackEffect: "The new budgeting tools are helping me manage my finances better."
    },
    // Security
    MFA_IMPLEMENTATION: {
        name: 'Multi-Factor Authentication',
        description: 'Implement two-factor authentication for a significant security boost.',
        category: 'Security',
        cost: 30000,
        icon: ShieldIcon,
        effects: { risk: -5, reputation: 2, satisfaction: 1 },
        duration: 4,
        maintenanceCost: 600,
        feedbackEffect: "I feel much more secure with multi-factor authentication enabled."
    },
    ADVANCED_ENCRYPTION: {
        name: 'Advanced Encryption',
        description: 'Upgrade to the latest encryption standards to protect user data.',
        category: 'Security',
        cost: 22000,
        icon: ShieldIcon,
        effects: { risk: -3, reputation: 1 },
        duration: 3,
        maintenanceCost: 450,
        feedbackEffect: "Glad to see the bank is taking data security seriously."
    }
};


export const PLANNED_FEATURES: string[] = [
    "AI-Powered Financial Advisor",
    "Integrated Stock Trading Platform",
    "Peer-to-Peer (P2P) Payments",
    "Cryptocurrency Wallets",
    "Automated Savings Goals",
];


export const STRATEGIES: { [key in Strategy]: { name: string; description: string; icon: React.FC<any> } } = {
    BALANCED: {
        name: 'Balanced',
        description: 'A stable approach focusing on steady, overall growth.',
        icon: BalancedIcon,
    },
    AGGRESSIVE_LENDING: {
        name: 'Aggressive Lending',
        description: 'Focus on expanding the loan portfolio, accepting higher risk for potential higher returns.',
        icon: LoanIcon,
    },
    BRAND_BUILDING: {
        name: 'Brand Building',
        description: 'Invest in marketing and public relations to boost reputation and attract customers.',
        icon: ReputationIcon,
    },
    TECH_INVESTMENT: {
        name: 'Tech Investment',
        description: 'Focus on technological innovation to improve customer satisfaction and efficiency.',
        icon: TechIcon,
    },
};

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        icon: BalancedIcon,
        title: "Welcome to Bank CEO Simulator!",
        content: "Your goal is to grow your new bank into a financial powerhouse. You'll manage finances, strategy, and customer relations. Every decision matters. Let's walk through the basics."
    },
    {
        icon: CashIcon,
        title: "Core Metrics: The Big Three",
        content: "Your dashboard shows your bank's health. Cash is your lifeblood. Loans generate income, and Deposits provide the funds to lend. Keep these balanced to avoid insolvency!"
    },
    {
        icon: ReputationIcon,
        title: "Reputation & Satisfaction",
        content: "These metrics drive user growth. Higher reputation attracts new clients, while high satisfaction keeps them happy. Invest in marketing and tech to boost them."
    },
    {
        icon: RiskIcon,
        title: "The Risk Factor",
        content: "This measures how risky your policies are. Aggressive strategies increase risk and can boost profits, but if it gets too high, you face regulatory fines and reputation damage. Keep it in check!"
    },
    {
        icon: RateIcon,
        title: "Interest Rates",
        content: "Adjust loan and deposit rates using the sliders. Lower loan rates attract more borrowers. Higher deposit rates attract more savers. Use the 'Rec:' hint for guidance."
    },
    {
        icon: StrategyIcon,
        title: "Weekly Strategy",
        content: "Choose a strategy each week to get minor bonuses. 'Aggressive Lending' grows loans faster but adds risk. 'Brand Building' boosts reputation. Experiment to see what works best for your goals."
    },
    {
        icon: UsersIcon,
        title: "User Growth",
        content: "Your total number of users is tied directly to your loan and deposit volume. Happy, satisfied users are the key to sustainable growth. Check the 'Bank Operations' tab for details on demographics and channel usage."
    },
    {
        icon: TechIcon,
        title: "Bank Operations",
        content: "The 'Bank Operations' tab is your command center for user-facing systems. Here you can analyze user segments, see how they interact with your bank, and invest in technology upgrades to improve their experience."
    },
    {
        icon: BalancedIcon, // Using balanced as a chart-like icon
        title: "Performance Graph",
        content: "The main chart tracks your Cash, Loans, and Deposits over time. The colored areas underneath show growth (green) or decline (red) since the last week, giving you a quick visual summary of your progress."
    },
    {
        icon: StrategyIcon,
        title: "Roadmap to Early Success",
        content: "For a strong start, keep your Risk Factor below 30%. Focus on growing Deposits with attractive rates. Use Marketing and Tech investments to boost Reputation and Satisfaction. Adapt your Weekly Strategy to your current needs — for example, choose 'Tech Investment' if satisfaction is low. A balanced approach is key!"
    },
    {
        icon: BalancedIcon,
        title: "You're Ready, CEO!",
        content: "That's the rundown. The rest is up to you. Pay attention to the news feed for updates. Good luck building your empire!"
    }
];

// --- Customization Constants ---
export const THEME_COLORS: { [key in ThemeColorName]: { name: string; primary: string; secondary: string; text: string; } } = {
    blue: { name: "Ocean Blue", primary: '#38bdf8', secondary: '#0ea5e9', text: '#0f172a'}, // light-blue-400, sky-500
    green: { name: "Emerald Green", primary: '#34d399', secondary: '#10b981', text: '#064e3b'}, // emerald-400, emerald-500
    red: { name: "Crimson Red", primary: '#f87171', secondary: '#ef4444', text: '#7f1d1d'}, // red-400, red-500
    orange: { name: "Sunset Orange", primary: '#fb923c', secondary: '#f97316', text: '#7c2d12'}, // orange-400, orange-500
    purple: { name: "Royal Purple", primary: '#a78bfa', secondary: '#8b5cf6', text: '#4c1d95'}, // violet-400, violet-500
    gold: { name: "Gold", primary: '#facc15', secondary: '#eab308', text: '#713f12'}, // yellow-400, yellow-500
    black: { name: "Monochrome", primary: '#64748b', secondary: '#475569', text: '#f1f5f9'}, // slate-500, slate-600
    white: { name: "Minimalist", primary: '#e2e8f0', secondary: '#cbd5e1', text: '#1e293b'}, // slate-200, slate-300
};

export const LOGOS: { [key in LogoName]: { name: string; icon: React.FC<any> } } = {
    Vault: { name: "Secure Vault", icon: VaultIcon },
    MoneyBag: { name: "Capital Bag", icon: MoneyBagIcon },
    Card: { name: "Modern Card", icon: CardIcon },
    Handshake: { name: "Trust Partnership", icon: HandshakeIcon },
    Dollar: { name: "Currency Symbol", icon: DollarIcon },
    Building: { name: "Prestige Building", icon: BuildingIcon },
};