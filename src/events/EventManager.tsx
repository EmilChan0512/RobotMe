import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { EVENT_SCHEDULE, EventType } from './eventConfig';

interface EventContextType {
  activeEvent: EventType;
  eventProgress: number; // 0.0 to 1.0 representing the progress of the event (e.g. flight path)
  triggerEvent: (type: EventType) => void;
}

export const EventContext = createContext<EventContextType>({ 
  activeEvent: 'NONE', 
  eventProgress: 0,
  triggerEvent: () => {} 
});

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEvent, setActiveEvent] = useState<EventType>('NONE');
  const [eventProgress, setEventProgress] = useState(0);

  // Use a ref to track if animation is running to avoid closure staleness if needed,
  // but here we rely on state updates which trigger re-renders.
  // However, for requestAnimationFrame loop, we need to be careful.
  // We'll keep the animation logic simple and tied to state.

  const startEvent = useCallback((type: EventType) => {
    if (type === 'NONE') return;
    setActiveEvent(type);
    const startTime = performance.now();
    const durations: Record<EventType, number> = {
      BIRD_FLYBY: 6000,
      SPEECH_BUBBLE: 4000,
      THOUGHT_BUBBLE: 4000,
      NONE: 0,
    };
    const EVENT_DURATION = durations[type];

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / EVENT_DURATION, 1);

      setEventProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setActiveEvent('NONE');
        setEventProgress(0);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const CHECK_INTERVAL = 10000; // Check every 10 seconds

    const checkTimeAndTrigger = () => {
      // If an event is already running, don't trigger another
      // We need to check the current state value, but inside interval closure it might be stale
      // unless we use a ref or functional update. 
      // Since we can't easily access current state in interval without ref, 
      // let's use a functional update check or just rely on the fact that 
      // if we trigger it, the state changes.
      // Actually, the best way is to not use interval for state-dependent logic 
      // inside useEffect without dependencies.
      // But adding activeEvent to dependencies resets the interval.
      // That's fine.
      
      // However, we only want to trigger if NO event is active.
      // We'll check inside the interval callback using a ref if we want to avoid resetting interval,
      // or just let it reset.
    };
    
    // We'll use a separate effect for the scheduler that depends on activeEvent
    if (activeEvent !== 'NONE') return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      
      const match = EVENT_SCHEDULE.find(r => {
        if (r.startHour <= r.endHour) {
          return hour >= r.startHour && hour < r.endHour;
        } else {
          return hour >= r.startHour || hour < r.endHour;
        }
      });

      if (match && match.event === 'BIRD_FLYBY') {
        startEvent('BIRD_FLYBY');
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [activeEvent, startEvent]);

  return (
    <EventContext.Provider value={{ activeEvent, eventProgress, triggerEvent: startEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
