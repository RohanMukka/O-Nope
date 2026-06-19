import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import type { Snapshot } from '../types';
import { detectStructure } from '../lib/detectStructure';
import VariableNode from './nodes/VariableNode';
import ArrayNode from './nodes/ArrayNode';
import TreeNode from './nodes/TreeNode';
import LinkedListNode from './nodes/LinkedListNode';
import MatrixNode from './nodes/MatrixNode';
import StackQueueNode from './nodes/StackQueueNode';
import ObjectNode from './nodes/ObjectNode';

const nodeTypes = {
  variable: VariableNode,
  array: ArrayNode,
  tree: TreeNode,
  linkedList: LinkedListNode,
  matrix: MatrixNode,
  stackQueue: StackQueueNode,
  object: ObjectNode,
};

interface VisualizationPanelProps {
  activeSnapshot: Snapshot | null;
  previousSnapshot: Snapshot | null;
  currentIndex: number;
}

export default function VisualizationPanel({
  activeSnapshot,
  previousSnapshot,
  currentIndex,
}: VisualizationPanelProps) {
  const { nodes, edges, narrative } = useMemo(() => {
    const rfNodes: Node[] = [];
    const rfEdges: Edge[] = [];
    const changes: string[] = [];

    if (!activeSnapshot)
      return { nodes: rfNodes, edges: rfEdges, narrative: 'Waiting for execution...' };

    // Gather potential pointers (integer variables)
    const pointerVars: Record<string, number> = {};
    for (const [key, val] of Object.entries(activeSnapshot.variables)) {
      if (typeof val === 'number' && !isNaN(val)) pointerVars[key] = val;
    }

    let varIndex = 0;
    const xBase = 200;
    const yBase = 200;

    for (const [key, val] of Object.entries(activeSnapshot.variables)) {
      if (val === undefined || typeof val === 'function' || (typeof val === 'number' && isNaN(val as number))) {
        continue;
      }

      const prevVal = previousSnapshot ? previousSnapshot.variables[key] : undefined;
      const isChanged = JSON.stringify(prevVal) !== JSON.stringify(val) && previousSnapshot !== null;
      if (isChanged) changes.push(key);

      const structType = detectStructure(val);
      const xPos = xBase + varIndex * 220;

      switch (structType) {
        case 'array':
          rfNodes.push({
            id: `var-${key}`,
            type: 'array',
            position: { x: xPos, y: yBase },
            data: { name: key, values: val as unknown[], pointers: pointerVars, isChanged },
          });
          varIndex += 2;
          break;
        case 'matrix':
          rfNodes.push({
            id: `var-${key}`,
            type: 'matrix',
            position: { x: xPos, y: yBase },
            data: { name: key, matrix: val as unknown[][], isChanged },
          });
          varIndex += 2;
          break;
        case 'tree':
          rfNodes.push({
            id: `var-${key}`,
            type: 'tree',
            position: { x: xPos, y: yBase },
            data: { name: key, tree: val, isChanged },
          });
          varIndex += 2;
          break;
        case 'linkedList':
          rfNodes.push({
            id: `var-${key}`,
            type: 'linkedList',
            position: { x: xPos, y: yBase },
            data: { name: key, list: val, isChanged },
          });
          varIndex += 2;
          break;
        case 'object': {
          const entries = Object.entries(val as Record<string, unknown>);
          rfNodes.push({
            id: `var-${key}`,
            type: 'object',
            position: { x: xPos, y: yBase },
            data: { name: key, entries, isChanged },
          });
          varIndex += 1;
          break;
        }
        default: {
          const valueStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
          rfNodes.push({
            id: `var-${key}`,
            type: 'variable',
            position: { x: xPos, y: yBase },
            data: { name: key, value: valueStr, isChanged },
          });
          varIndex += 1;
          break;
        }
      }
    }

    let generatedNarrative = '';
    if (currentIndex === 0) {
      generatedNarrative = `Initialized memory states at entry line ${activeSnapshot.line}.`;
    } else if (changes.length > 0) {
      generatedNarrative = `Line ${activeSnapshot.line} executed. Updated: ${changes.join(', ')}`;
    } else {
      generatedNarrative = `Evaluating logic on line ${activeSnapshot.line}.`;
    }

    return { nodes: rfNodes, edges: rfEdges, narrative: generatedNarrative };
  }, [activeSnapshot, previousSnapshot, currentIndex]);

  return (
    <div className="flex-1 relative">
      <AnimatePresence mode="wait">
        {activeSnapshot && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#0A0A0A]/90 border border-purple-500/20 shadow-[0_4px_30px_rgba(168,85,247,0.05)] backdrop-blur-xl rounded-full z-50 flex items-center gap-4 whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <p className="text-[#EDEDED] font-mono text-[13px]">{narrative}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#000]"
      >
        <Background color="#333" gap={24} size={1} style={{ opacity: 0.4 }} />
        <Controls className="!bg-[#111] !border-[#222] !fill-[#EDEDED] z-40" />
      </ReactFlow>
    </div>
  );
}
