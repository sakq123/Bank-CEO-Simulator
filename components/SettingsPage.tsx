
import React, { useState, useEffect } from 'react';
import { GameState, GameSettings, LogoName, ThemeColorName } from '../types';
import { LOGOS, THEME_COLORS } from '../constants';
import { SettingsIcon, SaveIcon, UploadIcon, FileDownIcon, RestartIcon, BellIcon, BellOffIcon, SunIcon, MoonIcon, BankIcon, PaintBrushIcon, CodeIcon } from './Icons';

interface SettingsPageProps {
    gameState: GameState;
    onUpdateSettings: (newSettings: GameSettings) => void;
    onSaveGame: (slot: number) => void;
    onLoadGame: (slot: number) => void;
    onExportData: () => void;
    onRestart: () => void;
}

type Section = 'general' | 'branding' | 'platform' | 'notifications' | 'advanced';

const getSaveSlotData = (slot: number) => {
    const data = localStorage.getItem(`bankSimSave_slot_${slot}`);
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        const date = new Date(parsed.gameState.turn * 1000 * 60 * 60 * 24 * 7); // Simplified date from turn
        return {
            bankName: parsed.gameState.settings.branding.bankName,
            date: date.toLocaleDateString(),
            turn: parsed.gameState.turn,
        };
    } catch {
        return null;
    }
};

