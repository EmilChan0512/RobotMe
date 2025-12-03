import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BatteryIndicator',
      fileName: (format) => `battery-indicator.${format}.js`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    target: 'es2020',
  },
  server: {
    open: '/demo/index.html',
  },
});