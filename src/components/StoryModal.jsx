import React from 'react';
import { X, Play, Home } from 'lucide-react';

/**
 * StoryModal - Holographic Data Pad styled modal for educational storytelling
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} type - 'briefing' or 'debriefing'
 * @param {string} topic - Educational topic title
 * @param {string} story - The story text (briefing or impact)
 * @param {string} mascot - Mascot image URL
 * @param {string} levelName - Name of the level
 * @param {function} onClose - Callback when modal should close
 * @param {function} onAction - Callback for primary action button
 * @param {string} actionLabel - Label for primary action button
 */
const StoryModal = ({ 
    isOpen, 
    type, 
    topic, 
    story, 
    mascot, 
    levelName,
    onClose, 
    onAction, 
    actionLabel 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-neon-blue rounded-2xl p-8 shadow-[0_0_50px_rgba(0,255,255,0.3)] animate-in zoom-in duration-300">
                {/* Holographic scan lines effect */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-blue/20 to-transparent animate-pulse"></div>
                    <div className="absolute top-0 left-0 right-0 h-px bg-neon-blue animate-pulse"></div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="relative z-10">
                    {/* Header with Mascot */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-24 h-24 rounded-full border-4 border-neon-blue overflow-hidden bg-slate-800 shadow-[0_0_30px_rgba(0,255,255,0.4)] flex-shrink-0">
                            {mascot && (
                                <img src={mascot} alt="Mission Mascot" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs uppercase tracking-widest text-neon-blue mb-1 font-bold">
                                {type === 'briefing' ? 'MISSION BRIEFING' : 'MISSION COMPLETE'}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{levelName}</h2>
                            <div className="text-sm text-gray-400">{topic}</div>
                        </div>
                    </div>

                    {/* Story Text */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 backdrop-blur-sm">
                        <div className="text-gray-300 leading-relaxed text-lg">
                            {story}
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={onAction}
                            className="px-8 py-3 bg-neon-blue text-black font-bold rounded-full text-lg hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:scale-105"
                        >
                            {type === 'briefing' ? (
                                <>
                                    <Play fill="currentColor" size={20} />
                                    {actionLabel || 'START MISSION'}
                                </>
                            ) : (
                                <>
                                    <Home size={20} />
                                    {actionLabel || 'RETURN TO HQ'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryModal;

