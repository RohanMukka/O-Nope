import { AlertTriangle, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export default function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  return (
    <div className="mx-4 mb-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
      <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-[11px] font-mono text-red-300 leading-relaxed whitespace-pre-wrap">
          {error}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400/50 hover:text-red-400 transition-colors shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  );
}
