import React, { useState, useEffect } from 'react';
import { Sprout, Database, CloudRain, ArrowLeft } from 'lucide-react';
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '../utils/GameState';
import StoryModal from './StoryModal';

const DataFarm = ({ level, onComplete, onExit, playerHero }) => {
    const [plots, setPlots] = useState(Array(16).fill(null).map((_, i) => ({ id: i, status: 'EMPTY', progress: 0 })));
    const [harvested, setHarvested] = useState(0);
    const [status, setStatus] = useState('PLAYING');
    const [showDebriefing, setShowDebriefing] = useState(false);

    const TARGET = level.config.target || 10;

    useEffect(() => {
        if (harvested >= TARGET) {
            setStatus('WON');
            setShowDebriefing(true);
        }
    }, [harvested, TARGET]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlots(prev => prev.map(plot => {
                if (plot.status === 'GROWING') {
                    const newProgress = plot.progress + 10;
                    if (newProgress >= 100) {
                        return { ...plot, status: 'READY', progress: 100 };
                    }
                    return { ...plot, progress: newProgress };
                }
                return plot;
            }));
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handlePlotClick = (index) => {
        const plot = plots[index];

        if (plot.status === 'EMPTY') {
            const newPlots = [...plots];
            newPlots[index] = { ...plot, status: 'GROWING', progress: 0 };
            setPlots(newPlots);
        } else if (plot.status === 'READY') {
            const newPlots = [...plots];
            newPlots[index] = { ...plot, status: 'EMPTY', progress: 0 };
            setPlots(newPlots);
            setHarvested(h => h + 1);
        }
    };

    return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden p-4">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>

            {/* Mascot Display */}
            <div className="mb-6 flex flex-col items-center animate-float">
                <div className="w-32 h-32 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                    {playerHero ? (
                        <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
                    ) : (
                        MASCOTS && MASCOTS.farm && (
                            <img src={MASCOTS.farm} alt="Farmer" className="w-full h-full object-cover" />
                        )
                    )}
                </div>
                <h2 className="text-xl font-bold text-neon-blue mt-2">{level.name}</h2>
                <p className="text-gray-400 text-sm">{level.desc}</p>
                <button onClick={onExit} className="mt-4 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                </button>
            </div>

            {/* Game Container */}
            <div className="relative w-full max-w-2xl bg-slate-800/50 rounded-xl border border-slate-700 p-6 shadow-2xl backdrop-blur-sm flex flex-col">

                {/* HUD */}
                <div className="p-4 bg-slate-800 border-b border-green-500/30 flex justify-between items-center z-20 rounded-t-xl">
                    <div>
                        <h2 className="font-bold text-xl text-green-400 flex items-center gap-2">
                            <Sprout size={20} /> DATA FARM
                        </h2>
                        <p className="text-sm text-gray-400">Grow and Harvest Data!</p>
                    </div>
                    <div className="font-mono font-bold text-2xl text-green-400 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Database size={24} /> {harvested} / {TARGET} TB
                        </div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-4 rounded-b-xl">
                    <div className="grid grid-cols-4 gap-4 max-w-md w-full">
                        {plots.map((plot, index) => (
                            <div
                                key={plot.id}
                                onClick={() => handlePlotClick(index)}
                                className={`
                    aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
                    ${plot.status === 'EMPTY'
                                        ? 'bg-slate-800 border-slate-700 hover:border-green-500/50 hover:bg-slate-700'
                                        : plot.status === 'GROWING'
                                            ? 'bg-green-900/20 border-green-800'
                                            : 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-bounce-small'}
                `}
                            >
                                {plot.status === 'EMPTY' && (
                                    <CloudRain size={32} className="text-gray-600" />
                                )}

                                {plot.status === 'GROWING' && (
                                    <>
                                        <Sprout size={32} className="text-green-600 animate-pulse" />
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-700">
                                            <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${plot.progress}%` }}></div>
                                        </div>
                                    </>
                                )}

                                {plot.status === 'READY' && (
                                    <Database size={40} className="text-white" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Mission Debriefing Modal */}
            <StoryModal
                isOpen={showDebriefing}
                type="debriefing"
                topic={GAME_STORIES[GAME_TYPES.FARM]?.topic || 'Mission Complete'}
                story={GAME_STORIES[GAME_TYPES.FARM]?.impact || 'Mission completed successfully.'}
                mascot={MASCOTS.farm}
                levelName={level.name}
                onClose={() => {
                    setShowDebriefing(false);
                }}
                onAction={() => {
                    setShowDebriefing(false);
                    onComplete(level.xpReward);
                }}
                actionLabel="RETURN TO HQ"
            />

            <div className="p-4 text-center text-gray-500 text-sm">
                Tap Empty to Plant • Wait • Tap Ready to Harvest
            </div>
        </div>
    );
};

export default DataFarm;
