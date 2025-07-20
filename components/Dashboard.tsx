
import React from 'react';
import { GameState, HistoryEntry, GameNews, Strategy } from '../types';
import StatCard from './StatCard';
import ActionPanel from './ActionPanel';
import NewsFeed from './NewsFeed';
import PerformanceChart from './PerformanceChart';
import { CashIcon, LoanIcon, DepositIcon, ReputationIcon, SatisfactionIcon, RiskIcon, CalculatorIcon } from './Icons';
import { THEME_COLORS, TURNS_PER_YEAR, BASE_WEEKLY_DEFAULT_RATE } from '../constants';

interface DashboardProps {
    gameState: GameState;
    history: HistoryEntry[];
    news: GameNews[];
    onNextTurn: () => void;
    onPlayerAction: (action: string) => void;
    onStrategyChange: (strategy: Strategy) => void;
    onRateChange: (type: 'loan' | 'deposit', value: number) => void;
}

const getRateRecommendations = (gameState: GameState, history: HistoryEntry[]) => {
    // Helper for trend analysis
    const calculateTrend = (data: number[]): number => {
        const n = data.length;
        if (n < 2) return 0;
        let sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;
        for (let i = 0; i < n; i++) {
            const x = i;
            const y = data[i];
            sum_x += x;
            sum_y += y;
            sum_xy += x * y;
            sum_xx += x * x;
        }
        const numerator = n * sum_xy - sum_x * sum_y;
        const denominator = n * sum_xx - sum_x * sum_x;
        if (denominator === 0) return 0;
        return numerator / denominator;
    };

    if (history.length < 2) {
        return {
            recommendedLoan: { rate: 5.5, reason: "A balanced base rate to start. Analysis will begin next week." },
            recommendedDeposit: { rate: 2.5, reason: "A standard rate to maintain deposit levels." }
        };
    }

    const { currentStrategy, customerSatisfaction, riskFactor, loanInterestRate, depositInterestRate, loans, cash, deposits } = gameState;
    const fullHistory = [...history, { ...gameState, netOutcome: 0, loanDefaults: 0, turn: gameState.turn + 1 }]; // Add current state for complete picture
    
    // --- Data Extraction & Trend Analysis ---
    const last5Weeks = fullHistory.slice(-5);
    const last3Weeks = fullHistory.slice(-3);
    
    const weeklyNetOutcomes = last5Weeks.map(w => w.netOutcome);
    const loanToDepositRatio = last3Weeks.map(w => w.deposits > 0 ? w.loans / w.deposits : 1);
    const customerCounts = last3Weeks.map(w => w.totalCustomers);
    const lastWeekDefaults = last5Weeks[last5Weeks.length-1].loanDefaults;

    const netOutcomeTrend = calculateTrend(weeklyNetOutcomes);
    const customerGrowthTrend = calculateTrend(customerCounts);
    
    const lastWeekNetOutcome = weeklyNetOutcomes[weeklyNetOutcomes.length - 1] || 0;
    const lastLDRatio = loanToDepositRatio[loanToDepositRatio.length - 1] || 1;

    // --- Recommendation Logic ---
    let loanRate = loanInterestRate;
    let depositRate = depositInterestRate;
    let loanReasons: string[] = [];
    let depositReasons: string[] = [];

    // Loan Rate Logic
    if (netOutcomeTrend < -100) { // If profit is consistently falling
        loanRate += 0.25;
        loanReasons.push("a declining profit trend");
    }
    if (lastWeekDefaults > (loans * 0.005)) { // If defaults are higher than 0.5% of total loans
        loanRate += 0.25;
        loanReasons.push("an increase in loan defaults");
    }
    if (lastLDRatio > 0.9) { 
        loanRate += 0.125;
        loanReasons.push("a high loan-to-deposit ratio");
    }
    if (customerGrowthTrend < 1 && customerSatisfaction < 60) {
        loanRate -= 0.125;
        loanReasons.push("stalling customer growth");
    }
    if (riskFactor > 70) {
        loanRate += 0.25;
        loanReasons.push("a high risk factor");
    }
    if (currentStrategy === 'AGGRESSIVE_LENDING') {
        loanRate -= 0.125;
        loanReasons.push("an 'Aggressive Lending' strategy");
    }

    // Deposit Rate Logic
    if (lastWeekNetOutcome < -5000) { // If cash flow is significantly negative
        depositRate += 0.5;
        depositReasons.push("a significant negative cash flow last week");
    } else if (lastLDRatio > 0.9) {
        depositRate += 0.25;
        depositReasons.push("a high loan-to-deposit ratio needing more funding");
    }
    
    if (customerSatisfaction < 50 && customerGrowthTrend < 1) {
        depositRate += 0.25;
        depositReasons.push("low customer satisfaction");
    }
    if (currentStrategy === 'BRAND_BUILDING') {
        depositRate += 0.125;
        depositReasons.push("a 'Brand Building' strategy");
    }

    // --- Final Adjustments & Profitability Projection ---
    let finalLoanRate = Math.max(3.0, Math.min(9.5, loanRate));
    let finalDepositRate = Math.max(1.0, Math.min(5.0, depositRate));
    
    const projectOutcome = (lr: number, dr: number) => {
        const projectedInterestIncome = loans * (lr / 100) / TURNS_PER_YEAR;
        const projectedInterestExpense = deposits * (dr / 100) / TURNS_PER_YEAR;
        const operationalCosts = cash * 0.0001 + 500;
        const projectedDefaults = loans * BASE_WEEKLY_DEFAULT_RATE; // Simplified for projection
        return projectedInterestIncome - projectedInterestExpense - operationalCosts - projectedDefaults;
    };

    let projectedNet = projectOutcome(finalLoanRate, finalDepositRate);
    let attempts = 0;
    while (projectedNet < 0 && attempts < 20) {
        if (finalLoanRate < 9.5) {
            finalLoanRate += 0.125;
        } else if (finalDepositRate > 1.0) {
            finalDepositRate -= 0.125;
        } else {
            break; // Can't adjust further
        }
        projectedNet = projectOutcome(finalLoanRate, finalDepositRate);
        attempts++;
    }

    if (attempts > 0) {
        if (loanReasons.indexOf("ensuring profitability") === -1) loanReasons.push("ensuring profitability");
        if (depositReasons.indexOf("ensuring profitability") === -1) depositReasons.push("ensuring profitability");
    }
    
    const formatReasons = (reasons: string[], defaultReason: string) => {
        if (reasons.length === 0) return defaultReason;
        const uniqueReasons = [...new Set(reasons)];
        if (uniqueReasons.length === 1) return `This rate is suggested due to ${uniqueReasons[0]}.`;
        const last = uniqueReasons.pop();
        return `This rate is suggested based on: ${uniqueReasons.join(", ")}, and ${last}.`;
    }

    return {
        recommendedLoan: {
            rate: finalLoanRate,
            reason: formatReasons(loanReasons, "Analysis of recent trends indicates stable performance.")
        },
        recommendedDeposit: {
            rate: finalDepositRate,
            reason: formatReasons(depositReasons, "Analysis of recent trends indicates stable funding levels.")
        }
    };
}


