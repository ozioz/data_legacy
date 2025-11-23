import React from 'react';
import { Code, Handshake, ArrowLeft } from 'lucide-react';
import { CAREER_PATHS } from '../utils/GameState';

const PathSelection = ({ hero, onPathSelect, onBack }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>

            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-4 left-4 z-20 p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-gray-400 hover:text-white transition-all"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-12 z-10">
                <div className="mb-6">
                    <div className="w-32 h-32 mx-auto rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)]">
                        <img src={hero.img} alt={hero.name} className="w-full h-full object-cover" />
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-4">
                    FORK IN THE ROAD
                </h1>
                <p className="text-xl text-gray-400 mb-2">Choose Your Development Path</p>
                <p className="text-sm text-gray-500">As a {hero.name}, how will you grow?</p>
            </div>

            {/* Path Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full z-10">
                {/* Technical Path */}
                <div
                    onClick={() => onPathSelect(CAREER_PATHS.TECHNICAL)}
                    className="group relative bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-neon-blue hover:scale-105 hover:shadow-[0_0_50px_rgba(0,255,255,0.3)] flex flex-col items-center"
                >
                    <div className="w-24 h-24 mb-6 rounded-full bg-slate-900 border-4 border-neon-blue flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                        <Code size={48} className="text-neon-blue group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
                        Technical Mastery
                    </h2>
                    <p className="text-gray-400 text-center text-lg leading-relaxed mb-6">
                        Master the tools. Build pipelines, optimize models, and defend servers.
                    </p>
                    <div className="w-full space-y-2 mb-6">
                        <div className="text-sm text-gray-500">You'll learn:</div>
                        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                            <li>ETL Pipelines & Data Engineering</li>
                            <li>SQL Optimization & Query Writing</li>
                            <li>System Reliability & Security</li>
                            <li>Machine Learning Fundamentals</li>
                        </ul>
                    </div>
                    <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-neon-blue font-bold text-lg tracking-wider flex items-center gap-2">
                        START TECHNICAL PATH <span className="text-xl">→</span>
                    </div>
                </div>

                {/* Behavioral Path */}
                <div
                    onClick={() => onPathSelect(CAREER_PATHS.BEHAVIORAL)}
                    className="group relative bg-slate-800/50 border-2 border-slate-700 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-neon-green hover:scale-105 hover:shadow-[0_0_50px_rgba(0,255,65,0.3)] flex flex-col items-center"
                >
                    <div className="w-24 h-24 mb-6 rounded-full bg-slate-900 border-4 border-neon-green flex items-center justify-center group-hover:border-green-400 transition-colors">
                        <Handshake size={48} className="text-neon-green group-hover:text-green-400 transition-colors" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-neon-green transition-colors">
                        Soft Skills & Leadership
                    </h2>
                    <p className="text-gray-400 text-center text-lg leading-relaxed mb-6">
                        Master the people. Manage stakeholders, negotiate deadlines, and handle crises.
                    </p>
                    <div className="w-full space-y-2 mb-6">
                        <div className="text-sm text-gray-500">You'll learn:</div>
                        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                            <li>Stakeholder Management</li>
                            <li>Crisis Communication</li>
                            <li>Ethical Decision Making</li>
                            <li>Professional Assertiveness</li>
                        </ul>
                    </div>
                    <div className="mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-neon-green font-bold text-lg tracking-wider flex items-center gap-2">
                        START BEHAVIORAL PATH <span className="text-xl">→</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PathSelection;

