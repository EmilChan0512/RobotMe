# YOUWARE.md

This project is a React + TypeScript + Vite application that renders a sketch-style robot using pure SVG and CSS animations, featuring a time-based event system and developer controls.

## Project Overview

- **Robot Component**: `src/components/Robot/Robot.tsx`
    - Renders the robot using SVG elements.
    - Implements eye-following behavior (cursor or event target).
- **Bird Component**: `src/components/Bird/Bird.tsx`
    - Renders a sketch-style bird with CSS wing animation.
- **Event System**: `src/events/`
    - `EventManager.tsx`: Context provider that schedules and manages events.
    - `eventConfig.ts`: Configuration for time-based events.
- **Dev Controls**: `src/components/DevControls/DevControls.tsx`
    - Provides UI buttons for manually triggering events during development.
    - Only visible in development mode (`import.meta.env.DEV`).

## Event System

The application uses a time-based scheduler to trigger visual events.
- **Configuration**: Edit `src/events/eventConfig.ts` to define time ranges and event types.
- **Current Events**:
    - `BIRD_FLYBY`: Triggers a bird flying across the screen. The robot pauses cursor tracking to look at the bird.
- **Logic**: `EventManager` checks the time every 10 seconds. If the current time matches a configured event range, it triggers the event animation (e.g., 6-second bird flight).

## Development Commands

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Architecture

- **Entry Point**: `src/main.tsx` mounts `App.tsx`.
- **App Layout**: `src/App.tsx` wraps the scene in `EventProvider`.
- **Scene**: Handles the coordination between `activeEvent`, `Bird` position, and `Robot` focus.
- **SVG Structure**:
    - Robot: Modular SVG groups for head, body, legs (animated), and wall.
    - Bird: Simple SVG paths with CSS-animated wings.

## Customization

- **Schedule**: Update `EVENT_SCHEDULE` in `src/events/eventConfig.ts`.
- **Bird Animation**: Adjust `flap` keyframes in `src/components/Bird/Bird.css` or flight duration in `EventManager.tsx`.
- **Robot Sensitivity**: Tweak `maxOffset` in `src/components/Robot/Robot.tsx`.
