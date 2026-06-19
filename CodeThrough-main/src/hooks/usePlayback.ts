import { useState, useEffect, useCallback } from 'react';
import type { Snapshot, PlaybackSpeed } from '../types';

export function usePlayback(snapshots: Snapshot[]) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const baseInterval = 700;

  useEffect(() => {
    if (!isPlaying || snapshots.length === 0 || currentIndex >= snapshots.length - 1) {
      if (currentIndex >= snapshots.length - 1) setIsPlaying(false);
      return;
    }
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, baseInterval / speed);
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, snapshots.length, speed]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(prev + 1, snapshots.length - 1));
  }, [snapshots.length]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setIsPlaying(false);
      setCurrentIndex(Math.max(0, Math.min(step, snapshots.length - 1)));
    },
    [snapshots.length]
  );

  const resetPlayback = useCallback(
    (startPlaying = false) => {
      if (snapshots.length > 0) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
      setIsPlaying(startPlaying);
    },
    [snapshots.length]
  );

  const activeSnapshot = currentIndex >= 0 && currentIndex < snapshots.length ? snapshots[currentIndex] : null;
  const previousSnapshot =
    currentIndex > 0 && currentIndex < snapshots.length ? snapshots[currentIndex - 1] : null;

  return {
    currentIndex,
    isPlaying,
    speed,
    setSpeed,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    resetPlayback,
    activeSnapshot,
    previousSnapshot,
  };
}
