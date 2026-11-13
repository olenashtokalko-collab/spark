import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
  // the build's own stamp, so a browser that opened an earlier build opens this one fresh (src/lib/build.ts)
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString()) },
});
