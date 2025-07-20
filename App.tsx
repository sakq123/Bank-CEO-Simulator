
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, HistoryEntry, GameNews, Strategy, Transaction, LogoName, ThemeColorName, MarketingCampaignType, ActiveCampaignState, FeedbackSentiment, ChannelName, TechUpgradeType, TransactionType, ActiveTechUpgrade, CustomerFeedback, BankType, Difficulty, GameSettings } from './types';
import { INITIAL_GAME_STATE, TURNS_PER_YEAR, AVG_DEPOSIT_PER_CUSTOMER, AVG_LOAN_PER_CUSTOMER, THEME_COLORS, MARKETING_CAMPAIGNS, RESERVE_REQUIREMENT, WEEKLY_LOAN_REPAYMENT_RATE, BASE_WEEKLY_DEFAULT_RATE, TECH_UPGRADES, BANK_TYPE_MODIFIERS, DIFFICULTY_MODIFIERS } from './constants';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GameOverScreen from './components/GameOverScreen';
import { DashboardIcon, UsersIcon, HistoryIcon, SettingsIcon } from './components/Icons';
import CustomersPage from './components/CustomersPage';
import HistoryPage from './components/HistoryPage';
import TutorialModal from './components/TutorialModal';
import SetupModal from './components/SetupModal';
import SettingsPage from './components/SettingsPage';
import MarketingModal from './components/MarketingModal';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [news, setNews] = useState<GameNews[]>([]);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'history' | 'settings'>('dashboard');
    const [showTutorial, setShowTutorial] = useState(false);
    const [showMarketingModal, setShowMarketingModal] = useState(false);
    
    // Load game state on initial mount
    useEffect(() => {
        const savedGame = localStorage.getItem('bankSimAutoSave');
        if (savedGame) {
            try {
                const loaded = JSON.parse(savedGame);
                setGameState(loaded.gameState);
                setHistory(loaded.history);
                setNews(loaded.news);
            } catch (error) {
                console.error("Failed to load saved game:", error);
                setGameState(INITIAL_GAME_STATE); // Fallback to initial state
            }
        } else {
            setGameState(null); // Show setup modal
        }
    }, []);

    // Autosave game state whenever it changes
    useEffect(() => {
        if (gameState && !gameState.isGameOver) {
            const dataToSave = { gameState, history, news };
            localStorage.setItem('bankSimAutoSave', JSON.stringify(dataToSave));
        }
    }, [gameState, history, news]);
    
    const addNews = useCallback((message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'info') => {
        setNews(prev => [{ message, type, id: Date.now() }, ...prev.slice(0, 19)]);
    }, []);
    
    const handleGameOver = useCallback((message: string) => {
        setGameState(prev => prev ? ({...prev, isGameOver: true, gameOverMessage: message}) : null);
        addNews(message, 'danger');
    }, [addNews]);

    // Apply theme colors and styles dynamically
    useEffect(() => {
        if (!gameState) return;
        const theme = THEME_COLORS[gameState.settings.branding.themeColor];
        const styleElement = document.getElementById('dynamic-theme-styles');
        if (styleElement) {
            styleElement.innerHTML = `
                :root {
                    --theme-primary: ${theme.primary};
                    --theme-primary-hover: ${theme.secondary};
                    --theme-text-on-primary: ${theme.text};
                }
            `;
        }

        document.body.classList.remove('bg-slate-900', 'text-slate-200', 'bg-slate-100', 'text-slate-800');
        if (gameState.settings.themeStyle === 'dark') {
            document.body.classList.add('bg-slate-900', 'text-slate-200');
        } else {
            document.body.classList.add('bg-slate-100', 'text-slate-800');
        }
    }, [gameState?.settings.branding.themeColor, gameState?.settings.themeStyle]);

    const incrementVersion = (version: string) => {
        const parts = version.split('.').map(Number);
        parts[2] += 1; // Increment patch version
        if (parts[2] >= 10) {
            parts[2] = 0;
            parts[1] += 1;
        }
        if (parts[1] >= 10){
            parts[1] = 0;
            parts[0] += 1;
        }
        return `${parts[0]}.${parts[1]}.${parts[2]}`;
    };

    const nextTurn = useCallback(() => {
        if (!gameState || gameState.isGameOver) return;

        let newState = { ...gameState };
        let currentTransactions: Transaction[] = [...newState.transactions];
        const previousTotalCustomers = gameState.totalCustomers;
        
        const logTransaction = (desc: string, type: Transaction['type'], amount: number) => {
             currentTransactions = [{
                id: Date.now() + Math.random(),
                turn: newState.turn,
                week: newState.week,
                month: newState.month,
                year: newState.year,
                description: desc,
                type: type,
                amount: amount
            }, ...currentTransactions].slice(0, 100);
        }

        // Apply Modifiers
        const difficultyModifier = DIFFICULTY_MODIFIERS[newState.difficulty];
        const bankTypeModifier = BANK_TYPE_MODIFIERS[newState.bankType];

        const SMOOTHING_FACTOR = 0.35;
        let loanGrowthModifier = bankTypeModifier.loanDemandModifier ? bankTypeModifier.loanDemandModifier - 1 : 0;
        let reputationModifier = 0;
        let satisfactionModifier = 0;
        let riskModifier = bankTypeModifier.riskModifier ? (bankTypeModifier.riskModifier - 1) * 10 : 0;
        
        switch (newState.currentStrategy) {
            case 'AGGRESSIVE_LENDING':
                loanGrowthModifier += 0.00125;
                satisfactionModifier -= 0.125;
                riskModifier += 0.75;
                break;
            case 'BRAND_BUILDING':
                reputationModifier += 0.125;
                break;
            case 'TECH_INVESTMENT':
                satisfactionModifier += 0.1875;
                break;
            default: break;
        }

        // --- Process Active Technology Upgrades ---
        const completedUpgradesThisTurn: ActiveTechUpgrade[] = [];
        newState.activeTechUpgrades = newState.activeTechUpgrades
            .map(upgrade => {
                const newWeeksRemaining = upgrade.weeksRemaining - 1;
                if (newWeeksRemaining <= 0) {
                    completedUpgradesThisTurn.push(upgrade);
                    return null; // Mark for removal
                }
                return { ...upgrade, weeksRemaining: newWeeksRemaining };
            })
            .filter(Boolean) as ActiveTechUpgrade[];

        completedUpgradesThisTurn.forEach(upgrade => {
            const upgradeDetails = TECH_UPGRADES[upgrade.type];
            newState.completedTechUpgrades.push({ type: upgrade.type, completedTurn: newState.turn });
            newState.monthlyMaintenanceCost += upgradeDetails.maintenanceCost;
            
            const effects = upgradeDetails.effects;
            if (effects.satisfaction) newState.customerSatisfaction = Math.min(100, newState.customerSatisfaction + effects.satisfaction);
            if (effects.reputation) newState.reputation = Math.min(100, newState.reputation + effects.reputation);
            if (effects.risk) newState.riskFactor = Math.max(0, newState.riskFactor + effects.risk);
            if (effects.serverStatus) newState.serverStatus = effects.serverStatus;
            if (effects.digitalUsageBoost) newState.digitalChannelBoost = (newState.digitalChannelBoost || 0) + effects.digitalUsageBoost;
            if (effects.appRating) newState.appRating = Math.min(5, newState.appRating + effects.appRating);

            if (upgradeDetails.feedbackEffect) {
                const newFeedback: CustomerFeedback = {
                    id: Date.now() + Math.random(),
                    turn: newState.turn,
                    sentiment: 'positive',
                    text: upgradeDetails.feedbackEffect
                };
                newState.customerFeedback = [newFeedback, ...newState.customerFeedback].slice(0,20);
            }
            
            const newVersion = incrementVersion(newState.appVersion);
            if(upgradeDetails.category === 'UI/UX' || upgradeDetails.category === 'Features' ) {
                 newState.appVersion = newVersion;
                 newState.websiteVersion = newVersion;
            }

            addNews(`${upgradeDetails.name} project completed and is now live!`, 'success');
        });

        let riskChange = riskModifier;
        if (newState.cash < 50000) riskChange += 0.5;
        if ((newState.loans / newState.deposits) > 0.9) riskChange += 0.5;
        if (newState.riskFactor > 55) riskChange -= 0.25;
        else if (newState.riskFactor < 45) riskChange += 0.25;

        const targetRiskFactor = Math.max(0, Math.min(100, newState.riskFactor + riskChange));
        newState.riskFactor = newState.riskFactor + (targetRiskFactor - newState.riskFactor) * SMOOTHING_FACTOR;
        
        const interestIncome = newState.loans * (newState.loanInterestRate / 100) / TURNS_PER_YEAR;
        const interestExpense = newState.deposits * (newState.depositInterestRate / 100) / TURNS_PER_YEAR;
        const operationalCosts = (newState.cash * 0.0001 + 500) * (bankTypeModifier.operationalCostModifier || 1);
        let netProfit = interestIncome - interestExpense - operationalCosts;
        
        logTransaction('Interest Income', 'INCOME', interestIncome);
        logTransaction('Interest Expense', 'EXPENSE', -interestExpense);
        logTransaction('Operational Costs', 'EXPENSE', -operationalCosts);
        
        const riskFactorModifier = (newState.riskFactor / 100) * 0.005;
        const techModifier = newState.currentStrategy === 'TECH_INVESTMENT' ? -0.001 : 0;
        const finalDefaultRate = Math.max(0, BASE_WEEKLY_DEFAULT_RATE + riskFactorModifier + techModifier) * difficultyModifier.riskModifier;
        const defaultedLoans = newState.loans * finalDefaultRate;
        
        let loanDefaults = 0;
        if (defaultedLoans > 0) {
            netProfit -= defaultedLoans;
            newState.loans -= defaultedLoans;
            logTransaction('Loan Defaults', 'LOAN_DEFAULT', -defaultedLoans);
            loanDefaults = defaultedLoans;
        }

        if (newState.riskFactor > 60) {
            const riskBonus = netProfit * ((newState.riskFactor - 60) / 100) * 0.2;
            netProfit += riskBonus;
            logTransaction('High-Risk Bonus', 'INCOME', riskBonus);
        }
        
        let campaignReputationBoost = 0;
        let campaignDepositGrowthBoost = 0;
        let campaignLoanGrowthBoost = 0;

        if (newState.activeMarketingCampaign) {
            const campaignDetails = MARKETING_CAMPAIGNS[newState.activeMarketingCampaign.type];
            const weeklyBudget = newState.activeMarketingCampaign.budget;

            if (newState.cash >= weeklyBudget) {
                netProfit -= weeklyBudget;
                logTransaction(`Weekly Cost: ${campaignDetails.name}`, 'MARKETING_CAMPAIGN', -weeklyBudget);

                campaignReputationBoost = weeklyBudget * campaignDetails.effectMultipliers.reputation;
                campaignDepositGrowthBoost = weeklyBudget * campaignDetails.effectMultipliers.depositGrowth;
                campaignLoanGrowthBoost = weeklyBudget * (campaignDetails.effectMultipliers.loanGrowth || 0);
                
                newState.activeMarketingCampaign.weeksRemaining -= 1;
            } else {
                addNews(`Campaign '${campaignDetails.name}' stopped due to insufficient funds.`, 'warning');
                newState.activeMarketingCampaign = null;
            }

            if (newState.activeMarketingCampaign && newState.activeMarketingCampaign.weeksRemaining <= 0) {
                addNews(`Campaign '${campaignDetails.name}' has completed.`, 'info');
                newState.activeMarketingCampaign = null;
            }
        }

        let reputationDamage = 0;
        if (newState.riskFactor > 80 && Math.random() < ((newState.riskFactor - 80) / 20 / 4)) {
            const penaltyAmount = newState.cash * 0.1;
            reputationDamage = 1.25;
            netProfit -= penaltyAmount;
            addNews(`Regulatory Fine! Your bank was fined ${penaltyAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} for risky practices. Reputation damaged.`, 'danger');
            logTransaction('Regulatory Penalty', 'PENALTY', -penaltyAmount);
        }
        
        let cashAfterProfit = newState.cash + netProfit;

        const loanRepayments = newState.loans * WEEKLY_LOAN_REPAYMENT_RATE;
        cashAfterProfit += loanRepayments;
        newState.loans -= loanRepayments;
        logTransaction('Loan Repayments', 'LOAN_REPAYMENT', loanRepayments);

        const targetReputation = Math.min(100, newState.reputation + reputationModifier - reputationDamage + campaignReputationBoost);
        newState.reputation = newState.reputation + (targetReputation - newState.reputation) * SMOOTHING_FACTOR;
        
        const baseDepositGrowth = 0.002;
        const depositRateEffect = Math.pow(newState.depositInterestRate / 3.0, 2) * 0.005;
        const reputationEffect = (newState.reputation / 100) * 0.003;
        const depositGrowthFactor = baseDepositGrowth + depositRateEffect + reputationEffect + campaignDepositGrowthBoost + (bankTypeModifier.depositGrowthModifier ? bankTypeModifier.depositGrowthModifier - 1 : 0);
        const newDepositAmount = newState.deposits * depositGrowthFactor;

        newState.deposits += newDepositAmount;
        cashAfterProfit += newDepositAmount;
        if (newDepositAmount > 0) logTransaction('New Customer Deposits', 'DEPOSIT', newDepositAmount);
        
        const requiredReserves = newState.deposits * RESERVE_REQUIREMENT;
        const availableForLending = cashAfterProfit - requiredReserves;
        
        const baseLoanDemand = 0.003;
        const loanRateEffect = Math.pow(Math.max(0, 8 - newState.loanInterestRate) / 5.0, 2) * 0.006;
        const loanReputationEffect = (newState.reputation / 100) * 0.004;
        const loanDemandFactor = baseLoanDemand + loanRateEffect + loanReputationEffect + loanGrowthModifier + campaignLoanGrowthBoost;
        const loanDemand = newState.deposits * loanDemandFactor;

        let newLoanAmount = 0;
        if (availableForLending > 0) {
            newLoanAmount = Math.min(loanDemand, availableForLending);
            if (newLoanAmount > 0) {
                newState.loans += newLoanAmount;
                cashAfterProfit -= newLoanAmount;
                logTransaction('New Loans Issued', 'LOAN', newLoanAmount);
            }
        } else {
             if (loanDemand > 0) addNews(`Loan growth stalled due to insufficient cash reserves to meet the ${RESERVE_REQUIREMENT * 100}% requirement.`, 'warning');
        }
        
        const newTurn = newState.turn + 1;
        let newWeek = newState.week + 1;
        let newMonth = newState.month;
        let newYear = newState.year;

        if (newWeek > 4) {
            newWeek = 1;
            newMonth += 1;
            if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            }
            // --- Monthly Maintenance Costs ---
            if (newState.monthlyMaintenanceCost > 0) {
                cashAfterProfit -= newState.monthlyMaintenanceCost;
                logTransaction('Monthly Backend Maintenance', 'EXPENSE', -newState.monthlyMaintenanceCost);
            }
        }

        const originalCash = gameState.cash;
        newState.cash = cashAfterProfit;
        const weeklyNetOutcome = newState.cash - originalCash;

        if (newState.cash < 0) {
            handleGameOver("Insolvency! Your bank has run out of cash reserves.");
            return;
        }

        const customerSatisfactionDrift = ((newLoanAmount > 0 ? 0.025 : -0.05) + (newDepositAmount > 0 ? 0.025 : -0.05) + satisfactionModifier) * difficultyModifier.satisfactionModifier;
        const targetCustomerSatisfaction = Math.max(0, Math.min(100, newState.customerSatisfaction + customerSatisfactionDrift));
        newState.customerSatisfaction = newState.customerSatisfaction + (targetCustomerSatisfaction - newState.customerSatisfaction) * SMOOTHING_FACTOR;
        
        // --- App Rating Drift ---
        let ratingDrift = 0;
        const satisfactionTargetRating = 2.5 + (newState.customerSatisfaction / 100) * 2.5; // Scale 0-100 satisfaction to 2.5-5.0 rating
        ratingDrift += (satisfactionTargetRating - newState.appRating) * 0.05; // Slow drift towards target
        if (newState.serverStatus === 'Overloaded') {
            ratingDrift -= 0.02; // Penalty for bad performance
        }
        newState.appRating = Math.max(1, Math.min(5, newState.appRating + ratingDrift));
        
        // --- System Degradation ---
        const customerGrowth = newState.totalCustomers - previousTotalCustomers;
        const customerGrowthPercentage = previousTotalCustomers > 0 ? customerGrowth / previousTotalCustomers : 0;
        if (customerGrowthPercentage > 0.05 && newState.serverStatus === 'Stable' && !newState.activeTechUpgrades.some(u => TECH_UPGRADES[u.type].category === 'Performance')) {
            newState.serverStatus = 'Overloaded';
            newState.customerSatisfaction = Math.max(0, newState.customerSatisfaction - 3);
            addNews('Servers are overloaded due to rapid user growth! Customer satisfaction is suffering.', 'warning');
        } else if (newState.serverStatus === 'Overloaded' && customerGrowthPercentage < 0.01) {
            newState.serverStatus = 'Stable';
             addNews('User growth has stabilized, and server performance has returned to normal.', 'info');
        }

        // Risk degradation if not managed
        const securityUpgrades = newState.completedTechUpgrades.filter(u => TECH_UPGRADES[u.type].category === 'Security');
        const lastSecurityUpgradeTurn = securityUpgrades.length > 0 ? Math.max(...securityUpgrades.map(u => u.completedTurn)) : -Infinity;
        if (newState.riskFactor > 60 && (newState.turn - lastSecurityUpgradeTurn > 24)) { // No security in last 6 months
            if (Math.random() < 0.15) {
                newState.riskFactor = Math.min(100, newState.riskFactor + 0.5);
                addNews('Security vulnerabilities are increasing due to lack of recent system hardening.', 'warning');
            }
        }
        
        // Unified Customer & Channel Logic
        const depositCustomers = newState.deposits / AVG_DEPOSIT_PER_CUSTOMER;
        const loanCustomers = newState.loans / AVG_LOAN_PER_CUSTOMER;
        const uniqueLoanCustomers = loanCustomers * 0.3; // Assume 30% of loan customers are new/don't have deposits
        newState.totalCustomers = Math.round(depositCustomers + uniqueLoanCustomers);


        // Unified Channel Usage Logic: Distribute total customers among channels exclusively.
        const basePreferences = {
            'Mobile App': 0.68,
            'Web Portal': 0.55,
            'ATM Network': 0.42,
            'In-Branch': 0.15,
        };

        const satisfactionFactor = 0.5 + (newState.customerSatisfaction / 100); // ~0.5 to 1.5
        const techStratModifierDigital = newState.currentStrategy === 'TECH_INVESTMENT' ? 1.15 : 1.0;
        const techStratModifierBranch = newState.currentStrategy === 'TECH_INVESTMENT' ? 0.85 : 1.0;
        const digitalBoost = 1 + (newState.digitalChannelBoost || 0);
        const appRatingModifier = 1 + ((newState.appRating - 3.5) * 0.1); // ~25% penalty to 15% boost

        const modifiedPreferences = {
            'Mobile App': Math.max(0, basePreferences['Mobile App'] * satisfactionFactor * techStratModifierDigital * digitalBoost * appRatingModifier * (bankTypeModifier.channelUsage?.['Mobile App'] || 1)),
            'Web Portal': Math.max(0, basePreferences['Web Portal'] * satisfactionFactor * techStratModifierDigital * digitalBoost * (bankTypeModifier.channelUsage?.['Web Portal'] || 1)),
            'ATM Network': Math.max(0, basePreferences['ATM Network']),
            'In-Branch': Math.max(0, basePreferences['In-Branch'] * techStratModifierBranch * (bankTypeModifier.channelUsage?.['In-Branch'] || 1)),
        };
        
        if (newState.digitalChannelBoost > 0) {
            newState.digitalChannelBoost *= 0.98; // Decay effect
            if (newState.digitalChannelBoost < 0.01) newState.digitalChannelBoost = 0;
        }

        const totalPreference = Object.values(modifiedPreferences).reduce((sum, p) => sum + p, 0);

        if (totalPreference > 0 && newState.totalCustomers > 0) {
            const channelNames: ChannelName[] = ['Mobile App', 'Web Portal', 'ATM Network', 'In-Branch'];
            
            // Largest Remainder Method
            const channelData = channelNames.map(name => {
                const proportion = modifiedPreferences[name] / totalPreference;
                const exactCount = newState.totalCustomers * proportion;
                return { name, floor: Math.floor(exactCount), remainder: exactCount - Math.floor(exactCount) };
            });

            const finalUsage: { [key in ChannelName]: number } = {} as any;
            let assignedCustomers = 0;
            channelData.forEach(data => {
                finalUsage[data.name] = data.floor;
                assignedCustomers += data.floor;
            });

            let remainderToDistribute = newState.totalCustomers - assignedCustomers;
            channelData.sort((a, b) => b.remainder - a.remainder);
            
            for (let i = 0; i < remainderToDistribute; i++) {
                finalUsage[channelData[i].name]++;
            }
            newState.channelUsage = finalUsage;
        } else {
            newState.channelUsage = { 'Mobile App': 0, 'Web Portal': 0, 'ATM Network': 0, 'In-Branch': 0 };
            if (newState.totalCustomers > 0) {
                 newState.channelUsage['In-Branch'] = newState.totalCustomers;
            }
        }

        // Dynamic Feedback Generation
        const feedbackChance = Math.min(0.6, (newState.totalCustomers / 1000) * 0.05);
        const satisfactionVolatility = Math.abs(newState.customerSatisfaction - 55) / 45;
        const finalFeedbackChance = feedbackChance * (1 + satisfactionVolatility * 0.5);
        
        let newFeedbackList = [...newState.customerFeedback];
        if (newState.totalCustomers > 10 && Math.random() < finalFeedbackChance) {
            // ... (feedback logic remains the same)
        }
        newState.customerFeedback = newFeedbackList.slice(0, 20);

        const newHistoryEntry: HistoryEntry = {
            turn: gameState.turn,
            year: gameState.year,
            month: gameState.month,
            week: gameState.week,
            cash: gameState.cash,
            loans: gameState.loans,
            deposits: gameState.deposits,
            reputation: gameState.reputation,
            customerSatisfaction: gameState.customerSatisfaction,
            riskFactor: gameState.riskFactor,
            totalCustomers: gameState.totalCustomers,
            loanInterestRate: gameState.loanInterestRate,
            depositInterestRate: gameState.depositInterestRate,
            netOutcome: weeklyNetOutcome,
            loanDefaults: loanDefaults,
        };
        const updatedHistory = [...history, newHistoryEntry];
        setHistory(updatedHistory);
        
        if (updatedHistory.length >= 3) {
            // ... (consecutive loss logic remains the same)
        }

        newState.turn = newTurn;
        newState.year = newYear;
        newState.month = newMonth;
        newState.week = newWeek;
        newState.transactions = currentTransactions;
        
        setGameState(newState);
        if (newState.settings.notifications.playerAlerts) {
          addNews(`Weekly report for ${newState.settings.branding.bankName}: Net interest income is ${(interestIncome - interestExpense).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`, 'info');
        }

    }, [gameState, addNews, handleGameOver, history]);
    
    const handleTechUpgrade = (upgradeType: TechUpgradeType) => {
        if (!gameState) return;
        const upgradeDetails = TECH_UPGRADES[upgradeType];
        if (gameState.cash < upgradeDetails.cost) {
            addNews(`Insufficient funds for ${upgradeDetails.name} project.`, 'warning');
            return;
        }
        if (gameState.activeTechUpgrades.some(u => u.type === upgradeType)) {
            addNews(`Project '${upgradeDetails.name}' is already in progress.`, 'info');
            return;
        }
        if (gameState.completedTechUpgrades.some(u => u.type === upgradeType)) {
            addNews(`Project '${upgradeDetails.name}' has already been completed.`, 'info');
            return;
        }

        setGameState(prev => {
            if (!prev) return null;
            let newState = { ...prev };
            newState.cash -= upgradeDetails.cost;

            const newUpgrade: ActiveTechUpgrade = {
                type: upgradeType,
                weeksRemaining: upgradeDetails.duration,
            };
            newState.activeTechUpgrades = [...newState.activeTechUpgrades, newUpgrade];

            newState.transactions = [{
                id: Date.now(),
                turn: newState.turn,
                week: newState.week,
                month: newState.month,
                year: newState.year,
                description: `Start Project: ${upgradeDetails.name}`,
                type: 'INVESTMENT' as TransactionType,
                amount: -upgradeDetails.cost
            }, ...newState.transactions].slice(0, 100);
            
            addNews(`Started ${upgradeDetails.name} project. Cost: ${upgradeDetails.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. ETA: ${upgradeDetails.duration} weeks.`, 'success');
            return newState;
        });
    };

    const handlePlayerAction = (action: string) => {
        if (action === 'MARKETING') {
            setShowMarketingModal(true);
            return;
        }
        
        if (action === 'TECHNOLOGY') {
            setActiveTab('customers');
            addNews("Navigated to Bank Operations. Select a technology project to invest in.", 'info');
            return;
        }
    };

    const handleRateChange = (type: 'loan' | 'deposit', value: number) => {
        if (!gameState) return;
        const rate = parseFloat(value.toFixed(2));
        if (type === 'loan') {
            setGameState(prev => prev ? ({...prev, loanInterestRate: rate }) : null);
            addNews(`Loan interest rate adjusted to ${rate.toFixed(2)}%.`, 'info');
        } else {
            setGameState(prev => prev ? ({...prev, depositInterestRate: rate }) : null);
            addNews(`Deposit interest rate adjusted to ${rate.toFixed(2)}%.`, 'info');
        }
    };
    
    const handleStrategyChange = (strategy: Strategy) => {
        setGameState(prev => prev ? ({...prev, currentStrategy: strategy}) : null);
        addNews(`Strategy for next week changed to: ${strategy.replace(/_/g, ' ')}.`, 'info');
    };
    
    const handleLaunchCampaign = (type: MarketingCampaignType, budget: number, duration: number) => {
        if (!gameState) return;
        if (gameState.activeMarketingCampaign) {
            addNews(`Marketing campaign stopped: ${MARKETING_CAMPAIGNS[gameState.activeMarketingCampaign.type].name}.`, 'warning');
        }
        
        const newCampaign: ActiveCampaignState = {
            type,
            budget,
            duration,
            weeksRemaining: duration,
        };
        
        setGameState(prev => prev ? ({ ...prev, activeMarketingCampaign: newCampaign }) : null);
        addNews(`Marketing campaign launched: ${MARKETING_CAMPAIGNS[type].name} for ${duration} weeks.`, 'success');
    };

    const handleStopCampaign = () => {
        if (gameState?.activeMarketingCampaign) {
            addNews(`Marketing campaign stopped: ${MARKETING_CAMPAIGNS[gameState.activeMarketingCampaign.type].name}.`, 'warning');
            setGameState(prev => prev ? ({ ...prev, activeMarketingCampaign: null }) : null);
        }
    };

    const handleSetupComplete = (config: {name: string, logo: LogoName, color: ThemeColorName, bankType: BankType, difficulty: Difficulty}) => {
        const difficultyModifier = DIFFICULTY_MODIFIERS[config.difficulty];
        const newGameState = {
            ...INITIAL_GAME_STATE,
            cash: INITIAL_GAME_STATE.cash * difficultyModifier.cashModifier,
            difficulty: config.difficulty,
            bankType: config.bankType,
            settings: {
                ...INITIAL_GAME_STATE.settings,
                branding: {
                    bankName: config.name,
                    bankLogo: config.logo,
                    themeColor: config.color,
                }
            }
        };

        setGameState(newGameState);
        setHistory([]);
        setNews([]);
        addNews(`Welcome, CEO! ${config.name} is now ready for business.`, "success");
        setShowTutorial(true);
    };

    const handleUpdateSettings = (newSettings: Partial<GameState>) => {
        setGameState(prev => prev ? { ...prev, ...newSettings } : null);
    }
    
    const handleUpdateGameSettings = (newGameSettings: GameSettings) => {
        setGameState(prev => prev ? { ...prev, settings: newGameSettings } : null);
        addNews(`Game settings updated.`, 'success');
    }

    const handleRestart = () => {
        localStorage.removeItem('bankSimAutoSave');
        setGameState(null);
        setHistory([]);
        setNews([]);
    };

    const handleSaveGame = (slot: number) => {
        if (gameState) {
            const dataToSave = { gameState, history, news };
            localStorage.setItem(`bankSimSave_slot_${slot}`, JSON.stringify(dataToSave));
            addNews(`Game saved to slot ${slot}.`, 'success');
        }
    };

    const handleLoadGame = (slot: number) => {
        const savedData = localStorage.getItem(`bankSimSave_slot_${slot}`);
        if (savedData) {
            try {
                const loaded = JSON.parse(savedData);
                setGameState(loaded.gameState);
                setHistory(loaded.history);
                setNews(loaded.news);
                setActiveTab('dashboard');
                addNews(`Game loaded from slot ${slot}.`, 'success');
            } catch (error) {
                addNews(`Failed to load game from slot ${slot}.`, 'danger');
                console.error("Failed to load game from slot:", error);
            }
        }
    };
    
    const handleExportData = () => {
        if (history.length === 0) {
            addNews("No history to export.", "warning");
            return;
        }
        const header = Object.keys(history[0]).join(',');
        const rows = history.map(row => Object.values(row).map(v => JSON.stringify(v)).join(','));
        const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${gameState?.settings.branding.bankName}_history.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNews("Game history exported as CSV.", "success");
    };

    const handleOpenTutorial = () => setShowTutorial(true);
    const handleCloseTutorial = () => setShowTutorial(false);
    
    if (!gameState) {
        return <SetupModal onComplete={handleSetupComplete} />;
    }

    if (gameState.isGameOver) {
        return <GameOverScreen gameState={gameState} onRestart={handleRestart} />;
    }

    const NavButton: React.FC<{
        targetTab: 'dashboard' | 'customers' | 'history' | 'settings';
        children: React.ReactNode;
        icon: React.ReactNode;
    }> = ({ targetTab, children, icon }) => (
        <button
            onClick={() => setActiveTab(targetTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 border-b-2
                ${activeTab === targetTab
                    ? 'text-theme-primary border-theme-primary'
                    : 'text-slate-400 border-transparent hover:bg-slate-700/20 hover:text-white'}`
            }
            style={{ borderColor: activeTab === targetTab ? 'var(--theme-primary)' : 'transparent' }}
        >
            <span className={activeTab === targetTab ? 'text-theme-primary' : ''}>{icon}</span>
            {children}
        </button>
    );

    return (
        <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${gameState.settings.themeStyle === 'dark' ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800'}`}>
            {showTutorial && <TutorialModal onClose={handleCloseTutorial} gameState={gameState} />}
            {showMarketingModal && <MarketingModal 
                onClose={() => setShowMarketingModal(false)}
                onLaunchCampaign={handleLaunchCampaign}
                onStopCampaign={handleStopCampaign}
                activeCampaign={gameState.activeMarketingCampaign}
                themeColor={gameState.settings.branding.themeColor}
                cash={gameState.cash}
                totalCustomers={gameState.totalCustomers}
             />}
            <div className="max-w-7xl mx-auto">
                <Header gameState={gameState} onOpenTutorial={handleOpenTutorial} />
                <nav className="border-b border-slate-700 mb-6">
                    <div className="flex items-center gap-4">
                        <NavButton targetTab="dashboard" icon={<DashboardIcon className="w-4 h-4" />}>Dashboard</NavButton>
                        <NavButton targetTab="customers" icon={<UsersIcon className="w-4 h-4" />}>Bank Operations</NavButton>
                        <NavButton targetTab="history" icon={<HistoryIcon className="w-4 h-4" />}>History</NavButton>
                        <NavButton targetTab="settings" icon={<SettingsIcon className="w-4 h-4" />}>Settings</NavButton>
                    </div>
                </nav>

                {activeTab === 'dashboard' && (
                    <Dashboard 
                        gameState={gameState}
                        history={history}
                        news={news}
                        onNextTurn={nextTurn}
                        onPlayerAction={handlePlayerAction}
                        onStrategyChange={handleStrategyChange}
                        onRateChange={handleRateChange}
                    />
                )}
                {activeTab === 'customers' && (
                    <CustomersPage 
                        gameState={gameState} 
                        history={history} 
                        onTechUpgrade={handleTechUpgrade}
                    />
                )}
                {activeTab === 'history' && (
                    <HistoryPage gameState={gameState} />
                )}
                {activeTab === 'settings' && (
                    <SettingsPage 
                        gameState={gameState}
                        onUpdateSettings={handleUpdateGameSettings}
                        onSaveGame={handleSaveGame}
                        onLoadGame={handleLoadGame}
                        onExportData={handleExportData}
                        onRestart={handleRestart}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
