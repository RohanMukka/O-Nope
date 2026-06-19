import type { ObjectNodeData } from '../../types';

export default function ObjectNode({ data }: { data: ObjectNodeData }) {
  return (
    <div
      className={`p-3 bg-[#0A0A0A] border rounded-xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden min-w-[120px]">
        {data.entries.map(([key, val], idx) => (
          <div
            key={idx}
            className="flex border-b border-[#222] last:border-0"
          >
            <div className="px-3 py-1.5 text-[11px] font-mono text-purple-400 border-r border-[#222] min-w-[60px]">
              {key}
            </div>
            <div className="px-3 py-1.5 text-[11px] font-mono text-[#EDEDED]">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
