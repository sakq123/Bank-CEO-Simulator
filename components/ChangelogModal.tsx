import React from 'react';
import { CompletedTechUpgrade } from '../types';
import { TECH_UPGRADES, PLANNED_FEATURES } from '../constants';
import { ClipboardListIcon, SuccessIcon, TechIcon } from './Icons';

interface ChangelogModalProps {
    onClose: () => void;
    completedUpgrades: CompletedTechUpgrade[];
}

const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose, completedUpgrades }) => {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-2xl w-full p-6 sm:p-8 animate-slide-in-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex-shrink-0 mb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <ClipboardListIcon className="w-8 h-8 text-theme-primary" />
                                <h1 className="text-3xl font-bold text-white">Technology Changelog</h1>
                            </div>
                            <p className="text-slate-400 mt-1">A record of all completed and planned technology initiatives.</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Completed Upgrades */}
                    <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><SuccessIcon className="w-5 h-5 text-emerald-400" />Completed Upgrades</h3>
                        {completedUpgrades.length > 0 ? (
                            <ul className="space-y-3">
                                {completedUpgrades.slice().sort((a, b) => b.completedTurn - a.completedTurn).map(upgrade => (
                                    <li key={`${upgrade.type}-${upgrade.completedTurn}`} className="p-3 bg-slate-900/50 rounded-lg">
                                        <p className="font-semibold text-slate-200">{TECH_UPGRADES[upgrade.type].name}</p>
                                        <p className="text-xs text-slate-400">Completed in Week {upgrade.completedTurn + 1}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                                <p>No technology upgrades have been completed yet.</p>
                            </div>
                        )}
                    </div>
                    {/* Development Roadmap */}
                     <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2"><TechIcon className="w-5 h-5 text-sky-400" />Development Roadmap</h3>
                        <ul className="space-y-3">
                            {PLANNED_FEATURES.map((feature, index) => (
                                <li key={index} className="p-3 bg-slate-900/50 rounded-lg opacity-70">
                                    <p className="font-semibold text-slate-300">{feature}</p>
                                    <p className="text-xs text-slate-500 italic">Planned for future release</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>


                 {/* Footer */}
                <div className="flex-shrink-0 mt-6 border-t border-slate-700 pt-4 flex justify-end">
                     <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-md font-bold transition-all duration-200 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary-hover"
                    >
                        Close
                    </button>
                </div>
            </div>
             <style>{`
                .text-theme-primary { color: var(--theme-primary); }
                .bg-theme-primary { background-color: var(--theme-primary); }
                .text-theme-text-on-primary { color: var(--theme-text-on-primary); }
                .hover\\:bg-theme-primary-hover:hover { background-color: var(--theme-primary-hover); }

                @keyframes fade-in-backdrop { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-backdrop { animation: fade-in-backdrop 0.3s ease-out forwards; }
                @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-slide-in-up { animation: slide-in-up 0.4s ease-out 0.1s backwards; }
            `}</style>
        </div>
    );
};

export default ChangelogModal;
