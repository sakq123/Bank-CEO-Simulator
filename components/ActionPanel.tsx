
import React, { useState, useEffect } from 'react';
import { MarketingIcon, TechIcon, NextIcon, LightbulbIcon, StrategyIcon } from './Icons';
import { STRATEGIES } from '../constants';
import { Strategy } from '../types';

interface ActionPanelProps {
    onPlayerAction: (action: string) => void;
    onNextTurn: () => void;
    recommendedLoanRate: number;
    recommendedLoanReason: string;
    recommendedDepositRate: number;
    recommendedDepositReason: string;
    currentStrategy: Strategy;
    onStrategyChange: (strategy: Strategy) => void;
    loanInterestRate: number;
    depositInterestRate: number;
    onRateChange: (type: 'loan' | 'deposit', value: number) => void;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string, title?: string }> = ({ onClick, children, className, title }) => (
    <button
        onClick={onClick}
        title={title}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md font-semibold transition-all duration-200 
                    ${className} 
                    hover:scale-105`}>
        {children}
    </button>
);

const ActionPanel: React.FC<ActionPanelProps> = ({ 
    onPlayerAction, 
    onNextTurn, 
    recommendedLoanRate,
    recommendedLoanReason, 
    recommendedDepositRate,
    recommendedDepositReason, 
    currentStrategy, 
    onStrategyChange,
    loanInterestRate,
    depositInterestRate,
    onRateChange
}) => {
    // Local state for real-time slider feedback to prevent global re-renders on every tick
    const [localLoanRate, setLocalLoanRate] = useState(loanInterestRate);
    const [localDepositRate, setLocalDepositRate] = useState(depositInterestRate);

    // Sync local state if the global state changes (e.g., on game reset or next turn)
    useEffect(() => {
        setLocalLoanRate(loanInterestRate);
    }, [loanInterestRate]);

    useEffect(() => {
        setLocalDepositRate(depositInterestRate);
    }, [depositInterestRate]);

    const handleRateInputChange = (type: 'loan' | 'deposit', value: number) => {
        if (type === 'loan') {
            setLocalLoanRate(value);
        } else {
            setLocalDepositRate(value);
        }
    };

    // Commit the rate change to global state only when the user releases the slider
    const handleRateCommit = (type: 'loan' | 'deposit') => {
        if (type === 'loan' && localLoanRate !== loanInterestRate) {
            onRateChange('loan', localLoanRate);
        } else if (type === 'deposit' && localDepositRate !== depositInterestRate) {
            onRateChange('deposit', localDepositRate);
        }
    };


    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col gap-4">
            
             {/* Weekly Strategy */}
            <div className="pb-4">
                <h3 className="text-lg font-bold text-center text-white mb-3 flex items-center justify-center gap-2">
                    <StrategyIcon className="w-5 h-5 text-theme-primary" />
                    Weekly Strategy
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys(STRATEGIES).map((key) => {
                        const strategy = key as Strategy;
                        const isActive = currentStrategy === strategy;
                        const Icon = STRATEGIES[strategy].icon;
                        return (
                            <button
                                key={strategy}
                                onClick={() => onStrategyChange(strategy)}
                                title={STRATEGIES[strategy].description}
                                className={`flex items-center justify-start text-left gap-2 p-2 rounded-md text-xs font-semibold transition-all duration-200
                                            ${isActive 
                                                ? 'bg-theme-primary text-theme-text-on-primary ring-2 ring-theme-primary shadow-md' 
                                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/70'}`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span>{STRATEGIES[strategy].name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-700 pt-4 flex flex-col gap-4">
                 <h3 className="text-lg font-bold text-center text-white">Strategic Actions</h3>
                {/* Investment Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <ActionButton onClick={() => onPlayerAction('MARKETING')} className="bg-indigo-600 text-white" title="Manage marketing campaigns">
                        <MarketingIcon /> Marketing
                    </ActionButton>
                    <ActionButton onClick={() => onPlayerAction('TECHNOLOGY')} className="bg-purple-600 text-white" title="View technology upgrade options">
                        <TechIcon /> Technology
                    </ActionButton>
                </div>

                {/* Interest Rate Controls */}
                <div>
                     <p className="text-sm text-center text-slate-300 mb-2">Interest Rates</p>
                     <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex justify-between w-full">
                                <span className="text-xs font-semibold">Loan Rate</span>
                                <span className="text-xs font-bold text-white">{localLoanRate.toFixed(2)}%</span>
                            </div>
                            <input
                                type="range"
                                min="2" max="10" step="0.25"
                                value={localLoanRate}
                                onChange={(e) => handleRateInputChange('loan', parseFloat(e.target.value))}
                                onMouseUp={() => handleRateCommit('loan')}
                                onTouchEnd={() => handleRateCommit('loan')}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-theme"
                            />
                            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 h-4 mt-1 cursor-help" title={recommendedLoanReason}>
                                <LightbulbIcon className="w-3.5 h-3.5" />
                                <span>Rec: {recommendedLoanRate.toFixed(2)}%</span>
                            </div>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <div className="flex justify-between w-full">
                                <span className="text-xs font-semibold">Deposit Rate</span>
                                <span className="text-xs font-bold text-white">{localDepositRate.toFixed(2)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5" max="5" step="0.25"
                                value={localDepositRate}
                                onChange={(e) => handleRateInputChange('deposit', parseFloat(e.target.value))}
                                onMouseUp={() => handleRateCommit('deposit')}
                                onTouchEnd={() => handleRateCommit('deposit')}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-theme"
                            />
                            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 h-4 mt-1 cursor-help" title={recommendedDepositReason}>
                                <LightbulbIcon className="w-3.5 h-3.5" />
                                <span>Rec: {recommendedDepositRate.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Next Turn Button */}
            <button
                onClick={onNextTurn}
                className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 
                           bg-theme-primary text-theme-text-on-primary
                           hover:bg-theme-primary-hover hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
            >
                <NextIcon />
                Advance to Next Week
            </button>
             <style>{`
                .range-thumb-theme {
                    accent-color: var(--theme-primary);
                }
             `}</style>
        </div>
    );
};

export default ActionPanel;
