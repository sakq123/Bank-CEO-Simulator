
import React, { useState } from 'react';
import { GameState, TechUpgradeType, TechUpgradeCategory } from '../types';
import { TECH_UPGRADES, THEME_COLORS } from '../constants';
import { TechIcon, ClipboardListIcon, StarFullIcon, StarHalfIcon } from './Icons';
import ChangelogModal from './ChangelogModal';

interface AppWebsiteManagementProps {
    gameState: GameState;
    onTechUpgrade: (upgradeType: TechUpgradeType) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD', maximumFractionDigits: 0
    }).format(amount);
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<StarFullIcon key={i} className="w-5 h-5 text-amber-400" />);
        } else if (i - rating < 1 && i - rating > 0) {
            // Use a mask to show a partial star for ratings like 4.5
            const percentage = (rating - (i-1)) * 100;
             return (
                <div style={{ position: 'relative' }}>
                    <StarFullIcon key={i} className="w-5 h-5 text-slate-600" />
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${percentage}%`, overflow: 'hidden' }}>
                       <StarFullIcon key={`${i}-filled`} className="w-5 h-5 text-amber-400" />
                    </div>
                </div>
            );
        } else {
            stars.push(<StarFullIcon key={i} className="w-5 h-5 text-slate-600" />);
        }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
};


const AppWebsiteManagement: React.FC<AppWebsiteManagementProps> = ({ gameState, onTechUpgrade }) => {
    const [showChangelog, setShowChangelog] = useState(false);
    const theme = THEME_COLORS[gameState.settings.branding.themeColor];

    const getStatusColor = (status: GameState['serverStatus']) => {
        switch (status) {
            case 'Optimal': return 'text-emerald-400';
            case 'Stable': return 'text-sky-400';
            case 'Overloaded': return 'text-amber-400';
            default: return 'text-slate-400';
        }
    };
    
    const UPGRADE_CATEGORIES: TechUpgradeCategory[] = ['UI/UX', 'Performance', 'Features', 'Security'];

    return (
        <>
            {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} completedUpgrades={gameState.completedTechUpgrades} />}
            <div className="bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                            <TechIcon className="w-6 h-6 text-theme-primary"/>
                            App & Website Management
                        </h3>
                        <p className="text-sm text-amber-400">Monthly Maintenance: <span className="font-bold">{formatCurrency(gameState.monthlyMaintenanceCost)}</span></p>
                    </div>
                     <button onClick={() => setShowChangelog(true)} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-700/50 px-3 py-1.5 rounded-md transition-colors">
                        <ClipboardListIcon className="w-4 h-4" />
                        View Changelog
                    </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-900/40 rounded-lg">
                    <div className="text-center">
                        <p className="text-sm text-slate-400">App Version</p>
                        <p className="text-lg font-bold text-white">{gameState.appVersion}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-slate-400">App Rating</p>
                        <div className="flex justify-center items-center gap-2">
                             <StarRating rating={gameState.appRating} />
                             <p className="text-lg font-bold text-white">{gameState.appRating.toFixed(1)}</p>
                        </div>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-slate-400">Website Version</p>
                        <p className="text-lg font-bold text-white">{gameState.websiteVersion}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm text-slate-400">Server Status</p>
                        <p className={`text-lg font-bold ${getStatusColor(gameState.serverStatus)}`}>{gameState.serverStatus}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {UPGRADE_CATEGORIES.map(category => (
                        <details key={category} className="bg-slate-900/30 rounded-lg group" open>
                            <summary className="p-3 font-bold text-lg text-white list-none flex justify-between items-center cursor-pointer hover:bg-slate-700/20 rounded-t-lg">
                                {category}
                                <ChevronDownIcon className="w-5 h-5 transition-transform duration-200 group-open:rotate-180" />
                            </summary>
                            <div className="p-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(TECH_UPGRADES)
                                    .filter(([_, upgrade]) => upgrade.category === category)
                                    .map(([key, upgrade]) => {
                                        const upgradeType = key as TechUpgradeType;
                                        const isCompleted = gameState.completedTechUpgrades.some(u => u.type === upgradeType);
                                        const activeUpgrade = gameState.activeTechUpgrades.find(u => u.type === upgradeType);
                                        const canAfford = gameState.cash >= upgrade.cost;
                                        const Icon = upgrade.icon;
                                        const progress = activeUpgrade ? ((upgrade.duration - activeUpgrade.weeksRemaining) / upgrade.duration) * 100 : 0;
                                        const isInvestable = !isCompleted && !activeUpgrade;
                                        
                                        return (
                                            <div key={upgradeType} className={`bg-slate-800 p-4 rounded-lg flex flex-col justify-between border border-slate-700 ${isCompleted ? 'opacity-60' : ''}`}>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Icon className="w-6 h-6 text-theme-primary flex-shrink-0"/>
                                                        <h4 className="text-md font-bold text-white">{upgrade.name}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mb-3 h-12">{upgrade.description}</p>
                                                    <div className="text-sm flex justify-between items-center mb-3">
                                                         <span className="font-semibold text-amber-400">Cost: {formatCurrency(upgrade.cost)}</span>
                                                         <span className="text-slate-500">{upgrade.duration} wks</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-auto h-10 flex items-center justify-center">
                                                    {isCompleted ? (
                                                        <div className="w-full text-center px-3 py-2 text-sm font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</div>
                                                    ) : activeUpgrade ? (
                                                        <div className="w-full">
                                                            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-1">
                                                                <div className="h-2.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: theme.primary }}></div>
                                                            </div>
                                                            <p className="text-xs text-center text-slate-400">{activeUpgrade.weeksRemaining} weeks remaining</p>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => onTechUpgrade(upgradeType)}
                                                            disabled={!canAfford}
                                                            className="w-full px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                                                            style={{
                                                                backgroundColor: canAfford ? theme.primary : undefined,
                                                                color: canAfford ? theme.text : undefined
                                                            }}
                                                        >
                                                            {canAfford ? 'Invest' : 'Insufficient Funds'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                })}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </>
    );
};

// Add ChevronDownIcon here to keep component self-contained for this change
const ChevronDownIcon: React.FC<{className?: string}> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);


export default AppWebsiteManagement;
