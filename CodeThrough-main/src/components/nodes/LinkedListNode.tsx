import type { LinkedListNodeData, LinkedListValue } from '../../types';

function toArray(node: LinkedListValue | null, maxLen = 50): unknown[] {
  const result: unknown[] = [];
  let curr = node;
  const visited = new Set<LinkedListValue>();
  while (curr && result.length < maxLen) {
    if (visited.has(curr)) break;
    visited.add(curr);
    result.push(curr.val);
    curr = curr.next;
  }
  return result;
}

export default function LinkedListNode({ data }: { data: LinkedListNodeData }) {
  const values = toArray(data.list);

  return (
    <div
      className={`p-3 bg-[#0A0A0A] border rounded-xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <div className="flex items-center gap-0">
        {values.map((val, idx) => (
          <div key={idx} className="flex items-center">
            <div className="flex flex-col items-center bg-[#111] border border-[#333] rounded-lg min-w-[44px] px-2 py-2">
              <span className="text-sm font-mono font-bold text-[#EDEDED]">{String(val)}</span>
            </div>
            {idx < values.length - 1 && (
              <svg width="24" height="12" className="shrink-0">
                <line x1="0" y1="6" x2="18" y2="6" stroke="#555" strokeWidth="1.5" />
                <polygon points="18,2 24,6 18,10" fill="#555" />
              </svg>
            )}
          </div>
        ))}
        <svg width="24" height="12" className="shrink-0 ml-0">
          <line x1="0" y1="6" x2="14" y2="6" stroke="#555" strokeWidth="1.5" />
          <text x="16" y="10" fill="#666" fontSize="10" fontFamily="monospace">
            ∅
          </text>
        </svg>
      </div>
    </div>
  );
}
