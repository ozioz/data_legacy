import React from 'react';
import { HEROES } from '../utils/GameState';
import { User, Code, BarChart } from 'lucide-react';

const HeroSelection = ({ onHeroSelect }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>

      <div className="text-center mb-12 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-4 animate-pulse-slow">
          DATA LEGACY
        </h1>
        <p className="text-xl text-gray-400 tracking-widest uppercase">Choose Your Career Path</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10">
        {Object.values(HEROES).map((hero) => (
          <div
            key={hero.id}
            onClick={() => onHeroSelect(hero)}
            className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-neon-blue hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col items-center"
          >
            <div className="w-32 h-32 md:w-48 md:h-48 mb-6 rounded-full overflow-hidden border-4 border-slate-600 group-hover:border-neon-blue transition-colors relative bg-slate-900">
              {/* Fallback icon if image fails, but we expect images to work */}
              <img
                src={hero.img}
                alt={hero.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden absolute inset-0 items-center justify-center text-gray-600">
                <User size={64} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">{hero.name}</h2>
            <p className="text-gray-400 text-center text-sm leading-relaxed">{hero.desc}</p>

            <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-neon-blue font-bold text-sm tracking-wider flex items-center gap-2">
              START CAREER <span className="text-lg">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSelection;
