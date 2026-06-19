import { Eye } from 'lucide-react';
import type { Snapshot } from '../types';

interface VariableWatchProps {
  snapshot: Snapshot | null;
  previousSnapshot: Snapshot | null;
}

function formatValue(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'function') return 'ƒ()';
  if (typeof val === 'object') {
    try {
      const str = JSON.stringify(val);
      return str.length > 60 ? str.slice(0, 57) + '...' : str;
    } catch {
      return '{...}';
    }
  }
  return String(val);
}

function getType(val: unknown): string {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}

export default function VariableWatch({ snapshot, previousSnapshot }: VariableWatchProps) {
  if (!snapshot) return null;

  const entries = Object.entries(snapshot.variables).filter(
    ([, val]) => val !== undefined && typeof val !== 'function'
  );

  if (entries.length === 0) return null;

  return (
    <div className="border-t border-[#1A1A1A] bg-[#050505]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1A1A1A] text-[#666]">
        <Eye size={12} />
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">Variables</span>
      </div>
      <div className="px-2 py-1 max-h-[150px] overflow-auto custom-scrollbar">
        <table className="w-full">
          <tbody>
            {entries.map(([key, val]) => {
              const prevVal = previousSnapshot ? previousSnapshot.variables[key] : undefined;
              const isChanged =
                previousSnapshot !== null && JSON.stringify(prevVal) !== JSON.stringify(val);
              return (
                <tr key={key} className="border-b border-[#111] last:border-0">
                  <td className="py-1 px-2 text-[11px] font-mono text-purple-400 w-[80px]">
                    {key}
                  </td>
                  <td className="py-1 px-2 text-[9px] text-[#444] font-mono w-[50px]">
                    {getType(val)}
                  </td>
                  <td
                    className={`py-1 px-2 text-[11px] font-mono transition-colors ${
                      isChanged ? 'text-blue-400' : 'text-[#EDEDED]'
                    }`}
                  >
                    {formatValue(val)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
