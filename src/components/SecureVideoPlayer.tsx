'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Loader2, Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface SecureVideoPlayerProps {
  videoUrl: string;
  onComplete?: () => void;
  isCompleted?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export default function SecureVideoPlayer({ videoUrl, onComplete, isCompleted }: SecureVideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  
  // Custom Controls State (YouTube only)
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  // Helper to detect video type
  const getVideoConfig = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) return { type: 'youtube', id: ytMatch[1] };
    const gdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch && gdMatch[1]) return { type: 'gdrive', embedUrl: `https://drive.google.com/file/d/${gdMatch[1]}/preview?rm=minimal` };
    return null;
  };

  const config = getVideoConfig(videoUrl);

  // --- YouTube IFrame API Setup ---
  useEffect(() => {
    if (config?.type !== 'youtube') return;

    // Load YT API script if not loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: config.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (event: any) => {
            setLoading(false);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            if (event.data === window.YT.PlayerState.ENDED && onComplete && !isCompleted) {
              onComplete();
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
      clearInterval(progressIntervalRef.current);
    };
  }, [config?.id]);

  // Update progress bar
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setProgress(playerRef.current.getCurrentTime());
        }
      }, 1000);
    } else {
      clearInterval(progressIntervalRef.current);
    }
    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying]);

  // --- Custom Control Handlers ---
  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setProgress(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) playerRef.current.unMute();
    else playerRef.current.mute();
    setIsMuted(!isMuted);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const changeSpeed = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-transparent overflow-hidden group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => { if(isPlaying) setShowControls(false); setShowSettings(false); }}
      >
        
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-md z-10">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {config?.type === 'youtube' && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* The YT iframe will replace this div */}
            <div id="yt-player" className="w-full h-full pointer-events-auto"></div>
          </div>
        )}

        {config?.type === 'gdrive' && (
          <>
            <iframe
              src={config.embedUrl}
              className="absolute top-0 left-0 w-full h-full border-0 z-0"
              allow="autoplay; fullscreen"
              onLoad={() => setLoading(false)}
            />
            {/* Anti-Download Click Blocker for Google Drive */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-transparent z-20 cursor-not-allowed" title="Pop-out disabled for security" />
          </>
        )}

        {!config && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
            <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
            <p>Invalid Video URL</p>
          </div>
        )}

        {/* --- Custom Controls Overlay (Only for YouTube) --- */}
        {config?.type === 'youtube' && !loading && (
          <>
            {/* Invisible clickable area to toggle play/pause */}
            <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />
            
            {/* Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Seek Bar */}
              <div className="w-full flex items-center gap-3 mb-3 group/slider cursor-pointer">
                <span className="text-xs text-white font-medium">{formatTime(progress)}</span>
                <input 
                  type="range" 
                  min={0} 
                  max={duration || 100} 
                  value={progress}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-primary hover:h-2 transition-all"
                />
                <span className="text-xs text-white font-medium">{formatTime(duration)}</span>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-primary transition-colors focus:outline-none">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <button onClick={toggleMute} className="text-white hover:text-primary transition-colors focus:outline-none">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  
                  {/* Mark Complete Button (In player) */}
                  {!isCompleted && onComplete && (
                    <button 
                      onClick={onComplete}
                      className="ml-4 text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors border border-white/10"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 relative">
                  {/* Settings Menu */}
                  <div className="relative">
                    <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:text-primary transition-colors focus:outline-none">
                      <Settings className="w-5 h-5" />
                    </button>
                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-4 bg-[#111] border border-white/10 rounded-xl overflow-hidden py-1 min-w-[120px]">
                        <div className="px-3 py-1.5 text-xs text-gray-400 font-bold border-b border-white/5 uppercase">Speed</div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => changeSpeed(rate)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors ${playbackRate === rate ? 'text-primary font-bold bg-primary/5' : 'text-gray-300'}`}
                          >
                            {rate === 1 ? 'Normal' : `${rate}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button onClick={toggleFullScreen} className="text-white hover:text-primary transition-colors focus:outline-none">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
