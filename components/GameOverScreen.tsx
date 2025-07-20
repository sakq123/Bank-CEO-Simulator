import React from 'react';
import { GameState } from '../types';
import { RestartIcon } from './Icons';

interface GameOverScreenProps {
    gameState: GameState;
    onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameState, onRestart }) => {
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-50 p-4 text-center animate-fade-in-backdrop">
            <div className="bg-slate-800 rounded-xl shadow-2xl border-2 border-red-500/50 max-w-md w-full p-8 animate-slide-in-up">
                <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
                <p className="text-slate-300 text-lg mb-8">{gameState.gameOverMessage}</p>
                <button
                    onClick={onRestart}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold text-lg transition-all duration-300 
                           bg-theme-primary text-theme-text-on-primary
                           hover:bg-theme-primary-hover hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
                >
                    <RestartIcon />
                    Start New Game
                </button>
            </div>
            <style>{`
                @keyframes fade-in-backdrop {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-backdrop {
                    animation: fade-in-backdrop 0.5s ease-out forwards;
                }
                 @keyframes slide-in-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in-up {
                    animation: slide-in-up 0.5s ease-out 0.2s backwards;
                }
            `}</style>
        </div>
    );
};

export default GameOverScreen;