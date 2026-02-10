// vitest.config.mts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    // CAMBIO RADICAL: Usamos happy-dom en lugar de jsdom.
    // Es más rápido y da menos problemas de compatibilidad en Windows.
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    
    // Configuración de aislamiento simplificada
    pool: 'forks',
    
    // Forzamos la transformación de la librería problemática
    server: {
      deps: {
        inline: [/@asamazakjp\/css-color/, /@csstools\/css-calc/]
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Mantenemos el alias de seguridad apuntando al archivo vacío
      '@asamazakjp/css-color': path.resolve(__dirname, 'src/test/mocks/empty.ts'),
      '@csstools/css-calc': path.resolve(__dirname, 'src/test/mocks/empty.ts'),
    },
  },
});