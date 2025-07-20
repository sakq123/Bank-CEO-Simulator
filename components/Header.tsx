import React from 'react';
import { GameState } from '../types';
import { HelpIcon } from './Icons';
import { MONTH_NAMES, LOGOS } from '../constants';

interface HeaderProps {
    gameState: GameState;
    onOpenTutorial: React.MouseEventHandler<HTMLButtonElement>;
}

const Header: React.FC<HeaderProps> = ({ gameState, onOpenTutorial }) => {
    const LogoComponent = LOGOS[gameState.settings.branding.bankLogo].icon;

    return (
        <header className="mb-6 pb-4 border-b-2 border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <LogoComponent className="w-10 h-10 text-theme-primary" />
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{gameState.settings.branding.bankName}</h1>
                    <p className="text-sm text-slate-400">Your Decisions Shape the Future</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-theme-primary">Week {gameState.week}, {MONTH_NAMES[gameState.month - 1]} {gameState.year}</p>
                    <p className="text-sm text-slate-400">Week {gameState.turn + 1}</p>
                </div>
                <button 
                    onClick={onOpenTutorial} 
                    title="Help"
                    className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-theme-primary transition-colors duration-200"
                >
                    <HelpIcon className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

export default Header;