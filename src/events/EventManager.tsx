import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { EVENT_SCHEDULE, DATE_EVENTS, EventType } from './eventConfig';

interface EventContextType {
  activeEvent: EventType;
  backgroundEvent: EventType;
  eventProgress: number;
  bubbleText: string | null;
  triggerEvent: (type: EventType, text?: string) => void;
}

export const EventContext = createContext<EventContextType>({
  activeEvent: 'NONE',
  backgroundEvent: 'NONE',
  eventProgress: 0,
  bubbleText: null,
  triggerEvent: () => { }
});

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEvent, setActiveEvent] = useState<EventType>('NONE');
  const [backgroundEvent, setBackgroundEvent] = useState<EventType>('NONE');
  const [eventProgress, setEventProgress] = useState(0);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const triggeredOnceRef = useRef<Set<string>>(new Set());
  const eventIdRef = useRef(0);

  // Use a ref to track if animation is running to avoid closure staleness if needed,
  // but here we rely on state updates which trigger re-renders.
  // However, for requestAnimationFrame loop, we need to be careful.
  // We'll keep the animation logic simple and tied to state.

  const startEvent = useCallback((type: EventType, text?: string) => {
    // Handle background events independent of main event loop
    if (type === 'CHRISTMAS_SNOW') {
      setBackgroundEvent('CHRISTMAS_SNOW');
      return;
    }

    if (type === 'NONE') return;

    // Check for Christmas dates (Dec 24 & 25)
    const now = new Date();
    const isChristmas = now.getMonth() + 1 === 12 && (now.getDate() === 24 || now.getDate() === 25);

    // Prevent bird flying on Christmas
    if (type === 'BIRD_FLYBY' && isChristmas) {
      return;
    }

    // Increment event ID to invalidate any previous running loops
    eventIdRef.current += 1;
    const currentEventId = eventIdRef.current;

    setActiveEvent(type);
    if (type === 'SPEECH_BUBBLE') {
      setBubbleText(text ?? null);
    } else {
      setBubbleText(null);
    }

    const startTime = performance.now();
    const durations: Record<EventType, number> = {
      BIRD_FLYBY: 6000,
      SPEECH_BUBBLE: 4000,
      THOUGHT_BUBBLE: 4000,
      SAKURA_FALLEN: 8000,
      CHRISTMAS_SNOW: 12000,
      NONE: 0,
    };
    const EVENT_DURATION = durations[type];

    const animate = () => {
      // If a new event has started, stop this loop
      if (eventIdRef.current !== currentEventId) return;

      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / EVENT_DURATION, 1);

      setEventProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure we don't reset if we've been superseded (though the check at top should cover it)
        if (eventIdRef.current === currentEventId) {
          setActiveEvent('NONE');
          setEventProgress(0);
          setBubbleText(null);
        }
      }
    };

    requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    if (month === 12 && (day === 24 || day === 25)) {
      const key = `christmas-${now.getFullYear()}`;
      if (!triggeredOnceRef.current.has(key)) {
        triggeredOnceRef.current.add(key);
        let t2: number | undefined;
        const t1 = window.setTimeout(() => {
          if (activeEvent === 'NONE') {
            startEvent('SPEECH_BUBBLE', '圣诞快乐！');
            t2 = window.setTimeout(() => {
              startEvent('CHRISTMAS_SNOW');
            }, 4500);
          }
        }, 1000);
        return () => {
          clearTimeout(t1);
          if (t2) clearTimeout(t2);
        };
      }
    }
  }, [activeEvent, startEvent]);

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
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Check for Christmas dates
      if (month === 12 && (day === 24 || day === 25)) {
        // Enforce Snow as background event
        startEvent('CHRISTMAS_SNOW');
        // Do not return, allow other events to trigger
      }

      const dateMatch = DATE_EVENTS.find(d => (
        d.year === year &&
        d.month === month &&
        d.day === day &&
        d.hour === hour &&
        (d.minute ?? 0) === minute
      ));

      if (dateMatch) {
        const key = `${year}-${month}-${day}-${hour}-${minute}-${dateMatch.event}`;
        if (!triggeredOnceRef.current.has(key)) {
          triggeredOnceRef.current.add(key);
          startEvent(dateMatch.event);
          return;
        }
      }

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
    <EventContext.Provider value={{ activeEvent, backgroundEvent, eventProgress, bubbleText, triggerEvent: startEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
