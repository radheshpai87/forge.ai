import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { UserDrivenResponse } from '../types';

interface AnalysisVisualizerProps {
  response: UserDrivenResponse;
  theme: 'light' | 'dark';
}

const AnalysisVisualizer: React.FC<AnalysisVisualizerProps> = ({ response, theme }) => {
  // Convert analysis data to nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    
    // Problem node (center)
    nodes.push({
      id: 'problem',
      type: 'input',
      data: { 
        label: (
          <div className="p-2">
            <div className="font-bold text-sm mb-1">Problem</div>
            <div className="text-xs">{response.refined_problem.substring(0, 100)}...</div>
          </div>
        )
      },
      position: { x: 400, y: 50 },
      style: {
        background: theme === 'dark' ? '#1a1a1a' : '#f9fafb',
        color: theme === 'dark' ? '#fff' : '#000',
        border: `2px solid ${theme === 'dark' ? '#666' : '#999'}`,
        borderRadius: '12px',
        width: 300,
      },
    });

    // Analysis chunks as nodes
    response.chunks.forEach((chunk, index) => {
      const angle = (index * 2 * Math.PI) / response.chunks.length;
      const radius = 300;
      const x = 550 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      nodes.push({
        id: `chunk-${chunk.id}`,
        data: { 
          label: (
            <div className="p-3">
              <div className="font-bold text-sm mb-2">{chunk.title}</div>
              <div className="text-xs mb-2">{chunk.analysis.substring(0, 80)}...</div>
              <div className="text-xs font-semibold text-blue-500 dark:text-blue-400">
                {chunk.key_insights.length} insights
              </div>
            </div>
          )
        },
        position: { x, y },
        style: {
          background: theme === 'dark' ? '#2a2a2a' : '#fff',
          color: theme === 'dark' ? '#e5e5e5' : '#1a1a1a',
          border: `2px solid ${theme === 'dark' ? '#4a4a4a' : '#d1d5db'}`,
          borderRadius: '12px',
          width: 250,
        },
      });

      // Key insights as child nodes
      chunk.key_insights.forEach((insight, insightIndex) => {
        const childAngle = angle + ((insightIndex - (chunk.key_insights.length - 1) / 2) * 0.3);
        const childRadius = radius + 200;
        const childX = 550 + childRadius * Math.cos(childAngle);
        const childY = 250 + childRadius * Math.sin(childAngle);

        nodes.push({
          id: `insight-${chunk.id}-${insightIndex}`,
          data: { 
            label: (
              <div className="p-2">
                <div className="text-xs">{insight.substring(0, 60)}...</div>
              </div>
            )
          },
          position: { x: childX, y: childY },
          style: {
            background: theme === 'dark' ? '#3a3a3a' : '#f3f4f6',
            color: theme === 'dark' ? '#d1d5db' : '#374151',
            border: `1px solid ${theme === 'dark' ? '#555' : '#9ca3af'}`,
            borderRadius: '8px',
            width: 180,
            fontSize: '11px',
          },
        });
      });
    });

    // Solution guide node
    nodes.push({
      id: 'solution',
      type: 'output',
      data: { 
        label: (
          <div className="p-3">
            <div className="font-bold text-sm mb-2">Solution Guide</div>
            <div className="text-xs">{response.synthesis.solution_guide.length} steps</div>
          </div>
        )
      },
      position: { x: 450, y: 700 },
      style: {
        background: theme === 'dark' ? '#1e3a1e' : '#dcfce7',
        color: theme === 'dark' ? '#86efac' : '#166534',
        border: `2px solid ${theme === 'dark' ? '#15803d' : '#22c55e'}`,
        borderRadius: '12px',
        width: 200,
      },
    });

    return nodes;
  }, [response, theme]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Connect problem to all chunks
    response.chunks.forEach((chunk) => {
      edges.push({
        id: `problem-chunk-${chunk.id}`,
        source: 'problem',
        target: `chunk-${chunk.id}`,
        animated: true,
        style: { stroke: theme === 'dark' ? '#666' : '#999' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme === 'dark' ? '#666' : '#999',
        },
      });

      // Connect chunks to their insights
      chunk.key_insights.forEach((_, insightIndex) => {
        edges.push({
          id: `chunk-${chunk.id}-insight-${insightIndex}`,
          source: `chunk-${chunk.id}`,
          target: `insight-${chunk.id}-${insightIndex}`,
          style: { stroke: theme === 'dark' ? '#4a4a4a' : '#d1d5db' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: theme === 'dark' ? '#4a4a4a' : '#d1d5db',
          },
        });
      });

      // Connect chunks to solution
      edges.push({
        id: `chunk-${chunk.id}-solution`,
        source: `chunk-${chunk.id}`,
        target: 'solution',
        animated: true,
        style: { stroke: theme === 'dark' ? '#15803d' : '#22c55e' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme === 'dark' ? '#15803d' : '#22c55e',
        },
      });
    });

    return edges;
  }, [response, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls className={theme === 'dark' ? 'react-flow__controls-dark' : ''} />
        <MiniMap 
          nodeColor={theme === 'dark' ? '#2a2a2a' : '#f9fafb'}
          maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={12} 
          size={1}
          color={theme === 'dark' ? '#333' : '#ddd'}
        />
      </ReactFlow>
    </div>
  );
};

export default AnalysisVisualizer;
