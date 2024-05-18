import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';

export default defineConfig({
  server: {
    port: 10099,
  },
  plugins: [
    wasm(),
  ],
  optimizeDeps: {
    exclude: [
      '@babylonjs/havok',
    ]
  }
})