import { motion, AnimatePresence } from 'framer-motion';
import type { ArrayNodeData } from '../../types';

export default function ArrayNode({ data }: { data: ArrayNodeData }) {
  return (
    <div
      className={`px-3 py-3 bg-[#0A0A0A] border transition-colors duration-500 rounded-xl shadow-2xl flex flex-col items-center backdrop-blur-xl ${
        data.isChanged
          ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
          : 'border-[#222]'
      }`}
    >
      <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold mb-2">
        {data.name}
      </span>
      <div className="flex bg-[#111] border border-[#222] rounded-lg w-fit overflow-visible shrink-0 mt-4">
        {data.values.map((val, idx) => {
          const pointingVars = Object.entries(data.pointers)
            .filter(([, pIdx]) => pIdx === idx)
            .map(([n]) => n);
          return (
            <div
              key={idx}
              className="relative flex flex-col items-center border-r border-[#222] last:border-0 min-w-[50px]"
            >
              <div className="absolute -top-7 flex flex-col-reverse items-center justify-start h-[30px] overflow-visible gap-0.5">
                <AnimatePresence>
                  {pointingVars.map((vName) => (
                    <motion.div
                      key={vName}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-1 py-0.5 rounded shadow-lg whitespace-nowrap"
                    >
                      ↓ {vName}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <motion.div
                key={String(val) + (data.isChanged ? 'chg' : 'static')}
                initial={data.isChanged ? { color: '#a855f7', scale: 1.2 } : {}}
                animate={{ color: '#EDEDED', scale: 1 }}
                transition={{ type: 'spring' }}
                className="py-3 w-full text-center text-sm font-mono font-bold"
              >
                {String(val)}
              </motion.div>
              <div className="w-full text-center text-[9px] text-[#444] pb-1 font-mono hover:text-[#666] transition-colors">
                {idx}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
