import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { getReducedMotion } from './hooks/useReducedMotion';
import './index.css';

// Arm scroll-reveal before first paint so content below the fold never flashes in and out.
// Without JS, or with reduced motion, content is simply visible.
if (!getReducedMotion()) document.documentElement.classList.add('reveal-armed');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
