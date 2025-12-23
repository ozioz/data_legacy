'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Database, ArrowRight, Check, X, AlertTriangle, ArrowLeft, Key } from 'lucide-react'
import { MASCOTS, GAME_STORIES, GAME_TYPES } from '@/lib/game/constants'
import StoryModal from '@/components/ui/StoryModal'
import VirtualCTO from '@/components/ui/VirtualCTO'
import { saveGameSession } from '@/app/actions/game-actions'
import { useGameStore } from '@/lib/store/game-store'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface KimballArchitectProps {
  level: any
  onComplete: (xp: number, gameResult?: { won: boolean; score: number }) => void
  onExit: () => void
  playerHero: { id: string; name: string; img: string } | null
}

type TableType = 'FACT' | 'DIMENSION' | null
type ConnectionStatus = 'VALID' | 'WARNING' | 'ERROR' | null
type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY' | null

interface StagingTable {
  id: string
  name: string
  columns: string[]
}

const STAGING_TABLES: StagingTable[] = [
  {
    id: 'raw_orders',
    name: 'raw_orders',
    columns: ['order_id', 'user_id', 'product_id', 'order_date', 'amount', 'quantity'],
  },
  {
    id: 'raw_users',
    name: 'raw_users',
    columns: ['user_id', 'name', 'email', 'country', 'signup_date'],
  },
  {
    id: 'raw_products',
    name: 'raw_products',
    columns: ['product_id', 'name', 'category', 'price', 'supplier_id'],
  },
  {
    id: 'raw_suppliers',
    name: 'raw_suppliers',
    columns: ['supplier_id', 'name', 'country', 'rating'],
  },
]

