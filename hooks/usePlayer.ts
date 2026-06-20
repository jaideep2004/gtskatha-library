'use client';

import { useState, useCallback } from 'react';
import { IKatha, PlayerState } from '@/types';

const initialState: PlayerState = {
  katha: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1,
  isMinimized: true,
};

export function usePlayer() {
  const [state, setState] = useState<PlayerState>(initialState);

  const play = useCallback((katha: IKatha) => {
    setState((s) => ({ ...s, katha, isPlaying: true, currentTime: 0, isMinimized: false }));
  }, []);

  const pause = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: true }));
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState((s) => ({ ...s, duration }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((s) => ({ ...s, volume, isMuted: volume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => ({ ...s, isMuted: !s.isMuted }));
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setState((s) => ({ ...s, playbackRate: rate }));
  }, []);

  const minimize = useCallback(() => {
    setState((s) => ({ ...s, isMinimized: true }));
  }, []);

  const close = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleMute,
    setPlaybackRate,
    minimize,
    close,
  };
}
