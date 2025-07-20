import React, { useState, useMemo, useEffect } from 'react';
import { MarketingCampaignType, ThemeColorName, ActiveCampaignState } from '../types';
import { MARKETING_CAMPAIGNS, THEME_COLORS } from '../constants';
import { MegaphoneIcon, TargetIcon, CalendarIcon, StopCircleIcon, UsersIcon, ReputationIcon } from './Icons';

interface MarketingModalProps {
    onClose: () => void;
    onLaunchCampaign: (type: MarketingCampaignType, budget: number, duration: number) => void;
    onStopCampaign: () => void;
    activeCampaign: ActiveCampaignState | null;
    themeColor: ThemeColorName;
    cash: number;
    totalCustomers: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
}).format(amount);

const MarketingModal: React.FC<MarketingModalProps> = ({ onClose, onLaunchCampaign, onStopCampaign, activeCampaign, themeColor, cash, totalCustomers }) => {
    // State for the currently selected campaign in the UI, before launching
    const [selectedType, setSelectedType] = useState<MarketingCampaignType | 'NONE'>(activeCampaign ? activeCampaign.type : 'NONE');
    
    // State for the planner controls
    const [budget, setBudget] = useState(activeCampaign ? activeCampaign.budget : 5000);
    const [duration, setDuration] = useState(activeCampaign ? activeCampaign.weeksRemaining : 2);

    const theme = THEME_COLORS[themeColor];
    const campaigns = Object.values(MARKETING_CAMPAIGNS);
    
    // When modal opens, sync planner with active campaign if it exists
    useEffect(() => {
        if (activeCampaign) {
            setSelectedType(activeCampaign.type);
            setBudget(activeCampaign.budget);
            setDuration(activeCampaign.weeksRemaining);
        }
    }, []);

    const projections = useMemo(() => {
        if (!selectedType || selectedType === 'NONE') return null;
        const campaign = MARKETING_CAMPAIGNS[selectedType];
        const totalCost = budget * duration;
        
        return {
            impressions: Math.round(budget * duration * 1.5),
            newUserIncrease: Math.round(budget * (campaign.effectMultipliers.customerGrowth || 0) * duration * 0.1),
            reputationBoost: Math.round(budget * campaign.effectMultipliers.reputation * duration * 100),
            totalCost: totalCost
        };
    }, [selectedType, budget, duration]);
    
    const handleActionClick = () => {
        if (selectedType === 'NONE') {
            onStopCampaign();
        } else if (selectedType) {
            onLaunchCampaign(selectedType, budget, duration);
        }
        onClose();
    };
    
    const getButtonState = () => {
        if (selectedType === 'NONE') {
            return { text: 'Stop Campaign', disabled: !activeCampaign };
        }
        if (selectedType) {
             const totalCost = budget * duration;
             if (activeCampaign && activeCampaign.type === selectedType) {
                 return { text: 'Update Campaign', disabled: totalCost > cash };
             }
             return { text: 'Launch Campaign', disabled: totalCost > cash };
        }
        return { text: 'Select a Campaign', disabled: true };
    };

    const { text: buttonText, disabled: isButtonDisabled } = getButtonState();
    
    const activeCampaignDetails = activeCampaign ? MARKETING_CAMPAIGNS[activeCampaign.type] : null;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-4xl w-full p-6 sm:p-8 animate-slide-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex-shrink-0 mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <MegaphoneIcon className="w-8 h-8 text-theme-primary" />
                                <h1 className="text-3xl font-bold text-white">Marketing Campaigns</h1>
                            </div>
                            <p className="text-slate-400 mt-1">Select a strategy to grow your bank’s customer base and deposits.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                     <div className="mt-4 p-2 bg-slate-900/50 rounded-md text-center text-sm">
                        <span className="font-semibold text-slate-300">Current Status: </span>
                        {activeCampaignDetails ? (
                            <span className="text-theme-primary font-bold">{activeCampaignDetails.name} (Active for {activeCampaign?.weeksRemaining} more weeks)</span>
                        ) : (
                            <span className="text-slate-400 italic">No active marketing campaign.</span>
                        )}
                    </div>
                </div>
                
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2">
                    {/* Left Panel: Campaign Selection */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-white">Choose Campaign Type</h3>
                        {/* No Campaign Option */}
                        <div
                            onClick={() => setSelectedType('NONE')}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedType === 'NONE' ? 'ring-2' : ''}`}
                            style={{
                                borderColor: selectedType === 'NONE' ? theme.primary : '#475569',
                                backgroundColor: activeCampaign === null ? '#334155' : '#1e293b',
                                '--tw-ring-color': theme.primary
                            } as React.CSSProperties}
                        >
                             <div className="flex justify-between items-center">
                                <h4 className="font-bold text-white flex items-center gap-2"><StopCircleIcon /> No Active Campaign</h4>
                                {activeCampaign === null && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{backgroundColor: theme.primary, color: theme.text}}>ACTIVE</span>}
                                {selectedType === 'NONE' && activeCampaign !== null && <span className="text-xs font-bold text-slate-300">SELECTED</span>}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Stop all marketing efforts to save costs.</p>
                        </div>
                        {/* Campaign List */}
                        {campaigns.map(campaign => {
                            const isActive = activeCampaign?.type === campaign.id;
                            const isSelected = selectedType === campaign.id;
                            return (
                                <div
                                    key={campaign.id}
                                    onClick={() => setSelectedType(campaign.id)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2' : ''}`}
                                    style={{
                                        borderColor: isSelected ? theme.primary : '#475569',
                                        backgroundColor: isActive ? '#334155' : '#1e293b',
                                        '--tw-ring-color': theme.primary
                                    } as React.CSSProperties}
                                >
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-white">{campaign.name}</h4>
                                        {isActive && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{backgroundColor: theme.primary, color: theme.text}}>ACTIVE</span>}
                                        {isSelected && !isActive && <span className="text-xs font-bold text-slate-300">SELECTED</span>}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{campaign.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Panel: Planner & Projections */}
                    <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col gap-4">
                        {selectedType && selectedType !== 'NONE' ? (
                            <>
                                <h3 className="text-lg font-semibold text-white">Campaign Planner</h3>
                                
                                {/* Budget Slider */}
                                <div>
                                    <div className="flex justify-between items-center text-sm">
                                        <label htmlFor="budget" className="font-medium text-slate-300">Weekly Budget</label>
                                        <span className="font-bold text-theme-primary">{formatCurrency(budget)}</span>
                                    </div>
                                    <input
                                        id="budget"
                                        type="range"
                                        min="2000" max="10000" step="500"
                                        value={budget}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb-theme"
                                    />
                                </div>

                                {/* Duration Selector */}
                                <div>
                                     <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1">Duration (weeks)</label>
                                     <div className="grid grid-cols-4 gap-2">
                                        {[1,2,3,4].map(w => (
                                            <button 
                                                key={w}
                                                onClick={() => setDuration(w)}
                                                className={`py-2 text-sm font-semibold rounded-md transition-colors ${duration === w ? 'active-toggle' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                            >
                                                {w} {w > 1 ? 'wks' : 'wk'}
                                            </button>
                                        ))}
                                     </div>
                                </div>
                                
                                {/* Projections */}
                                <div className="border-t border-slate-700 pt-4 space-y-3">
                                     <h4 className="text-md font-semibold text-slate-300">Projected Impact (Total)</h4>
                                     <div className="text-sm space-y-2">
                                        <p className="flex justify-between"><span><TargetIcon className="inline w-4 h-4 mr-2" />Impressions:</span> <span className="font-mono text-white">{projections?.impressions.toLocaleString()}</span></p>
                                        <p className="flex justify-between"><span><UsersIcon className="inline w-4 h-4 mr-2" />New Users:</span> <span className="font-mono text-white">~{projections?.newUserIncrease.toLocaleString()}</span></p>
                                        <p className="flex justify-between"><span><ReputationIcon className="inline w-4 h-4 mr-2" />Reputation Boost:</span> <span className="font-mono text-white">+{projections?.reputationBoost} pts</span></p>
                                     </div>
                                      <div className="mt-2 p-3 bg-slate-800 rounded-md text-center">
                                         <p className="text-sm font-medium text-slate-400">Total Campaign Cost</p>
                                         <p className="text-xl font-bold text-amber-400">{formatCurrency(projections?.totalCost || 0)}</p>
                                     </div>
                                </div>
                            </>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                 <MegaphoneIcon className="w-16 h-16 mb-4"/>
                                 <p>Select a campaign to configure its budget and duration.</p>
                             </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-6 border-t border-slate-700 pt-4 flex justify-end">
                     <button
                        onClick={handleActionClick}
                        disabled={isButtonDisabled}
                        className="px-6 py-2 rounded-md font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: isButtonDisabled ? '#475569' : theme.primary,
                            color: isButtonDisabled ? '#94a3b8' : theme.text,
                        }}
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
            <style>{`
                .range-thumb-theme { accent-color: var(--theme-primary); }
                .active-toggle { background-color: var(--theme-primary); color: var(--theme-text-on-primary); }
                @keyframes fade-in-backdrop { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-backdrop { animation: fade-in-backdrop 0.3s ease-out forwards; }
                @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-in-up { animation: slide-in-up 0.4s ease-out 0.1s backwards; }
            `}</style>
        </div>
    );
};

export default MarketingModal;