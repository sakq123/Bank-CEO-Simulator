
import React, { useState } from 'react';
import { GameState } from '../types';
import { TUTORIAL_STEPS } from '../constants';

interface TutorialModalProps {
    onClose: () => void;
    gameState: GameState;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose, gameState }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const stepData = TUTORIAL_STEPS[currentStep];
    const Icon = stepData.icon;

    const handleNext = () => {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Finish on last step
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-backdrop">
            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-lg w-full p-6 sm:p-8 animate-slide-in-up flex flex-col">
                <div className="flex-grow">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-3 bg-theme-primary/10 rounded-full text-theme-primary">
                            <Icon className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3" dangerouslySetInnerHTML={{ __html: stepData.title.replace('[Bank Name]', gameState.settings.branding.bankName) }}></h2>
                        <p className="text-slate-300 text-base leading-relaxed">{stepData.content}</p>
                    </div>
                </div>

                <div className="mt-8">
                    {/* Step indicators */}
                    <div className="flex justify-center items-center gap-2 mb-6">
                        {TUTORIAL_STEPS.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentStep === index ? 'bg-theme-primary scale-125' : 'bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="grid grid-cols-2 gap-4">
                         <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="px-4 py-2 rounded-md font-semibold transition-all duration-200 
                                       bg-slate-700/50 text-slate-300 
                                       hover:bg-slate-600/70
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 rounded-md font-semibold transition-all duration-200 
                                       bg-theme-primary text-theme-text-on-primary
                                       hover:bg-theme-primary-hover"
                        >
                            {currentStep === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                    <div className="text-center mt-4">
                         <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                            Skip Tutorial
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .bg-theme-primary\\/10 {
                    background-color: var(--theme-primary-transparent, rgba(56, 189, 248, 0.1));
                }
                .text-theme-primary {
                    color: var(--theme-primary);
                }
                .bg-theme-primary {
                    background-color: var(--theme-primary);
                }
                 .text-theme-text-on-primary {
                    color: var(--theme-text-on-primary);
                }
                .hover\\:bg-theme-primary-hover:hover {
                    background-color: var(--theme-primary-hover);
                }
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
            `}</style>
        </div>
    );
};

export default TutorialModal;
