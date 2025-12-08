export type EventType = 'BIRD_FLYBY' | 'SPEECH_BUBBLE' | 'THOUGHT_BUBBLE' | 'SAKURA_FALLEN' | 'CHRISTMAS_SNOW' | 'NONE';

export interface TimeRange {
  startHour: number; // 0-23
  endHour: number;   // 0-23
  event: EventType;
}

// Simple configuration: Bird flies during the day (6 AM to 6 PM)
export const EVENT_SCHEDULE: TimeRange[] = [
  { startHour: 6, endHour: 18, event: 'BIRD_FLYBY' },
];

export interface DateEvent {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  event: EventType;
}

export const DATE_EVENTS: DateEvent[] = [
  { year: 2025, month: 12, day: 24, hour: 19, minute: 0, event: 'CHRISTMAS_SNOW' },
  { year: 2025, month: 12, day: 25, hour: 9, minute: 0, event: 'CHRISTMAS_SNOW' },
];
