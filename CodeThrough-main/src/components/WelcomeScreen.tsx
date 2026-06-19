import { Play, Code2, GitBranch, Layers, Keyboard } from 'lucide-react';

interface WelcomeScreenProps {
  onRun: () => void;
}

export default function WelcomeScreen({ onRun }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center mb-6 mx-auto">
          <Code2 size={28} className="text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#EDEDED] mb-3 tracking-tight">
          Visualize Your Algorithm
        </h2>
        <p className="text-sm text-[#666] max-w-md leading-relaxed">
          Write JavaScript code in the editor, hit Run, and watch variables, arrays, trees, and
          linked lists come to life step by step.
        </p>
      </div>

      <button
        onClick={onRun}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#EDEDED] text-[#000] hover:bg-[#FFF] rounded-lg font-semibold transition-all cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] text-sm mb-12"
      >
        <Play size={14} fill="currentColor" /> Run Algorithm
      </button>

      <div className="grid grid-cols-3 gap-6 max-w-lg mb-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Code2 size={18} className="text-blue-400" />
          </div>
          <span className="text-[10px] text-[#555] uppercase tracking-wider">Step-by-step</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <GitBranch size={18} className="text-purple-400" />
          </div>
          <span className="text-[10px] text-[#555] uppercase tracking-wider">Data Structures</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Layers size={18} className="text-emerald-400" />
          </div>
          <span className="text-[10px] text-[#555] uppercase tracking-wider">14 Templates</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[#333]">
        <Keyboard size={12} />
        <span className="text-[10px] font-mono">
          <kbd className="px-1.5 py-0.5 bg-[#111] border border-[#222] rounded text-[#555]">
            Cmd+Enter
          </kbd>{' '}
          Run{' '}
          <kbd className="px-1.5 py-0.5 bg-[#111] border border-[#222] rounded text-[#555] ml-2">
            Space
          </kbd>{' '}
          Play/Pause{' '}
          <kbd className="px-1.5 py-0.5 bg-[#111] border border-[#222] rounded text-[#555] ml-2">
            ← →
          </kbd>{' '}
          Step
        </span>
      </div>
    </div>
  );
}
