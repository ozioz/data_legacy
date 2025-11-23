import React, { useState } from 'react';
import { ITEMS, MASCOTS, GAME_STORIES, GAME_TYPES } from '../utils/GameState';
import { ArrowRight, Play, ArrowLeft } from 'lucide-react';
import StoryModal from './StoryModal';

const PipelinePuzzle = ({ level, onComplete, onExit, playerHero }) => {
    const correctSequence = level.config?.sequence || [];
    const extraItems = level.config?.extra || [];
    const inventory = [...correctSequence, ...extraItems];

    const [slots, setSlots] = useState(Array(correctSequence.length).fill(null));
    const [status, setStatus] = useState('IDLE');
    const [message, setMessage] = useState('');
    const [showBriefing, setShowBriefing] = useState(false);
    const [showDebriefing, setShowDebriefing] = useState(false);
    const [hintCount, setHintCount] = useState(0);

    const handleInventoryClick = (itemId) => {
        if (status === 'SUCCESS') return;
        const emptyIndex = slots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            const newSlots = [...slots];
            newSlots[emptyIndex] = itemId;
            setSlots(newSlots);
            setStatus('IDLE');
            setMessage('');
        }
    };

    const handleSlotClick = (index) => {
        if (status === 'SUCCESS') return;
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        setStatus('IDLE');
        setMessage('');
    };

    const handleHint = () => {
        if (status === 'SUCCESS') return;
        const incorrectIndex = slots.findIndex((itemId, index) => itemId !== correctSequence[index]);
        if (incorrectIndex !== -1) {
            const newSlots = [...slots];
            newSlots[incorrectIndex] = correctSequence[incorrectIndex];
            setSlots(newSlots);
            setHintCount(prev => prev + 1);
            setMessage(`Hint used! XP reduced by 20%. (Total: -${(hintCount + 1) * 20}%)`);
        } else {
            setMessage('All filled slots are correct so far!');
        }
    };

    const handleExecute = () => {
        if (slots.includes(null)) {
            setStatus('ERROR');
            setMessage('Pipeline incomplete! Fill all slots.');
            return;
        }
        const isCorrect = slots.every((id, index) => id === correctSequence[index]);
        if (isCorrect) {
            setStatus('SUCCESS');
            setMessage('Pipeline Executed Successfully!');
        } else {
            setStatus('ERROR');
            setMessage('Pipeline Failed! Invalid sequence logic.');
        }
    };

    const handleContinue = () => {
        setShowDebriefing(true);
    };

    const handleReturnToHQ = () => {
        const penaltyMultiplier = Math.max(0, 1 - (hintCount * 0.2));
        const finalXP = Math.floor(level.xpReward * penaltyMultiplier);
        setShowDebriefing(false);
        onComplete(finalXP);
    };

    return (
        <div className="h-screen bg-slate-900 flex flex-col text-white relative">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>

            {showBriefing && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-800 border-2 border-neon-blue rounded-xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                        <div className="flex items-center gap-3 mb-4 text-neon-blue">
                            <div className="w-16 h-16 rounded-full border-2 border-neon-blue overflow-hidden bg-slate-900">
                                {playerHero ? (
                                    <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
                                ) : (
                                    MASCOTS && MASCOTS.pipeline && <img src={MASCOTS.pipeline} alt="Pipeline Bot" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <h2 className="text-2xl font-bold uppercase tracking-wider">Client Request</h2>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                        <p className="text-gray-300 mb-8 leading-relaxed text-lg">{level.scenario}</p>
                        <button onClick={() => setShowBriefing(false)} className="w-full bg-neon-blue text-black font-bold py-4 rounded hover:bg-cyan-400 transition-all">
                            ACCEPT MISSION
                        </button>
                    </div>
                </div>
            )}

            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-xl text-neon-blue">{level.name}</h2>
                    <p className="text-sm text-gray-400">{level.desc}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onExit} className="px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2">
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Pipeline Slots */}
                    <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
                        {slots.map((itemId, index) => (
                            <React.Fragment key={index}>
                                <div onClick={() => handleSlotClick(index)} className={`w-20 h-20 md:w-24 md:h-24 border-2 rounded-xl flex items-center justify-center cursor-pointer transition-all relative ${itemId ? 'bg-slate-700 border-neon-blue shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'bg-slate-800/50 border-slate-600 border-dashed hover:border-gray-400'}`}>
                                    {itemId ? (
                                        <div className="text-center p-1 w-full overflow-hidden">
                                            <div className="font-bold text-[10px] md:text-xs leading-tight break-words">{ITEMS[itemId].name}</div>
                                            <div className="text-[8px] text-gray-400 mt-1 hidden md:block">{ITEMS[itemId].type}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 font-mono text-xl">{index + 1}</span>
                                    )}
                                </div>
                                {index < slots.length - 1 && <ArrowRight className="text-gray-600" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`px-6 py-3 rounded-full font-bold text-center mb-6 ${
                            status === 'SUCCESS' ? 'bg-green-500 text-black' : 
                            status === 'ERROR' ? 'bg-red-500 text-white' : 
                            'bg-yellow-500 text-black'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-4 mb-8">
                        {status === 'SUCCESS' && !showDebriefing ? (
                            <button onClick={handleContinue} className="bg-neon-green text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-green-400 shadow-[0_0_20px_rgba(0,255,65,0.5)] animate-pulse">
                                CONTINUE (+{Math.floor(level.xpReward * Math.max(0, 1 - (hintCount * 0.2)))} XP)
                            </button>
                        ) : status !== 'SUCCESS' && (
                            <div className="flex gap-4">
                                <button onClick={handleHint} disabled={status === 'SUCCESS'} className="flex items-center gap-2 px-4 py-2 rounded border font-bold transition-all bg-yellow-500/10 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20">
                                    HINT (-20%)
                                </button>
                                <button onClick={handleExecute} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-500 flex items-center gap-2 shadow-lg hover:shadow-blue-500/50 transition-all">
                                    <Play fill="currentColor" size={20} /> RUN PIPELINE
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Available Components */}
                    <div className="bg-slate-800 p-4 border-t border-slate-700 rounded-xl">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Available Components</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {inventory.map((itemId, idx) => (
                                <button key={`${itemId}-${idx}`} onClick={() => handleInventoryClick(itemId)} className="bg-slate-700 hover:bg-slate-600 p-3 rounded border border-slate-600 hover:border-neon-blue transition-all text-left group h-full">
                                    <div className="font-bold text-[10px] md:text-xs text-white truncate group-hover:text-neon-blue">{ITEMS[itemId].name}</div>
                                    <div className="text-[8px] text-gray-400">{ITEMS[itemId].type}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mission Debriefing Modal */}
            <StoryModal
                isOpen={showDebriefing}
                type="debriefing"
                topic={GAME_STORIES[GAME_TYPES.PIPELINE]?.topic || 'Mission Complete'}
                story={GAME_STORIES[GAME_TYPES.PIPELINE]?.impact || 'Mission completed successfully.'}
                mascot={MASCOTS.pipeline}
                levelName={level.name}
                onClose={() => {
                    setShowDebriefing(false);
                }}
                onAction={handleReturnToHQ}
                actionLabel="RETURN TO HQ"
            />
        </div>
    );
};

export default PipelinePuzzle;
