import type { TreeNodeData, TreeValue } from '../../types';

interface FlatTreeNode {
  id: string;
  val: unknown;
  x: number;
  y: number;
  parentId?: string;
}

function flattenTree(
  node: TreeValue | null,
  id: string,
  x: number,
  y: number,
  xSpread: number
): FlatTreeNode[] {
  if (!node) return [];
  const result: FlatTreeNode[] = [{ id, val: node.val, x, y }];
  if (node.left) {
    const childId = `${id}-L`;
    result.push(
      ...flattenTree(node.left, childId, x - xSpread, y + 60, xSpread * 0.55).map(
        (n, i) => (i === 0 ? { ...n, parentId: id } : n)
      )
    );
  }
  if (node.right) {
    const childId = `${id}-R`;
    result.push(
      ...flattenTree(node.right, childId, x + xSpread, y + 60, xSpread * 0.55).map(
        (n, i) => (i === 0 ? { ...n, parentId: id } : n)
      )
    );
  }
  return result;
}

export default function TreeNode({ data }: { data: TreeNodeData }) {
  const flat = flattenTree(data.tree, 'root', 150, 30, 70);
  const nodeMap = new Map(flat.map((n) => [n.id, n]));

  const width = Math.max(320, ...flat.map((n) => n.x + 40));
  const height = Math.max(120, ...flat.map((n) => n.y + 50));

  return (
    <div
      className={`p-3 bg-[#0A0A0A] border rounded-xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <svg width={width} height={height} className="overflow-visible">
        {flat
          .filter((n) => n.parentId)
          .map((n) => {
            const parent = nodeMap.get(n.parentId!);
            if (!parent) return null;
            return (
              <line
                key={`edge-${n.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={n.x}
                y2={n.y}
                stroke="#444"
                strokeWidth={1.5}
              />
            );
          })}
        {flat.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={16} fill="#111" stroke="#444" strokeWidth={1.5} />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fill="#EDEDED"
              fontSize={11}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {String(n.val)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
