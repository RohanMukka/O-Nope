import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import type { PlaybackSpeed } from '../types';

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4];

interface TimelineProps {
  snapshotCount: number;
  currentIndex: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onGoToStep: (step: number) => void;
  onSetSpeed: (speed: PlaybackSpeed) => void;
}

export default function Timeline({
  snapshotCount,
  currentIndex,
  isPlaying,
  speed,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onGoToStep,
  onSetSpeed,
}: TimelineProps) {
  if (snapshotCount === 0) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-14 bg-[#0A0A0A]/80 border border-[#222] backdrop-blur-xl flex items-center px-6 gap-4 rounded-full shadow-2xl z-50 min-w-[500px]">
      <button
        onClick={onStepBackward}
        className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#999] flex items-center justify-center hover:bg-[#222] hover:text-[#EDEDED] transition-colors"
        title="Step backward"
      >
        <SkipBack size={12} />
      </button>

      <button
        onClick={onTogglePlay}
        className="w-8 h-8 rounded-full bg-[#EDEDED] text-[#000] flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isPlaying ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <button
        onClick={onStepForward}
        className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#999] flex items-center justify-center hover:bg-[#222] hover:text-[#EDEDED] transition-colors"
        title="Step forward"
      >
        <SkipForward size={12} />
      </button>

      <div className="flex-1 flex items-center">
        <input
          type="range"
          min={0}
          max={snapshotCount - 1}
          value={currentIndex}
          onChange={(e) => onGoToStep(Number(e.target.value))}
          className="w-full cursor-pointer h-1 bg-[#222] rounded-full appearance-none outline-none"
        />
      </div>

      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
              speed === s
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-[#555] hover:text-[#999]'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="text-[#666] font-mono text-[10px] tracking-widest uppercase shrink-0">
        Step <span className="text-[#EDEDED]">{currentIndex + 1}</span> / {snapshotCount}
      </div>
    </div>
  );
}
