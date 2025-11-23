import React, { useState } from 'react';
import HeroSelection from './components/HeroSelection';
import PathSelection from './components/PathSelection';
import CareerMap from './components/CareerMap';
import PipelinePuzzle from './components/PipelinePuzzle';
import ServerGuardian from './components/ServerGuardian';
import NullRunner from './components/NullRunner';
import DataFarm from './components/DataFarm';
import QueryMaster from './components/QueryMaster';
import BehavioralGame from './components/BehavioralGame';
import StoryModal from './components/StoryModal';
import { Star, ArrowLeft, Lightbulb } from 'lucide-react';
import { GAME_TYPES, MASCOTS, LEVELS, GAME_STORIES, CAREER_PATHS } from './utils/GameState';

function App() {
  const [gameState, setGameState] = useState('HERO_SELECTION'); // HERO_SELECTION, PATH_SELECTION, CAREER_MAP, PLAYING, BRIEFING
  const [playerHero, setPlayerHero] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null); // TECHNICAL or BEHAVIORAL
  const [currentLevel, setCurrentLevel] = useState(null);
  // Start with first levels unlocked for each class and path
  const [unlockedLevels, setUnlockedLevels] = useState([
    'ENGINEER_1', 'SCIENTIST_1', 'ANALYST_1',
    'ENGINEER_BEHAVIORAL_1', 'SCIENTIST_BEHAVIORAL_1', 'ANALYST_BEHAVIORAL_1'
  ]);
  const [totalXP, setTotalXP] = useState(0);
  const [trophyCollected, setTrophyCollected] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  const handleHeroSelect = (hero) => {
    setPlayerHero(hero);
    setGameState('PATH_SELECTION');
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
    setGameState('CAREER_MAP');
  };

  const handleLevelSelect = (level) => {
    setCurrentLevel(level);
    // Behavioral games don't need briefing - they're already story-driven
    if (level.gameType === GAME_TYPES.BEHAVIORAL) {
      setGameState('PLAYING');
    } else {
      setShowBriefing(true);
      setGameState('BRIEFING');
    }
  };

  const handleStartMission = () => {
    setShowBriefing(false);
    setGameState('PLAYING');
  };

  const handleGameComplete = (xpReward) => {
    // Add XP - ensure xpReward is a valid number
    const xp = Number(xpReward) || 0;
    setTotalXP(prev => prev + xp);

    // Unlock next level logic
    const parts = currentLevel.id.split('_');
    
    // Handle behavioral levels differently
    if (currentLevel.id.includes('BEHAVIORAL')) {
      const currentNum = parseInt(parts[parts.length - 1]);
      const nextNum = currentNum + 1;
      const nextId = `${parts.slice(0, -1).join('_')}_${nextNum}`;
      
      // Check if next level exists in LEVELS before unlocking
      if (LEVELS[nextId] && !unlockedLevels.includes(nextId)) {
        setUnlockedLevels([...unlockedLevels, nextId]);
      }
    } else {
      // Technical levels
      const currentNum = parseInt(parts[1]);
      const nextNum = currentNum + 1;
      const nextId = `${parts[0]}_${nextNum}`;

      // Check if next level exists in LEVELS before unlocking
      if (LEVELS[nextId] && !unlockedLevels.includes(nextId)) {
        setUnlockedLevels([...unlockedLevels, nextId]);
      }

      // Check for mastery level completion to award trophy
      if (nextId === 'ENGINEER_11' || nextId === 'SCIENTIST_11' || nextId === 'ANALYST_11') {
        setTrophyCollected(true);
      }
    }

    // Return to map - debriefing is handled by game components
    setGameState('CAREER_MAP');
    setCurrentLevel(null);
  };

  const handleHome = () => {
    setGameState('HERO_SELECTION');
    setPlayerHero(null);
    setSelectedPath(null);
    setCurrentLevel(null);
    // Optional: Reset progress? No, keep it for now.
  };

  const renderActiveGame = () => {
    if (!currentLevel) return null;

    const commonProps = {
      level: currentLevel,
      onComplete: handleGameComplete,
      onExit: () => setGameState('CAREER_MAP'),
      playerHero: playerHero,
    };
    switch (currentLevel.gameType) {
      case GAME_TYPES.PIPELINE:
        return <PipelinePuzzle {...commonProps} />;
      case GAME_TYPES.TOWER:
        return <ServerGuardian {...commonProps} />;
      case GAME_TYPES.RUNNER:
        return <NullRunner {...commonProps} />;
      case GAME_TYPES.FARM:
        return <DataFarm {...commonProps} />;
      case GAME_TYPES.QUERY:
        return <QueryMaster {...commonProps} />;
      case GAME_TYPES.BEHAVIORAL:
        return <BehavioralGame {...commonProps} />;
      default:
        return <div className="text-white text-center p-10">Unknown Game Type: {currentLevel.gameType}</div>;
    }
  };

  const getMascot = () => {
    if (!currentLevel || !MASCOTS) return null;
    switch (currentLevel.gameType) {
      case GAME_TYPES.PIPELINE: return MASCOTS.pipeline;
      case GAME_TYPES.TOWER: return MASCOTS.defense;
      case GAME_TYPES.RUNNER: return MASCOTS.runner;
      case GAME_TYPES.FARM: return MASCOTS.farm;
      case GAME_TYPES.QUERY: return MASCOTS.query;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-neon-green selection:text-black relative">
      {/* Global HUD */}
      {gameState !== 'HERO_SELECTION' && gameState !== 'PATH_SELECTION' && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          <div className="bg-slate-800/80 backdrop-blur border border-neon-blue px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Star className="text-yellow-400 fill-yellow-400" size={16} />
            <span className="font-bold font-mono text-neon-blue">{totalXP} XP</span>
          </div>
        </div>
      )}



      {gameState === 'HERO_SELECTION' && (
        <HeroSelection onHeroSelect={handleHeroSelect} />
      )}

      {gameState === 'PATH_SELECTION' && playerHero && (
        <PathSelection
          hero={playerHero}
          onPathSelect={handlePathSelect}
          onBack={() => {
            setGameState('HERO_SELECTION');
            setPlayerHero(null);
          }}
        />
      )}

      {gameState === 'CAREER_MAP' && playerHero && selectedPath && (
        <CareerMap
          hero={playerHero}
          path={selectedPath}
          unlockedLevels={unlockedLevels}
          onLevelSelect={handleLevelSelect}
          onHome={handleHome}
        />
      )}

      {gameState === 'PLAYING' && renderActiveGame()}

      {/* Mission Briefing Modal */}
      {gameState === 'BRIEFING' && currentLevel && (
        <StoryModal
          isOpen={showBriefing}
          type="briefing"
          topic={GAME_STORIES[currentLevel.gameType]?.topic || 'Mission'}
          story={GAME_STORIES[currentLevel.gameType]?.briefing || 'Complete the mission.'}
          mascot={MASCOTS[currentLevel.gameType === GAME_TYPES.PIPELINE ? 'pipeline' : 
                      currentLevel.gameType === GAME_TYPES.TOWER ? 'defense' :
                      currentLevel.gameType === GAME_TYPES.FARM ? 'farm' :
                      currentLevel.gameType === GAME_TYPES.RUNNER ? 'runner' : 'query']}
          levelName={currentLevel.name}
          onClose={() => {
            setShowBriefing(false);
            setGameState('CAREER_MAP');
            setCurrentLevel(null);
          }}
          onAction={handleStartMission}
          actionLabel="START MISSION"
        />
      )}
    </div>
  );
}

export default App;
