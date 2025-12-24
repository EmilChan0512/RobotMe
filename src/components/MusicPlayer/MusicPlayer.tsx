import React, { useEffect, useRef } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { musicConfig } from '../../musicConfig';

export const MusicPlayer: React.FC = () => {
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSrcRef = useRef<string | null>(null);
  const [merryChristmasVerified, setMerryChristmasVerified] = React.useState(
    () => sessionStorage.getItem('merry-christmas-verified') === 'true'
  );

  // 监听 sessionStorage 变化，以便在密码验证后立即响应
  useEffect(() => {
    const checkVerification = () => {
      const isVerified = sessionStorage.getItem('merry-christmas-verified') === 'true';
      setMerryChristmasVerified(isVerified);
    };

    // 初始检查
    checkVerification();

    // 监听 storage 事件（当其他标签页或窗口修改 sessionStorage 时）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'merry-christmas-verified') {
        checkVerification();
      }
    };

    // 由于同源页面修改 sessionStorage 不会触发 storage 事件，使用轮询检查
    const intervalId = setInterval(checkVerification, 100);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Check if we are in a myheart article page
    const match = matchPath('/myheart/:title', location.pathname);
    let audioSrc: string | undefined;

    if (match && match.params.title) {
      audioSrc = musicConfig[match.params.title];
    } else if (location.pathname === '/merry-christmas') {
      // 只有在密码验证通过后才播放音乐
      if (merryChristmasVerified) {
        audioSrc = musicConfig['merry-christmas'];
      }
    }

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
    
    // Cleanup function
    return () => {
        // We don't necessarily want to stop on every effect run (re-renders), 
        // but the logic above handles transitions.
        // However, if the component unmounts (e.g. app unmounts), we should stop.
    };
  }, [location.pathname, merryChristmasVerified]);

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
