import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, AlertTriangle, Heart, Activity, Play } from 'lucide-react';
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '../utils/GameState';
import StoryModal from './StoryModal';

const LANES = [0, 1, 2];
const LANE_POSITIONS = ['16%', '50%', '83%'];

/**
 * NullRunner game component.
 * Props:
 *  - level: level configuration
 *  - onComplete: callback when level is won
 *  - onFail: callback when level is lost
 *  - onExit: callback to go back/exit the game
 *  - playerHero: optional image URL for the selected hero character
 */
const NullRunner = ({ level, onComplete, onExit, playerHero }) => {
    // Core state
    const [playerLane, setPlayerLane] = useState(1);
    const [objects, setObjects] = useState([]);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(3);
    const [gameSpeed, setGameSpeed] = useState(level.config.speed || 5);
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [gameState, setGameState] = useState('IDLE'); // IDLE | PLAYING | WON | LOST
    const [error, setError] = useState(null);
    const [showDebriefing, setShowDebriefing] = useState(false);

    const requestRef = useRef();
    const lastTimeRef = useRef();
    const spawnTimerRef = useRef(0);
    const speedTimerRef = useRef(0);
    const containerRef = useRef(null);

    const targetScore = level.config.target || 20;

    // ---------------------------------------------------------------------
    // Controls
    // ---------------------------------------------------------------------
    const moveLeft = useCallback(() => {
        if (gameState !== 'PLAYING') return;
        setPlayerLane((prev) => Math.max(0, prev - 1));
    }, [gameState]);

    const moveRight = useCallback(() => {
        if (gameState !== 'PLAYING') return;
        setPlayerLane((prev) => Math.min(2, prev + 1));
    }, [gameState]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') moveLeft();
            if (e.key === 'ArrowRight') moveRight();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [moveLeft, moveRight]);

    // ---------------------------------------------------------------------
    // Game loop
    // ---------------------------------------------------------------------
    const updateGame = useCallback(
        (time) => {
            if (gameState !== 'PLAYING') return;

            if (lastTimeRef.current === undefined) {
                lastTimeRef.current = time;
            }
            const deltaTime = (time - lastTimeRef.current) / 1000;
            lastTimeRef.current = time;

            try {
                // Spawn new objects
                spawnTimerRef.current += deltaTime;
                if (spawnTimerRef.current > 1.5 / (gameSpeed / 5)) {
                    spawnTimerRef.current = 0;
                    const type = Math.random() > 0.3 ? 'SIGNAL' : 'NOISE';
                    const lane = Math.floor(Math.random() * 3);
                    setObjects((prev) => [
                        ...prev,
                        { id: Date.now() + Math.random(), lane, y: -10, type },
                    ]);
                }

                // Speed increase over time
                speedTimerRef.current += deltaTime;
                if (speedTimerRef.current > 10) {
                    setGameSpeed((prev) => Math.min(prev + 2, 20));
                    speedTimerRef.current = 0;
                    addFloatingText('Speed Up!', 50, 50, 'text-yellow-400');
                }

                // Move objects and detect collisions
                setObjects((prevObjects) => {
                    const newObjects = [];
                    let hitSignal = false;
                    let hitNoise = false;

                    prevObjects.forEach((obj) => {
                        const newY = obj.y + gameSpeed * deltaTime * 10;
                        if (obj.lane === playerLane && newY > 80 && newY < 90) {
                            if (obj.type === 'SIGNAL') hitSignal = true;
                            else hitNoise = true;
                        } else if (newY < 100) {
                            newObjects.push({ ...obj, y: newY });
                        }
                    });

                    if (hitSignal) {
                        setScore((s) => {
                            const newScore = s + 1;
                            if (newScore >= targetScore) {
                                setGameState('WON');
                                setShowDebriefing(true);
                            }
                            return newScore;
                        });
                        addFloatingText('Signal Acquired!', 50, 40, 'text-green-400');
                    }

                    if (hitNoise) {
                        setHealth((h) => {
                            const newHealth = h - 1;
                            if (newHealth <= 0) {
                                setGameState('LOST');
                            }
                            return newHealth;
                        });
                        addFloatingText('Noise Detected!', 50, 40, 'text-red-500');
                    }

                    return newObjects;
                });

                // Update floating texts (fade out)
                setFloatingTexts((prev) =>
                    prev
                        .map((ft) => ({ ...ft, y: ft.y - 10 * deltaTime, opacity: ft.opacity - 0.5 * deltaTime }))
                        .filter((ft) => ft.opacity > 0)
                );

                requestRef.current = requestAnimationFrame(updateGame);
            } catch (err) {
                console.error('Game Loop Error:', err);
                setError('Game Loop Crashed. Please Restart.');
                setGameState('IDLE');
            }
        },
        [gameState, gameSpeed, playerLane, targetScore, onComplete]
    );

    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(updateGame);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameState, updateGame]);

    const addFloatingText = (text, x, y, color) => {
        setFloatingTexts((prev) => [...prev, { id: Date.now(), text, x, y, color, opacity: 1 }]);
    };

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setHealth(3);
        setObjects([]);
        setGameSpeed(level.config.speed || 5);
        lastTimeRef.current = undefined;
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------
    if (error) {
        return (
            <div className="text-red-500 text-center p-10 bg-gray-900 h-[600px] flex items-center justify-center">{error}</div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-center bg-slate-900 p-4">
            {/* Styles */}
            <style>{`
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bob { animation: bob 1s infinite ease-in-out; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

            {/* Hero / Mascot */}
            <div className="mb-6 flex flex-col items-center animate-float">
                <div className="w-32 h-32 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                    {playerHero ? (
                        <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-cover" />
                    ) : (
                        MASCOTS && MASCOTS.runner && (
                            <img src={MASCOTS.runner} alt="Runner Bot" className="w-full h-full object-cover" />
                        )
                    )}
                </div>
                <h2 className="text-xl font-bold text-neon-blue mt-2">{level.name}</h2>
                <p className="text-gray-400 text-sm">{level.desc}</p>
            </div>

            {/* Game container */}
            <div ref={containerRef} className="relative w-full max-w-md h-[600px] bg-gray-800 border-2 border-slate-600 rounded-xl overflow-hidden shadow-2xl">
                {/* HUD */}
                <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                    <Heart className="text-red-500" fill="currentColor" />
                    <span className="text-white text-xl font-bold">{health}</span>
                    <button onClick={onExit} className="ml-4 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all">Back</button>
                </div>
                <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
                    <Activity className="text-green-400" />
                    <span className="text-white text-xl font-bold">{score} / {targetScore}</span>
                </div>

                {/* Lane separators */}
                <div className="absolute inset-0 flex pointer-events-none">
                    <div className="w-1/3 h-full border-r-2 border-dashed border-gray-700/50" />
                    <div className="w-1/3 h-full border-r-2 border-dashed border-gray-700/50" />
                    <div className="w-1/3 h-full" />
                </div>

                {/* Player avatar */}
                <div
                    className="absolute bottom-[10%] transition-all duration-100 ease-linear z-10"
                    style={{ left: LANE_POSITIONS[playerLane], transform: 'translateX(-50%)', width: '33%', display: 'flex', justifyContent: 'center' }}
                >
                    <div className="w-20 h-20 flex items-center justify-center animate-bob">
                        {playerHero ? (
                            <img src={playerHero.img} alt="Player Hero" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                        ) : (
                            MASCOTS && MASCOTS.runner && (
                                <img src={MASCOTS.runner} alt="Runner" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                            )
                        )}
                    </div>
                </div>

                {/* Objects */}
                {objects.map((obj) => (
                    <div
                        key={obj.id}
                        className="absolute transition-none z-10"
                        style={{ left: LANE_POSITIONS[obj.lane], top: `${obj.y}%`, transform: 'translateX(-50%)', width: '33%', display: 'flex', justifyContent: 'center' }}
                    >
                        {obj.type === 'SIGNAL' ? (
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                                <Zap className="text-green-400 w-6 h-6" fill="currentColor" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-red-500/20 rotate-45 flex items-center justify-center border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                                <AlertTriangle className="text-red-500 w-6 h-6 -rotate-45" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Floating texts */}
                {floatingTexts.map((ft) => (
                    <div
                        key={ft.id}
                        className={`absolute text-lg font-bold ${ft.color} pointer-events-none whitespace-nowrap z-30`}
                        style={{ left: '50%', top: `${ft.y}%`, transform: 'translate(-50%, -50%)', opacity: ft.opacity }}
                    >
                        {ft.text}
                    </div>
                ))}

                {/* Overlays for game states */}
                {gameState !== 'PLAYING' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                        {gameState === 'IDLE' && (
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-white mb-4">READY?</h2>
                                <button onClick={startGame} className="px-8 py-4 bg-neon-blue text-black font-bold rounded-full text-xl hover:bg-cyan-400 transition-all flex items-center gap-2">
                                    <Play fill="currentColor" /> START RUN
                                </button>
                            </div>
                        )}
                        {gameState === 'WON' && !showDebriefing && (
                            <div className="text-center">
                                <h2 className="text-4xl font-bold text-green-400 mb-4">LEVEL COMPLETE!</h2>
                                <p className="text-gray-300 mb-8 text-xl">Signal Acquired.</p>
                            </div>
                        )}
                        {gameState === 'LOST' && (
                            <div className="flex flex-col items-center space-y-4">
                                <h2 className="text-4xl font-bold text-red-500 mb-2">YOU LOST</h2>
                                <div className="flex space-x-4">
                                    <button onClick={startGame} className="px-6 py-2 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all">Retry</button>
                                    <button onClick={onExit} className="px-6 py-2 bg-slate-700 text-white rounded-full hover:bg-slate-600">Go Back</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Click zones for lane movement */}
                <div className="absolute inset-0 flex z-0">
                    <div className="w-1/2 h-full" onClick={moveLeft} />
                    <div className="w-1/2 h-full" onClick={moveRight} />
                </div>
            </div>

            {/* Mission Debriefing Modal */}
            <StoryModal
                isOpen={showDebriefing}
                type="debriefing"
                topic={GAME_STORIES[GAME_TYPES.RUNNER]?.topic || 'Mission Complete'}
                story={GAME_STORIES[GAME_TYPES.RUNNER]?.impact || 'Mission completed successfully.'}
                mascot={MASCOTS.runner}
                levelName={level.name}
                onClose={() => {
                    setShowDebriefing(false);
                    setGameState('IDLE');
                }}
                onAction={() => {
                    setShowDebriefing(false);
                    onComplete(level.xpReward);
                }}
                actionLabel="RETURN TO HQ"
            />
        </div>
    );
};

export default NullRunner;
