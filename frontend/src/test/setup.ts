import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Bloqueamos la carga de las librerías de CSS-Color que fallan en Windows
// Al hacer esto, Vitest ni siquiera intentará leer los archivos .mjs conflictivos
vi.mock('@asamazakjp/css-color', () => ({
  default: () => ({}),
  parse: () => ({})
}));

vi.mock('@csstools/css-calc', () => ({
  default: () => ({})
}));

// Mock global para Framer Motion para evitar parpadeos en los tests de Experiencia
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: any) => children,
    motion: {
      div: (props: any) => require('react').createElement('div', props),
      article: (props: any) => require('react').createElement('article', props),
      h3: (props: any) => require('react').createElement('h3', props),
    },
  };
});