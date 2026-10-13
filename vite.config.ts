import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: the Web3 stack changes far less often than the app code.
        manualChunks: {
          react: ['react', 'react-dom'],
          web3: ['wagmi', 'viem', '@tanstack/react-query'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // Real-network checks run only via `npm run test:live` (vitest.live.config.ts).
    exclude: [...configDefaults.exclude, 'src/**/*.live.test.ts'],
  },
});
