import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/** Opt-in real-network suite: `npm run test:live`. Not part of `npm test` or CI. */
export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.live.test.ts'] },
});
