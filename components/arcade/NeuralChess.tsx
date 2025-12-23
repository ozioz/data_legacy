'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Brain, Trophy, AlertCircle, RotateCcw, Database, Cpu, X, Sparkles } from 'lucide-react'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { getAIMove, analyzeChessGame, getHintMove, analyzeBoardPosition } from '@/app/actions/chess-actions'

type GameStatus = 'PLAYING' | 'CHECKMATE' | 'STALEMATE' | 'DRAW' | 'RESIGNED'
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface GameState {
  game: Chess
  status: GameStatus
  winner: 'WHITE' | 'BLACK' | null
  difficulty: Difficulty
  moveHistory: string[]
  playerColor: 'white' | 'black'
}

export default function NeuralChess() {
  const [gameState, setGameState] = useState<GameState>({
    game: new Chess(),
    status: 'PLAYING',
    winner: null,
    difficulty: 'MEDIUM',
    moveHistory: [],
    playerColor: 'white',
  })

  const [isThinking, setIsThinking] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [hintMove, setHintMove] = useState<string | null>(null)
  const [gameHistory, setGameHistory] = useState<Chess[]>([]) // For undo functionality
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showCoachModal, setShowCoachModal] = useState(false)
  const [coachAnalysis, setCoachAnalysis] = useState<string | null>(null)
  const [isAnalyzingBoard, setIsAnalyzingBoard] = useState(false)

  // Basic AI move (greedy algorithm - captures if possible, otherwise random)
  const getBasicAIMove = (game: Chess): string | null => {
    const moves = game.moves()
    if (moves.length === 0) return null

    // Try to find a capturing move
    const capturingMoves = moves.filter((move) => {
      const testGame = new Chess(game.fen())
      const moveObj = testGame.move(move)
      return moveObj && moveObj.captured
    })

    if (capturingMoves.length > 0) {
      // Return a random capturing move
      return capturingMoves[Math.floor(Math.random() * capturingMoves.length)]
    }

    // Otherwise, return a random move
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // Handle player move (synchronous for react-chessboard compatibility)
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (isThinking || gameState.status !== 'PLAYING') return false
    if (gameState.game.turn() !== (gameState.playerColor === 'white' ? 'w' : 'b')) return false

    const gameCopy = new Chess(gameState.game.fen())
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to queen for simplicity
    })

    if (move === null) return false

    // Save to history for undo
    setGameHistory((prev) => [...prev, new Chess(gameState.game.fen())])

    const newMoveHistory = [...gameState.moveHistory, gameCopy.fen()]
    const newStatus = getGameStatus(gameCopy)

    setGameState((prev) => ({
      ...prev,
      game: gameCopy,
      moveHistory: newMoveHistory,
      status: newStatus,
      winner: newStatus === 'CHECKMATE' ? (prev.playerColor === 'white' ? 'WHITE' : 'BLACK') : prev.winner,
    }))

    // If game is over, don't get AI move
    if (newStatus !== 'PLAYING') {
      return true
    }

    // Clear any existing timeout
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
    }

    // Get AI move after 500ms delay
    setIsThinking(true)
    aiTimeoutRef.current = setTimeout(() => {
      // Use basic AI for immediate playability, or Groq AI based on difficulty
      let aiMove: string | null = null
      
      if (gameState.difficulty === 'EASY') {
        aiMove = getBasicAIMove(gameCopy)
      } else {
        // For MEDIUM and HARD, use Groq AI
        getAIMove(gameCopy.fen(), gameState.difficulty)
          .then((move) => {
            if (move) {
              const gameAfterAI = new Chess(gameCopy.fen())
              gameAfterAI.move(move)

              const finalStatus = getGameStatus(gameAfterAI)
              setGameState((prev) => ({
                ...prev,
                game: gameAfterAI,
                moveHistory: [...newMoveHistory, gameAfterAI.fen()],
                status: finalStatus,
                winner: finalStatus === 'CHECKMATE' ? (prev.playerColor === 'white' ? 'BLACK' : 'WHITE') : prev.winner,
              }))
            }
            setIsThinking(false)
          })
          .catch((error) => {
            console.error('Error getting AI move:', error)
            // Fallback to basic AI
            const fallbackMove = getBasicAIMove(gameCopy)
            if (fallbackMove) {
              const gameAfterAI = new Chess(gameCopy.fen())
              gameAfterAI.move(fallbackMove)
              const finalStatus = getGameStatus(gameAfterAI)
              setGameState((prev) => ({
                ...prev,
                game: gameAfterAI,
                moveHistory: [...newMoveHistory, gameAfterAI.fen()],
                status: finalStatus,
                winner: finalStatus === 'CHECKMATE' ? (prev.playerColor === 'white' ? 'BLACK' : 'WHITE') : prev.winner,
              }))
            }
            setIsThinking(false)
          })
        return
      }

      // Execute basic AI move
      if (aiMove) {
        const gameAfterAI = new Chess(gameCopy.fen())
        gameAfterAI.move(aiMove)

        const finalStatus = getGameStatus(gameAfterAI)
        setGameState((prev) => ({
          ...prev,
          game: gameAfterAI,
          moveHistory: [...newMoveHistory, gameAfterAI.fen()],
          status: finalStatus,
          winner: finalStatus === 'CHECKMATE' ? (prev.playerColor === 'white' ? 'BLACK' : 'WHITE') : prev.winner,
        }))
      }
      setIsThinking(false)
    }, 500)

    return true
  }

  const getGameStatus = (game: Chess): GameStatus => {
    if (game.isCheckmate()) return 'CHECKMATE'
    if (game.isStalemate()) return 'STALEMATE'
    if (game.isDraw()) return 'DRAW'
    return 'PLAYING'
  }

  const getStatusMessage = (game: Chess): string => {
    if (game.isCheckmate()) return 'Checkmate!'
    if (game.isStalemate()) return 'Stalemate'
    if (game.isDraw()) return 'Draw'
    if (game.isCheck()) return 'Check!'
    return 'Playing'
  }

  const handleUndo = () => {
    if (gameHistory.length === 0 || gameState.status !== 'PLAYING' || isThinking) return

    // Clear AI timeout if exists
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    const previousGame = gameHistory[gameHistory.length - 1]
    setGameHistory((prev) => prev.slice(0, -1))
    
    setGameState((prev) => ({
      ...prev,
      game: new Chess(previousGame.fen()),
      moveHistory: prev.moveHistory.slice(0, -1),
      status: 'PLAYING',
      winner: null,
    }))
    setIsThinking(false)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
      }
    }
  }, [])

  const handleNewGame = () => {
    // Clear AI timeout if exists
    if (aiTimeoutRef.current) {
      clearTimeout(aiTimeoutRef.current)
      aiTimeoutRef.current = null
    }

    setGameState({
      game: new Chess(),
      status: 'PLAYING',
      winner: null,
      difficulty: gameState.difficulty,
      moveHistory: [],
      playerColor: gameState.playerColor === 'white' ? 'black' : 'white',
    })
    setAnalysis(null)
    setShowAnalysis(false)
    setHintsRemaining(3)
    setHintMove(null)
    setGameHistory([])
    setIsThinking(false)
  }

  const handleResign = () => {
    if (gameState.status !== 'PLAYING') return
    
    setGameState((prev) => ({
      ...prev,
      status: 'RESIGNED',
      winner: prev.playerColor === 'white' ? 'BLACK' : 'WHITE',
    }))
  }

  const handleGetHint = async () => {
    if (hintsRemaining <= 0 || gameState.status !== 'PLAYING' || isThinking) return
    if (gameState.game.turn() !== (gameState.playerColor === 'white' ? 'w' : 'b')) return // Only hint on player's turn

    setIsThinking(true)
    try {
      const hint = await getHintMove(gameState.game.fen(), gameState.difficulty)
      if (hint) {
        setHintMove(hint)
        setHintsRemaining((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Error getting hint:', error)
    } finally {
      setIsThinking(false)
    }
  }

  const handleAnalyze = async () => {
    if (gameState.moveHistory.length === 0) return

    setShowAnalysis(true)
    setIsThinking(true)
    try {
      const result = await analyzeChessGame(
        gameState.moveHistory,
        gameState.winner,
        gameState.playerColor
      )
      setAnalysis(result)
    } catch (error) {
      console.error('Error analyzing game:', error)
      setAnalysis('Failed to generate analysis.')
    } finally {
      setIsThinking(false)
    }
  }

  const handleAnalyzeBoard = async () => {
    setIsAnalyzingBoard(true)
    setShowCoachModal(true)
    setCoachAnalysis(null)
    
    try {
      const result = await analyzeBoardPosition(
        gameState.game.fen(),
        gameState.game.turn()
      )
      setCoachAnalysis(result)
    } catch (error) {
      console.error('Error analyzing board:', error)
      setCoachAnalysis('Failed to analyze position. The Grandmaster is offline.')
    } finally {
      setIsAnalyzingBoard(false)
    }
  }

  // Auto-analyze when game ends
  useEffect(() => {
    if (gameState.status !== 'PLAYING' && gameState.status !== 'RESIGNED' && gameState.game.history().length > 0) {
      // Auto-trigger analysis when game ends (checkmate/draw/stalemate)
      handleAnalyzeBoard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status])

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
              <Brain size={32} />
              Neural Chess
            </h1>
            <p className="text-gray-400 text-sm mt-1">Play against an AI that learns from your moves</p>
          </div>
          <button
            onClick={() => window.location.href = '/arcade'}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>

        {/* Game Status */}
        {gameState.status !== 'PLAYING' && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            gameState.status === 'CHECKMATE'
              ? gameState.winner === 'WHITE'
                ? 'bg-green-500/20 border border-green-500'
                : 'bg-red-500/20 border border-red-500'
              : gameState.status === 'RESIGNED'
                ? 'bg-red-500/20 border border-red-500'
                : 'bg-yellow-500/20 border border-yellow-500'
          }`}>
            {gameState.status === 'CHECKMATE' ? (
              <>
                <Trophy size={24} />
                <div>
                  <p className="font-bold">
                    {gameState.winner === 'WHITE' ? 'You Win!' : 'AI Wins!'}
                  </p>
                  <p className="text-sm opacity-80">Checkmate!</p>
                </div>
              </>
            ) : gameState.status === 'RESIGNED' ? (
              <>
                <AlertCircle size={24} />
                <div>
                  <p className="font-bold">You Resigned</p>
                  <p className="text-sm opacity-80">AI Wins!</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={24} />
                <div>
                  <p className="font-bold">Game Over</p>
                  <p className="text-sm opacity-80">
                    {gameState.status === 'STALEMATE' ? 'Stalemate' : 'Draw'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chess Board */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              {/* Turn Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">You are playing as</p>
                    <p className="text-lg font-bold capitalize flex items-center gap-2">
                      {gameState.playerColor === 'white' ? (
                        <>
                          <Database size={20} className="text-white" />
                          White (DB)
                        </>
                      ) : (
                        <>
                          <Cpu size={20} className="text-slate-300" />
                          Black (LLM)
                        </>
                      )}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-700"></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Turn</p>
                    <div className="flex items-center gap-2">
                      {gameState.game.turn() === (gameState.playerColor === 'white' ? 'w' : 'b') ? (
                        <span className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                          Your Turn
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-purple-400 flex items-center gap-1">
                          <Brain className="animate-pulse" size={16} />
                          AI (The Monolith)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isThinking && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Brain className="animate-pulse" size={20} />
                    <span className="text-sm">The Monolith is thinking...</span>
                  </div>
                )}
              </div>

              {/* Game Status Indicator */}
              {gameState.status === 'PLAYING' && (
                <div className="mb-4 p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-sm text-center">
                    <span className="text-gray-400">Status: </span>
                    <span className={`font-bold ${
                      gameState.game.isCheck() ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {getStatusMessage(gameState.game)}
                    </span>
                  </p>
                </div>
              )}

              <div className="w-full max-w-[600px] mx-auto">
                <Chessboard
                  position={gameState.game.fen()}
                  onPieceDrop={onDrop}
                  boardOrientation={gameState.playerColor}
                  arePiecesDraggable={gameState.status === 'PLAYING' && !isThinking && gameState.game.turn() === (gameState.playerColor === 'white' ? 'w' : 'b')}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
                    border: '2px solid #475569',
                  }}
                  customDarkSquareStyle={{ backgroundColor: '#1e293b' }}
                  customLightSquareStyle={{ backgroundColor: '#334155' }}
                />
              </div>

              {/* Controls */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleNewGame}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all font-semibold shadow-lg shadow-cyan-500/20"
                >
                  New Game
                </button>
                {gameState.status === 'PLAYING' && (
                  <>
                    <button
                      onClick={handleUndo}
                      disabled={gameHistory.length === 0 || isThinking}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <RotateCcw size={16} />
                      Undo
                    </button>
                    <button
                      onClick={handleAnalyzeBoard}
                      disabled={isAnalyzingBoard}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      <Sparkles size={16} />
                      {isAnalyzingBoard ? 'Compiling Strategy...' : 'Analyze with AI'}
                    </button>
                    <button
                      onClick={handleGetHint}
                      disabled={hintsRemaining <= 0 || isThinking || gameState.game.turn() !== (gameState.playerColor === 'white' ? 'w' : 'b')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <Brain size={16} />
                      Hint ({hintsRemaining} left)
                    </button>
                    <button
                      onClick={handleResign}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                    >
                      Resign
                    </button>
                  </>
                )}
                {gameState.status !== 'PLAYING' && (
                  <button
                    onClick={handleAnalyze}
                    disabled={isThinking}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isThinking ? 'Analyzing...' : 'Analyze Game'}
                  </button>
                )}
              </div>

              {/* Hint Display */}
              {hintMove && gameState.status === 'PLAYING' && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                  <p className="text-sm text-yellow-300 font-bold mb-1">💡 Hint:</p>
                  <p className="text-sm text-yellow-200">
                    Suggested move: <span className="font-mono font-bold">{hintMove}</span>
                    {hintMove.length === 4 && (
                      <span className="ml-2 text-yellow-300">
                        ({hintMove.substring(0, 2)} → {hintMove.substring(2, 4)})
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setHintMove(null)}
                    className="mt-2 text-xs text-yellow-400 hover:text-yellow-300 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Difficulty Selector */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="font-bold mb-3">Difficulty</h3>
              <div className="space-y-2">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      if (gameState.status === 'PLAYING') return
                      setGameState((prev) => ({ ...prev, difficulty: diff }))
                    }}
                    disabled={gameState.status === 'PLAYING'}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${
                      gameState.difficulty === diff
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Move History */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="font-bold mb-3">Move History</h3>
              <div className="text-sm text-gray-400 space-y-1 max-h-64 overflow-y-auto">
                {gameState.game.history().length === 0 ? (
                  <p className="text-gray-500">No moves yet</p>
                ) : (
                  gameState.game.history({ verbose: true }).map((move, idx) => {
                    const moveNumber = Math.floor(idx / 2) + 1
                    const isWhite = idx % 2 === 0
                    return (
                      <div key={idx} className="font-mono text-xs flex items-center gap-2">
                        <span className="text-gray-500 w-8">
                          {isWhite ? `${moveNumber}.` : `${moveNumber}...`}
                        </span>
                        <span className="text-gray-300">{move.san}</span>
                        {move.captured && (
                          <span className="text-red-400">x</span>
                        )}
                        {move.san.includes('+') && (
                          <span className="text-yellow-400">+</span>
                        )}
                        {move.san.includes('#') && (
                          <span className="text-green-400">#</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Analysis */}
            {showAnalysis && analysis && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="font-bold mb-3">Game Analysis</h3>
                <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {analysis}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Grandmaster Coach Modal */}
        {showCoachModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-800 via-purple-900/20 to-slate-800 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full shadow-2xl shadow-purple-500/20 relative overflow-hidden">
              {/* Cyberpunk glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 animate-pulse"></div>
              
              {/* Header */}
              <div className="relative p-6 border-b border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <Brain size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                        AI Grandmaster Coach
                      </h3>
                      <p className="text-sm text-gray-400">Data Architecture Analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCoachModal(false)
                      setCoachAnalysis(null)
                    }}
                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-6">
                {isAnalyzingBoard ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <Brain className="animate-pulse text-purple-400" size={48} />
                      <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                      Compiling Strategy...
                    </p>
                    <p className="mt-2 text-sm text-gray-400">The Grandmaster is analyzing your infrastructure</p>
                  </div>
                ) : coachAnalysis ? (
                  <div className="space-y-4">
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-purple-500/20">
                      <div className="flex items-start gap-3">
                        <Database className="text-cyan-400 mt-1 flex-shrink-0" size={20} />
                        <div className="flex-1">
                          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                            {coachAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Piece Legend */}
                    <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Piece Mapping</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>♔ King = Production DB</div>
                        <div>♕ Queen = LLM Model</div>
                        <div>♖ Rook = Firewall</div>
                        <div>♗ Bishop = Data Pipeline</div>
                        <div>♘ Knight = API Gateway</div>
                        <div>♙ Pawn = Raw Data</div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="relative p-4 border-t border-purple-500/30 flex justify-end">
                <button
                  onClick={() => {
                    setShowCoachModal(false)
                    setCoachAnalysis(null)
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-all font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

