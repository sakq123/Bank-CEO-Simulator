import React, { useState } from 'react';
import { LogoName, ThemeColorName, BankType, Difficulty } from '../types';
import { LOGOS, THEME_COLORS, INITIAL_GAME_STATE, BANK_TYPE_MODIFIERS, DIFFICULTY_MODIFIERS } from '../constants';

interface SetupModalProps {
    onComplete: (config: {
        name: string;
        logo: LogoName;
        color: ThemeColorName;
        bankType: BankType;
        difficulty: Difficulty;
    }) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
    const [bankName, setBankName] = useState(INITIAL_GAME_STATE.settings.branding.bankName);
    const [selectedLogo, setSelectedLogo] = useState<LogoName>(INITIAL_GAME_STATE.settings.branding.bankLogo);
    const [selectedColor, setSelectedColor] = useState<ThemeColorName>(INITIAL_GAME_STATE.settings.branding.themeColor);
    const [bankType, setBankType] = useState<BankType>('RETAIL');
    const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete({ name: bankName, logo: selectedLogo, color: selectedColor, bankType, difficulty });
    };

    const tempTheme = THEME_COLORS[selectedColor];
    const LogoComponent = LOGOS[selectedLogo].icon;

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-2xl w-full p-6 sm:p-8 animate-slide-in-up max-h-[95vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="text-center">
                         <div className="flex justify-center items-center gap-3 mb-2">
                             <LogoComponent className="w-8 h-8 transition-colors duration-300" style={{color: tempTheme.primary}} />
                             <h1 className="text-3xl font-bold text-white">Found Your Bank</h1>
                        </div>
                        <p className="text-slate-400">Define your initial strategy and brand to begin.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Column 1: Core Identity */}
                        <div className="flex flex-col gap-6">
                            {/* Bank Name */}
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-slate-300 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    id="bankName"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md focus:ring-2 focus:outline-none transition-all"
                                    style={{'--f-ring-color': tempTheme.primary, borderColor: tempTheme.primary} as React.CSSProperties}
                                    maxLength={25}
                                    required
                                />
                            </div>

                            {/* Logo Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Choose Your Logo</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.keys(LOGOS).map((key) => {
                                        const logoKey = key as LogoName;
                                        const LogoIcon = LOGOS[logoKey].icon;
                                        const isActive = selectedLogo === logoKey;
                                        return (
                                            <button
                                                type="button"
                                                key={logoKey}
                                                onClick={() => setSelectedLogo(logoKey)}
                                                className={`flex items-center justify-center p-3 rounded-md aspect-square transition-all duration-200 ${isActive ? 'ring-2' : 'bg-slate-700/50 hover:bg-slate-700'}`}
                                                style={{ '--tw-ring-color': tempTheme.primary } as React.CSSProperties}
                                                title={LOGOS[logoKey].name}
                                            >
                                                <LogoIcon className="w-8 h-8" style={{ color: isActive ? tempTheme.primary : '#94a3b8' }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Gameplay Choices */}
                        <div className="flex flex-col gap-6">
                             {/* Bank Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Bank Type</label>
                                <div className="flex flex-col gap-2">
                                    {(Object.keys(BANK_TYPE_MODIFIERS) as BankType[]).map(type => (
                                         <button type="button" key={type} onClick={() => setBankType(type)} className={`p-3 rounded-md text-left transition-all border-2 ${bankType === type ? 'bg-theme-primary/10 border-theme-primary' : 'bg-slate-700/50 border-transparent hover:border-slate-600'}`}>
                                            <p className="font-bold text-white">{type.charAt(0) + type.slice(1).toLowerCase()}</p>
                                            <p className="text-xs text-slate-400">{
                                                type === 'RETAIL' ? 'Balanced, focuses on in-person services.' :
                                                type === 'DIGITAL' ? 'Tech-focused with lower costs and higher growth.' :
                                                'High-risk, high-reward loan strategy.'
                                            }</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                                <div className="grid grid-cols-3 gap-2">
                                     {(Object.keys(DIFFICULTY_MODIFIERS) as Difficulty[]).map(level => (
                                          <button type="button" key={level} onClick={() => setDifficulty(level)} className={`px-2 py-3 text-center rounded-md text-sm font-semibold transition-all border-2 ${difficulty === level ? 'bg-theme-primary/10 border-theme-primary' : 'bg-slate-700/50 border-transparent hover:border-slate-600'}`}>
                                             {level.charAt(0) + level.slice(1).toLowerCase()}
                                          </button>
                                     ))}
                                </div>
                            </div>
                        </div>
                    </div>


                     {/* Color Theme Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Select Your Brand Color</label>
                        <div className="grid grid-cols-8 gap-3">
                            {Object.keys(THEME_COLORS).map((key) => {
                                const colorKey = key as ThemeColorName;
                                const color = THEME_COLORS[colorKey];
                                const isActive = selectedColor === colorKey;
                                return (
                                    <button
                                        type="button"
                                        key={colorKey}
                                        onClick={() => setSelectedColor(colorKey)}
                                        className={`w-full h-10 rounded-full transition-all duration-200 ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800' : 'hover:scale-110'}`}
                                        style={{ backgroundColor: color.primary, '--tw-ring-color': color.primary } as React.CSSProperties}
                                        title={color.name}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
                        style={{backgroundColor: tempTheme.primary, color: tempTheme.text}}
                    >
                        Start Banking
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fade-in-backdrop {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-backdrop {
                    animation: fade-in-backdrop 0.3s ease-out forwards;
                }
                 @keyframes slide-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.4s ease-out 0.1s backwards;
                }
                 input:focus {
                    border-color: var(--f-ring-color);
                    box-shadow: 0 0 0 2px var(--f-ring-color);
                }
                .bg-theme-primary\\/10 {
                    background-color: var(--theme-primary-transparent, rgba(56, 189, 248, 0.1));
                }
                .border-theme-primary {
                    border-color: var(--theme-primary);
                }
            `}</style>
        </div>
    );
};

export default SetupModal;