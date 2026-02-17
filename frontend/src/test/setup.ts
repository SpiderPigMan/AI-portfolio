import '@testing-library/jest-dom';
import React from 'react'; // Importación necesaria para evitar el uso de require
import { vi } from 'vitest';

// Bloqueamos la carga de las librerías de CSS-Color que fallan en Windows
vi.mock('@asamazakjp/css-color', () => ({
  default: () => ({}),
  parse: () => ({})
}));

vi.mock('@csstools/css-calc', () => ({
  default: () => ({})
}));

// Mock global para Framer Motion optimizado para el build
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      div: (props: Record<string, unknown>) => React.createElement('div', props),
      article: (props: Record<string, unknown>) => React.createElement('article', props),
      h3: (props: Record<string, unknown>) => React.createElement('h3', props),
    },
  };
});