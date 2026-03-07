import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("[DAWL] Client-side Environment Check:");
console.log("[DAWL] import.meta.env:", Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.log("[DAWL] VITE_STRIPE_PUBLIC_KEY found in import.meta.env");
} else {
  console.warn("[DAWL] VITE_STRIPE_PUBLIC_KEY NOT found in import.meta.env");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
