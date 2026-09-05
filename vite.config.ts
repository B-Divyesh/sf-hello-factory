import { defineConfig } from 'vite';

export default defineConfig({
  define: { __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()) },
  build: { target: 'es2022', assetsInlineLimit: 0, rollupOptions: { input: { main: 'index.html', catalog: 'catalog/index.html', demo: 'demo/index.html', privacy: 'privacy/index.html', terms: 'terms/index.html', notFound: '404.html', product: 'p/index.html' } } },
  test: { exclude: ['tests/browser/**', 'node_modules/**', 'dist/**'] },
});
