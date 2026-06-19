import type { MatrixNodeData } from '../../types';

export default function MatrixNode({ data }: { data: MatrixNodeData }) {
  return (
    <div
      className={`p-3 bg-[#0A0A0A] border rounded-xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <div className="flex flex-col gap-0 bg-[#111] border border-[#222] rounded-lg overflow-hidden">
        {data.matrix.map((row, ri) => (
          <div key={ri} className="flex border-b border-[#222] last:border-0">
            {(row as unknown[]).map((cell, ci) => (
              <div
                key={ci}
                className="min-w-[40px] py-2 px-2 text-center text-sm font-mono font-bold text-[#EDEDED] border-r border-[#222] last:border-0"
              >
                {String(cell)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
