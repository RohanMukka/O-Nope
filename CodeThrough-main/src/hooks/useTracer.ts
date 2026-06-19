import { useState, useCallback } from 'react';
import { traceCode } from '../lib/tracer';
import type { Snapshot, TraceResult } from '../types';

export function useTracer() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback((code: string) => {
    setIsRunning(true);
    setError(null);
    try {
      const result: TraceResult = traceCode(code);
      setSnapshots(result.snapshots);
      setConsoleLogs(result.consoleLogs);
      if (result.error) {
        setError(result.error);
      }
      setIsRunning(false);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      setSnapshots([]);
      setConsoleLogs([]);
      setIsRunning(false);
      return { snapshots: [], consoleLogs: [], error: msg };
    }
  }, []);

  const reset = useCallback(() => {
    setSnapshots([]);
    setConsoleLogs([]);
    setError(null);
  }, []);

  return { snapshots, consoleLogs, error, isRunning, run, reset };
}