const SettingsPage: React.FC<SettingsPageProps> = ({ gameState, onUpdateSettings, onSaveGame, onLoadGame, onExportData, onRestart }) => {
    const [activeSection, setActiveSection] = useState<Section>('general');
    const [settings, setSettings] = useState<GameSettings>(gameState.settings);
    const [saveSlots, setSaveSlots] = useState<(ReturnType<typeof getSaveSlotData> | null)[]>([]);

    useEffect(() => {
        setSettings(gameState.settings);
    }, [gameState.settings]);

    useEffect(() => {
        const slots = [1, 2, 3].map(slot => getSaveSlotData(slot));
        setSaveSlots(slots);
    }, []);
    
    const handleSettingsChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBrandingChange = <K extends keyof GameSettings['branding']>(key: K, value: GameSettings['branding'][K]) => {
        setSettings(prev => ({
            ...prev,
            branding: {
                ...prev.branding,
                [key]: value
            }
        }));
    };
    
    const handleNotificationChange = (key: keyof GameSettings['notifications'], value: boolean) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: value
            }
        }));
    };

    const handleSave = () => {
        onUpdateSettings(settings);
    };
    
    const handleSaveToSlot = (slot: number) => {
        onSaveGame(slot);
        const slots = [1, 2, 3].map(s => getSaveSlotData(s));
        setSaveSlots(slots);
    };
    
    // --- Centralized Style Definitions for Consistency ---
    const styleConfig = {
        sectionTitle: "text-xl font-bold text-slate-800 dark:text-white",
        label: "block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2",
        input: "w-full px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:outline-none transition-all focus:border-theme-primary focus:ring-theme-primary text-slate-800 dark:text-white",
        infoBox: "p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md text-slate-700 dark:text-slate-300",
        primaryButton: "px-5 py-2.5 rounded-lg font-bold transition-all shadow hover:shadow-lg bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed",
        secondaryButton: "flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md font-semibold transition-all bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed",
        dangerButton: "flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md font-semibold transition-all text-white bg-red-600 hover:bg-red-700 shadow hover:shadow-lg disabled:opacity-50",
        card: "p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200 dark:border-slate-700",
        sidebarButton: (isActive: boolean) =>
            `p-3 rounded-md text-left font-semibold transition-colors duration-200 w-full flex items-center gap-3 border-l-4 ${
            isActive
                ? "bg-theme-primary/10 text-theme-primary border-theme-primary"
                : "border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50"
            }`,
        themeToggleButton: (isActive: boolean) =>
            `flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md font-semibold transition-all w-full ${
            isActive
                ? "bg-theme-primary text-theme-text-on-primary shadow-md"
                : "bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300"
            }`,
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'general': return (
                <div className="space-y-6">
                    <h3 className={styleConfig.sectionTitle}>General Settings</h3>
                    <div className={styleConfig.card}>
                        <label className={styleConfig.label}>Bank Name</label>
                        <input type="text" value={settings.branding.bankName} onChange={e => handleBrandingChange('bankName', e.target.value)} className={styleConfig.input}/>
                    </div>
                     <div className={styleConfig.card}>
                        <label className={styleConfig.label}>Bank Type</label>
                        <p className={styleConfig.infoBox}>{gameState.bankType.charAt(0) + gameState.bankType.slice(1).toLowerCase()}</p>
                    </div>
                     <div className={styleConfig.card}>
                        <label className={styleConfig.label}>Difficulty</label>
                        <p className={styleConfig.infoBox}>{gameState.difficulty.charAt(0) + gameState.difficulty.slice(1).toLowerCase()}</p>
                    </div>
                </div>
            );
            case 'branding': return (
                 <div className="space-y-6">
                    <h3 className={styleConfig.sectionTitle}>Branding & Appearance</h3>
                    <div className={styleConfig.card}>
                        <label className={styleConfig.label}>UI Theme</label>
                        <div className="flex gap-2">
                            <button onClick={() => handleSettingsChange('themeStyle', 'light')} className={styleConfig.themeToggleButton(settings.themeStyle === 'light')}><SunIcon className="w-5 h-5 mr-1"/> Light</button>
                            <button onClick={() => handleSettingsChange('themeStyle', 'dark')} className={styleConfig.themeToggleButton(settings.themeStyle === 'dark')}><MoonIcon className="w-5 h-5 mr-1"/> Dark</button>
                        </div>
                    </div>
                    <div className={styleConfig.card}>
                        <label className={styleConfig.label}>Brand Color</label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                            {Object.keys(THEME_COLORS).map((key) => {
                                const colorKey = key as ThemeColorName;
                                const color = THEME_COLORS[colorKey];
                                return <button type="button" key={colorKey} onClick={() => handleBrandingChange('themeColor', colorKey)} className={`w-full h-10 rounded-full transition-all duration-200 ${settings.branding.themeColor === colorKey ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : 'hover:scale-110 hover:shadow-md'}`} style={{ backgroundColor: color.primary, '--tw-ring-color': color.primary } as React.CSSProperties} title={color.name} />;
                            })}
                        </div>
                    </div>
                    <div className={styleConfig.card}>
                        <label className={styleConfig.label}>Logo</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {Object.keys(LOGOS).map((key) => {
                                const logoKey = key as LogoName;
                                const LogoIcon = LOGOS[logoKey].icon;
                                const isActive = settings.branding.bankLogo === logoKey;
                                return <button type="button" key={logoKey} onClick={() => handleBrandingChange('bankLogo', logoKey)} className={`flex items-center justify-center p-3 rounded-md aspect-square transition-all bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 ${isActive ? 'ring-2' : ''}`} style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties} title={LOGOS[logoKey].name}><LogoIcon className={`w-8 h-8 transition-colors ${isActive ? 'text-theme-primary' : 'text-slate-500 dark:text-slate-400'}`} /></button>;
                            })}
                        </div>
                    </div>
                </div>
            );
            case 'platform': return (
                <div className="space-y-6">
                    <h3 className={styleConfig.sectionTitle}>Platform Settings</h3>
                     <div className={`${styleConfig.card} grid grid-cols-1 md:grid-cols-3 gap-4`}>
                        <div className="text-center"><p className="text-sm text-slate-500 dark:text-slate-400">App Version</p><p className="font-bold text-lg text-slate-800 dark:text-white">{gameState.appVersion}</p></div>
                        <div className="text-center"><p className="text-sm text-slate-500 dark:text-slate-400">Website Version</p><p className="font-bold text-lg text-slate-800 dark:text-white">{gameState.websiteVersion}</p></div>
                        <div className="text-center"><p className="text-sm text-slate-500 dark:text-slate-400">Server Status</p><p className="font-bold text-lg">{gameState.serverStatus}</p></div>
                    </div>
                </div>
            );
            case 'notifications': return (
                 <div className="space-y-6">
                    <h3 className={styleConfig.sectionTitle}>Notification Preferences</h3>
                    <div className={`${styleConfig.card} flex items-center justify-between`}>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">System Alerts</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">e.g., Server downtime, high risk warnings</p>
                        </div>
                        <button onClick={() => handleNotificationChange('systemAlerts', !settings.notifications.systemAlerts)} className={`${styleConfig.themeToggleButton(settings.notifications.systemAlerts)} w-auto px-3`}>{settings.notifications.systemAlerts ? <BellIcon className="w-5 h-5"/> : <BellOffIcon className="w-5 h-5"/>}</button>
                    </div>
                     <div className={`${styleConfig.card} flex items-center justify-between`}>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">Weekly Reports</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Receive a news update at the end of each week</p>
                        </div>
                        <button onClick={() => handleNotificationChange('playerAlerts', !settings.notifications.playerAlerts)} className={`${styleConfig.themeToggleButton(settings.notifications.playerAlerts)} w-auto px-3`}>{settings.notifications.playerAlerts ? <BellIcon className="w-5 h-5"/> : <BellOffIcon className="w-5 h-5"/>}</button>
                    </div>
                </div>
            );
            case 'advanced': return (
                 <div className="space-y-6">
                    <h3 className={`${styleConfig.sectionTitle} text-red-500`}>Advanced Settings</h3>
                    <div className={styleConfig.card}>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Save & Load Game</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[1, 2, 3].map(slot => (
                                <div key={slot} className={`${styleConfig.infoBox} flex flex-col justify-between border border-slate-200 dark:border-slate-600`}>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white">Slot {slot}</p>
                                        {saveSlots[slot - 1] ? (
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <p className="font-semibold text-slate-600 dark:text-slate-300 truncate">{saveSlots[slot-1]?.bankName}</p>
                                                <p>Week {saveSlots[slot-1]?.turn}</p>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-500 italic mt-1">Empty</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => handleSaveToSlot(slot)} className={`${styleConfig.secondaryButton} flex-1`} title={`Save to Slot ${slot}`}><SaveIcon className="w-4 h-4"/></button>
                                        <button onClick={() => onLoadGame(slot)} disabled={!saveSlots[slot - 1]} className={`${styleConfig.secondaryButton} flex-1`} title={`Load from Slot ${slot}`}><UploadIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styleConfig.card}>
                         <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Data & Progress</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             <button onClick={onExportData} className={styleConfig.secondaryButton}><FileDownIcon className="w-5 h-5 mr-2"/> Export Game History (CSV)</button>
                             <button onClick={() => {if(window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) onRestart()}} className={styleConfig.dangerButton}><RestartIcon className="w-5 h-5 mr-2"/> Reset Game Progress</button>
                         </div>
                    </div>
                </div>
            );
            default: return null;
        }
    }

    const sectionIcons: { [key in Section]: React.FC<any> } = {
        general: SettingsIcon,
        branding: PaintBrushIcon,
        platform: CodeIcon,
        notifications: BellIcon,
        advanced: RestartIcon,
    };

    return (
        <div className="animate-fade-in flex flex-col md:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <aside className="md:w-1/4 lg:w-1/5 flex-shrink-0">
                <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 h-full">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-slate-800 dark:text-white px-2">
                        <SettingsIcon className="w-6 h-6 text-theme-primary"/>
                        Settings
                    </h2>
                    <nav className="flex flex-col gap-1">
                        {(['general', 'branding', 'platform', 'notifications', 'advanced'] as Section[]).map(section => {
                            const Icon = sectionIcons[section];
                             return (
                                 <button 
                                    key={section}
                                    onClick={() => setActiveSection(section)} 
                                    className={styleConfig.sidebarButton(activeSection === section)}
                                 >
                                    <Icon className="w-5 h-5" />
                                    <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                                 </button>
                             );
                        })}
                    </nav>
                </div>
            </aside>
            {/* Content */}
            <main className="flex-grow">
                 <div className={`h-full ${activeSection !== 'advanced' ? 'flex flex-col' : ''}`}>
                    <div className="flex-grow">
                        {renderSection()}
                    </div>
                    {activeSection !== 'advanced' && (
                         <div className="mt-6 flex justify-end">
                             <button onClick={handleSave} className={styleConfig.primaryButton}>
                                <SaveIcon className="w-5 h-5 inline-block mr-2 -ml-1"/>
                                Save Settings
                             </button>
                         </div>
                    )}
                 </div>
            </main>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SettingsPage;
