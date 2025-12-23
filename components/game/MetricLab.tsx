'use client'

import { useState, useEffect, useRef } from 'react'
import { Calculator, Check, X, Play, RotateCcw, AlertTriangle, ArrowLeft, Code } from 'lucide-react'
import { MASCOTS, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { saveGameSession } from '@/app/actions/game-actions'
import { useGameStore } from '@/lib/store/game-store'

interface MetricLabProps {
  level: any
  onComplete: (xp: number, gameResult?: { won: boolean; score: number }) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

type BlockType = 'FIELD' | 'FUNCTION' | 'NUMBER'
type FunctionType = 'SUM' | 'COUNT' | 'AVERAGE' | 'DIVIDE' | 'MULTIPLY' | 'SUBTRACT'

interface Block {
  id: string
  type: BlockType
  functionType?: FunctionType
  fieldName?: string
  value?: number
  children?: Block[]
  parent?: string | null
}

interface BusinessRequest {
  id: string
  title: string
  description: string
  expectedFormula: string
  hint?: string
}

const AVAILABLE_FIELDS = [
  { name: 'SalesAmount', type: 'numeric', description: 'Total sales amount per order' },
  { name: 'OrderID', type: 'id', description: 'Unique order identifier' },
  { name: 'Quantity', type: 'numeric', description: 'Quantity of items ordered' },
  { name: 'UnitPrice', type: 'numeric', description: 'Price per unit' },
  { name: 'CustomerID', type: 'id', description: 'Customer identifier' },
  { name: 'OrderDate', type: 'date', description: 'Date of order' },
]

const BUSINESS_REQUESTS: BusinessRequest[] = [
  {
    id: 'total_revenue',
    title: 'Total Revenue',
    description: 'Calculate the total revenue from all orders',
    expectedFormula: 'SUM(SalesAmount)',
    hint: 'You need to sum all sales amounts',
  },
  {
    id: 'avg_order_value',
    title: 'Average Order Value',
    description: 'Calculate the average value per order',
    expectedFormula: 'DIVIDE(SUM(SalesAmount), COUNT(OrderID))',
    hint: 'Divide total revenue by number of orders',
  },
  {
    id: 'total_orders',
    title: 'Total Orders',
    description: 'Count the total number of orders',
    expectedFormula: 'COUNT(OrderID)',
    hint: 'Count the unique order IDs',
  },
  {
    id: 'avg_quantity',
    title: 'Average Quantity',
    description: 'Calculate the average quantity per order',
    expectedFormula: 'AVERAGE(Quantity)',
    hint: 'Calculate the average of quantity field',
  },
]

export default function MetricLab({ level, onComplete, onExit, playerHero }: MetricLabProps) {
  const { calculateSemanticLayerScore, saveStageResult, syncProjectStateToDB } = useGameStore()
  const [currentRequest, setCurrentRequest] = useState<BusinessRequest>(BUSINESS_REQUESTS[0])
  const [formulaBlocks, setFormulaBlocks] = useState<Block[]>([])
  const [testResult, setTestResult] = useState<number | null>(null)
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'ERROR'>('PLAYING')
  const [message, setMessage] = useState('')
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [startTime] = useState(Date.now())
  const [completedRequests, setCompletedRequests] = useState<string[]>([])
  const formulaAreaRef = useRef<HTMLDivElement>(null)

  const handleAddField = (fieldName: string) => {
    const newBlock: Block = {
      id: `field-${Date.now()}`,
      type: 'FIELD',
      fieldName,
    }
    setFormulaBlocks([...formulaBlocks, newBlock])
    setMessage('')
  }

  const handleAddFunction = (funcType: FunctionType) => {
    const newBlock: Block = {
      id: `func-${Date.now()}`,
      type: 'FUNCTION',
      functionType: funcType,
      children: [],
    }
    setFormulaBlocks([...formulaBlocks, newBlock])
    setMessage('')
  }

  const handleAddNumber = (value: number) => {
    const newBlock: Block = {
      id: `num-${Date.now()}`,
      type: 'NUMBER',
      value,
    }
    setFormulaBlocks([...formulaBlocks, newBlock])
    setMessage('')
  }

  const handleDropOnFunction = (functionBlockId: string, droppedBlockId: string) => {
    const funcBlock = formulaBlocks.find((b) => b.id === functionBlockId)
    const droppedBlock = formulaBlocks.find((b) => b.id === droppedBlockId)

    if (!funcBlock || !droppedBlock || funcBlock.type !== 'FUNCTION') return

    // Check if block can be added (functions have limits)
    const maxChildren: { [key in FunctionType]: number } = {
      SUM: 1,
      COUNT: 1,
      AVERAGE: 1,
      DIVIDE: 2,
      MULTIPLY: 2,
      SUBTRACT: 2,
    }

    const currentChildren = funcBlock.children?.length || 0
    if (currentChildren >= maxChildren[funcBlock.functionType!]) {
      setMessage(`This function can only accept ${maxChildren[funcBlock.functionType!]} argument(s)`)
      return
    }

    // Validate field types for aggregations
    if (funcBlock.functionType === 'SUM' || funcBlock.functionType === 'AVERAGE') {
      if (droppedBlock.type === 'FIELD') {
        const field = AVAILABLE_FIELDS.find((f) => f.name === droppedBlock.fieldName)
        if (field?.type === 'id') {
          setMessage(`Warning: You cannot aggregate ID fields (${droppedBlock.fieldName}) directly. Use COUNT instead.`)
          return
        }
      }
    }

    // Add block as child
    const updatedBlocks = formulaBlocks.map((b) => {
      if (b.id === functionBlockId) {
        return {
          ...b,
          children: [...(b.children || []), droppedBlock],
        }
      }
      if (b.id === droppedBlockId) {
        return { ...b, parent: functionBlockId }
      }
      return b
    })

    // Remove dropped block from root level
    const filteredBlocks = updatedBlocks.filter((b) => b.id !== droppedBlockId || b.parent !== null)
    setFormulaBlocks(filteredBlocks)
    setMessage('')
  }

  const handleRemoveBlock = (blockId: string) => {
    const block = formulaBlocks.find((b) => b.id === blockId)
    if (!block) return

    // Remove children recursively
    const removeChildren = (id: string): string[] => {
      const children = formulaBlocks.filter((b) => b.parent === id)
      return [id, ...children.flatMap((c) => removeChildren(c.id))]
    }

    const idsToRemove = removeChildren(blockId)
    setFormulaBlocks(formulaBlocks.filter((b) => !idsToRemove.includes(b.id)))
  }

  const buildFormulaString = (block: Block): string => {
    if (block.type === 'FIELD') {
      return block.fieldName || ''
    }
    if (block.type === 'NUMBER') {
      return block.value?.toString() || ''
    }
    if (block.type === 'FUNCTION' && block.functionType) {
      const children = block.children || []
      if (block.functionType === 'DIVIDE' || block.functionType === 'MULTIPLY' || block.functionType === 'SUBTRACT') {
        return `${block.functionType}(${children.map(buildFormulaString).join(', ')})`
      }
      return `${block.functionType}(${children.map(buildFormulaString).join(', ')})`
    }
    return ''
  }

  const evaluateFormula = (blocks: Block[]): number | null => {
    // Find root blocks (no parent)
    const rootBlocks = blocks.filter((b) => !b.parent)

    if (rootBlocks.length !== 1) {
      return null
    }

    const evaluateBlock = (block: Block): number => {
      if (block.type === 'NUMBER') {
        return block.value || 0
      }
      if (block.type === 'FIELD') {
        // Mock values for testing
        const mockValues: { [key: string]: number } = {
          SalesAmount: 1000,
          OrderID: 1,
          Quantity: 5,
          UnitPrice: 20,
          CustomerID: 1,
        }
        return mockValues[block.fieldName || ''] || 0
      }
      if (block.type === 'FUNCTION' && block.functionType) {
        const children = (block.children || []).map(evaluateBlock)
        switch (block.functionType) {
          case 'SUM':
            return children[0] || 0
          case 'COUNT':
            return children.length > 0 ? 1 : 0
          case 'AVERAGE':
            return children[0] || 0
          case 'DIVIDE':
            return children[1] !== 0 ? children[0] / children[1] : 0
          case 'MULTIPLY':
            return children.reduce((a, b) => a * b, 1)
          case 'SUBTRACT':
            return children[0] - (children[1] || 0)
          default:
            return 0
        }
      }
      return 0
    }

    return evaluateBlock(rootBlocks[0])
  }

  const handleTestMeasure = () => {
    const result = evaluateFormula(formulaBlocks)
    setTestResult(result)
    setMessage(result !== null ? `Test Result: ${result.toFixed(2)}` : 'Invalid formula structure')
  }

  const handleValidate = () => {
    const formulaString = formulaBlocks
      .filter((b) => !b.parent)
      .map(buildFormulaString)
      .join('')

    // Normalize formula strings for comparison
    const normalize = (str: string) => str.replace(/\s+/g, '').toUpperCase()
    const expected = normalize(currentRequest.expectedFormula)
    const actual = normalize(formulaString)

    if (actual === expected) {
      setStatus('WON')
      setMessage('Measure created correctly!')
      setCompletedRequests([...completedRequests, currentRequest.id])
      
      // Move to next request if available
      const nextRequest = BUSINESS_REQUESTS.find((r) => !completedRequests.includes(r.id))
      if (nextRequest && completedRequests.length < BUSINESS_REQUESTS.length - 1) {
        setTimeout(() => {
          setCurrentRequest(nextRequest)
          setFormulaBlocks([])
          setStatus('PLAYING')
          setMessage('')
          setTestResult(null)
        }, 2000)
      } else {
        setShowDebriefing(true)
      }
    } else {
      setStatus('ERROR')
      setMessage(`Formula doesn't match. Expected: ${currentRequest.expectedFormula}`)
    }
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const won = completedRequests.length === BUSINESS_REQUESTS.length
    
    // Calculate semantic layer score
    const semanticScore = calculateSemanticLayerScore(completedRequests.length, BUSINESS_REQUESTS.length, won)
    
    // Save stage result (Stage 3: Semantic Layer)
    saveStageResult(3, won ? 100 : 0, won, semanticScore)
    await syncProjectStateToDB()

    await saveGameSession({
      gameType: 'METRIC_LAB',
      levelId: level.id,
      score: won ? 100 : 0,
      duration,
      won,
      xpEarned: level.xpReward,
      gameConfig: {
        completedRequests: completedRequests.length,
        totalRequests: BUSINESS_REQUESTS.length,
        semanticScore,
      },
    })

    setShowDebriefing(false)
    onComplete(level.xpReward, { won, score: won ? 100 : 0 })
  }

  const renderBlock = (block: Block, isRoot: boolean = false) => {
    const canDrop = block.type === 'FUNCTION' && (block.children?.length || 0) < 2

    return (
      <div
        key={block.id}
        className={`inline-block m-1 ${isRoot ? '' : 'ml-4'}`}
        onDrop={(e) => {
          e.preventDefault()
          const droppedId = e.dataTransfer.getData('blockId')
          if (canDrop) {
            handleDropOnFunction(block.id, droppedId)
          }
        }}
        onDragOver={(e) => {
          if (canDrop) {
            e.preventDefault()
          }
        }}
      >
        <div
          className={`
            px-3 py-2 rounded-lg border-2 flex items-center gap-2 cursor-move
            ${
              block.type === 'FUNCTION'
                ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                : block.type === 'FIELD'
                  ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                  : 'bg-green-500/20 border-green-500 text-green-300'
            }
            ${canDrop ? 'hover:border-cyan-400' : ''}
          `}
          draggable={!isRoot}
          onDragStart={(e) => {
            e.dataTransfer.setData('blockId', block.id)
          }}
        >
          {block.type === 'FUNCTION' && (
            <>
              <Code size={16} />
              <span className="font-bold">{block.functionType}</span>
              <span className="text-gray-400">(</span>
            </>
          )}
          {block.type === 'FIELD' && (
            <>
              <span className="font-mono">{block.fieldName}</span>
            </>
          )}
          {block.type === 'NUMBER' && (
            <>
              <span className="font-mono">{block.value}</span>
            </>
          )}
          {block.type === 'FUNCTION' && (
            <>
              {block.children?.map((child, idx) => (
                <div key={child.id} className="inline-flex items-center">
                  {idx > 0 && <span className="text-gray-400 mx-1">,</span>}
                  {renderBlock(child)}
                </div>
              ))}
              {(!block.children || block.children.length === 0) && (
                <span className="text-gray-500 text-xs px-2">drop here</span>
              )}
              <span className="text-gray-400">)</span>
            </>
          )}
          {!isRoot && (
            <button
              onClick={() => handleRemoveBlock(block.id)}
              className="ml-2 text-red-400 hover:text-red-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            Metric Lab
          </h1>
          <p className="text-gray-400 text-sm">Build Business Measures with Block-Based Formulas</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Business Request */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <Calculator size={20} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-yellow-300 mb-1">{currentRequest.title}</h2>
            <p className="text-gray-300 text-sm mb-2">{currentRequest.description}</p>
            {currentRequest.hint && (
              <p className="text-xs text-gray-400 italic">💡 Hint: {currentRequest.hint}</p>
            )}
          </div>
          <div className="text-xs text-gray-400">
            {completedRequests.length + 1} / {BUSINESS_REQUESTS.length}
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 mb-4 ${
            status === 'WON'
              ? 'bg-green-500 text-black'
              : status === 'ERROR'
                ? 'bg-red-500 text-white'
                : 'bg-yellow-500 text-black'
          }`}
        >
          {status === 'WON' ? <Check /> : status === 'ERROR' ? <X /> : <AlertTriangle />}
          {message}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel: Fields & Functions */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-blue-400">Available Fields</h3>
          <div className="space-y-2 mb-6">
            {AVAILABLE_FIELDS.map((field) => (
              <button
                key={field.name}
                onClick={() => handleAddField(field.name)}
                className="w-full bg-blue-500/20 border border-blue-500 p-2 rounded text-left hover:bg-blue-500/30 transition-all"
              >
                <div className="font-mono font-bold text-sm text-blue-300">{field.name}</div>
                <div className="text-xs text-gray-400">{field.description}</div>
              </button>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4 text-purple-400">Functions</h3>
          <div className="grid grid-cols-2 gap-2">
            {(['SUM', 'COUNT', 'AVERAGE', 'DIVIDE', 'MULTIPLY', 'SUBTRACT'] as FunctionType[]).map((func) => (
              <button
                key={func}
                onClick={() => handleAddFunction(func)}
                className="bg-purple-500/20 border border-purple-500 p-2 rounded hover:bg-purple-500/30 transition-all text-purple-300 font-bold text-sm"
              >
                {func}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-bold mb-4 mt-6 text-green-400">Numbers</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 5, 10, 100, 1000].map((num) => (
              <button
                key={num}
                onClick={() => handleAddNumber(num)}
                className="bg-green-500/20 border border-green-500 p-2 rounded hover:bg-green-500/30 transition-all text-green-300 font-mono text-sm"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel: Formula Builder */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-cyan-400">Formula Builder</h3>
            <button
              onClick={() => {
                setFormulaBlocks([])
                setTestResult(null)
                setMessage('')
              }}
              className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 flex items-center gap-2 text-sm"
            >
              <RotateCcw size={14} />
              Clear
            </button>
          </div>

          <div
            ref={formulaAreaRef}
            className="flex-1 min-h-[300px] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-600 p-4 overflow-auto"
            onDrop={(e) => {
              e.preventDefault()
            }}
            onDragOver={(e) => {
              e.preventDefault()
            }}
          >
            {formulaBlocks.filter((b) => !b.parent).length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Code size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Drag blocks here to build your formula</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start">
                {formulaBlocks
                  .filter((b) => !b.parent)
                  .map((block) => renderBlock(block, true))}
              </div>
            )}
          </div>

          {/* Formula Preview */}
          {formulaBlocks.filter((b) => !b.parent).length > 0 && (
            <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Formula Preview:</div>
              <div className="font-mono text-sm text-cyan-300">
                {formulaBlocks
                  .filter((b) => !b.parent)
                  .map(buildFormulaString)
                  .join('') || 'Invalid formula'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Test & Validate */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex-1 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-bold mb-2 text-green-400">Test Result</h3>
          {testResult !== null ? (
            <div className="text-2xl font-bold text-green-300">{testResult.toFixed(2)}</div>
          ) : (
            <div className="text-gray-500 text-sm">Click "Test Measure" to preview</div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleTestMeasure}
            disabled={formulaBlocks.filter((b) => !b.parent).length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:text-gray-500 transition-all flex items-center gap-2"
          >
            <Play size={18} />
            Test Measure
          </button>
          <button
            onClick={handleValidate}
            disabled={formulaBlocks.filter((b) => !b.parent).length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-slate-700 disabled:text-gray-500 transition-all flex items-center gap-2"
          >
            <Check size={18} />
            Validate
          </button>
        </div>
      </div>

      {/* Debriefing Modal */}
      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic="Semantic Layer Complete"
        story={
          completedRequests.length === BUSINESS_REQUESTS.length
            ? 'You successfully created all business measures! The semantic layer is now ready for reporting.'
            : 'You completed some measures. Continue to finish all business requests.'
        }
        mascot={MASCOTS.query}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="RETURN TO PROJECT"
      />

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={3}
        gameContext={{
          gameType: GAME_TYPES.METRIC_LAB,
          status: completedRequests.length === BUSINESS_REQUESTS.length ? 'SUCCESS' : 'IDLE',
        }}
      />
    </div>
  )
}

