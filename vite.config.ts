import { defineConfig } from 'vite';

export default defineConfig({
  define: { __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()) },
  build: { target: 'es2022', assetsInlineLimit: 0 },
});
