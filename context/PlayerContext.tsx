'use client';

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { IKatha } from '@/types';
import { getMediaUrl } from '@/lib/media';
import { trackQualifiedView } from '@/lib/viewTracking';
import { toast } from 'sonner';

interface PlayerContextValue {
  // State
  katha: IKatha | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isVisible: boolean;
  // Playlist
  playlist: IKatha[];
  playlistIndex: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  // Audio ref — shared across components
  audioRef: React.RefObject<HTMLAudioElement | null>;
  // Actions
  play: (katha: IKatha, options?: { startAt?: number }) => void;
  playFromPlaylist: (kathas: IKatha[], startIndex?: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  skip: (seconds: number) => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [katha, setKatha] = useState<IKatha | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playlist, setPlaylist] = useState<IKatha[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(-1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const playlistRef = useRef<IKatha[]>([]);
  const playlistIndexRef = useRef(-1);
  const repeatRef = useRef<'off' | 'all' | 'one'>('off');
  const kathaRef = useRef<IKatha | null>(null);
  const playRef = useRef<(katha: IKatha, options?: { startAt?: number }) => void>(() => {});
  const lastSavedAtRef = useRef(0);
  const viewTrackedRef = useRef(false);
  const announcedPlaybackRef = useRef(new Set<string>());

  const saveProgress = useCallback((time?: number) => {
    const activeKatha = kathaRef.current;
    const audio = audioRef.current;
    if (!activeKatha?._id || !audio) return;
    const safeDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const safeTime = time ?? audio.currentTime;
    if (safeDuration <= 0 || safeTime < 0) return;

    void fetch('/api/continue-listening', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kathaId: activeKatha._id,
        currentTime: safeTime,
        duration: safeDuration,
      }),
      keepalive: true,
    }).catch(() => {});
    lastSavedAtRef.current = Date.now();
  }, []);

  // Sync audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (!viewTrackedRef.current && audio.currentTime >= 30 && kathaRef.current?._id) {
        viewTrackedRef.current = true;
        void trackQualifiedView(kathaRef.current._id, audio.currentTime).catch(() => {
          viewTrackedRef.current = false;
        });
      }
      if (Date.now() - lastSavedAtRef.current >= 10_000) {
        saveProgress(audio.currentTime);
      }
    };
    const onDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      saveProgress(audio.duration);
      const pList = playlistRef.current;
      const pIdx = playlistIndexRef.current;
      if (repeatRef.current === 'one' && pList.length > 0) {
        playRef.current(pList[pIdx]);
        return;
      }
      let nextIdx = pIdx + 1;
      if (pList.length > 0 && nextIdx >= pList.length && repeatRef.current === 'all') {
        nextIdx = 0;
      }
      if (pList.length > 0 && nextIdx < pList.length) {
        playRef.current(pList[nextIdx]);
        setPlaylistIndex(nextIdx);
        playlistIndexRef.current = nextIdx;
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      saveProgress();
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
    };
  }, [katha, saveProgress]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') saveProgress();
    };
    const handlePageHide = () => saveProgress();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [saveProgress]);

  const play = useCallback((newKatha: IKatha, options?: { startAt?: number }) => {
    setKatha(newKatha);
    kathaRef.current = newKatha;
    viewTrackedRef.current = false;
    setCurrentTime(0);
    setIsPlaying(true);
    setIsVisible(true);

    // Load new src and play
    const audio = audioRef.current;
    if (!audio) return;
    const knownDuration = Number.isFinite(audio.duration) && audio.duration > 0
      ? audio.duration
      : Number(newKatha.duration || 0);
    setDuration(knownDuration);
    const src = getMediaUrl('audio', newKatha.audioUrl);
    if (src && audio.src !== window.location.origin + src) {
      audio.src = src;
      audio.load();
    }
    audio.playbackRate = playbackRate;
    audio.volume = isMuted ? 0 : volume;
    const startPlayback = async () => {
      const applyStart = (time: number) => {
        const apply = () => {
          audio.currentTime = Math.min(time, audio.duration || time);
          setCurrentTime(audio.currentTime);
          audio.removeEventListener('loadedmetadata', apply);
        };
        if (audio.readyState >= 1) apply();
        else audio.addEventListener('loadedmetadata', apply);
      };

      if (options?.startAt !== undefined) {
        applyStart(Math.max(0, options.startAt));
      } else {
        try {
          const response = await fetch(`/api/continue-listening?kathaId=${encodeURIComponent(newKatha._id)}`);
          if (response.ok) {
            const payload = await response.json();
            const resumeAt = Number(payload.data?.currentTime ?? 0);
            if (resumeAt > 0 && !payload.data?.completed) {
              applyStart(resumeAt);
            }
          }
        } catch {
          // Guest playback or temporary network failure.
        }
      }
      try {
        await audio.play();
        if (!announcedPlaybackRef.current.has(newKatha._id)) {
          announcedPlaybackRef.current.add(newKatha._id);
          toast.success(`Now playing: ${newKatha.title}`);
        }
      } catch {
        setIsPlaying(false);
        toast.error('Audio could not start. Please try again.');
      }
    };
    void startPlayback();
  }, [volume, isMuted, playbackRate]);

  // Sync playRef so event handlers always have the latest play function
  useEffect(() => {
    playRef.current = play;
  }, [play]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play()
      .then(() => setIsPlaying(true))
      .catch(() => toast.error('Audio could not resume.'));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    setIsMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      const next = !m;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    const knownDuration = duration > 0
      ? duration
      : Number(kathaRef.current?.duration || 0);
    const max = knownDuration > 0 ? knownDuration : currentTime + 3600;
    const newTime = Math.max(0, Math.min(max, currentTime + seconds));
    if (audio) audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentTime, duration]);

  const playFromPlaylist = useCallback((kathas: IKatha[], startIndex = 0) => {
    setPlaylist(kathas);
    setPlaylistIndex(startIndex);
    playlistRef.current = kathas;
    playlistIndexRef.current = startIndex;
    announcedPlaybackRef.current = new Set<string>();
    if (kathas[startIndex]) play(kathas[startIndex]);
  }, [play]);

  const nextTrack = useCallback(() => {
    const nextIdx = playlistIndexRef.current + 1;
    const pList = playlistRef.current;
    if (pList.length > 0 && nextIdx < pList.length) {
      announcedPlaybackRef.current = new Set<string>();
      play(pList[nextIdx]);
      setPlaylistIndex(nextIdx);
      playlistIndexRef.current = nextIdx;
    }
  }, [play]);

  const prevTrack = useCallback(() => {
    const prevIdx = playlistIndexRef.current - 1;
    const pList = playlistRef.current;
    if (pList.length > 0 && prevIdx >= 0) {
      announcedPlaybackRef.current = new Set<string>();
      play(pList[prevIdx]);
      setPlaylistIndex(prevIdx);
      playlistIndexRef.current = prevIdx;
    }
  }, [play]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((shuffled) => {
      const next = !shuffled;
      const pList = playlistRef.current;
      const current = pList[playlistIndexRef.current];
      if (next && pList.length > 1) {
        const shuffledList = [...pList];
        const currentIndex = shuffledList.findIndex((item) => item._id === current?._id);
        if (currentIndex >= 0) shuffledList.splice(currentIndex, 1);
        for (let i = shuffledList.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
        }
        if (current) shuffledList.unshift(current);
        playlistRef.current = shuffledList;
        setPlaylist(shuffledList);
        setPlaylistIndex(0);
        playlistIndexRef.current = 0;
      }
      return next;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((mode) => {
      const nextMode = mode === 'off' ? 'all' : mode === 'all' ? 'one' : 'off';
      repeatRef.current = nextMode;
      return nextMode;
    });
  }, []);

  const close = useCallback(() => {
    saveProgress();
    audioRef.current?.pause();
    setKatha(null);
    kathaRef.current = null;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsVisible(false);
    setPlaylist([]);
    setPlaylistIndex(-1);
    playlistRef.current = [];
    playlistIndexRef.current = -1;
    setIsShuffled(false);
    setRepeatMode('off');
    repeatRef.current = 'off';
  }, [saveProgress]);

  return (
    <PlayerContext.Provider
      value={{
        katha,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isVisible,
        playlist,
        playlistIndex,
        isShuffled,
        repeatMode,
        audioRef,
        play,
        playFromPlaylist,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleRepeat,
        pause,
        resume,
        seek,
        setVolume,
        toggleMute,
        setPlaybackRate,
        skip,
        close,
      }}
    >
      {/* Single global audio element */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerContext must be used inside PlayerProvider');
  return ctx;
}
