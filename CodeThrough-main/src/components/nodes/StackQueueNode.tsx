import type { StackQueueNodeData } from '../../types';

export default function StackQueueNode({ data }: { data: StackQueueNodeData }) {
  return (
    <div
      className={`p-3 bg-[#0A0A0A] border rounded-xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <div className="flex flex-col-reverse gap-0 bg-[#111] border border-[#222] rounded-lg overflow-hidden min-w-[60px]">
        {data.values.map((val, idx) => (
          <div
            key={idx}
            className="py-2 px-4 text-center text-sm font-mono font-bold text-[#EDEDED] border-b border-[#222] last:border-0"
          >
            {String(val)}
          </div>
        ))}
      </div>
    </div>
  );
}
