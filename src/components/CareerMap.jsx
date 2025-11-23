import React from 'react';
import { LEVELS, CAREER_PATHS } from '../utils/GameState';
import { Lock, Play, Check, Star, Trophy, MapPin, Home } from 'lucide-react';

const CareerMap = ({ hero, path, unlockedLevels, onLevelSelect, onHome }) => {
    // Filter and sort levels for this hero and path
    const heroLevels = Object.values(LEVELS)
        .filter(lvl => {
            const id = lvl.id;
            // Check if level belongs to this hero
            if (!id.startsWith(hero.id)) return false;
            
            // Filter by path
            if (path === CAREER_PATHS.TECHNICAL) {
                // Technical path: exclude behavioral levels
                return !id.includes('BEHAVIORAL');
            } else if (path === CAREER_PATHS.BEHAVIORAL) {
                // Behavioral path: only behavioral levels
                return id.includes('BEHAVIORAL');
            }
            return false;
        })
        .sort((a, b) => {
            // Sort behavioral levels by number
            const aParts = a.id.split('_');
            const bParts = b.id.split('_');
            const numA = parseInt(aParts[aParts.length - 1]);
            const numB = parseInt(bParts[bParts.length - 1]);
            return numA - numB;
        });

    const isMasteryUnlocked = unlockedLevels.includes(`${hero.id}_11`);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

            {/* Header */}
            <div className="z-20 w-full max-w-2xl flex justify-between items-center mb-8">
                <button onClick={onHome} className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-gray-400 hover:text-white transition-all">
                    <Home size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-3xl md:text-4xl font-bold neon-text">CAREER PATH</h2>
                    <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={16} className="text-neon-blue" />
                        <span className="uppercase tracking-widest text-sm md:text-base">{hero.name}</span>
                        <span className="text-gray-600">•</span>
                        <span className="uppercase tracking-widest text-sm md:text-base">
                            {path === CAREER_PATHS.TECHNICAL ? 'Technical' : 'Behavioral'}
                        </span>
                    </div>
                </div>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            <div className="w-full max-w-2xl relative p-4 pb-32 overflow-y-auto no-scrollbar">
                {/* Winding Path Container */}
                <div className="flex flex-col items-center gap-16 relative pt-8">

                    {/* Connecting Line (Simplified Central Spine for Mobile, Winding for Desktop?) 
              Actually, let's just use a central dashed line that the nodes sit on top of.
          */}
                    <div className="absolute top-0 bottom-0 w-1 border-l-2 border-dashed border-slate-700 left-1/2 transform -translate-x-1/2 z-0"></div>

                    {heroLevels.map((level, index) => {
                        const levelNum = index + 1;
                        const isUnlocked = unlockedLevels.includes(level.id);
                        const isCompleted = unlockedLevels.includes(heroLevels[index + 1]?.id) || (index === 9 && isMasteryUnlocked);

                        // Zig-Zag Logic:
                        // 0: Left, 1: Right, 2: Left, 3: Right...
                        // Or maybe a gentler curve.
                        // Let's do Left (-x), Center (0), Right (+x), Center (0)...
                        // 0: -20, 1: 0, 2: 20, 3: 0, 4: -20...

                        let alignClass = '';
                        const mod = index % 4;
                        if (mod === 0) alignClass = 'self-start md:ml-24'; // Left
                        if (mod === 1) alignClass = 'self-center'; // Center
                        if (mod === 2) alignClass = 'self-end md:mr-24'; // Right
                        if (mod === 3) alignClass = 'self-center'; // Center

                        return (
                            <div key={level.id} className={`relative z-10 flex flex-col items-center group ${alignClass} transition-all duration-500`}>

                                {/* Node Button */}
                                <button
                                    onClick={() => isUnlocked && onLevelSelect(level)}
                                    disabled={!isUnlocked}
                                    className={`
                    w-24 h-24 md:w-28 md:h-28 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative
                    ${isCompleted
                                            ? 'bg-green-900 border-green-500 text-green-400 shadow-[0_0_30px_rgba(0,255,0,0.4)] scale-105'
                                            : isUnlocked
                                                ? 'bg-slate-800 border-neon-blue text-white animate-pulse shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:scale-110 hover:rotate-3'
                                                : 'bg-slate-800 border-slate-700 text-gray-600 cursor-not-allowed grayscale'}
                  `}
                                >
                                    {isCompleted ? (
                                        <div className="relative">
                                            <Check size={40} strokeWidth={3} />
                                            <Star size={20} className="absolute -top-3 -right-3 text-yellow-400 fill-yellow-400 animate-spin-slow" />
                                        </div>
                                    ) : isUnlocked ? (
                                        <Play size={40} fill="currentColor" className="ml-1" />
                                    ) : (
                                        <Lock size={32} />
                                    )}

                                    {/* Level Number Badge */}
                                    <div className={`
                    absolute -top-2 -left-2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold z-20
                    ${isUnlocked ? 'bg-slate-900 border-white text-white' : 'bg-slate-800 border-gray-600 text-gray-500'}
                  `}>
                                        {levelNum}
                                    </div>
                                </button>

                                {/* Label */}
                                <div className={`
                  mt-4 text-center p-2 rounded-lg border backdrop-blur-sm transition-all w-40
                  ${isUnlocked
                                        ? 'bg-slate-800/90 border-neon-blue shadow-lg transform hover:-translate-y-1'
                                        : 'bg-slate-900/50 border-slate-800 opacity-50'}
                `}>
                                    <h3 className={`font-bold text-xs md:text-sm ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{level.name}</h3>
                                    {isUnlocked && <p className="text-[10px] text-neon-blue mt-1 font-mono">XP: {level.xpReward}</p>}
                                </div>
                            </div>
                        );
                    })}

                    {/* Mastery Trophy */}
                    {isMasteryUnlocked && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in zoom-in duration-700">
                            <div className="flex flex-col items-center p-12 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-4 border-yellow-500 shadow-[0_0_100px_rgba(255,215,0,0.5)] text-center max-w-md mx-4">
                                <div className="w-40 h-40 bg-yellow-500/20 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-[0_0_50px_rgba(255,215,0,0.6)] mb-8 animate-bounce">
                                    <Trophy size={80} className="text-yellow-400 fill-yellow-400" />
                                </div>
                                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-4 uppercase tracking-widest">
                                    Career Mastered!
                                </h2>
                                <p className="text-gray-300 mb-8 text-lg">
                                    You have completed all 10 levels and proven yourself as a Senior {hero.name}.
                                </p>
                                <button
                                    onClick={onHome}
                                    className="bg-yellow-500 text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-yellow-400 shadow-lg hover:scale-105 transition-all"
                                >
                                    RETURN HOME
                                </button>
                            </div>

                            {/* Confetti (CSS only for now, could use canvas but let's keep it simple) */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        animationDelay: `${Math.random() * 2}s`,
                                        animationDuration: `${1 + Math.random()}s`
                                    }}></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerMap;
