import { Terminal, X } from 'lucide-react';

interface ConsolePanelProps {
  logs: string[];
  onClose: () => void;
}

export default function ConsolePanel({ logs, onClose }: ConsolePanelProps) {
  return (
    <div className="border-t border-[#1A1A1A] bg-[#050505]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2 text-[#666]">
          <Terminal size={12} />
          <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">Console</span>
          {logs.length > 0 && (
            <span className="text-[9px] bg-[#222] px-1.5 py-0.5 rounded-full font-mono">
              {logs.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#444] hover:text-[#999] transition-colors"
        >
          <X size={12} />
        </button>
      </div>
      <div className="px-4 py-2 max-h-[120px] overflow-auto custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-[11px] text-[#444] font-mono italic">No console output</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="text-[11px] font-mono text-[#EDEDED] py-0.5 flex items-start gap-2">
              <span className="text-[#444] select-none shrink-0">&gt;</span>
              <span>{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
