import React, { useEffect, useRef } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { musicConfig } from '../../musicConfig';

export const MusicPlayer: React.FC = () => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSrcRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if we are in a myheart article page
    const match = matchPath('/myheart/:title', location.pathname);
    
    if (match && match.params.title) {
      const title = match.params.title;
      const audioSrc = musicConfig[title];

      if (audioSrc) {
        // If the audio source is different, change it
        if (currentSrcRef.current !== audioSrc) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          } else {
             audioRef.current = new Audio();
          }
          
          audioRef.current.src = audioSrc;
          audioRef.current.loop = true; // 默认循环播放
          
          // 处理自动播放策略限制
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log("Auto-play was prevented. User interaction might be needed.", error);
            });
          }
          
          currentSrcRef.current = audioSrc;
        } else {
            // Same audio, ensure it is playing if it was paused
            if (audioRef.current && audioRef.current.paused) {
                 audioRef.current.play().catch(e => console.log("Resume play failed", e));
            }
        }
      } else {
        // No config for this article, stop any playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          currentSrcRef.current = null;
        }
      }
    } else {
      // Not in a myheart article, stop music
       if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          currentSrcRef.current = null;
        }
    }
    
    // Cleanup function
    return () => {
        // We don't necessarily want to stop on every effect run (re-renders), 
        // but the logic above handles transitions.
        // However, if the component unmounts (e.g. app unmounts), we should stop.
    };
  }, [location.pathname]);

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
          }
      }
  }, []);

  return null;
};
