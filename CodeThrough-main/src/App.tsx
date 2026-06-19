import { useState, useEffect, useCallback } from 'react';
import { Terminal } from 'lucide-react';
import { useTracer } from './hooks/useTracer';
import { usePlayback } from './hooks/usePlayback';
import { templates, DEFAULT_CODE } from './constants/templates';
import type { AlgorithmTemplate } from './types';

import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import VisualizationPanel from './components/VisualizationPanel';
import Timeline from './components/Timeline';
import WelcomeScreen from './components/WelcomeScreen';
import ConsolePanel from './components/ConsolePanel';
import VariableWatch from './components/VariableWatch';
import ErrorDisplay from './components/ErrorDisplay';

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [showConsole, setShowConsole] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const { snapshots, consoleLogs, error, run, reset } = useTracer();
  const {
    currentIndex,
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    resetPlayback,
    activeSnapshot,
    previousSnapshot,
  } = usePlayback(snapshots);

  const handleRun = useCallback(() => {
    const result = run(code);
    setHasRun(true);
    if (result.consoleLogs.length > 0) {
      setShowConsole(true);
    }
    resetPlayback(false);
  }, [code, run, resetPlayback]);

  const handleSelectTemplate = useCallback(
    (template: AlgorithmTemplate) => {
      setCode(template.code);
      reset();
      setHasRun(false);
      setShowConsole(false);
    },
    [reset]
  );

  const handleDismissError = useCallback(() => {
    reset();
  }, [reset]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
        return;
      }

      const target = e.target as HTMLElement;
      if (target.closest('.cm-editor')) return;

      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, togglePlay, stepForward, stepBackward]);

  const activeLine = activeSnapshot?.line ?? 0;
  const showWelcome = !hasRun && snapshots.length === 0;

  return (
    <div className="flex w-screen h-screen bg-[#000000] overflow-hidden text-sm font-sans selection:bg-blue-500/30">
      {/* Left panel: editor */}
      <div className="w-[38%] h-full border-r border-[#1A1A1A] flex flex-col bg-[#050505] z-10 relative">
        <Navbar
          onRun={handleRun}
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
        />
        <CodeEditor code={code} onChange={setCode} activeLine={activeLine} />
        {error && <ErrorDisplay error={error} onDismiss={handleDismissError} />}
        <VariableWatch snapshot={activeSnapshot} previousSnapshot={previousSnapshot} />
        {hasRun && (
          <div className="border-t border-[#1A1A1A]">
            {showConsole ? (
              <ConsolePanel logs={consoleLogs} onClose={() => setShowConsole(false)} />
            ) : (
              <button
                onClick={() => setShowConsole(true)}
                className="w-full px-4 py-2 flex items-center gap-2 text-[#444] hover:text-[#666] transition-colors text-[10px] uppercase tracking-[0.15em] font-semibold"
              >
                <Terminal size={10} />
                Console
                {consoleLogs.length > 0 && (
                  <span className="text-[9px] bg-[#1A1A1A] px-1.5 py-0.5 rounded-full font-mono text-[#666]">
                    {consoleLogs.length}
                  </span>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right panel: visualization */}
      <div className="flex-1 h-full relative flex flex-col">
        {showWelcome ? (
          <WelcomeScreen onRun={handleRun} />
        ) : (
          <VisualizationPanel
            activeSnapshot={activeSnapshot}
            previousSnapshot={previousSnapshot}
            currentIndex={currentIndex}
          />
        )}

        <Timeline
          snapshotCount={snapshots.length}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          speed={speed}
          onTogglePlay={togglePlay}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          onGoToStep={goToStep}
          onSetSpeed={setSpeed}
        />
      </div>
    </div>
  );
}