// Custom Table Node Component
function TableNode({ data }: { data: { table: { id: string; name: string; type: TableType; columns: string[] }; onTypeSelect: (id: string, type: TableType) => void; onColumnClick: (tableId: string, column: string) => void; connectingFrom: { tableId: string; column: string } | null } }) {
  const { table, onTypeSelect, onColumnClick, connectingFrom } = data

  return (
    <div
      className={`rounded-lg border-2 min-w-[200px] ${
        table.type === 'FACT'
          ? 'bg-red-500/20 border-red-500'
          : table.type === 'DIMENSION'
            ? 'bg-blue-500/20 border-blue-500'
            : 'bg-slate-700 border-slate-600'
      }`}
    >
      {/* Table Header */}
      <div className="bg-slate-800 px-3 py-2 rounded-t-lg border-b border-slate-700 flex items-center justify-between">
        <div className="font-mono font-bold text-sm text-white">{table.name}</div>
        {!table.type ? (
          <div className="flex gap-1">
            <button
              onClick={() => onTypeSelect(table.id, 'FACT')}
              className="px-2 py-1 text-xs bg-red-500/30 border border-red-500 rounded hover:bg-red-500/50 text-white"
            >
              FACT
            </button>
            <button
              onClick={() => onTypeSelect(table.id, 'DIMENSION')}
              className="px-2 py-1 text-xs bg-blue-500/30 border border-blue-500 rounded hover:bg-blue-500/50 text-white"
            >
              DIM
            </button>
          </div>
        ) : (
          <div
            className={`text-xs px-2 py-1 rounded ${
              table.type === 'FACT' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
          >
            {table.type}
          </div>
        )}
      </div>

      {/* Table Columns */}
      <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
        {table.columns.map((col, idx) => {
          const isConnecting = connectingFrom?.tableId === table.id && connectingFrom?.column === col
          const canConnect = table.type && connectingFrom && connectingFrom.tableId !== table.id

          return (
            <div
              key={idx}
              className={`text-xs font-mono text-gray-300 flex items-center justify-between group px-2 py-1 rounded ${
                isConnecting ? 'bg-yellow-500/30' : canConnect ? 'bg-green-500/20 cursor-pointer hover:bg-green-500/30' : 'hover:bg-slate-600/50'
              }`}
              onClick={() => table.type && onColumnClick(table.id, col)}
              title={table.type ? (connectingFrom ? 'Click to complete connection' : 'Click to start connection') : 'Classify table first'}
            >
              <span>{col}</span>
              {table.type && (
                <>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${col}-source`}
                    className="!w-4 !h-4 !bg-cyan-400 !border-2 !border-white hover:!bg-cyan-300 !cursor-crosshair !rounded-full !opacity-100 hover:!scale-125 !transition-all"
                    style={{ right: -10 }}
                  />
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`${col}-target`}
                    className="!w-4 !h-4 !bg-cyan-400 !border-2 !border-white hover:!bg-cyan-300 !cursor-crosshair !rounded-full !opacity-100 hover:!scale-125 !transition-all"
                    style={{ left: -10 }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  table: TableNode,
}

export default function KimballArchitect({ level, onComplete, onExit, playerHero }: KimballArchitectProps) {
  const { calculateModelIntegrity, saveStageResult, syncProjectStateToDB } = useGameStore()
  const [stagingTables, setStagingTables] = useState<StagingTable[]>(STAGING_TABLES)
  const [connectingFrom, setConnectingFrom] = useState<{ tableId: string; column: string } | null>(null)
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'ERROR'>('PLAYING')
  const [message, setMessage] = useState('')
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [startTime] = useState(Date.now())
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)
  const [showRelationshipModal, setShowRelationshipModal] = useState(false)
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null)
  const [showEdgeMenu, setShowEdgeMenu] = useState<{ edgeId: string; x: number; y: number } | null>(null)

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  // Convert nodes to internal table format for validation
  const warehouseTables = useMemo(() => {
    return nodes.map((node: Node) => ({
      id: node.id,
      name: (node.data as any).table.name,
      type: (node.data as any).table.type,
      columns: (node.data as any).table.columns,
    }))
  }, [nodes])

  // Convert edges to internal connection format
  const connections = useMemo(() => {
    return edges.map((edge: Edge) => {
      const fromTable = warehouseTables.find((t) => t.id === edge.source)
      const toTable = warehouseTables.find((t) => t.id === edge.target)
      const fromKey = (edge.sourceHandle as string)?.replace('-source', '') || ''
      const toKey = (edge.targetHandle as string)?.replace('-target', '') || ''

      let connectionStatus: ConnectionStatus = null
      if (fromTable && toTable) {
        if (fromTable.type === 'FACT' && toTable.type === 'FACT') {
          connectionStatus = 'ERROR'
        } else if (fromTable.type === 'DIMENSION' && toTable.type === 'DIMENSION') {
          connectionStatus = 'WARNING'
        } else if (fromTable.type === 'FACT' && toTable.type === 'DIMENSION') {
          connectionStatus = 'VALID'
        } else if (fromTable.type === 'DIMENSION' && toTable.type === 'FACT') {
          connectionStatus = 'VALID'
        }
      }

      return {
        id: edge.id,
        from: edge.source,
        to: edge.target,
        fromKey,
        toKey,
        status: connectionStatus,
      }
    })
  }, [edges, warehouseTables])

  // Helper function to get edge style based on connection status
  const getEdgeStyle = useCallback((fromTable: typeof warehouseTables[0] | undefined, toTable: typeof warehouseTables[0] | undefined) => {
    if (!fromTable || !toTable) {
      return { stroke: '#6b7280', strokeWidth: 2 }
    }

    if (fromTable.type === 'FACT' && toTable.type === 'FACT') {
      return { stroke: '#ef4444', strokeWidth: 3 }
    } else if (fromTable.type === 'DIMENSION' && toTable.type === 'DIMENSION') {
      return { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' }
    } else if ((fromTable.type === 'FACT' && toTable.type === 'DIMENSION') || (fromTable.type === 'DIMENSION' && toTable.type === 'FACT')) {
      return { stroke: '#10b981', strokeWidth: 2 }
    }
    
    return { stroke: '#6b7280', strokeWidth: 2 }
  }, [])

  // Update edge styles when warehouse table types change (not on every render)
  const tableTypesKey = useMemo(() => 
    warehouseTables.map(t => `${t.id}:${t.type}`).join('|'),
    [warehouseTables]
  )
  
  useEffect(() => {
    if (edges.length === 0) return
    
    setEdges((eds) => {
      return eds.map((edge: Edge) => {
        const fromTable = warehouseTables.find((t) => t.id === edge.source)
        const toTable = warehouseTables.find((t) => t.id === edge.target)
        
        if (!fromTable || !toTable) return edge
        
        // Calculate connection status
        let connectionStatus: ConnectionStatus = null
        if (fromTable.type === 'FACT' && toTable.type === 'FACT') {
          connectionStatus = 'ERROR'
        } else if (fromTable.type === 'DIMENSION' && toTable.type === 'DIMENSION') {
          connectionStatus = 'WARNING'
        } else if ((fromTable.type === 'FACT' && toTable.type === 'DIMENSION') || (fromTable.type === 'DIMENSION' && toTable.type === 'FACT')) {
          connectionStatus = 'VALID'
        }
        
        const style = getEdgeStyle(fromTable, toTable)
        const fromKey = (edge.sourceHandle as string)?.replace('-source', '') || ''
        const toKey = (edge.targetHandle as string)?.replace('-target', '') || ''
        
        // Check if style needs updating
        const currentStroke = (edge.style as any)?.stroke
        if (currentStroke === style.stroke && (edge.style as any)?.strokeWidth === style.strokeWidth) {
          return edge
        }

        // Get relationship type from edge data
        const relationshipType = (edge.data as any)?.relationshipType as RelationshipType
        
        // Determine marker style based on relationship type
        let markerEnd: any = {
          type: MarkerType.ArrowClosed,
          color: style.stroke,
        }
        
        // For many-to-many, add marker at start too
        let markerStart: any | undefined = undefined
        if (relationshipType === 'MANY_TO_MANY') {
          markerStart = {
            type: MarkerType.ArrowClosed,
            color: style.stroke,
          }
        }
        
        // For one-to-many, make arrow thicker
        if (relationshipType === 'ONE_TO_MANY') {
          markerEnd.width = 20
          markerEnd.height = 20
        }

        return {
          ...edge,
          style: {
            ...style,
            // Add animation for valid connections
            ...(connectionStatus === 'VALID' && relationshipType && { strokeDasharray: '5,5' }),
          },
          animated: connectionStatus === 'VALID' && relationshipType !== null,
          markerEnd,
          ...(markerStart && { markerStart }),
          label: `${fromKey} → ${toKey}${relationshipType ? ` (${relationshipType.replace(/_/g, '-')})` : ''}`,
          labelStyle: {
            fill: style.stroke,
            fontWeight: 600,
            fontSize: '10px',
          },
          labelBgStyle: {
            fill: 'rgba(0,0,0,0.7)',
            fillOpacity: 0.8,
          },
        }
      })
    })
  }, [tableTypesKey, getEdgeStyle]) // Only update when table types change, not on every edge change

  const handleDragStart = (e: React.DragEvent, table: StagingTable) => {
    e.dataTransfer.setData('tableId', table.id)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const tableId = e.dataTransfer.getData('tableId')
    const table = stagingTables.find((t) => t.id === tableId)
    if (!table) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newNode: Node = {
      id: table.id,
      type: 'table',
      position: { x, y },
      data: {
        table: {
          id: table.id,
          name: table.name.replace('raw_', ''),
          type: null,
          columns: table.columns,
        },
        onTypeSelect: handleTableTypeSelect,
        onColumnClick: handleColumnClick,
        connectingFrom,
      },
    }

    setNodes((nds) => [...nds, newNode])
    setStagingTables((tables) => tables.filter((t) => t.id !== tableId))
  }

  const handleTableTypeSelect = (tableId: string, type: TableType) => {
    setNodes((nds) =>
      nds.map((node: Node) => {
        if (node.id === tableId) {
          const nodeData = node.data as any
          return {
            ...node,
            data: {
              ...nodeData,
              table: {
                ...nodeData.table,
                type,
              },
            },
          }
        }
        return node
      })
    )
  }

  const handleColumnClick = (tableId: string, column: string) => {
    if (!connectingFrom) {
      setConnectingFrom({ tableId, column })
      setMessage(`Connecting from ${warehouseTables.find((t) => t.id === tableId)?.name}.${column} - Click another column to complete.`)
    } else if (connectingFrom.tableId !== tableId) {
      // Create connection
      const fromNode = nodes.find((n) => n.id === connectingFrom.tableId)
      const toNode = nodes.find((n) => n.id === tableId)

      if (fromNode && toNode) {
        const newEdge: Edge = {
          id: `edge-${connectingFrom.tableId}-${connectingFrom.column}-${tableId}-${column}`,
          source: connectingFrom.tableId,
          target: tableId,
          sourceHandle: `${connectingFrom.column}-source`,
          targetHandle: `${column}-target`,
          type: 'smoothstep',
        }

        setEdges((eds) => {
          // Check if edge already exists
          const exists = eds.some(
            (e) => e.source === newEdge.source && e.target === newEdge.target && e.sourceHandle === newEdge.sourceHandle && e.targetHandle === newEdge.targetHandle
          )
          if (exists) return eds
          return [...eds, newEdge]
        })

        setConnectingFrom(null)
        setMessage('')
      }
    } else {
      setConnectingFrom(null)
      setMessage('')
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      // Only allow connections if both tables are typed
      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      if (!sourceNode || !targetNode) {
        setMessage('Could not find source or target table.')
        return false
      }

      const sourceData = sourceNode?.data as any
      const targetData = targetNode?.data as any

      if (!sourceData?.table?.type || !targetData?.table?.type) {
        setMessage('Both tables must be classified (FACT or DIMENSION) before connecting.')
        return false // Prevent connection
      }

      // Check if connection already exists
      const existingEdge = edges.find(
        (e) =>
          e.source === params.source &&
          e.target === params.target &&
          e.sourceHandle === params.sourceHandle &&
          e.targetHandle === params.targetHandle
      )

      if (existingEdge) {
        setMessage('This connection already exists.')
        return false
      }

      // Store pending connection and show modal
      setPendingConnection(params)
      setShowRelationshipModal(true)
      return false // Prevent automatic connection
    },
    [nodes, edges]
  )

  const handleRelationshipSelect = (relationshipType: RelationshipType, isEditing: boolean = false) => {
    if (!pendingConnection && !editingEdge) return

    const connection = isEditing && editingEdge ? {
      source: editingEdge.source,
      target: editingEdge.target,
      sourceHandle: editingEdge.sourceHandle,
      targetHandle: editingEdge.targetHandle,
    } : pendingConnection

    if (!connection) return

    const fromTable = warehouseTables.find((t) => t.id === connection.source)
    const toTable = warehouseTables.find((t) => t.id === connection.target)
    const style = getEdgeStyle(fromTable, toTable)
    
    const sourceHandle = connection.sourceHandle as string
    const targetHandle = connection.targetHandle as string
    const fromKey = sourceHandle?.replace('-source', '') || ''
    const toKey = targetHandle?.replace('-target', '') || ''

    // Determine marker style based on relationship type
    let markerEnd: any = {
      type: MarkerType.ArrowClosed,
      color: style.stroke,
    }
    
    let markerStart: any | undefined = undefined
    if (relationshipType === 'MANY_TO_MANY') {
      markerStart = {
        type: MarkerType.ArrowClosed,
        color: style.stroke,
      }
    }
    
    if (relationshipType === 'ONE_TO_MANY') {
      markerEnd.width = 20
      markerEnd.height = 20
    }

    const edgeWithStyle: Edge = {
      ...(isEditing && editingEdge ? editingEdge : connection),
      id: isEditing && editingEdge ? editingEdge.id : `edge-${connection.source}-${fromKey}-${connection.target}-${toKey}`,
      style: {
        ...style,
        ...(style.stroke === '#10b981' && { strokeDasharray: '5,5' }), // Animated dash for valid connections
      },
      animated: style.stroke === '#10b981', // Animate valid connections
      markerEnd,
      ...(markerStart && { markerStart }),
      data: {
        relationshipType,
      },
      label: `${fromKey} → ${toKey}`,
      labelStyle: {
        fill: style.stroke,
        fontWeight: 600,
        fontSize: '10px',
      },
      labelBgStyle: {
        fill: 'rgba(0,0,0,0.7)',
        fillOpacity: 0.8,
      },
    }

    if (isEditing && editingEdge) {
      // Update existing edge
      setEdges((eds) => eds.map((e) => (e.id === editingEdge.id ? edgeWithStyle : e)))
      setEditingEdge(null)
    } else {
      // Add new edge
      setEdges((eds) => {
        // Check if edge already exists
        const exists = eds.some(
          (e) => e.source === edgeWithStyle.source && e.target === edgeWithStyle.target && e.sourceHandle === edgeWithStyle.sourceHandle && e.targetHandle === edgeWithStyle.targetHandle
        )
        if (exists) return eds
        return [...eds, edgeWithStyle]
      })
    }

    setPendingConnection(null)
    setShowRelationshipModal(false)
    setConnectingFrom(null)
  }

  const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setEditingEdge(edge)
    setPendingConnection({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null,
    })
    setShowRelationshipModal(true)
  }

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId))
    setShowEdgeMenu(null)
  }

  const validateSchema = () => {
    if (warehouseTables.length < 4) {
      setStatus('ERROR')
      setMessage('You need at least 4 tables (1 Fact + 3 Dimensions) to create a Star Schema.')
      return false
    }

    const factTables = warehouseTables.filter((t) => t.type === 'FACT')
    const dimensionTables = warehouseTables.filter((t) => t.type === 'DIMENSION')

    if (factTables.length !== 1) {
      setStatus('ERROR')
      setMessage('Star Schema requires exactly 1 Fact table.')
      return false
    }

    if (dimensionTables.length < 3) {
      setStatus('ERROR')
      setMessage('Star Schema requires at least 3 Dimension tables.')
      return false
    }

    const factTable = factTables[0]
    const connectedDimensions = new Set(
      connections.filter((c) => (c.from === factTable.id || c.to === factTable.id) && c.status === 'VALID').map((c) => (c.from === factTable.id ? c.to : c.from))
    )

    if (connectedDimensions.size < dimensionTables.length) {
      setStatus('ERROR')
      setMessage('The Fact table must be connected to all Dimension tables.')
      return false
    }

    const errorConnections = connections.filter((c) => c.status === 'ERROR')
    if (errorConnections.length > 0) {
      setStatus('ERROR')
      setMessage('Invalid connections detected. Fact tables cannot connect to other Fact tables.')
      return false
    }

    setStatus('WON')
    setMessage('Star Schema Created Successfully!')
    setShowDebriefing(true)
    return true
  }

  const handleComplete = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    const won = status === 'WON'

    const modelIntegrity = won ? calculateModelIntegrity(100, won) : 0

    saveStageResult(2, won ? 100 : 0, won, modelIntegrity)
    await syncProjectStateToDB()

    await saveGameSession({
      gameType: 'KIMBALL',
      levelId: level.id,
      score: won ? 100 : 0,
      duration,
      won,
      xpEarned: level.xpReward,
      gameConfig: {
        factTables: warehouseTables.filter((t) => t.type === 'FACT').length,
        dimensionTables: warehouseTables.filter((t) => t.type === 'DIMENSION').length,
        connections: connections.length,
        validConnections: connections.filter((c) => c.status === 'VALID').length,
        modelIntegrity,
      },
    })

    setShowDebriefing(false)
    onComplete(level.xpReward, { won, score: won ? 100 : 0 })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            The Kimball Architect
          </h1>
          <p className="text-gray-400 text-sm">Build a Star Schema Data Warehouse</p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </button>
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
        {/* Staging Area */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h2 className="text-lg font-bold mb-4 text-purple-400">Staging Tables</h2>
          <p className="text-sm text-gray-400 mb-4">Drag tables to the warehouse canvas</p>
          <div className="space-y-3">
            {stagingTables.map((table) => (
              <div
                key={table.id}
                draggable
                onDragStart={(e) => handleDragStart(e, table)}
                className="bg-slate-700 p-3 rounded-lg cursor-move hover:bg-slate-600 transition-all border border-slate-600"
              >
                <div className="font-mono font-bold text-sm">{table.name}</div>
                <div className="text-xs text-gray-400 mt-1">{table.columns.length} columns</div>
              </div>
            ))}
          </div>
        </div>

        {/* Warehouse Canvas with React Flow */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-cyan-400">Data Warehouse Canvas</h2>
            <button
              onClick={validateSchema}
              disabled={warehouseTables.length < 4}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:bg-slate-700 disabled:text-gray-500 transition-all"
            >
              Validate Schema
            </button>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full h-[600px] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-600"
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onEdgeClick={handleEdgeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-900/50"
            >
              <Background color="#374151" gap={16} />
              <Controls className="bg-slate-800 border border-slate-700" />
              <MiniMap className="bg-slate-800 border border-slate-700" nodeColor={(node) => {
                const nodeData = node.data as any
                const type = nodeData?.table?.type
                if (type === 'FACT') return '#ef4444'
                if (type === 'DIMENSION') return '#3b82f6'
                return '#6b7280'
              }} />
            </ReactFlow>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg text-sm">
            <p className="text-gray-300 mb-2">
              <strong>Goal:</strong> Create a Star Schema with 1 Fact table and 3+ Dimension tables
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-gray-400 space-y-1 text-xs">
                <li>• Fact → Dimension: ✅ Valid (Star Schema)</li>
                <li>• Dimension → Dimension: ⚠️ Warning (Snowflake - acceptable)</li>
                <li>• Fact → Fact: ❌ Error (Invalid)</li>
              </ul>
              <div className="text-xs text-gray-400">
                <p className="mb-1">
                  <strong className="text-gray-300">How to connect:</strong>
                </p>
                <p>1. Classify table as FACT or DIMENSION</p>
                <p>2. <strong className="text-cyan-400">Drag from the cyan dot (handle) on the right side of a column</strong></p>
                <p>3. <strong className="text-cyan-400">Drop it on the cyan dot (handle) on the left side of another column</strong></p>
                <p>4. Select relationship type in the modal</p>
                <p className="mt-2 text-yellow-400">💡 Tip: Click on a connection line to edit or delete it!</p>
              </div>
            </div>
            {connectingFrom && (
              <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-300 text-xs">
                <Key size={12} className="inline mr-1" />
                Connecting from {warehouseTables.find((t) => t.id === connectingFrom.tableId)?.name}.{connectingFrom.column} - Select target column
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Debriefing Modal */}
      <StoryModal
        isOpen={showDebriefing}
        type="debriefing"
        topic="Data Modeling Complete"
        story={
          status === 'WON'
            ? 'You successfully created a valid Star Schema following Kimball methodology. The data warehouse is ready for analytics!'
            : 'The schema needs adjustments. Review the Kimball principles and try again.'
        }
        mascot={MASCOTS.query}
        levelName={level.name}
        onClose={() => {
          setShowDebriefing(false)
        }}
        onAction={handleComplete}
        actionLabel="RETURN TO PROJECT"
      />

      {/* Relationship Type Selection Modal */}
      {showRelationshipModal && (pendingConnection || editingEdge) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 border-2 border-cyan-500 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingEdge ? 'Edit Relationship Type' : 'Select Relationship Type'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {editingEdge 
                ? 'Choose a new relationship type for this connection:'
                : 'Choose the type of relationship between these columns:'}
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleRelationshipSelect('ONE_TO_ONE', !!editingEdge)}
                className={`w-full p-4 bg-slate-700 hover:bg-slate-600 border-2 rounded-lg text-left transition-all group ${
                  editingEdge?.data?.relationshipType === 'ONE_TO_ONE' ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-600 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white group-hover:text-cyan-400">One-to-One (1:1)</div>
                    <div className="text-sm text-gray-400 mt-1">Each record in the source table relates to exactly one record in the target table</div>
                  </div>
                  <ArrowRight className="text-gray-500 group-hover:text-cyan-400" size={20} />
                </div>
              </button>

              <button
                onClick={() => handleRelationshipSelect('ONE_TO_MANY', !!editingEdge)}
                className={`w-full p-4 bg-slate-700 hover:bg-slate-600 border-2 rounded-lg text-left transition-all group ${
                  editingEdge?.data?.relationshipType === 'ONE_TO_MANY' ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-600 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white group-hover:text-cyan-400">One-to-Many (1:N)</div>
                    <div className="text-sm text-gray-400 mt-1">Each record in the source table can relate to multiple records in the target table</div>
                  </div>
                  <ArrowRight className="text-gray-500 group-hover:text-cyan-400" size={20} />
                </div>
              </button>

              <button
                onClick={() => handleRelationshipSelect('MANY_TO_MANY', !!editingEdge)}
                className={`w-full p-4 bg-slate-700 hover:bg-slate-600 border-2 rounded-lg text-left transition-all group ${
                  editingEdge?.data?.relationshipType === 'MANY_TO_MANY' ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-600 hover:border-cyan-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white group-hover:text-cyan-400">Many-to-Many (N:N)</div>
                    <div className="text-sm text-gray-400 mt-1">Multiple records in the source table can relate to multiple records in the target table</div>
                  </div>
                  <ArrowRight className="text-gray-500 group-hover:text-cyan-400" size={20} />
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              {editingEdge && (
                <button
                  onClick={() => {
                    handleDeleteEdge(editingEdge.id)
                    setEditingEdge(null)
                    setPendingConnection(null)
                    setShowRelationshipModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 border border-red-500 rounded-lg text-white transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setPendingConnection(null)
                  setEditingEdge(null)
                  setShowRelationshipModal(false)
                }}
                className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-all ${editingEdge ? 'flex-1' : 'w-full'}`}
              >
                {editingEdge ? 'Cancel' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual CTO Companion */}
      <VirtualCTO
        currentStage={2}
        gameContext={{
          gameType: GAME_TYPES.KIMBALL,
          status: status === 'WON' ? 'SUCCESS' : status === 'ERROR' ? 'ERROR' : 'IDLE',
        }}
      />
    </div>
  )
}
