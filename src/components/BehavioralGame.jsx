import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { MASCOTS } from '../utils/GameState';

const BehavioralGame = ({ level, onComplete, onExit, playerHero }) => {
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [gameState, setGameState] = useState('PLAYING'); // PLAYING, WON, LOST

    const scenario = level.config?.scenario || '';
    const choices = level.config?.choices || [];
    const correctChoice = level.config?.correctChoice || 0;

    const handleChoiceSelect = (choiceIndex) => {
        if (showFeedback) return;
        
        setSelectedChoice(choiceIndex);
        setShowFeedback(true);
        
        const choice = choices[choiceIndex];
        if (choiceIndex === correctChoice) {
            setGameState('WON');
        } else if (choice.score === 0) {
            setGameState('LOST');
        } else {
            // Partial score - can continue but with penalty
            setTimeout(() => {
                setGameState('WON');
            }, 2000);
        }
    };

    const handleContinue = () => {
        if (gameState === 'WON') {
            onComplete(level.xpReward);
        } else {
            // Retry on loss
            setSelectedChoice(null);
            setShowFeedback(false);
            setGameState('PLAYING');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 relative">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
            `}</style>

            {/* Back Button */}
            <button
                onClick={onExit}
                className="absolute top-4 left-4 z-20 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
                <ArrowLeft size={16} /> Back
            </button>

            {/* Header */}
            <div className="mb-8 text-center animate-fadeIn">
                <h2 className="text-3xl font-bold text-neon-blue mb-2">{level.name}</h2>
                <p className="text-gray-400 text-lg">{level.desc}</p>
            </div>

            {/* Scenario Card */}
            <div className="w-full max-w-4xl mb-8 animate-fadeIn">
                <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
                    {/* Background Scene Indicator */}
                    <div className="flex items-center gap-3 mb-6 text-neon-blue">
                        <div className="w-16 h-16 rounded-full border-2 border-neon-blue overflow-hidden bg-slate-900 flex items-center justify-center">
                            {playerHero ? (
                                <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
                            ) : (
                                <AlertCircle size={32} className="text-neon-blue" />
                            )}
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-widest text-gray-500">SITUATION</div>
                            <div className="text-sm text-gray-400">Professional Scenario</div>
                        </div>
                    </div>

                    {/* Scenario Text */}
                    <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                        <p className="text-xl leading-relaxed text-gray-200">{scenario}</p>
                    </div>
                </div>
            </div>

            {/* Choices */}
            {!showFeedback && (
                <div className="w-full max-w-4xl space-y-4 animate-fadeIn">
                    <h3 className="text-xl font-bold text-center mb-4 text-neon-blue">What do you do?</h3>
                    {choices.map((choice, index) => (
                        <button
                            key={index}
                            onClick={() => handleChoiceSelect(index)}
                            className="w-full bg-slate-800/90 border-2 border-slate-700 rounded-xl p-6 text-left hover:border-neon-blue hover:bg-slate-800 transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center flex-shrink-0 group-hover:border-neon-blue transition-colors">
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-neon-blue">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                </div>
                                <p className="text-lg text-gray-200 flex-1">{choice.text}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Feedback */}
            {showFeedback && selectedChoice !== null && (
                <div className="w-full max-w-4xl animate-fadeIn">
                    <div className={`bg-slate-800/90 border-2 rounded-2xl p-8 ${
                        gameState === 'WON' && selectedChoice === correctChoice
                            ? 'border-green-500 shadow-[0_0_30px_rgba(0,255,65,0.3)]'
                            : gameState === 'LOST'
                            ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                            : 'border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                    }`}>
                        <div className="flex items-center gap-4 mb-6">
                            {gameState === 'WON' && selectedChoice === correctChoice ? (
                                <>
                                    <CheckCircle size={48} className="text-green-400" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-400">Excellent Choice!</h3>
                                        <p className="text-gray-400">You demonstrated professional leadership.</p>
                                    </div>
                                </>
                            ) : gameState === 'LOST' ? (
                                <>
                                    <XCircle size={48} className="text-red-400" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-red-400">Poor Decision</h3>
                                        <p className="text-gray-400">This choice had negative consequences.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={48} className="text-yellow-400" />
                                    <div>
                                        <h3 className="text-2xl font-bold text-yellow-400">Partially Correct</h3>
                                        <p className="text-gray-400">Good instinct, but not the best approach.</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                            <p className="text-lg leading-relaxed text-gray-200">
                                {choices[selectedChoice]?.feedback}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center">
                            {gameState === 'WON' ? (
                                <button
                                    onClick={handleContinue}
                                    className="px-8 py-3 bg-green-500 text-black font-bold rounded-full text-lg hover:bg-green-400 transition-all shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                                >
                                    CONTINUE (+{level.xpReward} XP)
                                </button>
                            ) : (
                                <button
                                    onClick={handleContinue}
                                    className="px-8 py-3 bg-slate-700 text-white font-bold rounded-full text-lg hover:bg-slate-600 transition-all"
                                >
                                    TRY AGAIN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BehavioralGame;

