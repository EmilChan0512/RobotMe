# Battery Indicator

Zero-dependency TypeScript battery indicator component with SVG rendering and Battery API support.

## Installation

```bash
npm install
npm run build
```

## Usage

### Web Component

```html
<battery-indicator
  width="120"
  height="56"
  color-fill="#22c55e"
  color-stroke="#000"
  color-lightning="#facc15"
  padding="3"
  show-level
  auto-connect&gt;&lt;/battery-indicator&gt;
```

### Class Wrapper

```js
import { BatteryIndicator } from 'battery-indicator.es.js';

const battery = new BatteryIndicator({
  width: 120,
  height: 56,
  showLevel: true,
});
battery.mount(document.body);
battery.connectBattery();
battery.addEventListener('batterychange', (e) => {
  console.log(e.detail); // { charging: boolean, level: number }
});
```

## API

### Attributes / Props

- `width` (number | string) – SVG width (default: 120)
- `height` (number | string) – SVG height (default: 56)
- `color-fill` (string) – Battery fill color (default: #22c55e)
- `color-stroke` (string) – Border color (default: #000)
- `color-lightning` (string) – Lightning icon color (default: #facc15)
- `padding` (number) – Internal padding (default: 3)
- `show-level` (boolean) – Show percentage text (default: true)
- `auto-connect` (boolean) – Auto-connect Battery API (default: true)

### Events

- `batterychange` – Fired when charging or level changes
  - `detail: { charging: boolean, level: number }`

### Methods (Class Wrapper)

- `connectBattery()` – Connect to navigator.getBattery()
- `setCharging(bool)` – Manually set charging state
- `setLevel(0-1)` – Manually set battery level
- `destroy()` – Cleanup and unmount

## Demo

```bash
npm run dev
# Open http://localhost:5173/demo/index.html
```

## Build

```bash
npm run build
# Outputs:
#   dist/battery-indicator.es.js  (ESM)
#   dist/battery-indicator.umd.js  (UMD)
```

## License

MIT