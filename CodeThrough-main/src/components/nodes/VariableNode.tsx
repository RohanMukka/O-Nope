import { motion } from 'framer-motion';
import type { VariableNodeData } from '../../types';

export default function VariableNode({ data }: { data: VariableNodeData }) {
  return (
    <div
      className={`px-5 py-3 bg-[#0A0A0A] border transition-colors duration-500 rounded-xl min-w-[140px] flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
          : 'border-[#222] shadow-2xl'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-1.5">
        {data.name}
      </span>
      <motion.span
        key={data.value + (data.isChanged ? '1' : '0')}
        initial={{
          scale: data.isChanged ? 1.4 : 1,
          color: data.isChanged ? '#60a5fa' : '#EDEDED',
        }}
        animate={{ scale: 1, color: '#EDEDED' }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className="text-base font-mono font-medium"
      >
        {data.value}
      </motion.span>
    </div>
  );
}