const Dashboard: React.FC<DashboardProps> = ({ gameState, history, news, onNextTurn, onPlayerAction, onStrategyChange, onRateChange }) => {
    const previousHistory = history.length > 0 ? history[history.length - 1] : null;
    const theme = THEME_COLORS[gameState.settings.branding.themeColor];

    const calculateChange = (current: number, previous: number | undefined) => {
        if (previous === undefined || previous === 0) return null;
        const change = ((current - previous) / previous) * 100;
        return isNaN(change) ? null : change;
    };

    const cashChange = previousHistory ? calculateChange(gameState.cash, previousHistory.cash) : null;
    const loansChange = previousHistory ? calculateChange(gameState.loans, previousHistory.loans) : null;
    const depositsChange = previousHistory ? calculateChange(gameState.deposits, previousHistory.deposits) : null;
    const reputationChange = previousHistory ? calculateChange(gameState.reputation, previousHistory.reputation) : null;
    const satisfactionChange = previousHistory ? calculateChange(gameState.customerSatisfaction, previousHistory.customerSatisfaction) : null;
    const riskChange = previousHistory ? calculateChange(gameState.riskFactor, previousHistory.riskFactor) : null;

    const { recommendedLoan, recommendedDeposit } = getRateRecommendations(gameState, history);

    const interestIncome = gameState.loans * (gameState.loanInterestRate / 100) / TURNS_PER_YEAR;
    const interestExpense = gameState.deposits * (gameState.depositInterestRate / 100) / TURNS_PER_YEAR;
    const netInterestIncome = interestIncome - interestExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    }

    return (
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Content Area */}
            <div className="lg:col-span-3 flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={<CashIcon />} title="Cash Reserves" value={gameState.cash} format="currency" change={cashChange} />
                    <StatCard icon={<LoanIcon />} title="Loans" value={gameState.loans} format="currency" change={loansChange} />
                    <StatCard icon={<DepositIcon />} title="Deposits" value={gameState.deposits} format="currency" change={depositsChange} />
                    <StatCard icon={<CalculatorIcon />} title="Net Interest" value={netInterestIncome} format="currency">
                         <div className="mt-2 text-xs border-t border-slate-700 pt-2 space-y-1">
                             <div className="flex justify-between items-center text-slate-400">
                                <span>Loan Income</span>
                                <span className="font-mono text-emerald-400">+{formatCurrency(interestIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-400">
                                <span>Deposit Expense</span>
                                <span className="font-mono text-red-400">-{formatCurrency(interestExpense)}</span>
                            </div>
                        </div>
                    </StatCard>
                    <StatCard icon={<ReputationIcon />} title="Reputation" value={gameState.reputation} format="percentage" change={reputationChange} />
                    <StatCard icon={<SatisfactionIcon />} title="Satisfaction" value={gameState.customerSatisfaction} format="percentage" change={satisfactionChange} />
                    <StatCard icon={<RiskIcon />} title="Risk Factor" value={gameState.riskFactor} format="percentage" change={riskChange} />
                </div>
                <PerformanceChart history={history} themeColor={theme.primary} />
                <NewsFeed news={news} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <ActionPanel 
                    onPlayerAction={onPlayerAction} 
                    onNextTurn={onNextTurn} 
                    recommendedLoanRate={recommendedLoan.rate}
                    recommendedLoanReason={recommendedLoan.reason}
                    recommendedDepositRate={recommendedDeposit.rate}
                    recommendedDepositReason={recommendedDeposit.reason}
                    currentStrategy={gameState.currentStrategy}
                    onStrategyChange={onStrategyChange}
                    onRateChange={onRateChange}
                    loanInterestRate={gameState.loanInterestRate}
                    depositInterestRate={gameState.depositInterestRate}
                />
            </div>
        </main>
    );
};

export default Dashboard;
