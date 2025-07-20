

import React, { useState, useMemo } from 'react';
import { GameState, HistoryEntry, FeedbackSentiment, TechUpgradeType } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { SatisfactionIcon, UsersIcon, SadFaceIcon } from './Icons';
import StatCard from './StatCard';
import { AVG_DEPOSIT_PER_CUSTOMER, AVG_LOAN_PER_CUSTOMER, THEME_COLORS, AGE_DISTRIBUTION, REGION_DISTRIBUTION } from '../constants';
import AppWebsiteManagement from './AppWebsiteManagement';

interface CustomersPageProps {
    gameState: GameState;
    history: HistoryEntry[];
    onTechUpgrade: (upgradeType: TechUpgradeType) => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode, tooltip?: string }> = ({ title, children, icon, tooltip }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 h-full flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" title={tooltip}>
            <span className="text-theme-primary">{icon}</span>
            {title}
        </h3>
        <div className="flex-grow">
            {children}
        </div>
    </div>
);


const CustomersPage: React.FC<CustomersPageProps> = ({ gameState, history, onTechUpgrade }) => {
    const [feedbackFilter, setFeedbackFilter] = useState<FeedbackSentiment | 'ALL'>('ALL');
    const [ageFilter, setAgeFilter] = useState('ALL');
    const [regionFilter, setRegionFilter] = useState('ALL');
    
    const filterMultiplier = useMemo(() => {
        const ageMultiplier = AGE_DISTRIBUTION[ageFilter] ?? 1.0;
        const regionMultiplier = REGION_DISTRIBUTION[regionFilter] ?? 1.0;
        return ageMultiplier * regionMultiplier;
    }, [ageFilter, regionFilter]);

    const isFiltered = ageFilter !== 'ALL' || regionFilter !== 'ALL';
    
    const calculateChange = (current: number, previous: number | undefined) => {
        if (previous === undefined || previous === 0) return null;
        const change = ((current - previous) / previous) * 100;
        return isNaN(change) ? null : change;
    };
    const theme = THEME_COLORS[gameState.settings.branding.themeColor];

    const previousHistory = history.length > 0 ? history[history.length - 1] : null;
    const customerChange = previousHistory ? calculateChange(gameState.totalCustomers, previousHistory.totalCustomers) : null;
    
    // Calculate current week's account counts
    const checkingAccounts = Math.round(gameState.deposits * 0.6 / AVG_DEPOSIT_PER_CUSTOMER);
    const savingsAccounts = Math.round(gameState.deposits * 0.4 / AVG_DEPOSIT_PER_CUSTOMER);
    const loanAccounts = Math.round(gameState.loans / AVG_LOAN_PER_CUSTOMER);

    // Calculate previous week's account counts for trend analysis
    const prevCheckingAccounts = previousHistory ? Math.round(previousHistory.deposits * 0.6 / AVG_DEPOSIT_PER_CUSTOMER) : 0;
    const prevSavingsAccounts = previousHistory ? Math.round(previousHistory.deposits * 0.4 / AVG_DEPOSIT_PER_CUSTOMER) : 0;
    const prevLoanAccounts = previousHistory ? Math.round(previousHistory.loans / AVG_LOAN_PER_CUSTOMER) : 0;

    const checkingChange = calculateChange(checkingAccounts, prevCheckingAccounts);
    const savingsChange = calculateChange(savingsAccounts, prevSavingsAccounts);
    const loanChange = calculateChange(loanAccounts, prevLoanAccounts);

    const productAccountData = useMemo(() => [
        { name: 'Checking', value: Math.round(checkingAccounts * filterMultiplier), change: checkingChange },
        { name: 'Savings', value: Math.round(savingsAccounts * filterMultiplier), change: savingsChange },
        { name: 'Loans', value: Math.round(loanAccounts * filterMultiplier), change: loanChange },
    ], [checkingAccounts, savingsAccounts, loanAccounts, filterMultiplier, checkingChange, savingsChange, loanChange]);
    
    const dynamicUsageData = useMemo(() => Object.entries(gameState.channelUsage).map(([name, logins]) => ({ 
        name, 
        logins: Math.round(logins * filterMultiplier) 
    })), [gameState.channelUsage, filterMultiplier]);
    
    const filteredTotalUsers = Math.round(gameState.totalCustomers * filterMultiplier);

    // Filtered feedback
    const filteredFeedback = useMemo(() => {
        if (feedbackFilter === 'ALL') return gameState.customerFeedback;
        return gameState.customerFeedback.filter(fb => fb.sentiment === feedbackFilter);
    }, [feedbackFilter, gameState.customerFeedback]);

    // Dynamic satisfaction tooltip
    const getSatisfactionReason = () => {
        const reasons = [];
        if (gameState.customerSatisfaction > 70) reasons.push("high customer satisfaction");
        if (gameState.reputation > 60) reasons.push("strong bank reputation");
        if (gameState.depositInterestRate > 3) reasons.push("competitive deposit rates");
        
        if (gameState.customerSatisfaction < 45) reasons.push("low customer satisfaction");
        if (gameState.riskFactor > 65) reasons.push("a high risk factor, which can concern customers");
        if (gameState.loanInterestRate > 8) reasons.push("high loan interest rates");
        if (gameState.serverStatus === 'Overloaded') reasons.push("overloaded servers causing slow performance");

        if (reasons.length === 0) return "Satisfaction is currently at a neutral level, influenced by a balance of factors.";
        return `Current satisfaction is driven by: ${reasons.join(', ')}.`;
    };

    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-4">
                {payload.map((entry: any, index: number) => {
                    const segment = productAccountData.find(d => d.name === entry.value);
                    if (!segment) return null;
                    const count = segment.value;
                    const change = segment.change;
                    const isPositive = change !== null && change >= 0;
                    return (
                         <li key={`item-${index}`} className="flex items-center gap-1.5 text-slate-400">
                            <span style={{ backgroundColor: entry.color }} className="w-2 h-2 inline-block rounded-full"></span>
                            <span>{entry.value}:</span>
                            <span className="font-semibold text-white">{count.toLocaleString()}</span>
                            {!isFiltered && change !== null && Math.abs(change) > 0.01 && (
                                <span className={`flex items-center ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    ({isPositive ? '+' : ''}{change.toFixed(1)}%)
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const PIE_COLORS = ['#38bdf8', '#a78bfa', '#14b8a6'];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Filters Section */}
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 flex flex-wrap items-center gap-4">
                <h3 className="text-md font-semibold text-slate-300">Filter Users:</h3>
                <div className="flex items-center gap-4">
                     <select 
                        value={ageFilter}
                        onChange={(e) => setAgeFilter(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1 text-sm text-white focus:ring-theme-primary focus:border-theme-primary"
                    >
                        {Object.keys(AGE_DISTRIBUTION).map(age => <option key={age} value={age}>{age === 'ALL' ? 'By Age: All' : age}</option>)}
                    </select>
                    <select 
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1 text-sm text-white focus:ring-theme-primary focus:border-theme-primary"
                    >
                        {Object.keys(REGION_DISTRIBUTION).map(region => <option key={region} value={region}>{region === 'ALL' ? 'By Region: All' : region}</option>)}
                    </select>
                     {isFiltered && (
                         <button onClick={() => { setAgeFilter('ALL'); setRegionFilter('ALL'); }} className="text-xs text-slate-400 hover:text-white underline">Reset Filters</button>
                     )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        icon={<UsersIcon />} 
                        title="Total Users" 
                        value={filteredTotalUsers} 
                        change={isFiltered ? null : customerChange} 
                    />
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col justify-center items-center cursor-help" title={getSatisfactionReason()}>
                         <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-1"><SatisfactionIcon className="w-4 h-4"/>Overall Satisfaction</h3>
                         <p className="text-4xl font-bold text-theme-primary">{gameState.customerSatisfaction.toFixed(0)}<span className="text-2xl text-slate-400">%</span></p>
                    </div>

                    <InfoCard title="Product Accounts" icon={<UsersIcon />} tooltip="Indicates the total number of active product accounts. Since one user can hold multiple accounts (e.g., checking and a loan), this sum may be higher than the total unique user count.">
                        <div style={{ width: '100%', height: 150 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={productAccountData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={50} innerRadius={30} fill={theme.primary}>
                                        {productAccountData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                                        itemStyle={{ color: '#cbd5e1' }}
                                        formatter={(value: number) => `${value.toLocaleString()} Accounts`}
                                    />
                                    <Legend content={renderLegend} verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </InfoCard>
                </div>
                 <div className="lg:col-span-2">
                    <InfoCard title="Weekly Channel Usage" icon={<UsersIcon />} tooltip="Shows the distribution of all unique users across their primary channel for the week. The sum of all channel counts equals the total user count.">
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <BarChart data={dynamicUsageData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis hide domain={[0, 'dataMax + 1000']} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(71, 85, 105, 0.5)' }}
                                        contentStyle={{ backgroundColor: '#334155', border: '1px solid #475569' }}
                                        itemStyle={{ color: theme.primary }}
                                        labelStyle={{ color: '#cbd5e1' }}
                                        formatter={(value: number) => `${value.toLocaleString()} active users`}
                                    />
                                    <Bar dataKey="logins" fill={theme.primary} background={{ fill: '#475569', opacity: 0.2 }} name="Active Users"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </InfoCard>
                </div>
                <div className="lg:col-span-1">
                    <InfoCard title="Recent Customer Feedback" icon={<UsersIcon />}>
                        <div className="flex gap-2 mb-3">
                            {(['ALL', 'positive', 'negative', 'neutral'] as const).map(filter => (
                                <button 
                                    key={filter}
                                    onClick={() => setFeedbackFilter(filter)}
                                    className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${feedbackFilter === filter ? 'bg-theme-primary text-theme-text-on-primary border-theme-primary' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}>
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                        <ul className="space-y-3 max-h-[205px] overflow-y-auto pr-2">
                           {filteredFeedback.length > 0 ? filteredFeedback.map(fb => (
                               <li key={fb.id} className="flex items-start gap-3 p-2 bg-slate-700/50 rounded-md">
                                   <div className="flex-shrink-0 mt-0.5">
                                       {fb.sentiment === 'positive' && <SatisfactionIcon className="w-5 h-5 text-emerald-400" />}
                                       {fb.sentiment === 'negative' && <SadFaceIcon className="w-5 h-5 text-red-400" />}
                                       {fb.sentiment === 'neutral' && <UsersIcon className="w-5 h-5 text-slate-500" />}
                                   </div>
                                   <p className="text-sm text-slate-300">{fb.text}</p>
                               </li>
                           )) : <p className="text-sm text-slate-500 text-center pt-8">No feedback of this type.</p>}
                        </ul>
                    </InfoCard>
                </div>
                <div className="lg:col-span-3">
                    <AppWebsiteManagement gameState={gameState} onTechUpgrade={onTechUpgrade} />
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                 .bg-theme-primary {
                    background-color: var(--theme-primary);
                }
                .text-theme-primary {
                    color: var(--theme-primary);
                }
                .border-theme-primary {
                    border-color: var(--theme-primary);
                }
                .focus\\:ring-theme-primary:focus {
                    --tw-ring-color: var(--theme-primary);
                }
                .focus\\:border-theme-primary:focus {
                     border-color: var(--theme-primary);
                }
                .text-theme-text-on-primary {
                    color: var(--theme-text-on-primary);
                }
            `}</style>
        </div>
    );
};

export default CustomersPage;
