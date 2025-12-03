# 电池组件集成与测试指南

## 1. 安装
```bash
npm install battery-indicator
```
或 CDN（UMD）
```html
<script src="https://unpkg.com/battery-indicator/dist/battery-indicator.umd.js"></script>
```

## 2. React 使用示例
```tsx
import { BatteryIndicator } from 'battery-indicator';

function App() {
  useEffect(() => {
    const el = new BatteryIndicator({
      width: 140,
      height: 64,
      colorFill: '#16a34a',
      autoConnect: true,
    });
    el.mount(document.getElementById('battery')!);
    return () => el.destroy();
  }, []);

  return <div id="battery" />;
}
```

或直接使用 Web Component（需注册）
```tsx
import 'battery-indicator';

function App() {
  return <battery-indicator width="140" height="64" />;
}
```

## 3. 手动覆盖测试
```ts
const el = new BatteryIndicator({ autoConnect: false });
el.setCharging(true);
el.setLevel(0.75);
```

## 4. 监听状态变化
```ts
el.addEventListener('batterychange', (e: CustomEvent<BatteryChangeEvent>) => {
  console.log('charging:', e.detail.charging, 'level:', e.detail.level);
});
```

## 5. 可访问性检查
- 检查 DOM 中 aria-label 是否随充电状态更新
- 使用屏幕阅读器朗读状态

## 6. 常见问题
- Battery API 不支持：组件不会报错，可手动 setCharging/setLevel
- SSR 报错：在 useEffect 中再创建组件，避免服务端访问 navigator
- 样式被覆盖：使用 CSS 变量或 inline style 调整颜色