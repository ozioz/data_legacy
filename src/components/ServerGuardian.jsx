import React, { useState, useEffect, useRef } from 'react';
import { Shield, Bug, Zap, Database, AlertTriangle } from 'lucide-react';
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '../utils/GameState';
import StoryModal from './StoryModal';

const ServerGuardian = ({ level, onComplete, onExit, playerHero }) => {
    const [enemies, setEnemies] = useState([]);
    const [towers, setTowers] = useState([]);
    const [projectiles, setProjectiles] = useState([]);
    const [energy, setEnergy] = useState(100);
    const [health, setHealth] = useState(3);
    const [timeLeft, setTimeLeft] = useState(level.config.duration);
    const [status, setStatus] = useState('PLAYING');
    const [isShaking, setIsShaking] = useState(false);
    const [showDebriefing, setShowDebriefing] = useState(false);

    const gameLoopRef = useRef();
    const lastSpawnRef = useRef(0);

    const SPAWN_RATE = level.config.spawnRate || 1000;
    const ENEMY_SPEED = 0.2;
    const PROJECTILE_SPEED = 2;
    const TOWER_COST = 40;
    const TOWER_RANGE = 30;
    const TOWER_COOLDOWN = 60;

    useEffect(() => {
        if (health < 3) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 500);
            return () => clearTimeout(timer);
        }
    }, [health]);

    useEffect(() => {
        let frameId;
        const loop = (time) => {
            if (status !== 'PLAYING') return;

            if (time - lastSpawnRef.current > SPAWN_RATE) {
                setEnemies(prev => [...prev, { id: Date.now(), x: 0, hp: 100, maxHp: 100 }]);
                lastSpawnRef.current = time;
            }

            setEnemies(prev => {
                const next = [];
                prev.forEach(e => {
                    const newX = e.x + ENEMY_SPEED;
                    if (newX >= 95) {
                        setHealth(h => h - 1);
                    } else {
                        next.push({ ...e, x: newX });
                    }
                });
                return next;
            });

            setTowers(prev => prev.map(t => {
                if (t.cooldown > 0) return { ...t, cooldown: t.cooldown - 1 };

                const target = enemies.find(e => Math.abs(e.x - t.x) < TOWER_RANGE);
                if (target) {
                    setProjectiles(p => [...p, { id: Date.now() + Math.random(), x: t.x, targetId: target.id }]);
                    return { ...t, cooldown: TOWER_COOLDOWN };
                }
                return t;
            }));

            setProjectiles(prev => {
                const next = [];
                prev.forEach(p => {
                    const target = enemies.find(e => e.id === p.targetId);
                    if (target) {
                        const dir = target.x > p.x ? 1 : -1;
                        const newX = p.x + (PROJECTILE_SPEED * dir);

                        if (Math.abs(newX - target.x) < 2) {
                            setEnemies(es => es.map(e => e.id === target.id ? { ...e, hp: e.hp - 35 } : e).filter(e => e.hp > 0));
                        } else {
                            next.push({ ...p, x: newX });
                        }
                    }
                });
                return next;
            });

            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [enemies, status, SPAWN_RATE]);

    useEffect(() => {
        if (status !== 'PLAYING') return;

        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setStatus('WON');
                    setShowDebriefing(true);
                    return 0;
                }
                setEnergy(e => Math.min(e + 5, 100));
                return t - 1;
            });
        }, 1000);

        if (health <= 0) setStatus('LOST');

        return () => clearInterval(timer);
    }, [health, status]);

    const placeTower = (x) => {
        if (energy >= TOWER_COST && status === 'PLAYING') {
            setTowers([...towers, { id: Date.now(), x, cooldown: 0 }]);
            setEnergy(e => e - TOWER_COST);
        }
    };

    return (
        <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden p-4">
            <style>{`
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
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
                        MASCOTS && MASCOTS.defense && (
                            <img src={MASCOTS.defense} alt="Defense Bot" className="w-full h-full object-cover" />
                        )
                    )}
                </div>
                <h2 className="text-xl font-bold text-neon-blue mt-2">{level.name}</h2>
                <p className="text-gray-400 text-sm">{level.desc}</p>
            </div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[500px] bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col">

                {/* HUD */}
                <div className="p-4 bg-slate-800 border-b border-red-500/30 flex justify-between items-center z-20 shadow-md">
                    <div>
                        <h2 className="font-bold text-xl text-red-400 flex items-center gap-2">
                            <Shield size={20} /> SERVER GUARDIAN
                        </h2>
                        <p className="text-sm text-gray-400">Protect the Database!</p>
                    </div>
                    <div className="flex items-center gap-6 font-mono font-bold">
                        <div className="text-yellow-400 flex items-center gap-1"><Zap size={16} /> {energy}</div>
                        <div className="text-red-400 flex items-center gap-1"><AlertTriangle size={16} /> {health} HP</div>
                        <button onClick={onExit} className="ml-4 px-3 py-1 bg-neon-blue text-black rounded-full hover:bg-cyan-400 transition-all">Back</button>
                        <div className="text-white text-xl">{timeLeft}s</div>
                    </div>
                </div>

                {/* Game Area */}
                <div className="flex-1 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                    <div className="w-full max-w-5xl h-32 bg-slate-800 relative border-y-2 border-slate-700 flex items-center">

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4 z-10">
                            <div className={`w-24 h-24 rounded-full border-4 border-blue-500 overflow-hidden bg-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.5)] ${isShaking ? 'animate-shake border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : ''}`}>
                                {MASCOTS && MASCOTS.defense && <img src={MASCOTS.defense} alt="Base" className="w-full h-full object-cover" />}
                            </div>
                        </div>

                        <div className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-red-500/20">
                            <Bug size={48} />
                        </div>

                        {[10, 20, 30, 40, 50, 60, 70, 80].map(pos => (
                            <div
                                key={pos}
                                onClick={() => placeTower(pos)}
                                className="absolute top-[-60px] w-12 h-12 -ml-6 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors"
                                style={{ left: `${pos}%` }}
                            >
                                {towers.find(t => t.x === pos) ? (
                                    <div className="w-10 h-10 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(255,215,0,0.5)] flex items-center justify-center">
                                        <Zap size={20} className="text-black" />
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-600">{TOWER_COST}</span>
                                )}
                            </div>
                        ))}

                        {enemies.map(e => (
                            <div
                                key={e.id}
                                className="absolute top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-transform"
                                style={{ left: `${e.x}%` }}
                            >
                                <Bug size={16} className="text-black" />
                                <div className="absolute -top-3 left-0 w-full h-1 bg-slate-700 rounded">
                                    <div className="h-full bg-green-500 rounded" style={{ width: `${(e.hp / e.maxHp) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}

                        {projectiles.map(p => (
                            <div
                                key={p.id}
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_5px_rgba(255,255,0,0.8)]"
                                style={{ left: `${p.x}%` }}
                            ></div>
                        ))}

                    </div>
                </div>

                {status !== 'PLAYING' && status !== 'WON' && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 p-8 rounded-2xl border-2 border-slate-600 text-center max-w-sm w-full">
                            {status === 'LOST' && (
                                <>
                                    <h2 className="text-3xl font-bold text-red-500 mb-4">SYSTEM BREACHED</h2>
                                    <p className="text-gray-300 mb-8">Too many bugs reached the database!</p>
                                    <button
                                        onClick={onExit}
                                        className="w-full bg-slate-700 text-white font-bold py-3 rounded-full hover:bg-slate-600"
                                    >
                                        RETREAT
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mission Debriefing Modal */}
            <StoryModal
                isOpen={showDebriefing}
                type="debriefing"
                    topic={GAME_STORIES[GAME_TYPES.TOWER]?.topic || 'Mission Complete'}
                    story={GAME_STORIES[GAME_TYPES.TOWER]?.impact || 'Mission completed successfully.'}
                    mascot={MASCOTS.defense}
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
            )}
        </div>
    );
};

export default ServerGuardian;
