export type EventType = 'BIRD_FLYBY' | 'SPEECH_BUBBLE' | 'THOUGHT_BUBBLE' | 'NONE';

export interface TimeRange {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  event: EventType;
}

// Simple configuration: Bird flies during the day (6 AM to 6 PM)
export const EVENT_SCHEDULE: TimeRange[] = [
  { startHour: 6, endHour: 18, event: 'BIRD_FLYBY' },
];
